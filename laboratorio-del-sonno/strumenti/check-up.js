/* Check-up del Sonno — Mappa di abitudini originale NON validata clinicamente. */
(() => {
"use strict";
const T=window.SleepLabTools;if(!T)return;
const {$,add,clear,status,item,note}= {
 $:T.$,add:T.add.bind(T),clear:T.clear.bind(T),status:T.status.bind(T),item:T.item.bind(T),note:T.note.bind(T)
};
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
const guidance={
 "Regolarità":"Osserva per almeno una settimana quanto cambiano gli orari di sonno e risveglio, prima di trarre conclusioni.",
 "Ambiente":"Esamina luce, rumori, temperatura e interruzioni. Identifica l'elemento che puoi modificare più facilmente.",
 "Abitudini":"Segna gli orari di caffeina, attività serali e pasti. Il calcolatore della caffeina permette una simulazione degli orari.",
 "Esperienza percepita":"La qualità percepita è importante, ma non indica da sola una causa o una diagnosi. Difficoltà persistenti meritano un confronto sanitario."
};
const container=$("check-questions");
questions.forEach(([domain,q],i)=>{
 if(i%3===0)add(container,"h3","",domain);
 const group=add(container,"fieldset","st-question");add(group,"legend","",(i+1)+". "+q);
 const choices=add(group,"div","st-question-options");
 [["0","Mai o quasi"],["1","A volte"],["2","Spesso"]].forEach(([value,label])=>{
  const row=add(choices,"label"),input=add(row,"input");
  input.type="radio";input.name="q"+i;input.value=value;input.required=true;
  add(row,"span","",label);
 });
});
const form=$("check-form"),result=$("check-result"),actions=$("check-actions");
form.addEventListener("reset",()=>{clear(result);actions.hidden=true;status("check-status","");container.querySelectorAll("fieldset").forEach(x=>x.style.outline="")});
form.addEventListener("submit",event=>{
 event.preventDefault();
 const inputs=questions.map((_,i)=>form.querySelector('input[name="q'+i+'"]:checked'));
 const missing=inputs.findIndex(x=>!x);
 if(missing!==-1){
  const group=container.querySelectorAll("fieldset")[missing];
  group.style.outline="3px solid #b64634";group.style.outlineOffset="4px";
  status("check-status","Completa la domanda "+(missing+1)+" evidenziata in rosso.",true);
  group.scrollIntoView({behavior:"smooth",block:"center"});
  group.querySelector("input").focus({preventScroll:true});
  return;
 }
 container.querySelectorAll("fieldset").forEach(x=>x.style.outline="");
 const domains={};
 questions.forEach(([name],i)=>{(domains[name]??=[]).push(Number(inputs[i].value))});
 const ordered=Object.entries(domains).map(([name,values])=>({name,score:values.reduce((a,b)=>a+b,0)})).sort((a,b)=>b.score-a.score);
 clear(result);
 add(result,"div","st-tag","MAPPA EDUCATIVA · 12 RISPOSTE");
 add(result,"h3","st-result-title","Quattro aree da osservare");
 add(result,"p","","I livelli mostrano soltanto la frequenza delle risposte scelte, non la presenza di malattie o un giudizio sulla qualità del tuo sonno.");
 for(const d of ordered){
  const block=add(result,"div","st-domain");
  const level=d.score<=1?"Poco segnalato":d.score<=3?"Da osservare":"Spesso segnalato";
  add(block,"strong","",d.name+" — "+level);
  const track=add(block,"div","st-progress"),bar=add(track,"span");bar.style.width=(d.score/6*100)+"%";
  add(block,"small","",guidance[d.name]);
 }
 note(result,"Questa non è una scala clinica validata né uno screening diagnostico. Se hai forte sonnolenza diurna, russamento con pause respiratorie osservate o difficoltà persistenti, rivolgiti a un sanitario.",true);
 const row=add(result,"div","st-row st-no-print"),a=add(row,"a","st-button st-alt","Leggi gli articoli dell'Accademia ↗");a.href="../../../accademia/index.html";
 actions.hidden=false;
 status("check-status","Mappa creata. Usa Stampa per salvarne una copia in PDF.");
 result.scrollIntoView({behavior:"smooth",block:"start"});
});
T.print("check-print");
})();