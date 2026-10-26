/* Moduli autonomi, solo operazioni nel browser. */
(() => {
"use strict";
const ST={
  $:id=>document.getElementById(id),
  el:(tag,cls="",text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x;},
  add(parent,tag,cls="",text){const x=this.el(tag,cls,text);parent.appendChild(x);return x;},
  clear(node){node.replaceChildren();},
  status(id,text,isError=false){const n=this.$(id);if(!n)return;n.textContent=text;n.className="st-status"+(isError?" is-error":"");},
  mean(a){return a.length?a.reduce((s,n)=>s+n,0)/a.length:null;},
  round(n,dec=0){return n===null?"—":n.toLocaleString("it-IT",{maximumFractionDigits:dec,minimumFractionDigits:dec});},
  fmtMinutes(n){if(n===null||!Number.isFinite(n))return "—";const x=Math.round(n);return Math.floor(x/60)+" h "+String(x%60).padStart(2,"0")+" min";},
  parseTime(t){return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(t)?Number(t.slice(0,2))*60+Number(t.slice(3)):NaN;},
  time(n){const x=((Math.round(n)%1440)+1440)%1440;return String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0");},
  forward(a,b){return (b-a+1440)%1440;},
  number(v,min,max){const n=Number(v);return v!==""&&Number.isFinite(n)&&n>=min&&n<=max?n:NaN;},
  metric(parent,label,value){const card=this.add(parent,"div","st-metric");this.add(card,"span","",label);this.add(card,"strong","",value);return card;},
  item(parent,title,desc){const block=this.add(parent,"div","st-item");this.add(block,"strong","",title);this.add(block,"p","",desc);return block;},
  note(parent,text,warn=false){return this.add(parent,"div","st-note"+(warn?" st-warning":""),text);},
  saveFile(filename,text,type="text/plain;charset=utf-8"){
    const url=URL.createObjectURL(new Blob([text],{type}));
    const a=this.el("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),12000);
  },
  csvQuote(value){let s=String(value??"");if(/^[ \t]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';},
  print(id){this.$(id)?.addEventListener("click",()=>window.print());}
};
window.SleepLabTools=ST;
const kind=document.body.dataset.tool;
if(!["check-up","caffeina","diario-pro","turnisti"].includes(kind))return;
const script=document.createElement("script");script.src="../"+kind+".js";
script.addEventListener("error",()=>{const container=document.querySelector(".st-status");if(container){container.textContent="Il modulo non si è caricato. Ricarica la pagina.";container.classList.add("is-error")}});
document.head.appendChild(script);
})();