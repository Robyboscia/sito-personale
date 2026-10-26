# QA mobile, accessibilità e privacy tecnica — 26 ottobre 2026

**Repository:** `Robyboscia/sito-personale`. **Ramo in lavorazione:** `sviluppo-nuovo-portale`. **Ramo pubblico `main`: NON modificato in questa fase.**

## 1. Perimetro e livelli di prova

- **Browser remoto reale, solo sito pubblico `https://drrobertoboscia.com/`:** prova esplorativa di apertura homepage e collegamenti Privacy/Cookie. Esecuzione visibile: https://agent.tinyfish.ai/runs/b4d2e1b8-eb2e-4186-b756-14578806d782 . Il browser ha confermato che le tre pagine si caricano. Ha anche rilevato l'assenza di form da inviare sulle pagine legali e la presenza dei messaggi sui contatti disattivati. Non è una scansione documentata di tutte le interazioni e non è la versione nuova del portale.
- **Limite tecnico del browser remoto:** non è stato possibile usare un pannello di rete/archiviazione per leggere concretamente header HTTP, cookie e `localStorage`; neanche fissare e misurare un viewport mobile di 390 px. Le fonti su cdnjs/Cloudflare e GitHub Pages sono documentazione/provider e markup, NON inventario empirico dei cookie.
- **Nuovo portale, analisi del codice GitHub:** esame CSS responsive, tag immagini e metadati binari dei ritratti; correzioni puntuali e test V8 dello scripting accessibile.
- **NON sono stati eseguiti:** prova su iPhone fisico, Safari/WebKit reale, Android/Chrome reale con touch, misure Lighthouse/PageSpeed/Core Web Vitals, misure del `scrollWidth` effettivo, screenshot del portale in esecuzione, test a zoom 200/400%, VoiceOver/TalkBack, network trace, accertamento cookie effettivi o test di stampa/download su smartphone. Non dichiarare questi elementi superati.

## 2. Difetto verificato e correzione: rapporto dimensioni immagine

In `index.html`, `chi-sono/index.html` e `anteprima.html`, la foto `img/foto-roberto-boscia-casual.webp` aveva gli attributi **`width="750" height="960"`**: rapporto circa 0,78125. L'ispezione dei metadati interni VP8 del file WebP tramite GitHub ha confermato **1023 × 1537 px**, rapporto circa 0,66558 (differenza relativa di circa 17,4% fra i rapporti). Gli attributi dichiarati non rispecchiavano la risorsa reale, con rischio di prenotazione errata dello spazio e layout shift.

**Corretto nei tre file del SOLO ramo sviluppo** con `width="1023" height="1537"`. Sono state controllate anche le risorse:
- `img/foto-roberto-boscia-casual.jpg`: **1023 × 1537**;
- `img/foto-roberto-boscia.webp`: **1024 × 1535**;
- `img/foto-roberto-boscia.jpg`: **1024 × 1535**;
- `img/hero-1.webp`: **1536 × 1024**.

Gli attributi JPG nella pagina Assetto Biologico™ erano già coerenti.

Commit:
- `6e7ff69a6bfbff50fd950017b6a8c900c81b689c` homepage;
- `494ad7d0d1e41125faef5e9c8f4e7ca44fdcae43` pagina Chi sono;
- `097f4272d1c6de8a0acbb6532189db1a81a79440` anteprima.

Resta **non accertato** il rapporto intrinseco e le dimensioni della copertina immagine esterna `www.dormirefacile.com/images/book_cover.webp`, presente su home, libro, shop e anteprima; non inserire numeri inventati. La provenienza esterna della copertina resta anche una voce da verificare nell'audit privacy/network.

## 3. Accessibilità: preferenza Riduci movimento

Problema reale nel codice: le animazioni GSAP e gli scorrimenti attivati via `element.scrollIntoView({behavior:"smooth"})` ignoravano la preferenza di sistema **`prefers-reduced-motion: reduce`**.

**Correzioni effettuate SOLO nello sviluppo:**
- `script.js`: ora il blocco GSAP si attiva soltanto quando librerie disponibili **e** `prefers-reduced-motion` non è richiesto. Header, menu e contenuto restano disponibili anche quando le animazioni sono disattivate.
- `laboratorio-del-sonno/strumenti/check-up.js` (2 scorrimenti), `diario-pro.js`, `caffeina.js`, `turnisti.js`, `laboratorio-del-sonno/diario.js` (1 ciascuno): lo scorrimento automatico passa a `auto` in presenza della preferenza di riduzione del movimento, altrimenti mantiene `smooth`.
- Verifica con DOM sintetico del Check-up: impostando `matchMedia(...).matches=true`, comportamento passato a `auto`; con `false` rimane `smooth`. Test della landing con mock GSAP: preferenza attiva = zero animazioni invocate; modalità normale = funzioni invocate.
- Ri-verifica di sintassi con compilazione JS di 8 file: **8/8 superati**. Questo non è un test end-to-end d'accessibilità.

Commit:
- `affc4770cd25a0e279b6e9095a4e0b034a832300` `script.js`;
- `fca2a1c1121fd91f172bb803785a4caf7d36f84e` Check-up;
- `b86310f0257ee39e69f00db09d80b6e2d6e767de` Diario PRO;
- `3afb8606389bda95e191a7d4f39616d33b454a61` Caffeina;
- `439d5c4f104004491c461b423ecc33f33fc9d289` Turnisti;
- `2fbc40219f4d2baf6910a7674393ab9a87d74e6e` Diario standard.

## 4. Revisione CSS responsive: risultato limitato

Esaminati nel ramo di sviluppo: `portale.css`, `laboratorio-del-sonno/strumenti/strumenti.css`, `laboratorio-del-sonno/diario.css`, `accademia/accademia.css`, `libro/libro.css`, `shop/progetti.css`, `consulenze/consulenze.css`. Tutti includono regole `@media` per dispositivi stretti, con breakpoint anche a 560/480/450/420/390/380px in differenti file; vengono applicate griglie a una colonna nei layout principali. In due componenti di diario sono previste tabelle con `min-width` all'interno di contenitori scrollabili. **La presenza di CSS responsive non basta a provare l'assenza di overflow o dimensioni adeguate dei pulsanti.** Questi restano da misurare in browser.

## 5. Privacy/tracciamento sul dominio pubblico — stato esatto

**Confermato:**
- Browser remoto ha aperto `/`, `/privacy/`, `/cookie/`;
- pagine informative collegate e modulo contatti del sito pubblico già sospeso in precedenza;
- il codice pubblico `main` non include il vecchio loader automatico di Google Analytics (verifica documentata negli audit precedenti);
- i sorgenti della vecchia landing fanno riferimento a risorse JS cdnjs/Cloudflare e l'hosting è GitHub Pages.

**NON confermato in sessione browser mediante rete/storage:**
- assenza totale di richieste di terzi o tag di analytics esterni all'HTML;
- numero, nomi, durate e finalità di cookie reali, anche tecnici;
- inventario delle chiavi `localStorage` o altri meccanismi del browser;
- eventuali cookie o log impostati dai provider di hosting e CDN;
- trasferimenti verso Paesi extra SEE e durate effettive di conservazione.

Non aggiungere banner per finta, né dichiarare cookie `0` e assenza di tracciamento come fatto verificato.

## 6. Prossimi collaudi necessari prima del lancio

1. **Safari su iPhone fisico**: homepage, Chi sono, Assetto, Check-up, Diario, Diario PRO, Caffeina, Turnisti; rotazione verticale/orizzontale, tastiera, focus, zoom testo, opzione «Riduci movimento», salvataggio opzionale e cancellazione dati, download CSV/TXT, stampa/condivisione file. Verificare in particolare blocchi con tabelle scrollabili e grafici.
2. **Browser con DevTools e profilo pulito**: su sito pubblico, poi su preview privata autorizzata del nuovo portale, aprire Network/Storage prima della navigazione, conservare HAR senza dati personali, leggere domains/Set-Cookie/localStorage e verificare che non si carichi GA4. Testare con protezione tracking attiva e disattiva.
3. **Lighthouse in modalità Mobile** su preview correttamente ospitata: registrare LCP, CLS, INP ove disponibile, Performance, Accessibilità, Best Practices e SEO; verificare punti critici su risorse esterne, immagini, titoli/contrasto/touch target. **Nessun punteggio è stato ancora misurato.**
4. **Revisione umana WCAG** con tastiera, VoiceOver/TalkBack, contrasto e zoom; non sostituire con solo controllo automatico.
5. **Completamento legale** (fornitori, retention, recapito postale completo, casella email valida, trasferimenti e consulenza competente) prima di definire definitive le informative.

**Gate invariato:** il nuovo portale resta sul ramo di sviluppo; nulla da questa fase autorizza copia o merge in `main`.


## 26/10/2026 — Post-pubblicazione: tentativo audit rete/cookie e iPhone

**Origine:** dopo il rilascio autorizzato del nuovo portale pubblico, l'utente ha chiesto esplicitamente «fallo» in riferimento a (1) prova su iPhone fisico, (2) ispezione tecnica dei cookie e richieste di rete. Il precedente testo «gate invariato, sito ancora in sviluppo» si riferiva a uno stato superato: il portale è stato pubblicato su `main` il 26/10/2026.

**Effettuato:**
- Ispezione tramite browser remoto sul vero dominio `https://drrobertoboscia.com/`, sessione documentata: https://agent.tinyfish.ai/runs/6642a91b-55e2-4f1d-8760-784283e63988 (20 passaggi, stato completed).
- HTML/DOM visibile homepage: immagini remote `www.dormirefacile.com/images/book_cover.webp` e `mentalpro.it/images/product.webp` e link a `mentalpro.it`. Nessun script Google Analytics, gtag, Meta Pixel o iframe rilevato nella homepage; non dedurre da questo l'assenza globale di richieste HTTP.
- Revisione statica di 37 sorgenti `html/js/css` sul `main`: nelle pagine del portale non sono emerse chiamate applicative a `fetch`, `XMLHttpRequest`, `sendBeacon`, `document.cookie` o tracker comuni; il Diario usa `localStorage` opzionale (e il Diario PRO può leggerlo su azione esplicita), non un upload server. Questa analisi per pattern non è un HAR o inventario browser.
- **Altri fornitori di rete già esplicitati**: la pagina Assetto Biologico™ carica GSAP e ScrollTrigger da `cdnjs.cloudflare.com` (non presente nella homepage), e le immagini del libro/Mental Pro usano host separati. GitHub Pages registra IP per sicurezza secondo documentazione GitHub https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages .
- Verificato nel codice live GitHub che **entrambe** le informative `privacy/index.html` e `cookie/index.html` menzionano già esplicitamente `mentalpro.it`, oltre a `www.dormirefacile.com` e `cdnjs.cloudflare.com`; nessuna modifica aggiuntiva necessaria. Il codice `main` è stato aggiornato da altre modifiche successive al rilascio; recuperare sempre HEAD fresco prima di scrivere.
- Font self-hosted nel portale; homepage meta viewport presente. Nessuna prova che il CSS sia privo di overflow a 390px.

**Limiti non superati dal browser remoto:**
- NO accesso a DevTools Network (headers `Set-Cookie`, domini richiesti, tracce HAR, cookie HttpOnly, header CSP, CORS).
- NO accesso a `document.cookie`, pannelli Application/Storage o `localStorage` prima/dopo l'uso.
- NO modifica verificabile di viewport a 390px e nessuna prova touch su iPhone reale/Safari/WebKit; impossibile controllare un iPhone fisico dall'istanza ChatGPT.
- NO inventario cookie con nome, dominio, scadenza; NO conclusione «0 cookie», «GDPR completamente conforme», «nessun tracciamento possibile»; niente banner CMP finché non vi siano tracker non tecnici che lo richiedano. Un banner assente non prova cookie assenti. Fonte: https://www.garanteprivacy.it/faq/Cookie .

**Residuo minimo per chiudere:** prova manuale reale Safari/iPhone, meglio con screenshot, e acquisizione HAR + Storage/Cookies da un browser con DevTools accessibili. Senza tali evidenze questa porzione dell'audit resta **parziale** anche se il codice statico è favorevole.
