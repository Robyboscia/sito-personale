# Checkout per funnel indipendenti — proposta tecnica v2
**Data:** 11 novembre 2026 · **Stato:** progetto, nessun gateway attivo

## Decisione infrastrutturale
Screenshot dell'Area Cliente SiteGround, sezione "I miei piani di hosting": **"Non hai nessuna iscrizione hosting attiva"**. Non comprare un hosting WordPress. I DNS su SiteGround non sono un hosting PHP/WordPress.

**Prima scelta per un prototipo senza canone:** Cloudflare Workers + D1 su piano gratuito + Stripe in **modalità test**.
- **Workers**: API checkout, validazione offerte e token del percorso.
- **D1**: catalogo per funnel, ordini, eventi webhook e progressione del funnel, con dati minimi e retention da definire.
- **Stripe Checkout**: primo pagamento ospitato da Stripe, solo quando saranno possibili transazioni test. Checkout Session e server-side prices; non fidarsi mai dei prezzi arrivati dal browser.
- **Dopo il primo pagamento**: offerte separate e conferme esplicite. Una successiva richiesta di pagamento può richiedere autenticazione SCA/3DS; non garantirne l'esecuzione in un clic né usare senza consenso il metodo precedentemente salvato.
- **CRM/Email**: integrazione differita e limitata agli eventi di ordine, senza inviare dati personali se non necessari; marketing solo su consenso separato.
- **Front-end**: pagine statiche distinte per linea, con grafica e copy specifici. I tre domini rimangono separati e puntano a funnel differenziati. La conferma server-side governa ogni transizione.

La gestione è centralizzata **dietro** ai percorsi, non un carrello front-end condiviso. Niente WordPress e niente nuove spese fisse finché i limiti Free bastano; rimangono le commissioni Stripe su transazioni reali e i costi eventuali se si supera la quota gratuita.

## Condizioni minime di sicurezza e contabilità
1. **Prima dell'apertura delle vendite**: Partita IVA, venditore/titolare, privacy, informativa cookie, condizioni di vendita, resi, prezzi IVA, spedizioni e fulfillment effettivi, differenziati fra integratori, libri, digitali e servizi.
2. **Mai** confermare un ordine o spedire sulla sola base del redirect del browser. Il server deve verificare firme e stato dei webhook Stripe (`checkout.session.completed` e stati asincroni).
3. **Idempotenza** di creazione ordini e pagamenti; webhook Stripe deduplicati dall'ID evento, con transizioni atomiche nel database. Non effettuare due addebiti per ripetizione/click doppio. Tutti gli importi di ogni upsell vanno visualizzati prima dell'accettazione.
4. **Accesso alla pagina di upsell**: solo tramite sessione firmata a breve durata, legata all'ordine pagato; validazione server e scadenza, no URL di accesso prevedibili.
5. **Pagamenti successivi**: in presenza del cliente, con consenso esplicito per l'addebito e possibilità di passare; utilizzare flussi Stripe supportati, eventuale autenticazione 3DS, recupero errori e riconciliazione. Nessun retry automatico che crei cariche multiple.
6. **Ordini spediti solo dopo stabilizzazione** di tutta la sequenza upsell e delle conferme di pagamento; definire modello logistico, tracking, rimborsi e notifiche di servizio.
7. **Test automatici** su codici di risposta 4xx/5xx, idempotenza, webhook duplicati, ordinamento degli step, ripresa dopo crash, fallimento SCA, rinuncia, timeout e mismatch di prezzo.
8. **Dati:** minimizzazione, log senza dati sensibili o credenziali, retention limitata e cancellazione, segreti Stripe esclusivamente in Cloudflare Secrets; webhook autenticati.
9. Nessun form sanitario o diario del sonno nei funnel; eventuali informazioni di salute richiederebbero una valutazione autonoma.
10. Le offerte successive **non sono transazioni già concluse**: devono risultare chiaramente opzionali. Nessun pre-check, timer ingannevole o consenso presumibile.

## Disegno delle rotte (non implementate)
- `/f/mental-pro`, `/f/libro`, `/f/formazione` — pagine pubbliche con offerte e prezzi effettivi del catalogo
- `POST /api/checkout/start` — crea ordine `pending`, checkout Stripe in sandbox, con offerta scelta **server-side**
- `POST /api/stripe/webhook` — firma del webhook, stato del pagamento, deduplica eventi; attiva la prima proposta dopo acquisto riuscito
- `GET /f/<percorso>/offer/<token>` — sessione di proposta autenticata a scadenza
- `POST /api/upsell/accept` — richiesta esplicita, payment intent/idempotency, poi conferma tramite webhook
- `POST /api/upsell/decline` — rifiuto: downsell o ringraziamento, senza alcun pagamento
- `GET /api/order/summary` — riepilogo per il solo cliente autenticato dal token/sessione
Queste rotte NON vanno rese operative prima di test d'integrazione, gestione ordini e revisione del commercio elettronico.

## Competenze piattaforme alternative (verifica 11/11/2026)
**systeme.io**: SaaS con pagina checkout, upsell/downsell, prodotti fisici e digitali, Stripe; non richiede WordPress o hosting. Il piano gratuito dichiara **3 funnel** e **1 upsell one-click complessivo**, 1 order bump e 1 dominio personalizzato: utile per provare un solo funnel, **non sufficiente** per catene di upsell su tre linee. Il prezzo Startup varia fra versioni di pagina e listini; da verificare sul conto prima dell'abbonamento. Se la complessità tecnica della soluzione custom risultasse superiore ai costi del SaaS, rivalutare systeme.io o piattaforme a canone.
**SureCart**: valido su WordPress, ma ora **non è la prima opzione** perché mancano hosting e installazione WordPress; il piano Launch può avere commissioni aggiuntive anche senza canone.

## Stato concreto
- Demo in `laboratorio-funnel/index.html` sul ramo di sviluppo: nessun pagamento.
- Nessun Worker checkout creato, nessun database D1 creato, nessuna chiave Stripe configurata.
- I tre siti pubblici e i DNS non sono stati modificati.
- GitHub Pages ha registrato `startup_failure` per le ultime pubblicazioni: non un problema Cloudflare. Non considerare le demo raggiungibili dal dominio finché la pubblicazione non risulta riuscita.

## Riferimenti ufficiali
- Cloudflare Workers Free: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare D1 Free: https://developers.cloudflare.com/d1/platform/pricing/
- Stripe Checkout e webhook: https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted
- Stripe salvataggio dei metodi di pagamento: https://support.stripe.com/questions/prefilling-saved-cards-in-checkout
