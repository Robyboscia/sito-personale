# Audit SEO e funzionale — Portale Roberto Boscia
**Data:** 26 ottobre 2026  
**Repository:** `Robyboscia/sito-personale`  
**Ramo verificato e modificato:** `sviluppo-nuovo-portale`  
**Stato:** audit statico SEO/funzionale completato, correzioni salvate sul ramo; **QA reale e pubblicazione ancora sospesi**  
**Ramo pubblico `main`: NON modificato.**

## 1. Perimetro e metodo
- Inventario Git: **21 pagine HTML del portale** più un file HTML di verifica Google, **8 script JavaScript**, **9 file CSS**, immagini, file di servizio.
- Revisione dei 21 HTML: `title`, `description`, `h1`, canonical, meta robots, Open Graph, URL interni, `id` duplicati, immagini `alt`, riferimenti `src/href`, codice strutturato presente.
- Riferimenti locali relativi e assoluti verificati contro l'albero Git del ramo di sviluppo. I riferimenti con frammento locale sono stati controllati; il collegamento interpagina a `assetto-biologico/index.html#form-contatto` punta a un ID esistente.
- Script JS verificati sintatticamente con parsing ECMAScript (8/8 OK); test isolati sul modello dei principali calcolatori. NON equivale a test completo di tutte le interazioni in Safari.
- Test browser desktop dell'anteprima GitHub sui percorsi principali. Il resoconto di navigazione automatica conteneva anche descrizioni non corrispondenti al codice (es. uno slider 0–10 nel Check-up o un banner cookie nella pagina Privacy, che **non esistono**). Queste descrizioni NON sono state assunte come evidenza: i risultati verificabili sono stati incrociati con HTML/JS. Non usare quel resoconto come prova di consenso cookie attivo o di test iPhone.
- Gli host `raw.githack.com` e `raw.githubusercontent.com` sono servizi di anteprima e non provano il comportamento di `drrobertoboscia.com` in produzione.

## 2. Correzioni SEO effettuate
### Sitemap e indicizzazione
- In precedenza `sitemap.xml` elencava solo la homepage, con `lastmod` rimasto a giugno 2026 e tag `priority/changefreq`.
- Aggiornata la sitemap nel ramo di sviluppo con **12 URL assoluti**, coincidenti esattamente con le URL canoniche delle pagine destinate all'indicizzazione.
- Escluse correttamente le **9 pagine con `noindex`**: `anteprima.html`, `consulenze/`, `privacy/`, `cookie/`, la nota tecnica privacy del Diario e i quattro strumenti prototipali.
- Non sono stati inventati `lastmod`: secondo Google devono riflettere l'ultima modifica significativa e verificabile. Non aggiunti `priority/changefreq`, ignorati da Google. 
- `robots.txt` contiene già la direttiva Sitemap corretta; `Allow: /` permette ai crawler di leggere `noindex`, che non va occultato tramite `Disallow`.

### Canonical e anteprime
- 12/12 pagine indicizzabili con: `title`, `description`, `h1`, canonical assoluto, `og:url` coincidente con il canonical e `og:image`.
- Completati i metadati Open Graph mancanti (`og:title`, `og:description`, `og:type`, `og:site_name`, `og:locale`, URL immagine) e `twitter:card` dove assente.
- L'immagine social attuale è principalmente il ritratto WebP già presente nel repository. **Resta consigliabile** una grafica di condivisione orizzontale dedicata e una prova di anteprima sulle piattaforme: non sono state dichiarate dimensioni 1200×630 non verificate.

### Dati strutturati
- La landing Assetto Biologico™ presentava **due blocchi JSON-LD duplicati** con `WebPage` attribuito erroneamente alla root, e valori `MedicalBusiness`, `LocalBusiness`, `Service/Offer` non confermati. Nella fase immediatamente precedente all'audit erano stati sostituiti con un solo blocco fattuale `Person + WebPage`, con URL corretto; confermato qui.
- Aggiunti dati `Person`, `WebSite`, `WebPage` minimali alla nuova homepage.
- Aggiunti `BreadcrumbList` sui tre articoli dell'Accademia, con nomi e URL corrispondenti alle pagine.
- JSON-LD analizzato con parser JSON, senza errori nei file verificati. Rich Results Test/Google Search Console da eseguire dopo pubblicazione autorizzata.

## 3. Controlli funzionali
| Verifica | Esito | Limiti |
|---|---|---|
| 21 pagine: `title`, descrizione, un solo `h1` | OK | Esame statico |
| Link e risorse locali `href/src` | Nessun percorso locale mancante nell'inventario esaminato | Non certifica gli URL esterni |
| ID duplicati nei 21 HTML | Nessuno | Esame statico |
| Immagini senza `alt` | Nessuna fra le immagini HTML esaminate | Alcune immagini mancano di dimensioni HTML dichiarate |
| Modelli JS | 8/8 sintatticamente validi | Non sostituisce test browser end-to-end |
| Landing Assetto | Previsto fallback se GSAP/ScrollTrigger non sono disponibili; menu mobile aggiornato correttamente con `aria-expanded=false` alla chiusura da link | Da testare su telefoni reali |
| Modulo Contatti | `mailto:` preparato sul dispositivo, nessun falso invio; unit test con valori fittizi, inclusi caratteri speciali | Non c'è invio server; manca prova con client email iPhone |
| Diario digitale | **8/8** casi di calcolo superati, inclusa stima parziale con risvegli mancanti, coerenza dati, attraversamento mezzanotte | Manca test completo salvataggio/CSV/Safari |
| Diario PRO | **7/7** casi parser/import superati con CSV sintetico corretto, gestione WASO parziale, righe corrotte, intestazioni mancanti e citazioni CSV | Manca test download PDF effettivo |
| Calcolatore Caffeina | **6/6** casi modello superati, inclusa la notte dopo mezzanotte e l'avanzamento del giorno | Non è una misura clinica |
| Check-up del Sonno | Precedentemente testati 4 scenari di livello e 4 spicchi uguali, demo browser; script rimasto valido | Soglie illustrative non validate clinicamente |
| Turni & Sonno | Precedentemente testati 7 casi logici, passaggio mezzanotte, demo desktop 5 turni/40 ore | Nessuna verifica CCNL/legale |
| Browser desktop | Percorsi e demo principali aperti in anteprima; segnalazioni non confermate dall'HTML escluse dalle conclusioni | Non copre Safari iPhone né tutto il sito |

## 4. Dipendenze esterne e rischio SEO/performance
- Copertina del libro caricata da `https://www.dormirefacile.com/images/book_cover.webp` su più pagine: l'immagine ha attributo `alt`, ma manca una dimensione intrinseca HTML nota; verificare stabilità/CLS e disponibilità dell'origine. Il fetch esterno non è stato confermato dagli strumenti di verifica, perciò NON dichiararla certamente rotta.
- La landing usa librerie GSAP da `cdnjs.cloudflare.com`: aggiunto comportamento di degradazione senza errore se CDN bloccato; restano da verificare la consegna degli asset e le implicazioni privacy di tale dominio.
- Link verso `mentalpro.it`: una verifica web esterna ha restituito un errore **526**, non sufficiente per affermare universalmente che il sito sia offline; riprovare direttamente dal dispositivo e verificare certificato/CDN prima del lancio.
- Performance effettive (Core Web Vitals, PageSpeed/Lighthouse), risposta HTTP/redirect, indicizzazione Google, immagini Open Graph condivise, DNS/TLS e cookie emessi dall'hosting non possono essere verificati completamente sul repository Git. Non attribuire punteggi PageSpeed immaginari.

## 5. Blocchi residui per la pubblicazione
1. **Privacy:** bozze già presenti e collegate, ma titolare giuridico, hosting/log, email, conservazione, fornitori e cookie reali da confermare; revisione legale prima della versione definitiva.
2. **Modulo automatico:** non implementato; resta soltanto una bozza via app di posta, dichiarata come tale. Configurare provider/backend reale solo se scelto.
3. **QA iPhone reale:** navigazione mobile, menu, input orari, condivisione/email, salvataggio locale Diario, download CSV, stampa/PDF e lettura dei grafici, incluso zoom/accessibilità.
4. **SEO dopo il deploy:** controllare status HTTP 200 e redirect HTTPS, Search Console, invio sitemap, Rich Results Test, robots, canonical e indicizzazione; la sitemap del ramo sviluppo **non è ancora pubblica**.
5. **Revisione contenuti professionali:** claim della landing, prezzi/offerta, riferimenti alla professione sanitaria e contenuti scientifici prima del lancio.
6. **Immagini e asset esterni:** confermare copertina libro e i link ai progetti, dimensioni e resa sociale; audit real-world della velocità.

### Regola permanente
**Non modificare `main`, CNAME, DNS, hosting o Google Search Console senza approvazione esplicita.** Tutte le correzioni SEO e funzionali qui descritte si trovano soltanto nel ramo `sviluppo-nuovo-portale`.

Fonti operative Google:  
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap  
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
