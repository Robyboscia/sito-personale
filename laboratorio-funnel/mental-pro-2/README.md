# Mental Pro 2.0 + Dashboard — prototipo autonomo
**Stato: demo privata, non ecommerce.** Nessuna parte di questi file viene distribuita sui siti pubblici. Si trova esclusivamente nel ramo GitHub `prototype/funnel-separati-2026`, pull request #26 non unita.

## Apri le due anteprime
- `index.html` — pagina cliente: presentazione Mental Pro, acquisto simulato, upsell A/B, downsell D, riepilogo.
- `admin.html` — pannello demo: modifica tutti i testi, prezzi, quantità, pulsanti, abilita/disabilita offerte, riordina A/B.
- Entrambe devono essere servite **dallo stesso dominio e protocollo**. I dati viaggiano solo in `localStorage` del browser, mai su un server.
- Su iPhone usa la stessa scheda/browser per entrambe le pagine. Modalità navigazione privata o cambi di browser possono cancellare le modifiche. Nessuna sincronizzazione tra dispositivi.

## Percorso base (configurazione iniziale)
| Scelta | Quantità aggiunta | Supplemento | Totale e quantità |
|---|---:|---:|---|
| Iniziale | 1 | 47 € | 47 € · 1 confezione |
| Accetta upsell A | +2 | +70 € | 117 € · 3 confezioni |
| Accetta upsell B dopo A | +3 | +105 € | 222 € · 6 confezioni |
| Rifiuta A, accetta downsell D | +1 | +47 € | 94 € · 2 confezioni |
| Rifiuta entrambi | 0 | 0 € | 47 € · 1 confezione |

Prezzi **esclusivamente simulati**. Se l'ordine degli upsell è invertito, la simulazione calcola nuovamente i prezzi medi e i risparmi in modo dinamico. Il risparmio rispetto all'acquisto delle stesse confezioni al prezzo unitario di partenza appare solo quando è realmente maggiore di zero. I supplementi sono incrementali, non sostituiscono il prezzo già presente nel riepilogo.

## Dashboard
1. Apri `admin.html`, modifica i campi e clicca **Salva le modifiche**.
2. Clicca **Apri la prova cliente** per visualizzare il funnel aggiornato.
3. **Salva e apri la prova** salva e passa direttamente alla pagina cliente.
4. Cambia l'ordine A/B tramite la tendina e attiva/disattiva ogni offerta con il checkbox.
5. Il pulsante **Mostra JSON** esporta una configurazione leggibile. **Importa JSON** carica i testi/prezzi già salvati altrove, dopo conferma. **Ripristina** torna ai valori iniziali.
6. Il pannello statistiche mostra **solo clic realmente eseguiti nelle simulazioni nel browser corrente**. Nessun numero inventato, nessun incasso reale, nessun dato di clienti.
7. In modalità demo non esiste autenticazione vera. Non usare questa dashboard per dati commerciali riservati o per abilitare vendite. La versione produzione richiederà login, autorizzazioni e database server-side.

## Sicurezza e restrizioni
- Niente Stripe, carte, clienti, email, indirizzi, form di pagamento, chiamate API esterne, pixel o tracking di marketing.
- Solo HTML/CSS/JS statici; prodotti illustrati in CSS e marcati come **immagine stilizzata**, non come fotografia ufficiale.
- Il browser salva gli eventi delle simulazioni senza dati personali, fino agli ultimi 500 eventi per limitare l'uso dello spazio locale. Se sono bloccati i salvataggi locali, alcune funzioni della dashboard non sono disponibili.
- La validazione limita prezzi tra 1 e 3.000 € (base 1.000), quantità aggiunte da 1 a 20, testi con lunghezza limitata. Non confondere tali limiti demo con regole fiscali o commerciali.
- Gli eventuali claim dei contenuti modificati nella dashboard **non vengono validati** sul piano medico o legale; verificare copy e documentazione prima dell'uso reale.
- L'URL raw.githack.com è un'**anteprima tecnica temporanea** per testing. Non è un dominio checkout controllato, non va usato per raccogliere pagamenti o dati personali.

## Collaudo
Test automatico browser in `scripts/mental-pro-2-qa.cjs`, eseguito dal workflow PR:
- 390 px mobile (funnel e dashboard), oltre a screenshot desktop;
- 47→117→222 €, rifiuto primo upsell→downsell 94 €;
- salvataggio e riapertura tra pagine, inversione A/B, disattivazione downsell;
- esportazione/importazione, validazione input, statistiche demo e nessuna chiamata a servizi esterni.
