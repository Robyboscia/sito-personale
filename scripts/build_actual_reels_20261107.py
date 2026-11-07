#!/usr/bin/env python3
"""Produce genuine 15-second multi-scene Instagram/Facebook Reels, no placeholder notes."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import io,json,os,subprocess,tempfile,urllib.request,math
root=Path(__file__).resolve().parents[1]
source=json.loads((root/"diagnostics/reel_originals_20261107.json").read_text(encoding="utf-8"))
out=root/"diagnostics/reels_final";out.mkdir(parents=True,exist_ok=True)
DARK=(7,13,25)
CYAN=(52,231,236)
GOLD=(232,186,103)
PINK=(218,53,163)
WHITE=(247,250,250)
MUTED=(174,200,202)
themes=[
("CYBERPUNK",[
("IL CERVELLO\nAPRE UNA RIUNIONE.","Vai a letto.\nIl resto di te vorrebbe dormire.","RIMUGINIO / SONNO"),
("NON ESISTE UN SOLO\nINTERRUTTORE.","Luce, orari, stress e abitudini\npossono intrecciarsi.","IL CONTESTO CONTA"),
("OSSERVA I SEGNALI.","Se il problema persiste,\nparlane con il medico.","COSA TI TIENE SVEGLIO?")]),
("GOLD",[
("SENZA MELATONINA.\nSENZA ERBE.","Non significa automaticamente\nadatto a tutti.","MENTAL pro"),
("PRIMA LA FORMULA.\nPOI LO SLOGAN.","Aminoacidi e minerali.\nMa contano anche le quantità.","NUTRACEUTICA / CRITERIO"),
("LEGGI L'ETICHETTA.","Composizione, dosi,\navvertenze. Sempre.","MENTALPRO.IT")]),
("CYBERPUNK",[
("«REGGO IL CAFFÈ\nALLE 17.»","Ottimo.\nMa non dice tutto.","CAFFEINA / SONNO"),
("TOLLERANZA NON È\nELIMINAZIONE.","La caffeina si elimina\ncon tempi variabili.","RITMI BIOLOGICI"),
("L'ORARIO CONTA.","Esplora scenari illustrativi,\nnon diagnosi.","DRROBERTOBOSCIA.COM")]),
("GOLD",[
("CAFFEINA:\nQUANTO NE RESTA?","La stima può cambiare\nmolto da persona a persona.","STRUMENTI GRATUITI"),
("TRE SCENARI.","Inserisci orari e quantità.\nConfronta ipotesi diverse.","LABORATORIO DEL SONNO"),
("NON È UN DOSAGGIO.","È un calcolatore educativo,\nnon una misura personale.","DRROBERTOBOSCIA.COM")]),
("CYBERPUNK",[
("UN ALTRO SEGRETO\nDI LONGEVITÀ?","Ne spunta uno nuovo\nogni settimana.","LONGEVITÀ / ABITUDINI"),
("SPOILER:\nLE ABITUDINI.","Sonno, movimento,\nalimentazione, regolarità.","LE BASI CONTANO"),
("MENO MITI.\nPIÙ CONTINUITÀ.","Non esiste una\nricetta universale.","TU DA COSA INIZI?")]),
("GOLD",[
("BIOHACKING.\nO MARKETING?","Costoso non significa\nnecessariamente efficace.","BIOHACKING / METODO"),
("TRE DOMANDE.","Cosa misura? Quali prove?\nÈ sostenibile davvero?","PENSIERO CRITICO"),
("GLI SLOGAN\nNON SONO STUDI.","Una bella promessa\nresta una promessa.","METODO > MODA")]),
("CYBERPUNK",[
("DUE DECIMALI.\nZERO CERTEZZE?","La precisione sullo schermo\nnon racconta tutta la storia.","DATI / CONTESTO"),
("BIA. PPG.\nQUESTIONARI.","Strumenti diversi,\ninformazioni diverse.","OGNI METRICA HA LIMITI"),
("PRIMA IL CONTESTO.","I dati orientano domande,\nnon diagnosi.","DRROBERTOBOSCIA.COM")])
]
assert len(themes)==len(source)
fontBase="/usr/share/fonts/truetype/dejavu/"
def font(bold,size):return ImageFont.truetype(fontBase+("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"),size)
def blend(a,b,t):return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def card(mode,parts,scene):
 title,desc,kicker=parts
 accent=CYAN if mode=="CYBERPUNK" else GOLD
 alt=PINK if mode=="CYBERPUNK" else (170,117,53)
 W,H=1080,1920
 im=Image.new("RGB",(W,H),DARK)
 gd=ImageDraw.Draw(im)
 for y in range(H):
  base=blend((9,20,32) if mode=="CYBERPUNK" else (20,14,27),(4,11,20),y/H)
  gd.line((0,y,W,y),fill=base)
 glow=Image.new("RGBA",(W,H),(0,0,0,0))
 ImageDraw.Draw(glow).ellipse((250,-60,1470,1420),fill=(*alt,55))
 glow=glow.filter(ImageFilter.GaussianBlur(210))
 im=Image.alpha_composite(im.convert("RGBA"),glow).convert("RGB")
 d=ImageDraw.Draw(im)
 # futuristic decorative grid and orbital geometry
 for y in range(140,1770,90):d.line((65,y,1015,y),fill=blend(DARK,accent,.095),width=1)
 for x in range(70,1020,90):d.line((x,140,x,1770),fill=blend(DARK,accent,.095),width=1)
 for k in range(3):d.arc((-260+k*80,850+k*80,1150+k*80,2240+k*80),210,300,fill=blend(DARK,accent,.20+k*.08),width=4)
 # large visible panel + neon rails
 d.rounded_rectangle((60,170,1020,1730),radius=42,fill=blend(DARK,(11,25,38) if mode=="CYBERPUNK" else (25,19,25),.7),outline=accent,width=5)
 d.line((65,205,1015,205),fill=accent,width=7)
 d.line((75,1700,1005,1700),fill=accent,width=3)
 d.rectangle((70,260,82,330),fill=alt)
 d.text((118,265),"DR ROBERTO BOSCIA",font=font(True,33),fill=WHITE)
 d.text((118,319),"FARMACISTA DEL SONNO",font=font(False,23),fill=MUTED)
 d.text((117,405),kicker.upper(),font=font(True,28),fill=accent)
 d.line((117,475,570,475),fill=accent,width=5)
 # title with layout fitting
 maxwidth=830
 raw=title.split("\n")
 size=94
 while size>56 and any(d.textbbox((0,0),l,font=font(True,size))[2]>maxwidth for l in raw):size-=4
 tf=font(True,size)
 lineh=int(size*1.38)
 ty=575 if len(raw)==1 else 535
 for i,line in enumerate(raw):
  d.text((112,ty+i*lineh),line,font=tf,fill=WHITE,stroke_width=1,stroke_fill=(25,33,48))
 ty+=len(raw)*lineh+115
 d.rounded_rectangle((110,ty,970,ty+295),radius=22,fill=(12,28,43) if mode=="CYBERPUNK" else (33,25,32),outline=accent,width=3)
 sfont=font(False,43)
 for i,line in enumerate(desc.split("\n")):
  if d.textbbox((0,0),line,font=sfont)[2]>780:raise ValueError(f"Desc too long: {line}")
  d.text((145,ty+60+i*73),line,font=sfont,fill=WHITE)
 d.text((112,1600),"IL SONNO NON È UN EVENTO. È UN PROCESSO.",font=font(True,23),fill=MUTED)
 for i in range(3):
  a=112+i*285
  d.rounded_rectangle((a,1650,a+260,1660),radius=5,fill=accent if i<=scene else blend(DARK,accent,.20))
 d.text((892,265),f"{scene+1:02d}/03",font=font(True,27),fill=accent)
 assert "STICKER" not in title+desc+kicker and "STORY INTRO" not in title+desc+kicker
 return im
def run(args):subprocess.run(args,check=True,timeout=300)
records=[]
limit=os.environ.get("REEL_DATE")
for idx,src in enumerate(source):
 if limit and src["date"]!=limit:continue
 date=src["date"];mode,slides=themes[idx]
 print("BUILD",date,flush=True)
 with tempfile.TemporaryDirectory() as tmp:
  t=Path(tmp)
  for i,parts in enumerate(slides):
   im=card(mode,parts,i)
   im.save(t/f"slide{i}.jpg",format="JPEG",quality=92,subsampling=0,optimize=True)
  req=urllib.request.Request(src["url"],headers={"User-Agent":"Mozilla/5.0"})
  with urllib.request.urlopen(req,timeout=35) as response:(t/"original.mp4").write_bytes(response.read(30000000))
  final=out/f"reel-{date}.mp4"
  cmd=["ffmpeg","-hide_banner","-loglevel","error","-y"]
  for i in range(3):cmd+=["-loop","1","-framerate","25","-t","5.3","-i",str(t/f"slide{i}.jpg")]
  cmd+=["-i",str(t/"original.mp4")]
  prep=[]
  for i in range(3):
   prep.append(f"[{i}:v]fps=25,format=yuv420p,zoompan=z='min(zoom+0.00022,1.035)':d=1:s=1080x1920:fps=25,trim=duration=5.3,setpts=PTS-STARTPTS[v{i}]")
  fc=";".join(prep)+";[v0][v1]xfade=transition=fade:duration=0.3:offset=5.0[ab];[ab][v2]xfade=transition=fade:duration=0.3:offset=10.0,trim=duration=15,setpts=PTS-STARTPTS,format=yuv420p[v]"
  cmd+=["-filter_complex",fc,"-map","[v]","-map","3:a:0?","-t","15","-c:v","libx264","-preset","veryfast","-crf","22","-profile:v","high","-pix_fmt","yuv420p","-r","25","-movflags","+faststart","-c:a","aac","-b:a","128k","-af","afade=t=in:st=0:d=0.25,afade=t=out:st=14.65:d=0.35","-max_muxing_queue_size","1024",str(final)]
  run(cmd)
  cover=out/f"reel-{date}-cover.jpg"
  card(mode,slides[0],0).save(cover,format="JPEG",quality=92,subsampling=0,optimize=True)
  streams=json.loads(subprocess.check_output(["ffprobe","-v","quiet","-show_entries","format=duration,size:stream=codec_type,codec_name,width,height","-of","json",str(final)]))
  assert float(streams["format"]["duration"])>=14.8
  assert any(s["codec_type"]=="audio" for s in streams["streams"])
  assert final.stat().st_size>100000
  # Verify real frames (not a 15 second black placeholder).
  luminances=[]
  for time in [0.75,3,5.8,8,11.0,13.0,14.4]:
   shot=subprocess.check_output(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(time),"-i",str(final),"-frames:v","1","-f","image2pipe","-vcodec","mjpeg","pipe:1"],timeout=25)
   test=Image.open(io.BytesIO(shot)).convert("L");test.thumbnail((100,180))
   avg=sum(test.getdata())/(test.width*test.height)
   luminances.append(round(avg,1))
   if avg<11:raise RuntimeError(f"Reel {date} has blank frame at {time}s mean {avg}")
  records.append({"date":date,"video":final.name,"thumbnail":cover.name,"bytes":final.stat().st_size,"audio":True,"duration":streams["format"]["duration"],"brightness_samples":luminances})
  print("DONE",json.dumps(records[-1]),flush=True)
(out/"manifest.json").write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding="utf-8")
