#!/usr/bin/env python3
import base64, io, json, tempfile, subprocess, pathlib, urllib.request, statistics
from PIL import Image, ImageOps, ImageDraw
base=pathlib.Path(__file__).resolve().parents[1]
records=json.loads((base/"diagnostics/reel_originals_20261107.json").read_text())
out=base/"diagnostics/reel_frame_audit";out.mkdir(parents=True,exist_ok=True)
for r in records:
 print("Inspect",r["date"],flush=True)
 req=urllib.request.Request(r["url"],headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=50) as f:blob=f.read(30_000_000)
 with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
  tmp.write(blob);tmp.flush()
  ffprobe=subprocess.check_output(["ffprobe","-v","quiet","-show_format","-show_streams","-of","json",tmp.name],timeout=30)
  metadata=json.loads(ffprobe)
  frames=[]
  for t in [".20","3","8","12"]:
   p=subprocess.run(["ffmpeg","-nostdin","-loglevel","error","-ss",t,"-i",tmp.name,"-frames:v","1","-f","image2pipe","-vcodec","mjpeg","pipe:1"],capture_output=True,timeout=25)
   if p.returncode!=0 or not p.stdout: continue
   img=ImageOps.contain(Image.open(io.BytesIO(p.stdout)).convert("RGB"),(162,290))
   frames.append((t,img))
  if not frames:raise RuntimeError("No frames in video "+r["date"])
  target=Image.new("RGB",(len(frames)*176,326),"#dddddd");d=ImageDraw.Draw(target)
  for idx,(t,img) in enumerate(frames):
   target.paste(img,(idx*176+(176-img.width)//2,20))
   d.text((idx*176+8,5),f"{r['date']} | {t}s",fill=(15,20,25))
  buff=io.BytesIO();target.save(buff,format="JPEG",quality=54,subsampling=2,optimize=True)
  (out/(r["date"]+".txt")).write_text(base64.b64encode(buff.getvalue()).decode("ascii"))
  v=[x for x in metadata["streams"] if x.get("codec_type")=="video"]
  a=[x for x in metadata["streams"] if x.get("codec_type")=="audio"]
  print(json.dumps({"date":r["date"],"video":v[0].get("codec_name"),"width":v[0].get("width"),"height":v[0].get("height"),"duration":metadata["format"].get("duration"),"audio":len(a)>0,"jpgbytes":len(buff.getvalue())}),flush=True)
