"""Design/physics-path-nodes/Ch*-Start.dc.html -> dist/physics-nodes-art.js + dist/physics-nodes.css   (կանոն 7. գեներացվող ֆայլեր)

  python physics-nodes-build.py

Ֆայլերից վերցվում են՝ 6 գլխի SVG կլորակները (ավարտված / ընթացիկ / փակ) և CSS-ը (keyframes, կանոններ).
JS տրամաբանությունը ձեռքով է՝ dist/physics-nodes.js։ clipPath-ի id-ները փոխարինվում են {u}-ով (յուրահատուկ id՝ նկարելիս)։
Գլուխ VI-ի ֆայլը կոչում է իր արմատը ch7. այստեղ դառնում է ch6։ Ելքի ամբողջ տեքստը ASCII չէ՝ ֆայլերը UTF-8 են։
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'Design' / 'physics-path-nodes'
FILES = ['Ch1-Methods', 'Ch2-Matter', 'Ch3-Motion', 'Ch4-Interaction', 'Ch5-Work', 'Ch6-Gauge']
NL = chr(10)


def read(index):
    return (SRC / (FILES[index] + '-Start.dc.html')).read_text(encoding='utf-8')


def style_of(text):
    return re.search(r'<style>(.*?)</style>', text, re.S).group(1)


def unique_ids(svg):
    return re.sub(r'\blc\d+\b', 'lc{u}', svg)


def art_for(index):
    text = read(index)
    out = {}
    for state in ('done', 'current', 'locked'):
        if index == 3:  # IV. զսպանակ + բեռ (.grp)
            block = re.search(r'<div class="grp ' + state + r' [^>]*>(<svg aria-hidden="true" width="60".*?</svg>)<div .*?<button class="node"[^>]*>(<svg .*?</svg>)</button>', text, re.S)
            out[state] = {'spring': unique_ids(block.group(1)), 'svg': unique_ids(block.group(2))}
        else:
            block = re.search(r'<button class="node ' + state + r'[^"]*"[^>]*>(<svg .*?</svg>)</button>', text, re.S)
            out[state] = {'svg': unique_ids(block.group(1))}
    return out


def meta_for(index):
    text = read(index)
    head = re.search(r'padding: 16px 20px; background: (#\w+); border-radius: 16px; box-shadow: 0px 5px 0px (#\w+)', text)
    return {'color': head.group(1), 'shadow': head.group(2), 'cut': int(re.search(r'cut\(\) \{\s*return (\d+)', text).group(1))}


def scope(css):
    # Ամեն կանոնի սելեկտորին ավելացնում է «.phys-path » (@keyframes-ը չի դիպչվում, @media-ի ներսը՝ դիպչվում է)
    out, i = [], 0
    while i < len(css):
        brace = css.find('{', i)
        if brace < 0:
            out.append(css[i:])
            break
        head = css[i:brace].strip()
        depth, j = 1, brace + 1
        while depth and j < len(css):
            depth += {'{': 1, '}': -1}.get(css[j], 0)
            j += 1
        body = css[brace + 1:j - 1]
        if head.startswith('@keyframes'):
            out.append(head + '{' + body + '}')
        elif head.startswith('@media'):
            out.append(head + '{' + scope(body) + '}')
        else:
            out.append(','.join('.phys-path ' + part.strip() for part in head.split(',')) + '{' + body + '}')
        i = j
    return ''.join(out)


def build_css():
    shared = style_of(read(0))
    gauge = style_of(read(5))
    lines = [line for line in shared.split(NL) if not line.startswith('.ch6 ') and not line.startswith('body{') and not line.startswith('a{')]
    shared = NL.join(lines)
    shared = shared[:shared.index('@keyframes lessonIn')]  # դասի էկրանի օրինակի կանոնները (.lesson, .bar, .xbtn) կայքում պետք չեն
    # VI-ի ֆայլի հատուկ մասը (մանոմետր). սկսվում է «.c-fx,.p-fx,.h-fx,.c-nd» տողից, վերջանում է @keyframes lessonIn-ից առաջ
    start = gauge.index('.c-fx,.p-fx,.h-fx,.c-nd')
    end = gauge.index('@keyframes lessonIn')
    part = gauge[start:end]
    part = re.sub(r'@media \(prefers-reduced-motion: reduce\)\{\.card\{animation:none\}[^}]*\}\}', '', part)
    css = shared + NL + part
    css = css.replace('.ch7 ', '.ch6 ')
    css = scope(re.sub(r'/\*.*?\*/', '', css, flags=re.S))
    css = css.replace('}@', '}' + NL + '@').replace('}.phys-path', '}' + NL + '.phys-path')
    rules = [line.strip() for line in css.split(NL) if line.strip()]
    packed, current = [], ''
    for rule in rules:
        if rule.startswith('/*'):
            continue
        if len(current) + len(rule) > 200 and current:
            packed.append(current)
            current = ''
        current += rule
    if current:
        packed.append(current)
    return '/* Գեներացվում է physics-nodes-build.py-ով Design/physics-path-nodes/*.dc.html-ից. ձեռքով չխմբագրել */' + NL + NL.join(packed) + NL


def main():
    art = {str(i + 1): art_for(i) for i in range(6)}
    meta = {str(i + 1): meta_for(i) for i in range(6)}
    rows = ['  ' + json.dumps(key) + ': ' + json.dumps(value, ensure_ascii=False) for key, value in art.items()]
    text = ('// Գեներացվում է physics-nodes-build.py-ով Design/physics-path-nodes/*.dc.html-ից. ձեռքով չխմբագրել' + NL +
            '// PHYS_NODE_ART[գլուխ][վիճակ] = { svg, spring? }. {u}՝ յուրահատուկ clipPath id։ PHYS_NODE_META՝ գույնը, ստվերը, «ՍԿՍԵԼ»-ից մինչև դասի բացումը (մվ)։' + NL +
            'const PHYS_NODE_ART = {' + NL + (',' + NL).join(rows) + NL + '};' + NL +
            'const PHYS_NODE_META = ' + json.dumps(meta) + ';' + NL)
    (ROOT / 'dist' / 'physics-nodes-art.js').write_text(text, encoding='utf-8')
    (ROOT / 'dist' / 'physics-nodes.css').write_text(build_css(), encoding='utf-8')
    print('ok', {key: [len(v['svg']) for v in value.values()] for key, value in art.items()})


if __name__ == '__main__':
    main()
