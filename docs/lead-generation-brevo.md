# Newsletter e freebie – configurazione prudente (13 novembre 2026)

## Scelta attuale
- **Autovalutazione:** i 15 questionari PDF rimangono accessibili senza registrazione; non si salvano risposte né dati sanitari sui server del sito/nel CRM.
- **Laboratorio del Sonno:** strumenti aperti, senza email-gate.
- **Guida «7 giorni per preparare il sonno»:** pagina HTML gratuita `/risorse/guida-sette-giorni-sonno/`, stampabile o salvabile come PDF sul dispositivo. Nessun form e nessuna raccolta di dati da quella pagina.
- **Brevo:** SOLO eventuale iscrizione *volontaria* alla newsletter commerciale. Il link all'iscrizione è visibile soltanto dopo la configurazione di un modulo esterno HTTPS, così non compare un form finto.
- Niente tag in CRM basati su sintomi, risposte, condizioni, risultati o identificatori sanitari; non inviare questionari a Brevo.
- Il vecchio codice di email-gate non viene più utilizzato.

## Unico passaggio necessario in Brevo (controllare l'account reale)
1. Marketing → Forms → Sign-up → Create sign-up form → Full page/embedded. Nome interno: `Newsletter Roberto Boscia`.
2. Campo **Email** (niente campi medici, quiz, problemi del sonno, dati sanitari o telefono).
3. Campo **Opt-in** per newsletter e promozioni, non preselezionato, con informativa GDPR collegata. Testo proposto:
   «Desidero ricevere via email la newsletter del dott. Roberto Boscia, con contenuti informativi e comunicazioni promozionali su libri, integratori, corsi e consulenze. So che posso revocare il consenso in qualsiasi momento. Ho letto l'informativa privacy.»
4. Lista separata `Newsletter - consenso confermato`; non aggiungere contatti provenienti da richieste di consulenza o download in assenza di consenso.
5. Selezionare **Double confirmation** con email di verifica; conservare prova e versione del testo consenso, timestamp se disponibile. Assicurarsi che l'email di benvenuto/dopo conferma contenga il link alla guida:
   `https://drrobertoboscia.com/risorse/guida-sette-giorni-sonno/`
6. Impostare disiscrizione nelle comunicazioni e controllare frequenze e gestione della revoca. Disabilitare tracking email non necessario quando possibile e valutarne separatamente gli adempimenti.
7. In **Share** copiare **URL pubblico HTTPS** del modulo (NON chiavi API, password o credenziali). Verificarne l'accessibilità da smartphone.
8. Aggiornare Privacy Policy con informazioni verificate sul trattamento effettivo Brevo (destinatari/ruoli, conservazione, eventuali trasferimenti, diritti, base giuridica, contatti e revoca) prima dell'attivazione.
9. Sostituire la stringa vuota `confirmedBrevoSignupUrl` in `assets/freebie-newsletter.js` con l'URL HTTPS verificato, pubblicare la modifica e testare con email di prova.
10. Testare: modulo → richiesta conferma → conferma → lista newsletter → email con guida → disiscrizione. Nessun invio marketing prima della conferma.

## Come appare ora
Sulle pagine Laboratorio e Autovalutazione c'è l'offerta **gratuita** della guida, con link diretto. Il collegamento all'iscrizione è nascosto finché Brevo non è stato configurato. Così non si promette la raccolta di email inesistente.

## Approccio operativo e privacy
La disponibilità della guida non dipende dal consenso commerciale. Niente moduli che richiedono sintomi, nessun incrocio tra salute e marketing. Il double opt-in non sostituisce l'informativa né rende automaticamente conformi tutti i trattamenti; verificare le configurazioni.

Fonti Brevo:
- https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
- https://help.brevo.com/hc/en-us/articles/27353832123026-Set-up-a-double-opt-in-process-for-a-sign-up-form-created-outside-of-Brevo
