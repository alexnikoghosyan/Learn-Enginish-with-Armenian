// Ավատարի կոնստրուկտոր. տվյալների մոդել, գունապնակներ և ՕՐԻԳԻՆԱԼ SVG նկարազարդում (հարթ գույներ, առանց եզրագծերի,
// գունավոր ստվերներ). renderAvatarSVG(config, {...}) վերադարձնում է SVG տող։ Կոորդինատները՝ viewBox 0 0 400 546,
// գլխի կենտրոնը (200, 190), աչքերը y=200, բերանը y≈250։
const AVATAR_DEFAULT = {
  v: 1, skin: 6, body: 2, eyeColor: 0, expression: 0,
  hairColor: 0, hair: 3, glassesColor: 1, glasses: 0, features: 0,
  earrings: 0, nosePiercing: 0, facialHair: 0,
  hatColor: 8, hat: 0, clothesColor: 8, bgColor: 1
};

// Յուրաքանչյուր դաշտի տարբերակների քանակը (աշխատողի վավերացումը ունի նույն աղյուսակը՝ worker/account.mjs)
const AVATAR_RANGES = {
  skin: 15, body: 6, eyeColor: 13, expression: 12, hairColor: 16, hair: 10, glassesColor: 8, glasses: 5,
  features: 5, earrings: 5, nosePiercing: 3, facialHair: 6, hatColor: 9, hat: 6, clothesColor: 9, bgColor: 24
};

const AVATAR_PALETTES = {
  skin: ['#4a2c1d', '#5e3a24', '#74482c', '#8a5a37', '#a06b43', '#b87d52', '#cc9366', '#d9a47a', '#e5b78f', '#efc8a5', '#f5d5b9', '#f8dfc9', '#fbe5d3', '#fdd9d0', '#ffe6e1'],
  eyeColor: ['#1f1f24', '#6b3f21', '#7d7a2e', '#3f9a4c', '#1f9a9a', '#2f7fd6', '#8793a0', '#7a4fcf', '#c13db0', '#f06aa8', '#e04545', '#f28a1b', '#f2c81b'],
  hairColor: ['#1d1b1f', '#3b2418', '#58361f', '#7a4c28', '#9a6a3c', '#b5412a', '#8a7867', '#c47a37', '#f5992b', '#f2e2b3', '#c9ccd3', '#f5f5f5', '#f58bc0', '#a56be0', '#4aa3f0', '#58cc02'],
  glassesColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ff9600', '#e63946', '#f58bc0', '#f2e2b3', '#2b2b33'],
  hatColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ffc800', '#ff9600', '#e63946', '#f58bc0', '#f5f5f5', '#4b4b52'],
  clothesColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ffc800', '#ff9600', '#c9254a', '#f58bc0', '#f5f5f5', '#4b4b52'],
  bgColor: ['#ababab', '#cfcfd6', '#8d8d98', '#5f5f6a', '#d9c8fb', '#b48cf2', '#9a6fe0', '#cfe8ff', '#8fd0f8', '#4ab4f2', '#1f8fd9', '#bdf0e3',
    '#7ddcc4', '#bfe9a0', '#8fd656', '#58cc02', '#fff0a8', '#ffd666', '#ffb347', '#ff9600', '#ffc4d6', '#ff8fb0', '#ff6b6b', '#e63946']
};

// Մարմնի տեսակներ. sw՝ ուսերի կես լայնություն, ty՝ ուսերի բարձրություն, nw՝ վզի կես լայնություն (թվային, ուստի մորֆվում է)
const AVATAR_BODIES = [
  { sw: 104, ty: 332, nw: 28 }, { sw: 124, ty: 327, nw: 31 }, { sw: 144, ty: 322, nw: 35 },
  { sw: 160, ty: 319, nw: 38 }, { sw: 176, ty: 316, nw: 42 }, { sw: 192, ty: 312, nw: 46 }
];

// Տեսախցիկներ (viewBox). ձևաչափը մոտ է 502:685 դիմանկարին
const AVATAR_CAMERAS = {
  medium: [0, 0, 400, 546], body: [20, 210, 360, 491], face: [80, 20, 240, 327],
  bust: [50, 40, 300, 300], head: [70, 40, 260, 260]
};

function avatarMix(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}
const avatarShade = (hex, k = .2) => avatarMix(hex, '#5a2a6e', k); // ստվերը՝ մանուշակագույն երանգով, ոչ սև

function normalizeAvatarConfig(config) {
  const out = { ...AVATAR_DEFAULT };
  if (config && typeof config === 'object') {
    for (const key of Object.keys(AVATAR_RANGES)) {
      const value = Number(config[key]);
      if (Number.isInteger(value) && value >= 0 && value < AVATAR_RANGES[key]) out[key] = value;
    }
  }
  return out;
}

function avatarBodyAttrs(p) {
  const cx = 200, { sw, ty, nw } = p;
  return {
    clothes: 'M' + (cx - sw) + ' 760 L' + (cx - sw) + ' ' + (ty + 50) + ' Q' + (cx - sw) + ' ' + ty + ' ' + (cx - sw + 56) + ' ' + (ty - 8) +
      ' L' + (cx - nw - 12) + ' ' + (ty - 20) + ' L' + (cx + nw + 12) + ' ' + (ty - 20) + ' L' + (cx + sw - 56) + ' ' + (ty - 8) +
      ' Q' + (cx + sw) + ' ' + ty + ' ' + (cx + sw) + ' ' + (ty + 50) + ' L' + (cx + sw) + ' 760Z',
    neck: 'M' + (cx - nw) + ' 240 L' + (cx - nw) + ' ' + ty + ' L' + (cx + nw) + ' ' + ty + ' L' + (cx + nw) + ' 240Z',
    chestY: ty - 8, chestRx: nw + 12
  };
}

// ---------- Մասերի գրադարաններ ----------
const avatarHeart = (x, y, s, fill) => '<path d="M' + x + ' ' + (y + 9 * s) + ' C' + (x - 18 * s) + ' ' + (y - 2 * s) + ' ' + (x - 10 * s) + ' ' + (y - 16 * s) + ' ' + x +
  ' ' + (y - 6 * s) + ' C' + (x + 10 * s) + ' ' + (y - 16 * s) + ' ' + (x + 18 * s) + ' ' + (y - 2 * s) + ' ' + x + ' ' + (y + 9 * s) + 'Z" fill="' + fill + '"/>';

function avatarEye(x, c, rx = 15, ry = 19) {
  return '<ellipse cx="' + x + '" cy="200" rx="' + rx + '" ry="' + ry + '" fill="#fff"/><g class="av-iris"><circle cx="' + x + '" cy="202" r="' + (ry * .64).toFixed(1) +
    '" fill="' + c.eye + '"/><circle cx="' + x + '" cy="202" r="' + (ry * .32).toFixed(1) + '" fill="#1b1b22"/><circle cx="' + (x + 4) + '" cy="196" r="3.2" fill="#fff"/></g>';
}
const avatarLine = (d, color, w = 5) => '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
const avatarBrows = (c, l, r, w = 6) => avatarLine(l, c.brow, w) + avatarLine(r, c.brow, w);
const MOUTH = '#6b2f45', TONGUE = '#ff7a8a';
const avatarOpenMouth = () => '<path d="M170 242 Q200 236 230 242 Q228 280 200 280 Q172 280 170 242Z" fill="' + MOUTH + '"/><path d="M175 243 Q200 238 225 243 L223 253 Q200 257 177 253Z" fill="#fff"/><path d="M185 272 Q200 260 215 272 Q200 282 185 272Z" fill="' + TONGUE + '"/>';
const avatarCheeks = '<ellipse cx="140" cy="232" rx="17" ry="10" fill="#ff7d8d" opacity=".5"/><ellipse cx="260" cy="232" rx="17" ry="10" fill="#ff7d8d" opacity=".5"/>';

const AVATAR_EXPRESSIONS = [
  /* 0 չեզոք     */ c => avatarBrows(c, 'M146 168 Q162 160 178 167', 'M222 167 Q238 160 254 168') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + avatarLine('M180 252 Q200 257 220 252', MOUTH),
  /* 1 ժպիտ      */ c => avatarBrows(c, 'M146 166 Q162 158 178 165', 'M222 165 Q238 158 254 166') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + avatarLine('M172 244 Q200 274 228 244', MOUTH),
  /* 2 բաց ժպիտ  */ c => avatarBrows(c, 'M146 164 Q162 154 178 162', 'M222 162 Q238 154 254 164') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + avatarOpenMouth(),
  /* 3 լեզու     */ c => avatarBrows(c, 'M146 166 Q162 158 178 165', 'M222 165 Q238 158 254 166') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + '<path d="M192 256 L192 280 Q200 292 208 280 L208 256Z" fill="' + TONGUE + '"/>' + avatarLine('M172 246 Q200 270 228 246', MOUTH),
  /* 4 աչքով անել */ c => avatarBrows(c, 'M146 160 Q162 150 178 158', 'M222 168 Q238 162 254 168') + '<g class="av-eyes">' + avatarLine('M146 204 Q162 188 178 204', c.brow, 6) + avatarEye(238, c) + '</g>' + avatarLine('M172 246 Q202 274 230 244', MOUTH),
  /* 5 զարմացած  */ c => avatarBrows(c, 'M144 152 Q162 140 180 150', 'M220 150 Q238 140 256 152') + '<g class="av-eyes">' + avatarEye(162, c, 17, 23) + avatarEye(238, c, 17, 23) + '</g>' + '<ellipse cx="200" cy="262" rx="11" ry="15" fill="' + MOUTH + '"/>',
  /* 6 տխուր     */ c => avatarBrows(c, 'M146 172 L178 160', 'M222 160 L254 172') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + avatarLine('M178 264 Q200 244 222 264', MOUTH),
  /* 7 զայրացած  */ c => avatarBrows(c, 'M144 158 L180 174', 'M220 174 L256 158', 8) + '<g class="av-eyes">' + avatarEye(162, c, 15, 16) + avatarEye(238, c, 15, 16) + '</g>' + avatarLine('M178 262 Q200 248 222 262', MOUTH),
  /* 8 քնկոտ     */ c => avatarBrows(c, 'M146 170 Q162 166 178 170', 'M222 170 Q238 166 254 170') + '<g class="av-eyes">' + avatarLine('M146 204 Q162 212 178 204', c.brow, 6) + avatarLine('M222 204 Q238 212 254 204', c.brow, 6) + '</g>' + avatarLine('M184 256 Q200 260 216 256', MOUTH),
  /* 9 ուրախ փակ աչք */ c => avatarBrows(c, 'M146 162 Q162 152 178 160', 'M222 160 Q238 152 254 162') + '<g class="av-eyes">' + avatarLine('M146 206 Q162 186 178 206', c.brow, 6) + avatarLine('M222 206 Q238 186 254 206', c.brow, 6) + '</g>' + avatarOpenMouth(),
  /* 10 սրտաձև աչքեր */ c => avatarBrows(c, 'M146 164 Q162 156 178 163', 'M222 163 Q238 156 254 164') + '<g class="av-eyes">' + avatarHeart(162, 198, 1.5, '#ff4b6e') + avatarHeart(238, 198, 1.5, '#ff4b6e') + '</g>' + avatarLine('M172 244 Q200 274 228 244', MOUTH),
  /* 11 ժպիտ կարմրությամբ */ c => avatarBrows(c, 'M146 166 Q162 158 178 165', 'M222 165 Q238 158 254 166') + '<g class="av-eyes">' + avatarEye(162, c) + avatarEye(238, c) + '</g>' + avatarCheeks + avatarLine('M176 246 Q200 268 224 246', MOUTH)
];

// Մազեր. { back, front }. Գույները՝ c.hair / c.hairShade; ստվերը՝ աջ կեսի կտրվածքով
const avatarHairPath = (d, c) => '<path d="' + d + '" fill="' + c.hair + '"/><path d="' + d + '" fill="' + c.hairShade + '" clip-path="url(#' + c.uid + 'rh)"/>';
const HAIR_SHORT = 'M116 192 C104 105 150 66 202 66 C256 66 298 104 284 192 C276 150 250 120 200 124 C152 120 126 150 116 192Z';
const HAIR_FRINGE = 'M116 186 C110 106 158 72 200 72 C244 72 292 106 284 186 C272 146 250 124 200 128 C150 124 128 146 116 186Z';
const AVATAR_HAIR = [
  /* 0 ճաղատ */ { back: () => '', front: () => '' },
  /* 1 ծայրակարճ */ { back: () => '', front: c => avatarHairPath('M122 176 C118 122 150 100 200 100 C250 100 282 122 278 176 C268 144 240 128 200 128 C160 128 132 144 122 176Z', c) },
  /* 2 կարճ */ { back: () => '', front: c => avatarHairPath(HAIR_SHORT, c) },
  /* 3 քուֆ */ { back: () => '', front: c => avatarHairPath('M118 152 C106 72 190 38 252 66 C296 86 294 150 284 190 C272 142 240 114 190 120 C150 124 128 140 118 152Z', c) },
  /* 4 երկար ուղիղ */ { back: c => avatarHairPath('M102 196 C94 92 150 60 200 60 C250 60 306 92 298 196 L308 340 L92 340Z', c), front: c => avatarHairPath(HAIR_FRINGE, c) },
  /* 5 քառակուսի */ { back: c => avatarHairPath('M104 206 C96 96 150 62 200 62 C250 62 304 96 296 206 L294 268 Q200 290 106 268Z', c), front: c => avatarHairPath(HAIR_FRINGE, c) },
  /* 6 ալիքավոր */ { back: c => avatarHairPath('M102 196 C94 92 150 60 200 60 C250 60 306 92 298 196 Q312 240 296 270 Q310 306 292 332 Q250 318 200 336 Q150 318 108 332 Q90 306 104 270 Q88 240 102 196Z', c), front: c => avatarHairPath(HAIR_FRINGE, c) },
  /* 7 գանգրացած */ { back: () => '', front: c => ['130,132,30', '166,102,35', '206,92,37', '246,102,35', '276,132,30', '116,168,22', '284,168,22'].map(s => { const [x, y, r] = s.split(','); return avatarHairPath('M' + (+x - r) + ' ' + y + ' a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0 a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0Z', c); }).join('') },
  /* 8 աֆրո */ { back: c => avatarHairPath('M82 150 a118 118 0 1 0 236 0 a118 118 0 1 0 -236 0Z', c), front: c => avatarHairPath('M126 172 C124 128 168 112 200 112 C232 112 276 128 274 172 C256 140 144 140 126 172Z', c) },
  /* 9 կապած փունջ */ { back: () => '', front: c => avatarHairPath('M174 52 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0Z', c) + avatarHairPath(HAIR_SHORT, c) }
];

// Մորուք և բեղ. գույնը՝ մազերի գույնն է
const AVATAR_BEARDS = [
  () => '',
  c => '<path d="M158 234 C175 222 195 230 200 238 C205 230 225 222 242 234 C228 248 210 242 200 244 C190 242 172 248 158 234Z" fill="' + c.hair + '"/>',
  c => '<path d="M158 234 C175 222 195 230 200 238 C205 230 225 222 242 234 C228 248 210 242 200 244 C190 242 172 248 158 234Z" fill="' + c.hair + '"/><path d="M180 270 C184 258 216 258 220 270 C222 286 178 286 180 270Z" fill="' + c.hair + '"/>',
  c => '<path d="M120 204 C122 272 160 300 200 300 C240 300 278 272 280 204 C264 242 240 256 200 256 C160 256 136 242 120 204Z" fill="' + c.hair + '"/><path d="M158 234 C175 222 195 230 200 238 C205 230 225 222 242 234 C228 248 210 242 200 244 C190 242 172 248 158 234Z" fill="' + c.hair + '"/>',
  c => '<path d="M120 204 C122 272 160 300 200 300 C240 300 278 272 280 204 C264 242 240 256 200 256 C160 256 136 242 120 204Z" fill="' + c.hair + '" opacity=".38"/>',
  c => '<path d="M148 238 C152 216 188 222 200 238 C212 222 248 216 252 238 C244 230 226 240 200 242 C174 240 156 230 148 238Z" fill="' + c.hair + '"/><path d="M148 238 q-10 -4 -6 -16 M252 238 q10 -4 6 -16" fill="none" stroke="' + c.hair + '" stroke-width="5" stroke-linecap="round"/>'
];

// Գլխարկներ. գույնը՝ c.hat
const hatFill = (d, c, rule = '') => '<path d="' + d + '" fill="' + c.hat + '"' + rule + '/><path d="' + d + '" fill="' + c.hatShade + '"' + rule + ' clip-path="url(#' + c.uid + 'rh)"/>';
const AVATAR_HATS = [
  () => '',
  c => hatFill('M112 146 C106 66 150 44 200 44 C250 44 294 66 288 146Z', c) + hatFill('M110 144 C150 132 250 132 290 144 C312 150 338 152 350 150 C326 170 252 162 200 160 C150 162 96 158 110 144Z', c),
  c => hatFill('M110 152 C102 58 150 36 200 36 C250 36 298 58 290 152 C250 138 150 138 110 152Z', c) + '<path d="M108 150 C150 136 250 136 292 150 L294 174 C250 160 150 160 106 174Z" fill="' + c.hatShade + '"/><circle cx="200" cy="28" r="17" fill="' + c.hat + '"/>',
  c => hatFill('M122 132 C122 70 160 50 200 50 C240 50 278 70 278 132Z', c) + hatFill('M80 138 C100 118 300 118 320 138 C300 160 100 160 80 138Z', c),
  c => hatFill('M200 56 C126 56 98 118 98 200 C98 282 118 332 150 348 L250 348 C282 332 302 282 302 200 C302 118 274 56 200 56Z M200 112 C158 112 128 150 128 200 C128 250 158 284 200 284 C242 284 272 250 272 200 C272 150 242 112 200 112Z', c, ' fill-rule="evenodd"'),
  c => hatFill('M200 34 C108 34 80 130 88 222 C94 292 112 328 98 350 L302 350 C288 328 306 292 312 222 C320 130 292 34 200 34Z M200 100 C154 100 124 142 124 196 C124 250 154 290 200 290 C246 290 276 250 276 196 C276 142 246 100 200 100Z', c, ' fill-rule="evenodd"')
];

const AVATAR_GLASSES = [
  () => '',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="5"><circle cx="162" cy="200" r="27"/><circle cx="238" cy="200" r="27"/><path d="M189 198 Q200 190 211 198"/><path d="M135 196 L120 190 M265 196 L280 190"/></g>',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="5"><rect x="132" y="180" width="60" height="42" rx="10"/><rect x="208" y="180" width="60" height="42" rx="10"/><path d="M192 196 Q200 190 208 196"/><path d="M132 190 L120 186 M268 190 L280 186"/></g>',
  c => '<g><rect x="132" y="180" width="60" height="42" rx="12" fill="#2a2a35" opacity=".92" stroke="' + c.glasses + '" stroke-width="5"/><rect x="208" y="180" width="60" height="42" rx="12" fill="#2a2a35" opacity=".92" stroke="' + c.glasses + '" stroke-width="5"/><path d="M192 192 Q200 186 208 192" fill="none" stroke="' + c.glasses + '" stroke-width="5"/><path d="M132 190 L120 186 M268 190 L280 186" stroke="' + c.glasses + '" stroke-width="5" fill="none"/></g>',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="5" stroke-linejoin="round"><path d="M134 192 L188 182 Q194 204 184 216 Q160 226 138 214Z"/><path d="M266 192 L212 182 Q206 204 216 216 Q240 226 262 214Z"/><path d="M188 192 Q200 188 212 192"/></g>'
];

const AVATAR_FEATURES = [
  () => '',
  c => [[148, 222], [158, 230], [168, 224], [152, 238], [232, 224], [242, 230], [252, 222], [248, 238]].map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="' + c.skinDark + '"/>').join(''),
  () => avatarCheeks,
  c => '<path d="M236 148 L252 190" stroke="' + c.skinDark + '" stroke-width="4" stroke-linecap="round"/><path d="M230 164 L248 160 M234 176 L252 172" stroke="' + c.skinDark + '" stroke-width="3" stroke-linecap="round"/>',
  c => '<path d="M160 132 Q200 124 240 132 M166 144 Q200 138 234 144" fill="none" stroke="' + c.skinDark + '" stroke-width="3.5" stroke-linecap="round"/>'
];
const GOLD = '#f5c542', SILVER = '#d7dbe3';
const AVATAR_EARRINGS = [
  () => '',
  () => '<circle cx="109" cy="224" r="5.5" fill="' + GOLD + '"/><circle cx="291" cy="224" r="5.5" fill="' + GOLD + '"/>',
  () => '<circle cx="109" cy="224" r="5.5" fill="' + SILVER + '"/><circle cx="291" cy="224" r="5.5" fill="' + SILVER + '"/>',
  () => '<circle cx="108" cy="234" r="10" fill="none" stroke="' + GOLD + '" stroke-width="3.5"/><circle cx="292" cy="234" r="10" fill="none" stroke="' + GOLD + '" stroke-width="3.5"/>',
  () => '<circle cx="108" cy="234" r="10" fill="none" stroke="' + SILVER + '" stroke-width="3.5"/><circle cx="292" cy="234" r="10" fill="none" stroke="' + SILVER + '" stroke-width="3.5"/>'
];
const AVATAR_NOSE_RINGS = [
  () => '',
  () => '<circle cx="212" cy="228" r="3.2" fill="' + GOLD + '"/>',
  () => '<circle cx="209" cy="232" r="7" fill="none" stroke="' + GOLD + '" stroke-width="2.8"/>'
];

function avatarContext(cfg, uid) {
  const P = AVATAR_PALETTES, skin = P.skin[cfg.skin], hair = P.hairColor[cfg.hairColor], hat = P.hatColor[cfg.hatColor], clothes = P.clothesColor[cfg.clothesColor];
  return {
    uid, skin, skinShade: avatarShade(skin, .18), skinDark: avatarShade(skin, .38), eye: P.eyeColor[cfg.eyeColor], hair, hairShade: avatarShade(hair, .22),
    brow: avatarMix(hair, '#2a1a2a', .5), glasses: P.glassesColor[cfg.glassesColor], hat, hatShade: avatarShade(hat, .2),
    clothes, clothesShade: avatarShade(clothes, .2), bg: P.bgColor[cfg.bgColor]
  };
}

let avatarUid = 0;
// renderAvatarSVG(config, { crop: 'medium'|'body'|'face'|'bust'|'head' | viewBox: [x,y,w,h], size, bg, animate, body: {sw,ty,nw} })
function renderAvatarSVG(config, opts = {}) {
  const cfg = normalizeAvatarConfig(config);
  const uid = 'av' + (++avatarUid) + '-';
  const c = avatarContext(cfg, uid);
  const vb = opts.viewBox || AVATAR_CAMERAS[opts.crop || 'medium'];
  const body = avatarBodyAttrs(opts.body || AVATAR_BODIES[cfg.body]);
  const hair = AVATAR_HAIR[cfg.hair], hasHijab = cfg.hat >= 4;
  const size = opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '';
  const animate = opts.animate ? ' class="av-animate"' : '';
  const bg = opts.bg === false ? '' : '<rect x="-600" y="-600" width="1600" height="2200" fill="' + c.bg + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + size + animate + ' preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ավատար" focusable="false">' +
    '<defs><clipPath id="' + uid + 'rh"><rect x="214" y="-600" width="800" height="2200"/></clipPath></defs>' + bg +
    (hasHijab ? '' : '<g class="av-hairback">' + hair.back(c) + '</g>') +
    '<g class="av-torso"><path class="av-clothes" d="' + body.clothes + '" fill="' + c.clothes + '"/><path class="av-clothes av-shade" d="' + body.clothes + '" fill="' + c.clothesShade + '" clip-path="url(#' + uid + 'rh)"/>' +
    '<path class="av-neck" d="' + body.neck + '" fill="' + c.skin + '"/><ellipse class="av-chest" cx="200" cy="' + body.chestY + '" rx="' + body.chestRx + '" ry="18" fill="' + c.skin + '"/>' +
    '<ellipse cx="200" cy="268" rx="48" ry="24" fill="' + c.skinShade + '"/></g>' +
    '<ellipse cx="120" cy="204" rx="14" ry="21" fill="' + c.skin + '"/><ellipse cx="280" cy="204" rx="14" ry="21" fill="' + c.skin + '"/>' +
    '<ellipse cx="121" cy="206" rx="7" ry="12" fill="' + c.skinShade + '"/><ellipse cx="279" cy="206" rx="7" ry="12" fill="' + c.skinShade + '"/>' +
    AVATAR_EARRINGS[cfg.earrings](c) +
    '<ellipse cx="200" cy="190" rx="80" ry="92" fill="' + c.skin + '"/><path d="M200 98 A80 92 0 0 1 200 282 A56 92 0 0 0 200 98Z" fill="' + c.skinShade + '"/>' +
    '<path d="M193 226 Q200 234 207 226" fill="none" stroke="' + c.skinDark + '" stroke-width="4" stroke-linecap="round"/>' +
    AVATAR_FEATURES[cfg.features](c) + AVATAR_EXPRESSIONS[cfg.expression](c) + AVATAR_NOSE_RINGS[cfg.nosePiercing](c) +
    AVATAR_BEARDS[cfg.facialHair](c) +
    (hasHijab ? '' : '<g class="av-hairfront">' + hair.front(c) + '</g>') +
    AVATAR_HATS[cfg.hat](c) + AVATAR_GLASSES[cfg.glasses](c) + '</svg>';
}

// Ընթացիկ կազմաձևը՝ հաշվից (սերվեր) կամ սարքից (localStorage). null՝ եթե երբեք չի կառուցվել
function currentAvatarConfig() {
  try {
    const fromAccount = account.profile && account.profile.avatar_config;
    if (fromAccount) return normalizeAvatarConfig(fromAccount);
  } catch {}
  try { if (state.avatarConfig) return normalizeAvatarConfig(state.avatarConfig); } catch {}
  return null;
}

// Կողային մենյուի փոքր նկար. դատարկ տող, եթե կազմաձև չկա
function avatarNavIcon() {
  const cfg = currentAvatarConfig();
  return cfg ? renderAvatarSVG(cfg, { crop: 'head' }).replace('<svg ', '<svg class="av-nav" ') : '';
}
