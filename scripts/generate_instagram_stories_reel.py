from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import subprocess,math,wave
from array import array
OUT=Path('assets/social/stories-reel')
OUT.mkdir(parents=True,exist_ok=True)
W,H=1080,1920
NAVY='#102F3A';GOLD='#D7A653';GOLD2='#F0CF91';IVORY='#F8F6EF';MUTED='#BFD1D1';INK='#1C444C';JADE='#3F8F85';TEAL='#86C1B5'
def fc(family,style):return subprocess.check_output(['fc-match','-f','%{file}',family+':style='+style],text=True).strip()
FONTS={'bold':fc('Inter','Bold'),'regular':fc('Inter','Regular'),'medium':fc('Inter','Medium'),'serif':fc('EB Garamond','Regular'),'italic':fc('EB Garamond','Italic'),'serifbold':fc('EB Garamond','Bold')}
def font(size,f='bold'):return ImageFont.truetype(FONTS[f],size)
def text(d,x,y,s,size=50,color=IVORY,face='bold',anchor='lt'):d.text((x,y),s,fill=color,font=font(size,face),anchor=anchor)
def width(d,s,size,face='bold'):return d.textbbox((0,0),s,font=font(size,face))[2]
def line_text(d,s,x,y,maxw,size=50,line_height=1.28,color=IVORY,face='regular'):
 words=s.split();rows=[];row=''
 for word in words:
  cand=(row+' '+word).strip()
  if row and width(d,cand,size,face)>maxw:rows.append(row);row=word
  else:row=cand
 if row:rows.append(row)
 for t in rows:text(d,x,y,t,size,color,face);y+=round(size*line_height)
 return y
def base(light=False):
 im=Image.new('RGB',(W,H),IVORY if light else NAVY)
 return im,ImageDraw.Draw(im)
def top(d,n,light=False,kind='STORIE'):
 col=NAVY if light else GOLD2
 text(d,88,190,'DOTT. ROBERTO BOSCIA',27,col,'bold')
 text(d,993,195,f'{n:02d}/03' if kind=='STORIE' else 'REEL',21,col,'medium','rt')
 d.line((88,254,992,254),fill='#BACFC7' if light else '#3E6870',width=3)
def bottom(d,light=False):
 col=NAVY if light else GOLD2
 d.line((88,1665,992,1665),fill='#BACFC7' if light else '#4C7378',width=3)
 text(d,89,1700,'DRROBERTOBOSCIA.COM',25,col,'bold')
 text(d,89,1760,'IL SONNO NON È UN EVENTO. È UN PROCESSO.',19,NAVY if light else MUTED,'medium')
def capsule(d,s,y,light=False):
 f=font(28,'bold');tw=d.textbbox((0,0),s,font=f)[2];x=89
 d.rounded_rectangle((x,y,x+tw+58,y+75),radius=23,fill=NAVY if light else GOLD)
 text(d,x+29,y+19,s,28,IVORY if light else NAVY,'bold')
def moon(d,cx,cy,r=145,light=False):
 d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=NAVY if light else GOLD)
 d.ellipse((cx-r+43,cy-r-49,cx+r+43,cy+r-49),fill=IVORY if light else NAVY)
 for px,py,rad in [(cx-190,cy-140,4),(cx+175,cy+85,6),(cx+172,cy-205,4)]:
  d.ellipse((px-rad,py-rad,px+rad,py+rad),fill=GOLD if light else IVORY)
def chart(d,x,y,w,h,light=False):
 grid='#B7CAC2' if light else '#42616A';bar=JADE if light else TEAL
 for row in range(4):d.line((x,y+h*row/3,x+w,y+h*row/3),fill=grid,width=2)
 vals=[.40,.68,.55,.80,.48,.72,.90,.62,.75,.49,.84,.67];bw=w/(len(vals)*1.7)
 for i,v in enumerate(vals):
  xx=x+(i+.25)*w/len(vals);yy=y+h-h*v
  d.rounded_rectangle((xx,yy,xx+bw,y+h),radius=8,fill=GOLD if i in (0,6,9) else bar)
def coffee(d,cx,cy,light=False):
 col=NAVY if light else GOLD2
 d.rounded_rectangle((cx-140,cy-75,cx+110,cy+135),radius=20,outline=col,width=11)
 d.arc((cx+70,cy-50,cx+215,cy+90),-100,110,fill=col,width=11)
 d.line((cx-185,cy+170,cx+180,cy+170),fill=col,width=11)
 for xx in [cx-100,cx-10,cx+80]:d.arc((xx-30,cy-220,xx+25,cy-90),190,340,fill=JADE if light else MUTED,width=6)
def save(im,name):im.save(OUT/name,'PNG',optimize=True)
im,d=base();top(d,1)
text(d,87,328,'DORMI 8 ORE.',113,IVORY,'serifbold')
text(d,87,458,'E TI SVEGLI',100,IVORY,'serifbold')
text(d,86,578,'UNO ZOMBIE?',91,GOLD2,'serifbold')
moon(d,838,922,170)
text(d,90,1120,'Il sonno non è soltanto',56,IVORY,'regular')
text(d,90,1193,'una questione di ore.',56,IVORY,'regular')
line_text(d,'Ritmi, regolarità e abitudini possono raccontare molto di più.',90,1310,860,47,1.35,MUTED)
capsule(d,'9 RISORSE GRATUITE',1535);bottom(d);save(im,'storia_01.png')
im,d=base(True);top(d,2,True)
text(d,87,323,'QUEL CAFFÈ',107,INK,'serifbold');text(d,87,448,'DELLE 17:00?',116,INK,'serifbold')
coffee(d,724,882,True)
text(d,90,1120,'Quanto potrebbe',61,INK,'serifbold')
text(d,90,1196,'esserne rimasto',61,INK,'serifbold')
text(d,90,1270,'quando vai a letto?',61,INK,'serifbold')
line_text(d,'Prova il calcolatore con tre scenari illustrativi. Nessuna misura nel sangue, niente diagnosi.',90,1420,860,32,1.4,'#45636C')
capsule(d,'CALCOLATORE GRATUITO',1535,True);bottom(d,True);save(im,'storia_02.png')
im,d=base();top(d,3)
text(d,87,320,'LA MAPPA',120,IVORY,'serifbold')
text(d,87,442,'DEL TUO',120,IVORY,'serifbold')
text(d,87,565,'SONNO.',130,GOLD2,'serifbold')
chart(d,90,824,895,315)
for i,(tag,s) in enumerate([('01','Check-up del Sonno'),('02','Diario di 14 notti'),('03','Diario PRO in prova gratuita')]):
 yy=1250+i*83;text(d,92,yy,tag,35,GOLD2);text(d,174,yy,s,38,IVORY,'medium')
d.rounded_rectangle((83,1520,996,1620),radius=21,fill=GOLD)
text(d,112,1549,'SCOPRILE SU DRROBERTOBOSCIA.COM',26,NAVY)
bottom(d);save(im,'storia_03.png')
def scene(i,kicker,light=False):
 im,d=base(light);top(d,i,light,'REEL');text(d,88,317,kicker,29,NAVY if light else GOLD2);return im,d
im,d=scene(1,'IL LABORATORIO DEL SONNO')
text(d,88,535,'8 ORE DI',138,IVORY,'serifbold');text(d,88,677,'SONNO.',155,IVORY,'serifbold')
text(d,88,853,'E TI SVEGLI',83,GOLD2,'serifbold');text(d,88,961,'UNO ZOMBIE?',91,GOLD2,'serifbold')
moon(d,830,1240,145);bottom(d);save(im,'reel_scene_01.png')
im,d=scene(2,'COSA CI DICE UN DIARIO',True)
text(d,89,542,'LE ORE',145,INK,'serifbold');text(d,89,698,'SONO SOLO',119,INK,'serifbold')
text(d,89,838,'UN PEZZO.',130,JADE,'serifbold')
for i,s in enumerate(['ORARI','REGOLARITÀ','ENERGIA','ABITUDINI']):
 yy=1152+i*100;text(d,103,yy,'0'+str(i+1),31,'#AB874E');text(d,184,yy,s,39,INK)
bottom(d,True);save(im,'reel_scene_02.png')
im,d=scene(3,'RISORSA GRATUITA 01')
text(d,88,530,'CHECK-UP',130,IVORY,'serifbold');text(d,88,676,'DEL SONNO.',124,GOLD2,'serifbold')
d.rounded_rectangle((87,950,989,1313),radius=36,fill='#214C55',outline='#4F777B',width=3)
text(d,127,1006,'12 DOMANDE',57,IVORY)
line_text(d,'Un primo quadro educativo delle tue abitudini e dei segnali da osservare.',127,1112,800,40,1.38,MUTED)
bottom(d);save(im,'reel_scene_03.png')
im,d=scene(4,'RISORSE GRATUITE 02 + 03',True)
text(d,87,490,'CAFFEINA',135,INK,'serifbold');text(d,87,630,'E RITMI.',145,JADE,'serifbold')
coffee(d,740,966,True)
text(d,89,1180,'CALCOLATORE',49,INK);text(d,89,1255,'+ DIARIO 14 NOTTI',49,INK)
line_text(d,'Per vedere gli andamenti, non per inventare diagnosi.',89,1370,855,35,1.38,'#4D6670')
bottom(d,True);save(im,'reel_scene_04.png')
im,d=scene(5,'LA NOVITÀ · IN PROVA GRATUITA')
text(d,86,512,'DIARIO',137,IVORY,'serifbold');text(d,86,667,'SONNO PRO.',119,GOLD2,'serifbold')
chart(d,95,962,882,242)
text(d,95,1282,'FINO A 90 NOTTI',43,IVORY);text(d,95,1364,'GRAFICI + ENERGIA',43,IVORY);text(d,95,1446,'12 MICROLEZIONI',43,IVORY)
bottom(d);save(im,'reel_scene_05.png')
im,d=scene(6,'ORA TOCCA A TE',True)
text(d,87,514,'9 RISORSE.',130,INK,'serifbold');text(d,87,660,'ZERO EURO.',135,JADE,'serifbold')
line_text(d,'Il sonno non è un evento. È un processo.',92,918,895,62,1.3,INK,'serif')
d.rounded_rectangle((84,1293,991,1426),radius=24,fill=NAVY)
text(d,112,1334,'DRROBERTOBOSCIA.COM',47,IVORY)
text(d,90,1491,'IL LABORATORIO DEL SONNO',30,INK)
bottom(d,True);save(im,'reel_scene_06.png')
rate=32000;duration=24.0;notes=[196.,246.94,293.66,220.,261.63,196.]
snd=array('h')
for i in range(int(duration*rate)):
 t=i/rate;note=notes[int(t/4)%len(notes)]
 env=min(1.,(t%0.5)/0.025)*math.exp(-((t%0.5)/0.5)*4)
 chord=math.sin(2*math.pi*note*t)*.27+math.sin(2*math.pi*note*1.5*t)*.1
 bass=math.sin(2*math.pi*note/2*t)*.17
 ping=math.sin(2*math.pi*note*2*t)*env*.08
 fade=min(1,t/.7,max(0,(duration-t)/1.6))
 snd.append(int(max(-1,min(1,(chord+bass+ping)*fade*.43))*32767))
with wave.open(str(OUT/'original_audio.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(snd.tobytes())
args=['ffmpeg','-hide_banner','-loglevel','error','-y']
for i in range(1,7):args+=['-loop','1','-framerate','24','-t','4','-i',str(OUT/f'reel_scene_{i:02d}.png')]
args+=['-i',str(OUT/'original_audio.wav')]
filters=[f'[{i}:v]scale=1080:1920,setsar=1,format=yuv420p[v{i}]' for i in range(6)]
last='v0'
for i in range(1,6):
 dest='x'+str(i);trans=['fade','wipeleft','fade','slideleft','fade'][i-1]
 filters.append(f'[{last}][v{i}]xfade=transition={trans}:duration=0.35:offset={3.65*i:.2f}[{dest}]');last=dest
args+=['-filter_complex',';'.join(filters),'-map',f'[{last}]','-map','6:a','-t','22.25','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','112k','-ar','44100','-movflags','+faststart',str(OUT/'reel_laboratorio_sonno.mp4')]
subprocess.run(args,check=True)
# Do not expose working sound or edit plates as additional social publications.
for file in list(OUT.glob('reel_scene_*.png'))+[OUT/'original_audio.wav']:file.unlink()
print('Rendered 3 stories + 22.25 sec reel:',[(p.name,p.stat().st_size) for p in sorted(OUT.iterdir())])
