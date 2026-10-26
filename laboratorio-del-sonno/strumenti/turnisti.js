/* Turni & Sonno: pianificazione educativa di opportunità di riposo, non prescrizione. */
(() => {
"use strict";
const T=window.SleepLabTools;if(!T)return;
const {$,add,clear,status,metric,item,note}={
 $:T.$,add:T.add.bind(T),clear:T.clear.bind(T),status:T.status.bind(T),
 metric:T.metric.bind(T),item:T.item.bind(T),note:T.note.bind(T)
};
const options=[
 ["m","Mattina · 06–14"],["p","Pomeriggio · 14–22"],["n","Notte · 22–06"],
 ["off","Riposo"],["custom","Personalizzato"]
];
const preset={m:["06:00","14:00"],p:["14:00","22:00"],n:["22:00","06:00"],off:["",""],custom:["09:00","17:00"]};
const body=$("shift-days"),result=$("shift-result"),actions=$("shift-actions");let current=[];
function createWeek(){
 clear(body);
 for(let i=0;i<7;i++){
  const row=add(body,"tr"),th=add(row,"th","","Giorno "+(i+1));th.scope="row";
  const typeCell=add(row,"td"),kind=add(typeCell,"select");kind.setAttribute("aria-label","Tipo turno giorno "+(i+1));
  for(const [val,label] of options){const opt=add(kind,"option","",label);opt.value=val}
  const startCell=add(row,"td"),start=add(startCell,"input");start.type="time";start.setAttribute("aria-label","Inizio turno giorno "+(i+1));
  const endCell=add(row,"td"),end=add(endCell,"input");end.type="time";end.setAttribute("aria-label","Fine turno giorno "+(i+1));
  function presetHours(){const [a,b]=preset[kind.value];start.value=a;end.value=b;start.disabled=kind.value==="off";end.disabled=kind.value==="off"}
  kind.value=i>=5?"off":i===4?"p":"m";presetHours();kind.addEventListener("change",presetHours);
 }
}
function dayLabel(base,i){
 if(!base)return "Giorno "+(i+1);
 const d=new Date(base+"T12:00:00");
 if(Number.isNaN(d.valueOf()))return "Giorno "+(i+1);
 d.setDate(d.getDate()+i);
 return d.toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"2-digit"});
}
function analyze(){
 const commute=T.number($("shift-commute").value,0,180);
 if(!Number.isInteger(commute))throw Error("Inserisci da 0 a 180 minuti per il rientro a casa.");
 const date=$("shift-date").value;
 if(date&&!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))throw Error("La data iniziale non è valida.");
 const days=[];
 for(const [i,tr] of [...body.querySelectorAll("tr")].entries()){
  const type=tr.querySelector("select").value;
  const times=[...tr.querySelectorAll('input[type="time"]')];
  const label=dayLabel(date,i);
  if(type==="off"){
   days.push({day:i+1,label,type,start:"",end:"",rest:null,duration:0,
    window:"Giorno libero: pianifica opportunità di riposo e recupero compatibili con le tue esigenze."});
   continue;
  }
  const a=T.parseTime(times[0].value),b=T.parseTime(times[1].value);
  if(!Number.isFinite(a)||!Number.isFinite(b)||a===b)
   throw Error("Nel giorno "+(i+1)+" l'inizio e la fine del turno devono essere orari validi e diversi.");
  const duration=T.forward(a,b);
  if(duration>960)throw Error("Il turno del giorno "+(i+1)+" supera 16 ore: verifica il giorno di fine turno.");
  days.push({day:i+1,label,type,start:times[0].value,end:times[1].value,
   startAbs:i*1440+a,endAbs:i*1440+a+duration,duration,rest:null});
 }
 let previous=null;
 for(const d of days){
  if(d.type==="off")continue;
  d.rest=previous?d.startAbs-previous.endAbs:null;
  previous=d;
  let from;
  const crossesMidnight=d.endAbs%1440<d.startAbs%1440;
  if(d.type==="n"||crossesMidnight)from=d.endAbs+commute+45;
  else if(d.type==="m"||d.startAbs%1440<600)from=d.startAbs-540;
  else from=d.endAbs+commute+45;
  d.window="Finestra indicativa da proteggere: "+T.time(from)+"–"+T.time(from+450)+
   ". È uno spazio teorico di 7 h 30 min, non il sonno previsto.";
 }
 return days;
}
function render(days){
 current=days;clear(result);
 const work=days.filter(d=>d.type!=="off"),short=work.filter(d=>d.rest!==null&&d.rest<660);
 add(result,"div","st-tag","CALENDARIO DESCRITTIVO · SETTE GIORNI");
 add(result,"h3","st-result-title","La tua settimana di turni");
 const stats=add(result,"div","st-metric-grid");
 metric(stats,"Giorni lavorati",work.length+" / 7");
 metric(stats,"Giorni di riposo",7-work.length);
 metric(stats,"Intervalli sotto 11 ore",short.length);
 metric(stats,"Durata turni complessiva",T.round(work.reduce((s,x)=>s+x.duration,0)/60,1)+" h");
 const scroll=add(result,"div","st-table-scroll"),table=add(scroll,"table","st-table"),header=add(table,"thead");
 const headrow=add(header,"tr");["Giorno","Turno","Intervallo precedente"].forEach(x=>add(headrow,"th","",x));
 const tbody=add(table,"tbody");
 for(const d of days){
  const r=add(tbody,"tr");add(r,"td","",d.label);
  add(r,"td","",d.type==="off"?"Riposo":d.start+"–"+d.end);
  const rest=d.type==="off"?"—":d.rest===null?"Primo turno":d.rest<0?"Sovrapposizione":T.fmtMinutes(d.rest);
  add(r,"td",d.rest!==null&&d.rest<660?"st-bad":"",rest);
 }
 add(result,"h3","st-result-title","Possibili finestre di riposo");
 for(const d of days)item(result,d.label+(d.type==="off"?" · riposo":" · "+d.start+"–"+d.end),d.window);
 if(short.length)note(result,short.length+" intervallo/i di riposo sono inferiori a 11 ore o si sovrappongono. È soltanto un avviso organizzativo: non equivale a una verifica legale o contrattuale dei turni.",true);
 note(result,"Le finestre da 7 h 30 min sono esempi di tempo da proteggere, non prescrizioni personalizzate. Non considerano reperibilità, traffico, pause, famiglia, straordinari o cambi dell'ora.");
 actions.hidden=false;
 status("shift-status","Piano calcolato. Puoi stamparlo o esportare il riepilogo in CSV.");
 result.scrollIntoView({behavior:"smooth",block:"start"});
}
function invalidateResult(){
 if(current.length||result.children.length){
  current=[];clear(result);actions.hidden=true;
  status("shift-status","Turni modificati: premi «Analizza i turni» per aggiornare il piano.");
 }
}
$("shift-form").addEventListener("input",invalidateResult);
$("shift-form").addEventListener("change",invalidateResult);
$("shift-form").addEventListener("submit",event=>{
 event.preventDefault();
 try{render(analyze())}catch(e){status("shift-status",e.message,true)}
});
$("shift-form").addEventListener("reset",()=>setTimeout(()=>{
 createWeek();clear(result);current=[];actions.hidden=true;status("shift-status","");
},0));
$("shift-export").addEventListener("click",()=>{
 if(!current.length)return;
 const data=[["Giorno","Etichetta data","Tipo","Inizio","Fine","Lavoro minuti","Pausa precedente minuti","Finestra orientativa"]];
 current.forEach(d=>data.push([d.day,d.label,d.type,d.start,d.end,d.duration||0,d.rest===null?"":d.rest,d.window]));
 const csv="\uFEFF"+data.map(row=>row.map(x=>T.csvQuote(x)).join(";")).join("\r\n");
 T.saveFile("Turni_e_Sonno_7_Giorni.csv",csv,"text/csv;charset=utf-8");
});
createWeek();T.print("shift-print");
})();