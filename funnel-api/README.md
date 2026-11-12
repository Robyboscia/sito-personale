# Motore funnel — demo senza pagamenti e checkout Stripe solo in test
**Stato:** codice in PR di sviluppo. Non distribuito su Cloudflare; nessun ordine o pagamento reale. È presente un **secondo Worker disabilitato** per simulare pagamenti Stripe in test mode, documentato in [STRIPE-TEST.md](STRIPE-TEST.md).

## A cosa serve
Il Worker demo standard simula tre percorsi distinti: Mental Pro, libri e guide, formazione e consulenze. Registra una sessione effimera e le scelte upsell/downsell in **Cloudflare D1 locale**. Non richiede Stripe o dati dei clienti. Il Worker **Stripe TEST separato** (`src/stripe-test-worker.js`) prepara Checkout Session test, webhook firmati e pagamenti aggiuntivi distinti; non è attivato né distribuito.

### Sicurezza deliberata
- `workers_dev: false` e `DEMO_ENABLED: "false"` per impostazione predefinita: non espone un Worker pubblico.
- Endpoint di modifica protetti da `DEMO_API_KEY`, **solo per chi sviluppa**: non inserirla MAI nel browser o nei siti pubblici.
- Token casuale non prevedibile; nel database viene conservato **solo il suo SHA-256**; validità sessione 60 minuti.
- Nessuna condivisione cross-origin. Nessuna tecnologia di marketing, nessun checkout.
- Concorrenza: transizione condizionale con versionamento e registrazione dell'evento nella stessa transazione D1.
- Totali: prezzi lato server in centesimi e mai provenienti dal browser.
- La tabella demo scade logicamente dopo 60 minuti; prevedere cancellazione periodica dei record per evitare crescita illimitata.

## Uso locale quando sarà disponibile Cloudflare CLI
1. Nella cartella `funnel-api/`, `npm install`.
2. `npm test` — verifica la logica delle offerte.
3. Creare **solo sul proprio computer** il file `.dev.vars` con:
   ```
   DEMO_API_KEY="una-password-lunga-casuale"
   DEMO_ENABLED="true"
   ```
4. `npm run db:local` per applicare migrazioni D1 locali (il valore segnaposto del database_id serve solo al setup di sviluppo; PRIMA di ogni deployment sostituirlo con l'ID effettivo di un database creato per il test).
5. `npm run dev`, quindi eseguire chiamate manuali con header `x-demo-key`:
   ```
   curl http://localhost:8787/api/health
   curl http://localhost:8787/api/catalog
   curl -X POST http://localhost:8787/api/demo/start \\
     -H 'Content-Type: application/json' -H 'x-demo-key: <DEV_KEY>' \\
     -d '{"funnel":"mental"}'
   ```
   Dalla risposta usare `token` per `/api/demo/state` e `/api/demo/decision`, con payload `{"token":"...","stage":"upsell1","accept":true}` o `{"token":"...","stage":"upsell1","accept":false}`. Il campo `stage` deve corrispondere alla fase visualizzata e cambia dopo ogni scelta: impedisce che un doppio clic su un’offerta sia interpretato come accettazione della successiva.
6. Per i tre funnel ripetere scegliendo `mental`, `libro` oppure `formazione`. I prezzi di libri e formazione rimangono `null`, non inventati.

## Prima di un eventuale deployment
- Creare database D1 e Worker in Cloudflare con account e permessi espliciti dell'utente, senza toccare il progetto Vale & Rossy.
- Separare ambiente test e produzione e correggere identificativi in `wrangler.jsonc`; mettere segreti in Cloudflare Secrets, mai nel repository.
- Aggiungere rate limiting, scadenza/pulizia record e controlli end-to-end browser. Il motore demo attuale NON è un servizio ecommerce.
- Definire in modo corretto prezzi IVA, spedizione, documenti, resi, commerciabilità prodotti, Partita IVA e informativa.
- Implementare **in una fase separata** Stripe Checkout in modalità test, firme webhook, pagamento confermato server-side, addebiti upsell autorizzati esplicitamente e gestione antifrode. Non considerare il solo redirect del browser una prova di pagamento.
- Nessun invio email/CRM prima delle scelte sul trattamento dei dati.

## API demo
- `GET /api/health`: stato, pagamenti disabilitati.
- `GET /api/catalog`: catalogo da server, prezzi demo.
- `POST /api/demo/start`: simulazione completamento pagamento iniziale, restituisce token demo.
- `POST /api/demo/state`: stato del percorso; richiede token demo.
- `POST /api/demo/decision`: accetta o rifiuta un upsell/downsell, atomico.

Riferimenti: https://developers.cloudflare.com/d1/reference/migrations/ · https://developers.cloudflare.com/workers/configuration/secrets/

## Worker Stripe TEST separato
- File di configurazione: `wrangler.stripe-test.jsonc`; stato predefinito `STRIPE_TEST_ENABLED=false`, `workers_dev=false`, D1 segnaposto. Nessun deployment automatico.
- Test automatizzati: `node --test test/*.test.js`; verifica compilazione: `npx wrangler deploy --config wrangler.stripe-test.jsonc --dry-run --outdir dist-stripe-test`.
- Per Stripe, Cloudflare, autorizzazioni e collaudo vedere [STRIPE-TEST.md](STRIPE-TEST.md). Non inserire chiavi segrete in GitHub o in chat.
