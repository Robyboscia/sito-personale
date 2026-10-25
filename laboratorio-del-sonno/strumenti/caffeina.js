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
$("caff-add").addEventListener("click",()=>{
 if(doses.children.length>=8){status("caff-status","Puoi inserire fino a otto bevande.",true);return}
 newDose("15:00",80);
});
$("caff-form").addEventListener("reset",()=>setTimeout(resetUI,0));
$("caff-form").addEventListener("submit",event=>{
 event.preventDefault();
 const bed=T.parseTime($("caff-bed").value);
 if(!Number.isFinite(bed)){status("caff-status","Inserisci un orario di coricamento valido.",true);$("caff-bed").focus();return}
 const taken=[];
 for(const row of doses.children){
  const mgField=row.querySelector('input[type="number"]'),timeField=row.querySelector('input[type="time"]');
  const mg=T.number(mgField.value,1,1000),time=T.parseTime(timeField.value);
  if(!Number.isFinite(mg)||!Number.isInteger(mg)||!Number.isFinite(time)){
   const incorrect=!Number.isFinite(mg)||!Number.isInteger(mg)?mgField:timeField;
   incorrect.setAttribute("aria-invalid","true");incorrect.focus();
   status("caff-status","Correggi la casella evidenziata: mg interi fra 1 e 1000 e ora in formato valido.",true);
   return;
  }
  mgField.removeAttribute("aria-invalid");timeField.removeAttribute("aria-invalid");
  taken.push({mg,hours:T.forward(time,bed)/60});
 }
 if(!taken.length){status("caff-status","Aggiungi almeno una bevanda.",true);return}
 const total=taken.reduce((s,x)=>s+x.mg,0);
 const scenarios=[3,5,7].map(half=>({half,remain:taken.reduce((s,x)=>s+x.mg*Math.pow(0.5,x.hours/half),0)}));
 clear(result);
 add(result,"div","st-tag","SIMULAZIONE ALLE "+$("caff-bed").value);
 add(result,"h3","st-result-title","Tre velocità di eliminazione");
 const stats=add(result,"div","st-metric-grid");
 metric(stats,"Caffeina inserita",T.round(total)+" mg");
 metric(stats,"Assunzioni",taken.length);
 for(const scenario of scenarios){
  const block=add(result,"div","st-domain");
  add(block,"strong","","Emivita illustrativa: "+scenario.half+" ore");
  const track=add(block,"div","st-progress");
  add(track,"span").style.width=(scenario.remain/total*100)+"%";
  add(block,"small","",T.round(scenario.remain,1)+" mg teorici residui ("+T.round(scenario.remain/total*100,1)+"% del totale inserito)");
 }
 note(result,"È un modello matematico illustrativo, non una misurazione del sangue. Il contenuto reale delle bevande e la velocità di eliminazione variano; la quantità residua non predice direttamente la qualità del sonno.",true);
 $("caff-actions").hidden=false;
 status("caff-status","Simulazione completata. I tuoi dati non sono stati inviati a un server.");
 result.scrollIntoView({behavior:"smooth",block:"start"});
});
resetUI();
T.print("caff-print");
})();