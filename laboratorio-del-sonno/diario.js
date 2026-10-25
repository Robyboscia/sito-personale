/* Laboratorio del Sonno — diario digitale 14 giorni.
   Nessuna chiamata di rete. Persistenza opzionale, solo nel browser corrente. */
(() => {
  "use strict";
  const KEY = "roberto-boscia.sleep-diary.v1";
  const TOTAL = 14;
  const FIELDS = ["wakeDate","bedTime","tryTime","latency","waso","awakenings","finalWake","outTime","quality","energy","naps","notes"];
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const $ = (id) => document.getElementById(id);
  const form = $("sd-form");
  if (!form) return;

  const picker = $("sd-day-picker");
  const persist = $("sd-persist");
  let entries = Array(TOTAL).fill(null);
  let current = 0;
  let dirty = false;

  function mins(t) {
    if (!TIME_RE.test(t)) return NaN;
    const [hh,mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  }
  function forward(from,to) {
    let n = to - from;
    if (n < 0) n += 1440;
    return n;
  }
  function numeric(v, max, required) {
    if (v === "" || v === null || v === undefined) return required ? NaN : null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n <= max ? n : NaN;
  }

  // L'incoerenza fra due orari non permette di sapere quale sia sbagliato:
  // in quel caso evidenziamo tutte le caselle da controllare.
  class DiaryFieldError extends Error {
    constructor(message,fields) {super(message);this.name="DiaryFieldError";this.fields=fields;}
  }
  function calculate(data) {
    const bed=mins(data.bedTime), attempt=mins(data.tryTime),
          waking=mins(data.finalWake), rising=mins(data.outTime);
    const sol=numeric(data.latency,600,true),waso=numeric(data.waso,600,false);
    for(const [name,value] of [
      ["bedTime",bed],["tryTime",attempt],["latency",sol],
      ["waso",waso],["finalWake",waking],["outTime",rising]
    ]) if(value !== null && !Number.isFinite(value)) {
      throw new DiaryFieldError("Controlla questo orario o questa durata: il valore non è valido.",[name]);
    }
    const before=forward(bed,attempt),night=forward(attempt,waking),after=forward(waking,rising);
    const tib=before+night+after;
    if(night<1)throw new DiaryFieldError(
      "L'ora del tentativo di dormire coincide con il risveglio finale. Controlla entrambi gli orari.",
      ["tryTime","finalWake"]);
    if(before>360)throw new DiaryFieldError(
      "Risultano più di 6 ore fra l'ingresso a letto e il tentativo di dormire. Verifica i due orari.",
      ["bedTime","tryTime"]);
    if(after>360)throw new DiaryFieldError(
      "Risultano più di 6 ore fra il risveglio finale e l'uscita dal letto. Verifica i due orari.",
      ["finalWake","outTime"]);
    if(tib<60||tib>1080)throw new DiaryFieldError(
      "Gli orari indicano meno di un'ora o più di 18 ore a letto. Controlla gli orari evidenziati, anche rispetto alla mezzanotte.",
      ["bedTime","tryTime","finalWake","outTime"]);
    // Se la fascia dei risvegli non è indicata, NON inventiamo zero risvegli:
    // semplicemente non applichiamo la sottrazione e segnaliamo la stima parziale.
    const hasWakeEstimate=waso!==null;
    const tst=night-sol-(hasWakeEstimate?waso:0);
    if(tst<0)throw new DiaryFieldError(
      "Il tempo per addormentarti e la stima dei risvegli superano il periodo notturno. Ricontrolla i dati evidenziati.",
      hasWakeEstimate?["latency","waso","tryTime","finalWake"]:["latency","tryTime","finalWake"]);
    if(data.awakenings==="0"&&waso>0)throw new DiaryFieldError(
      "Hai indicato zero risvegli ma anche tempo sveglio durante la notte. Controlla questi due campi.",
      ["awakenings","waso"]);
    if(Number(data.awakenings)>0 && waso===0)throw new DiaryFieldError(
      "Hai indicato dei risvegli ma selezionato 'Non ho avuto risvegli'. Controlla i due campi.",
      ["awakenings","waso"]);
    return {tib,tst,sol,waso,hasWakeEstimate,partial:!hasWakeEstimate,efficiency:(tst/tib)*100};
  }
  // Le schede già registrate con i vecchi minuti esatti non vengono cancellate:
  // una voce temporanea mantiene il valore precedente, senza inventare una fascia.
  const WASO_RANGES={"0":"Nessun risveglio","5":"Meno di 10 minuti","20":"10–30 minuti","45":"30–60 minuti","90":"Più di un'ora"};
  function wakeRangeLabel(value) {
    if(value===""||value===null||value===undefined)return "Non indicato";
    return WASO_RANGES[String(value)]||("Dato precedente: "+value+" minuti");
  }
  function blankForm() {
    const select=form.elements.namedItem("waso");
    [...select.querySelectorAll('option[data-previous-value]')].forEach(option=>option.remove());
    FIELDS.forEach(name=>{form.elements.namedItem(name).value="";});
  }
  function showMessage(message, kind = "info") {
    const el = $("sd-form-message");
    el.textContent = message;
    el.className = "sd-feedback" + (kind === "error" ? " is-error" : kind === "success" ? " is-success" : "");
  }

  // Mostra un bordo rosso, un messaggio sotto il campo e lo segnala
  // alle tecnologie assistive; sposta poi l'attenzione sulla prima casella.
  function clearFieldError(input) {
    if(!input||!input.name)return;
    const label=input.closest("label");
    input.removeAttribute("aria-invalid");
    if(input.name==="waso")input.setAttribute("aria-describedby","sd-waso-help");
    else input.removeAttribute("aria-describedby");
    label?.classList.remove("sd-has-error");
    label?.querySelector(".sd-field-error")?.remove();
  }
  function clearAllFieldErrors() {
    FIELDS.forEach(name=>clearFieldError(form.elements.namedItem(name)));
  }
  function highlightField(name,message) {
    const input=form.elements.namedItem(name);
    if(!input)return;
    const label=input.closest("label");
    if(!label)return;
    label.classList.add("sd-has-error");
    input.setAttribute("aria-invalid","true");
    const note=document.createElement("small");
    note.id="sd-error-"+name;
    note.className="sd-field-error";
    note.textContent=message;
    label.appendChild(note);
    input.setAttribute("aria-describedby",name==="waso"?"sd-waso-help "+note.id:note.id);
  }
  function showValidationError(message,fields,shortMessage) {
    clearAllFieldErrors();
    const names=[...new Set(fields)].filter(name=>form.elements.namedItem(name));
    names.forEach(name=>highlightField(name,shortMessage||(names.length>1?
      "Controlla questa casella insieme alle altre evidenziate.":message)));
    showMessage(message+" Ho evidenziato "+(names.length>1?
      "le caselle da controllare.":"la casella da correggere."),"error");
    const first=names.length?form.elements.namedItem(names[0]):null;
    if(first) {
      first.focus({preventScroll:true});
      first.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});
    }
  }

  function privacyFeedback(message) {
    $("sd-privacy-feedback").textContent = message;
  }
  function validateImportedEntry(source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;
    const data = {};
    for (const name of FIELDS) {
      const value = source[name];
      data[name] = typeof value === "string" ? value.slice(0,name === "notes" ? 500 : 32) : "";
    }
    if (data.wakeDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.wakeDate)) return null;
    try { calculate(data); } catch { return null; }
    return data;
  }
  function loadLocalIfChosenPreviously() {
    let raw;
    try { raw = localStorage.getItem(KEY); } catch { return; }
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1 || !Array.isArray(saved.entries) || saved.entries.length !== TOTAL) return;
      entries = saved.entries.map(validateImportedEntry);
      persist.checked = true;
      privacyFeedback("Hai scelto in precedenza il salvataggio locale. Le schede rimangono solo in questo browser finché non le elimini.");
    } catch { /* dati locali illeggibili: non usarli */ }
  }
  function persistData() {
    if (!persist.checked) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({version:1, entries}));
    } catch {
      persist.checked = false;
      privacyFeedback("Il browser non consente il salvataggio locale. Le schede rimangono disponibili solo finché la pagina è aperta: esportale in CSV.");
    }
  }
  function stopPersisting() {
    try { localStorage.removeItem(KEY); } catch { /* storage disabilitato */ }
  }
  function askBeforeLosingChanges() {
    return !dirty || window.confirm("Hai modifiche non salvate in questa scheda. Vuoi cambiare giorno e perderle?");
  }
  function openDay(index) {
    if (index === current) return;
    if (!askBeforeLosingChanges()) return;
    current = index;
    fillForm();
    renderPicker();
    showMessage("");
  }
  function fillForm() {
    const entry = entries[current];
    blankForm();
    clearAllFieldErrors();
    if(entry&&entry.waso!==""&&entry.waso!=null){
      const select=form.elements.namedItem("waso");
      if(![...select.options].some(option=>option.value===entry.waso)){
        const option=document.createElement("option");
        option.value=entry.waso;
        option.textContent="Dato inserito in precedenza: "+entry.waso+" minuti";
        option.dataset.previousValue="true";
        select.appendChild(option);
      }
    }
    if (entry) for (const name of FIELDS) form.elements.namedItem(name).value = entry[name] ?? "";
    dirty = false;
    $("sd-form-number").textContent = String(current+1).padStart(2,"0");
    $("sd-current-day-title").textContent = "Giorno " + String(current+1).padStart(2,"0");
    $("sd-remove-day").disabled = !entry;
  }
  function renderPicker() {
    picker.replaceChildren();
    entries.forEach((entry,i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sd-day" + (entry ? " is-done" : "") + (i === current ? " is-current" : "");
      b.textContent = String(i+1).padStart(2,"0");
      b.setAttribute("aria-label","Giorno "+(i+1)+(entry?" registrato":" da compilare"));
      b.setAttribute("aria-pressed",String(i === current));
      b.title = "Giorno "+(i+1)+(entry?" — registrato":" — vuoto");
      b.addEventListener("click",()=>openDay(i));
      picker.appendChild(b);
    });
  }
  const average = vals => vals.length ? vals.reduce((sum,n)=>sum+n,0)/vals.length : null;
  function formatSleep(v) {
    if (!Number.isFinite(v)) return "—";
    const n = Math.round(v);
    return Math.floor(n/60) + " h " + String(n%60).padStart(2,"0") + " min";
  }
  function dateLabel(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
    const [year,month,day] = s.split("-");
    return day + "/" + month + "/" + year;
  }
  function renderSummary() {
    const valid = entries.map(entry => entry ? calculate(entry) : null);
    const calculated = valid.filter(Boolean);
    const count = calculated.length;
    const sleep = average(calculated.map(v=>v.tst));
    const efficiency = average(calculated.map(v=>v.efficiency));
    const latency = average(calculated.map(v=>v.sol));
    const partialCount=calculated.filter(v=>v.partial).length;
    const includedCount=count-partialCount;
    const coverage=$("sd-coverage-note");
    if(!count){
      coverage.textContent="Se scegli una fascia di risveglio, il calcolo ne terrà conto. Se la ometti, la stima sarà parziale.";
      coverage.classList.remove("sd-coverage-warning");
    }else if(partialCount){
      coverage.textContent="STIMA PARZIALE: per "+partialCount+" nott"+(partialCount===1?"e":"i")+
        " su "+count+" non hai indicato la fascia dei risvegli. Per quelle notti i minuti sveglio NON sono stati sottratti: durata ed efficienza possono risultare più alte del reale. "+
        (includedCount?"Per le altre "+includedCount+" notti abbiamo usato la fascia scelta.":"Nessuna notte include una fascia dei risvegli.");
      coverage.classList.add("sd-coverage-warning");
    }else{
      coverage.textContent="Tutte le "+count+" notti registrate includono una fascia stimata dei risvegli (selezionata da te): i valori rimangono orientativi.";
      coverage.classList.remove("sd-coverage-warning");
    }
    $("sd-progress").textContent = count + " / " + TOTAL;
    $("sd-progress-fill").style.width = (count / TOTAL * 100) + "%";
    $("sd-stat-days").textContent = String(count);
    $("sd-stat-sleep").textContent = sleep===null?"—":"≈ "+formatSleep(sleep)+(partialCount?" *":"");
    $("sd-stat-efficiency").textContent = efficiency === null ? "—" : "≈ "+Math.round(efficiency)+" %"+(partialCount?" *":"");
    $("sd-stat-latency").textContent = latency === null ? "—" : "≈ "+Math.round(latency)+" min";
    $("sd-export").disabled = !count;
    $("sd-clear").disabled = !count;
    $("sd-email-send").disabled = !count;

    const chart = $("sd-chart");
    chart.replaceChildren();
    valid.forEach((v,i) => {
      const column = document.createElement("div");
      column.className = "sd-chart-column";
      const bar = document.createElement("div");
      bar.className="sd-chart-bar"+(v?" has-data":"")+(v?.partial?" is-partial":"");
      bar.style.height = v ? Math.max(8,Math.min(100,v.tst/720*100)) + "%" : "4px";
      bar.setAttribute("role","img");
      const chartLabel=v?("Giorno "+(i+1)+": circa "+formatSleep(v.tst)+
        (v.partial?" — stima parziale, risvegli non sottratti":" — fascia dei risvegli considerata")):
        ("Giorno "+(i+1)+": non registrato");
      bar.setAttribute("aria-label",chartLabel);
      bar.title=chartLabel;
      const label=document.createElement("span");
      label.textContent=String(i+1).padStart(2,"0")+(v?.partial?"*":"");
      column.append(bar,label);
      chart.appendChild(column);
    });
    const tbody = $("sd-summary-body");
    tbody.replaceChildren();
    entries.forEach((entry,i) => {
      const tr=document.createElement("tr");
      const v=valid[i];
      const cols=[
        "Giorno "+String(i+1).padStart(2,"0"),
        entry ? dateLabel(entry.wakeDate) : "—",
        v ? "≈ "+formatSleep(v.tst)+(v.partial?" *":"") : "—",
        v ? "≈ "+Math.round(v.efficiency)+" %"+(v.partial?" *":"") : "—",
        entry ? wakeRangeLabel(entry.waso) : "—",
        entry && entry.quality ? entry.quality+"/5" : "—"
      ];
      cols.forEach((t,j) => {
        const cell=document.createElement(j===0?"th":"td");
        if(j===0) cell.scope="row";
        cell.textContent=t;
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });
  }
  function gather() {
    const out={};
    FIELDS.forEach(name=>{out[name]=String(form.elements.namedItem(name).value||"").trim()});
    return out;
  }

  function save(event) {
    event.preventDefault();
    clearAllFieldErrors();
    const invalid=FIELDS.filter(name=>{
      const input=form.elements.namedItem(name);
      return input&&!input.checkValidity();
    });
    if(invalid.length) {
      const missing=invalid.filter(name=>!form.elements.namedItem(name).value);
      showValidationError(missing.length?
        "Manca almeno un valore obbligatorio.":"Uno o più valori non sono nel formato o nell'intervallo consentito.",
        invalid,missing.length?"Compila questa casella.":"Correggi questo orario o numero.");
      return;
    }
    const data=gather();
    if(data.wakeDate&&!/^\d{4}-\d{2}-\d{2}$/.test(data.wakeDate)) {
      showValidationError("Controlla la data del risveglio.",["wakeDate"]);return;
    }
    const awak=numeric(data.awakenings,30,false),naps=numeric(data.naps,600,false);
    if(awak!==null&&!Number.isFinite(awak)){
      showValidationError("Il numero di risvegli non è valido.",["awakenings"]);return;
    }
    if(naps!==null&&!Number.isFinite(naps)){
      showValidationError("I minuti dei sonnellini non sono validi.",["naps"]);return;
    }
    try {calculate(data);}
    catch(error) {
      if(error instanceof DiaryFieldError)showValidationError(error.message,error.fields);
      else showMessage("Non è stato possibile verificare questi dati.","error");
      return;
    }
    entries[current]=data;
    dirty=false;
    persistData();
    $("sd-remove-day").disabled=false;
    renderPicker();renderSummary();
    showMessage("Giorno "+String(current+1).padStart(2,"0")+" salvato. "+
      (data.waso===""?"Senza fascia dei risvegli: stima parziale, nessun minuto sottratto. ":"")+
      "Puoi passare a un'altra notte.","success");
  }
  function removeDay() {
    if (!entries[current]) return;
    if (!window.confirm("Eliminare la registrazione del giorno "+(current+1)+"?")) return;
    entries[current]=null;
    fillForm();persistData();renderPicker();renderSummary();
    showMessage("Scheda eliminata.", "success");
  }
  function clearAll() {
    if (!entries.some(Boolean)) return;
    if (!window.confirm("Cancellare TUTTE le 14 schede? L'operazione non è reversibile. Esporta un CSV se vuoi conservarne una copia.")) return;
    entries=Array(TOTAL).fill(null);
    current=0;stopPersisting();persist.checked=false;
    privacyFeedback("Salvataggio locale disattivato: i dati del diario sono stati eliminati.");
    $("sd-email-form").reset();
    fillForm();renderPicker();renderSummary();
    showMessage("Tutti i dati del diario sono stati cancellati.", "success");
  }
  function csvCell(input) {
    let s=String(input ?? "");
    if (/^[\s]*[=+@-]/.test(s)) s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }
  function buildCSV() {
    const headers=["Giorno","Data risveglio","Ora a letto","Tentativo di dormire","Latenza min",
      "Fascia dei risvegli","Minuti orientativi sottratti","Risvegli n",
      "Risveglio finale","Ora alzata","Qualità 1-5","Energia 1-5","Sonnellini min",
      "Tempo a letto min","Sonno orientativo min","Efficienza orientativa percentuale",
      "Veglia inclusa nel calcolo","Calcolo parziale","Note"];
    const rows=[headers];
    entries.forEach((e,i)=>{
      if (!e) return;
      const v=calculate(e);
      rows.push([i+1,e.wakeDate,e.bedTime,e.tryTime,e.latency,
        v.hasWakeEstimate?wakeRangeLabel(e.waso):"",
        v.hasWakeEstimate?v.waso:"",
        e.awakenings,e.finalWake,e.outTime,e.quality,e.energy,e.naps,
        v.tib,v.tst,v.efficiency.toFixed(1).replace(".",","),
        v.hasWakeEstimate?"Sì":"No",v.partial?"Sì":"No",e.notes]);
    });
    if(rows.length===1)return;
    return rows.length===1 ? "" : "\ufeff"+rows.map(row=>row.map(csvCell).join(";")).join("\r\n");
  }

  const csvFilename="Diario_del_Sonno_Dott_Roberto_Boscia.csv";

  function saveCsvFile(csv) {
    if(!csv)return;
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");
    a.href=url;a.download=csvFilename;document.body.appendChild(a);
    a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  function exportCSV(){saveCsvFile(buildCSV());}

  function emailStatus(text,kind="info"){
    const el=$("sd-email-feedback");
    el.textContent=text;
    el.className="sd-email-feedback"+(kind==="error"?" is-error":kind==="success"?" is-success":"");
  }
  function makeEmailSummary(){
    const lines=[
      "DIARIO DEL SONNO - RIEPILOGO PERSONALE",
      "Laboratorio del Sonno | Dott. Roberto Boscia",
      "",
      "Notti registrate: "+entries.filter(Boolean).length+" su 14",
      "Stime personali, non misurazioni cliniche.",
      ""
    ];
    entries.forEach((entry,i)=>{
      if(!entry)return;
      const v=calculate(entry);
      lines.push(
        "Giorno "+String(i+1).padStart(2,"0")+
        (entry.wakeDate?" ("+dateLabel(entry.wakeDate)+")":"")+
        ": sonno circa "+formatSleep(v.tst)+
        ", efficienza circa "+Math.round(v.efficiency)+"%"+
        ", qualita "+(entry.quality?entry.quality+"/5":"non indicata")+
        (v.partial?", STIMA PARZIALE (risvegli non sottratti)":", risvegli: "+wakeRangeLabel(entry.waso))
      );
    });
    lines.push("","Le note personali NON sono incluse.","Questo riepilogo è stato preparato sul tuo dispositivo.");
    return lines.join("\n");
  }
  function openEmailDraft(address,subject,body){
    window.location.href="mailto:"+encodeURIComponent(address).replace(/%40/g,"@")+
      "?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  }
  function prepareEmail(event){
    event.preventDefault();
    if(!entries.some(Boolean)){
      emailStatus("Salva almeno una notte prima di preparare l'email.","error");return;
    }
    const addressField=$("sd-email-address");
    if(!addressField.checkValidity()){
      emailStatus("Controlla l'indirizzo email.","error");
      addressField.focus();addressField.reportValidity();return;
    }
    const privacyCheck=$("sd-email-ack");
    if(!privacyCheck.checked){
      emailStatus("Conferma prima di aver compreso le informazioni su email e dati personali.","error");
      privacyCheck.focus();return;
    }
    const address=addressField.value.trim();
    const mode=$("sd-email-form").elements.namedItem("emailFormat").value;
    if(mode==="summary"){
      emailStatus("Se hai una app email configurata, si apre una bozza: controlla il destinatario e premi tu Invia. Se non si apre, usa Esporta CSV.","success");
      openEmailDraft(address,"Il mio Diario del Sonno - riepilogo",makeEmailSummary());
      return;
    }
    const csv=buildCSV();
    if(!csv){emailStatus("Non ci sono schede da allegare.","error");return;}
    const file=new File([csv],csvFilename,{type:"text/csv;charset=utf-8"});
    let supported=false;
    try{
      supported=typeof navigator.share==="function"&&
        typeof navigator.canShare==="function"&&navigator.canShare({files:[file]});
    }catch{supported=false}
    if(supported){
      emailStatus("Scegli l'app di posta dal menu Condividi e indica il destinatario "+address+". Non viene inviato nulla in automatico.");
      navigator.share({
        files:[file],
        title:"Il mio Diario del Sonno - Roberto Boscia",
        text:"Diario personale da inviare via email a "+address
      }).then(()=>{
        emailStatus("Il file è stato passato all'app selezionata. Controlla che l'email sia effettivamente partita.","success");
      }).catch(error=>{
        if(error?.name==="AbortError")emailStatus("Condivisione annullata. Nessuna email inviata.");
        else emailStatus("Impossibile condividere il file: scarica il CSV e allegalo manualmente alla tua email.","error");
      });
      return;
    }
    saveCsvFile(csv);
    emailStatus("Ho avviato il download del CSV e provo ad aprire una bozza email. Devi allegare il file scaricato prima di premere Invia.","success");
    openEmailDraft(address,"Il mio Diario del Sonno - file completo",
      "Ho preparato il mio Diario del Sonno completo.\n"+
      "Prima di inviare allego il file "+csvFilename+" appena scaricato.\n"+
      "Controllo il destinatario prima dell'invio.");
  }
  form.addEventListener("submit",save);
  function onFieldChange(event) {
    dirty=true;
    if(event.target?.name)clearFieldError(event.target);
    showMessage("");
  }
  form.addEventListener("input",onFieldChange);
  form.addEventListener("change",onFieldChange);
  $("sd-remove-day").addEventListener("click",removeDay);
  $("sd-clear").addEventListener("click",clearAll);
  $("sd-export").addEventListener("click",exportCSV);
  $("sd-email-form").addEventListener("submit",prepareEmail);
  persist.addEventListener("change",()=>{
    if(persist.checked){
      persistData();
      if(persist.checked) privacyFeedback("Salvataggio attivo su questo browser. Su un dispositivo condiviso, ricorda di cancellare tutte le schede a fine utilizzo.");
    } else {
      stopPersisting();
      privacyFeedback("Salvataggio disattivato e copie locali eliminate. Le schede presenti restano soltanto in questa pagina aperta.");
    }
  });
  loadLocalIfChosenPreviously();
  fillForm();renderPicker();renderSummary();
})();
