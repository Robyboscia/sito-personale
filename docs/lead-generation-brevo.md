# Acquisizione contatti — Laboratorio e Autovalutazione (configurazione di rilascio)

## Stato
Interfaccia pronta in **anteprima**, disabilitata nel traffico normale.
Non pubblicare un modulo che simuli l'invio: nessun dato deve essere considerato raccolto prima dell'integrazione reale di Brevo.

## Obiettivo
- Richiedere un indirizzo email per inviare il link alla risorsa gratuita.
- Richiedere **separatamente**, in modo facoltativo e senza preselezione, il consenso a promozioni su libri, integratori, corsi e consulenze.
- Conservare separatamente provenienza (Laboratorio/Autovalutazione) e prova del consenso. Chi non acconsente al marketing riceve il materiale, ma non email pubblicitarie.
- Non registrare risposte ai questionari né informazioni sanitarie insieme al contatto.

## Impostazione Brevo (form nativi senza chiave API sul browser)
1. In Brevo > Marketing > Moduli, creare due moduli di iscrizione distinti, per tracciare la fonte.
2. Campo email necessario per inviare link e conferme. Attributo consenso marketing facoltativo, non preselezionato; informativa privacy collegata e testo del consenso esplicito. Verificare che la piattaforma non aggiunga indiscriminatamente gli iscritti a liste promozionali.
3. Attivare doppia conferma quando appropriata e configurare l'email di conferma. Per le risorse gratuite prevedere il link al contenuto anche a chi **non** accetta marketing; il DOI marketing non deve diventare un vincolo all'accesso.
4. Impostare due redirect finali di accesso, dopo verifica dell'email:
   - https://drrobertoboscia.com/laboratorio-del-sonno/?accesso=confermato
   - https://drrobertoboscia.com/autovalutazione/?accesso=confermato
5. Verificare iscrizione, lista, campo marketing, revoca, testi privacy, tempi di conservazione e gestione cancellazioni. Aggiornare privacy policy prima della messa online.
6. Solo dopo un test completo, inserire gli URL HTTPS dei moduli in assets/lead-capture.js e impostare config.enabled=true.
7. ATTENZIONE: ?accesso=confermato e sessionStorage sono solo una **barriera di marketing** su sito statico, non autenticazione sicura. Link diretti ai PDF o agli strumenti restano accessibili. Se è necessario impedire davvero accessi senza email verificata, serve verifica server-side con token firmato a scadenza e hosting delle risorse non pubblico. Non dichiarare che questa versione sia un accesso protetto.

## Anteprima
In `assets/lead-capture.js` la funzione è OFF per i visitatori normali. Aggiungere `?anteprima-lead=1` al percorso delle due pagine. In modalità anteprima il campo email e il tasto sono disabilitati e nessun dato viene inviato.

## Contenuti e GDPR
Il Garante distingue l'email necessaria a fornire il servizio dal consenso per invii pubblicitari. Il consenso promozionale non può essere obbligatorio come condizione per accedere agli strumenti. Al momento, per conformità all'informativa, le funzionalità di acquisizione non sono abilitate.

Fonti: https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/2542348
https://help.brevo.com/hc/it/articles/208771869-Creazione-di-un-modulo-di-sottoscrizione-in-Brevo
