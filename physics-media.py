"""Blender կադրեր (physics-src/renders/<id>/*.png) -> sprite-թերթ dist/physics/frames/<id>.<hash>.webp + dist/physics-media.js

Գործարկում.  python physics-media.py   (պահանջում է Pillow)
Սահմանաչափեր. <= 30 կադր, կադրը <= 400x400, թերթը <= 400 KB (որակը իջեցվում է մինչև սահմանը)։
Ֆայլի անունը պարունակում է բովանդակության hash, հին տարբերակները ջնջվում են։
"""
import hashlib
import io
import json
import math
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
RENDERS = ROOT / 'physics-src' / 'renders'
FRAMES = ROOT / 'dist' / 'physics' / 'frames'
MEDIA = ROOT / 'dist' / 'physics-media.js'
MAX_FRAMES, MAX_SIDE, MAX_BYTES, COLUMNS = 30, 400, 400 * 1024, 6


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
    for quality in (92, 85, 75, 65, 55, 45):
        buffer = io.BytesIO()
        sheet.save(buffer, 'WEBP', quality=quality, method=6)
        if buffer.tell() <= MAX_BYTES:
            return buffer.getvalue(), len(images), cols, width, height
    raise SystemExit('%s: sheet exceeds %d KB' % (folder.name, MAX_BYTES // 1024))


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)
    entries = {}
    folders = sorted(path for path in RENDERS.iterdir() if path.is_dir()) if RENDERS.exists() else []
    for folder in folders:
        data, count, cols, width, height = sheet_for(folder)
        name = '%s.%s.webp' % (folder.name, hashlib.sha1(data).hexdigest()[:8])
        for old in FRAMES.glob(folder.name + '.*.webp'):
            old.unlink()
        (FRAMES / name).write_bytes(data)
        entries[folder.name] = {'type': 'frames', 'src': '/physics/frames/' + name, 'frames': count, 'cols': cols, 'w': width, 'h': height}
        print('%s -> %s (%d KB, %d frames)' % (folder.name, name, len(data) // 1024, count))
    MEDIA.write_text('// Գեներացվում է physics-media.py-ով. ձեռքով չխմբագրել\nconst PHYSICS_MEDIA = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')


if __name__ == '__main__':
    main()
