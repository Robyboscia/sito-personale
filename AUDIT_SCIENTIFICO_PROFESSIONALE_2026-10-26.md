# Audit scientifico e professionale — Portale Dott. Roberto Boscia
**Data:** 26 ottobre 2026  
**Ambito:** 21 pagine HTML editoriali, commerciali, tecniche e informative del ramo `sviluppo-nuovo-portale`, oltre alla verifica della coerenza con gli strumenti JS già testati. Il ventiduesimo HTML dell'albero, `google65bc04ec2889c3a3.html`, è un file di verifica automatica e non è una pagina editoriale.  
**Ambiente:** soltanto ramo di sviluppo. Il ramo pubblico `main`, CNAME, DNS e deployment non sono stati modificati.  
**Metodo:** lettura del codice HTML di tutte le pagine, estrazione del testo visibile, verifica dei passaggi con risvolto medico/scientifico/professionale, confronto con linee guida e studi autorevoli disponibili al 26 ottobre 2026. Non sostituisce revisione medico-legale, controllo completo FOFI/Ordine né una verifica clinica personalizzata.  

## Esito esecutivo

**Risultati:** individuati rischi comunicativi importanti soprattutto sulla landing **Assetto Biologico™**. Alcune frasi facevano sembrare possibile diagnosticare o attribuire le cause della stanchezza, misurare direttamente l'architettura del sonno con dati non clinici, stimare la capacità funzionale del sistema nervoso e valutare in modo diretto lo «stato delle membrane cellulari» dalla BIA. Altre espressioni descrivevano persone come «sane» soltanto perché gli esami erano nella norma. Inoltre erano presenti claim quantitativi commerciali (500+ persone seguite, 6 valutazioni/mese) senza evidenza verificabile nel repository e possibili promesse di risultato.

**Corretto immediatamente nel solo ramo sviluppo:** headline/metadata e claim medici Assetto, promesse improprie su wearable, BIA e questionari, necessità del medico per fatica nuova/persistente, social proof numerico non verificato sospeso, rinvio alla CBT-I quando si parla di insonnia cronica, incoerenze delle pagine Privacy/Cookie, comunicazione di stato dei tool e modulo contatti.

**Non risolto con la sola redazione:** il protocollo reale delle consulenze a pagamento, documentazione di numeri e credenziali commerciali, eventuale impiego di BIA/PPG e consenso/gestione di dati personali sanitari, presentazione del prezzo €497 e due follow-up, revisione deontologica/professionale da parte di un esperto competente. Nessun contenuto è certificato come prestazione sanitaria lecita o come risultato clinico atteso.

## Inventario delle 21 pagine

| N. | File | Audit | Osservazioni/azioni |
|---:|---|---|---|
| 1 | `index.html` | Corretto | Posizionamento divulgativo prudente. Aggiornato il testo sul Laboratorio (diario e quattro strumenti in prova) e sul canale contatti sospeso. |
| 2 | `anteprima.html` | Corretto | Copia di presentazione aggiornata alle stesse informazioni; non confondere anteprima con lancio del portale. |
| 3 | `assetto-biologico/index.html` | **Rischio elevato, corretto in parte** | Sostituiti claim su «esami perfetti» e salute, architettura del sonno, recupero del sistema nervoso, BIA, diagnosi implicita delle cause e piano; rinvio medico. Sospesi contatori numerici non verificati. Verificare il protocollo e la liceità concreta del servizio remunerato. |
| 4 | `chi-sono/index.html` | Senza rilievi scientifici sostanziali | Presentazione professionale sobria. Titoli/esperienza devono comunque essere veri e documentabili. |
| 5 | `consulenze/index.html` | **Bloccante commerciale** | Pagina provvisoria con `noindex`; servizi non definiti, nessun pacchetto/prescrizione inventata. Non presentare come sezione commerciale pronta. |
| 6 | `contatti/index.html` | Conforme allo stato tecnico noto | Email e modulo commerciale sospesi; non raccoglie informazioni sanitarie. Riaprire solo dopo test reale della casella e revisione del trattamento dati. |
| 7 | `libro/index.html` | Generale, senza rilievi medici sostanziali | Pagina editoriale. Da verificare diritti, corrispondenza della copertina con l'edizione scelta, collegamenti esterni e dati di vendita se introdotti. |
| 8 | `shop/index.html` | Generale, precauzioni adeguate | Progetti e integrazione senza promesse cliniche specifiche; eventuali schede integratori e claim sul prodotto richiedono revisione normativa separata prima della vendita. |
| 9 | `laboratorio-del-sonno/index.html` | Corretto | Rimosso copy scritto come nota interna «ramo di sviluppo» e «corsi che avete seguito»; descrive prototipi educativi non diagnostici. |
| 10 | `laboratorio-del-sonno/diario/index.html` | Accettabile con limiti espliciti | Diario soggettivo 14 notti, stime parziali per risvegli mancanti, nessuna diagnosi. Restano da collaudare salvataggio/CSV/email su dispositivi reali. |
| 11 | `laboratorio-del-sonno/diario/privacy/index.html` | Tecnico/giuridico provvisorio | Dichiara correttamente elaborazione locale e condivisione manuale. Richiede verifica giuridica del trattamento e comportamento effettivo dei provider. |
| 12 | `laboratorio-del-sonno/strumenti/check-up/index.html` | Scientificamente prudente | 12 domande non validate dichiarate esplicitamente; il grafico non esprime «percentuali di salute». Non trasformare le fasce editoriali in cut-off clinici. |
| 13 | `laboratorio-del-sonno/strumenti/caffeina/index.html` | Scientificamente prudente | Tre emivite esemplificative 3/5/7 h, soglia convenzionale <5% di ciascuna dose e non «eliminazione totale». Variabilità individuale, gravidanza e farmaci rilevanti. |
| 14 | `laboratorio-del-sonno/strumenti/diario-pro/index.html` | Accettabile con limiti | Import CSV e medie, trend con minimo 3 notti per settimana, stime non cliniche; non attribuire capacità diagnostica. Errori demo già corretti in QA precedente. |
| 15 | `laboratorio-del-sonno/strumenti/turnisti/index.html` | Accettabile con limiti | Pause 11 h come segnale organizzativo orientativo; il calcolatore non accerta disciplina legale/contrattuale né sicurezza di un calendario. |
| 16 | `accademia/index.html` | Accettabile | Introduce i tre articoli, lettura divulgativa e professionale distinta. |
| 17 | `accademia/diario-del-sonno/index.html` | **Corretto** | Concetto di diario prospettico coerente; aggiunta nota sulla CBT-I come trattamento di prima scelta dell'insonnia cronica e link VA/DoD 2025. Il diario da solo non è terapia né test diagnostico. |
| 18 | `accademia/luce-e-ritmo-circadiano/index.html` | Accettabile | Giusta cautela sull'orario dell'esposizione, ritmi circadiani, turni e fototerapia. La guida ambientale non è una prescrizione individuale. |
| 19 | `accademia/wearable-e-sonno/index.html` | Accettabile | Corretto distinguere sensore, algoritmo, stadi stimati, PPG vs ECG, limiti HRV e dispositivi wellness vs medicali con validazione specifica. |
| 20 | `privacy/index.html` | **Corretto ma non definitivo** | Eliminata falsa dichiarazione che il CAP/comune dell'indirizzo fossero stati integralmente confermati; resta da confermare e collaudare la ricezione postale. Aggiornato il testo sul modulo di contatto disattivato. |
| 21 | `cookie/index.html` | **Corretto ma non definitivo** | Rimossa dichiarazione obsoleta secondo cui lo script GA4 sarebbe ancora automatico nel vecchio sito pubblico. Restano inventario cookie, network, log e retention da verificare in ambiente reale. |

## Correzioni scientifiche applicate — prima/dopo (sintesi semantica)

1. **Esami «perfetti» e persone «sane».** Non si può dichiarare sana una persona in base a pochi esami: la stanchezza nuova/persistente può avere varie cause, comprese condizioni cliniche che richiedono anamnesi e accertamenti mirati. Titoli e FAQ ora distinguono esami iniziali nella norma da valutazione medica. Fonte [1,2].
2. **«Architettura del sonno».** Un diario o un wearable consumer producono informazioni soggettive o stime algoritmiche; non equivalgono alla stadiazione mediante polisonnografia. La landing ora promette solo osservazione di orari, abitudini e stime, senza appropriarsi di esami diagnostici. Fonte [3,4].
3. **«Capacità di recupero del sistema nervoso».** Nessun esame o parametro standardizzato era definito per sostenere tale misura. Si parla ora di stress percepito, abitudini e sintomi riferiti, senza misure pseudo-cliniche implicite.
4. **Bioimpedenziometria.** Non misura direttamente salute delle membrane, idratazione diagnostica o «energia cellulare». Impedenza e valori derivati stimano la composizione corporea a determinate condizioni, con sensibilità a idratazione, strumento, equazioni e standardizzazione. Fonti [5,6].
5. **Questionari.** Eliminato il claim che identifichino «pattern di compensazione che i normali check-up non vedono». Restano strumenti di raccolta e organizzazione, non di diagnosi eziologica.
6. **Risultato garantito.** Eliminato passaggio che dava per certo il sollievo provato dai clienti: ora è un obiettivo dichiarato, non una promessa o testimonianza non verificata.
7. **Contatori numerici di marketing.** Sospesa l'intera fascia «15+ anni esperienza clinica / 500+ persone seguite / 6 valutazioni al mese» perché almeno parte di queste cifre non è accompagnata da documentazione verificabile. Dati e formulazioni da confermare prima di reinserirla; non equiparare esperienza in farmacia a un numero dimostrato di consulenze sul sonno.
8. **Insonnia cronica.** Nell'articolo sul diario esplicitato il ruolo della terapia cognitivo-comportamentale per l'insonnia (CBT-I) come prima scelta raccomandata, distinguendola da igiene del sonno e diario di osservazione. Fonti [7,8].
9. **Testi di stato del portale.** Aggiornate home, anteprima, Laboratorio e Privacy/Cookie: la sezione Consulenze è ancora in costruzione; quattro strumenti del Laboratorio sono in prova; il modulo commerciale è sospeso e l'email non esiste ancora. Non presentare come prenotabile ciò che non può ricevere richieste.

## Questioni professionali che richiedono una decisione documentata

**A. Protocollo concreto della consulenza Assetto Biologico™ (€497 nel copy attuale).** Bisogna specificare destinatari, esclusioni/criteri di rinvio al medico, dati raccolti, eventuali strumenti effettivamente usati (BIA, diario, PPG/HRV/wearable), tipi di report consegnati, differenza tra informazione professionale e diagnosi/terapia, eventuale follow-up e requisiti dell'attività remunerata. **Non** basta un disclaimer per stabilire che un'attività è automaticamente autorizzata; serve una verifica professionale/deontologica puntuale sulla prestazione e sulla comunicazione pubblicitaria. Fonti quadro [9,10].

**B. Prestazioni «Consulenze».** Pagina ancora `noindex` e «in preparazione». Non inventare tre livelli a pagamento, prezzi o modelli di anamnesi professionale senza definizione e approvazione. Collegamenti e inviti a prenotare devono rispecchiare un canale realmente attivo e un servizio erogabile.

**C. Uso di dati sanitari.** Se in futuro verranno raccolti referti, terapie farmacologiche, diagnosi o informazioni di salute in un percorso professionale, servono base giuridica appropriata e condizioni art. 9 GDPR, ruoli dei fornitori, misure di sicurezza, durata e informativa adeguata. Al momento i calcolatori locali non equivalgono a raccolta server dal titolare: questo **non** elimina eventuali log di hosting e risorse esterne.

**D. Claim commerciali e testimonianze.** Prima della pubblicazione verificare eventuali numeri di pazienti/clienti, esiti, titoli, esperienza, limite di disponibilità mensile, prezzi, sconti, evidenze per «metodo proprietario» ed eventuale uso del simbolo ™. Le 2 visite di follow-up e la struttura della prestazione devono corrispondere a una proposta realmente gestibile.

**E. Strumenti digitali.** Check-up non validato e Diario PRO sono descrittivi; eventuale evoluzione futura con triage medico, score di rischio malattia o suggerimenti di terapia richiederebbe una nuova valutazione tecnica/regolatoria prima dell'attivazione. Il progetto Wearable Decoder non è ancora disponibile.

## Criteri scientifici usati e fonti

[1] NHS. *Tiredness and fatigue* — sintomi persistenti e necessità di valutazione clinica: https://www.nhs.uk/symptoms/tiredness-and-fatigue/

[2] American Academy of Family Physicians. *Fatigue in Adults: Evaluation and Management* (2023) — anamnesi, esame clinico, test mirati: https://www.aafp.org/afp/2023/0700/fatigue-adults

[3] AASM. *Consumer Sleep Technology: Position Statement* (J Clin Sleep Med 2018) — limiti diagnostici dei tracker: https://pmc.ncbi.nlm.nih.gov/articles/PMC5940440/

[4] *Performance of three consumer sleep-tracking devices compared with Actigraphy and Polysomnography* (Sleep Medicine, ottobre 2026) — bias specifici e non equivalenza alla stadiazione clinica: https://pubmed.ncbi.nlm.nih.gov/42258963/

[5] *Methodological standards for body composition assessment* (American Journal of Clinical Nutrition, 2026) — la BIA misura grandezze elettriche, le componenti corporee sono stime dipendenti da modelli e condizioni: https://pmc.ncbi.nlm.nih.gov/articles/PMC13197919/

[6] *Bioimpedance basics and phase angle fundamentals* (2023) — significato e limiti delle inferenze su «cellular health»: https://pubmed.ncbi.nlm.nih.gov/36749540/

[7] VA/DoD. *The Management of Chronic Insomnia Disorder and Obstructive Sleep Apnea* (2025) — CBT-I raccomandata e sleep hygiene non adeguata come trattamento unico: https://www.healthquality.va.gov/guidelines/CD/insomnia/

[8] AASM. *Combination treatment for chronic insomnia disorder in adults* (13 aprile 2026) — confronto fra CBT-I, farmaci e combinazioni: https://pubmed.ncbi.nlm.nih.gov/41975142/

[9] Codice deontologico del farmacista approvato FOFI 7 maggio 2018 — riferimento professionale: https://www.ordinefarmacisti.vr.it/codice-deontologico/

[10] Codice penale, art. 348, testo normativo vigente (verificare applicabilità concreta con professionista legale): https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1930-10-19;1398:1~art348

[11] EFSA. *Caffeine* — la caffeina può disturbare il sonno anche in dosi di 100 mg e la quantità varia per bevanda: https://www.efsa.europa.eu/it/topics/topic/caffeine

## Stato del rilascio

- **NON pronto alla pubblicazione integrale del nuovo portale.**
- Bloccanti non editoriali confermati: email professionale funzionante e verificata; protocollo/limiti della prestazione remunerata; verifica privacy, cookie e rete in browser; conferma recapito postale completo; testi dei servizi e fattibilità operativa; collaudo UI mobile/desktop effettivo.
- Nessuna copia su `main`, nessuna azione su CNAME o DNS.


## Aggiornamento: stato delle prenotazioni coerente con email sospesa

Nel controllo successivo è emerso che la landing Assetto Biologico™, benché avesse il modulo disabilitato, manteneva pulsanti commerciali «Prenota la valutazione», «Prenota la tua valutazione», «Richiedi info», una voce menu «Prenota» e un'intestazione del form «Richiedi una prima chiamata». Per evitare di simulare una prenotazione attiva:
- I pulsanti della hero e della presentazione ora aprono la sezione informativa «Come funziona il percorso»; la barra mobile usa «Scopri il percorso».
- Il menu porta alla sezione «Contatti», il cui titolo comunica che le richieste sono temporaneamente sospese.
- I dati strutturati JSON-LD della pagina descrivono la sospensione dei contatti, non una chiamata richiedibile in quel momento.
- La chiusura del testo precisa l'obiettivo educativo e rinvia alla valutazione clinica per le cause della stanchezza.

Commit: `a8f7073b4071bb2242e9ac57adc43a0ef90759b2`.

**Resta da definire** come verranno realmente richieste le consulenze, con quali prerequisiti e quale conferma esplicita di ricezione: nessun modulo di invio automatico o calendario è stato attivato.

## Nota editoriale successiva: sostituzione definitiva dei contatori dimostrativi

L'utente ha chiarito che le statistiche numeriche originarie erano esclusivamente **segnaposto di layout**, non affermazioni reali da verificare. Di conseguenza, il problema non è «documentare 500 persone seguite» ma **non pubblicare cifre inventate**.

È stata scelta e implementata la combinazione copywriting di direct response **A + D**, rimpiazzando i contatori con tre promesse editoriali limitate a ciò che la pagina può sostenere: 1) smettere di accumulare tentativi senza contesto, 2) non trasformare gli score dei wearable o singoli esami in verdetti, 3) privilegiare chiarezza e approfondimento medico quando opportuno. La modifica è nel ramo sviluppo al commit `924e3e6b3054645d9bd49c19c031ac8a98cfdc75`; la struttura è responsive e senza numeri inventati. Restano da testare resa su browser mobile e protocollo concreto delle consulenze prima del lancio.

## Chiusura operativa dei numeri provvisori nella landing — 26 ottobre 2026

Dopo ulteriore verifica diretta del file Assetto Biologico™, i numeri di confronto e scarsità residui **€1.800+** («Valore totale») e **massimo 6 nuove valutazioni al mese** erano ancora nel markup. Sono stati eliminati **solo nel ramo sviluppo**, commit `f46bbed013c5995c768e98a99bef4d012dfa179e`. Il prezzo proposto **€497**, la prima chiamata di **15 min** e **due follow-up** sono rimasti invariati, senza assumerne una conferma commerciale definitiva. Il modulo commerciale resta disabilitato, ora anche a livello di tutti e quattro i campi, non soltanto sul pulsante.

**Unica prova sociale sensibile ancora presente:** una citazione attribuita a «Imprenditore, 49 anni — paziente di Roberto Boscia». L'autenticità e l'autorizzazione alla pubblicazione non sono state verificate. Va confermata dall'interessato oppure eliminata prima del lancio; non presentarla come testimonianza verificata. Non serve riprogettare l'offerta già presente nel sito.
