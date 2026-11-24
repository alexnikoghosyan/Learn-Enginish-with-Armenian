"""Blender kadrer + Flow nkarner -> dist/physics/... + dist/physics-media.js   (Pillow)

  python physics-media.py                 sprite sheets + images (missing inputs are fine: nothing to do)
  python physics-media.py --palette <id>  dominant colors of physics-src/images/<id>.png -> physics-src/palettes/<id>.json

Frames : physics-src/renders/<id>/*.png  -> dist/physics/frames/<id>.<hash>.webp   (<= 30 frames, frame <= 400x400, sheet <= 400 KB)
Images : physics-src/images/<id>.png     -> dist/physics/img/<id>.<hash>.webp      (white margin cropped, centred, 512x512,
         white background transparent, WebP <= 25 KB). Armenian alt text: physics-src/image-list.json {id: alt}.
File names contain a content hash; old versions are removed. Output messages are ASCII (Windows console).
"""
import colorsys
import hashlib
import io
import json
import math
import pathlib
import re
import sys

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'physics-src'
FRAMES, IMAGES = ROOT / 'dist' / 'physics' / 'frames', ROOT / 'dist' / 'physics' / 'img'
MEDIA = ROOT / 'dist' / 'physics-media.js'
MAX_FRAMES, MAX_SIDE, MAX_SHEET, COLUMNS = 30, 400, 400 * 1024, 6
IMAGE_SIDE, MAX_IMAGE = 512, 25 * 1024


def encode(image, limit, qualities, **options):
    for quality in qualities:
        buffer = io.BytesIO()
        image.save(buffer, 'WEBP', quality=quality, method=6, **options)
        if buffer.tell() <= limit:
            return buffer.getvalue()
    return None


def write_versioned(folder, name, data):
    stamped = '%s.%s.webp' % (name, hashlib.sha1(data).hexdigest()[:8])
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob(name + '.*.webp'):
        old.unlink()
    (folder / stamped).write_bytes(data)
    return stamped


def sheet_for(folder):
    pngs = sorted(folder.glob('*.png'))
    if not 0 < len(pngs) <= MAX_FRAMES:
        raise SystemExit('%s: %d frames (allowed 1..%d)' % (folder.name, len(pngs), MAX_FRAMES))
    images = [Image.open(path).convert('RGBA') for path in pngs]
    width, height = images[0].size
    if width > MAX_SIDE or height > MAX_SIDE:
        raise SystemExit('%s: frame is %dx%d (limit %dx%d)' % (folder.name, width, height, MAX_SIDE, MAX_SIDE))
    cols = min(COLUMNS, len(images))
    sheet = Image.new('RGBA', (width * cols, height * math.ceil(len(images) / cols)), (0, 0, 0, 0))
    for index, image in enumerate(images):
        sheet.paste(image, (index % cols * width, index // cols * height))
    data = encode(sheet, MAX_SHEET, (92, 85, 75, 65, 55, 45))
    if data is None:
        raise SystemExit('%s: sheet exceeds %d KB' % (folder.name, MAX_SHEET // 1024))
    return data, len(images), cols, width, height


BLANK_MARKS = {}  # (x0, y0, x1, y1, նմուշի x[, src_y]) 1024 px նկարում. պատահական սանդղակի գծիկները լրացնելու համար (այժմ դատարկ)


# Նոր (2026-11-24) նկարների լրացուցիչ մշակում. BG_SEEDS՝ փակ «անցքեր» (1024 px նկարի կոորդինատներով), որոնք պետք է թափանցիկ լինեն.
# DEHALO՝ եզրի բաց (գրեթե սպիտակ) պիքսելները հանվում են (JPEG-ի սպիտակ եզրագիծ չմնա). սպիտակ մասերը (foam-ball խորանարդ) չեն դիպչվում։
BG_SEEDS = {'key': [(276, 512)], 'chapter-1-cover': [(445, 697), (576, 697)]}  # chapter-1-cover. եռոտանու ոտքերի արանքի սպիտակ եռանկյունները
DEHALO = {'key', 'book', 'apple', 'stone', 'pencil', 'hook-weight', 'ice-melting', 'table', 'foam-ball', 'cube-wood', 'cube-aluminium', 'cube-steel'}


def dehalo(rgba, passes=2):
    pixels = rgba.load()
    for _ in range(passes):
        kill = []
        for y in range(1, rgba.height - 1):
            for x in range(1, rgba.width - 1):
                r, g, b, a = pixels[x, y]
                if a and min(r, g, b) >= 228 and 0 in (pixels[x - 1, y][3], pixels[x + 1, y][3], pixels[x, y - 1][3], pixels[x, y + 1][3]):
                    kill.append((x, y))
        for x, y in kill:
            pixels[x, y] = (255, 255, 255, 0)


# Իրական լուսանկարներ (§2 ֆիզիկոսներ). նախապես մշակված են (4:5, սև-սպիտակ, կլոր անկյուններ՝ թափանցիկ).
# Ֆոնը չի դառնում թափանցիկ և լուսանցք չի ավելանում՝ միայն տեղավորվում է 512x512 թափանցիկ կտավի կենտրոնում։
PHOTOS = {'ambartsumian', 'alikhanian', 'alikhanov'}
MAX_PHOTO = MAX_IMAGE  # նույն 25 KB սահմանը (worker/physics.test.mjs)


def fit_photo(path):
    photo = Image.open(path).convert('RGBA')
    photo.thumbnail((IMAGE_SIDE, IMAGE_SIDE), Image.LANCZOS)
    canvas = Image.new('RGBA', (IMAGE_SIDE, IMAGE_SIDE), (255, 255, 255, 0))
    canvas.paste(photo, ((IMAGE_SIDE - photo.width) // 2, (IMAGE_SIDE - photo.height) // 2))
    return canvas


def clean_image(path):
    """White background -> transparent (flood fill from the corners), crop, centre, 512x512."""
    image = Image.open(path).convert('RGB')
    for box in BLANK_MARKS.get(path.stem, ()):  # նկարի վրա պատահական սանդղակի գծիկներ. լրացնում ենք ձախ կողմի գույնով (դատարկ սանդղակի կանոն)
        x0, y0, x1, y1, src_x, *src_y = box  # src_x՝ նմուշ ձախից (տողով), կամ src_y՝ նմուշ ներքևից (սյունակով)
        for y in range(y0, y1):
            for x in range(x0, x1):
                image.putpixel((x, y), image.getpixel((x, src_y[0]) if src_y else (src_x, y)))
    marker = (255, 0, 255)
    for corner in ((0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)):
        if sum(image.getpixel(corner)) > 690:
            ImageDraw.floodfill(image, corner, marker, thresh=24)
    for sx, sy in BG_SEEDS.get(path.stem, ()):
        ImageDraw.floodfill(image, (int(sx * image.width / 1024), int(sy * image.height / 1024)), marker, thresh=24)
    rgba = image.convert('RGBA')
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            if pixels[x, y][:3] == marker:
                pixels[x, y] = (255, 255, 255, 0)
    if path.stem in DEHALO:
        dehalo(rgba)
    box = rgba.getchannel('A').getbbox()
    if not box:
        raise SystemExit('%s: image is empty' % path.name)
    rgba = rgba.crop(box)
    side = max(rgba.size)
    margin = int(side * 0.12)
    canvas = Image.new('RGBA', (side + 2 * margin, side + 2 * margin), (255, 255, 255, 0))
    canvas.paste(rgba, (margin + (side - rgba.width) // 2, margin + (side - rgba.height) // 2))
    out = canvas.resize((IMAGE_SIDE, IMAGE_SIDE), Image.LANCZOS)
    return out


def read_media_js():
    text = MEDIA.read_text(encoding='utf-8')
    frames = json.loads(re.search(r'PHYSICS_MEDIA = (\{.*?\});' + chr(10) + 'const', text, re.S).group(1))
    images = json.loads(re.search(r'PHYSICS_IMAGES = (\{.*\});', text, re.S).group(1))
    return frames, images


def build_media(only=None):
    alts = json.loads((SRC / 'image-list.json').read_text(encoding='utf-8')) if (SRC / 'image-list.json').exists() else {}
    frames, images = read_media_js() if only else ({}, {})
    for folder in sorted(p for p in (SRC / 'renders').iterdir() if p.is_dir()) if (SRC / 'renders').exists() else []:
        data, count, cols, width, height = sheet_for(folder)
        name = write_versioned(FRAMES, folder.name, data)
        frames[folder.name] = {'type': 'frames', 'src': '/physics/frames/' + name, 'frames': count, 'cols': cols, 'w': width, 'h': height}
        print('frames %s -> %s (%d KB, %d frames)' % (folder.name, name, len(data) // 1024, count))
    for path in sorted((SRC / 'images').glob('*.png')) if (SRC / 'images').exists() else []:
        if only and path.stem != only:
            continue
        photo = path.stem in PHOTOS
        cleaned = fit_photo(path) if photo else clean_image(path)
        data = encode(cleaned, MAX_PHOTO if photo else MAX_IMAGE, (92, 85, 75, 65, 55, 45, 35), exact=False)
        bbox = cleaned.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        if data is None:
            raise SystemExit('%s: image exceeds %d KB' % (path.name, (MAX_PHOTO if photo else MAX_IMAGE) // 1024))
        if path.stem not in alts:
            print('warning: %s is not in physics-src/image-list.json (alt text is empty)' % path.stem)
        images[path.stem] = {'src': '/physics/img/' + write_versioned(IMAGES, path.stem, data), 'alt': alts.get(path.stem, ''), 'box': list(bbox)}
        print('image %s (%d KB)' % (path.stem, len(data) // 1024))
    if not frames and not images:
        print('no renders or images found: PHYSICS_MEDIA and PHYSICS_IMAGES are empty')
    write_media_js(frames, images)


NL = chr(10)


def write_media_js(frames, images):
    # Ամեն գրառում՝ մեկ տողով (ֆայլը մնում է ≤ 300 տող)
    def block(items):
        if not items:
            return '{}'
        rows = ['  ' + json.dumps(key, ensure_ascii=False) + ': ' + json.dumps(value, ensure_ascii=False) for key, value in items.items()]
        return '{' + NL + (',' + NL).join(rows) + NL + '}'
    head = '// Գեներացվում է physics-media.py-ով. ձեռքով չխմբագրել' + NL
    MEDIA.write_text(head + 'const PHYSICS_MEDIA = ' + block(frames) + ';' + NL + 'const PHYSICS_IMAGES = ' + block(images) + ';' + NL, encoding='utf-8')


def build_palette(image_id):
    path = SRC / 'images' / (image_id + '.png')
    if not path.exists():
        print('no image %s yet: nothing to do' % path.name)
        return
    image = Image.open(path).convert('RGB')
    image.thumbnail((256, 256))
    colors = [(count, rgb) for count, rgb in image.quantize(colors=10, method=Image.MEDIANCUT).convert('RGB').getcolors(65536)
              if not all(channel > 235 for channel in rgb)]
    total = sum(count for count, _ in colors) or 1
    entries = [{'hex': '#%02x%02x%02x' % rgb, 'share': round(count / total, 3)} for count, rgb in sorted(colors, reverse=True)]
    for entry in entries:
        r, g, b = (int(entry['hex'][i:i + 2], 16) / 255 for i in (1, 3, 5))
        entry['saturation'] = round(colorsys.rgb_to_hsv(r, g, b)[1], 2)
    out = SRC / 'palettes'
    out.mkdir(parents=True, exist_ok=True)
    (out / (image_id + '.json')).write_text(json.dumps({'id': image_id, 'colors': entries}, indent=2), encoding='utf-8')
    print('palette %s: %d colors' % (image_id, len(entries)))


if __name__ == '__main__':
    if '--palette' in sys.argv:
        build_palette(sys.argv[sys.argv.index('--palette') + 1])
    elif '--only' in sys.argv:
        build_media(sys.argv[sys.argv.index('--only') + 1])
    else:
        build_media()
