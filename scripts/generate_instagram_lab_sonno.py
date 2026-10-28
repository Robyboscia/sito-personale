from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
D=Path('assets/social/laboratorio-sonno')
D.mkdir(parents=True,exist_ok=True)
W,H=1080,1350
NAVY='#102F3A';NAVY2='#18434C';CREAM='#F8F6EF';PAPER='#FEFCF6';GOLD='#D7A653';GOLDL='#E8C98E';INK='#173944';MUTED='#536D70';GREEN='#4A8A7F';BORDER='#C9D8D1'
font_ser='/usr/share/fonts/truetype/ebgaramond/EBGaramond12-Regular.ttf'
font_ital='/usr/share/fonts/truetype/ebgaramond/EBGaramond12-Italic.ttf'
font_ser_b='/usr/share/fonts/truetype/ebgaramond/EBGaramond12-Bold.ttf'
font_sans='/usr/share/fonts/opentype/inter/InterDisplay-Regular.otf'
font_bold='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
font_med='/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf'
def ft(sz,f='sans'):
 return ImageFont.truetype({'ser':font_ser,'ital':font_ital,'sb':font_ser_b,'sans':font_sans,'bold':font_bold,'med':font_med}[f],sz)
def tw(d,s,f):return d.textbbox((0,0),s,font=f)[2]
def draw_text(d,s,x,y,font,col,spacing=0):d.text((x,y),s,font=font,fill=col,spacing=spacing,anchor='lt')
def wrap(d,s,maxw,font):
 result=[]
 for para in s.split('\n'):
  if not para:result.append('');continue
  current=''
  for word in para.split(' '):
   candidate=word if not current else current+' '+word
   if tw(d,candidate,font)>maxw and current:result.append(current);current=word
   else:current=candidate
  result.append(current)
 return result
def wrapped(d,s,x,y,maxw,font,col,line=1.25):
 lines=wrap(d,s,maxw,font);dy=round(font.size*line)
 for l in lines:draw_text(d,l,x,y,font,col);y+=dy
 return y
def label(d,s,x,y,col=GOLD,sz=24):draw_text(d,s.upper(),x,y,ft(sz,'bold'),col)
def rule(d,x1,y,x2,color=BORDER,w=2):d.line((x1,y,x2,y),fill=color,width=w)
def base(dark=False):
 im=Image.new('RGB',(W,H),NAVY if dark else CREAM)
 return im,ImageDraw.Draw(im)
def header(d,index,total=7,dark=False):
 color=GOLDL if dark else NAVY
 d.rounded_rectangle((83,73,146,136),radius=16,outline=color,width=3)
 f=ft(38,'sb');draw_text(d,'RB',96,82,f,color)
 label(d,'DOTT. ROBERTO BOSCIA',172,87,color,24)
 rule(d,84,165,996,'#40626A' if dark else '#D2D9D0',2)
 draw_text(d,f'{index:02d} / {total:02d}',860,84,ft(24,'med'),color)
def footer(d,i,dark=False):
 col='#C9D9D2' if dark else MUTED
 rule(d,84,1235,996,'#476771' if dark else '#C8D6CB',2)
 draw_text(d,'DRROBERTOBOSCIA.COM',85,1262,ft(21,'bold'),col)
 for t in range(7):
  d.ellipse((805+t*28,1273,817+t*28,1285), fill=GOLD if t==i-1 else ('#55747A' if dark else '#D0D9D0'))
def pill(d,text,x,y,bg,fg,rad=18,padx=24,pady=16,sz=25):
 f=ft(sz,'bold');w=tw(d,text,f)+padx*2;h=sz+2*pady+8
 d.rounded_rectangle((x,y,x+w,y+h),radius=rad,fill=bg)
 draw_text(d,text,x+padx,y+pady-2,f,fg)
 return w,h
def draw_moon(d,cx,cy,r,fill):
 d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=fill)
 d.ellipse((cx-r+40,cy-r-36,cx+r+40,cy+r-36),fill=NAVY)
def save(im,i):
 path=D/f'{i:02d}_carosello_sonno.png';im.save(path,'PNG',optimize=True);return path

im,d=base(True);header(d,1,7,True)
d.ellipse((570,310,1260,1000),outline='#355A60',width=3)
d.ellipse((660,410,1200,950),outline='#476F72',width=3)
draw_moon(d,881,585,136,GOLD)
label(d,'IL LABORATORIO DEL SONNO',85,265,GOLDL,24)
draw_text(d,'DORMI.',80,352,ft(146,'sb'),CREAM)
draw_text(d,'MA SAI',80,506,ft(135,'ital'),GOLDL)
draw_text(d,'COME?',80,652,ft(142,'sb'),CREAM)
wrapped(d,'9 risorse gratuite per conoscere meglio il tuo sonno.',87,917,840,ft(46,'med'),CREAM,1.32)
footer(d,1,True);save(im,1)

im,d=base();header(d,2)
label(d,'PARTIAMO DA UNA DOMANDA',84,256,NAVY)
draw_text(d,'8 ORE',78,345,ft(150,'sb'),INK)
draw_text(d,'DI SONNO.',86,508,ft(109,'sb'),INK)
draw_text(d,'ENERGIA DA',88,665,ft(77,'ital'),MUTED)
draw_text(d,'ZOMBIE?',79,755,ft(123,'sb'),NAVY)
d.rounded_rectangle((85,963,994,1160),radius=28,fill='#E8EEE8')
draw_text(d,'Le ore non raccontano',124,989,ft(42,'med'),INK)
draw_text(d,'tutta la storia.',124,1055,ft(52,'bold'),INK)
footer(d,2);save(im,2)

im,d=base(True);header(d,3,7,True)
label(d,'STRUMENTI GRATUITI 01 / 02',83,250,GOLD)
draw_text(d,'FAI DUE',82,302,ft(112,'sb'),CREAM)
draw_text(d,'CONTROLLI.',82,428,ft(112,'sb'),GOLDL)
for y,n,title,txt in [(623,'01','CHECK-UP DEL SONNO','12 domande e un report educativo.'),(891,'02','CALCOLATORE DELLA CAFFEINA','Tre scenari teorici per capire quanto potrebbe restarne quando vai a dormire.')]:
 d.rounded_rectangle((82,y,995,y+235),radius=25,fill='#214954',outline='#527478',width=2)
 d.rounded_rectangle((108,y+25,185,y+104),radius=20,fill=GOLD)
 draw_text(d,n,122,y+43,ft(31,'bold'),NAVY)
 draw_text(d,title,206,y+34,ft(34,'bold'),CREAM)
 wrapped(d,txt,206,y+103,752,ft(29,'sans'),'#E4EFEB',1.3)
footer(d,3,True);save(im,3)

im,d=base();header(d,4)
label(d,'OSSERVA. REGISTRA. CAPISCI.',84,254,NAVY)
draw_text(d,'NON AFFIDARTI',81,320,ft(99,'sb'),INK)
draw_text(d,'ALLA MEMORIA.',81,439,ft(110,'ital'),GREEN)
d.line((128,665,128,1099),fill='#A3BEB6',width=6)
for y,num,title,body in [(677,'14','DIARIO DEL SONNO','14 notti, orari e qualità percepita.'),(944,'24','TURNI & SONNO','Una settimana per chi lavora mentre altri dormono.')]:
 d.ellipse((93,y,163,y+70),fill=NAVY)
 draw_text(d,num,107,y+14,ft(31,'bold'),CREAM)
 draw_text(d,title,197,y-8,ft(42,'bold'),INK)
 wrapped(d,body,198,y+67,770,ft(34,'sans'),MUTED,1.33)
footer(d,4);save(im,4)

im,d=base(True);header(d,5,7,True)
label(d,'NOVITÀ IN PROVA GRATUITA',85,248,GOLDL)
draw_text(d,'DIARIO',81,319,ft(117,'sb'),CREAM)
draw_text(d,'DEL SONNO',81,445,ft(111,'sb'),CREAM)
draw_text(d,'PRO.',78,578,ft(180,'ital'),GOLDL)
rule(d,85,812,992,'#47666C',3)
for y,txt in [(868,'FINO A 90 NOTTI'),(944,'GRAFICI, ENERGIA E ABITUDINI'),(1020,'CONFRONTI + 12 MICROLEZIONI')]:
 d.ellipse((87,y+12,102,y+27),fill=GOLD)
 draw_text(d,txt,127,y,ft(31,'bold'),CREAM)
pill(d,'ORA IN PROVA GRATUITA',86,1124,GOLD,NAVY,sz=24)
footer(d,5,True);save(im,5)

im,d=base();header(d,6)
label(d,'L’ACCADEMIA DEL SONNO',84,255,NAVY)
draw_text(d,'LA SCIENZA,',79,331,ft(119,'sb'),INK)
draw_text(d,'SENZA IL',82,470,ft(113,'ital'),GREEN)
draw_text(d,'FUMO.',81,605,ft(137,'sb'),INK)
d.rounded_rectangle((84,850,997,1144),radius=26,fill='#E5EDE8')
draw_text(d,'03',114,892,ft(82,'sb'),NAVY)
wrapped(d,'GUIDE SU LUCE, RITMI, WEARABLE E DIARIO.',278,889,667,ft(31,'bold'),INK,1.35)
rule(d,114,1030,953,'#BBCFC5',2)
draw_text(d,'+ 1 DIARIO PDF DA STAMPARE',117,1060,ft(28,'bold'),INK)
footer(d,6);save(im,6)

im,d=base(True);header(d,7,7,True)
for rr in [235,340,450]:d.ellipse((700-rr,672-rr,700+rr,672+rr),outline='#24515B',width=3)
label(d,'PRONTI A OSSERVARE MEGLIO?',84,296,GOLDL)
draw_text(d,'9 RISORSE.',81,385,ft(135,'sb'),CREAM)
draw_text(d,'ZERO EURO.',81,546,ft(132,'sb'),GOLDL)
wrapped(d,'Il sonno non è un evento. È un processo.',84,755,900,ft(56,'ital'),CREAM,1.24)
d.rounded_rectangle((84,999,994,1140),radius=23,fill=GOLD)
draw_text(d,'ESPLORA IL LABORATORIO',116,1035,ft(35,'bold'),NAVY)
draw_text(d,'Salva questo carosello.',89,1168,ft(24,'med'),'#CBDCD8')
footer(d,7,True);save(im,7)
print('Creati 7 PNG originali',*[str(x) for x in sorted(D.glob('*.png'))])
