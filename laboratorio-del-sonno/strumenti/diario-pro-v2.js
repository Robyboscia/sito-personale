/* Diario del Sonno PRO v2. Dati locali, stime descrittive, nessuna diagnosi. */
(() => {
"use strict";
const KEY="roberto-boscia.sleep-pro.v2";
const LEGACY="roberto-boscia.sleep-diary.v1";
const LIMIT=90;
const $=id=>document.getElementById(id);
if(!$("dp-form"))return;
const fields=["date","bed","try","latency","waso","awakenings","wake","out","quality","naps","energy-morning","energy-afternoon","energy-evening","shift","stress","activity","light","caffeine-time","caffeine-mg","notes"];
let records=[],persist=false,demo=false,period=28,focus="regularity",reportText="";
const n=(v,min,max)=>v!==""&&v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max?Number(v):null;
const numOrEmpty=(v,min,max)=>v===""||v===null||v===undefined?"":(n(v,min,max)===null?null:String(Number(v)));
const time=v=>typeof v==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v)?Number(v.slice(0,2))*60+Number(v.slice(3)):NaN;
const forward=(a,b)=>(b-a+1440)%1440;
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const avg=(xs,key)=>mean(xs.map(key).filter(Number.isFinite));
const fmtM=x=>x===null||!Number.isFinite(x)?"—":Math.floor(Math.round(x)/60)+" h "+String(Math.round(x)%60).padStart(2,"0")+" min";
const fmt=x=>x===null||!Number.isFinite(x)?"—":x.toLocaleString("it-IT",{maximumFractionDigits:1});
const validDate=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||""))return false;const t=Date.parse(x+"T00:00:00Z");return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===x};
const dateAdd=(d,k)=>{const dt=new Date(d+"T00:00:00Z");dt.setUTCDate(dt.getUTCDate()+k);return dt.toISOString().slice(0,10)};
const showDate=s=>validDate(s)?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"—";
const sorted=()=>records.slice().sort((a,b)=>a.date.localeCompare(b.date));
const text=(parent,tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=String(value);parent.appendChild(e);return e};
const clear=node=>node.replaceChildren();
const status=(id,message,error=false)=>{const el=$(id);if(el){el.textContent=message;el.classList.toggle("is-error",error)}};
const saveFile=(name,body,type)=>{const url=URL.createObjectURL(new Blob([body],{type:type||"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
const yes=v=>/^(sì|si)$/i.test(String(v||"").trim());
const asNum=v=>v===""||v==null?null:Number(String(v).replace(",","."));
function evaluate(rec){
 const bed=time(rec.bed),attempt=time(rec.try),wake=time(rec.wake),out=time(rec.out);
 if(!validDate(rec.date)||[bed,attempt,wake,out].some(x=>!Number.isFinite(x)))throw Error("Controlla le date e gli orari.");
 const before=forward(bed,attempt),night=forward(attempt,wake),after=forward(wake,out);
 const latency=n(rec.latency,0,600),waso=rec.waso===""||rec.waso===null?null:n(rec.waso,0,600);
 const tib=before+night+after,tst=night-latency-(waso===null?0:waso);
 if(latency===null||(rec.waso!==""&&rec.waso!==null&&waso===null)||before>360||after>360||night<1||tib<60||tib>1080||tst<0||tst>tib)throw Error("Gli orari o i minuti indicati sono incoerenti. Ricontrolla la sequenza letto → tentativo → risveglio → alzata e la durata della veglia.");
 return {...rec,tib,tst,eff:tst/tib*100,partial:waso===null};
}
function cleanRecord(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Formato di una scheda non valido.");
 const rec={date:String(raw.date||""),bed:String(raw.bed||""),try:String(raw.try||""),wake:String(raw.wake||""),out:String(raw.out||""),
  latency:numOrEmpty(raw.latency,0,600),waso:numOrEmpty(raw.waso,0,600),
  awakenings:numOrEmpty(raw.awakenings,0,30),quality:numOrEmpty(raw.quality,1,5),naps:numOrEmpty(raw.naps,0,600),
  energyMorning:numOrEmpty(raw.energyMorning,1,5),energyAfternoon:numOrEmpty(raw.energyAfternoon,1,5),
  energyEvening:numOrEmpty(raw.energyEvening,1,5),energyGeneric:numOrEmpty(raw.energyGeneric,1,5),
  stress:numOrEmpty(raw.stress,1,5),shift:["day","night","off","other"].includes(raw.shift)?raw.shift:"",
  activity:["yes","no"].includes(raw.activity)?raw.activity:"",
  light:["yes","no"].includes(raw.light)?raw.light:"",
  caffeineTime:raw.caffeineTime?String(raw.caffeineTime):"",
  caffeineMg:numOrEmpty(raw.caffeineMg,0,500),notes:String(raw.notes||"").slice(0,280)};
 if(["latency","waso","awakenings","quality","naps","energyMorning","energyAfternoon","energyEvening","energyGeneric","stress","caffeineMg"].some(k=>rec[k]===null))throw Error("Un numero è fuori intervallo.");
 if(rec.caffeineTime&&!Number.isFinite(time(rec.caffeineTime)))throw Error("Orario caffeina non valido.");
 if((rec.caffeineTime&&!rec.caffeineMg)||(rec.caffeineMg&&!rec.caffeineTime))throw Error("Per stimare l'ultima caffeina inserisci sia orario sia milligrammi, oppure lascia vuoti entrambi.");
 evaluate(rec);
 return rec;
}
function values(rec){
 const e=evaluate(rec);
 const energy=[rec.energyMorning,rec.energyAfternoon,rec.energyEvening].map(x=>asNum(x)).filter(Number.isFinite);
 return {...e,energy:energy.length?mean(energy):asNum(rec.energyGeneric),qualityNum:asNum(rec.quality)};
}
function saveLocal(){
 if(!persist||demo)return;
 try{localStorage.setItem(KEY,JSON.stringify({format:"RB_SLEEP_PRO",version:2,focus,records}))}
 catch(err){persist=false;$("dp-persist").checked=false;status("dp-status","Impossibile salvare nel browser. Esporta un backup prima di uscire.",true)}
}
function loadLocal(){
 try{
  const raw=localStorage.getItem(KEY);if(!raw)return;
  const obj=JSON.parse(raw);if(obj.version!==2||!Array.isArray(obj.records)||obj.records.length>LIMIT)throw Error("Formato non supportato");
  const temp=obj.records.map(cleanRecord);
  if(new Set(temp.map(x=>x.date)).size!==temp.length)throw Error("Date duplicate");
  records=temp;focus=String(obj.focus||"regularity");persist=true;$("dp-persist").checked=true;
 }catch(err){status("dp-status","Archivio PRO non leggibile. Non è stato sovrascritto: prova a importare un backup.",true)}
}
function resetForm(){
 $("dp-form").reset();$("dp-date").value=new Date().toLocaleDateString("en-CA");
 status("dp-form-status","");
}
function getForm(){
 const read=id=>$(id).value;
 return cleanRecord({date:read("dp-date"),bed:read("dp-bed"),try:read("dp-try"),latency:read("dp-latency"),waso:read("dp-waso"),
 awakenings:read("dp-awakenings"),wake:read("dp-wake"),out:read("dp-out"),quality:read("dp-quality"),naps:read("dp-naps"),
 energyMorning:read("dp-energy-morning"),energyAfternoon:read("dp-energy-afternoon"),energyEvening:read("dp-energy-evening"),
 shift:read("dp-shift"),stress:read("dp-stress"),activity:read("dp-activity"),light:read("dp-light"),
 caffeineTime:read("dp-caffeine-time"),caffeineMg:read("dp-caffeine-mg"),notes:read("dp-notes")});
}
function putForm(r){
 const pairs={date:r.date,bed:r.bed,try:r.try,latency:r.latency,waso:r.waso,awakenings:r.awakenings,wake:r.wake,out:r.out,quality:r.quality,naps:r.naps,
 "energy-morning":r.energyMorning,"energy-afternoon":r.energyAfternoon,"energy-evening":r.energyEvening,shift:r.shift,stress:r.stress,activity:r.activity,light:r.light,
 "caffeine-time":r.caffeineTime,"caffeine-mg":r.caffeineMg,notes:r.notes};
 Object.keys(pairs).forEach(k=>{const el=$("dp-"+k);if(el)el.value=pairs[k]??""});
}
function merge(next,label){
 if(!next.length)throw Error("Nessuna notte datata valida da importare.");
 const distinct=new Map();for(const r of next)distinct.set(r.date,cleanRecord(r));
 const existing=sorted(),collisions=existing.filter(r=>distinct.has(r.date)).length;
 if(new Set([...existing.map(r=>r.date),...distinct.keys()]).size>LIMIT)throw Error("Limite di "+LIMIT+" notti raggiunto. Esporta un backup ed elimina i periodi che non ti servono.");
 if(collisions&&!confirm("Ci sono "+collisions+" date già registrate. Sovrascriverle con le schede importate?"))return;
 if(demo){records=[];demo=false}
 records=[...existing.filter(r=>!distinct.has(r.date)),...distinct.values()].sort((a,b)=>a.date.localeCompare(b.date));
 saveLocal();render();
 status("dp-status",label+": "+distinct.size+" notti caricate"+(collisions?" ("+collisions+" aggiornate)":"")+".");
}
function parseCSV(raw){
 const lines=[],cells=[];let cell="",quoted=false;const str=raw.replace(/^\uFEFF/,"");
 for(let i=0;i<str.length;i++){const c=str[i];
 if(c==='"'){if(quoted&&str[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
 else if(c===";"&&!quoted){cells.push(cell);cell=""}
 else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&str[i+1]==="\n")i++;cells.push(cell);cell="";if(cells.some(x=>x!==""))lines.push(cells.splice(0));else cells.length=0}
 else cell+=c;
 }
 if(quoted)throw Error("CSV con virgolette non chiuse.");
 cells.push(cell);if(cells.some(x=>x!==""))lines.push(cells);
 return lines;
}
function importCSV(raw){
 const data=parseCSV(raw);if(data.length<2)throw Error("CSV vuoto o senza schede.");
 const header=data.shift().map(x=>x.trim()),pos=Object.fromEntries(header.map((x,i)=>[x,i]));
 for(const f of ["Giorno","Data risveglio","Ora a letto","Tentativo di dormire","Latenza min","Risveglio finale","Ora alzata"])if(!(f in pos))throw Error("Il CSV non sembra provenire dal Diario gratuito: manca "+f+".");
 const last=$("dp-last-date").value;let skipped=0;
 const converted=data.map((row,i)=>{
  if(row.length!==header.length)throw Error("Numero di colonne non valido alla riga "+(i+2));
  const get=k=>pos[k]===undefined?"":String(row[pos[k]]??"").trim();
  const ix=asNum(get("Giorno"));
  if(!Number.isInteger(ix)||ix<1||ix>14)throw Error("Giorno fuori intervallo nel CSV.");
  const date=get("Data risveglio")||(validDate(last)?dateAdd(last,ix-14):"");
  if(!validDate(date)){skipped++;return null}
  const w=get("Minuti orientativi sottratti");
  const partial=yes(get("Calcolo parziale"))||w==="";
  const c=cleanRecord({date,bed:get("Ora a letto"),try:get("Tentativo di dormire"),latency:get("Latenza min"),waso:partial?"":w,
   awakenings:get("Risvegli n"),wake:get("Risveglio finale"),out:get("Ora alzata"),quality:get("Qualità 1-5"),energyGeneric:get("Energia 1-5"),
   naps:get("Sonnellini min"),notes:get("Note")});
  const original=asNum(get("Sonno orientativo min"));
  if(original!==null&&Math.abs(evaluate(c).tst-original)>1)throw Error("Calcoli non coerenti nel CSV alla riga "+(i+2));
  return c;
 }).filter(Boolean);
 return {converted,skipped};
}
function importOriginalLocal(){
 const raw=localStorage.getItem(LEGACY);if(!raw)throw Error("Nessun diario gratuito salvato in questo browser.");
 const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.entries)||data.entries.length!==14)throw Error("Formato del diario gratuito non riconosciuto.");
 const last=$("dp-last-date").value;let skipped=0;
 const converted=data.entries.map((r,i)=>{
  if(!r)return null;
  const date=r.wakeDate||(validDate(last)?dateAdd(last,i-13):"");
  if(!validDate(date)){skipped++;return null}
  return cleanRecord({date,bed:r.bedTime,try:r.tryTime,latency:r.latency,waso:r.waso,awakenings:r.awakenings,
   wake:r.finalWake,out:r.outTime,quality:r.quality,energyGeneric:r.energy,naps:r.naps,notes:r.notes});
 }).filter(Boolean);
 return {converted,skipped};
}
function demoData(){
 const result=[];
 for(let i=0;i<28;i++){
  const date=dateAdd("2026-09-01",i),bed= i<14?"23:"+String([35,50,20,55,40,10,45][i%7]).padStart(2,"0"):"23:"+String([10,20,15,25,5,20,15][i%7]).padStart(2,"0");
  const wake=i<14?"07:"+String([10,15,0,25,20,5,30][i%7]).padStart(2,"0"):"07:"+String([15,20,10,30,25,5,15][i%7]).padStart(2,"0");
  result.push(cleanRecord({date,bed,try:bed,latency:i<14?"25":"15",waso:i%8===0?"":"20",wake,out:wake,awakenings:"2",
   quality:i<14?"3":"4",energyMorning:i<14?"2":"3",energyAfternoon:i<14?"3":"4",energyEvening:"3",
   shift:i%7===5||i%7===6?"off":"day",stress:i<14?"4":"3",activity:i%3===0?"yes":"no",light:i%4===0?"no":"yes",
   caffeineTime:i%3===0?"17:00":"11:00",caffeineMg:i%3===0?"80":"80"}));
 }
 return result;
}
function metric(parent,label,value,note){
 const el=text(parent,"div","dp-metric","");text(el,"span","",label);text(el,"strong","",value);text(el,"small","",note);
}
function insight(parent,title,body){
 const el=text(parent,"div","dp-insight","");text(el,"strong","",title);text(el,"p","",body);
}
function clockSpread(times){
 if(times.length<2)return null;
 const arr=times.map(time).filter(Number.isFinite).sort((a,b)=>a-b);if(arr.length<2)return null;
 const gaps=[];for(let i=1;i<arr.length;i++)gaps.push(arr[i]-arr[i-1]);
 gaps.push(arr[0]+1440-arr[arr.length-1]);return 1440-Math.max(...gaps);
}
function noteFor(records){
 const p=records.filter(r=>r.partial).length;
 return p?p+" notti senza durata dei risvegli: il sonno stimato può risultare sovrastimato.":"Nelle notti selezionate è stata indicata una stima della veglia notturna.";
}
function latest(){const s=sorted().map(values);return s.slice(-Math.min(period,s.length))}
function rangeSummary(s){
 const d=s.length;
 return {n:d,sleep:avg(s,r=>r.tst),eff:avg(s,r=>r.eff),lat:avg(s,r=>Number(r.latency)),qual:avg(s,r=>r.qualityNum),
  energy:avg(s,r=>r.energy),spreadBed:clockSpread(s.map(r=>r.bed)),spreadWake:clockSpread(s.map(r=>r.wake)),
  partial:s.filter(r=>r.partial).length};
}
function renderMetrics(s){
 const target=$("dp-metrics");clear(target);const m=rangeSummary(s);
 metric(target,"Notti registrate",String(m.n),period===90?"Tutto lo storico":"Ultime "+period+" schede");
 metric(target,"Sonno medio",fmtM(m.sleep)+(m.partial?" *":""),"Stima dai tuoi orari");
 metric(target,"Efficienza",m.eff===null?"—":fmt(Math.round(m.eff))+"%","Stima orientativa");
 metric(target,"Energia riferita",m.energy===null?"—":fmt(m.energy)+" / 5","Media delle valutazioni disponibili");
}
function renderRhythm(s){
 const target=$("dp-rhythm-list");clear(target);
 if(!s.length){text(target,"p","dp-muted","Le notti registrate appariranno qui.");return}
 for(const r of s.slice(-28).reverse()){
  const row=text(target,"div","dp-rhythm-row","");text(row,"span","",showDate(r.date));
  const track=text(row,"div","dp-rhythm-track","");
  track.setAttribute("role","img");
  track.setAttribute("aria-label",showDate(r.date)+": a letto "+r.bed+", alzato "+r.out);
  const start=(time(r.bed)-720+1440)%1440,dur=r.tib,parts=start+dur>1440?[[start,1440-start],[0,start+dur-1440]]:[[start,dur]];
  for(const [begin,length] of parts){if(length<=0)continue;
   const bar=text(track,"span","dp-rhythm-segment"+(r.shift==="night"?" is-shift":""),"");
   bar.style.left=(begin/1440*100)+"%";bar.style.width=(length/1440*100)+"%";
   bar.title="A letto "+r.bed+" · alzato "+r.out;
  }
 }
}
function renderBars(s){
 const bar=$("dp-duration-chart");clear(bar);
 if(!s.length){text(bar,"p","dp-muted","Nessun dato disponibile.");return}
 for(const r of s.slice(-28)){
  const b=text(bar,"div",r.partial?"is-partial":"","");b.style.height=Math.max(4,Math.min(112,r.tst/720*112))+"px";
  b.title=showDate(r.date)+": "+fmtM(r.tst)+(r.partial?" (stima parziale)":"");
  b.setAttribute("role","img");b.setAttribute("aria-label",b.title);
 }
}
function evidenceSplit(s,predicate,label,metricValue){
 const withIt=s.filter(predicate),without=s.filter(r=>predicate(r)===false);
 const a=avg(withIt,metricValue),b=avg(without,metricValue);
 if(withIt.length<3||without.length<3||a===null||b===null)return label+": dati insufficienti per un confronto (servono almeno 3 notti in ciascun gruppo).";
 return label+": "+fmtM(a)+" con il fattore registrato, "+fmtM(b)+" senza. Differenza descrittiva, non causale.";
}
function lastCaffeine(rec){
 if(!rec||!rec.caffeineTime||!rec.caffeineMg)return null;
 const bed=time(rec.bed),wake=time(rec.wake),caf=time(rec.caffeineTime);
 if(![bed,wake,caf].every(Number.isFinite))return null;
 const bedAbs=bed>wake?bed-1440:bed;
 const cafAbs=caf>wake?caf-1440:caf;
 const passed=(bedAbs-cafAbs)/60;
 if(passed<0||passed>24)return null;
 const mg=Number(rec.caffeineMg);
 return {passed,fast:mg*Math.pow(2,-passed/3),medium:mg*Math.pow(2,-passed/5),slow:mg*Math.pow(2,-passed/7)};
}
function renderObservations(s){
 const target=$("dp-observations");clear(target);
 if(!s.length){insight(target,"Si comincia da una notte.","Registra una prima notte o apri un esempio per vedere le analisi.");return}
 const m=rangeSummary(s);
 insight(target,"Regolarità degli orari",m.spreadBed===null||m.spreadWake===null?"Occorrono almeno due notti.":"L'ampiezza osservata degli orari a letto è "+fmtM(m.spreadBed)+"; per i risvegli definitivi è "+fmtM(m.spreadWake)+". Non sono soglie cliniche.");
 insight(target,"Sonno ed energia",m.energy===null?"Ancora nessuna valutazione dell'energia.":"Energia media riferita: "+fmt(m.energy)+"/5; qualità percepita: "+(m.qual===null?"non indicata":fmt(m.qual)+"/5")+". Queste medie non spiegano da sole le cause della stanchezza.");
 const night=s.filter(r=>r.shift==="night"),off=s.filter(r=>r.shift==="off");
 if(night.length>=3&&off.length>=3)
  insight(target,"Turni notturni e riposi","Sonno stimato medio: "+fmtM(avg(night,r=>r.tst))+" nei turni notturni, "+fmtM(avg(off,r=>r.tst))+" nei giorni liberi. Confronto osservazionale.");
 else insight(target,"Turni e giorni liberi","Puoi distinguere turni diurni, notturni e riposi. Per un confronto servono almeno tre schede in ognuno dei gruppi confrontati.");
 const withMorning=s.filter(r=>r.energyMorning!==""&&r.energyMorning!=null),withEvening=s.filter(r=>r.energyEvening!==""&&r.energyEvening!=null);
 if(withMorning.length>=3&&withEvening.length>=3)
  insight(target,"Energia nella giornata","Mattina "+fmt(avg(withMorning,r=>Number(r.energyMorning)))+"/5; sera "+fmt(avg(withEvening,r=>Number(r.energyEvening)))+"/5, fra le rilevazioni disponibili.");
 else insight(target,"Energia nella giornata","Compila energia mattina, pomeriggio e sera per visualizzare i tuoi andamenti. Evitiamo previsioni circadiane basate su dati insufficienti.");
 const late=s.filter(r=>r.caffeineTime&&time(r.caffeineTime)>=15*60);
 const early=s.filter(r=>r.caffeineTime&&time(r.caffeineTime)<15*60);
 if(late.length>=3&&early.length>=3)
  insight(target,"Ultima caffeina","Latenza media riferita "+fmt(avg(late,r=>Number(r.latency)))+" min con ultima assunzione alle 15 o dopo, contro "+fmt(avg(early,r=>Number(r.latency)))+" min prima delle 15. Il confronto non dimostra una causa.");
 else insight(target,"Caffeina e addormentamento","Annota l'ultima assunzione per confrontare la latenza fra gruppi. Servono almeno tre notti per gruppo, e l'orario da solo non spiega tutta l'esposizione.");
 insight(target,"Qualità delle stime",noteFor(s));
}
function renderCaffeine(s){
 const box=$("dp-caffeine");clear(box);
 const r=s.slice().reverse().find(r=>r.caffeineTime&&r.caffeineMg);
 text(box,"strong","","Caffeina: una stima, non una misurazione");
 if(!r){text(box,"p","dp-muted","Inserisci ora e quantità dell'ultima assunzione per un esempio di decadimento al momento di coricarti. Per più bevande usa il simulatore dedicato.");return}
 const z=lastCaffeine(r);
 if(!z){text(box,"p","dp-muted","L'ultima assunzione annotata non precede chiaramente l'ora di coricarti nella finestra considerata. Nessuna stima calcolata.");return}
 text(box,"p","",showDate(r.date)+": ultima assunzione "+r.caffeineMg+" mg alle "+r.caffeineTime+", circa "+fmt(z.passed)+" ore prima di andare a letto.");
 text(box,"p","","Quota teoricamente ancora presente: "+Math.round(z.fast)+"–"+Math.round(z.slow)+" mg (emivite illustrative 3–7 ore); scenario centrale 5 ore: circa "+Math.round(z.medium)+" mg.");
 const p=text(box,"p","dp-muted","È un modello semplificato per UNA singola assunzione, non una stima personalizzata. L'emivita cambia tra persone e situazioni; questi tre scenari servono a mostrare l'incertezza, non a predire il tuo sonno. ");
 const a=document.createElement("a");a.href="../caffeina/index.html";a.textContent="Apri il simulatore completo ↗";p.appendChild(a);
}
function renderProgress(){
 const target=$("dp-progress-result");clear(target);
 if(!records.length){insight(target,"Primo passo","Registra una notte per avviare il percorso di osservazione.");return}
 const all=sorted().map(values);
 const start=$("dp-compare-start").value;
 if(!validDate(start)){insight(target,"Seleziona la data iniziale","La prima finestra comprenderà i 14 giorni di calendario successivi alla data scelta, la seconda i 14 successivi.");return}
 const mid=dateAdd(start,14),end=dateAdd(start,28);
 const first=all.filter(r=>r.date>=start&&r.date<mid),second=all.filter(r=>r.date>=mid&&r.date<end);
 insight(target,"Primi 14 giorni · "+showDate(start),first.length+" notti registrate. Sonno medio stimato: "+fmtM(avg(first,r=>r.tst))+".");
 insight(target,"Successivi 14 giorni · "+showDate(mid),second.length+" notti registrate. Sonno medio stimato: "+fmtM(avg(second,r=>r.tst))+".");
 if(first.length>=3&&second.length>=3){
  const a=avg(first,r=>r.tst),b=avg(second,r=>r.tst),diff=b-a;
  insight(target,"Confronto della durata","La media stimata è "+(diff>=0?"aumentata":"diminuita")+" di "+fmtM(Math.abs(diff))+". È un confronto tra periodi, non una prova di miglioramento né di causalità.");
 }else insight(target,"Per confrontare i periodi","Occorrono almeno 3 notti in ciascuna finestra. Più notti valide renderanno il quadro descrittivo più rappresentativo.");
 const desc={regularity:"gli orari di letto e risveglio",caffeine:"l'orario dell'ultima caffeina e la latenza",energy:"le valutazioni dell'energia durante il giorno",stress:"lo stress percepito",light:"la luce naturale dopo il risveglio"}[focus]||"i ritmi del sonno";
 insight(target,"Il tuo approfondimento","Osserva "+desc+" nei due periodi. Una coincidenza tra fattori non basta per stabilire un rapporto di causa-effetto.");
}
function renderHistory(){
 const body=$("dp-history-body");clear(body);const all=sorted().map(values).reverse();
 if(!all.length){const tr=document.createElement("tr");text(tr,"td","","Nessuna notte registrata.").colSpan=6;body.appendChild(tr);return}
 for(const r of all){
  const tr=document.createElement("tr");text(tr,"td","",showDate(r.date));text(tr,"td","",fmtM(r.tst)+(r.partial?" *":""));
  text(tr,"td","",r.bed+" – "+r.out);text(tr,"td","",r.energy===null?"—":fmt(r.energy)+"/5");
  text(tr,"td","",({day:"Diurno",night:"Notturno",off:"Riposo",other:"Altro"})[r.shift]||"—");
  const td=text(tr,"td","","");
  for(const [act,label] of [["edit","Modifica"],["delete","Elimina"]]){
   const b=text(td,"button","",label);b.type="button";b.dataset.action=act;b.dataset.date=r.date;
   if(act==="edit")b.style.marginRight="12px";
  }body.appendChild(tr);
 }
}
function makeReport(){
 const container=$("pro-result");clear(container);
 const panel=$("pro-report");panel.hidden=!records.length;if(!records.length){reportText="";return}
 const s=latest(),m=rangeSummary(s),dashboard=text(container,"div","pro-dashboard","");
 if(demo)text(dashboard,"div","pro-demo-flag","ESEMPIO DIMOSTRATIVO · 28 NOTTI INVENTATE");
 const inner=text(dashboard,"div","dp-panel","");
 text(inner,"h3","","Tre informazioni da conservare");
 const summary=text(inner,"div","dp-metrics","");
 metric(summary,"Sonno medio",fmtM(m.sleep)+(m.partial?" *":""),"Stima orientativa");
 metric(summary,"Latenza media",m.lat===null?"—":fmt(m.lat)+" min","Dichiarata");
 metric(summary,"Qualità",m.qual===null?"—":fmt(m.qual)+"/5","Percepita");
 metric(summary,"Notti analizzate",String(m.n),"Di "+records.length+" registrate");
 const observations=text(inner,"div","dp-insights","");
 insight(observations,"Orari",m.spreadBed===null?"Occorrono almeno due notti per mostrare le variazioni.":"Ampiezza osservata: "+fmtM(m.spreadBed)+" all'ora di andare a letto e "+fmtM(m.spreadWake)+" al risveglio definitivo.");
 insight(observations,"Energia",m.energy===null?"Nessuna valutazione disponibile.":"Energia percepita media "+fmt(m.energy)+"/5. Il valore non è una misurazione fisiologica.");
 insight(observations,"Completezza del diario",noteFor(s));
 insight(observations,"Come leggere i risultati","Non sono stati applicati punteggi clinici o diagnosticati disturbi. Per approfondire osserva più periodi e condividi le tue annotazioni con un professionista qualificato, se necessario.");
 const lines=["DIARIO DEL SONNO PRO — Dott. Roberto Boscia",demo?"ESEMPIO DIMOSTRATIVO · DATI INVENTATI":"",
 "Notti registrate: "+records.length,"Periodo selezionato: ultime "+Math.min(period,records.length)+" notti",
 "Sonno medio stimato: "+fmtM(m.sleep),"Latenza media riferita: "+(m.lat===null?"—":fmt(m.lat)+" min"),
 "Efficienza stimata: "+(m.eff===null?"—":fmt(m.eff)+"%"),
 "Qualità percepita: "+(m.qual===null?"—":fmt(m.qual)+"/5"),"Energia riferita: "+(m.energy===null?"—":fmt(m.energy)+"/5"),
 "Ampiezza orari a letto: "+fmtM(m.spreadBed),"Ampiezza risvegli: "+fmtM(m.spreadWake),noteFor(s),"",
 "Documento informativo descrittivo. Nessuna diagnosi, stime soggettive e possibilità di dati mancanti."];
 reportText=lines.filter(Boolean).join("\n");
}
function render(){
 const all=sorted();
 $("dp-total").textContent=all.length+" / "+LIMIT+" notti nel Diario PRO"+(demo?" · DATI DIMOSTRATIVI":"");
 const s=latest();renderMetrics(s);renderRhythm(s);renderBars(s);renderObservations(s);renderCaffeine(s);renderProgress();renderHistory();makeReport();
 const periodButtons=[...document.querySelectorAll("[data-period]")];
 periodButtons.forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.period)===period)));
}
function setDefaultProgressStart(){
 const s=sorted();if(!s.length){$("dp-compare-start").value="";return}
 $("dp-compare-start").value=s[Math.max(0,s.length-28)].date;
}
function csvExport(){
 const columns=["date","bed","try","latency","waso","awakenings","wake","out","quality","naps","energyMorning","energyAfternoon","energyEvening","energyGeneric","shift","stress","activity","light","caffeineTime","caffeineMg","notes"];
 const quoted=x=>{let v=String(x??"");if(/^[ \t]*[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 return [columns,...sorted().map(r=>columns.map(k=>r[k]??""))].map(row=>row.map(quoted).join(";")).join("\r\n");
}
function downloadBackup(){
 if(!records.length){status("dp-status","Non ci sono schede da esportare.",true);return}
 const name=demo?"ESEMPIO_Diario_PRO.json":"Backup_Diario_PRO.json";
 saveFile(name,JSON.stringify({format:"RB_SLEEP_PRO",version:2,focus,records,demonstration:demo},null,2),"application/json;charset=utf-8");
}
function handleFileError(err){status("dp-status","Importazione non riuscita: "+String(err?.message||err),true)}
$("dp-form").addEventListener("submit",e=>{
 e.preventDefault();
 try{
  const r=getForm();if(demo){if(!confirm("Stai usando notti inventate. Eliminare l'esempio per creare il tuo diario personale?"))return;records=[];demo=false}
  if(!records.some(x=>x.date===r.date)&&records.length>=LIMIT)throw Error("Hai già 90 notti. Scarica un backup e rimuovi un periodo prima di aggiungerne altre.");
  const changed=records.some(x=>x.date===r.date);
  records=[...records.filter(x=>x.date!==r.date),r];saveLocal();setDefaultProgressStart();render();
  status("dp-form-status",changed?"Notte aggiornata.":"Notte salvata nel diario PRO."+(persist?"":" Esporta un backup: senza salvataggio locale andrà persa alla chiusura.")); 
 }catch(err){status("dp-form-status",err.message,true)}
});
$("dp-form-reset").addEventListener("click",resetForm);
$("dp-persist").addEventListener("change",e=>{
 persist=e.target.checked;
 try{
  if(!persist){localStorage.removeItem(KEY);status("dp-status","Salvataggio disattivato. Le schede restano in questa pagina fino alla chiusura.");}
  else if(demo)status("dp-status","L'esempio non viene salvato. Registra le tue notti per conservare dati personali.");
  else{saveLocal();status("dp-status","Salvataggio locale attivato. Il diario resta su questo dispositivo finché non lo elimini.");}
 }catch(err){persist=false;e.target.checked=false;status("dp-status","Salvataggio locale non disponibile: usa i backup.",true)}
});
$("dp-import-csv").addEventListener("change",async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>1024*1024)throw Error("File oltre 1 MB.");
  const {converted,skipped}=importCSV(await file.text());
  merge(converted,"CSV importato");
  if(skipped)status("dp-status",converted.length+" notti importate, "+skipped+" senza data escluse. Puoi indicare una data finale e ripetere l'importazione.");
  setDefaultProgressStart();
 }catch(err){handleFileError(err)}finally{e.target.value=""}
});
$("dp-local").addEventListener("click",()=>{
 try{const {converted,skipped}=importOriginalLocal();merge(converted,"Diario gratuito");
  if(skipped)status("dp-status",converted.length+" notti caricate; "+skipped+" senza data escluse. Imposta la data dell'ultima notte e ripeti.");
  setDefaultProgressStart();
 }catch(err){handleFileError(err)}
});
$("dp-import-backup").addEventListener("change",async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>1024*1024)throw Error("Backup oltre 1 MB.");
  const obj=JSON.parse(await file.text());
  if(obj.format!=="RB_SLEEP_PRO"||obj.version!==2||!Array.isArray(obj.records)||obj.records.length>LIMIT)throw Error("Il file non è un backup PRO valido.");
  const data=obj.records.map(cleanRecord);if(new Set(data.map(r=>r.date)).size!==data.length)throw Error("Il backup contiene date duplicate.");
  if(records.length&&!confirm("Sostituire tutte le notti attuali con questo backup?"))return;
  records=data;demo=Boolean(obj.demonstration);focus=String(obj.focus||"regularity");$("dp-focus").value=focus;saveLocal();setDefaultProgressStart();render();
  status("dp-status","Backup caricato: "+records.length+" notti."+(demo?" ESEMPIO DIMOSTRATIVO.":""));
 }catch(err){handleFileError(err)}finally{e.target.value=""}
});
$("pro-demo").addEventListener("click",()=>{
 if(records.length&&!demo&&!confirm("Mostrare 28 notti inventate al posto dei dati visualizzati? I dati personali in memoria non verranno cancellati dal salvataggio locale, ma esporta prima un backup se non l'hai attivato."))return;
 records=demoData();demo=true;persist=false;$("dp-persist").checked=false;
 $("dp-compare-start").value="2026-09-01";render();
 status("dp-status","ESEMPIO DIMOSTRATIVO: 28 notti completamente inventate. Nessun dato personale richiesto.");
 $("pro-report").scrollIntoView({behavior:"auto",block:"start"});
});
$("dp-clear").addEventListener("click",()=>{
 if(!records.length)return;
 if(!confirm("Eliminare tutte le schede PRO da questa pagina e dall'archivio locale? È irreversibile senza un backup."))return;
 records=[];demo=false;try{localStorage.removeItem(KEY)}catch(err){}
 render();status("dp-status","Diario PRO cancellato. Il diario gratuito non è stato modificato.");
});
$("dp-backup").addEventListener("click",downloadBackup);
$("dp-export-json").addEventListener("click",downloadBackup);
$("dp-export-csv").addEventListener("click",()=>{
 if(!records.length){status("dp-status","Nessuna notte da esportare.",true);return}
 saveFile(demo?"ESEMPIO_Diario_PRO.csv":"Diario_PRO.csv",csvExport(),"text/csv;charset=utf-8");
});
document.querySelectorAll("[data-period]").forEach(button=>button.addEventListener("click",()=>{period=Number(button.dataset.period);render()}));
$("dp-history-body").addEventListener("click",e=>{
 const b=e.target.closest("button[data-action]");if(!b)return;
 const r=records.find(x=>x.date===b.dataset.date);if(!r)return;
 if(b.dataset.action==="edit"){putForm(r);$("dp-entry").scrollIntoView({behavior:"auto",block:"start"});status("dp-form-status","Stai modificando la scheda del "+showDate(r.date)+". Premi Salva per confermare.");}
 if(b.dataset.action==="delete"){
  if(!confirm("Cancellare la scheda del "+showDate(r.date)+"?"))return;
  records=records.filter(x=>x.date!==r.date);if(demo&&records.length===0)demo=false;
  saveLocal();setDefaultProgressStart();render();status("dp-status","Scheda eliminata.");
 }
});
$("dp-focus").addEventListener("change",e=>{focus=e.target.value;saveLocal();renderProgress()});
$("dp-compare-start").addEventListener("change",renderProgress);
$("dp-print").addEventListener("click",()=>window.print());
$("dp-report-txt").addEventListener("click",()=>{if(reportText)saveFile(demo?"ESEMPIO_Report_PRO.txt":"Report_Diario_PRO.txt",reportText)});
resetForm();loadLocal();$("dp-focus").value=focus;setDefaultProgressStart();render();
})();