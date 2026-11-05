#!/usr/bin/env python3
"""Contact sheets in GitHub for visual inspection of existing user-scheduled media."""
import json, urllib.request, io, os, base64, math
from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/"diagnostics/november_scheduled_assets.json").read_text())
target=ROOT/"diagnostics/november_gallery";target.mkdir(parents=True,exist_ok=True)
for kind in ("STORY","POST"):
 subset=[x for x in manifest if x["type"]==kind]
 nper=6
 for batch in range(math.ceil(len(subset)/nper)):
  items=subset[batch*nper:(batch+1)*nper]
  W,H=(310,570) if kind=="STORY" else (310,440)
  sheet=Image.new("RGB",(W*3,H*2),"#eee");draw=ImageDraw.Draw(sheet)
  for j,item in enumerate(items):
   req=urllib.request.Request(item["url"],headers={"User-Agent":"Mozilla/5.0"})
   with urllib.request.urlopen(req,timeout=25) as resp:data=resp.read(10000000)
   image=ImageOps.exif_transpose(Image.open(io.BytesIO(data)).convert("RGB"))
   image.thumbnail((W-12,H-45))
   x=(j%3)*W+(W-image.width)//2
   y=(j//3)*H+24
   sheet.paste(image,(x,y))
   l=(j//3)*H
   draw.text(((j%3)*W+5,l+5),f'{item["date"][5:10]} #{item["index"]+1} {item["post"]}',fill="black")
  out=target/f'{kind.lower()}-{batch:02d}.jpg'
  sheet.save(out,quality=82,optimize=True)
  (target/f'{kind.lower()}-{batch:02d}.b64').write_text(base64.b64encode(out.read_bytes()).decode('ascii'))
  print(kind,batch,len(items),out.stat().st_size,flush=True)
