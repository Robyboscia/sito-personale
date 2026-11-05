#!/usr/bin/env python3
"""Optimize only upcoming cover art: preserve text/composition, lift shadows, save standard JPEG."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps, ImageStat
from urllib.request import Request, urlopen
import json, io, subprocess, tempfile, statistics
ROOT=Path(__file__).resolve().parents[1]
entries=json.loads((ROOT/"diagnostics/instagram_media_assets.json").read_text(encoding="utf8"))
out=ROOT/"diagnostics/optimized_covers"
out.mkdir(exist_ok=True)
index=[]
def stat(im):
 sample=im.convert("L");sample.thumbnail((180,300))
 px=list(sample.getdata())
 return {"mean":round(statistics.mean(px),1),"black_pct":round(sum(z<22 for z in px)*100/len(px),1)}
def lift(im,gamma):
 # RGB 8-bit lookup table: keeps intentional cyberpunk / fantasy colors; lifts dark backgrounds for legible Instagram grid thumbnails.
 lut=[max(0,min(255,round(255*((v/255)**gamma)))) for v in range(256)]
 enhanced=ImageOps.autocontrast(im.convert("RGB"),cutoff=0.15)
 adjusted=enhanced.point(lut*3)
 return ImageEnhance.Color(adjusted).enhance(1.04)
for e in entries:
 if e["date"]<"2026-11-05T00:00:00" or not (e["kind"]=="reel" or (e["kind"]=="carousel" and e["index"]==0)):continue
 u=e["url"];p=e["post"];kind=e["kind"]
 with urlopen(Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=30) as response:data=response.read(40_000_000)
 if kind=="reel":
  with tempfile.NamedTemporaryFile(suffix=".mp4") as t:
   t.write(data);t.flush()
   proc=subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-ss","1.0","-i",t.name,"-frames:v","1","-f","image2pipe","-vcodec","mjpeg","pipe:1"],capture_output=True,timeout=30)
   if proc.returncode or not proc.stdout:raise RuntimeError(f"Video frame extraction failure {p}")
   image=Image.open(io.BytesIO(proc.stdout)).convert("RGB")
  gamma=.56
 else:
  image=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
  gamma=.62
 prior=stat(image)
 optimized=lift(image,gamma)
 post=stat(optimized)
 file=f"{kind}-{p}.jpg"
 optimized.save(out/file,format="JPEG",quality=93,subsampling=0,progressive=False,optimize=True)
 if post["mean"]<=prior["mean"]+10:raise RuntimeError(f"No significant brightness improvement for {p}")
 rec={"post":p,"kind":kind,"date":e["date"],"filename":file,"orig":prior,"cover":post,"bytes":(out/file).stat().st_size,"width":optimized.width,"height":optimized.height}
 index.append(rec)
 print(f'{kind} {p}: brightness {prior["mean"]} -> {post["mean"]}; almost-black {prior["black_pct"]}% -> {post["black_pct"]}%',flush=True)
(out/"manifest.json").write_text(json.dumps(index,indent=2,ensure_ascii=False),encoding="utf8")
print("TOTAL",len(index),"8 upcoming carousels + 7 upcoming reels expected",flush=True)
assert len([x for x in index if x["kind"]=="carousel"])==8
assert len([x for x in index if x["kind"]=="reel"])==7
