# PUNTO DI RIPRISTINO — Nuovo portale Roberto Boscia
**Data:** 25 ottobre 2026  
**Repository:** `Robyboscia/sito-personale`  
**Ramo di lavoro:** `sviluppo-nuovo-portale`  
**Ramo del sito pubblico:** `main` — **NON MODIFICARE senza consenso esplicito**  
**Ramo di backup del sito pubblico originale:** `backup-sito-originale-2026-10-24`  

> **ISTRUZIONE PER UNA NUOVA CHAT:** questo file è il punto d'ingresso per riprendere il progetto. Leggere poi `PIANO_NUOVO_PORTALE.md`, `AUDIT_PREPUBBLICAZIONE_2026-10-25.md` e `laboratorio-del-sonno/strumenti/ROADMAP.md`. Lavorare **solo** su `sviluppo-nuovo-portale`, mostrando anteprime legate a SHA di commit completo attraverso `raw.githack.com`. Non fondere il ramo in `main` né modificare DNS, dominio, CNAME o GitHub Pages senza approvazione esplicita.

## 1. Situazione generale

Il nuovo portale professionale `drrobertoboscia.com` è sviluppato e salvato in GitHub; il sito pubblico originale su `main` continua ad essere separato. Il repository contiene HTML/CSS/JavaScript statici e risorse locali. La richiesta di oggi è **conservare integralmente il lavoro per poterlo riprendere anche se la chat termina**: GitHub ha già storicizzato le modifiche in commit, e dopo questo documento viene creato anche un ramo di backup specifico.

La strategia è **preview, revisione, test, poi eventuale pubblicazione**. La piattaforma non deve essere scambiata per un sistema sanitario o un servizio diagnostico. L'utente preferisce testare e correggere una funzione alla volta, con terminologia comprensibile ai non professionisti.

## 2. Architettura e percorsi del repository

- `index.html`: homepage principale del portale nel ramo di sviluppo; `anteprima.html`: versione autonoma con CSS incorporato per l'anteprima.
- `portale.css`: stile e componenti condivisi.
- `chi-sono/index.html`: pagina professionale.
- `assetto-biologico/index.html`: landing preesistente del Metodo Assetto Biologico™ con modulo. **Conservare integralmente i contenuti e le funzioni originali salvo correzioni concordate.**
- `consulenze/index.html` + `consulenze/consulenze.css`: pagina intenzionalmente **«Ancora da costruire»**. L'utente ha esplicitamente rifiutato il doppione della landing Assetto Biologico™. Non inserire offerte, prezzi o una seconda landing finché non ne chiede lo sviluppo.
- `laboratorio-del-sonno/index.html`: hub educativo per gli strumenti.
- `laboratorio-del-sonno/diario/index.html`, `laboratorio-del-sonno/diario.js`, `laboratorio-del-sonno/diario.css`: Diario digitale 14 giorni; PDF stampabile in `assets/Diario_del_Sonno_14_Giorni_Dott_Roberto_Boscia.pdf`.
- `laboratorio-del-sonno/diario/privacy/index.html`: nota tecnica sulla gestione locale ed email, NON informativa generale GDPR.
- `accademia/index.html`, `accademia/accademia.css`, `accademia/{diario-del-sonno,luce-e-ritmo-circadiano,wearable-e-sonno}/index.html`: hub editoriale con tre articoli e due livelli di lettura (per tutti / per professionisti).
- `libro/index.html`, `libro/libro.css`: pagina del libro `Dormire è facile se sai come farlo`; **usare la vera copertina originale** `https://www.dormirefacile.com/images/book_cover.webp`, NON simulazioni grafiche.
- `shop/index.html`, `shop/progetti.css`: sezione Progetti, link a `mentalpro.it` e `dormirefacile.com`; nessun checkout fittizio o prodotto dichiarato disponibile senza conferma.
- `contatti/index.html`: pagina contatti.

## 3. Diario del Sonno digitale — decisioni fissate

- 14 giornate, orari a letto / tentativo di addormentamento / risveglio finale / uscita dal letto, latenza e dati opzionali; grafici e CSV.
- **Risvegli notturni: mai richiedere i minuti esatti obbligatoriamente.** Usare fasce orientative opzionali. Se mancano, segnalare **«STIMA PARZIALE»**; non presumere zero minuti di risveglio. Dove una metrica usa tali dati, includerli solo se presenti e spiegare limiti delle medie.
- Evidenziare specificatamente i campi errati in rosso e indicare che cosa correggere.
- Conservazione locale solo su scelta esplicita; nessun account o upload server di diario.
- Opzione facoltativa di **preparare email sul dispositivo dell'utente**: riepilogo in testo o condivisione CSV; l'utente deve aprire la sua app di posta e premere Invia. **Non sostenere che il sito invii email automaticamente**, né che sia garantita la consegna.
- Verificare GDPR, privacy generale e compatibilità su iPhone PRIMA del rilascio.

## 4. Quattro nuovi strumenti nel Laboratorio (implementati, PROTOTIPI)

| # | Strumento | Pagina / JS | Stato |
|---|---|---|---|
| 1 | Check-up del Sonno | `laboratorio-del-sonno/strumenti/check-up/index.html` / `check-up.js` | 12 domande, mappa educativa per quattro aree, stampa/PDF browser. Gratuito; NON scala clinica. |
| 2 | Calcolatore della Caffeina | `laboratorio-del-sonno/strumenti/caffeina/index.html` / `caffeina.js` | Assunzioni e orari, 3 scenari di eliminazione, calcolo oltre mezzanotte. Gratuito. |
| 3 | Diario del Sonno PRO | `laboratorio-del-sonno/strumenti/diario-pro/index.html` / `diario-pro.js` | Analisi CSV o salvataggio locale su azione esplicita, report TXT/stampa/PDF. Prototipo gratuito: **NESSUN pagamento attivo**. |
| 4 | Turni & Sonno | `laboratorio-del-sonno/strumenti/turnisti/index.html` / `turnisti.js` | 7 giorni di turni, intervalli fra turni, finestre illustrative, stampa e CSV. Prototipo gratuito: **NESSUN pagamento attivo**. |

Stili e utility condivisi: `laboratorio-del-sonno/strumenti/strumenti.css` e `strumenti.js`. L'hub Laboratorio e `shop/index.html` includono i link ai quattro prototipi.

### Ultime decisioni importanti sul calcolatore caffeina (25 ottobre 2026)

- **Non mostrare «emivita illustrativa» in UI.** Spiegare «smaltimento più rapido / intermedio / lento», ossia che la quantità si dimezza ogni 3 / 5 / 7 ore.
- Considerare le bevande **della giornata attuale o di una giornata tipo**, senza chiedere obbligatoriamente date. Se il coricamento è tra 00:00 e 05:59, interpretarlo come la notte successiva alla giornata simulata; una bevanda alle 00:30 può precedere il sonno delle 01:00.
- **Calcolare l'ora di quasi totale smaltimento anche il giorno dopo, due giorni dopo o più**: mai troncare a mezzanotte o dopo 24 ore.
- «Quasi completamente smaltita» significa **meno del 5% di ciascuna dose iniziale** secondo il modello, non caffeina pari a zero. Si calcola per ogni bevanda `ora assoluta di assunzione + emivitaScenario × log2(20)` e si usa il valore massimo. Etichette: `nella giornata simulata`, `il giorno seguente`, `due giorni dopo`, `N giorni dopo`, più ora.
- Esplicitare che un caffè tardivo può alterare caratteristiche del sonno anche se l'utente dice di addormentarsi e dormire bene. Nessuna previsione individuale certa.
- Verificati con test matematici esempi di smaltimento il giorno successivo e due giorni dopo. **Una sessione di browser automatizzato ha riportato uno scarto apparente di 6 ore** perché non era stato confermato in maniera inequivocabile l'input del campo ora. Sul codice isolato, 80 mg alle 14:00 producono la soglia 95% alle **02:58 / 11:37 / 20:16 del giorno seguente** nei tre scenari; 80 mg alle 08:00 danno **20:58 dello stesso giorno / 05:37 / 14:16 del giorno seguente**. Ricontrollare in browser inserimento dell'ora con esatto valore visibile, senza cambiare arbitrariamente la formula.
- L'esportazione e stampa vanno ancora verificate su dispositivi reali.
- Il file `laboratorio-del-sonno/strumenti/ROADMAP.md` contiene dettagli e test.

### Quinto strumento da sviluppare solo DOPO revisione della formazione

**Wearable Decoder** è segnato in roadmap ma NON è stato implementato. L'utente ha detto di avere seguito **corsi specifici** utili a questo progetto. Prima recuperare e studiare le dispense/contenuti autentici e poi definire analisi di HRV, PPG, orari, trend e differenze tra wearable con limiti scientifici e privacy. Non inventare i nomi dei corsi; non iniziare il codice finché non è stato ricostruito il materiale didattico. Dettagli in `laboratorio-del-sonno/strumenti/ROADMAP.md`.

## 5. Situazione test e problemi di rilascio

Documento autorevole: `AUDIT_PREPUBBLICAZIONE_2026-10-25.md`.

**BLOCCANTI:**
1. Il modulo `#contact-form` di Assetto Biologico™ usa `script.js` per mostrare «Richiesta inviata» ma **non spedisce realmente i dati**. Questo problema è presente già nel ramo pubblico originale `main`. Non pubblicare una falsa conferma. Definire destinatario, servizio sicuro, minimizzazione dati, errori e privacy prima dell'attivazione.
2. Mancano un'informativa privacy generale completa, una revisione GDPR e la corretta configurazione/consenso analytics (GA4 nella landing viene avviato automaticamente dopo 3 secondi).
3. Ancora mancanti QA effettivo Safari iPhone e verifica dispositivi mobili, accessibilità, SEO, sitemap, link e test finali CSV/PDF.
4. I contenuti educativi / sanitari richiedono revisione scientifica e rispetto del perimetro professionale del farmacista.

**Correzioni già applicate:** i due `srcset` sbagliati della foto WebP della landing Assetto Biologico™ sono stati corretti nel ramo di sviluppo senza cambiare copy.

## 6. Come riprendere da una nuova chat

1. Aprire repository GitHub `Robyboscia/sito-personale` e leggere questo file + i tre documenti di progetto.
2. Continuare solo sul ramo `sviluppo-nuovo-portale`. I nomi/path dei file sono definiti sopra.
3. Ogni cambiamento: modificare, fare commit, controllare il nuovo SHA e fornire anteprima con URL:
   `https://raw.githack.com/Robyboscia/sito-personale/<COMMIT_SHA_COMPLETO>/<PERCORSO_RELATIVO>`
4. Preservare `main` e il ramo `backup-sito-originale-2026-10-24`.
5. Dopo questo checkpoint è stato richiesto di avere anche un **ramo di backup del portale in sviluppo**. Cercare il ramo `backup-portale-sviluppo-2026-10-25`; se esiste, non sovrascriverlo inavvertitamente.
6. Chiedere all'utente di scegliere la prossima funzionalità da revisionare **solo se non emerge già una richiesta concreta**. In caso contrario, procedere direttamente.

**Ultimo intervento dell'utente prima di questo checkpoint:** «comincia a salvare tutte ste modifiche, non vorrei che finisse la chat per spazio». Il codice è già nei commit GitHub: l'obiettivo di questo documento e del backup è garantire che si possa riprendere senza dipendere dalla cronologia della chat.

## 7. Aggiornamento dopo il checkpoint — 26 ottobre 2026

L'utente ha scritto «Andiamo avanti» e il lavoro è ripreso dalla verifica dei quattro strumenti già realizzati.

- Codici di Check-up, Caffeina, Diario PRO e Turni: modificati per nascondere i **risultati precedenti** quando cambiano gli input, evitando calcoli non aggiornati.
- Diario PRO: **sei test d'importazione superati**; il vecchio report viene rimosso se si tenta di importare altri dati.
- Turni: finestre di riposo con specificazione chiara del giorno relativo, messaggi **«NON DISPONIBILE»** per finestre incompatibili con altri turni, evidenziazione dei campi di orario errati; **quattro casi testati con esito positivo**.
- Caffeina: aggiunto un **esempio rapido interattivo** (80 mg alle ore 14:00, coricamento alle ore 23:00) con ricalcolo tramite pulsante, per rendere la verifica più semplice anche quando il selettore nativo di orario è difficile da automatizzare.
- La verifica tramite browser automatizzato **non è riuscita a modificare `input[type=time]`**, quindi NON si può affermare che l'intero flusso caffeina e turni sia stato ricontrollato end-to-end. Servono prove manuali reali su Safari iPhone.
- Ulteriori dettagli, limiti e test in `laboratorio-del-sonno/strumenti/ROADMAP.md`.
- **Resta vietata qualsiasi modifica a `main` senza esplicita approvazione.** L'attuale sito pubblico è separato dal ramo di sviluppo.

## 8. Cruscotto visivo Diario PRO — 26 ottobre 2026
L'utente ha approvato un risultato grafico d'impatto. Implementato e salvato nel ramo sviluppo-nuovo-portale.
- File HTML: laboratorio-del-sonno/strumenti/diario-pro/index.html — report full width e pulsante per esempio con 14 notti inventate.
- File JS: laboratorio-del-sonno/strumenti/diario-pro.js — modello descrittivo, tre schede (regolarità/durata/dati risvegli), freccia di andamento fra settimane, gestione notti incomplete, etichetta demo nel TXT.
- File CSS: laboratorio-del-sonno/strumenti/strumenti.css — cruscotto dark teal, card avorio, 14 pallini, due barre, responsive e stampa.
- Nessun punteggio clinico: soglie di regolarità solo editoriali, nessuna valutazione di salute; ore stimate con asterisco quando le informazioni sui risvegli sono mancanti.
- Test matematici 7/7 superati; test browser interattivo riuscito per demo, rimozione e riapertura. Mancano QA reale iPhone, esportazione e stampa end-to-end.
- Main/pubblico invariato. Riferimenti dettagliati nel file laboratorio-del-sonno/strumenti/ROADMAP.md.

## 9. Check-up del Sonno: risultato positivo + ciambella — 26 ottobre 2026
**Aggiornamento UX richiesto dopo screenshot iPhone:** il precedente report etichettava risultati favorevoli come «Poco segnalato» e mostrava barre quasi vuote; l'utente le leggeva erroneamente come fallimenti.
- Modificato `laboratorio-del-sonno/strumenti/check-up.js`: barre invertite e positive, quattro fasce editoriali (0-1 favorevole; 2-3 qualche aspetto; 4-5 più elementi; 6 da attenzionare), spiegazioni per area, sintesi dinamica e ciambella di quattro spicchi UGUALI.
- Modificato `laboratorio-del-sonno/strumenti/check-up/index.html`: report full width sotto il questionario, pulsante dimostrativo con risposte inventate senza modificare quelle selezionate.
- Modificato `laboratorio-del-sonno/strumenti/strumenti.css`: layout responsivo, colori non unici veicoli informativi, legenda testuale e stampa.
- Non generare un punteggio medico complessivo o percentuali di salute: donut con quarti uguali perché le quattro aree non costituiscono porzioni di una grandezza unica. Tutte le fasce sono scelte editoriali non validate clinicamente.
- Test del codice/risultati per risposte favorevoli, critiche, miste: eseguiti. Resta collaudo manuale iPhone e stampa.
- I riferimenti e la regola del quinto progetto Wearable Decoder restano invariati. Sito pubblico `main` intatto.

## 10. Test browser Check-up positivo — 26 ottobre 2026

Il report reale è stato aperto nel browser di anteprima con il pulsante dimostrativo (risposte inventate). Confermati: etichetta DEMO; Regolarità favorevole con barra piena; 3 aree favorevoli / 1 area da osservare; ciambella con quattro quarti uguali, testo di sintesi non clinico e legenda completa. Test sul desktop; manca controllo effettivo Safari iPhone. Risultati dettagliati in `laboratorio-del-sonno/strumenti/ROADMAP.md`.

Tutte le modifiche risiedono nel ramo `sviluppo-nuovo-portale`, non nel sito pubblico `main`.

## 11. Turni & Sonno: settimana visiva e demo — 26 ottobre 2026
L'utente ha chiesto «andiamo avanti» dopo il Check-up, e il lavoro è proseguito sull'ultimo strumento già creato: **Turni & Sonno**.
- Modificato `laboratorio-del-sonno/strumenti/turnisti/index.html`: risultato a tutta larghezza sotto il modulo, demo settimanale inventata e pulsante Chiudi il report; metadata title corretto.
- Modificato `laboratorio-del-sonno/strumenti/turnisti.js`: timeline 24 ore/7 giorni (8 se l'ultima notte prosegue), conteggi, separazione delle ore oltre mezzanotte, condizioni per pause ravvicinate, sovrapposizioni e finestre fuori dalla settimana. Demo con 5 turni/40 ore e una pausa di 8 ore. CSV e stampa conservati.
- Modificato `laboratorio-del-sonno/strumenti/strumenti.css`: design responsive, input riorganizzati in card sotto i 560 px, timeline e report stampabile.
- Test unitari 7/7 superati, test interattivo browser conferma 5 turni, 2 giorni di riposo segnati, 40 ore, 1 pausa sotto 11 ore, notte divisa tra Giorno 5 e 6, messaggio «finisce turno precedente», download CSV e chiusura report senza perdere input.
- Test browser **desktop** soltanto: ancora necessario verificare Safari iPhone reale e l'effettiva qualità del PDF/CSV esportato. Regole scientifiche/legali sempre indicative, non diagnosi o verifica di CCNL.
- Tutto salvato sul ramo `sviluppo-nuovo-portale`. Non modificato `main`. Il progetto Wearable Decoder rimane rinviato alla revisione dei materiali formativi.
- Dettagli in `laboratorio-del-sonno/strumenti/ROADMAP.md`.

## 12. Sicurezza del modulo contatti e analytics — 26 ottobre 2026

Dopo il collaudo del pianificatore Turni & Sonno, l'utente ha scritto «Continua». È stato affrontato uno dei due blocchi P0 originali nel ramo `sviluppo-nuovo-portale`, **senza modificare il sito pubblico**.

### Modulo Assetto Biologico™: nessuna falsa conferma
- `script.js` **non** contiene più il listener che simulava l'avvenuto invio e resettava il modulo dopo 4 secondi.
- Nuovo file `contact-mailto.js`: JS indipendente dalle animazioni GSAP e senza chiamate di rete. Alla conferma valida prepara un URL `mailto:` destinato a `info@robertoboscia.it`, con oggetto fisso e corpo che include i dati inseriti. **Non invia messaggi** e non mostra mai «Richiesta inviata». Nessun reset; visibile un link email di riserva.
- `assetto-biologico/index.html`: testo del modulo reso accurato («Prepara la richiesta via email», «Premi Invia nella tua app di posta»). Campo domanda generale facoltativo limitato e avviso a **non inserire referti o informazioni mediche riservate**. Il pulsante mobile fittizio `tel:+39XXXXXXXXXX` è stato sostituito da un link email reale, e la CTA non promette più una prenotazione immediata.
- `contatti/index.html`: descrive esplicitamente la preparazione della bozza email, senza duplicare il modulo.
- Test unitari dell'invio `mailto:`: form valido genera destinatario, oggetto, corpo e messaggio corretto; form invalido non apre mailto; caratteri speciali codificati correttamente. **Da collaudare su iPhone con app posta configurata.**

### Analytics/Privacy
- **Rimosso nel solo ramo di sviluppo** lo script della landing che caricava GA4 `G-NKGHWHXYHZ` automaticamente dopo 3 secondi o interazione. Non attivare altri tracciatori senza validazione privacy e consenso, se necessario.
- Scansione testuale delle principali pagine HTML/JS del sito di sviluppo: nessun altro `gtag`, GA4, `fbq`, Hotjar o analoghi rilevati; **rimane necessario verificare le richieste di rete, gli eventuali cookie, le risorse CDN e l'hosting effettivo**.
- Informativa privacy generale **ANCORA ASSENTE**; la nota del Diario non la sostituisce. Non presentare il portale come GDPR-compliant finché dati reali su titolare, basi giuridiche, conservazione, processori e diritti non vengono definiti e validati.

### Blocco ancora aperto
Un `mailto:` è solo un ripiego onesto su sito statico: **non è un backend di contatto, non conferma la consegna e non garantisce che ogni visitatore abbia un'app email configurata**. Prima di sostituirlo con un modulo automatico bisogna scegliere il servizio/endpoint e credenziali con l'utente; quindi implementare antispam, privacy, gestione errori e verifiche reali. Non inventare un provider o un URL.

Aggiornato il documento `AUDIT_PREPUBBLICAZIONE_2026-10-25.md` con fatti, correzioni e blocchi residui. **La regola permanente: non modificare `main`.**


## 13. Privacy e cookie — bozze site-wide 26 ottobre 2026

L'utente ha selezionato il punto «1» (privacy e cookie), dopo il riepilogo delle attività ancora mancanti.

**Implementazione completata nel SOLO ramo `sviluppo-nuovo-portale`:**
- Creata `privacy/index.html`: pagina GDPR generale preparatoria e **visibilmente marcata bozza**, `noindex,follow`. Spiega privacy di accesso al sito, log web/hosting da verificare, modulo `mailto:` manuale, strumenti nel browser, dati del Diario, import PRO, diritti, email di contatto `info@robertoboscia.it`, CDN GSAP e copertina esterna.
- Creata `cookie/index.html`: pagina preparatoria sulle tecnologie locali, nessun elenco cookie inventato; `localStorage` del Diario facoltativo, analytics GA4 disattivato nel ramo di sviluppo, banner non inserito in assenza di tracciatori non tecnici verificati. Browser/network audit ancora mancante.
- Link Privacy e Cookie aggiunti **nei footer di tutte le 19 pagine HTML preesistenti**, inclusa `anteprima.html`. Le due nuove pagine si collegano tra loro e alla homepage. Link contestuali anche presso form Assetto, toggle Diario e import Diario PRO.
- Aggiunto `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`: checklist dettagliata delle informazioni mancanti su titolare, recapito, hosting, log, DPA, casella email, retention, trasferimenti extra-SEE, provider terzi, analytics e cookie.
- Aggiornato `AUDIT_PREPUBBLICAZIONE_2026-10-25.md`: stato **P0 parzialmente mitigato**, ma non ancora conforme/pubblicabile.

**Principi da preservare:**
1. Non scrivere che il sito è GDPR compliant finché le bozze non sono validate. Art. 13 GDPR chiede identità titolare, finalità/basi, destinatari, durata e altro; non indovinare soggetto giuridico, fornitori o tempi.
2. Non suggerire che «nessun dato viene trattato»: il Diario e gli altri tool calcolano dati nel browser, ma la visita al sito comporta almeno richieste di risorse/server, da verificare lato provider.
3. Nessun banner cookie fittizio, e non riattivare GA4 senza verifica giuridica e tecnica; se emergeranno tracciatori non tecnici che richiedono consenso, bloccarli fino al consenso o rimuoverli.
4. `main`, `CNAME`, deploy, DNS e GitHub Pages **NON TOCCATI**.
5. Prima di lanciare il portale: ottenere dal titolare i dati elencati nella checklist, fare test reali di rete/cookie (anche iPhone), completare l'informativa e verificare basi giuridiche e possibile trattamento dei dati relativi alla salute.

**Riferimenti normativi ufficiali:** `https://www.garanteprivacy.it/faq/Cookie` e `https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679`.

## 14. QA statico privacy, cookie e navigazione — 26 ottobre 2026

- Esaminati 21 file HTML in tre blocchi per rispettare i limiti degli strumenti connessi. In tutte le pagine, ogni link interno `href` e `src` verificato corrisponde a un elemento dell'albero Git; non rilevati ID duplicati o assenza dei tag base di chiusura `html` / `footer`.
- Le 19 pagine HTML già esistenti hanno i due link Privacy/Cookie in fondo; le nuove pagine sono intercollegate, marcate `noindex,follow` e visibilmente indicate come **bozze**.
- Inseriti anche link contestuali presso il form Assetto Biologico™, il toggle di salvataggio Diario e l'importazione CSV Diario PRO.
- Checklist operativa in `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`. Stato riportato in `AUDIT_PREPUBBLICAZIONE_2026-10-25.md`.
- Non è stato ancora eseguito un audit dinamico con strumenti di rete/cookie né un test Safari iPhone reale. **Non trasformare le bozze in un'informativa definitiva senza i dati del titolare e dell'hosting**.
- Non modificare né distribuire `main` senza autorizzazione.

## 15. QA browser desktop Privacy e Cookie — 26 ottobre 2026
- Verificata in browser desktop l'anteprima delle nuove pagine `privacy/index.html` e `cookie/index.html` nel solo ramo di sviluppo.
- Privacy: apertura riuscita, 8 sezioni raggiungibili dalla navigazione interna, avviso «bozza non definitiva» ben visibile, contenuto sul salvataggio locale del Diario e `mailto:`, fornitore hosting e retention esplicitamente da verificare.
- Cookie: apertura attraverso il collegamento dalla pagina Privacy, nessun falso banner di consenso, GA4 disattivato soltanto nel ramo di sviluppo, differenza cookie e localStorage illustrata.
- Nessun problema evidente di impaginazione desktop o link rotti osservato; controllo statico dei 21 file HTML già registrato.
- **Non si tratta di verifica dei cookie sull'effettivo dominio**: il servizio di anteprima GitHub di terzi può inserire risorse proprie, che non rappresentano il provider finale. Devono ancora essere verificati hosting, rete, log, cookie, Safari/iPhone e il testo legale.
- Checklist operativa in `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`; l'audit aggiornato in `AUDIT_PREPUBBLICAZIONE_2026-10-25.md`.
- **Non modificare il ramo pubblico `main`, CNAME o DNS senza esplicita autorizzazione.**

## 14. Audit SEO e funzionale completo in sviluppo — 26 ottobre 2026

L'utente ha chiesto «completa audit SEO e funzionale». Inventario attuale: 21 HTML di portale (esclusa verifica Google), 8 JS, 9 CSS. Interventi salvati in `sviluppo-nuovo-portale`, sito pubblico `main` INVARIATO.
- Creato **`AUDIT_SEO_FUNZIONALE_2026-10-26.md`**: documento autorevole per elenco di correzioni e test.
- Nuovo `sitemap.xml`: 12 pagine indicizzabili coincidenti con canonical; nove pagine con noindex fuori; no `lastmod` non verificabili.
- Metadati OG/social completi nelle 12 pagine, URL canonici e OG URL corrispondenti. Added `WebSite/Person/WebPage` sulla homepage; `BreadcrumbList` su 3 articoli Accademia. La landing è stata ripulita dai doppi schema aggressivi nel passaggio precedente.
- `script.js` ora tollera mancanza di GSAP/ScrollTrigger senza eccezioni e aggiorna correttamente `aria-expanded` del menu al click.
- Test: 8/8 JS validi; 6/6 Caffeina, 7/7 parser Diario PRO, 8/8 modello Diario digitale, più Check-up e Turni testati prima; check statico di link/ID/immagini, smoke navigation desktop.
- **Attenzione:** il report del browser automatizzato comprendeva affermazioni sbagliate circa slider nel Check-up e banner cookie inesistente: non considerarle prove. Il codice reale usa tre radio per domanda nel Check-up e non contiene un banner cookie finché non sia giustificato.
- I link esterni (copertina da dormirefacile.com, mentalpro.it) richiedono verifica in una vera connessione prima del rilascio. Mancano test iPhone/Safari, Lighthouse/Web Vitals, Search Console/redirect HTTPS sul dominio e review legale della privacy.
- NON fare merge su `main` né submit sitemap dal sito live senza autorizzazione. Le modifiche al vecchio sito pubblico non devono essere pubblicate implicitamente.


## 16. Continuazione audit SEO: metadati e immagini (26 ottobre 2026)
- Ripreso il lavoro leggendo il repository e la versione attuale del ramo di sviluppo, **senza modificare main**, DNS o sito pubblico.
- Confermata sitemap con 12 URL indicizzabili, robots con direttiva Sitemap e 9 pagine protette da noindex. I 12 documenti indicizzabili sono stati ricontrollati: title, description, canonical, og:url e og:image presenti, canonical = og:url.
- Individuate tre immagini locali della landing Assetto Biologico senza dimensioni HTML; letto il contenuto binario originale dal repository per verificare le misure reali. Corrette le immagini: `foto-roberto-boscia-casual.jpg` 1023×1537, `foto-roberto-boscia.jpg` 1024×1535 (2 usi). Modifica nella landing, commit `de2615f19aaf872ad149f035ccb2a15a844cbece`.
- Le quattro occorrenze di `https://www.dormirefacile.com/images/book_cover.webp` restano senza misure, perché non ancora verificabili. Non attribuire loro una dimensione a intuito.
- Aggiornato `AUDIT_SEO_FUNZIONALE_2026-10-26.md` con queste verifiche.
- **Residui:** test Safari iPhone, test reali su host dopo pubblicazione autorizzata, privacy e cookie definitivi, disponibilità risorse remote e PageSpeed. La versione live non è stata modificata.

## 17. Privacy e cookie: secondo passaggio — 26 ottobre 2026

- Su richiesta «vai» per «Privacy e cookie definitivi» è stato ripreso il codice esistente. **Solo sviluppo**, non `main`.
- Privacy migliorata secondo il quadro informativo art. 13 GDPR: 10 sezioni, verifica giuridica di titolare e sede, destinatari, trattamenti extra-SEE, necessità/facoltatività dei campi, decisioni automatizzate. Cookie migliorata con tabella dei dati localStorage del Diario e regole consenso/Eprivacy.
- Pagina pubblica corrente: homepage ancora versione precedente; il codice `main/index.html` contiene GA4 attivabile automaticamente, e le URL pubbliche `/privacy/` e `/cookie/` sono state rilevate 404. Non attribuire questo comportamento automaticamente a un consenso valido né dichiarare violazioni senza network audit.
- QA HTML: privacy 10 sezioni con ancore esistenti; entrambe noindex/bozza. **Restano mancanti** identità e sede del titolare, provider email, log/retention, adeguatezza fornitori e trasferimenti, test cookie/hosting live, revisione professionale e autorizzazione per pubblicare.
- Documenti aggiornati: `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md`, `AUDIT_SEO_FUNZIONALE_2026-10-26.md`.


## 18. Hotfix autorizzato sul sito PUBBLICO main — 26 ottobre 2026
- L'utente ha scritto «Autorizzo» in risposta alla richiesta esplicita di consentire interventi sul ramo pubblico `main` per correggere Privacy/Cookie. Si tratta di autorizzazione all'hotfix mirato, **NON** di autorizzazione a pubblicare il nuovo portale.
- Creato backup della versione precedente su `backup-main-prima-privacy-2026-10-26` (commit precedente `3b2d283eee2689eea3cfcee9d0d7683ae94af67f`).
- Applicato su `main` **un solo commit atomico** `98e046e9c6a20c190d6cc1d8a9863c2e19d696c7`: rimossa l'attivazione automatica GA4 dalla vecchia landing; rimosso listener del form che mostrava falsa conferma di invio; aggiunto `contact-mailto.js` autonomo e descrizioni esplicite del solo invio manuale; sostituito CTA telefono fittizio; create `privacy/index.html` e `cookie/index.html` **specifiche per la vecchia landing pubblica**, non copie delle informative del nuovo portale; aggiunti link contestuali e nel footer.
- Le nuove pagine pubbliche descrivono onestamente quanto accertabile ma segnalano informazioni ancora in verifica: qualificazione e recapito giuridico del titolare, effettivi fornitori web/email, log e retention, trasferimenti. Sono `noindex,follow` e non vengono descritte come informative GDPR validate. Nessun CMP/banner inventato poiché GA4 è stato disattivato. Rimane verifica cookie/network effettiva.
- **Deploy confermato:** GitHub Pages run `40344049142` concluso con `success` per il nuovo commit; fetch esterno senza query inizialmente rilevava cache precedente 404, ma ripetizione con query univoca ha recuperato entrambe le pagine aggiornate e la homepage; esame HTML pubblico del form ha verificato link Privacy/Cookie, testo «Prepara la richiesta via email» e assenza del testo «Richiesta inviata».
- L'intero ramo `sviluppo-nuovo-portale` resta separato e non è stato trasferito sul sito pubblico. Non assumere che il nuovo portale sia live. Prima del futuro lancio restano controlli dettagliati della sua privacy, il QA mobile e l'autorizzazione specifica al merge/deploy.


## 19. Correzione recapiti del titolare per il sito pubblico — 26 ottobre 2026
- Dati dichiarati dall'utente: titolare **Roberto Boscia, persona fisica**; il precedente indirizzo fisico **Via Attilio Barbarulo 60 non è autorizzato come indirizzo del titolare**; se è necessario un indirizzo postale, usare **Via Siciliano 45** (comune Nocera Inferiore e CAP 84014 ricavati dal contesto e da fonti pubbliche, **da confermare con utente**). L'indirizzo `info@robertoboscia.it` **non è considerato una casella operativa dall'utente**.
- L'utente aveva autorizzato il precedente hotfix su `main`. Ulteriore hotfix mirato salvato su `main`, commit `2653ad5b0c83a61b551cec25ca40f74101a14806`: homepage senza vecchio indirizzo, email inesistente o dati strutturati locali superati; markup semplificato Person/WebSite/WebPage; form contatti temporaneamente sospeso e CTA mobile senza mailto rotto. Privacy/Cookie vecchio sito: aggiornato titolare persona fisica; recapito postale indicato per l'esercizio dei diritti fino a quando esisterà email confermata; nessuna mailto funzionante dichiarata.
- **La mail è il blocco operativo #1.** Non sostituire l'indirizzo con Gmail o numero di cellulare da altre conversazioni senza consenso espresso a pubblicarli. Occorre chiedere quale email reale usare oppure allestire una casella professionale e verificare test di ricezione. Non riattivare form/CTA in assenza di casella funzionante.
- Sul ramo `sviluppo-nuovo-portale` rimangono riferimenti a `info@robertoboscia.it` nel modulo Assetto e in alcune pagine: **rimuovere/sostituire prima della pubblicazione del nuovo portale**. Non fare merge automatico. La privacy del nuovo portale necessita di aggiornamento sui dati confermati e delle altre verifiche già elencate.
