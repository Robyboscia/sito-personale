# Riesame tecnico privacy — 27 novembre 2026
Bozza di lavoro, non attestazione legale. Nessuna modifica alle informative pubblicate. Verifiche sul branch crm/brevo-newsletter; mantenere l'approvazione punto per punto richiesta per l'audit legale originale.

## Evidenze dal codice
| File | Riscontro | Stato |
|---|---|---|
| privacy/index.html | Data 13 novembre; nuove sezioni Brevo e Zoho aggiunte dopo il testo storico, che contiene ancora riferimenti a configurazioni future; navigazione laterale non aggiornata | Da armonizzare prima del rilascio |
| cookie/index.html | Descrive banner ancora in preparazione benché carichi già il modulo cookie-consent.js; non inventaria esplicitamente i due ulteriori archivi dei diari | Da correggere dopo approvazione |
| assets/cookie-consent.js | Importa vanilla-cookieconsent@3 da jsDelivr; default Google Consent Mode denied per analytics/marketing; non carica tag di misurazione; autoClear vuoto | Test in browser pulito e inventario CDN necessari; non abilitare tracker |
| laboratorio-del-sonno/diario.js | localStorage: roberto-boscia.sleep-diary.v1; salvataggio e rimozione nel browser | Verificare comportamento dinamico |
| laboratorio-del-sonno/strumenti/diario-pro-v2.js | localStorage: roberto-boscia.sleep-pro.v2; rimozione e importazione del diario precedente | Verificare consenso locale, cancellazione e assenza di rete |
| laboratorio-del-sonno/strumenti/turnisti-monitor.js | localStorage: dott-boscia-turni-sonno-diario-v1; pulsanti di salvataggio/cancellazione | Verificare cancellazione e assenza di rete |
| autovalutazione/strumento-digitalizzato/index.html | CSP con connect-src none, form-action none; test desktop e mobile superati in precedenza | Verificato per questo questionario, non generalizzare a tutti gli strumenti |
| assets/freebie-newsletter.js | Collegamento esterno facoltativo al modulo Brevo; target blank e rel noopener noreferrer | Verificare anche referrer e accessibilità reale dopo pubblicazione |
| integrations/crm/service-email.mjs | Invio transazionale, endpoint protetto, staging obbligatorio salvo scelta esplicita produzione | Test simulati superati, deployment assente |
| integrations/crm/staging-form.html | Modulo isolato non configurato, nessun invio senza Turnstile; non pubblicare configurato sul sito | Test simulati; collaudo reale pendente |

## Prima modifica proposta (da approvare)
Aggiornare SOLO l'inventario della memoria locale della Cookie Policy con le due righe mancanti, usando identificatori verificati e descrivendo la funzione di salvataggio e cancellazione. Non inventare scadenze. Adeguare il riferimento al banner alla presenza effettiva del modulo, distinguendo presenza nel codice e verifica browser ancora pendente.
Diff concettuale: aggiungere righe Diario PRO e Turni & Sonno alla tabella esistente; sostituire «È in preparazione un banner» con descrizione del modulo già predisposto, senza dichiarare tracker attivi. Non modificare i testi di produzione né approvare il punto in autonomia.

## Blocchi e verifiche prima del rilascio
- Verificare DPA, subresponsabili, trasferimenti, tempi di conservazione reali Brevo/Zoho/hosting e modalità di gestione dei diritti. Non dedurre assenza di trasferimenti dalla localizzazione UE dei database.
- Allineare versione informativa al valore registrato dal workflow Brevo e conservare il testo esatto del consenso.
- Descrivere invio facoltativo della guida, Turnstile e Worker solo dopo effettiva attivazione, con dati strettamente necessari e conservazione documentata.
- Verificare cookie, storage, richieste esterne e revoca in sessione pulita. Testare i tre diari separatamente. Nessun pixel pubblicitario, analytics o pubblico personalizzato prima di verifica tecnica e privacy.
- Riesaminare disclaimer, richieste sanitarie, eventuali futuri servizi a pagamento e altre voci del mandato originale. Il testo integrale dei venti punti va recuperato prima di numerare i risultati.
- Non rimuovere funzionalità e non inventare dati societari; revisione professionale dei testi legali prima della pubblicazione.
