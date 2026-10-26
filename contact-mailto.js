/* Modulo Assetto Biologico™ — fase di attesa della casella professionale.
 * Non compilare/inviare: nessuna destinazione email è stata verificata.
 * Alla futura attivazione, testare effettiva consegna PRIMA di riabilitare.
 */
(() => {
  "use strict";
  const form = document.getElementById("contact-form");
  if (!form) return;
  for (const el of form.querySelectorAll("input, textarea, button[type='submit']")) el.disabled = true;
  const status = document.getElementById("contact-form-status");
  if (status) status.textContent = "Modulo temporaneamente disabilitato: indirizzo email professionale ancora da attivare e verificare.";
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (status) status.textContent = "Nessuna richiesta inviata: il contatto email non è ancora disponibile.";
  });
})();
