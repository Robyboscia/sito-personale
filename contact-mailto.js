/* Assetto Biologico™ — ripiego TEMPORANEO per sito statico.
 * La pagina NON invia alcuna richiesta: apre soltanto l'app di posta.
 * In futuro sostituire con un backend di invio effettivo, dopo revisione privacy.
 * Script autonomo: funziona anche se GSAP/ScrollTrigger non vengono caricati.
 */
(() => {
  "use strict";
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("contact-form-status");
  const fallback = document.getElementById("contact-direct-email");
  const email = "info@robertoboscia.it";
  const trim = name => (form.elements.namedItem(name)?.value || "").trim();
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = trim("name"), address = trim("email"), phone = trim("phone"), question = trim("message");
    const subject = "Richiesta informazioni — Assetto Biologico";
    const content = [
      "Buongiorno Dott. Boscia,",
      "",
      "Vorrei ricevere informazioni sulla prima chiamata conoscitiva di Assetto Biologico.",
      "",
      "Nome: " + name,
      "Email di risposta: " + address,
      ...(phone ? ["Telefono: " + phone] : []),
      ...(question ? ["", "Domanda generale: " + question] : []),
      "",
      "Messaggio preparato dal sito. Inviato solo dopo la conferma nell'app di posta."
    ].join("\r\n");
    const mailto = "mailto:" + email + "?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(content);
    if (fallback) {
      fallback.href = mailto;
      fallback.textContent = "Apri di nuovo l'email con i dati compilati";
    }
    if (status) {
      status.textContent = "La bozza è pronta. Controllala nell'app di posta e premi Invia: " +
        "la richiesta NON è ancora stata inviata dal sito. Se la posta non si apre, usa il collegamento qui sotto.";
    }
    // L'azione è volutamente solo locale: nessuna richiesta HTTP, falso successo,
    // reset automatico o salvataggio dei dati inseriti.
    window.location.href = mailto;
  });
})();