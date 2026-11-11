/* CookieConsent: no advertising/analytics scripts are loaded by this module.
   Future integrations must check acceptedCategory before injecting tracking tags. */
import * as CookieConsent from 'https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.esm.js';
window.siteCookieConsent = CookieConsent;
CookieConsent.run({
  guiOptions: { consentModal: { layout: 'box', position: 'bottom right', equalWeightButtons: true }, preferencesModal: { layout: 'box' } },
  categories: {
    necessary: { enabled: true, readOnly: true },
    analytics: { enabled: false, autoClear: { cookies: [] } },
    marketing: { enabled: false, autoClear: { cookies: [] } }
  },
  language: {
    default: 'it',
    translations: {
      it: {
        consentModal: {
          title: 'La tua privacy conta',
          description: 'Utilizziamo tecnologie necessarie al funzionamento del sito. Analisi statistiche e pubblicità personalizzata saranno attivate solo con il tuo consenso, quando disponibili. Puoi scegliere liberamente.',
          acceptAllBtn: 'Accetta tutti',
          acceptNecessaryBtn: 'Rifiuta non necessari',
          showPreferencesBtn: 'Personalizza',
          footer: '<a href="/privacy/">Privacy Policy</a> · <a href="/cookie/">Cookie Policy</a>'
        },
        preferencesModal: {
          title: 'Preferenze privacy',
          acceptAllBtn: 'Accetta tutti',
          acceptNecessaryBtn: 'Rifiuta non necessari',
          savePreferencesBtn: 'Salva preferenze',
          closeIconLabel: 'Chiudi',
          sections: [
            { title: 'Come utilizziamo i cookie', description: 'Puoi modificare la scelta in qualsiasi momento dal link Preferenze cookie nel sito.' },
            { title: 'Necessari', description: 'Tecnologie indispensabili per il funzionamento del sito e per ricordare la tua scelta.', linkedCategory: 'necessary' },
            { title: 'Statistiche (non ancora attive)', description: 'Eventuali strumenti di misurazione, come Google Analytics, saranno collegati solo dopo configurazione e consenso.', linkedCategory: 'analytics' },
            { title: 'Marketing (non ancora attivo)', description: 'Eventuali pixel Meta, Google Ads e TikTok saranno collegati solo dopo configurazione e consenso.', linkedCategory: 'marketing' },
            { title: 'Informazioni', description: 'Consulta <a href="/privacy/">Privacy Policy</a> e <a href="/cookie/">Cookie Policy</a>.' }
          ]
        }
      }
    }
  }
});
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-cookie-preferences]');
  if (link) { event.preventDefault(); CookieConsent.showPreferences(); }
});
