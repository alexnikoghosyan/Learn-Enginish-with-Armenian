"""Design/physics8-path-nodes/Ch*.dc.html -> dist/physics8-nodes-art.js + dist/physics8-nodes.css   (կանոն 7. գեներացվող ֆայլեր)

  python physics8-nodes-build.py

Ֆիզիկա 8-ի 5 գլխի կլորակները (Claude Design կտավ «Ֆիզիկա 8 — ուղու կլորակներ (ընտրված)»)։
Ամեն ֆայլից վերցվում են 3 վիճակի SVG-ները (ավարտված / ընթացիկ / փակ) և CSS-ը։ CSS-ը մեկուսացվում է 7-րդից.
  - գլխի դասը (.ch1, .ch2, .ch3, .ch5, .ch6 — կտավում) դառնում է .g8c1 … .g8c5, առանց դասի կանոնները ստանում են .g8cN նախածանց,
  - @keyframes-ի անունները ստանում են g8cN- նախածանց (7-րդի spin, bob, shake-ta և այլն չեն վերագրվում),
  - կտավի էջին պատկանող կանոնները (body, .card, .cta, .lesson, .lbl…) չեն վերցվում։
JS տրամաբանությունը ընդհանուր է 7-րդի հետ՝ dist/physics-nodes.js։
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'Design' / 'physics8-path-nodes'
FILES = ['Ch1-Incline', 'Ch2-Rocket', 'Ch3-Pendulum', 'Ch4-Kettle', 'Ch5-Ice']
NL = chr(10)
DROP = re.compile(r'^(body|a|a:hover|\.node|\.node\.locked|\.node:focus-visible|\.lbl|\.card|\.cta.*|\.lesson.*|\.bar|\.xbtn.*|\.bob|\.spin-slow)$')
DROP_KEYFRAMES = {'pop', 'lessonIn', 'lessonBody', 'barIn'}


def read(index):
    return (SRC / (FILES[index] + '.dc.html')).read_text(encoding='utf-8')


def rules(css):
    # [(գլուխ, մարմին)] վերին մակարդակում (@media-ի և @keyframes-ի մարմինը՝ ամբողջությամբ)
    out, i = [], 0
    while True:
        brace = css.find('{', i)
        if brace < 0:
            return out
        depth, j = 1, brace + 1
        while depth and j < len(css):
            depth += {'{': 1, '}': -1}.get(css[j], 0)
            j += 1
        out.append((css[i:brace].strip(), css[brace + 1:j - 1]))
        i = j


def chapter_class(text):
    found = sorted(set(re.findall(r'\.ch(\d)\b', text)))
    assert len(found) == 1, found
    return '.ch' + found[0]


def rename(body, names, prefix):
    # animation / animation-name արժեքներում անունները փոխարինվում են (spin-ը չի դիպչում spin-a-ին)
    def fix(match):
        value = match.group(2)
        for name in names:
            value = re.sub(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])', prefix + name, value)
        return match.group(1) + value
    return re.sub(r'(animation(?:-name)?\s*:)([^;}]*)', fix, body)


def selector(head, own, scope):
    parts = []
    for part in head.split(','):
        part = part.strip()
        if DROP.match(part):
            continue
        part = re.sub(re.escape(own) + r'(?![\w-])', scope, part) if re.search(re.escape(own) + r'(?![\w-])', part) else scope + ' ' + part
        parts.append('.phys-path ' + part)
    return ','.join(parts)


def css_for(index):
    text = read(index)
    css = re.sub(r'/\*.*?\*/', '', re.search(r'<style>(.*?)</style>', text, re.S).group(1), flags=re.S)
    own, scope, prefix = chapter_class(css), '.g8c' + str(index + 1), 'g8c' + str(index + 1) + '-'
    items = rules(css)
    names = [head.split()[1] for head, _ in items if head.startswith('@keyframes') and head.split()[1] not in DROP_KEYFRAMES]
    frames, plain = {}, []

    def walk(items):
        out = []
        for head, body in items:
            if head.startswith('@keyframes'):
                name = head.split()[1]
                if name not in DROP_KEYFRAMES:
                    frames[name] = '@keyframes ' + prefix + name + '{' + body + '}'
            elif head.startswith('@media'):
                inner = walk(rules(body))
                if inner:
                    out.append(head + '{' + ''.join(inner) + '}')
            else:
                sel = selector(head, own, scope)
                if sel:
                    out.append(sel + '{' + rename(body, names, prefix) + '}')
        return out

    plain = walk(items)
    used = ''.join(plain)
    keep = [frames[name] for name in frames if re.search(r'(?<![\w-])' + re.escape(prefix + name) + r'(?![\w-])', used)]
    return keep + plain


def art_for(index):
    text = read(index)
    out = {}
    for state in ('done', 'current', 'locked'):
        block = re.search(r'<button class="node ' + state + r' [^"]*"[^>]*>(<svg .*?</svg>)</button>', text, re.S)
        out[state] = {'svg': re.sub(r'\s*\n\s*', ' ', block.group(1))}
    return out


def meta_for(index):
    text = read(index)
    head = re.search(r'padding: 16px 20px; background: (#\w+); border-radius: 16px; box-shadow: 0px 5px 0px (#\w+)', text)
    node = int(re.search(r'<button class="node current [^>]*style="position: absolute; left: \d+px; top: (\d+)px', text).group(1))
    card = int(re.search(r'id="card2" style="position: absolute; left: \d+px; top: (\d+)px', text).group(1))
    cut = int(re.search(r'cut\(\) \{\s*return (\d+)', text).group(1))
    return {'color': head.group(1), 'shadow': head.group(2), 'cut': cut, 'gap': card - node - 66}


def pack(items, limit=400):
    lines, current = [], ''
    for item in items:
        if len(current) + len(item) > limit and current:
            lines.append(current)
            current = ''
        current += item
    return lines + ([current] if current else [])


def main():
    art = {str(i + 1): art_for(i) for i in range(len(FILES))}
    meta = {str(i + 1): meta_for(i) for i in range(len(FILES))}
    rows = ['  ' + json.dumps(key) + ': ' + json.dumps(value, ensure_ascii=False) for key, value in art.items()]
    note = 'Գեներացվում է physics8-nodes-build.py-ով Design/physics8-path-nodes/*.dc.html-ից. ձեռքով չխմբագրել'
    text = ('// ' + note + NL +
            '// PHYS8_NODE_ART[գլուխ][վիճակ] = { svg }։ PHYS8_NODE_META՝ գույնը, ստվերը, «ՍԿՍԵԼ»-ից մինչև դասի բացումը (cut, մվ), պատուհանի հեռավորությունը (gap, px)։' + NL +
            'const PHYS8_NODE_ART = {' + NL + (',' + NL).join(rows) + NL + '};' + NL +
            'const PHYS8_NODE_META = ' + json.dumps(meta) + ';' + NL)
    css = [item for i in range(len(FILES)) for item in css_for(i)]
    (ROOT / 'dist' / 'physics8-nodes-art.js').write_text(text, encoding='utf-8')
    (ROOT / 'dist' / 'physics8-nodes.css').write_text('/* ' + note + ' */' + NL + NL.join(pack(css)) + NL, encoding='utf-8')
    print('ok', meta)


if __name__ == '__main__':
    main()
