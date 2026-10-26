/* Check-up del Sonno — questionario educativo originale, NON clinicamente validato.
   I colori e le barre descrivono le risposte, non uno stato di salute. */
(() => {
"use strict";
const T=window.SleepLabTools;
if(!T)return;
const $=T.$,add=T.add.bind(T),clear=T.clear.bind(T),status=T.status.bind(T),note=T.note.bind(T);
const questions=[
 ["Regolarità","L'ora in cui vado a dormire cambia di oltre un'ora tra un giorno e l'altro."],
 ["Regolarità","L'ora della sveglia varia molto durante la settimana."],
 ["Regolarità","Nei giorni liberi sposto parecchio più tardi il sonno e il risveglio."],
 ["Ambiente","Luce artificiale o schermi luminosi disturbano la mia preparazione al sonno."],
 ["Ambiente","Rumori o interruzioni dell'ambiente rendono difficile riposare."],
 ["Ambiente","Temperatura, aria o condizioni della stanza mi sembrano poco confortevoli."],
 ["Abitudini","Consumo bevande con caffeina nelle ore vicine al riposo."],
 ["Abitudini","Arrivo al momento di dormire ancora impegnato in attività stimolanti."],
 ["Abitudini","Ceno molto tardi o mantengo orari dei pasti molto variabili."],
 ["Esperienza percepita","Mi capita spesso di non sentirmi riposato al mattino."],
 ["Esperienza percepita","Avverto una difficoltà percepita ad addormentarmi."],
 ["Esperienza percepita","Mi capita di svegliarmi durante la notte e faticare a riprendere il sonno."]
];
const names=["Regolarità","Ambiente","Abitudini","Esperienza percepita"];
const scales=[
 {label:"Area abbastanza favorevole",color:"#27736b",explain:"Hai riferito poche difficoltà relative a quest'area."},
 {label:"Qualche aspetto da osservare",color:"#ba9451",explain:"Alcuni elementi ricorrono nelle tue risposte e può essere utile osservarli."},
 {label:"Più elementi da rivedere",color:"#c47743",explain:"Diversi elementi ricorrono nelle risposte: può essere utile esaminarli con più attenzione."},
 {label:"Area da attenzionare",color:"#a94e45",explain:"In quest'area hai indicato spesso le difficoltà considerate nelle domande; è un invito ad approfondire, non una diagnosi."}
];
const guidance={
 "Regolarità":[
  "Le risposte non evidenziano cambi frequenti degli orari. Continua a osservare la regolarità anche nei giorni liberi.",
  "Alcuni orari sembrano variare durante la settimana. Confronta orario del sonno e risveglio per qualche giorno.",
  "Sono state riferite più variazioni degli orari. Un diario può aiutarti a capire quando si verificano.",
  "La variabilità degli orari ricorre nelle tue risposte. Può essere utile approfondirla con un diario e, se necessario, un professionista."
 ],
 "Ambiente":[
  "Non segnali spesso disturbi legati alla stanza. Se vuoi rifinire l'ambiente, osserva luce, rumore e temperatura.",
  "Qualche elemento ambientale merita una verifica, come luce serale, rumore o comfort della stanza.",
  "L'ambiente viene segnalato più volte. Individua quali elementi puoi modificare senza stravolgere la routine.",
  "Le condizioni ambientali ricorrono spesso nelle tue risposte. Distingui i fattori modificabili dalle interruzioni che richiedono altre soluzioni."
 ],
 "Abitudini":[
  "Le risposte non segnalano spesso abitudini serali potenzialmente sfavorevoli. Continua a osservare caffeina, attività e pasti.",
  "Qualche abitudine serale merita attenzione. Annotare orari di caffeina e attività può essere un buon inizio.",
  "Diverse abitudini sono state segnalate. Prova a capire quali si ripetono e con quali orari.",
  "Più abitudini vengono riferite spesso. Un monitoraggio semplice può aiutare a stabilire da dove cominciare."
 ],
 "Esperienza percepita":[
  "Hai riferito raramente le difficoltà percepite descritte nelle domande. Questo non equivale a certificare un sonno sano.",
  "Qualche difficoltà percepita compare nelle risposte. Osserva quando emerge e se è ricorrente.",
  "Le difficoltà percepite compaiono più spesso. Se persistono o incidono sulla giornata, parlane con un sanitario.",
  "Riferisci spesso le difficoltà considerate. Un confronto sanitario è opportuno soprattutto se persistono o provocano sonnolenza importante."
 ]
};
const actionsByArea={
 "Regolarità":{label:"Registra 14 notti nel Diario del Sonno",href:"../../diario/index.html"},
 "Ambiente":{label:"Leggi la guida su luce e ritmo circadiano",href:"../../../accademia/luce-e-ritmo-circadiano/index.html"},
 "Abitudini":{label:"Prova il Calcolatore della Caffeina",href:"../caffeina/index.html"},
 "Esperienza percepita":{label:"Osserva il tuo sonno con il Diario",href:"../../diario/index.html"}
};

// Ogni area contiene 3 domande, ciascuna codificata 0 (mai), 1 (a volte), 2 (spesso).
// Le quattro fasce sono descrizioni redazionali NON validate, non cutoff clinici.
function classify(score){
 if(!Number.isInteger(score)||score<0||score>6)throw Error("Punteggio descrittivo fuori intervallo.");
 return score<=1?0:score<=3?1:score<=5?2:3;
}
function modelFromAnswers(answers){
 if(!Array.isArray(answers)||answers.length!==12||
  answers.some(value=>!Number.isInteger(value)||value<0||value>2)){
  throw Error("Sono necessarie 12 risposte fra Mai, A volte e Spesso.");
 }
 return names.map((name,index)=>{
  const score=answers.slice(index*3,index*3+3).reduce((a,b)=>a+b,0);
  const level=classify(score);
  return {name,score,level,scale:scales[level],barPercent:(6-score)/6*100};
 });
}
function summaryForAreas(areas){
 const favorable=areas.filter(a=>a.level===0).length;
 const moderate=areas.filter(a=>a.level===1).length;
 const review=areas.filter(a=>a.level===2).length;
 const priority=areas.filter(a=>a.level===3).length;
 let title,description;
 if(favorable===4){
  title="Pochi aspetti da rivedere nelle quattro aree";
  description="Nelle ultime due settimane hai riferito raramente le difficoltà descritte nelle domande. È un risultato favorevole rispetto a queste risposte, non una certificazione della qualità del sonno.";
 }else if(favorable>=3){
  title="Prevalgono aree abbastanza favorevoli";
  description="In "+favorable+" aree su quattro hai segnalato poche difficoltà. Le altre meritano uno sguardo mirato, senza interpretare questo risultato come una diagnosi.";
 }else if(priority>=2||review+priority>=3){
  title="Più aree meritano di essere approfondite";
  description="Hai riferito diverse difficoltà in più ambiti del questionario. Queste risposte possono orientare l'osservazione, ma non stabiliscono cause, gravità o trattamenti.";
 }else if(favorable>=2){
  title="Diversi aspetti appaiono favorevoli";
  description="Due o più aree presentano poche difficoltà riferite; altre potrebbero meritare attenzione. Leggi soprattutto le note associate alle singole aree.";
 }else{
  title="Emergono alcune aree da osservare";
  description="Le risposte evidenziano alcuni elementi ricorrenti. Non è un giudizio sul tuo sonno: serve a scegliere che cosa monitorare più da vicino.";
 }
 const focus=areas.filter(a=>a.level>=2).map(a=>a.name);
 return {title,description,favorable,moderate,review,priority,focus};
}
// Ogni spicchio ha esattamente il 25% della torta.
// Non confronta percentuali fra aree né compone un indice generale.
function donutGradient(areas){
 if(!Array.isArray(areas)||areas.length!==4)throw Error("Il grafico richiede quattro aree.");
 const parts=[];
 for(let i=0;i<4;i++){
  const a=i*25,b=a+25,c=areas[i].scale.color;
  parts.push(c+" "+a+"% "+(b-0.75)+"%");
  parts.push("#f6f5ec "+(b-0.75)+"% "+b+"%");
 }
 return "conic-gradient(from -90deg,"+parts.join(",")+")";
}
const container=$("check-questions"),form=$("check-form"),result=$("check-result"),actions=$("check-actions"),report=$("check-report");
questions.forEach(([domain,q],i)=>{
 if(i%3===0)add(container,"h3","",domain);
 const group=add(container,"fieldset","st-question");
 add(group,"legend","",(i+1)+". "+q);
 const choices=add(group,"div","st-question-options");
 [["0","Mai o quasi"],["1","A volte"],["2","Spesso"]].forEach(([value,label])=>{
  const row=add(choices,"label"),input=add(row,"input");
  input.type="radio";input.name="q"+i;input.value=value;input.required=true;
  add(row,"span","",label);
  input.addEventListener("change",()=>{group.style.outline="";status("check-status","")});
 });
});
function hideReport(){
 clear(result);actions.hidden=true;report.hidden=true;
}
form.addEventListener("change",()=>{
 if(!report.hidden||result.children.length){
  hideReport();
  status("check-status","Hai modificato una risposta: premi «Genera la mia mappa» per un report aggiornato.");
 }
});
form.addEventListener("reset",()=>{
 hideReport();
 status("check-status","");
 container.querySelectorAll("fieldset").forEach(x=>x.style.outline="");
});
function renderArea(parent,area){
 const state=area.scale;
 const block=add(parent,"article","check-area check-area-level-"+area.level);
 const heading=add(block,"div","check-area-head");
 const title=add(heading,"h3","",area.name);
 add(heading,"span","check-level-badge",state.label);
 const track=add(block,"div","check-positive-track");
 track.setAttribute("role","img");
 track.setAttribute("aria-label",area.name+": "+state.label+". La barra più piena corrisponde a meno difficoltà riferite; non è un punteggio clinico.");
 const fill=add(track,"span","check-positive-fill");
 fill.style.width=area.barPercent+"%";
 const description=add(block,"p","check-area-description",guidance[area.name][area.level]);
 const detail=add(block,"p","check-area-detail",state.explain);
 const linkDef=actionsByArea[area.name];
 const link=add(block,"a","check-area-action",linkDef.label+" ↗");
 link.href=linkDef.href;
 return block;
}
function renderDonut(parent,areas){
 const overview=summaryForAreas(areas);
 const section=add(parent,"section","check-summary");
 section.setAttribute("aria-labelledby","check-summary-title");
 add(section,"span","check-summary-eyebrow","QUADRO COMPLESSIVO");
 const chartTitle=add(section,"h3","", "Le quattro aree, insieme.");
 chartTitle.id="check-summary-title";
 const layout=add(section,"div","check-donut-layout");
 const wrap=add(layout,"div","check-donut-wrap");
 const chart=add(wrap,"div","check-donut");
 chart.style.background=donutGradient(areas);
 chart.setAttribute("role","img");
 chart.setAttribute("aria-label","Quattro spicchi uguali. "+areas.map(a=>a.name+": "+a.scale.label).join("; ")+". Il colore rappresenta una categoria descrittiva, non la percentuale di salute.");
 const hole=add(chart,"div","check-donut-hole");
 add(hole,"span","check-donut-overline","LA TUA MAPPA");
 add(hole,"strong","","4 aree");
 add(hole,"small","","non un voto");
 const legend=add(layout,"div","check-donut-legend");
 for(const area of areas){
  const row=add(legend,"div","check-legend-row");
  const dot=add(row,"span","check-legend-dot");dot.style.backgroundColor=area.scale.color;dot.setAttribute("aria-hidden","true");
  const words=add(row,"div","");
  add(words,"strong","",area.name);
  add(words,"span","",area.scale.label);
 }
 const take=add(section,"div","check-summary-takeaway");
 add(take,"span","check-takeaway-tag","IN SINTESI");
 add(take,"h4","",overview.title);
 add(take,"p","",overview.description);
 if(overview.focus.length){
  add(take,"p","check-takeaway-focus",
   "Aree da approfondire: "+overview.focus.join(", ")+". Le informazioni si riferiscono esclusivamente alle risposte di questo questionario.");
 }
 add(section,"p","check-donut-explain",
  "I quattro spicchi sono uguali: nessuna area pesa più delle altre e il grafico non rappresenta percentuali né la qualità complessiva del sonno. I colori riassumono soltanto le risposte dichiarate.");
 return section;
}
function render(answers,isDemo=false){
 const areas=modelFromAnswers(answers);
 hideReport();
 report.hidden=false;
 if(isDemo)add(result,"div","check-demo-flag","ESEMPIO DIMOSTRATIVO · RISPOSTE INVENTATE");
 add(result,"div","st-tag","MAPPA EDUCATIVA · 12 RISPOSTE");
 add(result,"p","check-map-opening","Partiamo dalle quattro aree. Qui una barra più piena indica meno difficoltà riferite, non un voto sulla salute.");
 const grid=add(result,"div","check-area-grid");
 for(const a of areas)renderArea(grid,a);
 renderDonut(result,areas);
 note(result,"Questo questionario originale non è una scala clinica validata e non formula diagnosi. Se hai sonnolenza marcata, pause respiratorie osservate durante il sonno o difficoltà persistenti, rivolgiti a un professionista sanitario.",true);
 const row=add(result,"div","st-row st-no-print check-next-links");
 const diary=add(row,"a","st-button st-alt","Apri il Diario del Sonno ↗");
 diary.href="../../diario/index.html";
 const learn=add(row,"a","st-button st-alt","Approfondisci nell'Accademia ↗");
 learn.href="../../../accademia/index.html";
 actions.hidden=false;
 status("check-status",isDemo?
  "Hai aperto un esempio dimostrativo: nessuna risposta personale è stata utilizzata.":
  "Il report aggiornato è pronto: le barre sono positive e il grafico finale riassume le quattro aree.");
 report.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth",block:"start"});
}
$("check-demo").addEventListener("click",()=>{
 // Tre aree favorevoli, una con qualche aspetto da osservare.
 // Le risposte eventualmente selezionate nel modulo rimangono inalterate.
 render([0,0,0,0,1,0,1,1,1,0,0,0],true);
 status("check-status","Esempio con risposte inventate: puoi tornare al modulo e generare la tua vera mappa.");
});
form.addEventListener("submit",event=>{
 event.preventDefault();
 const inputs=questions.map((_,i)=>form.querySelector('input[name="q'+i+'"]:checked'));
 const missing=inputs.findIndex(x=>!x);
 container.querySelectorAll("fieldset").forEach(x=>x.style.outline="");
 if(missing!==-1){
  hideReport();
  const group=container.querySelectorAll("fieldset")[missing];
  group.style.outline="3px solid #b64634";
  group.style.outlineOffset="4px";
  status("check-status","Completa la domanda "+(missing+1)+" evidenziata in rosso.",true);
  group.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth",block:"center"});
  group.querySelector("input").focus({preventScroll:true});
  return;
 }
 render(inputs.map(x=>Number(x.value)));
});
T.print("check-print");
})();