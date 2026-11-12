# Stripe Checkout — test d'integrazione, non un negozio attivo
**Stato al 12 novembre 2026: codice preparato, Stripe e Cloudflare NON collegati.** Tutte le prove di rete finora utilizzano risposte Stripe simulate; nessuna transazione è stata eseguita su account Stripe reale, nemmeno in test mode.

## Cosa fa
- Solo in modalità **Stripe test** (`sk_test_`, mai `sk_live_`).
- Simula il primo ordine Mental Pro da 47 EUR tramite Stripe Checkout ospitato. I prezzi di libri e formazione sono ignoti, quindi i loro pagamenti rimangono disabilitati fino all'approvazione del catalogo.
- Dopo la conferma di un vero pagamento **test** via webhook firmato, propone sullo stesso Worker il primo upsell da +70 EUR per 2 confezioni supplementari. Se accettato, crea **una seconda Checkout Session** distinta e opzionale. Se accetta anche la seconda offerta, +105 EUR per altre 3 confezioni. Se rifiuta il primo upsell, propone un downsell facoltativo da +47 EUR.
- Il totale cresce solo dopo conferma Stripe server-side (`checkout.session.completed` con `payment_status=paid`, o `checkout.session.async_payment_succeeded`), importo e valuta verificati. Nessuna transizione sul solo redirect.
- Se un upsell era già stato creato, un secondo clic riprende la sessione esistente; la chiave Stripe di idempotenza evita di crearne un'altra per la stessa offerta. Lo stato dell'offerta deve corrispondere alla fase.
- Niente transazione automatica sulla carta precedente: il cliente conferma ogni acquisto aggiuntivo sul Checkout Stripe e può essere soggetto a nuova autenticazione bancaria.

## Requisiti prima di una prova con Stripe
1. Accesso **al proprio account Stripe in modalità test**; connettere il plugin Stripe in ChatGPT se disponibile, oppure aggiungere i segreti direttamente nel pannello Cloudflare. Non copiare mai in chat le chiavi segrete `sk_test_` o `whsec_`.
2. Un Worker e un database D1 **nuovi e dedicati** sul proprio Cloudflare, senza modificare `vale-rossy`, DNS, caselle email o siti pubblici.
3. Sostituire l'ID segnaposto del D1 in `wrangler.stripe-test.jsonc`. Separare database e configurazioni test da qualunque progetto di produzione.
4. Configurare `STRIPE_TEST_RETURN_BASE` con l'origin HTTPS effettivo del Worker di test e solo dopo impostare `STRIPE_TEST_ENABLED=true`. Di default è **false** e `workers_dev:false`; un semplice push GitHub non attiva pagamenti.
5. Caricare segreti **solo nel gestore Cloudflare Secrets**: `STRIPE_SECRET_KEY` con `sk_test_...`, `STRIPE_WEBHOOK_SECRET` con firma `whsec_...` dell'endpoint test e `DEMO_API_KEY` di accesso per sviluppatori. Nessuna delle chiavi deve entrare nei file GitHub.
6. Registrare in Stripe test l'endpoint `POST https://<dominio-test>/api/stripe-test/webhook` per `checkout.session.completed`, `checkout.session.async_payment_succeeded`. Il Worker controlla la firma con timestamp massimo ±300 s.
7. Per testare il flusso d'avvio si usa una chiamata **autorizzata** da sviluppatore a `POST /api/stripe-test/start` con `{ "funnel":"mental" }` e intestazione `x-demo-key`. L'endpoint è volutamente non pubblico: **mai** mettere la password di sviluppo nel JavaScript del sito. La chiamata produce un URL di checkout test e un token anonimo di sessione.
8. Dal Checkout Stripe test utilizzare i dati di prova indicati nella documentazione ufficiale Stripe, mai dati di carte vere. Al ritorno, la pagina del Worker legge lo stato da D1 e permette di accettare/rifiutare le offerte di test.
9. Verificare flussi: pagamento test riuscito, annullato, webhook in ritardo, duplicato, importo errato, rifiuto e autenticazione aggiuntiva. Il database deve registrare una sola sessione per fase.

## Endpoint implementati
- `POST /api/stripe-test/start` — autorizzazione sviluppatore (x-demo-key), crea sessione test principale.
- `POST /api/stripe-test/webhook` — webhook Stripe firmato; nessuna password sviluppatore, verifica firma `Stripe-Signature`.
- `GET /api/stripe-test/return` — pagina mobile dedicata alla prova e ai successivi upsell.
- `POST /api/stripe-test/state` — legge lo stato tramite token casuale (non pubblicamente ricercabile).
- `POST /api/stripe-test/decide` — scelta opzionale accept/decline e Checkout test aggiuntivo; rifiuto sempre senza addebito.

## Limiti volutamente non risolti
Questa è **un'integrazione di collaudo**, non una piattaforma pronta per clienti. Non include IVA, resi, spedizioni, lotti, fatturazione, gestione reclami, completamento logistico, recupero pagamento, analisi frodi, gestione account utenti, rate limiting pubblico, pulizia periodica database, verifiche GDPR definitive o integrazione CRM. Il front-end di prova non è collegato ai siti pubblici e i form di vendita reali sono disabilitati.

Prima di rendere pubblico il checkout: definire Partita IVA/gestore della vendita, fiscalità, consenso informato e politiche commerciali; configurare autenticazione clienti e anti-bot; collaudare in un browser reale e con database D1 reale; completare test d'integrazione con Stripe test, non solo mock.

## Avvio tecnico locale (solo sviluppo)
- `cd funnel-api`
- `npm install` e `npm test`
- `npx wrangler dev --config wrangler.stripe-test.jsonc --local` dopo aver creato D1 locale ed eseguito le migrazioni.
- Per test reali Stripe sono necessari URL HTTPS pubblicamente raggiungibili per il webhook/return; `http://localhost` non è una configurazione finale sufficiente.
- Prima di qualsiasi deploy verificare `wrangler deploy --config wrangler.stripe-test.jsonc --dry-run`. **Non fare deploy con database_id segnaposto e senza segreti/test flag**.

## Documentazione ufficiale
- https://docs.stripe.com/api/checkout/sessions/create
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks/signature
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/d1/reference/migrations/
