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

### P0 — Il modulo Assetto Biologico™ conferma un invio che non avviene

- Nel file `script.js` il listener `submit` di `#contact-form` invoca `preventDefault()`, cambia il testo in «Richiesta inviata» e resetta dopo 4 secondi.
- Non effettua chiamate HTTP, salvataggio o altre operazioni di consegna dei dati.
- Comportamento **preesistente anche in `main`** (confronto testuale del file JS effettuato).
- **Azione:** concordare un sistema reale di ricezione delle richieste, implementare invio e messaggi di errore/successo basati sul risultato effettivo, protezioni antiabuso e minimizzazione dei dati richiesti. Testare end-to-end senza includere dati reali di pazienti. Non pubblicare il portale con la falsa conferma.

### P0 — Informative privacy e analytics

- Non è presente un'informativa privacy generale completa facilmente raggiungibile da tutte le pagine.
- Nella landing Assetto Biologico™ uno script GA4 viene avviato dopo un timeout di tre secondi anche senza un'interazione consapevole.
- **Azione:** censire effettivi cookie e tracciatori, scegliere configurazione analytics corretta; predisporre informativa e, se necessari, banner/consenso e blocco preventivo secondo le regole applicabili. Non è sufficiente dichiarare «anonymize_ip» nel codice.
- Le schede del Diario del Sonno possono contenere informazioni personali e potenzialmente sanitarie. Valutare e documentare il loro trattamento, l'archiviazione locale opzionale, la condivisione via email e il contenuto di eventuali messaggi di contatto.
- La nota `laboratorio-del-sonno/diario/privacy/index.html` descrive **il funzionamento tecnico**, non sostituisce l'informativa generale GDPR.
- La revisione legale deve confermare titolare, contatti, finalità, basi giuridiche, fornitori, conservazione, trasferimenti ed esercizio dei diritti.

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

**Non idoneo al rilascio pubblico per i blocchi P0 sul modulo di contatto e sulla privacy.**
Tutte le correzioni di questa fase rimangono sul ramo `sviluppo-nuovo-portale`. 
