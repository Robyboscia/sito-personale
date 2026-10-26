# Laboratorio del Sonno — strumenti digitali

Ultimo aggiornamento: 25 ottobre 2026. Sviluppo sul ramo `sviluppo-nuovo-portale`. Non pubblicare su `main` senza approvazione.

## Quattro strumenti implementati (prototipi da collaudare)

| Priorità | Strumento | File | Ingressi | Uscite | Commercializzazione |
| --- | --- | --- | --- | --- | --- |
| 1 | Check-up del Sonno | `check-up/index.html`, `check-up.js` | 12 domande originali | Mappa educativa per quattro aree, stampa in PDF dal browser | Gratuito |
| 2 | Calcolatore della Caffeina | `caffeina/index.html`, `caffeina.js` | Orario di coricamento, caffeina e orari | Tre scenari teorici: emivita 3, 5, 7 ore; stampa in PDF dal browser | Gratuito |
| 3 | Diario del Sonno PRO | `diario-pro/index.html`, `diario-pro.js` | CSV originario oppure schede del diario presenti nel browser (solo con pulsante) | 14 barre, metriche, variabilità, confronto blocchi 1–7 / 8–14, TXT e stampa/PDF | **Prototipo gratuito; nessun pagamento attivo** |
| 4 | Turni & Sonno | `turnisti/index.html`, `turnisti.js` | 7 giorni, 5 tipologie di turno, orari personalizzati, rientro | Calendario, intervalli fra turni, finestre ipotetiche, CSV, stampa/PDF | **Prototipo gratuito; nessun pagamento attivo** |

Il quarto strumento non produce un programma terapeutico per il lavoro notturno. Eventuali intervalli inferiori a 11 ore sono marcatori descrittivi, non conclusioni legali/CCNL né consigli medici personalizzati.

I moduli lavorano localmente nel browser, non richiedono account e non inviano dati ai server del portale. I risultati non sono diagnosi né test clinici validati. Rivedere scientificamente domande, assunzioni dei modelli e testi prima della pubblicazione.

## Quinto progetto: Wearable Decoder — da sviluppare *dopo aver rivisto la formazione*

**Richiesta esplicita del proprietario:** tenere in roadmap Wearable Decoder, ma **non svilupparlo adesso**. Prima va ricostruito e studiato il materiale dei **corsi specifici già seguiti**. I nomi dei corsi e i relativi file non sono stati ancora verificati nel repository, quindi non attribuire titoli o docenti.

Possibili argomenti da esaminare dopo aver recuperato le fonti effettive:
- Oura Ring, Apple Health/Apple Watch, Whoop, formati di esportazione supportati;
- HRV, frequenza cardiaca a riposo, variabilità, orari e regolarità del sonno;
- PPG, limiti dei metodi e distinzione fra segnale misurato, algoritmo ed elaborazione derivata;
- confronti longitudinali, valori mancanti, valutazione di qualità dei dati e fattori confondenti;
- documentazione scientifica, sicurezza dei dati e valutazione GDPR, MDR e confini della professione.

Sono emersi da precedenti lavori dell'utente termini e materiali tecnici come **PPG Stress Flow/BioTekna** e strumenti HRV; questi non vanno confusi con l'identificazione dei corsi specifici. Nessun algoritmo di punteggio o diagnosi va dedotto automaticamente da questi materiali.

**Passaggio obbligato prima del codice:** inventario dei corsi e delle dispense realmente disponibili, tabella metriche/metodi/limiti supportati da ciascuna fonte, specifiche dei dati esportati, principi di privacy e protocollo di validazione.

## QA e prerequisiti prima della distribuzione

1. Eseguire test end-to-end nel browser per tutte le quattro app, compresi casi limite e campi invalidi.
2. Testare manualmente Safari iPhone e un browser desktop, con verifica dell'esportazione CSV e della stampa PDF.
3. Testare importazione del CSV ufficiale, sia con WASO indicato sia vuoto. Conservare la dicitura «stima parziale» e spiegare che le medie possono sovrastimare la durata.
4. Revisione professionale e scientifica delle assunzioni e testi. Gli strumenti non sono dispositivi medici certificati.
5. Revisione GDPR del trattamento locale e dei file salvati/stampati sul dispositivo.
6. Non attivare checkout senza definire caratteristiche e termini del prodotto, prezzo, fatturazione e condizioni commerciali.
7. Il sito in `main` rimane invariato.

La sezione **Consulenze** resta separatamente marcata «Ancora da costruire».

## Test effettuati nel ramo di sviluppo (25 ottobre 2026)
- Verificata staticamente la presenza di tutti i collegamenti locali di Laboratorio, Progetti e quattro nuove pagine: **nessun file referenziato mancante**.
- JavaScript di tutte e quattro le app: **parsing sintattico riuscito**.
- Test browser del Check-up: 12 domande presenti, rilevazione delle risposte mancanti, creazione delle quattro aree. Un'interazione via automazione ha richiesto alcuni clic ripetuti sui radio, quindi controllare anche manualmente Safari iPhone.
- Test browser del Calcolatore Caffeina: campi ed elaborazione dei tre scenari presenti. Non usare come dato di riferimento numeri di esempio prodotti dal report di automazione: i default effettivi sono espresso 80 mg alle 08:00 e espresso 80 mg alle 14:00.
- Test browser Diario PRO: selettore CSV e bottone di lettura schede locali presenti; senza schede salvate appare un errore comprensibile.
- Test indipendenti della funzione di importazione CSV con due notti (una con risvegli omessi, una con durata orientativa), gestione di celle con `;` e virgolette, rifiuto di WASO mancante falsamente marcato completo e rifiuto di durata manipolata: **superati**.
- Test indipendenti del pianificatore Turni per notte 22–06 + turno immediatamente successivo, sette mattine consecutive e riposo dopo notte: **superati**.
- **Non ancora verificati end-to-end nel browser:** click e download CSV dei turni, generazione file TXT del Diario PRO, stampa/salvataggio PDF e test fisico su iPhone.
- I prototipi restano in stato **da revisionare**, con `noindex` e senza pagamento, fino a QA e verifica scientifica/privacy prima della pubblicazione.

## Revisione del Calcolatore della Caffeina (25 ottobre 2026)
- Su richiesta dell'utente sono state eliminate dall'interfaccia le diciture tecniche «emivita illustrativa» e l'ipotesi delle «24 ore precedenti» come data di assunzione.
- Ogni bevanda è collocata nella **giornata simulata** (reale o tipica, senza data obbligatoria). Se il coricamento è fra mezzanotte e le 05:59, lo collochiamo nel giorno successivo, insieme a eventuali bevande prese fra mezzanotte e quell'ora; si controllano orari che risultano successivi al coricamento.
- Il modello continua **oltre mezzanotte e nei giorni successivi, senza blocco a 24 ore**, e mostra per ogni scenario «nella giornata simulata», «il giorno seguente», «due giorni dopo» oppure «N giorni dopo» seguiti dall'ora.
- Viene mostrata l'ora orientativa in cui **ogni bevanda** del giorno è scesa sotto il 5% della sua dose iniziale. È una convenzione esplicita per «quasi completamente smaltita» e NON equivale a livello zero né garantisce sonno indisturbato. Formula per singola dose: ora di assunzione + ore necessarie per dimezzare la quantità × log2(20); per bevande multiple si usa l'ora più tarda.
- Gli scenari sono tradotti in linguaggio semplice come smaltimento più rapido (metà ogni 3 ore), intermedio (5 ore) e più lento (7 ore).
- Avviso scientifico: caffeina tardiva può influenzare il sonno anche quando l'utente sente di addormentarsi e riposare bene. Non attribuire soglie individuali di sicurezza né sostenere che un espresso singolo abbia gli stessi effetti delle dosi elevate degli studi. Fonti: https://pubmed.ncbi.nlm.nih.gov/24235903/ e https://pubmed.ncbi.nlm.nih.gov/39377163/.
- Test matematici eseguiti e superati per scenari che terminano **il giorno seguente** e **due giorni dopo**, con 80 mg alle 14:00, una bevanda alle 23:30 prima del sonno alle 01:00 e una bevanda alle 00:30 prima del sonno alle 01:00.
- La logica `giornata tipo` non identifica date vere: documentare sempre il criterio di collocazione degli orari, senza spacciarlo per un log cronologico verificato.

## Revisione e collaudo — 26 ottobre 2026

**Intervento eseguito senza modificare il sito pubblico (`main`).** Nel ramo `sviluppo-nuovo-portale` sono stati migliorati tutti e quattro gli strumenti:
- **Check-up del Sonno:** dopo aver modificato una risposta, il vecchio risultato scompare finché non viene generata nuovamente la mappa.
- **Calcolatore della Caffeina:** un cambio di orario, dose o bevanda invalida il vecchio report. Aggiunto il pulsante **«Prova un esempio (80 mg alle 14:00)»**: compila una sola bevanda alle 14:00, coricamento alle 23:00 ed esegue il calcolo in modo esplicito. È anche un test accessibile senza manipolare il selettore nativo del browser.
- **Diario PRO:** un tentativo di nuova importazione CSV/locale rimuove il vecchio report prima di mostrare il risultato o l'errore; questo evita report apparentemente riferiti al nuovo file ma in realtà appartenenti al precedente.
- **Turni & Sonno:** se cambi un turno vengono rimossi vecchi risultati e CSV precedenti; gli orari errati sono evidenziati. Le finestre notturne riportano «giorno precedente / giorno del turno / giorno seguente». Se l'ipotetica finestra di riposo si sovrappone a un altro turno registrato, viene dichiarata **NON DISPONIBILE**, anziché proposta come praticabile.

**Test di calcolo (isolati dal browser) eseguiti in questo aggiornamento:**
- Diario PRO: **6/6 superati** per importazione CSV, fasce facoltative, verifica dei calcoli, rifiuto giorni duplicati, salvataggio locale e compatibilità minuti esatti storici.
- Turnisti: **4/4 superati** per notte seguita da mattina, mattine consecutive, pomeriggio prima del turno mattutino e notte isolata; sia i conflitti sia i giorni relativi risultano riconosciuti.

**Limite onesto della verifica visiva:** il browser automatizzato ha mostrato la pagina caffeina, il pulsante di rimozione e il valore 80 mg, ma non è riuscito a manipolare in modo affidabile il selettore nativo `input[type=time]`. Di conseguenza **non ha verificato un calcolo completo sulla pagina** né il flusso Turnisti in quella sessione. Non è una prova di malfunzionamento Safari; restano da effettuare il collaudo reale su iPhone e i click/export completi. Il nuovo esempio precompilato rende possibile un controllo rapido del calcolo senza usare il selettore degli orari.

**Restano da completare:** test reali Safari iPhone per tutti e quattro gli strumenti, stampa e salvataggio PDF, scaricamento CSV/TXT, importazione da diario reale, revisione scientifica/legale e privacy. **Non pubblicare ancora.**

## Nota UX — perché tre scenari nel calcolatore della caffeina (26 ottobre 2026)
- Inserita una spiegazione permanente **prima del calcolo** e una sintesi **insieme ai risultati**: tre scenari perché il metabolismo della caffeina varia individualmente; offrire una sola ora di smaltimento sarebbe fuorviante.
- Dicitura accessibile: rapido, intermedio, lento; la quantità si dimezza rispettivamente ogni **3, 5, 7 ore**; non presentare questi valori come limiti fisiologici assoluti o previsione diagnostica.
- Fattori informativi: variabilità individuale/genetica, metabolismo epatico, alcuni farmaci, fumo, gravidanza; nessuna classificazione automatica del visitatore.
- Fonti citate nella pagina: CDC/NIOSH (in genere circa 5–6 ore) e revisione scientifica `https://pmc.ncbi.nlm.nih.gov/articles/PMC5445139/` (circa 3–7 ore negli adulti, con variabilità anche maggiore).
- Mantenere il calcolo senza arresto a mezzanotte e l'etichetta «quasi completamente smaltita» = meno del 5% della dose per il modello, non zero reale.

## Dashboard visivo Diario PRO — 26 ottobre 2026
**Richiesta approvata:** un risultato grafico comprensibile con tre grandi schede e un confronto fra settimane. Implementato solo sul ramo di sviluppo.
- **Regolarità:** massima oscillazione fra orari di coricamento e risveglio, scala descrittiva 0–180 minuti. Intervalli editoriali <=45, 46–90 e >90 min, NON clinicamente validati; con meno di quattro notti appare 'Poche notti registrate'.
- **Durata:** media stimata in ore e minuti, grafico 0–12 ore che NON rappresenta un obiettivo; asterisco e spiegazione quando mancano i dati sui risvegli.
- **Risvegli:** numero notti con durata dei risvegli dichiarata / notti registrate, più 14 pallini per notti complete, parziali o non compilate. NON misura la continuità fisiologica.
- **Trend:** due barre, prima e seconda settimana; freccia solo con almeno tre registrazioni per ciascuna settimana; descrive esclusivamente una variazione di durata stimata, non miglioramento/peggioramento.
- **Demo:** un click mostra 14 notti chiaramente inventate, etichettate come demo anche nel report TXT. Non vengono salvate né inviate.
- **Test:** 7/7 casi unitari superati. Il browser ha verificato il report full width, tre schede, 12/14 notti con risvegli riportati, due stime parziali, una media di circa 7 ore, incremento circa 47 minuti, rimozione e riapertura della demo.
- **Resta da verificare:** iPhone reale, stampa e download end-to-end, revisione scientifica e privacy prima del rilascio. Nessun checkout attivo; main invariato.
