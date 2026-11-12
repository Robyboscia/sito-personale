(function(){
"use strict";
const api=window.MentalProDemo;
const config=api.read();
const app=document.querySelector("#app");
const baseCents=api.cents(config.base.price);
let stage="landing",currentOffer=null,position=0;
let total=baseCents,quantity=config.base.qty,history=[];
let finished=false;
const active=api.activeOffers(config);
function h(name,cls,text){
  const element=document.createElement(name);
  if(cls)element.className=cls;
  if(text!==undefined)element.textContent=text;
  return element;
}
function box(cls,...children){const b=h("div",cls);b.append(...children);return b;}
function btn(label,cls,click){
  const b=h("button","btn "+cls,label);b.type="button";
  b.addEventListener("click",click);return b;
}
function sec(name){const b=h("section","panel");if(name)b.setAttribute("aria-label",name);return b;}
function p(text,cls){return h("p",cls||"",text);}
function summaryRow(label,value,large=false){
  return box("summary-row"+(large?" large":""),h("span","",label),h("strong","",value));
}
function ribbonProgress(){
 const state=stage==="landing"?"0":stage==="checkout"?"0":stage==="offer"?"1":"2";
 const wrap=h("div","steps");
 for(const [i,title] of ["La scelta","Le offerte","Il riepilogo"].entries()){
   const current=i===Number(state),complete=i<Number(state);
   wrap.append(box("step"+(current?" current":"")+(complete?" complete":""),
     h("span","number",complete?"✓":String(i+1)),h("span","",title)));
 }
 return wrap;
}
function productIllustration(){
 const jar=box("jar",h("span","brandjar","MENTAL"));
 const pro=h("b","","pro");jar.querySelector(".brandjar").append(pro);
 jar.append(h("div","jarline"),h("small","","FORMULA SENZA MELATONINA"),h("small","","MENTAL PRO"));
 return box("product-illustration",h("div","glow"),jar,h("span","art-label","Immagine stilizzata · demo"));
}
function hero(){
 const wrap=h("section","hero");
 const copy=h("div","hero-copy");
 copy.append(h("span","kicker",config.brand.eyebrow),h("h1","",config.brand.headline),p(config.brand.intro),
    box("pills",h("span","pill",config.brand.badge),h("span","pill","Acquisto libero · nessun abbonamento")));
 wrap.append(copy,productIllustration());
 return wrap;
}
function addSaving(m,context){
 if(m.savingCents<=0)return p("Il prezzo unitario è sempre visibile prima della scelta.","fine");
 const text="Risparmio rispetto a "+m.quantity+" confezioni singole: "+api.money(m.savingCents)+".";
 return p(context ? "✓ "+text : text,"proof");
}
function orderSnapshot(opts={}){
 const m=api.metrics(config,quantity,total);
 const summary=sec("Totale dell'ordine simulato");
 summary.append(h("div","card-heading",opts.heading||"LA TUA SCELTA"),summaryRow("Confezioni totali",String(quantity)),
   summaryRow("Prezzo medio per confezione",api.money(m.unitCents)),h("hr","divider"),summaryRow("Totale simulato",api.money(total),true));
 if(m.savingCents>0)summary.append(addSaving(m));
 return summary;
}
function disclaimer(){return p(config.brand.reassurance,"fine center");}
function jump(){
 window.scrollTo({top:0,behavior:"instant"});
}
function goCheckout(){
 api.logEvent("checkout_started");
 stage="checkout";render();jump();
}
function simulatePrimary(){
 api.logEvent("primary_simulated",{totalCents:total});
 history=[{label:config.base.label,qty:1,cents:baseCents}];
 position=0;
 if(active.length){showOffer(active[0]);return;}
 finish();
}
function showOffer(key){
 currentOffer=key;stage="offer";
 api.logEvent("offer_shown",{offer:key,totalCents:total});
 render();jump();
}
function decision(yes){
 if(stage!=="offer"||!currentOffer)return;
 const key=currentOffer,offer=config.offers[key];
 if(yes){
   const cost=api.cents(offer.price);
   total+=cost;quantity+=offer.qty;
   history.push({label:offer.label,qty:offer.qty,cents:cost});
   api.logEvent("offer_accepted",{offer:key,totalCents:total});
 }else api.logEvent("offer_declined",{offer:key,totalCents:total});
 if(key==="D"){finish();return;}
 if(!yes){
   if(config.offers.D.enabled){showOffer("D");return;}
   finish();return;
 }
 position++;
 if(position<active.length){showOffer(active[position]);return;}
 finish();
}
function finish(){
 currentOffer=null;stage="done";
 if(!finished){api.logEvent("finished",{totalCents:total});finished=true;}
 render();jump();
}
function restart(){
 stage="landing";currentOffer=null;position=0;finished=false;history=[];
 total=baseCents;quantity=config.base.qty;render();jump();
}
function intro(){
 const section=h("div","intro-strip");
 section.append(h("span","kicker","ANTEPRIMA FUNNEL MENTAL PRO"),h("h2","","Prova la tua prossima pagina di vendita."),p("Un percorso chiaro, mobile-first e senza passaggi superflui.","lede"));
 return section;
}
function renderLanding(){
 const grid=h("div","grid-main");
 const left=sec("Mental Pro · presentazione");
 left.append(h("div","card-heading","PERCHÉ MENTAL PRO"),h("h2","","Senza melatonina. Senza il solito copione."),
 p("Una proposta che mette in primo piano la formula e la trasparenza, senza promettere risultati impossibili."),
 box("list-plain",
   box("",h("span","tick","✓"),h("span","","Senza melatonina né estratti vegetali")),
   box("",h("span","tick","✓"),h("span","","Puoi confrontare il prezzo per confezione")),
   box("",h("span","tick","✓"),h("span","","Nessuna offerta è obbligatoria"))
 ));
 const right=sec("Acquisto di prova");
 right.append(h("div","card-heading","IL PUNTO DI PARTENZA"),h("h3","",config.base.label),p(config.base.intro,"small"),
 h("div","price",api.money(baseCents)),p("Prezzo della confezione iniziale.","small"),
 box("action-stack",btn("Scopri l'offerta iniziale  →","primary full",goCheckout)),disclaimer());
 grid.append(left,right);return grid;
}
function renderCheckout(){
 const grid=h("div","grid-main");
 const main=sec("Conferma simulata");
 main.append(h("span","kicker","PASSAGGIO 1 · CONFEZIONE SINGOLA"),
 h("h2","",config.base.headline),p(config.base.intro),h("hr","divider"),
 summaryRow(config.base.label,api.money(baseCents),true),
 h("div","notice","Questa è una prova: cliccando non verrà effettuato alcun pagamento, né creato un vero ordine."),
 box("action-stack",btn("Simula l'acquisto da "+api.money(baseCents)+" →","primary full",simulatePrimary),
 btn("← Torna alla presentazione","ghost full",restart)),
 disclaimer());
 grid.append(main,orderSnapshot({heading:"RIEPILOGO INIZIALE"}));return grid;
}
function renderOffer(){
 const offer=config.offers[currentOffer];
 const m=api.metrics(config,quantity+offer.qty,total+api.cents(offer.price));
 const pane=sec("Offerta facoltativa");
 const prefix=currentOffer==="D"?"ALTERNATIVA PIÙ LEGGERA":"OFFERTA AGGIUNTIVA · FACOLTATIVA";
 pane.append(h("span","kicker",prefix),h("h2","",offer.headline),p(offer.body),
   box("offerbox",
     box("offerhead",h("div","offer-symbol","✦"),box("",h("h3","",offer.label),p("Da aggiungere solo se accetti.","small"))),
     h("hr","divider"),summaryRow("Importo aggiuntivo",api.money(api.cents(offer.price)),true),
     summaryRow("Nuovo totale se accetti",api.money(m.totalCents)),
     box("compare",
       box("",h("small","","Confezioni"),h("b","",String(m.quantity))),
       box("",h("small","","€/confezione"),h("b","",api.money(m.unitCents))),
       box("save",h("small","","Risparmio vs singole"),h("b","",api.money(m.savingCents)))
     ),addSaving(m,true)));
 pane.append(box("action-stack",
   btn(offer.yes+" · +"+api.money(api.cents(offer.price)),"primary full",()=>decision(true)),
   btn(offer.no,"secondary full",()=>decision(false))),
   p("Decidi tu. Il prezzo aggiuntivo non verrà applicato se rifiuti.","fine center"),disclaimer());
 const sidebar=orderSnapshot({heading:"ORDINE PRIMA DI QUESTA OFFERTA"});
 return box("grid-main",pane,sidebar);
}
function renderDone(){
 const wrap=box("grid-main");
 const main=sec("Fine simulazione");
 main.append(h("div","checkmark","✓"),h("h2","center","Hai completato la prova."),p("Questo è il riepilogo del percorso scelto. Nessun pagamento è stato eseguito.","center"),
 h("hr","divider"),h("div","card-heading","DETTAGLIO DELLA SIMULAZIONE"));
 for(const line of history)main.append(summaryRow(line.label+" · "+line.qty+" conf.",api.money(line.cents)));
 const met=api.metrics(config,quantity,total);
 main.append(h("hr","divider"),summaryRow("Totale simulato",api.money(total),true));
 if(met.savingCents>0)main.append(addSaving(met));
 main.append(box("action-stack",btn("Ricomincia la simulazione ↻","primary full",restart),
  btn("Apri la dashboard demo ⚙","secondary full",()=>{location.href="./admin.html";})),disclaimer());
 wrap.append(main,orderSnapshot({heading:"ESITO DEL PERCORSO"}));return wrap;
}
function render(){
 app.replaceChildren();
 if(stage==="landing"){app.append(intro(),hero(),renderLanding());return;}
 app.append(ribbonProgress());
 if(stage==="checkout")app.append(renderCheckout());
 if(stage==="offer")app.append(renderOffer());
 if(stage==="done")app.append(renderDone());
}
api.logEvent("open");
render();
})();
