#!/usr/bin/env python3
"""Remove internal production-note boxes from future social Stories.
A cross-network, non-interactive visual CTA replaces the placeholder; it is NOT a native Instagram sticker.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import json, math, io, urllib.request, base64, statistics
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/"diagnostics/november_scheduled_assets.json").read_text())
dest=ROOT/"diagnostics/clean_stories"
dest.mkdir(parents=True,exist_ok=True)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
assets=[]
for entry in manifest:
 if entry["type"]!="STORY":continue
 u=entry["url"]
 with urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=35) as res:
  src=ImageOps.exif_transpose(Image.open(io.BytesIO(res.read(15000000)))).convert("RGB")
 w,h=src.size
 if (w,h)!=(1080,1920):raise ValueError(f"Unexpected size {src.size} for {entry['post']}")
 # The internal production-note panel is a lower strip, between a user-facing text box and the footer.
 # Preserve its existing outside border; repaint only the interior note and remove all "STICKER ..." text.
 rect=(118,1552,960,1724)
 sampled=[src.getpixel((x,y)) for x in (250,420,600,790) for y in (1630,1680,1700)]
 bg=tuple(int(statistics.median(p[i] for p in sampled)) for i in range(3))
 bg=tuple(max(2,min(25,v)) for v in bg)
 d=ImageDraw.Draw(src)
 d.rectangle(rect,fill=bg)
 cyber="CYBERPUNK" in (entry.get("alt") or "")
 neon=(0,220,233) if cyber else (211,168,94)
 dark=(3,13,24) if cyber else (21,15,12)
 y1,y2=1594,1692
 x1,x2=235,845
 # Soft glow only within the previous note box.
 glow=Image.new("RGBA",src.size,(0,0,0,0))
 gd=ImageDraw.Draw(glow)
 gd.rounded_rectangle((x1-7,y1-6,x2+7,y2+6),radius=56,outline=(*neon,125),width=11)
 glow=glow.filter(ImageFilter.GaussianBlur(15))
 base=src.convert("RGBA")
 base=Image.alpha_composite(base,glow)
 draw=ImageDraw.Draw(base)
 draw.rounded_rectangle((x1,y1,x2,y2),radius=48,fill=(*dark,255),outline=(*neon,255),width=5)
 text="CONTINUA" if entry["index"]<2 else "SCOPRI DI PIÙ"
 font=ImageFont.truetype(FONT,47 if entry["index"]<2 else 42)
 arrow="  →"
 # Draw ASCII-safe arrow separately to avoid missing glyphs.
 box=draw.textbbox((0,0),text,font=font);txtw=box[2]-box[0]
 tw=txtw+95;tx=(x1+x2-tw)//2;ty=(y1+y2-(box[3]-box[1]))//2-5
 draw.text((tx,ty),text,font=font,fill="white",stroke_width=0)
 draw.line((tx+txtw+20,(y1+y2)//2,tx+txtw+72,(y1+y2)//2),fill=(*neon,255),width=5)
 ax=tx+txtw+72;cy=(y1+y2)//2
 draw.line((ax-18,cy-17,ax,cy,ax-18,cy+17),fill=(*neon,255),width=5,joint="curve")
 file=dest/f'story-{entry["uuid"].replace("-","n")}.jpg'
 base.convert("RGB").save(file,format="JPEG",quality=94,subsampling=0,progressive=False,optimize=True)
 assets.append({"post":entry["post"],"uuid":entry["uuid"],"date":entry["date"],"index":entry["index"],"style":"cyberpunk" if cyber else "dragonlance","name":file.name,"bytes":file.stat().st_size})
 print(entry["date"],entry["index"],file.name,"bytes",file.stat().st_size,flush=True)
 (dest/"manifest.json").write_text(json.dumps(assets,indent=2,ensure_ascii=False),encoding="utf-8")
# Preview galleries for visual review before modifying any scheduled media.
assets.sort(key=lambda o:o["date"])
images=[]
for info in assets:
 im=Image.open(dest/info["name"])
 thumb=ImageOps.contain(im,(280,500))
 tile=Image.new("RGB",(290,545),"#fff")
 tile.paste(thumb,((290-thumb.width)//2,25))
 dd=ImageDraw.Draw(tile)
 dd.text((4,5),f'{info["date"][5:10]} {info["index"]+1} {info["post"]}',fill="#111")
 images.append(tile)
for n in range(math.ceil(len(images)/6)):
 chunk=images[n*6:n*6+6]
 sheet=Image.new("RGB",(870,1090),"#eee")
 for i,im in enumerate(chunk):sheet.paste(im,((i%3)*290,(i//3)*545))
 out=dest/f'preview-{n:02d}.jpg'
 sheet.save(out,quality=83,optimize=True)
 (dest/f'preview-{n:02d}.b64').write_text(base64.b64encode(out.read_bytes()).decode())
print("FINISHED",len(assets),flush=True)
assert len(assets)==18
