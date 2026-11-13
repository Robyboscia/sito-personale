# Autovalutazione: questionari con risultati esclusivamente sul dispositivo

## Risultato implementato
- 15 questionari, **308 affermazioni** riprese dal PDF originale `/autovalutazione/la-mappa-del-tuo-benessere-ace.pdf`.
- Scelta tra Sì, No, Non rispondo. Possibile lasciare una domanda vuota.
- Riepilogo per sezione: numero Sì / totale, percentuale descrittiva, conteggio No, non rispondo e domande vuote. Elenco delle sole affermazioni per cui è stato selezionato Sì.
- Esportazione con funzione nativa **Stampa / Salva come PDF** del browser.
- L'appendice ACE è esclusa dal tool digitale perché particolarmente delicata e con conteggio differente rispetto alle 15 sezioni.
- Nessuna diagnosi, soglia di rischio, stima di carenze, gravità o raccomandazione clinica dedotta dai conteggi: il PDF originale afferma che non esistono soglie validate per questi questionari.

## Privacy by design
- Pagina HTML autonoma, con tutte le affermazioni incorporate nel codice: **nessuna richiesta API necessaria** per elaborare le risposte.
- Nessun pixel Meta, Google, TikTok, analytics, Brevo, widget di terzi, cookie o archivi persistenti del sito inseriti nella pagina.
- JavaScript lavora solo in memoria (`Map`), nessun `fetch`, `POST`, `sendBeacon`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `IndexedDB`.
- Nessun dato o risultato nella query string, nel nome del file o nell'URL.
- Le risposte sono scartate ricaricando la pagina oppure cliccando «Cancella tutte le risposte».
- Il PDF stampato è creato tramite `window.print()` sotto controllo dell'utente sul suo dispositivo. Se decide di salvarlo in iCloud/Google Drive, inviarlo via email o condividerlo, è una sua successiva scelta.
- Il sito può comunque trattare normali dati tecnici di accesso (es. IP nei log dell'hosting); questa soluzione riguarda **le risposte sanitarie**, non elimina automaticamente ogni trattamento tecnico del sito.
- Non utilizzare le risposte per segmentazione pubblicitaria; newsletter Brevo separata, soltanto email e consenso marketing esplicito e volontario.

## Controlli prima di annunciare il lancio
1. Da iPhone Safari e desktop, aprire `/autovalutazione/strumento-digitalizzato/`.
2. Compilare due o più aree; verificare radio e progress.
3. «VEDI IL RIEPILOGO»: confrontare conteggio Sì/No/vuote con il test.
4. «STAMPA / SALVA COME PDF»: verificare l'anteprima di stampa e un PDF salvato, nessun taglio di testi o elementi di navigazione nel report.
5. «TORNA ALLE DOMANDE»: i valori selezionati restano nella memoria fino al reload.
6. «Cancella tutte le risposte»: il reset elimina tutti i valori.
7. DevTools Network: dopo il caricamento della pagina nessun invio di risposte; non usare analytics, pixel o script di terze parti in questa pagina.
8. Confrontare a campione le 15 sezioni con il PDF originale. Alcune domande riportate nel materiale originario potrebbero contenere formulazioni clinicamente discutibili: eventualmente revisionarle editorialmente **senza introdurre interpretazioni cliniche**.

## Cosa NON fa
- Non spedisce i risultati via email: l'invio imporrebbe di trasmettere i contenuti sanitari a un sistema di consegna, con complicazioni privacy e possibili copie in caselle postali.
- Non salva le risposte nel CRM, nel sito o nel browser dopo il reload.
- Non richiede email per ottenere il riepilogo; una newsletter futura resta separata e facoltativa.
