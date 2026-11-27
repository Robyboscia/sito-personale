# CRM — deployment Cloudflare (staging, non produzione)

Worker dedicato: `integrations/crm/service-email.mjs`. Non modificare i Worker social o i DNS esistenti. Il servizio invia solo la guida richiesta; non crea contatti marketing e non riceve dati dei questionari.

## Preparazione

1. Con accesso all'account Cloudflare, verificare piano gratuito, disponibilità Rate Limiting binding e dominio di staging; non acquistare servizi.
2. Creare un Worker separato (nome proposto: docboscia-crm-staging), senza route sul sito pubblico.
3. Creare il widget Turnstile per il solo hostname di staging, action `invia-guida`.
4. Impostare come segreti del Worker `TURNSTILE_SECRET` e `BREVO_API_KEY`. Non salvarli in GitHub, frontend, Drive o log.
5. Impostare `SERVICE_MODE=staging`, `SERVICE_TEST_RECIPIENT` alla sola casella di prova autorizzata, `SERVICE_ALLOWED_ORIGINS` all'origine HTTPS esatta del frontend di staging (senza slash finale), `TURNSTILE_HOSTNAME` all'hostname corrispondente.
6. Collegare il binding Rate Limiting `SERVICE_RATE_LIMITER`; namespace numerico unico nell'account. Proposta iniziale: 3 richieste ogni 60 secondi per chiave. Il limite è approssimativo per località, non una quota globale garantita.
7. Preparare il form di staging con email e widget Turnstile, inviare POST URL-encoded a /invia-guida, gestire risposte 202/400/403/429/502/503. Nessuna modifica al sito pubblico. Il download diretto della guida deve rimanere disponibile senza email.
8. Disabilitare log superflui, verificare condizioni e informativa per Cloudflare e Brevo. Non registrare email, token o chiavi. La chiave di rate limiting per destinatario è un hash e non va considerata anonimizzazione.

Riferimenti ufficiali: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ e https://developers.cloudflare.com/turnstile/get-started/server-side-validation/.

## Collaudo

Eseguire `node --test scripts/test-crm-service.mjs` (Node 22), senza invii reali. Poi testare in staging con casella autorizzata: origine errata e destinatari diversi bloccati, token scaduto o riusato respinto, rate limit, risposta e ricezione email Zoho, nessun ingresso in liste marketing. Verificare la separazione tra disiscrizione marketing e consegna di servizio. Non inviare a contatti reali.

## Prima del rilascio

Completare l'informativa effettiva, DPA, prova del consenso e collaudo end-to-end Brevo. Verificare rischio di abuso distribuito, limiti di invio del piano e necessità di quota globale prima di aprire l'endpoint al pubblico. Rivedere la PR #30. Solo dopo approvazione esplicita predisporre un ambiente produzione separato con `SERVICE_MODE=production`, segreti dedicati, origine e widget corretti; nessun merge automatico.
