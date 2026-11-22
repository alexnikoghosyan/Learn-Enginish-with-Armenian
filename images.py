"""Բառերի նկարները պատրաստում է կայքի համար.
Օգտագործում՝ python images.py <թղթապանակ_նկարներով>
Ֆայլերի անունները՝ english-garden-<word>.jpg (կամ .png/.webp)։
Սպիտակ ֆոնը դարձնում է թափանցիկ, կտրում, փոքրացնում 256px և պահում dist/word-<word>.webp։
"""
import sys, re, json, pathlib
from collections import deque
from PIL import Image

root = pathlib.Path(__file__).parent
dist = root / 'dist'
SIZE = 256
# Images whose subject is near-white with no outline need a tighter tolerance.
TOLERANCE = {'cow': 8}
INSET = 0.02  # trim a thin border first: some generated images have a faint frame
# Բառեր, որոնց ներսում փակ սպիտակ տարածքներ (բռնակի անցք, ոտքերի միջակայք) ֆոն են։
# Կենդանիների/մարդկանց սպիտակ աչքերը և միտումնավոր սպիտակ մանրամասները (կաթի պիտակ,
# ջրի փայլ, թեյի պիտակ, կովի մարմին) չպետք է հեռացվեն, ուստի այդ բառերը ցուցակում չկան։
HOLE_WORDS = {'beer', 'coffee', 'chair', 'broccoli', 'bag', 'juice', 'clock', 'house'}

def remove_white(im, tol=26):
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    def white(p): return p[0] > 255 - tol and p[1] > 255 - tol and p[2] > 255 - tol
    seen = bytearray(w * h); q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1
        if not white(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]: q.append((nx, ny))
    return im

def remove_holes(im, tol=12, min_px=30, max_frac=0.06):
    """Հեռացնում է փակ, գրեթե մաքուր սպիտակ տարածքները (օր.՝ բաժակի բռնակի ներսը)։"""
    w, h = im.size; px = im.load(); seen = bytearray(w * h)
    def white(p): return p[3] == 255 and min(p[:3]) >= 255 - tol
    for sy in range(h):
        for sx in range(w):
            i = sy * w + sx
            if seen[i] or not white(px[sx, sy]): continue
            comp = []; q = deque([(sx, sy)]); seen[i] = 1
            while q:
                x, y = q.popleft(); comp.append((x, y))
                for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    j = ny * w + nx
                    if 0 <= nx < w and 0 <= ny < h and not seen[j] and white(px[nx, ny]):
                        seen[j] = 1; q.append((nx, ny))
            if min_px <= len(comp) <= max_frac * w * h:
                for x, y in comp: px[x, y] = (255, 255, 255, 0)
    return im

def process(src, dst, tol=26, holes=False):
    im = Image.open(src)
    m = int(min(im.size) * INSET)
    im = im.crop((m, m, im.width - m, im.height - m))
    im = im.resize((512, 512), Image.LANCZOS)
    im = remove_white(im, tol)
    if holes:
        im = remove_holes(im)
    box = im.getbbox()
    if box:
        im = im.crop(box)
    side = max(im.size); pad = int(side * 0.06); side += 2 * pad
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(dst, 'WEBP', quality=88, method=6)

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    folder = pathlib.Path(sys.argv[1])
    done = []
    for f in sorted(folder.iterdir()):
        m = re.fullmatch(r'(?:english-garden-)?([a-z0-9-]+)\.(jpe?g|png|webp)', f.name)
        if not m: continue
        slug = m.group(1); process(f, dist / f'word-{slug}.webp', TOLERANCE.get(slug, 26), slug in HOLE_WORDS); done.append(slug)
    existing = sorted(p.stem[5:] for p in dist.glob('word-*.webp'))
    (dist / 'word-images.js').write_text('const WORD_IMAGES = ' + json.dumps(existing) + ';\n', encoding='utf-8')
    print('processed', len(done), 'total', len(existing))

if __name__ == '__main__':
    main()
