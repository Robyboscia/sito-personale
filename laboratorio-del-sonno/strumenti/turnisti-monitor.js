/* Turni & Sonno: diario auto-riferito indipendente, con confronto di orari di lavoro. */
(() => {
"use strict";
const T=window.SleepLabTools;
if(!T || !document.getElementById("shift-monitor-form"))return;
const $=T.$,out=$("shift-monitor-results"),tbody=$("shift-sleep-days");
const STORAGE_KEY="dott-boscia-turni-sonno-diario-v1";
const fields=[],opts=[["","Non indicata"],["1","1 · Molto scarsa"],["2","2 · Scarsa"],["3","3 · Discreta"],["4","4 · Buona"],["5","5 · Molto buona"]];
let planDays=[],observations=[],reportIsVisible=false;
function el(tag,cls,text){return T.el(tag,cls,text)}
function add(parent,tag,cls,text){return T.add(parent,tag,cls,text)}
function status(text,bad=false){T.status("shift-monitor-status",text,bad)}
function dayLabel(i){
 const base=$("shift-date").value;
 if(!base || !/^\d{4}-\d{2}-\d{2}$/.test(base))return "Giorno "+(i+1);
 const d=new Date(base+"T12:00:00");
 if(Number.isNaN(d.getTime()))return "Giorno "+(i+1);
 d.setDate(d.getDate()+i);
 return d.toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"2-digit"});
}
function buildTable(){
 tbody.replaceChildren();
 for(let i=0;i<7;i++){
  const tr=add(tbody,"tr","shift-sleep-row");
  const th=add(tr,"th","",dayLabel(i));th.scope="row";
  const data={label:th};
  for(const [key,aria,type] of [["start","Mi sono addormentato","time"],["end","Mi sono svegliato","time"],["quality","Qualità percepita","select"],["nap","Sonnellini in minuti","number"]]){
   const cell=add(tr,"td"),control=add(cell,type==="select"?"select":"input");
   control.setAttribute("aria-label",aria+" · "+dayLabel(i));
   control.dataset.monitorField=key;
   if(type==="select")for(const [val,txt] of opts){const opt=add(control,"option","",txt);opt.value=val}
   else{control.type=type;if(type==="number"){control.min="0";control.max="240";control.step="5";control.placeholder="0";}}
   control.id="sleep-"+key+"-"+i;
   data[key]=control;
  }
  fields.push(data);
 }
}
function labels(){
 fields.forEach((f,i)=>{
  f.label.textContent=dayLabel(i);
  for(const key of ["start","end","quality","nap"])f[key].setAttribute("aria-label",{
    start:"Mi sono addormentato",end:"Mi sono svegliato",quality:"Qualità percepita",nap:"Sonnellini in minuti"
   }[key]+" · "+dayLabel(i));
 });
}
function resetInvalid(){for(const f of fields)for(const key of ["start","end","quality","nap"])f[key].removeAttribute("aria-invalid")}
function analyze(){
 resetInvalid();
 const data=[];
 for(let i=0;i<7;i++){
  const f=fields[i],a=f.start.value,b=f.end.value,quality=f.quality.value,napStr=f.nap.value.trim();
  const nap=napStr===""?0:Number(napStr);
  if(!Number.isInteger(nap)||nap<0||nap>240){f.nap.setAttribute("aria-invalid","true");f.nap.focus();throw Error("Giorno "+(i+1)+": indica 0–240 minuti di sonnellini.");}
  if(!a&&!b&&!quality&&nap===0)continue;
  if((!a)!==(!b)){(a?f.end:f.start).setAttribute("aria-invalid","true");(a?f.end:f.start).focus();throw Error("Giorno "+(i+1)+": completa sia l'ora di addormentamento sia il risveglio.");}
  if(quality&&!a){f.quality.setAttribute("aria-invalid","true");f.quality.focus();throw Error("Giorno "+(i+1)+": per registrare la qualità, indica anche gli orari del sonno.");}
  let duration=0,startAbs=null,endAbs=null;
  if(a){
   const am=T.parseTime(a),bm=T.parseTime(b);
   if(!Number.isFinite(am)||!Number.isFinite(bm)||am===bm){f.end.setAttribute("aria-invalid","true");f.end.focus();throw Error("Giorno "+(i+1)+": scegli orari validi e diversi.");}
   duration=T.forward(am,bm);
   if(duration>960){f.end.setAttribute("aria-invalid","true");f.end.focus();throw Error("Giorno "+(i+1)+": un episodio supera 16 ore. Controlla gli orari.");}
   startAbs=i*1440+am;endAbs=startAbs+duration;
  }
  data.push({day:i+1,label:dayLabel(i),start:a,end:b,startAbs,endAbs,duration,
   quality:quality?Number(quality):null,nap});
 }
 return data;
}
function nightConflicts(d){
 if(d.startAbs===null||!planDays.length)return [];
 return planDays.filter(p=>p.type!=="off"&&Number.isFinite(p.startAbs)&&p.startAbs<d.endAbs&&p.endAbs>d.startAbs);
}
function fmtH(n){return T.fmtMinutes(n)}
function renderTimeline(parent,data){
 const work=planDays.filter(d=>d.type!=="off");
 const section=add(parent,"section","shift-timeline-section shift-monitor-timeline");
 section.setAttribute("aria-label","Confronto visivo di lavoro e sonno registrato");
 const title=add(section,"div","shift-section-heading");
 add(title,"span","shift-kicker","DUE LINEE DISTINTE");
 add(title,"h3","","Lavoro e sonno sulle stesse 24 ore");
 add(title,"p","","Per ogni giorno, la fascia superiore è il lavoro; quella inferiore è il sonno auto-riferito. Lo spazio vuoto NON è necessariamente veglia o riposo.");
 const legend=add(section,"div","shift-legend");
 for(const [cls,label] of [["shift-compare-work","Lavoro inserito"],["shift-compare-sleep","Sonno registrato"]]){
  const tag=add(legend,"span");add(tag,"i","shift-legend-color "+cls);add(tag,"span","",label);
 }
 const scale=add(section,"div","shift-hour-scale");
 add(scale,"span","shift-hour-label","");
 const hours=add(scale,"div","shift-hours");
 ["00","06","12","18","24"].forEach(v=>add(hours,"span","",v));
 const max=Math.max(7*1440,...work.map(d=>d.endAbs),...data.filter(d=>d.endAbs!==null).map(d=>d.endAbs));
 const count=Math.min(8,Math.ceil(max/1440));
 const grid=add(section,"div","shift-timeline");
 function segments(all,day,kind){
  const start=day*1440,end=start+1440,list=[];
  for(const p of all){
   if(p.startAbs===null)continue;
   const l=Math.max(start,p.startAbs),r=Math.min(end,p.endAbs);
   if(r>l)list.push({start:l,end:r,left:(l-start)/1440*100,width:(r-l)/1440*100,kind});
  }
  return list;
 }
 for(let i=0;i<count;i++){
  const row=add(grid,"div","shift-day-row shift-comparison-row");
  const title=add(row,"div","shift-day-label");
  add(title,"strong","",i===7?"Giorno 8":dayLabel(i));
  add(title,"small","",i===7?"Prosecuzione oltre mezzanotte":"Riga superiore: lavoro; inferiore: sonno");
  const bar=add(row,"div","shift-day-track shift-comparison-track");
  const segs=[...segments(work,i,"work"),...segments(data,i,"sleep")];
  for(const seg of segs){
   const span=add(bar,"span","shift-comparison-segment shift-compare-"+seg.kind);
   span.style.left=seg.left+"%";span.style.width=seg.width+"%";
   span.title=(seg.kind==="work"?"Lavoro":"Sonno registrato")+" dalle "+T.time(seg.start)+" alle "+T.time(seg.end);
   span.setAttribute("aria-label",span.title);
   span.setAttribute("role","img");
  }
  if(!segs.length)add(bar,"span","shift-comparison-empty","Nessun orario registrato");
 }
 add(section,"p","shift-timeline-help","La visualizzazione non misura fasi del sonno, efficienza o qualità biologica. Gli orari registrati sono auto-riferiti.");
}
function render(data,quiet=false){
 observations=data;out.replaceChildren();
 const withSleep=data.filter(d=>d.duration>0);
 if(!data.length){$("shift-monitor-report").hidden=true;reportIsVisible=false;status("Non hai ancora registrato episodi di sonno o sonnellini.",true);return;}
 $("shift-monitor-report").hidden=false;reportIsVisible=true;
 const meanSleep=T.mean(withSleep.map(d=>d.duration));
 const quality=T.mean(withSleep.filter(d=>d.quality!==null).map(d=>d.quality));
 const naps=data.reduce((s,d)=>s+d.nap,0);
 const conflicts=withSleep.filter(d=>nightConflicts(d).length);
 const stats=add(out,"div","shift-stats shift-monitor-stats");
 T.metric(stats,"Episodi principali registrati",withSleep.length);
 T.metric(stats,"Durata media riferita",meanSleep===null?"—":fmtH(meanSleep));
 T.metric(stats,"Qualità percepita media",quality===null?"—":T.round(quality,1)+" / 5");
 T.metric(stats,"Sonnellini dichiarati",fmtH(naps));
 if(!planDays.length)T.note(out,"Confronto con i turni non attivo: usa «Analizza i turni» nella sezione 01 per aggiungere gli orari di lavoro alla visualizzazione.");
 else if(conflicts.length)T.note(out,conflicts.length+" "+(conflicts.length===1?"episodio di sonno registrato coincide":"episodi di sonno registrati coincidono")+" con almeno un turno indicato. Verifica le date e gli orari: non attribuiamo automaticamente il dato a un disturbo.",true);
 else T.note(out,"Confronto con i turni attivo. Non emergono coincidenze fra gli episodi registrati e gli orari di lavoro inseriti.");
 const workDays=planDays.length?data.filter(d=>d.duration>0&&planDays[d.day-1]?.type!=="off"):[];
 const freeDays=planDays.length?data.filter(d=>d.duration>0&&planDays[d.day-1]?.type==="off"):[];
 if(workDays.length&&freeDays.length){
  const a=T.mean(workDays.map(d=>d.duration)),b=T.mean(freeDays.map(d=>d.duration));
  T.note(out,"Confronto descrittivo delle giornate in cui inizia il sonno: giorni segnati come lavorativi "+fmtH(a)+" di media ("+workDays.length+" episodi); giorni segnati come riposo "+fmtH(b)+" ("+freeDays.length+" episodi). Il campione è piccolo e non consente conclusioni causali.");
 }
 renderTimeline(out,data);
 const head=add(out,"div","shift-section-heading");add(head,"span","shift-kicker","LE REGISTRAZIONI");add(head,"h3","","Il diario, riga per riga");
 const scroll=add(out,"div","st-table-scroll");
 const table=add(scroll,"table","st-table shift-monitor-results-table");
 const tr=add(add(table,"thead"),"tr");
 for(const name of ["Giorno","Sonno principale","Durata riferita","Qualità","Sonnellini","Nota"])add(tr,"th","",name);
 const tb=add(table,"tbody");
 for(const d of data){
  const row=add(tb,"tr");const overlap=nightConflicts(d).length>0;
  for(const value of [d.label,d.start?d.start+"–"+d.end:"Non indicato",d.duration?fmtH(d.duration):"—",
    d.quality!==null?d.quality+" / 5":"—",d.nap?fmtH(d.nap):"—",
    overlap?"Orario sovrapposto a turno":(d.endAbs!==null&&d.endAbs>7*1440?"Termina oltre la settimana":"—")]){
   add(row,"td",overlap?"st-bad":"",value);
  }
 }
 T.note(out,"Sono osservazioni auto-riferite. Orari di lavoro e sonno possono essere incompleti; il sistema non valuta insonnia, cronotipo, necessità individuali, performance o idoneità alla guida.");
 if(!quiet)status("Report aggiornato. Puoi stamparlo oppure esportare il diario in CSV.");
}
function invalidate(){
 if(reportIsVisible){
  $("shift-monitor-report").hidden=true;out.replaceChildren();reportIsVisible=false;
  status("Diario modificato: premi «Analizza il sonno registrato» per aggiornare il report.");
 }
}
function setLocal(values){
 for(let i=0;i<7;i++){
  const entry=values[i]||{},f=fields[i];
  for(const k of ["start","end","quality","nap"]){
   const v=String(entry[k]??"");
   if(k==="quality"){f[k].value=/^[1-5]$/.test(v)?v:"";}
   else if(k==="nap"){f[k].value=/^\d{1,3}$/.test(v)&&Number(v)<=240?v:"";}
   else f[k].value=/^([01]\d|2[0-3]):[0-5]\d$/.test(v)?v:"";
  }
 }
}
function getLocal(){return fields.map(f=>({start:f.start.value,end:f.end.value,quality:f.quality.value,nap:f.nap.value}));}
function getStore(){try{return window.localStorage.getItem(STORAGE_KEY)}catch{return null}}
function deleteStore(){try{window.localStorage.removeItem(STORAGE_KEY);return true}catch{return false}}
$("shift-monitor-form").addEventListener("submit",event=>{
 event.preventDefault();
 try{render(analyze());}
 catch(e){status(e.message,true);}
});
$("shift-monitor-form").addEventListener("input",event=>{
 if(event.target?.removeAttribute)event.target.removeAttribute("aria-invalid");invalidate();
});
$("shift-monitor-form").addEventListener("change",event=>{
 if(event.target?.removeAttribute)event.target.removeAttribute("aria-invalid");invalidate();
});
$("shift-monitor-form").addEventListener("reset",()=>setTimeout(()=>{
 observations=[];$("shift-monitor-report").hidden=true;out.replaceChildren();reportIsVisible=false;
 deleteStore();status("Diario svuotato. Anche la copia salvata su questo dispositivo è stata rimossa.");
},0));
$("shift-monitor-save").addEventListener("click",()=>{
 try{const data=analyze();if(!data.length){status("Inserisci almeno una giornata prima di salvare.",true);return;}
 window.localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,values:getLocal()}));
 status("Diario salvato soltanto in questo browser. Puoi recuperarlo riaprendo la pagina sullo stesso dispositivo.");
 }catch(e){status("Impossibile salvare: "+e.message,true);}
});
$("shift-monitor-forget").addEventListener("click",()=>{
 status(deleteStore()?"Dati salvati cancellati da questo browser. I valori ancora visibili nel modulo non sono stati modificati.":"Questo browser non consente di cancellare la memoria locale.",!getStore());
});
$("shift-monitor-export").addEventListener("click",()=>{
 if(!observations.length)return;
 const data=[["Giorno","Data indicativa","Addormentamento","Risveglio","Sonno principale minuti (auto-riferito)","Qualità 1-5","Sonnellini minuti","Sovrapposizione turno"]];
 for(const d of observations)data.push([d.day,d.label,d.start,d.end,d.duration,d.quality??"",d.nap,nightConflicts(d).length?"Sì":"No"]);
 const csv="\uFEFF"+data.map(row=>row.map(x=>T.csvQuote(x)).join(";")).join("\r\n");
 T.saveFile("Turni_e_Sonno_Diario_7_Giorni.csv",csv,"text/csv;charset=utf-8");
});
$("shift-monitor-print").addEventListener("click",()=>{
 document.body.classList.add("print-monitor");window.print();
});
window.addEventListener("afterprint",()=>document.body.classList.remove("print-monitor"));
window.addEventListener("shiftplan:updated",event=>{
 planDays=event.detail?.days||[];labels();
 if(reportIsVisible){try{render(analyze(),true)}catch(e){status(e.message,true);}}
});
window.addEventListener("shiftplan:cleared",()=>{
 planDays=[];labels();
 if(reportIsVisible){try{render(analyze(),true)}catch(e){status(e.message,true);}}
});
$("shift-date").addEventListener("input",labels);
buildTable();
const raw=getStore();
if(raw)try{
 const stored=JSON.parse(raw);
 if(stored.version===1&&Array.isArray(stored.values)&&stored.values.length===7){
  setLocal(stored.values);
  status("Diario recuperato dalla memoria locale di questo dispositivo. Premi «Analizza il sonno registrato» per vedere il report.");
 }
}catch{status("Non è stato possibile leggere il diario salvato.",true);}
})();
