# Privacy e cookie — verifiche indispensabili prima del rilascio
**Data:** 26 ottobre 2026
**Ambito:** `Robyboscia/sito-personale`, ramo `sviluppo-nuovo-portale` (NON `main`)
**Stato:** bozze scritte e collegate, ma **NON LEGALMENTE VALIDATE / NON PRONTE A ESSERE DICHIARATE CONFORMI**.

## Cosa è stato fatto
- Creata `privacy/index.html`: bozza GDPR leggibile, con identità di presentazione (Dott. Roberto Boscia), contatto `info@robertoboscia.it`, finalità e basi **da verificare**, caratteristiche dei calcoli nel browser, log e CDN, gestione dei file di Diario, diritti.
- Creata `cookie/index.html`: differenza tra cookie e `localStorage`, chiave del Diario `roberto-boscia.sleep-diary.v1` attivata solo a scelta, stato GA4 disattivato sul ramo di sviluppo, hosting/risorse terze ancora da verificare.
- Inseriti link Privacy + Cookie nel piè di pagina di tutte le pagine HTML del portale, compresa l'anteprima. Inserito riferimento vicino al modulo di contatto, al salvataggio locale del Diario e all'importazione CSV del Diario PRO.
- Entrambe le bozze sono `noindex,follow`, contrassegnate da avvisi «bozza» ed esplicitamente non dichiarate definitive.
- Nessun CMP/banner falso installato. GA4 rimosso dalla landing nel ramo di sviluppo precedente; il sito attuale `main` **non** è stato modificato.

## Inventario verificato dal codice del ramo di sviluppo
| Componente | Comportamento rilevato | Status residuo |
|---|---|---|
| Diario digitale | Compilazione e calcolo nel browser; memoria persistente `localStorage` solo dopo scelta; CSV/export/mailto o condivisione avviati dall'utente | Confermare il comportamento Safari e l'assenza di altre estensioni/script dell'hosting |
| Diario PRO | CSV scelto manualmente oppure lettura esplicita delle schede locali; report e stampa nel browser | Verificare caricamento ed export con dati fittizi |
| Check-up, Caffeina, Turni | Modelli e risultati nel browser, nessun invio HTTP esplicito dei valori rilevato nei JS | Audit dinamico e privacy dei browser |
| Contatti Assetto | `mailto:` apre una bozza su app dell'utente; non invia messaggi dal sito; campo libero scoraggia dati sanitari | Hosting mail, eventuale ricezione, conservazione e gestione richieste da confermare |
| Analytics GA4 | Lo script autoattivante non è presente nella landing del ramo sviluppo | Test di rete su dominio di staging/finale; non riattivare senza basi e consenso necessario |
| Assetto — GSAP | Carica codice da `cdnjs.cloudflare.com` | Valutare self-hosting, trasferimento IP, log e eventuali cookie |
| Copertina libro | Immagine remota da `www.dormirefacile.com` | Valutare hosting locale consentito o disclosure, log e cookie |
| Hosting | È necessario per servire pagine e può trattare IP/log tecnici | **Provider, luogo, log, retention, ruoli e DPA sconosciuti** |
| Link esterni | Navigazione verso studi/progetti dopo click | Informative di destinazione autonome |

Questa è una ricognizione statica, non una scansione certificata di cookie e richieste di rete: **non** concludere che nessun cookie sia presente solo da questi file.

## Dati da richiedere/confermare dal titolare
1. **Soggetto titolare esatto:** Roberto Boscia come persona fisica o nome completo dell'impresa/professione titolare; eventuale ragione sociale, P.IVA quando applicabile.
2. **Recapito giuridico:** confermare sede o indirizzo di contatto da riportare nell'informativa. Il sito storico cita Via Attilio Barbarulo 60, Nocera Inferiore (SA), ma NON usarlo automaticamente come sede del titolare.
3. **Email privacy** (per ora `info@robertoboscia.it`) e se è stata nominata una figura RPD/DPO (NON presumere obbligo o nomina).
4. **Provider web/DNS/CDN** effettivamente configurati per `drrobertoboscia.com` e eventuale hosting dei moduli. Recuperare condizioni privacy, DPA/accordi da art. 28 quando pertinenti, paese di conservazione e misure di sicurezza.
5. **Log di accesso e sicurezza:** tipi di eventi/indirizzi IP registrati, scopi, basi giuridiche, tempi di conservazione effettivi, chi può accedervi e se ci sono protezioni anti-bot o servizi CDN attivi.
6. **Provider casella email** `info@robertoboscia.it`: titolare dell'account, giurisdizione/luoghi di trattamento e come vengono trattate le richieste ricevute.
7. **Conservazione richieste email:** stabilire tempi specifici proporzionati allo scopo e gestione delle eventuali email spontanee contenenti informazioni sulla salute. Definire percorso di minimizzazione/eliminazione/indirizzamento e presupposti Art. 9, se necessario.
8. **Trasferimenti fuori dallo SEE**, se effettuati da hosting/CDN/mail: valutare decisione di adeguatezza o garanzie applicabili. Non dichiarare «nessun trasferimento» senza prova.
9. **Servizi terzi:** decidere se mantenere GSAP da cdnjs e la copertina remota o ospitare risorse localmente, se consentito. Verificare l'eventuale effetto su cookie/richieste esterne.
10. **Analytics:** decidere se NON usarli (percorso più semplice) oppure riattivarli dopo configurazione e informativa adeguata, con consenso preventivo ove richiesto.

## Collaudo tecnico da fare prima della pubblicazione
- Sessione pulita in Chrome/Firefox/Safari: DevTools → Network, Storage/Cookies, richieste di rete iniziali senza interazione; controllare se esistono cookie non tecnici.
- Ripetere clic, scroll, apertura degli strumenti, compilazione, scelta di salvare il Diario e visita ad Assetto Biologico™. Verificare che GA4 e pixel non partano.
- Annotare **nome esatto, dominio, categoria, finalità, scadenza/retention, prima/terza parte** di ogni cookie o tecnologia di tracciamento rilevata; documentare prova con data e screenshot.
- Se appare tracciamento non tecnico, **bloccarlo prima del consenso**, implementare vera scelta (anche rifiuto), revoca e relativa informativa, oppure eliminare il tracciatore.
- Testare un dispositivo iPhone Safari reale per salvataggio/erasure nel Diario e invio manuale della bozza mail; non usare dati reali di pazienti.
- Revisionare la formulazione finale ai sensi GDPR artt. 6, 9, 13 e 15–22 e della normativa cookie italiana. Aggiornare le bozze rimuovendo gli avvisi solo dopo approvazione documentata.
- Rieseguire QA di link interni, metadati `robots` e sitemap prima di decidere quali pagine indicizzare.
- NON modificare `main`, `CNAME`, GitHub Pages, DNS o deploy senza autorizzazione espressa dell'utente.

## Materiali normativi di riferimento
- GDPR (UE) 2016/679: https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679
- Garante Privacy — FAQ Cookie: https://www.garanteprivacy.it/faq/Cookie
- Garante Privacy — Linee guida cookie e altri strumenti di tracciamento, 10 giugno 2021: https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876

### Nota metodologica
Il cookie banner NON va inventato «per sicurezza». Il bisogno di consenso dipende da ciò che è effettivamente implementato; eventuali strumenti non tecnici vanno bloccati fino alla scelta ove richiesta. Questa checklist non è un parere legale, e non costituisce accertamento di conformità.
