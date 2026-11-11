# Piano funnel di vendita (bozza operativa, novembre 2026)
## Decisione
Tre funnel indipendenti per linea di prodotto, non tre carrelli generici. Vendite, ordini, clienti, rimborsi e CRM possono rimanere centralizzati dietro un'unica installazione di checkout. Landing su GitHub Pages; checkout su infrastruttura separata compatibile con WordPress/SureCart. Nessun pagamento reale finché non saranno definiti esercente, P.IVA, contratti, logistica e privacy.

## Piattaforma da verificare
**SureCart Launch** (prima opzione, NON acquistata/attivata): 0 USD/anno più 2,9% commissione SureCart sulle transazioni, oltre alla commissione processor, secondo listino novembre 2026. Servono installazione WordPress e hosting PHP/database (GitHub Pages NON può ospitare WordPress). Supporta post-purchase upsell/downsell e link checkout condivisibili da siti esterni. I metodi di pagamento non riutilizzabili possono non essere disponibili in funnel con upsell. Prima della scelta definitiva verificare compatibilità con metodi di pagamento usati in Italia, tassazione, rimborsi e integrazioni con CRM.

**Alternative**: ThriveCart Standard da 47 USD/mese (mensile, listino pubblicato luglio 2026, verificare al momento dell'acquisto): funziona come SaaS senza installare WordPress; CartFlows Pro e FunnelKit Plus richiedono WordPress + WooCommerce con licenze annuali per funnel avanzati.

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
1. Verificare l'esistenza di un piano SiteGround Hosting attivo tramite Area Cliente > Servizi > Hosting. **SiteGround DNS Zone Editor non dimostra il possesso di un piano hosting.** Se esiste un piano, verificare limite siti e disponibilità WordPress/PHP/MySQL e se si può usare un dominio temporaneo di test, senza migrare gli attuali siti statici.
2. Testare SureCart in sandbox su un sito WordPress di sviluppo, con Stripe TEST e nessuna vendita reale.
3. Connettere checkout con CRM (es. Zoho/Brevo) solo dopo definizione di dati minimi, eventi e consensi.
4. Misurare rapporto dei funnel con prototipo, quindi definire copy e offerte effettive.
5. Pubblicare dopo revisione legale/commerciale e test completo.

## Verifica infrastruttura — 11 novembre 2026
- GitHub Pages ospita `drrobertoboscia.com`; SiteGround è utilizzato per il DNS. Non è stata identificata la sottoscrizione di un hosting SiteGround; nessuna email contrattuale SiteGround trovata nella casella Gmail con ricerche per SiteGround. Non assumere che esista un piano a pagamento.
- Nel Cloudflare account illustrato dall'utente è presente il progetto Pages `vale-rossy`, non un sito WordPress di questo progetto.
- Controllo account necessario: SiteGround > Area Cliente > **Servizi > Hosting**, verificare piano attivo (StartUp/GrowBig/GoGeek/Cloud), sito usato, eventuali costi di aggiunta di installazione. Non modificare né acquistare nulla durante l'ispezione.
- **SureCart richiede WordPress** e un account SureCart; Launch $0 fisso + 2,9% commissione sulle vendite (oltre al processor), secondo listino ufficiale SureCart al 11/11/2026. Include order bump e funnel upsell. Il piano senza costo fisso **non rende gratuito il necessario hosting WordPress**.
- Una singola installazione WordPress e una singola istanza SureCart potrebbero fornire tre pagine checkout/funnel distinte e una gestione centralizzata, con collegamenti da `mentalpro.it`, `dormirefacile.com` e `drrobertoboscia.com`. Non creare tre installazioni WordPress inutilmente.
- SureCart può nascondere i metodi di pagamento non riutilizzabili quando è attivo un post-purchase funnel. Prima della produzione controllare carte, PayPal, wallets e modalità locali effettivamente disponibili per utenti italiani.
- **Se SiteGround ha solo gestione DNS senza hosting WordPress:** opzione alternativa da valutare è checkout Stripe personalizzato su Cloudflare Workers (piano Free 100.000 richieste/giorno, limiti applicabili). Richiede implementare rigorosamente prezzi server-side, sessioni, pagamenti, eventi webhook idempotenti, stato dell'ordine, gestione spedizioni, rimborsi, sicurezza, informative. Non è un sostituto immediato con le funzionalità già pronte di SureCart.
- Nessun plugin/hosting/account pagamenti acquistato o creato; nessuna attivazione di ordini. Decisione tecnica sospesa finché non si legge la schermata **Servizi > Hosting** dell'account SiteGround.

## Fonti tecniche ufficiali
- SureCart piani: https://surecart.com/pricing/
- SureCart prerequisiti: https://surecart.com/docs/getting-started/
- SureCart compatibilità pagamento post acquisto: https://surecart.com/docs/enable-upsell-funnels/
- SiteGround piano hosting: https://www.siteground.com/kb/add-website-hosting-plan
- Cloudflare Workers Free: https://developers.cloudflare.com/workers/platform/limits/
