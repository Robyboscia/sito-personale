# CRM Brevo nativo — piano operativo, 28 novembre 2026

Decisione operativa: sospendere il deployment del Worker e le attività che richiedono Cloudflare o Work. Conservare il codice e i test precedenti, senza attivazione. Nessuna modifica al sito pubblico, alle informative o alle automazioni reali in questo intervento. Questo piano integra la revisione 22 dell'archivio.

## Percorsi e liste

| Percorso | Lista esistente | Configurazione proposta |
|---|---|---|
| Newsletter generica | 6 Newsletter – Consenso confermato | Modulo esistente, consenso esplicito, DOI, benvenuto verificato end-to-end prima dell'attivazione |
| Laboratorio | 3 Laboratorio del Sonno | Accesso diretto agli strumenti, invito facoltativo alla newsletter generica; eventuale modulo dedicato solo dopo valutazione dei dati e della finalità |
| Autovalutazione | 4 Autovalutazione | Stesso invito generico, fuori dal questionario, senza trasferire risposte, punteggi, esiti o provenienza sanitaria |
| Guide ed ebook | 5 Guide ed ebook | Download diretto; eventuale modulo nativo con conferma di servizio e link alla guida, da collaudare senza iscrivere automaticamente alla newsletter |
| Mental Pro | 7 Mental Pro | Richiesta di informazioni generali via Zoho, senza dati sanitari; eventuale modulo separato dopo verifica finalità |
| BioSignal Sleep | 8 BioSignal Sleep | Richiesta generale via Zoho, senza anamnesi, risultati o dati wearable; eventuale modulo separato dopo verifica finalità |
| Clienti | 9 Clienti | Solo dati contrattuali necessari, non equivale a consenso marketing |
| Collaudo | 2 Contatti di prova | Solo indirizzi autorizzati; nessuna campagna a utenti reali |

Le liste esistono già: non crearne duplicati. La provenienza da un questionario o da un servizio specifico può rivelare informazioni delicate, quindi non aggiungere automaticamente i visitatori alle liste 3, 4, 7, 8 in base al comportamento sul sito. L'appartenenza a qualsiasi lista diversa dalla 6 non abilita marketing. Anche la lista 6 richiede prova di consenso e assenza di revoca. Non usare un modulo di servizio come nuovo opt-in commerciale: un secondo modulo potrebbe modificare attributi globali del contatto o la blocklist; verificarlo prima dell'uso reale. I moduli nativi aggiungono contatti al database: non equivalgono a un invio senza conservazione.

## Ordine del collaudo quando disponibile Brevo da PC

1. Mantenere Welcome message ID 1 inattiva. Ispezionare trigger, ramo positivo, attesa e ordine delle azioni. Preferire il trigger specifico del modulo newsletter se disponibile e verificato dopo DOI; non sommare due trigger alternativi. Conservare i filtri DOUBLE_OPT-IN Yes, OPT_IN true, campagne Subscribed. Verificare anche prova dell'evento corrente, non solo attributi storici; un'aggiunta manuale alla lista non deve simulare un nuovo consenso.
2. Creare una copia isolata oppure configurare un filtro destinatario di prova prima di attivare un collaudo; controllare che non possa includere altri contatti. Testare nuovo contatto con email autorizzata, non confermato, confermato, ripetizione, ingresso manuale, revoca durante attesa, nuova iscrizione volontaria dopo revoca. Nessun invio a terzi. Non riutilizzare una persona già presente senza verificare gli effetti del test.
3. Rieseguire controllo consenso immediatamente prima di ogni email promozionale (soprattutto dopo un'attesa). Verificare scrittura FONTE_CONSENSO_MARKETING, DATA_CONFERMA_MARKETING (data di esecuzione, non timestamp esatto DOI), VERSIONE_INFORMATIVA_MARKETING (versione effettiva al rilascio). Conservare log nativi del modulo e conferma; non attribuire consenso a contatti aggiunti manualmente.
4. Revoca: il modulo separato già provato deve blocklistare campagne, non impedire indiscriminatamente email di servizio. Controllare che un workflow con messaggi promozionali classificati tecnicamente come transazionali non continui a inviare dopo revoca. Verificare eventuali disiscrizioni native presenti in header/footer, coerenza del blocco marketing, testo italiano e nuova iscrizione. Non attivare un blocco bidirezionale globale senza valutarne gli effetti.
5. Guide: preferire il download diretto già previsto. Se si desidera anche consegna via email, provare un modulo nativo distinto con conferma contenente il link; verificare se il modulo aggiunge contatti, modifica OPT_IN/DOUBLE_OPT-IN o stato campagne, e se consegna anche dopo una revoca marketing. Se non è possibile garantire separazione, mantenere il download diretto senza nuovo modulo; non installare Worker automaticamente.
6. Verificare DPA, informativa effettiva, versione consenso, log, conservazione, tracking e quota dell'account. Applicare l'audit legale con approvazione punto per punto. Solo dopo approvazione esplicita collegare il modulo al sito e attivare il flusso di produzione.

## Copy pronto per eventuale modulo di consegna guida (proposta, non pubblicato)

Titolo: Ricevi la guida gratuita.
Testo: Inserisci la tua email per ricevere il link alla guida. La richiesta non comporta l'iscrizione alla newsletter. Puoi anche scaricarla direttamente.
Pulsante: Inviami la guida.
Link: Informativa privacy (versione verificata prima del rilascio).

Email di servizio: oggetto "La tua guida gratuita sul sonno". Corpo: "Ciao, ecco il link alla guida che hai richiesto: https://drrobertoboscia.com/risorse/guida-sette-giorni-sonno/ . Buona lettura! Dr. Roberto Boscia, farmacista." Niente offerte o ulteriori promozioni. Verificare link, mittente, Reply-To e tracciamenti prima dell'uso.

## Riferimenti Brevo

- Moduli e conferme: https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
- Trigger: https://help.brevo.com/hc/en-us/articles/15445989568402-Available-triggers-actions-and-rules-in-an-automation
- Prova DOI: https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups
- Disiscrizione: https://help.brevo.com/hc/en-us/articles/9741388688402-Do-I-need-to-add-an-unsubscribe-link-to-my-emails
- Limiti Free: https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan (300 email/giorno, fino a 2.000 contatti unici nelle automazioni attive secondo documentazione; verificare quota effettiva dell'account).

Stato: piano preparato, non collaudo live. Nessuna modifica a Brevo effettuata in questo intervento.
