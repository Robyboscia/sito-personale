#!/usr/bin/env python3
"""Build the public, printable orientation-only PDF from the reviewed Italian source text."""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
source = root / "autovalutazione/source/questionari_15_ace_pss.txt"
target = root / "autovalutazione/la-mappa-del-tuo-benessere-roberto-boscia.pdf"
raw = source.read_text(encoding="utf-8")
patt = re.compile(r"(?m)^(0[1-9]|1[0-5]) · ([^\n]+)$|^(Appendice [AB]) · ([^\n]+)$")
titles = list(patt.finditer(raw))
assert len(titles) == 17, f"Expected 15 sections + 2 appendices, got {len(titles)}"
expected = [27,20,20,27,26,14,11,23,15,17,18,24,23,13,30,10,10]
sections = []
rowpatt = re.compile(r"(?m)^[ \t]*(\d{1,2})[ \t]*\n[ \t]*(.+?)[ \t]*\n[ \t]*(?:☐ Sì[ \t]*☐ No|_{4,})[ \t]*$")
for idx, match in enumerate(titles):
    text = raw[match.end():titles[idx+1].start() if idx+1 < len(titles) else len(raw)]
    questions = [q.strip() for _, q in rowpatt.findall(text)]
    if len(questions) != expected[idx]:
        raise ValueError(f"Section {idx+1} '{match.group(2) or match.group(4)}': expected {expected[idx]} questions, found {len(questions)}")
    sections.append((match.group(2) or match.group(4), questions))
assert sections[15][1][0].startswith("Prima dei 18 anni")
assert "situazione sotto controllo" in sections[16][1][7]

fonts = "/usr/share/fonts/truetype/dejavu/"
for name, file in (("Sans","DejaVuSans.ttf"),("SansB","DejaVuSans-Bold.ttf"),("Serif","DejaVuSerif.ttf")):
    pdfmetrics.registerFont(TTFont(name, fonts+file))
NAVY=HexColor("#102F3A"); GOLD=HexColor("#B7894C"); CREAM=HexColor("#F8F6EF")
LINE=HexColor("#D4DED8"); MUTED=HexColor("#52686E"); WHITE=colors.white
styles={
 "eyebrow":ParagraphStyle("eyebrow",fontName="SansB",fontSize=9,leading=14,textColor=GOLD,spaceAfter=10),
 "title":ParagraphStyle("title",fontName="Serif",fontSize=31,leading=39,textColor=NAVY,spaceAfter=17),
 "h2":ParagraphStyle("h2",fontName="Serif",fontSize=20,leading=25,textColor=NAVY,spaceAfter=12),
 "body":ParagraphStyle("body",fontName="Sans",fontSize=9.7,leading=15.2,textColor=NAVY,spaceAfter=9),
 "small":ParagraphStyle("small",fontName="Sans",fontSize=8.1,leading=12.7,textColor=MUTED,spaceAfter=8),
 "table":ParagraphStyle("table",fontName="Sans",fontSize=8.8,leading=13.5,textColor=NAVY),
 "ace":ParagraphStyle("ace",fontName="Sans",fontSize=7.6,leading=10.8,textColor=NAVY),
 "head":ParagraphStyle("head",fontName="SansB",fontSize=8,leading=11,textColor=WHITE),
 "num":ParagraphStyle("num",fontName="SansB",fontSize=8.4,leading=12,textColor=NAVY),
 "check":ParagraphStyle("check",fontName="Sans",fontSize=8,leading=11,textColor=NAVY,alignment=TA_CENTER),
}
def P(text, kind="body"):
    return Paragraph(escape(text).replace("\n","<br/>"),styles[kind])

class PDF(SimpleDocTemplate):
    def afterPage(self):
        c=self.canv;w,h=A4
        c.saveState()
        c.setFillColor(NAVY);c.rect(0,h-12,w,12,fill=1,stroke=0)
        c.setFillColor(MUTED);c.setFont("SansB",7)
        c.drawString(44,28,"LA MAPPA DEL TUO BENESSERE · DR. ROBERTO BOSCIA")
        c.drawRightString(w-44,28,str(c.getPageNumber()).zfill(2))
        c.restoreState()

pdf=PDF(str(target),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=48,bottomMargin=53,
        title="La mappa del tuo benessere — 15 questionari orientativi",author="Dr. Roberto Boscia")
story=[Spacer(1,48),P("RISORSA GRATUITA · QUESTIONARI ORIENTATIVI","eyebrow"),Spacer(1,10),
       P("LA MAPPA DEL\nTUO BENESSERE","title"),
       P("15 questionari per osservare sintomi, esperienze e abitudini e individuare possibili direzioni da approfondire.","body"),
       Spacer(1,20),HRFlowable(width="100%",thickness=3,color=GOLD),
       Spacer(1,32),P("Dr. Roberto Boscia","h2"),
       P("Uno strumento per mettere ordine nelle osservazioni, non per diagnosticare malattie o carenze.","body"),
       Spacer(1,45),P("I questionari principali non sono test clinicamente validati per misurare le funzioni degli organi, le carenze nutrizionali o lo stato di salute. Le associazioni fra singoli sintomi e aree tematiche sono esplorative. Non modificare terapie né richiedere esami soltanto sulla base delle risposte.","small"),
       PageBreak()]

story += [P("PRIMA DI INIZIARE","eyebrow"),P("Come utilizzare la mappa","title"),
          P("Scegli liberamente una o più aree. Per le sezioni 01–15 seleziona Sì se riconosci l'affermazione nella tua esperienza, altrimenti No. Puoi lasciare in sospeso un quesito se non sai rispondere.","body"),
          P("Se ti è utile, conta le risposte Sì della singola sezione, oppure calcolane la percentuale. Questi valori indicano unicamente quante affermazioni hai selezionato: NON corrispondono a gravità, stato di salute o probabilità di malattia. Non esistono soglie cliniche validate per i 15 questionari.","body"),
          P("Alcune condizioni citate richiedono una valutazione indipendente dal questionario. Non rimandare un confronto con un professionista sanitario in presenza di sintomi importanti, persistenti o in peggioramento.","small"),
          P("ACE e PSS sono in due appendici distinte: hanno domande e metodi di conteggio propri e non devono essere trattati come percentuali delle 15 sezioni.","body"),
          Spacer(1,14),P("Indice dei questionari","h2")]
for i,(name,_) in enumerate(sections):
    label = f"{i+1:02d} · {name}" if i<15 else f"Appendice {'A' if i==15 else 'B'} · {name}"
    story.append(P(label,"small"))
story.append(PageBreak())
for i,(name,questions) in enumerate(sections):
    if i<15:
        story.extend([P(f"QUESTIONARIO {i+1:02d}","eyebrow"),P(name,"h2"),
          P("Indica Sì oppure No per ogni affermazione. Le domande sono riportate dal materiale originale; non consentono da sole di attribuire una causa ai sintomi riferiti.","small")])
    elif i==15:
        story.extend([P("APPENDICE A","eyebrow"),P("Esperienze avverse nell'infanzia (ACE)","h2"),
          P("Riferisciti alle esperienze precedenti ai 18 anni. Sì vale un punto, fino a 10. Puoi scegliere di non rispondere a qualsiasi domanda: in tal caso non calcolare un totale come se fosse un No.","body"),
          P("Le esperienze descritte possono essere delicate. Il punteggio non predice la salute di una persona né considera sostegno sociale, fattori protettivi e altre esperienze fuori dalla famiglia.","small")])
    else:
        story.extend([P("APPENDICE B","eyebrow"),P("Scala dello stress percepito (PSS-10)","h2"),
          P("Rispondi pensando all'ultimo mese: 0 = mai; 1 = quasi mai; 2 = qualche volta; 3 = abbastanza spesso; 4 = molto spesso.","body"),
          P("Per il totale inverti le risposte agli item 4, 5, 7 e 8 (0↔4, 1↔3, 2 resta 2), quindi somma tutti gli item. Il punteggio va da 0 a 40 e indica il livello di stress riferito, non un parametro biologico né una diagnosi.","body"),
          P("Nel testo fornito sono indicate fasce descrittive di 0–13, 14–26 e 27–40. Non sono soglie diagnostiche; per interpretare risultati personali serve considerare il contesto.","small")])
    values=[[P("N.","head"),P("Domanda / affermazione","head"),P("0–4" if i==16 else "Sì / No","head")]]
    for n,q in enumerate(questions,1):
        values.append([P(str(n),"num"),P(q,"ace" if i==15 else "table"),
                       P("_______" if i==16 else "□ Sì   □ No","check")])
    table=Table(values,colWidths=[32,397,77],repeatRows=1,hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,CREAM]),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("LINEBELOW",(0,0),(-1,0),1,GOLD),
        ("LINEBELOW",(0,1),(-1,-1),0.35,LINE),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,0),10),("BOTTOMPADDING",(0,0),(-1,0),9),
        ("TOPPADDING",(0,1),(-1,-1),4 if i==15 else 7),
        ("BOTTOMPADDING",(0,1),(-1,-1),4 if i==15 else 7),
    ]))
    story.append(table);story.append(Spacer(1,14))
    if i<15:
        story.append(P(f"Totale risposte Sì: ______ / {len(questions)}    Frequenza descrittiva: ______ %","body"))
    elif i==15:
        story.extend([P("Somma ACE (solo se tutte le risposte sono presenti): ______ / 10","body"),
            P("Un numero di esperienze più alto è associato, in studi di popolazione, a maggiori difficoltà psicosociali e di salute. Non determina un esito individuale: anche fattori protettivi, opportunità e supporto hanno importanza. I quesiti non considerano tutte le avversità possibili.","small")])
    else:
        story.extend([P("Somma PSS (dopo inversione delle domande 4, 5, 7, 8): ______ / 40","body"),
            P("Persone con situazioni simili possono percepire il proprio stress in modi differenti. Il risultato non indica da solo la necessità di esami o trattamenti.","small")])
    story.append(PageBreak())
story.extend([P("PER RIFLETTERE","eyebrow"),P("Le tue osservazioni","title"),
    P("Utilizza questo spazio per annotare ciò che noti e cosa desideri approfondire. Una risposta positiva è un'indicazione da contestualizzare, non una conclusione.","body")])
for question in ["Quali segnali o abitudini vorresti approfondire?","Quando si presentano (orario, circostanza, frequenza)?",
                 "Quali fattori sembrano precedere o accompagnare il disturbo?","Quali domande vorresti porre al professionista sanitario?"]:
    story.append(P(question,"body"))
    for _ in range(3):story.append(HRFlowable(width="100%",thickness=.7,color=LINE,spaceBefore=14,spaceAfter=12))
story.extend([Spacer(1,18),P("Materiale informativo ed orientativo, privo di validazione diagnostica. Non sostituisce il giudizio del professionista sanitario né la valutazione di situazioni urgenti.","small"),
              P("Dr. Roberto Boscia · drrobertoboscia.com","small")])
pdf.build(story)
print(f"CREATED {target} ({target.stat().st_size} bytes); verified sections: {[len(q) for _,q in sections]}")
