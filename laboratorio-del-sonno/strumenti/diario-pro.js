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
function render(data,source){
 rows=data;clear(result);
 const total=data.length,partial=data.filter(x=>x.partial).length;
 const means=T.mean(data.map(x=>x.tst)),eff=T.mean(data.map(x=>x.tst/x.tib*100));
 const qualities=data.filter(x=>x.quality!==null).map(x=>x.quality);
 const bedtimeSpread=clockSpread(data.map(x=>T.parseTime(x.bed)));
 const wakingSpread=clockSpread(data.map(x=>T.parseTime(x.wake)));
 add(result,"div","st-tag","REPORT DESCRITTIVO · "+total+" NOTTI");
 add(result,"h3","st-result-title","Il tuo quadro, senza diagnosi");
 const summary=add(result,"div","st-metric-grid");
 metric(summary,"Notti registrate",total+" / 14");
 metric(summary,"Sonno stimato medio",T.fmtMinutes(means)+(partial?" *":""));
 metric(summary,"Efficienza stimata",T.round(eff)+"%"+(partial?" *":""));
 metric(summary,"Latenza dichiarata media",T.round(T.mean(data.map(x=>x.latency)))+" min");
 metric(summary,"Qualità percepita",qualities.length?T.round(T.mean(qualities),1)+" / 5":"Non indicata");
 metric(summary,"Stime parziali",partial+" / "+total);
 add(result,"h3","st-result-title","Una barra per ogni notte");
 const graph=add(result,"div","st-bars");
 for(let day=1;day<=14;day++){
  const d=data.find(x=>x.day===day),cell=add(graph,"div","st-bar-cell");
  if(d){
   const bar=add(cell,"span","st-bar"+(d.partial?" partial":""));
   bar.style.height=Math.max(3,Math.min(135,d.tst/720*135))+"px";
   cell.title="Giorno "+day+": "+T.fmtMinutes(d.tst)+(d.partial?" (stima parziale)":"");
  }else add(cell,"span",""," ");
  add(cell,"small","",day);
 }
 add(result,"p","st-chart-legend","Barre tratteggiate: minuti dei risvegli non dichiarati e non sottratti. Altezze orientative, non obiettivi.");
 item(result,"Variazione degli orari di coricamento",bedtimeSpread===null?"Servono almeno due notti.":"Ampiezza oraria osservata: "+T.fmtMinutes(bedtimeSpread)+". Non indica il cronotipo.");
 item(result,"Variazione dei risvegli finali",wakingSpread===null?"Servono almeno due notti.":"Ampiezza oraria osservata: "+T.fmtMinutes(wakingSpread)+". Può essere influenzata da turni e giorni liberi.");
 const first=data.filter(x=>x.day<=7),second=data.filter(x=>x.day>=8);
 if(first.length&&second.length){
  const a=T.mean(first.map(x=>x.tst)),b=T.mean(second.map(x=>x.tst)),delta=b-a;
  item(result,"Confronto dei due blocchi settimanali",
   "Notti 1–7: "+T.fmtMinutes(a)+" (su "+first.length+" registrazioni); notti 8–14: "+
   T.fmtMinutes(b)+" (su "+second.length+" registrazioni). Differenza: "+
   (delta>=0?"+":"−")+T.fmtMinutes(Math.abs(delta))+
   ". Un aumento della durata non significa necessariamente miglioramento.");
 }else item(result,"Confronto delle due settimane","Disponibile quando registri almeno una notte per ciascuno dei due blocchi.");
 if(partial)note(result,partial+" notte/i su "+total+" non includono una stima dei risvegli. Per tali notti la durata potrebbe essere sovrastimata. Le medie mescolano stime complete e parziali.",true);
 note(result,"Dati elaborati da "+source+" sul tuo dispositivo. Questo report esclude le note personali. Non è una misurazione clinica.");
 report="DIARIO DEL SONNO PRO — Dott. Roberto Boscia\n"+
  result.innerText+"\n\nDocumento educativo e orientativo, non diagnostico.";
 actions.hidden=false;
 status("pro-status","Importate "+total+" notti da "+source+". Puoi scaricare il report o stamparlo.");
 result.scrollIntoView({behavior:"smooth",block:"start"});
}
function invalidateReport(){
 rows=[];report="";clear(result);actions.hidden=true;
}
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
 rows=[];report="";clear(result);$("pro-file").value="";actions.hidden=true;
 status("pro-status","Report rimosso dalla pagina. Le schede del diario originale non sono state cancellate.");
});
$("pro-txt").addEventListener("click",()=>{if(rows.length)T.saveFile("Report_Sonno_PRO.txt",report)});
T.print("pro-print");
})();