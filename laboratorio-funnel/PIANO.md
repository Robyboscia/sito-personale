# Piano funnel di vendita (bozza operativa, novembre 2026)
## Decisione
Tre funnel indipendenti per linea di prodotto, non tre carrelli generici. Vendite, ordini, clienti, rimborsi e CRM possono rimanere centralizzati dietro un'unica installazione di checkout. Landing su GitHub Pages; checkout su infrastruttura separata compatibile con WordPress/SureCart. Nessun pagamento reale finché non saranno definiti esercente, P.IVA, contratti, logistica e privacy.

## Architettura tecnica adottata per il prototipo
**Verifica SiteGround conclusa l'11 novembre 2026:** la schermata dell'utente dichiara "Non hai nessuna iscrizione hosting attiva". Il DNS non dà diritto all'hosting WordPress. **SureCart su WordPress è quindi accantonata** per evitare nuovo abbonamento.

**Direzione di lavoro:** Cloudflare Workers Free + D1 Free, con gateway Stripe in modalità test quando verrà creato un account di prova; per ora si prosegue con prototipo statico e progettazione. Tre funnel diversi sul front-end, architettura ordini condivisa lato server, nessun carrello unico pubblico. Stripe non è ancora collegato, gli importi post-acquisto richiedono autorizzazione esplicita e vanno riconciliati tramite webhook.

**Alternativa pronta senza hosting:** systeme.io; il piano gratuito dichiara tre funnel ma un solo upsell one-click, quindi insufficiente per più offerte successive su tutte e tre le linee. Il piano a pagamento richiederebbe un abbonamento. Riconsiderarlo se la manutenzione del checkout custom diventasse sproporzionata.

**Specifiche e checklist di sicurezza:** vedere `ARCHITETTURA-CHECKOUT.md`.

## Percorsi da simulare
### mentalpro.it
Acquisto 1 confezione 47 EUR -> upsell aggiuntivo 2 confezioni a +70 EUR (totale ordine 3 confezioni: 117 EUR) -> se accetta, proposta di altre 3 confezioni a +105 EUR (totale finale 6 confezioni: 222 EUR); se rifiuta il primo upsell, downsell di 1 confezione aggiuntiva a +47 EUR (totale 2 confezioni: 94 EUR). Ogni addebito aggiuntivo deve essere espresso e autorizzato singolarmente, senza sostituire contabilmente l'ordine originale; le proposte sono dimostrative, non già approvate.
**NB**: offerte solo di esempio; nessuna validazione commerciale / IVA / spedizione, nessuna attivazione.

### dormirefacile.com
Libro -> proposta guida digitale -> pacchetto editoriale premium; su rifiuto proposta alternativa più semplice. Prodotti e prezzi non confermati.

### drrobertoboscia.com
Prodotto formativo base -> programma approfondito -> premium; su rifiuto modulo individuale. Perimetro professionale e prodotti da confermare.

## Trattamenti e conformità
- I funnel devono indicare separatamente i costi dei singoli addebiti, consenso chiaro a ogni offerta, possibilità di saltare senza ostacoli e niente caselle preselezionate.
- Il post-purchase vero necessita di gateway pagamenti e riutilizzo del metodo ove supportato. Il prototipo simula solo lo stato dell'ordine e non può convalidare una charge/reversal.
- Informative privacy/cookie aggiornate anche sul dominio checkout. Tracciamenti di marketing dopo consenso; email promozionali separate dal servizio richiesto.
- Validare vendita integratori (etichettatura, claim, lotti, trasporto, resi), editoria e digitale (recesso e requisiti di consenso) e servizi.
- Ordini non attivati finché non sono definiti titolare, Partita IVA, rapporti con produttore/fornitore, fatturazione, spedizione e assistenza.

## Passi successivi
1. Completato: nessun hosting SiteGround. Non acquistarne uno.
2. Progettare e collaudare un Worker e un database D1 in ambiente di prova; collegare Stripe TEST solo dopo aver definito l'esercente, con pagamenti di prova e nessuna vendita reale.
3. Connettere checkout con CRM (es. Zoho/Brevo) solo dopo definizione di dati minimi, eventi e consensi.
4. Misurare rapporto dei funnel con prototipo, quindi definire copy e offerte effettive.
5. Pubblicare dopo revisione legale/commerciale e test completo.

## Esito verifica e ulteriori note
Screenshot SiteGround dell'11/11/2026: nessun piano hosting attivo. SureCart richiede WordPress, quindi non è installabile senza nuova infrastruttura.

La soluzione Cloudflare Workers Free + D1 Free è progettualmente possibile senza canone fisso fino ai limiti gratuiti, ma richiede sviluppo, test, manutenzione e sicurezza di livello ecommerce. Non equivale a un prodotto già pronto. Rimangono le commissioni Stripe sui pagamenti reali e possibili costi futuri al superamento delle soglie Free.

GitHub Pages: la pubblicazione del negozio di prova aveva registrato `startup_failure`. Non presentare il negozio come operativo sul sito pubblico senza una conferma del deploy.

Fonte tecnica e dettagli della soluzione: `ARCHITETTURA-CHECKOUT.md`.
