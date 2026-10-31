# La mappa del tuo benessere — checklist di revisione
**Stato: BOZZA. Non unire questa PR in `main` prima dell'approvazione del PDF definitivo.**

## Fonte autorizzata
Questionari_solo_domande_risposte_si_no(2).docx, integrato con il testo inglese ACE/PSS fornito dal committente il 31/10/2026:
- 15 sezioni con risposte Sì / No.
- Appendice A: ACE (10 domande).
- Appendice B: PSS (10 domande con 0–4 e inversione dei quesiti 4, 5, 7, 8).

## Lavoro implementato
- Nuova pagina `/autovalutazione/` conforme al copy, senza raccolta dati sanitari.
- Nuovo menu dopo «Il metodo», homepage e sezioni principali comprese.
- Homepage: nuova sezione immediatamente dopo la hero esistente, immutata.
- Pulsanti PDF deliberatamente non abilitati **finché il documento non viene approvato**.
- Responsive e test automatici su Playwright inclusi.

## Blocchi per la pubblicazione
1. **Risolto in bozza:** l'appendice ACE ora ha il testo integrale italiano delle domande 1–5 e 7. La PSS è stata verificata, inclusa la correzione dell'item 8 («avere la situazione sotto controllo»). Restano necessarie la revisione professionale della traduzione e l'approvazione editoriale.
2. Eliminare dalle istruzioni pubbliche ogni associazione fra % di risposte Sì e stato di salute, nonché i suggerimenti automatici «segui il programma» / «test specifici» basati su soglie non validate.
3. Verificare scientificamente la formulazione e il raggruppamento delle domande (per esempio sezioni Vitamina D, tiroide, resistenza all'insulina) prima della diffusione al pubblico.
4. Verificare le istruzioni PSS e i diritti/attribuzioni della versione italiana eventualmente distribuita.
5. Approvare PDF definitivo e aggiungerlo come `autovalutazione/la-mappa-del-tuo-benessere-roberto-boscia.pdf` (oppure altro percorso stabile), **solo allora** sostituire i pulsanti in pagina con link di download e togliere `noindex`.
6. Prima del merge: test del download, dei menu su smartphone, del layout e dei link interni. Aggiornare la sitemap includendo `/autovalutazione/`.

Il PDF aggiornato «La_mappa_del_tuo_benessere_BOZZA_ACE_PSS_integrati.pdf» e il Word «La_mappa_del_tuo_benessere_Questionario_integrato_ACE_PSS.docx» sono stati preparati in chat il 31/10/2026. I documenti non sono caricati nel sito e non contengono risposte personali. La bozza PDF include 15 sezioni invariate e due appendici in italiano; è intenzionalmente marcata da revisione. Le percentuali dei questionari principali restano frequenze descrittive, non classificazioni cliniche.
