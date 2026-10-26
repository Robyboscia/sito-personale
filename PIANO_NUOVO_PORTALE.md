# Piano nuovo portale drrobertoboscia.com

## Regole di salvaguardia
- Non modificare main, CNAME o configurazione GitHub Pages senza approvazione.
- Backup immutato: backup-sito-originale-2026-10-24.
- Conservare integralmente il copy e il funzionamento della landing Assetto Biologico™.
- Prima di spostare la landing in /assetto-biologico/, verificare tutti i percorsi relativi di CSS, JS, immagini e font, link interni, canonical, OG, sitemap, form e analytics.
- Non pubblicare finché non è stata approvata una preview separata.

## Architettura proposta
- / — homepage professionale e navigazione generale.
- /assetto-biologico/ — landing originale preservata.
- /consulenze/ — **sezione rimandata, soltanto pagina “Ancora da costruire”**. Non duplicare Assetto Biologico™ e non mostrare prezzo o dettagli del Metodo.
- /laboratorio-del-sonno/ — strumenti educativi e questionari.
- /accademia/ — articoli e formazione.
- /libro/ — Dormire è facile se sai come farlo, con collegamento a dormirefacile.com. **Copertina autentica disponibile su https://www.dormirefacile.com/images/book_cover.webp**. Non inventare un mockup tipografico in sua sostituzione.
- /shop/ — collegamenti ai prodotti e a mentalpro.it.
- /contatti/ — contatti e privacy.

## Sequenza operativa
1. Inventario completo di contenuti, asset, dipendenze, link e modulo.
2. Copia autonoma della landing in /assetto-biologico/ con correzione dei percorsi e metadata.
3. Homepage nuova nel ramo di sviluppo.
4. Verifiche mobile, accessibilità, SEO, form e link.
5. Preview separata, approvazione, quindi eventuale rilascio.

## Stato
Documento di pianificazione: nessuna modifica al sito pubblico.

## Decisione confermata — Consulenze (25/10/2026)
- L'utente trova ridondante la distinzione fra "Consulenze" e "Metodo" se entrambe raccontano Assetto Biologico™.
- **Metodo** continua a portare alla landing autonoma di Assetto Biologico™. Non modificarne copy, prezzo, moduli o funzione.
- **Consulenze** deve rimanere una pagina-segnaposto con la dicitura "Ancora da costruire" (senza promozioni, tariffe, prenotazioni o duplicati di Assetto Biologico™).
- L'argomento sarà ripreso **solo più avanti, quando l'utente deciderà di svilupparlo**. Non anticipare offerte o consulenze non definite.
- Aggiornata anche l'anteprima in homepage per rispecchiare lo stato sospeso.

## Stato di avanzamento — 25 ottobre 2026
- Homepage, Chi sono, Metodo originale, Laboratorio del Sonno, Accademia, Libro, Contatti e Progetti sono presenti sul ramo di sviluppo.
- **Consulenze resta intenzionalmente “Ancora da costruire”** per decisione dell'utente; non riaprire il tema senza nuova indicazione.
- **Libro:** usare la copertina originale su https://www.dormirefacile.com/images/book_cover.webp; la nuova pagina Libro è già dedicata al volume.
- **Progetti:** pagina `/shop/` rifinita come portale verso Mental Pro (link `https://mentalpro.it/`), libro (link interno) e strumenti educativi; niente carrello, prezzi o dichiarazioni di disponibilità non verificate. Visuale Mental Pro volutamente astratta, non falso packaging.
- **PROSSIMA FASE — Audit pre-pubblicazione obbligatorio**, non aggiungere altre landing finché l'utente non lo richiede:
  1. Test reale smartphone (in particolare menu delle pagine, overflow, pulsanti e leggibilità).
  2. Controllo di tutti i link relativi/esterni, immagini, PDF e navigazione trasversale.
  3. Verifica conservativa della landing Assetto Biologico™: funzioni, moduli, analytics, SEO, privacy e copy originali.
  4. Verifica GDPR e gestione dei dati per il Diario digitale, salvataggio locale e funzione email, più informativa generale.
  5. Revisione scientifica e legale dei contenuti orientati alla salute e dei confini della professione di farmacista.
  6. Controllo SEO, canonical, sitemap, accessibilità e prestazioni; QA prima del rilascio.
- **Non unire in `main` e non pubblicare** senza approvazione esplicita dell'utente dopo revisione.

## Audit tecnico avviato — 25 ottobre 2026
- Risultati e criteri di blocco della pubblicazione in **`AUDIT_PREPUBBLICAZIONE_2026-10-25.md`**.
- Corrette esclusivamente due path `srcset` delle immagini WebP in `assetto-biologico/index.html` sul ramo di sviluppo.
- **Bloccanti P0:** il modulo originale simula una conferma senza inviare davvero la richiesta; configurazione privacy/analytics e informativa generale da verificare/completare.
- Test mobile reale (iPhone) **ancora mancante**; CSS e markup responsivi presenti, ma il browser desktop non può convalidarne la resa sul dispositivo.
- Il sito pubblico `main` non è stato modificato.

## Quattro strumenti interattivi del Laboratorio — 25 ottobre 2026
- Implementati nel ramo `sviluppo-nuovo-portale`:
  1. **Check-up del Sonno** — 12 domande originali, mappa educativa stampabile, gratuito.
  2. **Calcolatore della Caffeina** — inserimenti multipli, scenari con emivita 3/5/7 ore, gratuito.
  3. **Diario del Sonno PRO** — importa il CSV del diario o le schede salvate sullo stesso browser, metriche e report stampabile, **prototipo senza pagamenti**.
  4. **Turni & Sonno** — 7 giorni di turni, intervalli, finestre illustrative e CSV, **prototipo senza pagamenti**.
- Sono raggiungibili dalla pagina Laboratorio e dal portale Progetti. Per sicurezza sono marcati `noindex` durante lo sviluppo.
- **Quinto progetto Wearable Decoder:** da **non sviluppare finché non vengono recuperate le dispense dei corsi specifici che l'utente afferma di aver seguito**. Non attribuire nomi di corsi non verificati.
- Fonte di verità per criteri e backlog: **`laboratorio-del-sonno/strumenti/ROADMAP.md`**.
- QA, revisione scientifica e privacy indispensabili prima della pubblicazione.

## Avanzamento del 26 ottobre — Turni, contatti e analytics
- **Turni & Sonno completato come prototipo:** timeline grafica 24 ore x 7 giorni con passaggio delle notti oltre mezzanotte, indicatori semplici, finestre non disponibili, avvisi di pause ravvicinate, esempio inventato (5 turni / 40 ore / 2 giorni marcati riposo / una pausa sotto 11 ore), esportazione CSV. Browser desktop verificato, Safari iPhone reale ancora da testare.
- **Modifica prioritaria sicurezza informazioni:** eliminata sul ramo di sviluppo la falsa conferma «Richiesta inviata» del form Assetto Biologico™. Ora il form prepara una bozza email con `contact-mailto.js`, confermando apertamente che l'utente deve inviarla dalla propria app. Nessun backend, nessuna prova di consegna. CTA mobile telefonica fittizia rimossa.
- **Privacy:** caricamento automatico GA4 della landing rimosso nel ramo di sviluppo; prima di riattivarlo servono revisione privacy/cookie e relativi adempimenti. Informativa privacy generale ancora da predisporre.
- **Test svolti:** JS sintatticamente valido, validazione HTML email, URL `mailto:` con caratteri speciali, link locali landing presenti, ID non duplicati. Non equivalente a prova con email client iPhone.
- **Documenti fonte:** `AUDIT_PREPUBBLICAZIONE_2026-10-25.md`, `laboratorio-del-sonno/strumenti/ROADMAP.md`, `RIPRENDI_DA_QUI_2026-10-25.md`.
- **Non pubblicare ancora:** per il modulo con consegna automatica serve una scelta di backend/provider; per il sito restano documentazione privacy, QA iPhone, SEO e revisione professionale. `main` non deve essere modificato.

## Stato privacy e cookie — 26 ottobre 2026

- Privacy generale e Cookie: **bozze complete per le parti tecnicamente conoscibili**, presenti in `privacy/index.html` e `cookie/index.html`, entrambe `noindex,follow` e non giuridicamente validate.
- Diciannove pagine del portale preesistente collegate dal footer alle due pagine; aggiunti anche avvisi vicino a contatti, salvataggio Diario e importazione Diario PRO.
- Scansione statica 21 HTML: nessun link locale rotto e nessun ID ripetuto negli HTML analizzati.
- Checklist per finalizzare: `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`. Restano conferme di titolare, hosting/CDN, log, provider mail, data retention, eventuali cookie e trasferimenti; test su Safari iPhone.
- Nessun tracciatore nuovo, nessun banner fittizio, nessun deploy. `main` invariato.

## Risultato audit SEO e funzionale — 26 ottobre 2026
- Conclusa scansione statico-funzionale nel ramo di sviluppo: 21 pagine HTML, 8 script JS, sitemap/robots, canonical, social preview, markup strutturato, link, ID, `alt`.
- Sitemap pronta con 12 URL candidati all'indicizzazione, nove pagine `noindex` escluse; corrispondenza canonical/OG verificata 12/12.
- Metadati social aggiunti, schema JSON-LD minimizzato e coerente, GSAP JS reso tollerante agli errori di CDN. Test logici Caffeina/Diario/Diario PRO superati; test Check-up/Turni e navigazione desktop in precedenza.
- **Report di riferimento:** `AUDIT_SEO_FUNZIONALE_2026-10-26.md`. Domini esterni, privacy e cookie live, Performance PageSpeed, QA iPhone e rilascio pubblico rimangono non verificati. `main` invariato.
