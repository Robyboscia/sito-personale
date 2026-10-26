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
| Immagini senza `alt` | Nessuna fra le immagini HTML esaminate | I tre ritratti locali privi di dimensioni sono stati corretti; restano le copertine esterne, con dimensioni non verificate |
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

## 6. Ultima rifinitura titoli e raggiungibilità
- Tre titoli SEO corretti dopo controllo lunghezze e duplicazioni: «Chi sono» non ripete più il nome due volte; i titoli degli articoli «Luce e ritmo circadiano» e «Wearable e sonno» sono ora più sintetici, con `og:title` aggiornato coerentemente.
- Nessun titolo duplicato fra le 12 pagine indicizzabili; tutte le meta-description presenti. Tre pagine ripulite da ridondanze, senza modificare i contenuti scientifici.
- La homepage collega direttamente le sezioni principali e i tre articoli; l'Accademia collega gli articoli; il Laboratorio collega diario e quattro strumenti. Raggiungibilità strutturale dal portale verificata sui menu e collegamenti espliciti.
- La meta-description della landing Assetto Biologico™ supera 170 caratteri: non è un errore tecnico bloccante, ma il contenuto/promesse commerciali vanno rivisti insieme alla revisione professionale prima del rilascio.

## 7. Verifica aggiuntiva e ottimizzazione immagini — 26 ottobre 2026
- Riesaminate **12/12 pagine destinate all'indicizzazione** direttamente dal ramo `sviluppo-nuovo-portale`: tutte hanno `title`, meta-description, `canonical` assoluto, `og:url` coerente col canonical e `og:image`. Nessuna discordanza rilevata nel controllo puntuale. **La modifica è nel ramo sviluppo, non nel sito pubblico.**
- Le immagini JPEG locali della pagina `assetto-biologico/index.html` sono state decodificate dai file Git per verificare le dimensioni intrinseche: `img/foto-roberto-boscia-casual.jpg` è **1023 × 1537 px**; `img/foto-roberto-boscia.jpg` è **1024 × 1535 px**.
- Aggiunti attributi HTML `width` e `height` alle **tre occorrenze** dei due ritratti (uno casual e due professionali), senza intervenire sul CSS o alterare l'aspetto previsto. Commit `de2615f19aaf872ad149f035ccb2a15a844cbece`.
- Nelle pagine esaminate le uniche altre immagini senza dimensioni dichiarate sono le **quattro occorrenze** della copertina caricata da `https://www.dormirefacile.com/images/book_cover.webp` (homepage, anteprima, libro, progetti). Poiché non sono state verificate le dimensioni native né la disponibilità dal contesto di audit, **non** sono stati inventati valori. Da verificare e, possibilmente, ospitare localmente con diritti e proporzioni corretti prima del lancio.
- Il file `sitemap.xml` nel ramo sviluppo conserva **12 URL**, e `robots.txt` fa riferimento all'indirizzo canonico; la sitemap della versione live è una verifica separata post-deploy, non superata da questo controllo.
- Stato dei blocchi: invariato. Restano privacy/hosting/consenso, QA reale iPhone-Safari, verifiche HTTP e Lighthouse/Search Console dopo eventuale pubblicazione autorizzata. Non usare il risultato dell'audit statico come misura Core Web Vitals.

## 8. Continuazione privacy e cookie — 26 ottobre 2026

- Rifinite e salvate le due informative in `privacy/index.html` e `cookie/index.html` (sempre **solo nel ramo di sviluppo**): privacy portata a 10 sezioni con conferimento/decisioni automatizzate, destinatari e trasferimenti; cookie con tabella esplicita dell'unica chiave localStorage identificata nello script del Diario.
- Test statico post-modifica: entrambe le pagine restano `noindex,follow`; la privacy espone 10 sezioni e il menu interno non ha destinazioni inesistenti; la nuova tabella cookie è presente. Non effettuato audit dinamico browser Safari né verificati i cookie sul server del ramo in produzione.
- **Rischio distinto sul sito pubblico corrente:** l'URL live della homepage presenta ancora la vecchia landing; nell'HTML di `main` resta loader Google Analytics; gli URL `/privacy/` e `/cookie/` nel sito live restituiscono 404 (verifica esterna 26/10/2026). Occorre chiarire presenza di altri percorsi informativa/consenso prima di concludere violazioni e occorre una prova DevTools su sessione pulita. Nessuna modifica a `main`.
- Le informative **non possono ancora essere etichettate definitive** senza dati giuridici, retention e provider verificati, test rete e validazione legale; il lavoro svolto ne prepara la versione approvabile senza introdurre false certezze.

## 9. Cookie/privacy: provider identificati, email differita — 26 ottobre 2026

- **Public:** GitHub Pages confermato come hosting statico, con registrazione IP visitatori per sicurezza dichiarata da GitHub (https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Resource CDN `cdnjs.cloudflare.com` identificata per GSAP, operata da Cloudflare (https://ajax.cdnjs.com/), con segnalazioni tecniche NEL. Le pagine Privacy e Cookie su `main` sono state aggiornate di conseguenza, senza definire retention dei log non attestata.
- **Development:** modulo Assetto sospeso e disabilitato, nessuna email fittizia configurata; contatti non propongono link mailto errati. Documenti Privacy/Cookie nel ramo di sviluppo riflettono titolare persona fisica e provider accertati.
- Il servizio email sarà deciso separatamente dal titolare in seguito. Non attivare invio, analytics, banner o contatti fittizi prima di configurazione verificata; nessun merge del nuovo portale.
- Ancora da testare: cookie/header e storage in sessione browser pulita sul dominio definitivo, eventuali trasferimenti extra SEE, periodo di conservazione dei log e dati professionali completi per la valutazione legale.


## 22. Collaudo statico e dei calcoli — 26 ottobre 2026
- Eseguito controllo sistematico di **21 pagine HTML** e **8 file JS** del nuovo portale. Nessun link locale verso file inesistenti, ancoraggio interno mancante, ID HTML duplicato, img senza alt, `aria-labelledby`/`aria-describedby` statico irrisolto, `target=_blank` senza noopener. Tutti e 8 i file JavaScript compilati dal motore V8 senza errori sintattici.
- **26 scenari di calcolo specifici** coperti nei moduli Caffeina, Check-up, Diario 14 notti, Diario PRO/CSV e Turnisti, inclusi mezzanotte, stime parziali, rigetto di dati incoerenti, escaping CSV/anti-injection, riepilogo favorevole, settimana di turni e intersezioni. Rilanciati i casi di mezzanotte dopo aver corretto l'aspettativa dell'harness (il calcolo del sito era corretto).
- **Correzione reale accessibilità:** `laboratorio-del-sonno/strumenti/check-up.js`, il titolo generato del grafico riepilogativo ha ora `id="check-summary-title"` corrispondente all'elemento con `aria-labelledby` (commit `fd1a4ef7a96f3351eab2dfe3595dde76a47673ba`).
- Verificate le risorse remote dichiarate nelle bozze privacy: `cdnjs.cloudflare.com` per animazioni e `www.dormirefacile.com/images/book_cover.webp` per la copertina; questi accessi non sono cookie necessariamente, ma richiedono network test.
- REPORT COMPLETO salvato in `COLLAUDO_NUOVO_PORTALE_2026-10-26.md` (commit `d28cf7f5910aaf74d591999cec8fca79394aa767`).
- **Limiti importanti:** senza pubblicare una preview separata del ramo di sviluppo, non è stato possibile testare layout/dispositivi reali, i browser e gli eventi end-to-end su un sito effettivamente reso né tracce cookie/network. Non dichiarare collaudo completo browser o produzione. `main` non modificato da questo collaudo. Prima del rilascio occorrono prova su dispositivo reale, attivazione/test della casella email e verifica privacy dei fornitori.

## 10. QA accessibilità, immagini e browser pubblico — 26 ottobre 2026

- Report dettagliato: `QA_MOBILE_ACCESSIBILITA_PRIVACY_2026-10-26.md`.
- Test di navigazione in browser remoto **sul vecchio sito pubblico**: `/`, `/privacy/`, `/cookie/` raggiungibili; moduli sospesi. Non era disponibile controllo DevTools Network/Storage né emulazione affidabile esatta 390px. Cookie e richieste runtime restano da verificare, non dichiarare inesistenti.
- **CLS/prestazioni**: formato file del WebP `img/foto-roberto-boscia-casual.webp` confermato 1023×1537, ma homepage, Chi sono e anteprima indicavano 750×960. Attributi intrinseci corretti in tutti e tre i file dev. Non dichiarare CLS=0 senza test visivo/metriche.
- **Accessibilità**: le animazioni JS GSAP sulla landing ora rispettano `prefers-reduced-motion`; inoltre gli scorrimenti automatici dei 4 strumenti e del Diario standard diventano `auto` con la preferenza attiva. Test con `matchMedia` simulato + controllo sintassi 8/8 JS. Necessario controllo su dispositivi reali e VoiceOver/TalkBack.
- Copertina del libro carica tuttora da dominio terzo e non ha width/height confermate. Il futuro audit di rete/privacy deve tenerne conto.
- La casella email professionale resta da attivare in seguito. `main` non modificato dal presente QA.

## 11. Audit scientifico e professionale contenuti (21 pagine) — 26 ottobre 2026

- Vedi `AUDIT_SCIENTIFICO_PROFESSIONALE_2026-10-26.md` per inventario tutte le 21 pagine, prima/dopo, fonti scientifiche e aspetti professionali. Correzioni centrali su landing Assetto Biologico™: niente diagnosi implicita delle cause della stanchezza, misurazione dell'architettura sonno con wearable, BIA come diagnosi di membrane cellulari, misure di «recupero sistema nervoso» senza parametro. Rimossa fascia social-proof non verificata.
- CTA «Prenota» / «Richiedi» incoerenti con modulo disabilitato ora sostituite con informazione e stato sospeso; controllo urgente conversione/accessibilità prima dell'eventuale riattivazione. Review professionale del protocollo Assetto e coerenza dei €497/2 follow-up ancora obbligatoria.
- Articolo Diario: aggiunta indicazione CBT-I come prima scelta nell'insonnia cronica, con riferimento VA/DoD 2025. Home/anteprima/Laboratorio aggiornati allo stato reale dei prototipi.
- Pagine legali del dev aggiornate per recapito postale parzialmente confermato e rimozione di testo obsoleto su GA4 pubblico.
- **Main intatto**; non considerare queste correzioni autorizzazione a pubblicare l'intero portale.
