#!/usr/bin/env python3
"""Read-only QA of media prepared for @docboscia publishing, no Instagram mutations."""
import json, io, subprocess, tempfile, pathlib, urllib.request, statistics
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageStat
def stat(im):
 sm=im.convert("L");sm.thumbnail((180,320))
 pix=list(sm.getdata())
 return {"brightness":statistics.mean(pix),"black_pct":100*sum(n<22 for n in pix)/len(pix),"white_pct":100*sum(n>215 for n in pix)/len(pix),"variance":statistics.pvariance(pix)}
root=pathlib.Path(__file__).resolve().parents[1]
entries=json.loads((root/"diagnostics/instagram_media_assets.json").read_text())
result=[]
tiles=[]
for i,e in enumerate(entries):
 print("Checking",i+1,"/",len(entries),e["kind"],e["date"],flush=True)
 try:
  req=urllib.request.Request(e["url"],headers={"User-Agent":"Mozilla/5.0 (+media-audit)"})
  with urllib.request.urlopen(req,timeout=24) as f:
   raw=f.read(40_000_000)
   ct=f.headers.get("Content-Type")
  if e["kind"]=="reel":
   with tempfile.NamedTemporaryFile(suffix=".mp4") as t:
    t.write(raw);t.flush()
    cmd=["ffprobe","-v","error","-show_entries","stream=codec_name,width,height,r_frame_rate,nb_frames","-show_entries","format=duration,size","-of","json",t.name]
    spec=json.loads(subprocess.check_output(cmd,stderr=subprocess.STDOUT,timeout=12).decode())
    samples=[]
    for at in ("0.10","1.00","2.00"):
     a=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",at,"-i",t.name,"-vframes","1","-f","image2pipe","-vcodec","mjpeg","pipe:1"],capture_output=True,timeout=18)
     if a.returncode==0 and a.stdout:
      samples.append((at,Image.open(io.BytesIO(a.stdout)).convert("RGB")))
    if not samples:raise ValueError("No extractable video frame")
    # Prefer 1s as intended cover, fallback to latest extracted sample
    frame=next((z for at,z in samples if at=="1.00"),samples[-1][1])
    ims=[{"at":at,"brightness":round(stat(im)["brightness"],1),"black_pct":round(stat(im)["black_pct"],1)} for at,im in samples]
    info={"mime":ct,"bytes":len(raw),"video":spec,"frames":ims,"dimensions":frame.size}
  else:
   im=Image.open(io.BytesIO(raw))
   hasicc=bool(im.info.get("icc_profile"))
   frame=ImageOps.exif_transpose(im).convert("RGB")
   info={"mime":ct,"bytes":len(raw),"format":im.format,"mode":im.mode,"icc":hasicc,"dimensions":frame.size}
  info.update(stat(frame))
  info.update({"post":e["post"],"kind":e["kind"],"date":e["date"],"index":e["index"],"ok":True})
  result.append(info)
  thumb=ImageOps.contain(frame,(190,228))
  tile=Image.new("RGB",(208,262),"#F0F0F0")
  tile.paste(thumb,((208-thumb.width)//2,0))
  d=ImageDraw.Draw(tile)
  d.text((4,230),f'{e["kind"]} {e["date"][5:10]} [{e["index"]}]',fill="black")
  d.text((4,244),f'br:{info["brightness"]:.0f} blk:{info["black_pct"]:.0f}% {info["dimensions"][0]}x{info["dimensions"][1]}',fill="black")
  tiles.append(tile)
 except Exception as exc:
  result.append({"post":e["post"],"kind":e["kind"],"date":e["date"],"index":e["index"],"ok":False,"error":str(exc)[:500]})
  print("  ERROR",str(exc)[:180],flush=True)
def summarize(r):
 valid=[x for x in r if x.get("ok")]
 return {"total":len(r),"ok":len(valid),"fail":len(r)-len(valid),"black_previews":[{"post":x["post"],"date":x["date"],"kind":x["kind"],"index":x["index"],"black_pct":x["black_pct"]} for x in valid if x["black_pct"]>90],"other_very_dark":[{"post":x["post"],"date":x["date"],"kind":x["kind"],"index":x["index"],"brightness":x["brightness"]} for x in valid if x["brightness"]<30]}
report={"summary":summarize(result),"items":result}
(root/"diagnostics/instagram_media_report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
if tiles:
 cols=5;rows=(len(tiles)+cols-1)//cols
 sheet=Image.new("RGB",(cols*208,rows*262),"#ddd")
 for i,tile in enumerate(tiles):sheet.paste(tile,((i%cols)*208,(i//cols)*262))
 sheet.save(root/"diagnostics/instagram_media_contact.jpg",quality=87,optimize=True)
print("SUMMARY",json.dumps(report["summary"],ensure_ascii=False),flush=True)
