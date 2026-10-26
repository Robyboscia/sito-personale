# Collaudo tecnico e funzionale — nuovo portale Roberto Boscia
**Data:** 26 ottobre 2026  
**Ambito:** solo ramo GitHub `sviluppo-nuovo-portale`  
**Sito pubblico `main`:** non modificato da questo collaudo  
**Tipo di verifica:** analisi statica completa HTML/JavaScript e prove di funzione eseguite in isolamento V8. Non è stato effettuato un collaudo visivo con browser reale sulla versione in sviluppo, perché non è online.

## Quadro rapido

| Controllo | Esito | Note |
|---|---|---|
| Documenti HTML | 21/21 analizzati | Copertura completa dei documenti del ramo |
| Script JavaScript | 8/8 compilati senza errori sintattici | Compilazione tramite motore V8 |
| Riferimenti locali di risorse/URL | Nessun target assente | Calcolo dei percorsi relativi contro l'albero Git del ramo |
| Anchor della stessa pagina | Nessun ID di destinazione assente rilevato | Regex delle ancore statiche |
| ID HTML duplicati | Nessuno rilevato | Su tutti i 21 documenti |
| Immagini senza attributo alt | Nessuna rilevata | Presenza attributo, non valutazione semantica dell'alternativa |
| `aria-labelledby`/`aria-describedby` statici irrisolti | Nessuno rilevato | In aggiunta corretto un ID creato in runtime dal Check-up |
| Link `target="_blank"` senza `noopener` | Nessuno rilevato | Verifica statica |
| Contatto al vecchio indirizzo email | Eliminato dalle pagine e dallo script di contatto attivo | La casella futura non è stata creata |
| Prototipi e privacy provvisoria `noindex` | Confermati | Non pubblicare né eliminare l'esclusione prima della revisione |

## Prove logiche di calcolo eseguite e superate (26 scenari mirati)

### Calcolatore della Caffeina (3)
- Sonno dopo la mezzanotte con bevanda alle 23:00 e bevanda alle 00:15: collocazione temporale sulla notte simulata corretta.
- Orario di «quasi smaltimento» oltre il confine fra giorni e due giorni dopo: le date relative sono mantenute.
- Conversione orario relativo del giorno successivo (03:00) corretta.
- **Nota:** valori 3/5/7 ore sono scenari illustrativi, non misure individuali. Una verifica clinico-scientifica dei testi rimane distinta dal test funzionale.

### Check-up del Sonno (4)
- Tutte le risposte «Mai» generano quattro aree favorevoli e barre piene (nessun grafico che rappresenti erroneamente un esito favorevole come negativo).
- Tutte le risposte «Spesso» generano quattro aree con maggiori elementi da osservare.
- Risposte incomplete respinte dal modello.
- Grafico con quattro spicchi di uguale ampiezza (25% ciascuno).
- **Fix applicato:** in `laboratorio-del-sonno/strumenti/check-up.js` l'intestazione del grafico ora ha `id="check-summary-title"`, collegato al contenitore con `aria-labelledby`. Commit `fd1a4ef7a96f3351eab2dfe3595dde76a47673ba`.

### Diario digitale 14 notti (7)
- Esempio 23:00 / 23:20 / 07:00 / 07:20, latenza 20, risvegli 20: 500 min a letto, 420 min di sonno.
- Campo risvegli non dichiarato: stima marcata come parziale, senza inventare minuti.
- Tentativo di dormire oltre sei ore dall'ingresso a letto respinto.
- Contraddizione zero risvegli / risvegli con durata positiva respinta.
- Risvegli + latenza superiori al tempo disponibile respinti.
- Tentativo di dormire coincidente con risveglio finale respinto.
- Attraversamento mezzanotte 23:50 / 00:05 / 08:10 / 08:30, latenza 20, risvegli 20: 520 min a letto, 445 min di sonno.
- La casella per salvare i dati in `localStorage` è opzionale; il formato esistente usa la chiave `roberto-boscia.sleep-diary.v1`. La conservazione effettiva è limitata al browser, non è una promessa di durata garantita.

### Diario PRO e CSV (5)
- Parser supporta BOM, delimitatore punto e virgola, virgolette e ritorni a capo all'interno del campo.
- CSV con virgolette aperte respinto.
- CSV valido corrispondente al formato del diario importato con 420 min di sonno stimato.
- CSV con dato di sonno incompatibile con gli orari respinto.
- CSV con giorno duplicato respinto.
- Formula-injection nel CSV: esaminate le protezioni su celle che iniziano con `=`, `+`, `@`, `-`; vengono prefissate con apostrofo. Virgolette nel testo vengono raddoppiate.

### Turnisti (6)
- Settimana dimostrativa: cinque turni e due giorni di riposo, durata turno standard 480 min.
- Notte 22–06 seguita da mattina 06–14: pausa 0 min e sovrapposizione della finestra di riposo segnalate.
- Due notti 22–06 consecutive: pausa di 16 ore.
- Turno personalizzato di 17 ore respinto.
- Tempo di rientro 181 min respinto (limite 180).
- Ultima notte che termina nel giorno 8: segnalazione di intervallo fuori dalla settimana registrata.

## Privacy e risorse esterne
- Gli script locali esaminati non contengono chiamate a `fetch`, `XMLHttpRequest`, `sendBeacon` o `WebSocket`; i dati del Diario sono trattati localmente salvo azioni manuali di esportazione/condivisione.
- Nel markup HTML sono state individuate risorse remote: `cdnjs.cloudflare.com` (GSAP e ScrollTrigger nella landing Assetto Biologico™), e `www.dormirefacile.com/images/book_cover.webp` (copertina libro su più pagine). Sono già menzionate nella bozza Privacy/Cookie.
- Provider di hosting: GitHub Pages. La raccolta IP visitatori per sicurezza è dichiarata dal fornitore; la conservazione specifica e gli eventuali cookie effettivi restano da verificare.
- Recapito confermato dal titolare: **Roberto Boscia, Via Siciliano 45, 84014 Nocera Inferiore (SA)**.
- L'indirizzo professionale email è rimandato: moduli di contatto sul portale in sviluppo sospesi e nessun invio fittizio.

## Cosa NON è stato verificato con questi test
- Avvio reale degli script in una pagina resa da Chromium/Safari/Firefox con tutti i file e risorse effettivamente caricati.
- Interazione tattile e impaginazione visuale su iPhone/Android e desktop, ridimensionamento, screenshot e misure Core Web Vitals.
- Comportamento reale dei download CSV e di Web Share API/posta su sistemi operativi differenti, e permessi del browser relativi a `localStorage`.
- Network trace, cookie jar, richieste CDN e risposta degli header HTTP in sessione nuova/incognito.
- Verifica specialistica di sicurezza, accessibilità WCAG completa, qualità scientifica ed effettiva conformità normativa del trattamento.

## Gate per la pubblicazione
- **Non pubblicare il portale** finché non sarà stata fatta almeno una prova integrata sul portale reso in browser e sulla versione mobile, e non saranno stati gestiti i blocchi precedenti.
- **Non riattivare il contatto** finché la casella professionale non sarà stata creata e testata con consegna reale.
- **Non confondere gli esiti statici con una certificazione** di usabilità, protezione dei dati o conformità legale.

Riferimenti interni: `AUDIT_SEO_FUNZIONALE_2026-10-26.md`, `PRIVACY_CHECKLIST_PREPUBBLICAZIONE_2026-10-26.md` e `RIPRENDI_DA_QUI_2026-10-25.md`.
