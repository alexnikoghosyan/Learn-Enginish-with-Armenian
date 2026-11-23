#!/usr/bin/env python3
"""Գեներացնում է dist/leaderboard-art.js-ը (Duolingo-ի «Рейтинги» էջի ասսեթները՝ data URI-ներով)։
Օգտագործում՝ python3 leaderboard-assets.py "<Duolingo ..._files պանակի ուղին>"
"""
import base64, colorsys, json, re, sys, pathlib
src = pathlib.Path(sys.argv[1])
here = pathlib.Path(__file__).resolve().parent
files = {
  # լիգաների պատկերակներ
  'leagueBronze': '838ba65643baef4c8442317df514cab5.svg', 'leagueSilver': '968f56b566887d7718898cf8b5e74f40.svg',
  'leagueGold': '80fecb328c5aefd400db229794fd7a08.svg', 'leagueSapphire': '8b3ff5d2a2b0ec2ff7cec8ebd639a5ab.svg',
  'leagueRuby': 'b7c96323c16272efa6794d33791686d2.svg', 'leagueEmerald': 'f480e032c5222395e73dac88ce3592bb.svg',
  'leagueLocked': '1b4fb092de75e4ecefd8e92f10b4ddd2.svg',
  # 1–3 տեղերի մեդալներ
  'medal1': '9e4f18c0bc42c7508d5fa5b18346af11.svg', 'medal2': 'cc7b8f8582e9cfb88408ab851ec2e9bd.svg', 'medal3': 'eef523c872b71178ef5acb2442d453a2.svg',
  # կողային մենյու, վերևի վիճակագրություն
  'navLeaderboard': 'ca9178510134b4b0893dbac30b6670aa.svg', 'flagUS': 'bbe17e16aa4a106032d8e3521eaed13e.svg',
  'streak': '398e4298a3b39ce566050e5c041949ef.svg', 'gem': '45c14e05be9c1af1d7d0b54c6eed7eee.svg', 'heart': '8fdba477c56a8eeb23f0f7e67fdec6d9.svg',
  # կարգավիճակներ
  'st0': '2439bac00452e99ba7bf6a7ed0b04196.svg', 'st1': '2ceb401cae52712705b66a77df83ce40.svg', 'st2': '6b8a8db5ac7f847e7e87efe97c8b451a.svg',
  'st3': 'a8e5c18e80054228b2c61168846ff643.svg', 'st4': '573de2bc90b2499eeb2b3738cff90133.svg', 'st5': 'bbe17e16aa4a106032d8e3521eaed13e.svg',
  'st6': 'f12703218fc80de76a63e650726f742e.svg', 'st7': '5642e1e72813a88e8973b551a2004c7f.svg', 'st8': 'beb0df263d0f696bc7095d56b448ca78.svg',
  'st9': '22df4cb957e6cf2d7198b6e5449a342e.svg', 'st10': '9fadb349c2ece257386a0e576359c867.svg', 'st11': '535fc27de224cc7d311dbb5de4f33be6.svg',
  'flagCN': '9905aa3a86fcb9e351b0b3bfaf04d8b9.svg', 'statusEmpty': 'a35f1db4398fd29e66f1abc33a0d11a2.svg',
  # մրցակիցների ավատարներ (48×48 PNG)
  **{f'av{i}': f'medium({i})' for i in range(1, 9)},
}
# 6–9 լիգաների (Ամեթիստ, Մարգարիտ, Օբսիդիան, Ադամանդ) նշանակներ. Duolingo-ի ֆայլերում դրանք չկան,
# ուստի Շափյուղայի նշանակը վերագունավորվում է (hue, saturation×, value×)
recolored = {'leagueAmethyst': (275, 1.0, 0.95), 'leaguePearl': (335, 0.62, 1.08), 'leagueObsidian': (228, 0.4, 0.42), 'leagueDiamond': (188, 0.95, 1.0)}
def recolor(svg, hue, sat, val):
    def repl(m):
        r, g, b = (int(m.group(1)[i:i + 2], 16) / 255 for i in (0, 2, 4))
        h, sa, v = colorsys.rgb_to_hsv(r, g, b)
        r, g, b = colorsys.hsv_to_rgb(hue / 360, min(1, sa * sat), min(1, v * val))
        return '#%02X%02X%02X' % (round(r * 255), round(g * 255), round(b * 255))
    return re.sub(r'#([0-9A-Fa-f]{6})', repl, svg)
art = {}
for key, (hue, sat, val) in recolored.items():
    svg = recolor((src / files['leagueSapphire']).read_text(encoding='utf8'), hue, sat, val)
    art[key] = 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
for key, name in files.items():
    data = (src / name).read_bytes()
    mime = 'image/svg+xml' if name.endswith('.svg') else 'image/png'
    art[key] = f'data:{mime};base64,' + base64.b64encode(data).decode()
out = here / 'dist' / 'leaderboard-art.js'
out.write_text('// Գեներացված է leaderboard-assets.py-ով. ձեռքով մի փոխիր։\nconst LEADERBOARD_ART = ' + json.dumps(art, indent=0) + ';\n', encoding='utf8')
print(out, out.stat().st_size, 'bytes,', len(art), 'assets')
