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
function relativeDay(abs,turnDay){
 const offset=Math.floor(abs/1440)-(turnDay-1);
 if(offset===-1)return "giorno precedente";
 if(offset===0)return "giorno del turno";
 if(offset===1)return "giorno seguente";
 if(offset===2)return "due giorni dopo";
 return offset<0?Math.abs(offset)+" giorni prima":offset+" giorni dopo";
}
function analyze(){
 const commute=T.number($("shift-commute").value,0,180);
 if(!Number.isInteger(commute)){
  $("shift-commute").setAttribute("aria-invalid","true");$("shift-commute").focus();
  throw Error("Inserisci da 0 a 180 minuti per il rientro a casa.");
 }
 const date=$("shift-date").value;
 if(date&&!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)){
  $("shift-date").setAttribute("aria-invalid","true");$("shift-date").focus();
  throw Error("La data iniziale non è valida.");
 }
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
  if(!Number.isFinite(a)||!Number.isFinite(b)||a===b){
   times.forEach(field=>field.setAttribute("aria-invalid","true"));times[0].focus();
   throw Error("Nel giorno "+(i+1)+" l'inizio e la fine del turno devono essere orari validi e diversi.");
  }
  const duration=T.forward(a,b);
  if(duration>960){
   times.forEach(field=>field.setAttribute("aria-invalid","true"));times[0].focus();
   throw Error("Il turno del giorno "+(i+1)+" supera 16 ore: verifica il giorno di fine turno.");
  }
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
  const until=from+450;
  d.windowStart=from;d.windowEnd=until;
  d.window="Finestra indicativa da proteggere: dalle "+T.time(from)+" ("+relativeDay(from,d.day)+")"+
   " alle "+T.time(until)+" ("+relativeDay(until,d.day)+"). "+
   "È uno spazio teorico di 7 h 30 min, non il sonno previsto.";
 }
 // Una finestra non può essere presentata come disponibile se intercetta
 // un altro turno già inserito (es. notte seguita subito da mattina).
 for(const d of days){
  if(d.type==="off")continue;
  const conflict=days.find(other=>other!==d&&other.type!=="off"&&
    other.startAbs<d.windowEnd&&other.endAbs>d.windowStart);
  if(conflict){
   d.conflictDay=conflict.day;
   d.window="Finestra ipotetica NON DISPONIBILE: dalle "+T.time(d.windowStart)+
    " ("+relativeDay(d.windowStart,d.day)+") alle "+T.time(d.windowEnd)+
    " ("+relativeDay(d.windowEnd,d.day)+"). Si sovrappone al turno di "+
    conflict.label+" ("+conflict.start+"–"+conflict.end+"). "+
    "Non considerarla un'opportunità reale di riposo.";
  }
 }
 // Le finestre vicine al limite dei sette giorni possono riferirsi
 // a turni non inseriti: non le presentiamo come certamente disponibili.
 for(const d of days){
  if(d.type==="off"||d.conflictDay)continue;
  if(d.windowStart<0||d.windowEnd>7*1440){
   d.scopeUnknown=true;
   d.window="DA CONFERMARE: "+d.window+
    " La finestra tocca giorni fuori dalla settimana registrata: potresti avere altri turni non inseriti.";
  }
 }
 return days;
}
function shiftName(type){
 return {m:"Mattina",p:"Pomeriggio",n:"Notte",custom:"Personalizzato",off:"Riposo"}[type]||"Turno";
}
function weekSegments(days,index){
 const start=index*1440,end=start+1440,segments=[];
 days.filter(d=>d.type!=="off").forEach(d=>{
  const from=Math.max(start,d.startAbs),to=Math.min(end,d.endAbs);
  if(to>from){
   segments.push({
    day:d.day,type:d.type,label:d.label,start:from,end:to,
    from:(from-start)/1440*100,width:(to-from)/1440*100,
    rollover:from>d.startAbs||to<d.endAbs
   });
  }
 });
 // Assegniamo corsie separate se due turni sono stati inseriti
 // sovrapposti, così nessuna fascia nasconde l'altra.
 segments.sort((a,b)=>a.start-b.start||a.end-b.end);
 const lanes=[];
 segments.forEach(s=>{
  let lane=lanes.findIndex(finish=>finish<=s.start);
  if(lane===-1){lane=lanes.length;lanes.push(0)}
  lanes[lane]=s.end;s.lane=lane;
 });
 return {segments,laneCount:Math.max(1,lanes.length)};
}
function renderTimeline(parent,days){
 const section=add(parent,"section","shift-timeline-section");
 section.setAttribute("aria-label","Settimana rappresentata sulle 24 ore di ogni giornata");
 const title=add(section,"div","shift-section-heading");
 add(title,"span","shift-kicker","LA SETTIMANA VISIVA");
 add(title,"h3","","Quando lavori, giorno per giorno.");
 add(title,"p","","Ogni riga rappresenta le 24 ore di un giorno. Se un turno attraversa mezzanotte, continua nella riga successiva. Le zone senza colore NON indicano necessariamente che stai dormendo.");
 const legend=add(section,"div","shift-legend");
 for(const [type,label] of [["m","Mattina"],["p","Pomeriggio"],["n","Notte"],["custom","Personalizzato"]]){
  const element=add(legend,"span","");
  add(element,"i","shift-legend-color shift-bg-"+type).setAttribute("aria-hidden","true");
  add(element,"span","",label);
 }
 const hours=add(section,"div","shift-hour-scale");
 const spacer=add(hours,"span","shift-hour-label","");
 const nums=add(hours,"div","shift-hours");
 ["00","06","12","18","24"].forEach(label=>add(nums,"span","",label));
 const grid=add(section,"div","shift-timeline");
 const max=days.reduce((n,d)=>Math.max(n,d.endAbs||0),0);
 const rows=Math.max(7,Math.min(8,Math.ceil(max/1440)));
 for(let index=0;index<rows;index++){
  const row=add(grid,"div","shift-day-row");
  const day=days[index],label=day?day.label:"Giorno 8";
  const {segments,laneCount}=weekSegments(days,index);
  const lab=add(row,"div","shift-day-label");
  add(lab,"strong","",label);
  const offWithWork=day?.type==="off"&&segments.length>0;
  const dayInfo=index===7?"Prosegue il turno notturno":
    offWithWork?"Riposo indicato · finisce turno precedente":
    day?.type==="off"?"Segnato riposo":shiftName(day?.type);
  add(lab,"small","",dayInfo);
  const bar=add(row,"div","shift-day-track");
  if(offWithWork)row.classList.add("shift-day-rollover");
  bar.style.minHeight=(laneCount*21+12)+"px";
  if(!segments.length){
   const empty=add(bar,"span","shift-day-empty","Nessun turno indicato");
   empty.setAttribute("aria-label","Nessun turno indicato nelle 24 ore di questa giornata");
  }
  for(const seg of segments){
   const tile=add(bar,"span","shift-timeline-segment shift-bg-"+seg.type);
   tile.style.left=seg.from+"%";tile.style.width=seg.width+"%";tile.style.top=(5+seg.lane*21)+"px";
   tile.title=shiftName(seg.type)+" — "+seg.label+" — "+T.time(seg.start)+"–"+T.time(seg.end)+
    (seg.rollover?" (prosegue oltre mezzanotte)":"");
   tile.setAttribute("aria-label",tile.title);
   tile.setAttribute("role","img");
   if(seg.width>11)add(tile,"span","",T.time(seg.start));
  }
 }
 add(section,"p","shift-timeline-help","Il giorno 8 compare solo se l'ultimo turno termina dopo mezzanotte. Le fasce sono occupazione oraria, non un grafico delle fasi del sonno.");
}
function renderRest(parent,days){
 const section=add(parent,"section","shift-rest-section");
 const heading=add(section,"div","shift-section-heading");
 add(heading,"span","shift-kicker","LE FINESTRE POSSIBILI");
 add(heading,"h3","","Quando potresti proteggere il riposo.");
 add(heading,"p","","Le fasce sono esempi di spazio libero da valutare, non orari prescritti. Per un turno mattutino il modello considera la sera precedente; dopo gli altri turni considera il rientro a casa più 45 minuti illustrativi.");
 const rows=add(section,"div","shift-rest-grid");
 for(const d of days){
  const info=add(rows,"article","shift-rest-card"+
   (d.conflictDay?" shift-rest-conflict":d.scopeUnknown?" shift-rest-outside":d.type==="off"?" shift-rest-off":""));
  const h=add(info,"div","shift-rest-card-title");
  add(h,"strong","",d.label+" · "+(d.type==="off"?"Riposo":d.start+"–"+d.end));
  const mark=d.type==="off"?"GIORNO INDICATO COME RIPOSO":
    d.conflictDay?"SI SOVRAPPONE A UN TURNO":
    d.scopeUnknown?"DA CONFERMARE":"FINESTRA ILLUSTRATIVA";
  add(h,"span","shift-rest-tag",mark);
  add(info,"p","",d.window);
 }
}
function render(days,isDemo=false){
 current=days;clear(result);
 $("shift-report").hidden=false;
 const work=days.filter(d=>d.type!=="off");
 const short=work.filter(d=>d.rest!==null&&d.rest<660);
 const overlaps=work.filter(d=>d.rest!==null&&d.rest<0);
 const conflicts=work.filter(d=>d.conflictDay);
 const unknown=work.filter(d=>d.scopeUnknown);
 if(isDemo)add(result,"div","shift-demo-flag","ESEMPIO DIMOSTRATIVO · SETTIMANA INVENTATA");
 add(result,"div","st-tag","RIEPILOGO DESCRITTIVO · SETTE GIORNI");
 const overview=add(result,"div","shift-overview");
 const metrics=add(overview,"div","shift-stats");
 metric(metrics,"Turni inseriti",work.length);
 metric(metrics,"Giorni indicati come riposo",7-work.length);
 metric(metrics,"Ore lavorate inserite",T.round(work.reduce((s,d)=>s+d.duration,0)/60,1)+" h");
 metric(metrics,"Pause fra turni inferiori a 11 ore",short.length);
 const takeaway=add(overview,"div","shift-takeaway"+
  (short.length||conflicts.length?" shift-takeaway-alert":""));
 const title=work.length===0?
  "Nessun turno di lavoro inserito":
  work.length===1?
  "Un turno inserito: non abbiamo una pausa da confrontare":
  overlaps.length?
  "Ci sono turni che si sovrappongono":
  short.length?
  "Alcune pause fra turni meritano attenzione":
  conflicts.length?
  "Alcune finestre di riposo si sovrappongono ai turni":
  "Non emergono pause ravvicinate nei turni inseriti";
 add(takeaway,"strong","",title);
 let desc="Il calcolo descrive soltanto gli orari registrati e non certifica la conformità contrattuale né la qualità del sonno.";
 if(short.length)desc="Hai "+short.length+" intervall"+(short.length===1?"o":"i")+
  " inferior"+(short.length===1?"e":"i")+" a 11 ore tra turni successivi. È un segnale organizzativo da verificare, non una diagnosi né una valutazione legale.";
 else if(!work.length)desc="Nessun turno di lavoro inserito. Segna gli orari della settimana per ottenere un confronto.";
 add(takeaway,"p","",desc);
 renderTimeline(result,days);
 const tableWrap=add(result,"section","shift-break-section");
 const heading=add(tableWrap,"div","shift-section-heading");
 add(heading,"span","shift-kicker","LE PAUSE TRA UN TURNO E L'ALTRO");
 add(heading,"h3","","Quanto tempo separa un turno dal successivo.");
 add(heading,"p","","Il calcolo considera anche i giorni marcati come riposo. L'intervallo del primo turno non è noto perché manca il turno precedente alla settimana.");
 const scroll=add(tableWrap,"div","st-table-scroll");
 const table=add(scroll,"table","st-table shift-break-table");
 const thead=add(table,"thead"),header=add(thead,"tr");
 for(const name of ["Giorno","Turno","Pausa dal turno precedente"])add(header,"th","",name);
 const tbody=add(table,"tbody");
 for(const d of days){
  const row=add(tbody,"tr");
  add(row,"td","",d.label);
  add(row,"td","",d.type==="off"?"Riposo indicato":d.start+"–"+d.end);
  let description;
  if(d.type==="off")description="—";
  else if(d.rest===null)description="Non calcolabile: primo turno inserito";
  else if(d.rest<0)description="Sovrapposizione di "+T.fmtMinutes(-d.rest);
  else description=T.fmtMinutes(d.rest)+(d.rest<660?" · da verificare":"");
  add(row,"td",d.rest!==null&&d.rest<660?"st-bad":"",description);
 }
 renderRest(result,days);
 if(short.length)note(result,"Sono presenti "+short.length+" "+(short.length===1?"intervallo inferiore":"intervalli inferiori")+" a 11 ore (inclusi eventuali turni sovrapposti). È un riferimento illustrativo per l'organizzazione, non una verifica del CCNL o delle norme applicabili.",true);
 if(conflicts.length)note(result,conflicts.length+" "+(conflicts.length===1?"finestra di riposo ipotetica che si sovrappone":"finestre di riposo ipotetiche che si sovrappongono")+" a turni già inseriti: "+(conflicts.length===1?"è NON DISPONIBILE.":"sono NON DISPONIBILI."),true);
 if(unknown.length)note(result,unknown.length+" "+(unknown.length===1?"finestra tocca":"finestre toccano")+" giorni fuori dalla settimana. Non conosciamo gli eventuali turni precedenti o successivi: "+(unknown.length===1?"è DA CONFERMARE.":"sono DA CONFERMARE."),true);
 note(result,"Le opportunità di riposo durano qui 7 h 30 min per scelta esemplificativa, non come prescrizione. Il sistema non considera reperibilità, straordinari, vita familiare, sonnellini, variazioni di fuso o cambio legale dell'ora.");
 actions.hidden=false;
 status("shift-status",isDemo?
  "Settimana di esempio caricata con orari inventati. Puoi modificare i turni e rigenerare il tuo piano.":
  "Settimana analizzata. Puoi salvare il report in PDF o esportare gli orari in CSV.");
 $("shift-report").scrollIntoView({behavior:"smooth",block:"start"});
}
function invalidateResult(){
 if(current.length||result.children.length){
  current=[];clear(result);actions.hidden=true;$("shift-report").hidden=true;
  status("shift-status","Turni modificati: premi «Analizza i turni» per aggiornare il piano.");
 }
}
function onEdited(event){
 if(event.target?.removeAttribute)event.target.removeAttribute("aria-invalid");
 invalidateResult();
}
$("shift-form").addEventListener("input",onEdited);
$("shift-form").addEventListener("change",onEdited);
$("shift-demo").addEventListener("click",()=>{
 // Settimana inventata: 5 turni da 8 ore, un intervallo di sole 8 ore;
 // il turno di venerdì notte termina sabato, segnato come giorno di riposo.
 const sample=["m","p","m","m","n","off","off"];
 $("shift-date").value="";
 $("shift-commute").value="30";
 [...body.querySelectorAll("tr")].forEach((tr,index)=>{
  const select=tr.querySelector("select");
  select.value=sample[index];
  select.dispatchEvent(new Event("change",{bubbles:true}));
 });
 try{render(analyze(),true)}catch(error){status("shift-status",error.message,true)}
});
$("shift-clear").addEventListener("click",()=>{
 current=[];clear(result);actions.hidden=true;$("shift-report").hidden=true;
 status("shift-status","Report chiuso. I tuoi orari restano nel modulo, pronti per nuove modifiche.");
});
$("shift-form").addEventListener("submit",event=>{
 event.preventDefault();
 try{render(analyze())}catch(e){status("shift-status",e.message,true)}
});
$("shift-form").addEventListener("reset",()=>setTimeout(()=>{
 createWeek();clear(result);current=[];actions.hidden=true;$("shift-report").hidden=true;status("shift-status","");
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