/* Mental Pro 2.0 — standalone local-only prototype.
 * No network calls, authentication, checkout or real commerce.
 * All values live only in this browser's localStorage.
 */
(function(global){
"use strict";
const CONFIG_KEY="boscia.mentalpro2.config.v1";
const EVENTS_KEY="boscia.mentalpro2.events.v1";
const VER=2;
const defaults=Object.freeze({
  version:VER,
  brand:{
    eyebrow:"MENTAL PRO · LA TUA SERA, UN'ALTRA PROSPETTIVA",
    headline:"La sera non ha bisogno di un'altra promessa. Ha bisogno di una scelta consapevole.",
    intro:"MENTAL pro è una formula senza melatonina né estratti vegetali, pensata per chi vuole guardare al sonno con maggiore attenzione.",
    badge:"Senza melatonina e senza estratti vegetali",
    reassurance:"Simulazione dimostrativa: nessun pagamento e nessun ordine reale."
  },
  base:{
    label:"MENTAL pro · 1 confezione", qty:1, price:47,
    headline:"Inizia con una confezione.",
    intro:"Scopri la proposta e decidi tu se aggiungere altre confezioni."
  },
  order:["A","B"],
  offers:{
    A:{enabled:true,label:"Aggiungi 2 confezioni",qty:2,price:70,
      headline:"Una confezione o una scorta più conveniente?",
      body:"Porta l'ordine a un formato più ampio. Il confronto dei prezzi viene calcolato in modo trasparente.",
      yes:"Sì, aggiungo 2 confezioni",no:"No, preferisco meno confezioni"},
    B:{enabled:true,label:"Aggiungi altre 3 confezioni",qty:3,price:105,
      headline:"Vuoi completare la scorta?",
      body:"Un'ultima possibilità per aggiungere confezioni al tuo ordine, senza obblighi.",
      yes:"Sì, aggiungo altre 3 confezioni",no:"No, concludo così"},
    D:{enabled:true,label:"Aggiungi 1 confezione",qty:1,price:47,
      headline:"Preferisci iniziare con una quantità più piccola?",
      body:"Nessuna forzatura: puoi aggiungere una sola confezione oppure concludere l'ordine di prova.",
      yes:"Sì, aggiungo 1 confezione",no:"No, resto con la scelta iniziale"}
  }
});
function clone(x){return JSON.parse(JSON.stringify(x));}
function isText(x,max=230){return typeof x==="string" && x.trim().length>0 && x.length<=max;}
function euroToCents(n){
  if(typeof n!=="number" || !Number.isFinite(n))return null;
  const cents=Math.round(n*100);
  return Number.isSafeInteger(cents)&&Math.abs(n*100-cents)<.00001?cents:null;
}
function check(c){
  const issues=[];
  if(!c||typeof c!=="object"||Array.isArray(c)||c.version!==VER)return ["Formato versione non valido."];
  for(const [path,max] of [["brand.eyebrow",120],["brand.headline",230],["brand.intro",500],["brand.badge",120],["brand.reassurance",200],["base.label",100],["base.headline",180],["base.intro",280]]){
    const [a,b]=path.split(".");
    if(!isText(c[a]?.[b],max))issues.push(path+": testo obbligatorio, massimo "+max+" caratteri.");
  }
  if(!Number.isInteger(c.base?.qty)||c.base.qty!==1)issues.push("La confezione base deve essere 1 per questo prototipo.");
  if(!Number.isInteger(euroToCents(c.base?.price))||c.base.price<1||c.base.price>1000)issues.push("Prezzo base non valido (da 1 a 1.000 €).");
  if(!Array.isArray(c.order)||c.order.length!==2||new Set(c.order).size!==2||!c.order.includes("A")||!c.order.includes("B"))
    issues.push("L'ordine deve contenere A e B una sola volta.");
  for(const id of ["A","B","D"]){
    const p=c.offers?.[id];
    if(!p || typeof p!=="object"){issues.push("Offerta "+id+" mancante.");continue;}
    if(typeof p.enabled!=="boolean")issues.push("Offerta "+id+": attivazione non valida.");
    if(!Number.isInteger(p.qty)||p.qty<1||p.qty>20)issues.push("Offerta "+id+": quantità da 1 a 20.");
    if(!Number.isInteger(euroToCents(p.price))||p.price<1||p.price>3000)issues.push("Offerta "+id+": prezzo da 1 a 3.000 €.");
    for(const [key,max] of [["label",100],["headline",180],["body",360],["yes",110],["no",110]]){
      if(!isText(p[key],max))issues.push("Offerta "+id+" · "+key+": testo obbligatorio, massimo "+max+" caratteri.");
    }
  }
  return issues;
}
function read(){
  try{
    const saved=JSON.parse(localStorage.getItem(CONFIG_KEY));
    if(check(saved).length===0)return saved;
  }catch{}
  return clone(defaults);
}
function save(config){
  const issues=check(config);
  if(issues.length)throw new Error(issues.join("\n"));
  localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
  return clone(config);
}
function reset(){localStorage.removeItem(CONFIG_KEY);return clone(defaults);}
function logEvent(type,detail={}){
  const allowed=new Set(["open","checkout_started","primary_simulated","offer_shown","offer_accepted","offer_declined","finished"]);
  if(!allowed.has(type))return;
  let log=readEvents();
  log.push({t:Date.now(),type,offer:["A","B","D"].includes(detail.offer)?detail.offer:null,
    totalCents:Number.isSafeInteger(detail.totalCents)?detail.totalCents:null});
  log=log.slice(-500);
  try{localStorage.setItem(EVENTS_KEY,JSON.stringify(log));}catch{}
}
function readEvents(){
  try{
    const items=JSON.parse(localStorage.getItem(EVENTS_KEY));
    if(!Array.isArray(items))return [];
    return items.filter(x=>x&&typeof x==="object"&&typeof x.type==="string"&&typeof x.t==="number")
       .slice(-500);
  }catch{return [];}
}
function clearEvents(){localStorage.removeItem(EVENTS_KEY);}
function money(cents){return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(cents/100);}
function cents(euros){const n=euroToCents(euros);if(n===null)throw new Error("Prezzo non valido");return n;}
function activeOffers(c){return c.order.filter(id=>c.offers[id].enabled);}
function metrics(c,quantity,totalCents){
  const unitCents=Math.round(totalCents/quantity);
  const singleCents=cents(c.base.price);
  const savingCents=Math.max(0,singleCents*quantity-totalCents);
  return {quantity,totalCents,unitCents,savingCents};
}
global.MentalProDemo={defaults:clone(defaults),read,save,reset,check,clearEvents,logEvent,readEvents,
  money,cents,activeOffers,metrics,CONFIG_KEY,EVENTS_KEY};
})(window);
