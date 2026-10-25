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
