(function(){
"use strict";
const api=window.MentalProDemo;
const form=document.querySelector("#editor");
const offersRoot=document.querySelector("#offer-fields");
const status=document.querySelector("#form-status");
const summary=document.querySelector("#offer-summary");
const stats=document.querySelector("#statistics");
const info=document.querySelector("#stat-note");
let persisted=api.read();
function h(tag,cls,content){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(content!==undefined)n.textContent=content;
 return n;
}
function field(path,title,type="text",max=110,wide=false){
 const id="field-"+path.replaceAll(".","-");
 const wrap=h("div","field"+(wide?" wide":""));
 const lab=h("label","",title);lab.htmlFor=id;
 let element;
 if(type==="textarea"){element=h("textarea");element.rows=3;}
 else {element=h("input");element.type=type;if(type==="number"){element.step=path.endsWith(".qty")?"1":"0.01";element.min="1";element.max=path.endsWith(".qty")?"20":"3000";element.inputMode="decimal";}}
 element.id=id;element.dataset.path=path;element.required=true;
 if(type!=="number")element.maxLength=max;
 wrap.append(lab,element);
 return wrap;
}
for(const [key,title] of [["A","Upsell A"],["B","Upsell B"],["D","Downsell"]]){
 const section=h("section","admin-card");section.dataset.offer=key;
 section.append(h("span","kicker","04 · "+(key==="D"?"ALTERNATIVA":"UPSELL "+key)),h("h2","",title));
 const toggle=h("label","toggle");
 const enabled=h("input");enabled.type="checkbox";enabled.dataset.path="offers."+key+".enabled";
 toggle.append(enabled,h("span","","Mostra questa offerta nella demo"));section.append(toggle);
 const grid=h("div","form-grid");
 const specs=[
 ["label","Nome dell'offerta","text",100,false],
 ["qty","Confezioni aggiunte","number",null,false],
 ["price","Prezzo aggiuntivo (€)","number",null,false],
 ["headline","Titolo persuasivo","text",180,true],
 ["body","Testo dell'offerta","textarea",360,true],
 ["yes","Pulsante accettazione","text",110,true],
 ["no","Pulsante rifiuto","text",110,true]
 ];
 for(const [keyName,label,type,max,wide] of specs){
   grid.append(field("offers."+key+"."+keyName,label,type,max,wide));
 }
 section.append(grid);offersRoot.append(section);
}
function getValue(obj,path){
 return path.split(".").reduce((o,k)=>o?.[k],obj);
}
function setValue(obj,path,value){
 const parts=path.split(".");
 let ref=obj;
 for(let i=0;i<parts.length-1;i++)ref=ref[parts[i]];
 ref[parts.at(-1)]=value;
}
function fill(c){
 for(const el of form.querySelectorAll("[data-path]")){
  const value=getValue(c,el.dataset.path);
  if(el.type==="checkbox")el.checked=Boolean(value);
  else el.value=String(value);
 }
 form.querySelector("[data-order]").value=c.order.join(",");
 showSummary(c);
}
function gather(){
 const obj=JSON.parse(JSON.stringify(api.defaults));
 for(const el of form.querySelectorAll("[data-path]")){
   const path=el.dataset.path;
   let value;
   if(el.type==="checkbox")value=el.checked;
   else if(el.type==="number")value=Number(el.value);
   else value=el.value.trim();
   setValue(obj,path,value);
 }
 obj.order=form.querySelector("[data-order]").value.split(",");
 return obj;
}
function setStatus(message,error=false){
 status.textContent=message;
 status.classList.toggle("error",error);
 status.style.display="block";
}
function save(preview=false){
 let config;
 try{
  config=gather();
  const issues=api.check(config);
  if(issues.length)throw Error(issues.join("\n"));
  persisted=api.save(config);
  setStatus("✓ Configurazione salvata in questo browser. Apri l'anteprima per provarla.");
  showSummary(persisted);
  if(preview)location.href="./index.html";
  return true;
 }catch(e){
  setStatus("Non salvato. Correggi questi campi:\n"+e.message,true);
  return false;
 }
}
form.addEventListener("submit",e=>{e.preventDefault();save();});
document.querySelector("#save-preview").addEventListener("click",()=>save(true));
document.querySelector("#reset-config").addEventListener("click",()=>{
 if(!confirm("Ripristinare tutti i testi, prezzi e offerte predefiniti? Le statistiche locali non saranno cancellate."))return;
 persisted=api.reset();fill(persisted);
 setStatus("✓ Impostazioni ripristinate. La demo ora usa i valori iniziali.");
});
function row(label,value,large=false){
 const r=h("div","summary-row"+(large?" large":""));
 r.append(h("span","",label),h("strong","",value));return r;
}
function showSummary(c){
 summary.replaceChildren();
 const enabled=api.activeOffers(c);
 summary.append(row("Offerta iniziale",api.money(api.cents(c.base.price))),row("Confezioni iniziali","1"));
 let qty=1,total=api.cents(c.base.price);
 for(const id of enabled){
  const offer=c.offers[id];
  total+=api.cents(offer.price);
  qty+=offer.qty;
  summary.append(row("Upsell "+id+" · +"+offer.qty+" conf.", "+"+api.money(api.cents(offer.price))));
 }
 if(enabled.length===0)summary.append(h("p","small","Nessun upsell attivo."));
 summary.append(h("hr","divider"),row("Totale accettando tutti gli upsell",api.money(total),true));
 const calc=api.metrics(c,qty,total);
 summary.append(row("Confezioni complessive",String(qty)),row("Prezzo medio per confezione",api.money(calc.unitCents)));
 if(calc.savingCents>0)summary.append(h("p","proof","Risparmio rispetto a "+qty+" singole: "+api.money(calc.savingCents)));
 else summary.append(h("p","fine","Nessuno sconto calcolato sul formato selezionato."));
 const d=c.offers.D;
 summary.append(h("hr","divider"),row("Downsell "+(d.enabled?"attivo":"disattivato"),d.enabled?"+"+api.money(api.cents(d.price)):"—"));
}
function refresh(){
 const events=api.readEvents();
 const count=t=>events.filter(e=>e.type===t).length;
 const starts=count("checkout_started"),primaries=count("primary_simulated"),finished=count("finished");
 const accepted=count("offer_accepted"),declined=count("offer_declined");
 const finishedEvents=events.filter(x=>x.type==="finished" && Number.isSafeInteger(x.totalCents));
 const sum=finishedEvents.reduce((a,e)=>a+e.totalCents,0);
 const avg=finishedEvents.length?api.money(Math.round(sum/finishedEvents.length)):"—";
 const percent=primaries?Math.round(finished/primaries*100):0;
 const entries=[
 ["Checkout avviati",String(starts)],
 ["Acquisti simulati",String(primaries)],
 ["Offerte accettate",String(accepted)],
 ["Percorsi conclusi",String(finished)],
 ["Offerte rifiutate",String(declined)],
 ["Ticket medio simulato",avg]
 ];
 stats.replaceChildren();
 for(const [name,value] of entries){
   stats.append((()=>{const node=h("div","stat");node.append(h("b","",value),h("small","",name));return node;})());
 }
 info.textContent="Tasso di completamento simulato: "+(primaries?percent+"%":"nessun dato")+
   ". Conteggi ricavati soltanto dai clic fatti su questo browser; non rappresentano clienti, incassi o conversioni reali.";
 const line=h("div","meter");
 const bar=h("span");bar.style.width=Math.max(0,Math.min(100,percent))+"%";line.append(bar);
 info.after(line);
 const meters=info.parentElement.querySelectorAll(".meter");
 for(let i=0;i<meters.length-1;i++)meters[i].remove();
}
document.querySelector("#refresh-stats").addEventListener("click",refresh);
document.querySelector("#clear-stats").addEventListener("click",()=>{
 if(!confirm("Cancellare tutti i conteggi locali delle prove?"))return;
 api.clearEvents();refresh();
 setStatus("✓ Conteggi delle simulazioni azzerati.");
});
const jsonBox=document.querySelector("#json-box");
document.querySelector("#export-json").addEventListener("click",()=>{
 jsonBox.value=JSON.stringify(persisted,null,2);
 jsonBox.focus();jsonBox.select();
 setStatus("JSON pronto: puoi copiarlo e conservarlo.");
});
document.querySelector("#copy-json").addEventListener("click",async()=>{
 if(!jsonBox.value.trim())jsonBox.value=JSON.stringify(persisted,null,2);
 try{
  if(navigator.clipboard&&window.isSecureContext){
   await navigator.clipboard.writeText(jsonBox.value);
   setStatus("✓ Configurazione copiata negli appunti.");
  }else{
   jsonBox.focus();jsonBox.select();
   setStatus("Selezione pronta: utilizza Copia dal menu del telefono.");
  }
 }catch{jsonBox.focus();jsonBox.select();setStatus("Selezione pronta: utilizza Copia dal menu del telefono.");}
});
document.querySelector("#import-json").addEventListener("click",()=>{
 try{
  if(jsonBox.value.length>30000)throw Error("Il file è troppo grande per questa demo.");
  const loaded=JSON.parse(jsonBox.value);
  const issues=api.check(loaded);
  if(issues.length)throw Error(issues.join("\n"));
  if(!confirm("Importare questa configurazione, sostituendo quella salvata nel browser?"))return;
  persisted=api.save(loaded);fill(persisted);
  setStatus("✓ Configurazione importata e salvata. Apri l'anteprima per vedere il risultato.");
 }catch(e){setStatus("Importazione non riuscita:\n"+e.message,true);}
});
window.addEventListener("focus",refresh);
window.addEventListener("storage",e=>{
 if(e.key===api.CONFIG_KEY){persisted=api.read();fill(persisted);setStatus("Configurazione ricaricata dopo una modifica in un'altra scheda.");}
 if(e.key===api.EVENTS_KEY)refresh();
});
fill(persisted);refresh();
})();
