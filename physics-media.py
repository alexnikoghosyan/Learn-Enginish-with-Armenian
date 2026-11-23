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


def clean_image(path):
    """White background -> transparent (flood fill from the corners), crop, centre, 512x512."""
    image = Image.open(path).convert('RGB')
    marker = (255, 0, 255)
    for corner in ((0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)):
        if sum(image.getpixel(corner)) > 690:
            ImageDraw.floodfill(image, corner, marker, thresh=24)
    rgba = image.convert('RGBA')
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            if pixels[x, y][:3] == marker:
                pixels[x, y] = (255, 255, 255, 0)
    box = rgba.getchannel('A').getbbox()
    if not box:
        raise SystemExit('%s: image is empty' % path.name)
    rgba = rgba.crop(box)
    side = max(rgba.size)
    margin = int(side * 0.12)
    canvas = Image.new('RGBA', (side + 2 * margin, side + 2 * margin), (255, 255, 255, 0))
    canvas.paste(rgba, (margin + (side - rgba.width) // 2, margin + (side - rgba.height) // 2))
    return canvas.resize((IMAGE_SIDE, IMAGE_SIDE), Image.LANCZOS)


def build_media():
    alts = json.loads((SRC / 'image-list.json').read_text(encoding='utf-8')) if (SRC / 'image-list.json').exists() else {}
    frames, images = {}, {}
    for folder in sorted(p for p in (SRC / 'renders').iterdir() if p.is_dir()) if (SRC / 'renders').exists() else []:
        data, count, cols, width, height = sheet_for(folder)
        name = write_versioned(FRAMES, folder.name, data)
        frames[folder.name] = {'type': 'frames', 'src': '/physics/frames/' + name, 'frames': count, 'cols': cols, 'w': width, 'h': height}
        print('frames %s -> %s (%d KB, %d frames)' % (folder.name, name, len(data) // 1024, count))
    for path in sorted((SRC / 'images').glob('*.png')) if (SRC / 'images').exists() else []:
        data = encode(clean_image(path), MAX_IMAGE, (92, 85, 75, 65, 55, 45, 35), exact=False)
        if data is None:
            raise SystemExit('%s: image exceeds %d KB' % (path.name, MAX_IMAGE // 1024))
        if path.stem not in alts:
            print('warning: %s is not in physics-src/image-list.json (alt text is empty)' % path.stem)
        images[path.stem] = {'src': '/physics/img/' + write_versioned(IMAGES, path.stem, data), 'alt': alts.get(path.stem, '')}
        print('image %s (%d KB)' % (path.stem, len(data) // 1024))
    if not frames and not images:
        print('no renders or images found: PHYSICS_MEDIA and PHYSICS_IMAGES are empty')
    MEDIA.write_text('// Գեներացվում է physics-media.py-ով. ձեռքով չխմբագրել\nconst PHYSICS_MEDIA = ' + json.dumps(frames, ensure_ascii=False, indent=2) +
                     ';\nconst PHYSICS_IMAGES = ' + json.dumps(images, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')


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
    else:
        build_media()
