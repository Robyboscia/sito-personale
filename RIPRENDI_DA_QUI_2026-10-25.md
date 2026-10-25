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
