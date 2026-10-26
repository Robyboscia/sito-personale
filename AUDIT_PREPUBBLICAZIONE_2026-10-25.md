# Audit pre-pubblicazione — 25 ottobre 2026

> Stato: **IN CORSO / NON PRONTO PER LA PUBBLICAZIONE**  
> Ramo esaminato: `sviluppo-nuovo-portale`  
> **Non modificare `main` senza approvazione dell'utente.**

## 1. Cosa è stato verificato

- Inventario repository: 77 elementi nell'albero Git, inclusi 15+ HTML e asset CSS, JS, font e immagini.
- Esame statico dei link locali e degli attributi `href`, `src`, `srcset` e `url()` sulle pagine principali e sui fogli di stile esaminati: nessuna risorsa locale mancante dopo la correzione sotto.
- Esame degli ID HTML sulle principali pagine: non rilevati duplicati nei file esaminati.
- I collegamenti principali tra homepage, Consulenze, Metodo, Laboratorio, Accademia, Libro e Progetti sono presenti.
- Nel Diario digitale il valore dei risvegli è facoltativo: se manca, il calcolo è marcato come parziale, non interpretato come zero minuti.
- Il Diario include opzione di memorizzazione locale, esportazione CSV, bozza mail manuale e nota tecnica privacy; non è attivo un invio automatico a server.
- Esplorazione desktop dell'anteprima: contenuti e navigazione delle sezioni principali caricati. **Non equivale a test su smartphone**.

## 2. Correzione già eseguita nel ramo di sviluppo

**Immagini Assetto Biologico™ — RISOLTO NEL RAMO DI SVILUPPO**  
Due riferimenti `srcset="img/foto-roberto-boscia.webp"` erano relativi alla cartella sbagliata dopo il trasferimento della landing in `/assetto-biologico/`. Correzione limitata a `srcset="../img/foto-roberto-boscia.webp"`, senza modificare il copy o il codice di invio.

## 3. Bloccanti prima del rilascio

### P0 — Modulo contatti: falsa conferma ELIMINATA nel ramo di sviluppo; invio automatico ancora assente

- **Situazione originale (`main`, non modificato):** `script.js` mostrava «Richiesta inviata» e poi resettava il modulo, senza consegnare nulla. È un problema preesistente.
- **Correzione completata soltanto su `sviluppo-nuovo-portale` (26 ottobre):** eliminato il falso listener da `script.js`, aggiunto `contact-mailto.js` autonomo. Il modulo richiede nome ed email, prepara una **bozza mailto:** verso `info@robertoboscia.it` e dice chiaramente che il visitatore deve controllare il messaggio e premere **Invia** nella sua app di posta. Nessun messaggio viene dichiarato spedito; nessun reset automatico.
- Aggiunto indirizzo email di fallback visibile, cambiata la CTA mobile «Richiedi info», sostituito il numero fittizio `tel:+39XXXXXXXXXX` con email e limitata la domanda libera, chiedendo di **non inserire referti o dati sanitari riservati**. Pagina Contatti aggiornata coerentemente.
- **Test del codice:** validazione HTML, composizione URL `mailto:`, caratteri speciali, form invalidi e assenza di falsi messaggi di successo verificati con dati di fantasia. Non equivale a test completo iPhone con un client email configurato.
- **BLOCCO ANCORA APERTO:** questa è una soluzione temporanea, NON un modulo che invia autonomamente. Per un vero sistema di raccolta richieste servono servizio/backend scelto dall'utente, disponibilità della casella destinataria, antispam, informativa, politiche di conservazione, e messaggi verificati sulla risposta del server. Non inventare credenziali o URL di consegna; non presentare il ripiego `mailto:` come ricezione garantita.

### P0 — Informative privacy e analytics: bozze redatte e collegate; validazione legale e verifica reale ancora pendenti

- **Bozze ora disponibili nel ramo di sviluppo:** `privacy/index.html` e `cookie/index.html`, collegate dal footer di tutte le pagine principali. Sono marcate **BOZZA / NON DEFINITIVE** e `robots=noindex,follow`; contengono i trattamenti rilevati e segnalano esplicitamente i dati mancanti. Non vanno presentate come informative GDPR complete e validate.
- **Problema storico nel sito originale (`main`):** GA4 caricato automaticamente dopo tre secondi. **Correzione sviluppo (26 ottobre):** blocco GA4 completamente rimosso dal file `assetto-biologico/index.html`; nessun tag manager viene lanciato in automatico dal codice della landing nel ramo di sviluppo. Non è stato installato un banner fittizio.
- Una ricognizione testuale delle pagine HTML e degli script del portale nel ramo di sviluppo non ha evidenziato altri chiamanti GA4, Facebook Pixel o analytics equivalenti negli script esaminati. **Non è un audit di rete dei domini esterni**: verificare richieste effettive (inclusi font/CDN, analytics del provider e altre risorse), cookie e storage con strumenti del browser.
- **Azione:** scegliere una strategia di analisi minimizzata o un sistema di consenso effettivo secondo i requisiti applicabili, con inventario completo dei tracciatori, tempi di conservazione e fornitori. Per riferimento: [FAQ cookie del Garante](https://www.garanteprivacy.it/faq/Cookie).
- Le schede del Diario del Sonno possono contenere informazioni personali e potenzialmente sanitarie. Valutare e documentare trattamento locale, salvataggio opzionale, esportazione e condivisione email; minimizzare il contenuto delle richieste di contatto.
- La nota `laboratorio-del-sonno/diario/privacy/index.html` spiega **il funzionamento tecnico**, non sostituisce l'informativa generale GDPR.
- La revisione deve confermare titolare, contatti, finalità, basi giuridiche, destinatari, fornitori, conservazione, trasferimenti e modalità di esercizio dei diritti. **Non affermare conformità GDPR finché tali dati non sono completati e verificati.**

## 4. Da verificare prima di pubblicare

### P1 — Prova su iPhone / dispositivi reali
- Il browser di verifica non ha potuto attivare un vero viewport iPhone. **Non è stata eseguita una verifica mobile conclusiva**.
- L'HTML contiene `<meta name="viewport">` e menù mobile tramite `<details class="home-mobile-menu">`, mentre i CSS prevedono breakpoint responsivi; dunque l'assenza di menu mobile riportata dal solo controllo desktop **non è prova di un difetto**.
- Verificare realmente con iPhone: apertura menu, scrolling orizzontale, dimensione pulsanti, leggibilità, form orari, 14 pulsanti giorno, apertura dell'app email e condivisione CSV.
- Verificare separatamente Safari iOS e almeno un browser desktop.

### P1 — Test del Diario del Sonno
- Salvare notti fittizie con e senza fascia di risveglio, verificare stime parziali, importazione delle eventuali vecchie schede, grafico, tabella, CSV, eliminazione selettiva e totale, permessi salvataggio locale, cambio giorno con modifiche non salvate.
- Verificare il consenso esplicito prima di preparare l'email e la differenza tra testo della bozza e condivisione allegato, compatibilità iOS reale.
- Non presentare le stime come diagnosi o indice clinico automatico.

### P1 — SEO e pubblicazione
- `sitemap.xml` contiene **soltanto l'homepage**, con `lastmod` fermo a giugno 2026. Aggiornare solo quando è deciso quali pagine pubblicare, escludendo quelle `noindex`, inclusa Consulenze temporaneamente.
- Verificare URL canonici, `og:url`, immagini social, e dati strutturati della landing in relazione al nuovo ruolo della homepage. Il markup originale attribuisce ancora alla root le entità WebPage e Offer del Metodo.
- Verificare robots.txt, title e meta description, performance (WebP, immagini da siti terzi, cache), accessibilità (focus, contrasti, alt, tastiera), collegamenti esterni.

### P1 — Contenuti educativi e professionali
- Revisione scientifica degli articoli Accademia, delle fonti e dei limiti dichiarati.
- Revisione della terminologia professionale nelle offerte di consulenza e nel markup strutturato per non suggerire diagnosi mediche di competenza di altri professionisti.
- Conservare Consulenze come **«Ancora da costruire»** finché non sarà ripresa esplicitamente; non duplicare il prezzo della landing Assetto Biologico™.

## 5. Stato

**Non ancora idoneo al rilascio pubblico.** Nel ramo di sviluppo la falsa conferma del modulo è stata eliminata e l'avvio automatico di GA4 è stato sospeso; le bozze Privacy e Cookie sono state create e collegate. Restano la validazione dei soggetti/fornitori, le basi giuridiche definitive, retention, eventuali trasferimenti, la scansione cookie/Network sul dominio reale, i test iPhone e la scelta dell'eventuale backend di ricezione. Il ripiego manuale `mailto:` NON equivale a invio automatico.

Tutte le correzioni di questa fase rimangono sul ramo `sviluppo-nuovo-portale`. Il sito pubblico `main` è invariato.


## 6. Privacy generale e cookie — bozza sviluppata il 26 ottobre 2026

**Stato: PARZIALMENTE RISOLTO.** Nel solo ramo di sviluppo sono state create e collegate due pagine leggibili, ma **non ancora giuridicamente validate**:
- `privacy/index.html` — bozza informativa generale su titolarità, basi giuridiche provvisorie, navigazione, email manuale, memoria locale del Diario, Diario PRO, altri strumenti, destinatari, conservazione, diritti e rischi dati del sonno.
- `cookie/index.html` — descrizione cookie/localStorage, inventario statico delle risorse, stato GA4 disattivato, differenza fra cookie tecnici e non tecnici.
- Ogni pagina è contrassegnata come **bozza, noindex,follow**. Non sono state inventate identità giuridiche, accordi con fornitori, cookie, scadenze di conservazione o la nomina di un DPO.
- Inseriti link Privacy/Cookie in tutte le pagine HTML del portale (compresa la pagina tecnica del Diario e l'anteprima), e avvisi contestuali presso il modulo contatti, il toggle di salvataggio locale del Diario e l'import CSV del Diario PRO.
- Nessun banner fake o consenso fittizio: scegliere una configurazione realmente conforme solo dopo l'inventario delle richieste di rete e dei cookie.

**Ricognizione dal codice:**
- Salvataggio opzionale Diario in `localStorage` con chiave `roberto-boscia.sleep-diary.v1`; revocare l'opzione rimuove la copia persistente. Le bozze email e i CSV partono dall'azione dell'utente.
- Check-up/Caffeina/Turni e Diario PRO non mostrano chiamate client a endpoint di ricezione dei risultati; non equiparare ciò all'assenza di log del web host.
- La landing carica GSAP da `cdnjs.cloudflare.com`; alcune pagine richiedono la copertina remota da `www.dormirefacile.com`.
- Non rilevati altri script analytics noti negli HTML e JS esaminati nel ramo di sviluppo; **serve collaudo di rete/cookie reale** anche dei fornitori di infrastruttura.

**Ancora indispensabili per finalizzare:** conferma titolare e indirizzo, provider hosting/CDN/mail, nomi e durata log/cookie, conservazione email, basi giuridiche, dati sanitari e art. 9 ove pertinente, trasferimenti extra-SEE, review legale e test browser reali. Vedi `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`.

**Non pubblicare l'informativa come definitiva e non pubblicare il nuovo portale senza la verifica. `main` invariato.**

### Verifica statica delle bozze e dei link — 26 ottobre 2026
- Inventario attuale: **21 file HTML di sito**, contando le nuove pagine Privacy e Cookie (escluso il file di verifica Google).
- Verificate a blocchi tutte le 21 pagine: link locali `href` e `src` risolti nell'albero Git, senza risorse mancanti; nessun ID HTML ripetuto; chiusura base di `html` e `footer` presente.
- Le 19 pagine preesistenti presentano link a Privacy e Cookie nel footer. Le due nuove informative sono intercollegate e contengono `robots=noindex,follow` e avviso visibile che sono bozze.
- Contesti specifici: nota Privacy nel modulo Assetto Biologico™, accanto al salvataggio opzionale nel Diario e vicino all'importazione CSV del Diario PRO.
- **Metodo:** verifica statica sul repository, NON validazione formale W3C, NON browser Safari iPhone e NON inventario cookie dinamico. Prima di pubblicare restano i test di rete e l'identificazione effettiva dei fornitori.

## Revisione delle bozze privacy: collaudo desktop del 26 ottobre 2026
- Verificate 21 pagine del portale nel ramo di sviluppo; nessun link interno mancante fra i file HTML esaminati. Footer Privacy/Cookie presenti su tutte le pagine pertinenti.
- Aperte in browser desktop le bozze Privacy e Cookie: entrambe leggibili, Privacy con 8 capitoli navigabili, avviso preparatorio chiaro e collegamento incrociato funzionante.
- Il contenuto distingue l'opt-in `localStorage` del Diario dalle richieste HTTP a hosting/risorse esterne e dall'invio email manuale `mailto:`; l'informativa cookie non implementa un banner fittizio.
- Non sono ancora noti i cookie e i log realmente presenti sul dominio di produzione; `raw.githack.com` è un host di anteprima esterno e NON rappresenta l'hosting definitivo.
- Tutti i dettagli e i dati da chiedere al titolare in `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`. Nessuna attestazione di conformità, nessuna modifica al ramo pubblico.
