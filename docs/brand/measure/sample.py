import sys, json, colorsys
from PIL import Image
import numpy as np
shots = sys.argv[1]
regions = json.load(open(sys.argv[2]))
cache = {}
def img(name):
    if name not in cache:
        im = Image.open(f"{shots}/{name}").convert('RGB'); cache[name] = (im, im.size[0] / 1400.0)
    return cache[name]
def hx(c): return '#%02X%02X%02X' % tuple(int(round(v)) for v in c)
def hsl(c):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in c)); return f"h{h*360:3.0f} s{s*100:3.0f} l{l*100:3.0f}"
for r in regions:
    im, f = img(r['f']); f = r.get('scale', f); x0, y0, x1, y1 = [int(round(v * f)) for v in r['box']]
    a = np.asarray(im.crop((x0, y0, x1, y1))).reshape(-1, 3).astype(float)
    med = np.median(a, axis=0)
    q = im.crop((x0, y0, x1, y1)).quantize(colors=r.get('k', 4), method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette(); cnt = sorted(q.getcolors(), reverse=True)
    tops = [(n / len(a) * 100, pal[i*3:i*3+3]) for n, i in cnt[:r.get('k', 4)]]
    # brightest / most saturated cluster helpers
    lum = a @ [0.2126, 0.7152, 0.0722]
    hi = a[lum >= np.percentile(lum, 95)].mean(axis=0); lo = a[lum <= np.percentile(lum, 5)].mean(axis=0)
    print(f"{r['id']:<22} med {hx(med)} ({hsl(med)}) | hi {hx(hi)} lo {hx(lo)} | " + "  ".join(f"{p:4.0f}% {hx(c)}" for p, c in tops))
