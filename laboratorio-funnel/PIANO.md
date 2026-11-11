# Piano funnel di vendita (bozza operativa, novembre 2026)
## Decisione
Tre funnel indipendenti per linea di prodotto, non tre carrelli generici. Vendite, ordini, clienti, rimborsi e CRM possono rimanere centralizzati dietro un'unica installazione di checkout. Landing su GitHub Pages; checkout su infrastruttura separata compatibile con WordPress/SureCart. Nessun pagamento reale finché non saranno definiti esercente, P.IVA, contratti, logistica e privacy.

## Piattaforma da verificare
**SureCart Launch** (prima opzione, NON acquistata/attivata): 0 USD/anno più 2,9% commissione SureCart sulle transazioni, oltre alla commissione processor, secondo listino novembre 2026. Servono installazione WordPress e hosting PHP/database (GitHub Pages NON può ospitare WordPress). Supporta post-purchase upsell/downsell e link checkout condivisibili da siti esterni. I metodi di pagamento non riutilizzabili possono non essere disponibili in funnel con upsell. Prima della scelta definitiva verificare compatibilità con metodi di pagamento usati in Italia, tassazione, rimborsi e integrazioni con CRM.

**Alternative**: ThriveCart Standard da 47 USD/mese (mensile, listino pubblicato luglio 2026, verificare al momento dell'acquisto): funziona come SaaS senza installare WordPress; CartFlows Pro e FunnelKit Plus richiedono WordPress + WooCommerce con licenze annuali per funnel avanzati.

## Percorsi da simulare
### mentalpro.it
Acquisto 1 confezione 47 EUR -> upsell sostitutivo 3 confezioni 117 EUR (+70) -> se accetta upsell 6 confezioni 222 EUR (+105); se rifiuta il primo upsell -> proposta 2 confezioni a prezzo standard 94 EUR, senza sconto presunto.
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
1. Verificare che il piano SiteGround consenta un sito WordPress separato, senza migrare gli attuali siti statici.
2. Testare SureCart in sandbox su un sito WordPress di sviluppo, con Stripe TEST e nessuna vendita reale.
3. Connettere checkout con CRM (es. Zoho/Brevo) solo dopo definizione di dati minimi, eventi e consensi.
4. Misurare rapporto dei funnel con prototipo, quindi definire copy e offerte effettive.
5. Pubblicare dopo revisione legale/commerciale e test completo.
