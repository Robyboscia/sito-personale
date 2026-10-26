/* Diario PRO: importazione e analisi locale CSV o schede con salvataggio esplicito. */
(() => {
"use strict";
const T=window.SleepLabTools;if(!T)return;
const {$,add,clear,status,metric,item,note}={
 $:T.$,add:T.add.bind(T),clear:T.clear.bind(T),status:T.status.bind(T),
 metric:T.metric.bind(T),item:T.item.bind(T),note:T.note.bind(T)
};
const result=$("pro-result"),actions=$("pro-actions");let rows=[],report="";
function parseCSV(raw){
 const out=[],fields=[];let cell="",quoted=false;
 const str=raw.replace(/^\uFEFF/,"");
 for(let i=0;i<str.length;i++){
  const c=str[i];
  if(c==='"'){
   if(quoted&&str[i+1]==='"'){cell+='"';i++}
   else quoted=!quoted;
  }else if(c===";"&&!quoted){fields.push(cell);cell=""}
  else if((c==="\n"||c==="\r")&&!quoted){
   if(c==="\r"&&str[i+1]==="\n")i++;
   fields.push(cell);cell="";
   if(fields.some(v=>v!==""))out.push(fields.splice(0));else fields.length=0;
  }else cell+=c;
 }
 if(quoted)throw Error("Il CSV contiene virgolette non chiuse.");
 fields.push(cell);if(fields.some(v=>v!==""))out.push(fields);
 return out;
}
function asNumber(val){const x=String(val??"").trim();if(!x)return NaN;return Number(x.replace(",","."))}
function asYes(value){return /^(si|sì)$/i.test(String(value).trim())}
const required=["Giorno","Data risveglio","Ora a letto","Tentativo di dormire","Latenza min",
 "Minuti orientativi sottratti","Risveglio finale","Ora alzata","Qualità 1-5",
 "Tempo a letto min","Sonno orientativo min","Efficienza orientativa percentuale","Calcolo parziale"];
function importCSV(raw){
 const data=parseCSV(raw);
 if(data.length<2)throw Error("Non trovo notti registrate nel CSV.");
 const header=data.shift().map(x=>x.trim()),positions=Object.fromEntries(header.map((x,i)=>[x,i]));
 for(const key of required)if(!(key in positions))throw Error("CSV diverso dal formato del diario: manca «"+key+"».");
 const seen=new Set(),records=[];
 const get=(row,name)=>String(row[positions[name]]??"");
 for(const entry of data){
  if(entry.length!==header.length)throw Error("Una riga ha un numero di colonne diverso dal previsto.");
  const day=asNumber(get(entry,"Giorno"));
  if(!Number.isInteger(day)||day<1||day>14||seen.has(day))throw Error("Numero del giorno assente, duplicato o non valido.");
  seen.add(day);
  const bed=get(entry,"Ora a letto"),attempt=get(entry,"Tentativo di dormire"),
   wake=get(entry,"Risveglio finale"),out=get(entry,"Ora alzata");
  const tib=asNumber(get(entry,"Tempo a letto min")),tst=asNumber(get(entry,"Sonno orientativo min")),
   latency=asNumber(get(entry,"Latenza min")),partial=asYes(get(entry,"Calcolo parziale"));
  const qualityRaw=get(entry,"Qualità 1-5").trim();
  const quality=qualityRaw?asNumber(qualityRaw):null;
  const wasoRaw=get(entry,"Minuti orientativi sottratti").trim();
  const waso=wasoRaw?asNumber(wasoRaw):null;
  if([bed,attempt,wake,out].some(v=>!Number.isFinite(T.parseTime(v)))||
     !Number.isFinite(tib)||tib<60||tib>1080||
     !Number.isFinite(tst)||tst<0||tst>tib||
     !Number.isInteger(latency)||latency<0||latency>600||
     (quality!==null&&(!Number.isInteger(quality)||quality<1||quality>5))||
     (partial&&waso!==null)||(!partial&&(!Number.isFinite(waso)||waso<0||waso>600)))
   throw Error("Valori non plausibili nel giorno "+day+". Controlla il file originale.");
  // Ricalcolo di controllo, evitando report fuorvianti da CSV alterati.
  const start=T.parseTime(bed),attemptM=T.parseTime(attempt),wakeM=T.parseTime(wake),outM=T.parseTime(out);
  const before=T.forward(start,attemptM),night=T.forward(attemptM,wakeM),after=T.forward(wakeM,outM);
  const recTib=before+night+after,recTst=night-latency-(partial?0:waso);
  if(before>360||after>360||night<1||recTst<0||Math.abs(recTib-tib)>1||Math.abs(recTst-tst)>1)
   throw Error("Il giorno "+day+" contiene dati/calcoli incoerenti. Esporta di nuovo dal diario originale.");
  records.push({day,date:get(entry,"Data risveglio"),bed,wake,tib,tst,latency,quality,partial});
 }
 return records.sort((a,b)=>a.day-b.day);
}
function importSaved(){
 const raw=localStorage.getItem("roberto-boscia.sleep-diary.v1");
 if(!raw)throw Error("Nessuna scheda salvata in questo browser. Usa il file CSV esportato dal diario.");
 const saved=JSON.parse(raw);
 if(saved?.version!==1||!Array.isArray(saved.entries)||saved.entries.length!==14)
  throw Error("Il salvataggio presente non ha un formato riconosciuto.");
 const records=[];
 saved.entries.forEach((entry,index)=>{
  if(!entry)return;
  const bed=T.parseTime(entry.bedTime),attempt=T.parseTime(entry.tryTime),wake=T.parseTime(entry.finalWake),out=T.parseTime(entry.outTime);
  const latency=T.number(entry.latency,0,600),partial=entry.waso===""||entry.waso===null||entry.waso===undefined;
  const waso=partial?0:T.number(entry.waso,0,600);
  const before=T.forward(bed,attempt),night=T.forward(attempt,wake),after=T.forward(wake,out);
  const tib=before+night+after,tst=night-latency-waso;
  if([bed,attempt,wake,out,latency,waso,tib,tst].some(x=>!Number.isFinite(x))||
     !Number.isInteger(latency)||!Number.isInteger(waso)||night<1||before>360||after>360||
     tib<60||tib>1080||tst<0||tst>tib)
   throw Error("La scheda locale del giorno "+(index+1)+" contiene dati incoerenti.");
  const quality=entry.quality===""?null:Number(entry.quality);
  records.push({day:index+1,date:entry.wakeDate||"",bed:entry.bedTime,wake:entry.finalWake,
   tib,tst,latency,quality:Number.isInteger(quality)&&quality>=1&&quality<=5?quality:null,partial});
 });
 if(!records.length)throw Error("Nel salvataggio non sono presenti notti compilate.");
 return records;
}
// Ampiezza dell'arco orario più breve contenente tutte le ore: attraversa mezzanotte.
function clockSpread(times){
 if(times.length<2)return null;
 const a=times.slice().sort((x,y)=>x-y),gaps=[];
 for(let i=1;i<a.length;i++)gaps.push(a[i]-a[i-1]);
 gaps.push(a[0]+1440-a[a.length-1]);
 return 1440-Math.max(...gaps);
}
// Questi intervalli sono SOLO etichette visive editoriali per descrivere
// l'oscillazione osservata: NON sono cutoff clinici o una scala validata.
function overviewModel(data){
 const nights=data.length;
 const bedSpread=clockSpread(data.map(x=>T.parseTime(x.bed)));
 const wakeSpread=clockSpread(data.map(x=>T.parseTime(x.wake)));
 const maxSpread=bedSpread===null||wakeSpread===null?null:Math.max(bedSpread,wakeSpread);
 const avgSleep=T.mean(data.map(x=>x.tst));
 const partialNights=data.filter(x=>x.partial).length;
 const completeNights=nights-partialNights;
 const first=data.filter(x=>x.day<=7),second=data.filter(x=>x.day>=8);
 const firstMean=T.mean(first.map(x=>x.tst)),secondMean=T.mean(second.map(x=>x.tst));
 const enoughFirst=first.length>=3,enoughSecond=second.length>=3;
 const difference=firstMean===null||secondMean===null?null:secondMean-firstMean;
 let regularityLabel="Poche notti registrate";
 if(nights>=4&&maxSpread!==null){
  if(maxSpread<=45)regularityLabel="Orari abbastanza vicini";
  else if(maxSpread<=90)regularityLabel="Orari un po' variabili";
  else regularityLabel="Orari molto variabili";
 }
 let trendLabel="Non confrontabile",trendSymbol="—",trendType="neutral";
 if(enoughFirst&&enoughSecond){
  if(difference>=15){trendLabel="Durata stimata in aumento";trendSymbol="↗";trendType="up"}
  else if(difference<=-15){trendLabel="Durata stimata in diminuzione";trendSymbol="↘";trendType="down"}
  else{trendLabel="Durata quasi invariata";trendSymbol="→";trendType="flat"}
 }
 return {nights,bedSpread,wakeSpread,maxSpread,regularityLabel,avgSleep,partialNights,completeNights,
  firstCount:first.length,secondCount:second.length,firstMean,secondMean,
  difference,enoughTrend:enoughFirst&&enoughSecond,trendLabel,trendSymbol,trendType};
}
function overviewCard(parent,kicker,title,value,state){
 const card=add(parent,"section","pro-signal");
 add(card,"p","pro-signal-kicker",kicker);
 add(card,"h3","pro-signal-title",title);
 add(card,"strong","pro-signal-value",value);
 add(card,"div","pro-signal-state",state);
 return card;
}
function overviewGraphic(parent,model,data,isDemo){
 const hero=add(parent,"div","pro-dashboard");
 hero.setAttribute("aria-label","Riepilogo visivo del diario");
 if(isDemo)add(hero,"div","pro-demo-flag","ESEMPIO DIMOSTRATIVO · DATI INVENTATI");
 const heading=add(hero,"div","pro-dashboard-intro");
 add(heading,"span","pro-dashboard-overline","IL TUO SONNO IN 14 NOTTI");
 add(heading,"h3","","Tre segnali. Un quadro più chiaro.");
 add(heading,"p","","Sono confronti descrittivi basati sui dati compilati, non voti, diagnosi o valutazioni mediche.");
 const trio=add(hero,"div","pro-signal-grid");
 // Regolarità degli orari: confronto delle ore di letto e sveglia,
 // con scala visiva ancorata a 3 ore; nessuna soglia di qualità clinica.
 const regularity=overviewCard(trio,"01 / REGOLARITÀ","Quanto cambiano gli orari?",
   model.maxSpread===null?"—":T.fmtMinutes(model.maxSpread),model.regularityLabel);
 const regScale=add(regularity,"div","pro-scale");
 const regTrack=add(regScale,"div","pro-scale-track");
 add(regTrack,"span","pro-scale-fill").style.width=(model.maxSpread===null?0:Math.min(100,model.maxSpread/180*100))+"%";
 add(regScale,"div","pro-scale-labels","0 min                              3 ore o più");
 add(regularity,"p","pro-card-note","Differenza massima degli orari registrati, considerando sia quando vai a letto sia il risveglio finale. Fasce descrittive, non soglie cliniche.");
 // Durata media del sonno: una scala di lettura 0-12 h, non un obiettivo.
 const duration=overviewCard(trio,"02 / DURATA","Quanto dormi mediamente?",
  T.fmtMinutes(model.avgSleep)+(model.partialNights?" *":""),"Media stimata da "+model.nights+" notti");
 const durScale=add(duration,"div","pro-scale");
 const durTrack=add(durScale,"div","pro-scale-track");
 add(durTrack,"span","pro-scale-fill").style.width=Math.min(100,model.avgSleep/720*100)+"%";
 add(durScale,"div","pro-scale-labels","0 ore                                12 ore");
 add(duration,"p","pro-card-note",model.partialNights?
  "Asterisco: in alcune notti mancano i minuti dei risvegli, quindi questa media può sovrastimare il sonno.":
  "Durata orientativa derivata dagli orari e dai risvegli dichiarati. La scala non è un obiettivo di sonno.");
 // Completezza, evitando di suggerire di conoscere la continuità se non è stata annotata.
 const completeness=overviewCard(trio,"03 / RISVEGLI","Quanto sappiamo dei risvegli?",
  model.completeNights+" / "+model.nights+" notti","Con durata dei risvegli indicata");
 const dots=add(completeness,"div","pro-night-dots");
 dots.setAttribute("role","list");
 for(let i=1;i<=14;i++){
  const d=data.find(x=>x.day===i),cls=d?(d.partial?"pro-dot-partial":"pro-dot-complete"):"pro-dot-empty";
  const dot=add(dots,"span","pro-night-dot "+cls,String(i).padStart(2,"0"));
  dot.setAttribute("role","listitem");
  dot.setAttribute("aria-label","Notte "+i+": "+(d?(d.partial?"durata dei risvegli non indicata":"durata dei risvegli indicata"):"non compilata"));
  dot.title=dot.getAttribute("aria-label");
 }
 const legend=add(completeness,"div","pro-dots-legend");
 [["pro-dot-complete","Risvegli indicati"],["pro-dot-partial","Stima parziale"],["pro-dot-empty","Non compilata"]].forEach(([cls,label])=>{
  const itemEl=add(legend,"span","");add(itemEl,"i",cls);add(itemEl,"span","",label);
 });
 add(completeness,"p","pro-card-note","La presenza di una stima non misura quanto bene hai dormito: indica solo se i risvegli sono stati annotati.");
 const trend=add(hero,"div","pro-trend");
 const header=add(trend,"div","pro-trend-heading");
 const h=add(header,"div","");
 add(h,"span","pro-dashboard-overline","04 / CONFRONTO");
 add(h,"h3","","Prima e seconda settimana");
 const outcome=add(header,"div","pro-trend-outcome pro-trend-"+model.trendType);
 add(outcome,"span","pro-trend-arrow",model.trendSymbol);
 add(outcome,"strong","",model.trendLabel);
 if(model.difference!==null){
  add(outcome,"small","",
   (model.difference>=0?"+":"−")+T.fmtMinutes(Math.abs(model.difference))+" di sonno medio stimato");
 }else add(outcome,"small","","Occorrono notti registrate in entrambe le settimane.");
 const bars=add(trend,"div","pro-week-bars");
 for(const [week,label,n,average] of [[1,"Giorni 1–7",model.firstCount,model.firstMean],[2,"Giorni 8–14",model.secondCount,model.secondMean]]){
  const row=add(bars,"div","pro-week");
  const labels=add(row,"div","pro-week-title");
  add(labels,"span","",label+" · "+n+" nott"+(n===1?"e":"i")+" registrat"+(n===1?"a":"e"));
  add(labels,"strong","",average===null?"—":T.fmtMinutes(average));
  const track=add(row,"div","pro-week-track");
  add(track,"span","pro-week-fill "+(week===2?"pro-week-second":"")).style.width=
    (average===null?0:Math.max(0,Math.min(100,average/720*100)))+"%";
 }
 add(trend,"p","pro-trend-note",
  model.enoughTrend?
   "Confronto delle medie di almeno tre notti per settimana. La freccia indica soltanto una variazione delle ore stimate, non un miglioramento o peggioramento del sonno.":
   "Confronto solo descrittivo: servono almeno tre notti compilate in ciascuna settimana per mostrare una freccia di andamento.");
 if(model.partialNights)add(trend,"p","pro-trend-caution",
  "Attenzione: "+model.partialNights+" nott"+(model.partialNights===1?"e":"i")+" con risvegli non quantificati. Le medie possono essere sovrastimate.");
 const foot=add(hero,"p","pro-dashboard-footnote",
  "Le etichette di regolarità (entro 45 minuti, 45–90 minuti, oltre 90 minuti) sono categorie grafiche descrittive scelte per questo prototipo. Non sono una scala clinica validata. Nessun indicatore misura la salute del sonno da solo.");
 return hero;
}
function demoNights(){
 const bedtime=["23:50","00:05","23:35","00:15","23:45","00:00","23:20",
  "23:10","23:15","23:05","23:10","22:55","23:05","22:50"];
 const wake=["07:05","07:20","06:50","07:30","07:10","07:30","07:00",
  "07:10","07:00","07:20","07:30","07:20","07:25","07:00"];
 const minutes=[382,398,375,411,391,415,404,428,444,421,450,462,443,454];
 return Array.from({length:14},(_,i)=>({
  day:i+1,date:"",bed:bedtime[i],wake:wake[i],
  tib:520,tst:minutes[i],latency:20,
  quality:[3,3,2,3,3,3,3,3,4,3,4,4,4,4][i],
  partial:i===3||i===10
 }));
}
function render(data,source,isDemo=false){
 rows=data;clear(result);
 $("pro-report").hidden=false;
 const dashboard=overviewModel(data);
 overviewGraphic(result,dashboard,data,isDemo);
 const details=add(result,"div","pro-details");
 add(details,"h3","pro-details-title","I numeri, nel dettaglio");
 add(details,"p","pro-details-intro","Qui trovi tutte le medie e le 14 notti da cui nasce il quadro visivo.");
 const total=data.length,partial=data.filter(x=>x.partial).length;
 const means=T.mean(data.map(x=>x.tst)),eff=T.mean(data.map(x=>x.tst/x.tib*100));
 const qualities=data.filter(x=>x.quality!==null).map(x=>x.quality);
 const bedtimeSpread=clockSpread(data.map(x=>T.parseTime(x.bed)));
 const wakingSpread=clockSpread(data.map(x=>T.parseTime(x.wake)));
 add(details,"div","st-tag","REPORT DESCRITTIVO · "+total+" NOTTI");
 add(details,"h3","st-result-title","Il tuo quadro, senza diagnosi");
 const summary=add(details,"div","st-metric-grid");
 metric(summary,"Notti registrate",total+" / 14");
 metric(summary,"Sonno stimato medio",T.fmtMinutes(means)+(partial?" *":""));
 metric(summary,"Efficienza stimata",T.round(eff)+"%"+(partial?" *":""));
 metric(summary,"Latenza dichiarata media",T.round(T.mean(data.map(x=>x.latency)))+" min");
 metric(summary,"Qualità percepita",qualities.length?T.round(T.mean(qualities),1)+" / 5":"Non indicata");
 metric(summary,"Stime parziali",partial+" / "+total);
 add(details,"h3","st-result-title","Una barra per ogni notte");
 const graph=add(details,"div","st-bars");
 for(let day=1;day<=14;day++){
  const d=data.find(x=>x.day===day),cell=add(graph,"div","st-bar-cell");
  if(d){
   const bar=add(cell,"span","st-bar"+(d.partial?" partial":""));
   bar.style.height=Math.max(3,Math.min(135,d.tst/720*135))+"px";
   cell.title="Giorno "+day+": "+T.fmtMinutes(d.tst)+(d.partial?" (stima parziale)":"");
  }else add(cell,"span",""," ");
  add(cell,"small","",day);
 }
 add(details,"p","st-chart-legend","Barre tratteggiate: minuti dei risvegli non dichiarati e non sottratti. Altezze orientative, non obiettivi.");
 item(details,"Variazione degli orari di coricamento",bedtimeSpread===null?"Servono almeno due notti.":"Ampiezza oraria osservata: "+T.fmtMinutes(bedtimeSpread)+". Non indica il cronotipo.");
 item(details,"Variazione dei risvegli finali",wakingSpread===null?"Servono almeno due notti.":"Ampiezza oraria osservata: "+T.fmtMinutes(wakingSpread)+". Può essere influenzata da turni e giorni liberi.");
 const first=data.filter(x=>x.day<=7),second=data.filter(x=>x.day>=8);
 if(first.length&&second.length){
  const a=T.mean(first.map(x=>x.tst)),b=T.mean(second.map(x=>x.tst)),delta=b-a;
  item(details,"Confronto dei due blocchi settimanali",
   "Notti 1–7: "+T.fmtMinutes(a)+" (su "+first.length+" registrazioni); notti 8–14: "+
   T.fmtMinutes(b)+" (su "+second.length+" registrazioni). Differenza: "+
   (delta>=0?"+":"−")+T.fmtMinutes(Math.abs(delta))+
   ". Un aumento della durata non significa necessariamente miglioramento.");
 }else item(details,"Confronto delle due settimane","Disponibile quando registri almeno una notte per ciascuno dei due blocchi.");
 if(partial)note(details,partial+" notte/i su "+total+" non includono una stima dei risvegli. Per tali notti la durata potrebbe essere sovrastimata. Le medie mescolano stime complete e parziali.",true);
 note(details,"Dati elaborati da "+source+" sul tuo dispositivo. Questo report esclude le note personali. Non è una misurazione clinica.");
 report="DIARIO DEL SONNO PRO — Dott. Roberto Boscia\n"+
  (isDemo?"ESERCIZIO DIMOSTRATIVO — 14 NOTTI INVENTATE, NON DATI REALI\n":"")+
  result.innerText+"\n\nDocumento educativo e orientativo, non diagnostico.";
 actions.hidden=false;
 status("pro-status","Importate "+total+" notti da "+source+". Puoi scaricare il report o stamparlo.");
 result.scrollIntoView({behavior:"smooth",block:"start"});
}
function invalidateReport(){
 rows=[];report="";clear(result);actions.hidden=true;$("pro-report").hidden=true;
}
$("pro-demo").addEventListener("click",()=>{
 invalidateReport();$("pro-file").value="";
 render(demoNights(),"14 notti completamente inventate",true);
});
$("pro-file").addEventListener("change",async event=>{
 invalidateReport();
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>1024*1024){status("pro-status","File oltre 1 MB. Seleziona un CSV del Diario del Sonno.",true);return}
 try{render(importCSV(await file.text()),"CSV selezionato")}
 catch(error){status("pro-status","Importazione fallita: "+error.message,true)}
});
$("pro-local").addEventListener("click",()=>{
 invalidateReport();
 try{render(importSaved(),"schede salvate nel browser")}
 catch(error){status("pro-status","Lettura non riuscita: "+error.message,true)}
});
$("pro-clear").addEventListener("click",()=>{
 invalidateReport();$("pro-file").value="";
 status("pro-status","Report rimosso dalla pagina. Le schede del diario originale non sono state cancellate.");
});
$("pro-txt").addEventListener("click",()=>{if(rows.length)T.saveFile("Report_Sonno_PRO.txt",report)});
T.print("pro-print");
})();