/* Diario PRO · Grafici comparativi e Microaccademia.
   Solo visualizzazione di dati locali esposti dal diario: nessuna trasmissione. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const api=window.SleepDiaryPRO;
const lessons=window.SleepProLessons;
if(!api||!Array.isArray(lessons)||!$("dp-compare")||!$("dp-learn"))return;
const answered=new Map(),completed=new Set();
const escDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||"")?s.slice(8,10)+"/"+s.slice(5,7):"—";
const time=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||"")?Number(s.slice(0,2))*60+Number(s.slice(3)):NaN;
const fmt=x=>Number.isFinite(x)?x.toLocaleString("it-IT",{maximumFractionDigits:1}):"—";
const sleep=x=>Number.isFinite(x)?Math.floor(Math.round(x)/60)+"h "+String(Math.round(x)%60).padStart(2,"0")+"m":"—";
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:null;
const num=x=>x===null||x===undefined||x===""?null:Number.isFinite(Number(x))?Number(x):null;
const el=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const add=(parent,tag,cls,content)=>{const e=el(tag,cls,content);parent.appendChild(e);return e};
const empty=node=>node.replaceChildren();
const selectRecords=()=>{const s=api.getSnapshot();return {...s,selected:s.records.slice(-Math.min(s.period,s.records.length))}};
function hrsBefore(rec){
 const b=time(rec.bed),w=time(rec.wake),c=time(rec.caffeineTime);
 if(![b,w,c].every(Number.isFinite)||num(rec.caffeineMg)===null)return null;
 const bAbs=b>w?b-1440:b,cAbs=c>w?c-1440:c,d=(bAbs-cAbs)/60;
 return d>=0&&d<=24?d:null;
}
function spread(times){
 const a=times.map(time).filter(Number.isFinite).sort((x,y)=>x-y);
 if(a.length<2)return null;
 let gap=a[0]+1440-a[a.length-1];for(let i=1;i<a.length;i++)gap=Math.max(gap,a[i]-a[i-1]);
 return 1440-gap;
}
function svgElement(name,attrs,textContent){
 const svgNS="http://www.w3.org/2000/svg",e=document.createElementNS(svgNS,name);
 Object.keys(attrs||{}).forEach(k=>e.setAttribute(k,String(attrs[k])));
 if(textContent!==undefined)e.textContent=String(textContent);
 return e;
}
function renderScatter(snapshot){
 const target=$("dp-scatter"),caption=$("dp-scatter-note");empty(target);
 const paired=snapshot.selected.filter(r=>Number.isFinite(num(r.energy))&&Number.isFinite(num(r.tst)));
 if(paired.length<3){
  add(target,"p","dp-chart-empty","Sono necessarie almeno 3 notti con durata stimata ed energia riferita per costruire il grafico.");
  caption.textContent="I campi vuoti non vengono interpretati come energia zero.";return;
 }
 const xs=paired.map(r=>r.tst/60),min=Math.max(0,Math.floor(Math.min(...xs))-1),max=Math.min(18,Math.max(min+2,Math.ceil(Math.max(...xs))+1));
 const X=v=>54+(Math.max(min,Math.min(max,v))-min)/(max-min)*410;
 const Y=v=>224-(Math.max(1,Math.min(5,v))-1)/4*181;
 const svg=svgElement("svg",{viewBox:"0 0 490 270",role:"img","aria-label":"Relazione descrittiva tra ore di sonno stimate e livello di energia percepita","preserveAspectRatio":"xMidYMid meet"});
 svg.appendChild(svgElement("title",{}, "Sonno stimato ed energia percepita: un punto per notte"));
 svg.appendChild(svgElement("desc",{},paired.length+" punti; asse X ore stimate, asse Y energia da 1 a 5; nessuna relazione causale deducibile."));
 for(let i=1;i<=5;i++){
  const y=Y(i);svg.appendChild(svgElement("line",{x1:54,y1:y,x2:464,y2:y,class:"dp-svg-grid"}));
  svg.appendChild(svgElement("text",{x:38,y:y+4,class:"dp-svg-text","text-anchor":"end"},String(i)));
 }
 const step=(max-min>9?2:1);
 for(let h=min;h<=max;h+=step){
  const x=X(h);svg.appendChild(svgElement("line",{x1:x,y1:43,x2:x,y2:224,class:"dp-svg-grid"}));
  svg.appendChild(svgElement("text",{x,y:243,class:"dp-svg-text","text-anchor":"middle"},h+"h"));
 }
 svg.appendChild(svgElement("text",{x:259,y:264,class:"dp-svg-text dp-svg-axis","text-anchor":"middle"},"Durata del sonno stimata"));
 svg.appendChild(svgElement("text",{x:15,y:133,transform:"rotate(-90 15 133)",class:"dp-svg-text dp-svg-axis","text-anchor":"middle"},"Energia 1–5"));
 paired.forEach((r,i)=>{
  const jitter=((i%5)-2)*2;
  const dot=svgElement("circle",{cx:X(r.tst/60)+jitter,cy:Y(r.energy)+jitter,r:5.6,class:"dp-svg-dot",tabindex:"0"});
  dot.appendChild(svgElement("title",{},escDate(r.date)+": sonno "+sleep(r.tst)+", energia "+fmt(r.energy)+"/5"+(r.partial?" (stima parziale)":"")));
  svg.appendChild(dot);
 });
 target.appendChild(svg);
 const partial=paired.filter(r=>r.partial).length;
 caption.textContent=paired.length+" notti confrontabili"+(partial?"; "+partial+" con stime di sonno parziali":"")+". Punti vicini possono sovrapporsi. Il grafico non calcola né dimostra correlazioni causali.";
}
const groups={
 caffeine:{labels:["Ultima caffeina ≤6h","Ultima caffeina >6h"],get:r=>{const h=hrsBefore(r);return h===null?null:h<=6?0:1},note:"La soglia di 6 ore è una scelta di visualizzazione, non un limite clinico universalmente valido. È registrata soltanto l'ultima assunzione."},
 stress:{labels:["Stress alto (4–5)","Stress basso (1–2)"],get:r=>{const x=num(r.stress);return x===null||x===3?null:x>=4?0:1},note:"Le giornate con stress 3/5 sono escluse dal confronto alto/basso. Nessuna causalità è dimostrata."},
 activity:{labels:["Attività: sì","Attività: no"],get:r=>r.activity==="yes"?0:r.activity==="no"?1:null,note:"Conta solo l'attività auto-dichiarata, senza intensità o durata. Non è possibile isolare altri fattori."},
 light:{labels:["Luce naturale: sì","Luce naturale: no"],get:r=>r.light==="yes"?0:r.light==="no"?1:null,note:"Il campo sì/no non misura esposizione luminosa, lux o tempi."},
 shift:{labels:["Turno notturno","Giorno libero"],get:r=>r.shift==="night"?0:r.shift==="off"?1:null,note:"Il confronto riflette le giornate contrassegnate. Non misura l'adattamento circadiano né esprime un giudizio sugli orari del turnista."}
};
function renderFactors(snapshot){
 const target=$("dp-factor-chart"),caption=$("dp-factor-note");empty(target);
 const factor=groups[$("dp-factor").value]||groups.caffeine;
 const a=snapshot.selected.filter(r=>factor.get(r)===0),b=snapshot.selected.filter(r=>factor.get(r)===1);
 if(a.length<3||b.length<3){
  add(target,"p","dp-chart-empty","Per questo confronto servono almeno tre notti per gruppo.");
  add(target,"p","dp-chart-count",factor.labels[0]+": "+a.length+" notti · "+factor.labels[1]+": "+b.length+" notti.");
  caption.textContent=factor.note+" I gruppi con dati insufficienti non generano barre fittizie.";return;
 }
 const avgs=[mean(a.map(r=>r.tst)),mean(b.map(r=>r.tst))];
 const max=Math.max(480,...avgs)*1.15;
 [a,b].forEach((records,i)=>{
  const g=add(target,"div","dp-factor-group");
  const title=add(g,"div","dp-factor-row-head");
  add(title,"span","",factor.labels[i]);add(title,"strong","",sleep(avgs[i]));
  const track=add(g,"div","dp-factor-track");const fill=add(track,"div","dp-factor-fill"+(i===1?" is-alt":""));
  fill.style.width=Math.max(3,Math.min(100,avgs[i]/max*100))+"%";
  add(g,"p","dp-muted",records.length+" notti · "+records.filter(r=>r.partial).length+" con stima di durata parziale");
 });
 const diff=avgs[0]-avgs[1];caption.textContent="Differenza tra medie del campione: "+sleep(Math.abs(diff))+" ("+(diff>0?factor.labels[0]+" più lungo":diff<0?factor.labels[1]+" più lungo":"stessa media")+"). "+factor.note+" Non è un rapporto di causa-effetto.";
}
function suggestedIds(snapshot){
 const s=snapshot.records, rec=new Set(["dimensions","diary","observation"]);
 if(s.length<2){rec.add("regularity");return rec}
 if(s.some(r=>r.partial))rec.add("continuity");
 if(spread(s.map(r=>r.wake))!==null&&spread(s.map(r=>r.wake))>90)rec.add("regularity");
 if(s.some(r=>r.shift==="night"))rec.add("shifts");
 if(s.some(r=>hrsBefore(r)!==null))rec.add("caffeine");
 if(s.some(r=>num(r.energy)!==null))rec.add("energy");
 if(s.some(r=>r.light==="yes"||r.light==="no"))rec.add("light");
 if(s.some(r=>num(r.stress)!==null))rec.add("stress");
 if(rec.size<5)rec.add("clock");
 return rec;
}
function relatedText(lesson,snapshot){
 const s=snapshot.selected,n=s.length,none="Non hai ancora abbastanza notti registrate per un collegamento individuale: questa spiegazione resta utile come introduzione.";
 if(!n)return none;
 const average=field=>mean(s.map(field).filter(Number.isFinite));
 switch(lesson.id){
 case "dimensions":return "In "+n+" notti puoi confrontare durata, energia e qualità percepita: non occorre ridurre tutto a un punteggio.";
 case "diary":return n+" notti presenti, di cui "+s.filter(r=>r.partial).length+" con stima del sonno parziale.";
 case "regularity":{const d=spread(s.map(r=>r.wake));return d===null?none:"Nel periodo selezionato, l'ampiezza degli orari di risveglio è "+sleep(d)+". Non è una misura clinica di regolarità."}
 case "clock":return s.some(r=>r.shift==="night")?"Hai registrato almeno un turno notturno: il contesto di lavoro è importante per leggere gli orari.":"I tuoi orari nel diario sono indizi comportamentali, non misure dell'orologio biologico.";
 case "duration":return "Durata stimata media del periodo: "+sleep(average(r=>r.tst))+". Non corrisponde automaticamente al fabbisogno individuale.";
 case "continuity":return "Sono presenti "+s.filter(r=>r.partial).length+" stime parziali su "+n+" notti.";
 case "energy":{const a=average(r=>num(r.energy));return a===null?"Non hai ancora inserito energia percepita.":("Energia media dichiarata: "+fmt(a)+"/5. Prova a confrontarla con la durata delle singole notti.")}
 case "caffeine":return "Notti con ultima assunzione registrata: "+s.filter(r=>hrsBefore(r)!==null).length+". Il valore non copre tutte le bevande della giornata.";
 case "light":return "Giornate con risposta sulla luce naturale: "+s.filter(r=>r.light==="yes"||r.light==="no").length+". Il sì/no non misura l'esposizione.";
 case "shifts":return "Turni notturni indicati: "+s.filter(r=>r.shift==="night").length+". Il confronto richiede almeno tre notti per gruppo.";
 case "stress":return "Notti con stress percepito annotato: "+s.filter(r=>num(r.stress)!==null).length+". Non possiamo dedurre cause.";
 case "observation":return n>=14?"Hai almeno 14 notti: puoi confrontare periodi più lunghi senza trasformare le differenze in prove di causalità.":"Stai raccogliendo uno storico: più registrazioni utili possono migliorare il quadro descrittivo.";
 default:return none;
 }
}
function updateLearnProgress(snapshot){
 const target=$("dp-learning-summary");empty(target);
 const recommend=suggestedIds(snapshot);
 const row=add(target,"div","dp-learning-progress");
 add(row,"strong","",completed.size+" di "+lessons.length+" lezioni lette");
 add(row,"span","",snapshot.demo?"Esempio dimostrativo: consigli basati su notti inventate.":recommend.size+" argomenti pertinenti ai dati presenti.");
 const track=add(target,"div","dp-learning-bar");add(track,"span").style.width=(completed.size/lessons.length*100)+"%";
}
function renderLessons(snapshot){
 const target=$("dp-lessons");const openIds=new Set([...target.querySelectorAll("details[open]")].map(d=>d.dataset.lesson));
 const suggested=suggestedIds(snapshot),filter=$("dp-lesson-filter").value;
 empty(target);
 const items=lessons.filter(l=>filter==="all"||(filter==="suggested"&&suggested.has(l.id))||l.group===filter);
 if(!items.length){add(target,"p","dp-muted","Nessuna lezione in questo filtro.");return}
 for(const l of items){
  const details=add(target,"details","dp-lesson");details.dataset.lesson=l.id;details.open=openIds.has(l.id);
  const summary=add(details,"summary","");
  const head=add(summary,"span","dp-lesson-heading");
  add(head,"span","dp-lesson-label",(suggested.has(l.id)?"PERTINENTE AI DATI · ":"")+"LEZIONE "+String(lessons.indexOf(l)+1).padStart(2,"0"));
  add(head,"strong","",l.title);
  add(summary,"span","dp-lesson-time",(completed.has(l.id)?"✓ Completata":"2–3 min"));
  const content=add(details,"div","dp-lesson-content");
  for(const para of l.paragraphs)add(content,"p","",para);
  const ctx=add(content,"div","dp-context");
  add(ctx,"strong","","Nei tuoi dati");
  add(ctx,"p","",relatedText(l,snapshot));
  const cite=add(content,"p","dp-source","Fonte: ");
  const link=add(cite,"a","",l.source+" ↗");link.href=l.url;link.target="_blank";link.rel="noopener noreferrer";
  const quiz=add(content,"div","dp-quiz");
  add(quiz,"strong","","Una domanda per verificare il concetto");
  add(quiz,"p","",l.question);
  const buttons=add(quiz,"div","dp-quiz-answers");
  l.options.forEach((option,i)=>{
   const b=add(buttons,"button","dp-quiz-option",option);b.type="button";
   b.setAttribute("aria-pressed",String(answered.get(l.id)===i));
   b.addEventListener("click",()=>{
    answered.set(l.id,i);
    [...buttons.querySelectorAll("button")].forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));
    feedback.textContent=(i===l.correct?"Esatto. ":"Non proprio. ")+l.why;
    feedback.className="dp-quiz-feedback"+(i===l.correct?" is-correct":"");
   });
  });
  const feedback=add(quiz,"p","dp-quiz-feedback",answered.has(l.id)?(answered.get(l.id)===l.correct?"Esatto. ":"Non proprio. ")+l.why:"");
  const done=add(content,"button","dp-lesson-done",completed.has(l.id)?"Segnata come letta ✓":"Segna come letta");
  done.type="button";done.addEventListener("click",()=>{
   if(completed.has(l.id))completed.delete(l.id);else completed.add(l.id);
   done.textContent=completed.has(l.id)?"Segnata come letta ✓":"Segna come letta";
   updateLearnProgress(snapshot);
  });
 }
}
function renderEducationInReport(snapshot){
 const target=$("dp-report-education");empty(target);if(!snapshot.records.length)return;
 const recommended=suggestedIds(snapshot),id=["continuity","regularity","energy","caffeine","shifts","dimensions"].find(x=>recommended.has(x))||"dimensions";
 const lesson=lessons.find(x=>x.id===id);
 add(target,"h3","","Per capire meglio: "+lesson.title);
 add(target,"p","",lesson.paragraphs[0]);
 add(target,"p","dp-muted","Approfondimento legato ai dati: "+relatedText(lesson,snapshot));
 const a=add(target,"a","", "Fonte: "+lesson.source+" ↗");a.href=lesson.url;a.target="_blank";a.rel="noopener noreferrer";
}
function render(){
 const snapshot=selectRecords();
 renderScatter(snapshot);renderFactors(snapshot);updateLearnProgress(snapshot);renderLessons(snapshot);renderEducationInReport(snapshot);
}
$("dp-factor").addEventListener("change",()=>renderFactors(selectRecords()));
$("dp-lesson-filter").addEventListener("change",render);
document.addEventListener("sleep-pro:updated",render);
render();
})();