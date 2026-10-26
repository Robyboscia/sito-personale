/* Calcolatore educativo della caffeina — non calcola concentrazioni ematiche. */
(() => {
"use strict";
const T=window.SleepLabTools;if(!T)return;
const {$,add,clear,status,metric,note}= {
 $:T.$,add:T.add.bind(T),clear:T.clear.bind(T),status:T.status.bind(T),
 metric:T.metric.bind(T),note:T.note.bind(T)
};
const choices=[
 ["espresso","Espresso · circa 80 mg",80],
 ["filtro","Caffè filtro · circa 100 mg",100],
 ["te","Tè · circa 40 mg",40],
 ["energy","Energy drink · circa 80 mg",80],
 ["custom","Quantità personalizzata",null]
];
let counter=0;
const doses=$("caff-doses"),result=$("caff-result");
function newDose(hour="08:00",amount=80){
 const row=add(doses,"div","st-dose-line");counter++;
 const drink=add(row,"div","st-field"),drinkLabel=add(drink,"label","","Bevanda "+counter);
 const type=add(drink,"select");type.id="drink-"+counter;drinkLabel.htmlFor=type.id;
 choices.forEach(([val,title])=>{const opt=add(type,"option","",title);opt.value=val});
 const mgBox=add(row,"div","st-field"),mgLabel=add(mgBox,"label","","Caffeina (mg)");
 const mg=add(mgBox,"input");mg.type="number";mg.min="1";mg.max="1000";mg.step="1";mg.value=String(amount);mg.required=true;mg.id="mg-"+counter;mgLabel.htmlFor=mg.id;
 const timeBox=add(row,"div","st-field"),timeLabel=add(timeBox,"label","","Ora");
 const time=add(timeBox,"input");time.type="time";time.required=true;time.value=hour;time.id="time-"+counter;timeLabel.htmlFor=time.id;
 const remove=add(row,"button","st-button st-alt","Rimuovi");remove.type="button";remove.setAttribute("aria-label","Rimuovi bevanda "+counter);
 remove.addEventListener("click",()=>{row.remove();clear(result);$("caff-actions").hidden=true;status("caff-status","")});
 type.addEventListener("change",()=>{const selected=choices.find(c=>c[0]===type.value);if(selected&&selected[2]!==null)mg.value=String(selected[2])});
 type.value="espresso";
 return row;
}
function resetUI(){
 clear(doses);counter=0;newDose("08:00",80);newDose("14:00",80);
 clear(result);$("caff-actions").hidden=true;status("caff-status","");
}
function invalidateResult(){
 if(result.children.length||!$("caff-actions").hidden){
  clear(result);$("caff-actions").hidden=true;
  status("caff-status","Dati modificati: premi «Calcola i tre scenari» per aggiornare i risultati.");
 }
}
$("caff-form").addEventListener("input",invalidateResult);
$("caff-form").addEventListener("change",invalidateResult);
$("caff-add").addEventListener("click",()=>{
 if(doses.children.length>=8){status("caff-status","Puoi inserire fino a otto bevande.",true);return}
 newDose("15:00",80);invalidateResult();
});
$("caff-form").addEventListener("reset",()=>setTimeout(resetUI,0));
$("caff-example").addEventListener("click",()=>{
 clear(doses);counter=0;
 newDose("14:00",80);
 $("caff-bed").value="23:00";
 $("caff-form").requestSubmit();
});
/* Ogni bevanda appartiene alla giornata simulata. Se il sonno è fra
   mezzanotte e le 05:59 lo consideriamo nella notte successiva;
   le bevande fra le 00 e quell'ora si riferiscono alla stessa notte.
   Nessuna data vera o limite arbitrario a mezzanotte sullo smaltimento. */
function dayTimeline(bed,doses){
 const sleep=bed<360?bed+1440:bed;
 return {
  sleep,
  doses:doses.map(x=>({
   ...x,
   absolute:bed<360&&x.minutes<=bed?x.minutes+1440:x.minutes
  }))
 };
}
function when(minutes){
 const rounded=Math.ceil(minutes);
 const day=Math.floor(rounded/1440);
 const time=T.time(rounded);
 const label=day===0?"nella giornata simulata":day===1?"il giorno seguente":day===2?"due giorni dopo":day+" giorni dopo";
 return {day,time,label,full:label+" alle "+time};
}
function almostGone(doses,half){
 // Oltre il 95% di OGNI dose risulta smaltito quando tutte le singole
 // dosi sono sotto il 5% iniziale. Con il modello esponenziale non si
 // raggiunge mai matematicamente lo zero.
 const extraMinutes=half*60*Math.log2(20);
 return Math.max(...doses.map(dose=>dose.absolute+extraMinutes));
}
const scenarioNames={
 3:"Smaltimento più rapido",
 5:"Smaltimento intermedio",
 7:"Smaltimento più lento"
};
$("caff-form").addEventListener("submit",event=>{
 event.preventDefault();
 const bed=T.parseTime($("caff-bed").value);
 if(!Number.isFinite(bed)){
  status("caff-status","Indica un orario valido per coricarti.",true);
  $("caff-bed").focus();
  return;
 }
 const raw=[];
 for(const row of doses.children){
  const mgField=row.querySelector('input[type="number"]');
  const timeField=row.querySelector('input[type="time"]');
  const mg=T.number(mgField.value,1,1000);
  const minutes=T.parseTime(timeField.value);
  if(!Number.isFinite(mg)||!Number.isInteger(mg)||!Number.isFinite(minutes)){
   const bad=(!Number.isFinite(mg)||!Number.isInteger(mg))?mgField:timeField;
   bad.setAttribute("aria-invalid","true");bad.focus();
   status("caff-status","Controlla la casella evidenziata: da 1 a 1000 mg interi e un orario valido.",true);
   return;
  }
  mgField.removeAttribute("aria-invalid");
  timeField.removeAttribute("aria-invalid");
  raw.push({mg,minutes,input:timeField});
 }
 if(!raw.length){
  status("caff-status","Inserisci almeno una bevanda.",true);
  return;
 }
 const timeline=dayTimeline(bed,raw);
 const after=timeline.doses.find(d=>d.absolute>timeline.sleep);
 if(after){
  after.input.setAttribute("aria-invalid","true");
  after.input.focus();
  status("caff-status","La bevanda delle "+T.time(after.minutes)+" risulta successiva all'ora di coricamento. Controlla gli orari della giornata simulata.",true);
  return;
 }
 const total=timeline.doses.reduce((sum,d)=>sum+d.mg,0);
 const last=Math.max(...timeline.doses.map(d=>d.absolute));
 const scenarios=[3,5,7].map(half=>({
  half,
  remain:timeline.doses.reduce((sum,d)=>sum+d.mg*Math.pow(0.5,(timeline.sleep-d.absolute)/60/half),0),
  finish:almostGone(timeline.doses,half)
 }));
 clear(result);
 add(result,"div","st-tag","STIMA PER IL SONNO ALLE "+$("caff-bed").value);
 add(result,"h3","st-result-title","Quando potresti averne smaltita quasi tutta?");
 add(result,"p","st-help","Ti mostriamo tre possibilità perché la velocità di smaltimento cambia da persona a persona. Non sappiamo se per te sia più rapida, intermedia o lenta: i valori di 3, 5 e 7 ore per dimezzare la quantità sono esempi, non un test del tuo metabolismo.");
 const stats=add(result,"div","st-metric-grid");
 metric(stats,"Caffeina assunta",T.round(total)+" mg");
 metric(stats,"Bevande considerate",timeline.doses.length);
 const summary=add(result,"div","st-note");
 summary.textContent="La caffeina non scompare a mezzanotte: il modello prosegue nei giorni successivi e indica il momento in cui di ogni dose resta meno del 5%. Non è un orario di eliminazione totale reale né una soglia che garantisce un sonno indisturbato.";
 for(const scenario of scenarios){
  const block=add(result,"div","st-domain st-caffeine-scenario");
  add(block,"strong","",scenarioNames[scenario.half]+" · quantità dimezzata ogni "+scenario.half+" ore");
  const track=add(block,"div","st-progress");
  add(track,"span").style.width=(scenario.remain/total*100)+"%";
  add(block,"small","",T.round(scenario.remain,1)+" mg teorici presenti quando vai a letto ("+T.round(scenario.remain/total*100,1)+"% del totale)");
  const end=when(scenario.finish);
  const finish=add(block,"div","st-caffeine-finish");
  add(finish,"span","st-caffeine-finish-label","QUASI COMPLETAMENTE SMALTITA");
  add(finish,"strong","",end.full);
  const delta=Math.ceil(scenario.finish-last);
  add(finish,"small","","Circa "+T.fmtMinutes(delta)+" dopo l'ultima bevanda. È una soglia indicativa del 95%, non lo zero.");
 }
 const close=timeline.doses.filter(d=>(timeline.sleep-d.absolute)<360);
 if(close.length){
  note(result,"Attenzione: "+close.length+" bevand"+(close.length===1?"a risulta":"e risultano")+" nelle 6 ore prima di coricarti. A seconda di dose e sensibilità, la caffeina può disturbare il sonno anche se ti addormenti e hai l'impressione di riposare bene. Dosi elevate possono influire anche quando assunte prima.",true);
 }else{
  note(result,"Anche se nessuna bevanda risulta nelle ultime 6 ore, non possiamo dedurre che la caffeina non influenzi il tuo sonno: contano la quantità, la sensibilità individuale e il tempo effettivo di smaltimento.",true);
 }
 $("caff-actions").hidden=false;
 status("caff-status","Calcolo completato, anche oltre mezzanotte. Nessun dato è stato inviato a un server.");
 result.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth",block:"start"});
});
resetUI();
T.print("caff-print");
})();