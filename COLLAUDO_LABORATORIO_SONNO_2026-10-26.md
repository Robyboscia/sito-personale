# Collaudo funzionale e privacy del Laboratorio del Sonno — 26 ottobre 2026

**Ambito:** ramo `sviluppo-nuovo-portale` del repository `Robyboscia/sito-personale`. **Non è un test del sito pubblico** e non costituisce collaudo mobile, prestazionale o legale. I controlli qui descritti sono stati eseguiti con dati inventati e con un DOM minimale simulato, eseguendo gli effettivi script JavaScript prelevati da GitHub; alcune funzioni pure del diario sono state invocate direttamente a partire dal codice sorgente. Nessuna persona reale ha fornito dati per questi test.

## Correzioni applicate

**Diario PRO — `laboratorio-del-sonno/strumenti/diario-pro.js`**
- Il pulsante "Esempio" aveva 14 righe fittizie con `tib:520` fisso, indipendentemente dall'ora a letto e del risveglio (esempio notte 1: 23:50–07:05 = 435 min, non 520). Questo produceva efficienze apparentemente più basse, non coerenti con il sonno indicato.
- Ora il tempo a letto dimostrativo viene **calcolato dagli orari visualizzati**. La quantità di sonno rimane inventata a fini didattici, ma non supera il tempo disponibile meno la latenza. Per le due notti di esempio con risvegli non quantificati è coerentemente sottratta solo la latenza; permane l'avviso di stima parziale.
- L'area settimanale non espone più un **delta numerico** quando non sono presenti almeno **tre notti per ciascuna settimana**. Il dettaglio del report adotta la stessa condizione. L'etichetta iniziale è ora "Fino a 14 notti" anche per importazioni incomplete.
- Commit: `204e4ad0501266b2a3924e2a67d955233be3eeec`.

## Test eseguiti con esito favorevole

| ID | Funzione | Fixture sintetica e risultato |
| --- | --- | --- |
| JS-01 | Sintassi JavaScript | Verificata tramite compilazione `new Function(source)` di 8 file JS: `check-up.js`, `diario-pro.js`, `diario.js`, `caffeina.js`, `turnisti.js`, `strumenti.js`, `contact-mailto.js`, `script.js`. Nessun errore di sintassi; ciò **non** equivale a prova completa su tutti i browser. |
| CK-01 | Check-up, demo | 12 domande con 3 opzioni ciascuna (36 radio). L'esempio segnala dati inventati, disegna quattro aree e aggiunge la spiegazione che gli spicchi della torta sono uguali e non percentuali di salute. |
| CK-02 | Check-up, risposte reali | 12 risposte "Mai o quasi": riepilogo favorevole ed esplicita assenza di diagnosi; l'avviso dimostrativo scompare. |
| PR-01 | Diario PRO, demo | 14 notti inventate, visualizzazione e generazione del report TXT funzionanti nel DOM simulato; i dati dimostrativi dopo correzione generano circa **91%** di efficienza stimata media, anziché derivare da un unico tempo a letto errato. Presente avviso "dati inventati". |
| PR-02 | Diario PRO, CSV non sufficiente per tendenza | CSV con due notti valide (giorno 1 e giorno 8): importazione accettata, etichetta "Non confrontabile", delta di andamento nascosto, richiesta di almeno 3 notti per settimana. |
| PR-03 | Diario PRO, note riservate | CSV di test con note `UNIQUE_PRIVATE_NOTE_123` e `_456`: non inserite nel riepilogo visivo e non contenute nel file TXT scaricabile. |
| CF-01 | Caffeina, tre scenari | Eseguiti scenari di riduzione del 50% ogni 3, 5 e 7 ore, con spiegazione del modello non diagnostico. |
| CF-02 | Caffeina, oltre mezzanotte | Bevande 22:00 e 23:30; ora di coricamento 00:30: stime fino a **due giorni dopo** e nessun taglio del calcolo a mezzanotte. Nessun invio di dati a un server da parte della funzione. |
| TU-01 | Turnisti, notturno e mattina | Giorno 1 22:00–06:00 e giorno 2 06:00–14:00: pausa 0 h, avviso di intervallo sotto 11 ore, finestra di sonno segnalata come sovrapposta e non disponibile. |
| TU-02 | Turnisti, export | CSV con intestazione e sette righe giornaliere generato dal modello. |
| DI-01 | Diario 14 giorni, calcolo | Orari 23:00 a letto, 23:15 tentativo, 07:00 risveglio, 07:15 alzata; latenza 20 min, risvegli 30 min: 495 min a letto, 415 min sonno stimato, circa 83,8% efficienza. |
| DI-02 | Diario, risvegli non indicati | Campo risvegli vuoto: durata stimata 445 min, `partial=true`. Non vengono inventati 0 minuti di risveglio. |
| DI-03 | Diario, dati contraddittori | Zero risvegli dichiarati con 30 minuti di veglia: eccezione di validazione collegata ai campi pertinenti. |
| DI-04 | Diario, ora fuori intervallo | Risveglio finale `45:03` rifiutato. |
| DI-05 | Sicurezza CSV | Il contenuto sintetico `=FORMULA(1+1)` viene preceduto da apostrofo prima della serializzazione come CSV, per ridurre l'interpretazione come formula nei fogli elettronici. |

## Perimetro dei dati e privacy

- I moduli studiati elaborano i dati dei questionari sul client. Il diario tradizionale prevede una scelta esplicita per `localStorage`, chiave `roberto-boscia.sleep-diary.v1`, ed esportazione CSV; il Diario PRO può importare quel salvataggio **su richiesta dell'utente** oppure un file CSV. Il report TXT PRO non include le note personali.
- L'invio eventuale del **proprio diario a un destinatario scelto dall'utente** apre un'app esterna o la condivisione nativa: non è equivalente a trasmissione verso il titolare del sito. Il modulo commerciale di contatto Assetto è sospeso in attesa di email verificata.
- I test applicativi sono stati eseguiti in ambiente simulato, non sono una scansione browser delle richieste di rete/cookie.

## Cosa NON è stato verificato

1. Browser reale su iPhone/Safari, Android/Chrome e desktop (compresi focus, assistive technology, stampa e download effettivo dei file).
2. Persistenza effettiva fra sessioni e modalità privata dei singoli browser, permessi di archiviazione, `navigator.share` e app di posta.
3. Cookie, storage, header NEL, richieste HTTP verso GitHub Pages/Cloudflare e altri servizi nel contesto di navigazione reale.
4. Prestazioni, Core Web Vitals, test Lighthouse/axe, errori console e contrasto/accessibilità completa in device reali.
5. Revisione giuridica finale delle informative, ruoli e contratti fornitori, retention e trasferimenti extra SEE.
6. Attivazione e prova di ricezione del nuovo indirizzo email professionale.

**Regola di pubblicazione:** il portale in sviluppo resta separato da `main`. Questi risultati non autorizzano un deploy.
