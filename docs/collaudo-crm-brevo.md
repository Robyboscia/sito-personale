# Newsletter e messaggi di servizio

Bozza per revisione. L’informativa nel branch descrive il flusso previsto. Prima del rilascio, completare le informazioni su conservazione (inclusa la prova della revoca) e trasferimenti sulla base della configurazione effettiva e degli accordi applicabili con Brevo. Confermare che gli attributi descritti nell’informativa vengano compilati al momento della conferma.

## Prova del consenso

Verificare sulla scheda del contatto di prova che il modulo registri la conferma nativa. Prima dell’email di benvenuto richiedere opt-in esplicito, conferma del modulo e stato email iscritto. Popolare la fonte con «Modulo newsletter», la data con la data effettiva della conferma e la versione con quella mostrata all’iscrizione. Conservare il testo di consenso corrispondente alla versione. Un inserimento manuale nella lista 6 deve lasciare il contatto fuori dal flusso. Verificare che la revoca interrompa anche gli invii in coda.

## Messaggi di servizio

Usare il mittente Dr. Roberto Boscia <info@drrobertoboscia.com>. Inviare ciascun messaggio solo su richiesta esplicita. Il Laboratorio e l’Autovalutazione restano accessibili direttamente, senza acquisire indirizzi per l’uso degli strumenti.

**La guida gratuita che hai richiesto**

Puoi leggere e stampare la guida [7 giorni per preparare il sonno](https://drrobertoboscia.com/risorse/guida-sette-giorni-sonno/).
Buona lettura, Dr. Roberto Boscia

**Ho ricevuto la tua richiesta di informazioni**

Grazie per avermi scritto. Ti risponderò a questo indirizzo. Per tutelare la tua riservatezza, evita di inviare referti, diagnosi o risultati dei questionari via email.
Dr. Roberto Boscia, farmacista del sonno

Usare l’ultima conferma per richieste generiche su Mental Pro o BioSignal Sleep solo quando esiste un canale effettivamente collegato e verificato. Evitare liste, tag e oggetti email che associno il contatto a sintomi, punteggi o esiti.

## Collaudo con casella di prova

1. Iscriversi tramite il modulo e verificare che prima del clic nessun contatto entri nella lista 6.
2. Aprire la conferma in Zoho Mail, controllare mittente, recapito e autenticazione del messaggio, quindi confermare.
3. Verificare lista e attributi in Brevo. Controllare che il benvenuto arrivi una volta sola.
4. Usare il link di disiscrizione. Verificare in Brevo lo stato di revoca e l’esclusione dal flusso marketing.
5. Compilare esempi sintetici nel questionario e verificare che la compilazione e il riepilogo non generino richieste di rete né salvataggi persistenti. Ripetere con viewport desktop e mobile.

## Esiti verificati

- Conferma di iscrizione in italiano ricevuta in Zoho. Dopo il clic, il contatto figura nella lista 6 e Brevo registra il modulo e la conferma nella cronologia.
- Benvenuto ricevuto tramite la modalità Test di Brevo. Il link apre il modulo di revoca dedicato. Il modulo ha bloccato le campagne lasciando attivo il canale transazionale per il contatto di prova.
- Sulla pagina pubblica del questionario, tre risposte sintetiche compaiono nel riepilogo e sono azzerate dopo il ricaricamento. Il controllo di rete a runtime e il test mobile restano aperti.
- I campi aggiuntivi di consenso sono configurati nel workflow inattivo. La data dinamica corrisponde all’esecuzione dell’azione. Il test dei messaggi invia le email di prova senza eseguire le azioni di aggiornamento del contatto.
