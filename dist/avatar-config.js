// Ավատարի կոնստրուկտոր. տվյալների մոդել, գունապնակներ և ՕՐԻԳԻՆԱԼ SVG նկարազարդում։
// Ոճը՝ «չիբի» հարթ վեկտոր. հսկայական կլորացված քառակուսի գլուխ, մեծ սպիտակ աչքեր՝ միայն մուգ բիբով, մեծ վարդագույն քիթ,
// փոքր բերան, ՈՉ մի ստվեր, վիզ չկա (գլուխը նստում է իրանի վրա), մուգ նեղացող իրան՝ ներքևի գոտիով։
// Կոորդինատներ՝ viewBox 0 0 400 546. գլուխը՝ x 90–310, y 120–335 (լայնությունը՝ կադրի 55%-ը). աչքերը y=205, քիթը y≈246, բերանը y≈282։
const AVATAR_VERSION = 2;
const AVATAR_DEFAULT = {
  v: AVATAR_VERSION, skin: 1, body: 2, eyeColor: 0, expression: 1,
  hairColor: 1, hair: 3, glassesColor: 1, glasses: 0, features: 0,
  earrings: 0, nosePiercing: 0, facialHair: 0,
  hatColor: 8, hat: 0, clothesColor: 8, bgColor: 0
};

// Յուրաքանչյուր դաշտի տարբերակների քանակը (աշխատողի վավերացումը ունի նույն աղյուսակը՝ worker/account.mjs)
const AVATAR_RANGES = {
  skin: 15, body: 6, eyeColor: 13, expression: 12, hairColor: 16, hair: 12, glassesColor: 8, glasses: 5,
  features: 5, earrings: 5, nosePiercing: 3, facialHair: 6, hatColor: 9, hat: 6, clothesColor: 9, bgColor: 24
};

const AVATAR_PALETTES = {
  skin: ['#6e3d3a', '#7d4a3f', '#8c4a25', '#97513f', '#985c30', '#a46648', '#b76e45', '#c6775c', '#e18e70', '#e59d65', '#f2a07d', '#ffb89d', '#ffc6b7', '#ffcba3', '#ffe2d6'],
  // Աչքի գույնը ներկում է բիբը (լռելյայն՝ #3d3d3d)
  eyeColor: ['#3d3d3d', '#6b3f21', '#7d7a2e', '#3f9a4c', '#1f9a9a', '#2f7fd6', '#8793a0', '#7a4fcf', '#c13db0', '#f06aa8', '#e04545', '#f28a1b', '#f2c81b'],
  hairColor: ['#1d1b1f', '#3b2418', '#58361f', '#7a4c28', '#9a6a3c', '#b5412a', '#8a7867', '#c47a37', '#f5992b', '#f2e2b3', '#c9ccd3', '#f5f5f5', '#f58bc0', '#a56be0', '#4aa3f0', '#58cc02'],
  glassesColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ff9600', '#e63946', '#f58bc0', '#f2e2b3', '#2b2b33'],
  hatColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ffc800', '#ff9600', '#e63946', '#f58bc0', '#f5f5f5', '#575757'],
  clothesColor: ['#8254dc', '#1cb0f6', '#58cc02', '#ffc800', '#ff9600', '#c9254a', '#f58bc0', '#f5f5f5', '#424242'],
  bgColor: ['#afafaf', '#cfcfd6', '#8d8d98', '#5f5f6a', '#d9c8fb', '#b48cf2', '#9a6fe0', '#cfe8ff', '#8fd0f8', '#4ab4f2', '#1f8fd9', '#bdf0e3',
    '#7ddcc4', '#bfe9a0', '#8fd656', '#58cc02', '#fff0a8', '#ffd666', '#ffb347', '#ff9600', '#ffc4d6', '#ff8fb0', '#ff6b6b', '#e63946']
};

// Մարմնի տեսակներ. նեղ → լայն «կիսանդրի»։ sw՝ ուսերի կես լայնություն (գլխի տակ), bw՝ ներքևի կես լայնություն (y=800).
// Բոլորը նույն կառուցվածքն ունեն, ուստի թվերը սահուն մորֆվում են։ Ուսերը՝ կլոր, ձեռքեր/թևեր չկան։
const AVATAR_BODIES = [
  { sw: 84, bw: 147, ty: 316 }, { sw: 96, bw: 168, ty: 316 }, { sw: 108, bw: 189, ty: 316 },
  { sw: 120, bw: 210, ty: 316 }, { sw: 132, bw: 231, ty: 316 }, { sw: 144, bw: 252, ty: 316 }
];

// Տեսախցիկներ (viewBox). ձևաչափը մոտ է 502:685 դիմանկարին. գլուխը լցնում է կադրի ~55%-ը
const AVATAR_CAMERAS = {
  medium: [0, 0, 400, 546], body: [0, 0, 400, 546], face: [50, 26, 300, 409],
  bust: [40, 60, 320, 320], head: [60, 50, 280, 280]
};

function avatarMix(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}
const avatarLum = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
// Տոն-տոնի վրա (seam, գոտի). մուգ գույնը՝ մի փոքր ավելի մուգ, բաց գույնը՝ մի փոքր ավելի մուգ նույնպես
const avatarSeam = (hex, k = .2) => avatarMix(hex, '#000000', k);

const AVATAR_V1_HAIR = [0, 1, 2, 3, 11, 4, 11, 5, 6, 7];
const AVATAR_V1_HAT = [0, 4, 1, 4, 3, 3];

function normalizeAvatarConfig(config) {
  const src = config && typeof config === 'object' ? { ...config } : {};
  if (src.v !== AVATAR_VERSION) {
    if (Number.isInteger(src.hair) && src.hair >= 0 && src.hair < AVATAR_V1_HAIR.length) src.hair = AVATAR_V1_HAIR[src.hair];
    if (Number.isInteger(src.hat) && src.hat >= 0 && src.hat < AVATAR_V1_HAT.length) src.hat = AVATAR_V1_HAT[src.hat];
  }
  const out = { ...AVATAR_DEFAULT };
  for (const key of Object.keys(AVATAR_RANGES)) {
    const value = Number(src[key]);
    if (Number.isInteger(value) && value >= 0 && value < AVATAR_RANGES[key]) out[key] = value;
  }
  return out;
}

// Իրան. վիզ չկա, գլուխը ծածկում է վերին եզրը։ Ուսերը կլորացված, ներքևում՝ գոտու շերտ (hemY…)
const HEM_Y = 498, HEM_H = 400;
function avatarBodyAttrs(p) {
  const cx = 200, { sw, bw, ty } = p, n = v => +v.toFixed(2);
  return {
    clothes: 'M' + n(cx - bw) + ' 800 L' + n(cx - sw) + ' ' + (ty + 40) + ' Q' + n(cx - sw) + ' ' + ty + ' ' + n(cx - sw + 40) + ' ' + ty +
      ' L' + n(cx + sw - 40) + ' ' + ty + ' Q' + n(cx + sw) + ' ' + ty + ' ' + n(cx + sw) + ' ' + (ty + 40) + ' L' + n(cx + bw) + ' 800Z'
  };
}

// ---------- Գլուխ և դեմք ----------
const HEAD_PATH = 'M156 120 H244 C280 120 310 150 310 186 V269 C310 305 280 335 244 335 H156 C120 335 90 305 90 269 V186 C90 150 120 120 156 120Z';
const EYE_Y = 205, EYE_L = 160, EYE_R = 240;
const avatarHeart = (x, y, s, fill) => '<path d="M' + x + ' ' + (y + 9 * s) + ' C' + (x - 18 * s) + ' ' + (y - 2 * s) + ' ' + (x - 10 * s) + ' ' + (y - 16 * s) + ' ' + x +
  ' ' + (y - 6 * s) + ' C' + (x + 10 * s) + ' ' + (y - 16 * s) + ' ' + (x + 18 * s) + ' ' + (y - 2 * s) + ' ' + x + ' ' + (y + 9 * s) + 'Z" fill="' + fill + '"/>';

// Աչք՝ մեծ պարզ սպիտակ օվալ + փոքր մուգ բիբ (առանց ծիածանաթաղանթի, փայլի և թարթիչների)
function avatarEye(x, c, rx = 34, ry = 28, pr = 1) {
  return '<ellipse cx="' + x + '" cy="' + EYE_Y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff"/>' +
    '<g class="av-iris"><ellipse cx="' + (x + 2) + '" cy="' + (EYE_Y + 3) + '" rx="' + (9.5 * pr).toFixed(1) + '" ry="' + (14 * pr).toFixed(1) + '" fill="' + c.eye + '"/></g>';
}
const avatarLine = (d, color, w = 7) => '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
const avatarBrow = (c, d, w = 9) => avatarLine(d, c.brow, w);
const RED = '#cd4949', TONGUE = '#eba99d';
const NOSE = c => '<path d="M183 247 C183 233 192 229 200 229 C208 229 217 233 217 247 C217 261 209 265 200 265 C191 265 183 261 183 247Z" fill="' + c.nose + '"/>';
const smileMouth = '<path d="M174 278 Q200 272 226 278 Q224 308 200 308 Q176 308 174 278Z" fill="' + RED + '"/><path d="M187 300 Q200 288 213 300 Q200 309 187 300Z" fill="' + TONGUE + '"/>';
const openMouth = '<path d="M164 276 Q200 268 236 276 Q234 322 200 322 Q166 322 164 276Z" fill="' + RED + '"/><path d="M182 311 Q200 294 218 311 Q200 322 182 311Z" fill="' + TONGUE + '"/>';
const blush = '<ellipse cx="126" cy="262" rx="16" ry="10" fill="#ff6f86" opacity=".5"/><ellipse cx="274" cy="262" rx="16" ry="10" fill="#ff6f86" opacity=".5"/>';

const AVATAR_EXPRESSIONS = [
  /* 0 չեզոք */ c => '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + '<ellipse cx="200" cy="284" rx="11" ry="5" fill="' + RED + '"/>',
  /* 1 ժպիտ */ c => '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + smileMouth,
  /* 2 բաց ժպիտ */ c => '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + openMouth,
  /* 3 լեզու */ c => '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + '<path d="M174 278 Q200 272 226 278 Q224 300 200 300 Q176 300 174 278Z" fill="' + RED + '"/><path d="M190 292 V312 Q200 324 210 312 V292Z" fill="' + TONGUE + '"/>',
  /* 4 աչքով անել */ c => '<g class="av-eyes">' + avatarLine('M126 212 Q160 188 194 212', c.line, 9) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + smileMouth,
  /* 5 զարմացած */ c => avatarBrow(c, 'M126 160 Q160 146 194 158') + avatarBrow(c, 'M206 158 Q240 146 274 160') + '<g class="av-eyes">' + avatarEye(EYE_L, c, 35, 31, .85) + avatarEye(EYE_R, c, 35, 31, .85) + '</g>' + NOSE(c) + '<ellipse cx="200" cy="294" rx="11" ry="15" fill="' + RED + '"/>',
  /* 6 տխուր */ c => avatarBrow(c, 'M126 168 L190 150') + avatarBrow(c, 'M210 150 L274 168') + '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + NOSE(c) + avatarLine('M180 300 Q200 280 220 300', RED, 8),
  /* 7 զայրացած */ c => avatarBrow(c, 'M124 152 L192 172', 10) + avatarBrow(c, 'M208 172 L276 152', 10) + '<g class="av-eyes">' + avatarEye(EYE_L, c, 34, 24) + avatarEye(EYE_R, c, 34, 24) + '</g>' + NOSE(c) + avatarLine('M182 298 Q200 282 218 298', RED, 8),
  /* 8 քնկոտ */ c => '<g class="av-eyes">' + avatarLine('M126 204 Q160 224 194 204', c.line, 9) + avatarLine('M206 204 Q240 224 274 204', c.line, 9) + '</g>' + NOSE(c) + '<ellipse cx="200" cy="286" rx="9" ry="5" fill="' + RED + '"/>',
  /* 9 ուրախ փակ աչք */ c => '<g class="av-eyes">' + avatarLine('M126 216 Q160 186 194 216', c.line, 9) + avatarLine('M206 216 Q240 186 274 216', c.line, 9) + '</g>' + NOSE(c) + openMouth,
  /* 10 սրտաձև աչքեր */ c => '<g class="av-eyes">' + '<ellipse cx="' + EYE_L + '" cy="' + EYE_Y + '" rx="34" ry="28" fill="#fff"/><ellipse cx="' + EYE_R + '" cy="' + EYE_Y + '" rx="34" ry="28" fill="#fff"/>' + avatarHeart(EYE_L, 203, 1.7, '#ff4b6e') + avatarHeart(EYE_R, 203, 1.7, '#ff4b6e') + '</g>' + NOSE(c) + smileMouth,
  /* 11 ժպիտ կարմրությամբ */ c => '<g class="av-eyes">' + avatarEye(EYE_L, c) + avatarEye(EYE_R, c) + '</g>' + blush + NOSE(c) + smileMouth
];

// ---------- Մազեր ----------
// { back՝ գլխի հետևում, front՝ վերևի/ճակատի մասը (թաքնվում է ցանկացած գլխարկի տակ), extras՝ կողքերը/պոչը (միշտ երևում են) }. Հարթ գույն, առանց ստվերի
const hairPath = (d, c) => '<path d="' + d + '" fill="' + c.hair + '"/>';
const mirror = d => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (m, x, y) => (400 - Number(x)) + ' ' + y);
const HAIR_CAP = 'M86 196 C78 112 126 98 200 98 C274 98 322 112 314 196 C306 166 286 152 262 148 Q200 138 138 148 C114 152 94 166 86 196Z';
const AVATAR_HAIR = [
  /* 0 ճաղատ */ { back: () => '', front: () => '', extras: () => '' },
  /* 1 ծայրակարճ */ { back: () => '', front: c => hairPath('M92 182 C90 132 120 120 200 120 C280 120 310 132 308 182 C296 154 262 144 200 144 C138 144 104 154 92 182Z', c), extras: () => '' },
  /* 2 կարճ */ { back: () => '', front: c => hairPath(HAIR_CAP, c), extras: () => '' },
  /* 3 կարճ քուֆ */ { back: () => '', front: c => hairPath('M86 192 C78 120 112 100 150 98 C160 70 206 58 246 70 C292 84 322 118 314 192 C306 166 286 152 262 148 Q200 138 138 148 C114 152 94 166 86 192Z', c) + hairPath('M146 100 C152 66 206 46 262 66 C226 70 196 80 184 104Z', c), extras: () => '' },
  /* 4 քառակուսի */ { back: c => hairPath('M74 236 C66 110 124 66 200 66 C276 66 334 110 326 236 L322 322 C280 346 120 346 78 322Z', c), front: c => hairPath(HAIR_CAP, c), extras: () => '' },
  /* 5 գանգրացած */ { back: () => '', front: c => ['108,150,28', '138,118,34', '184,102,37', '232,102,37', '266,118,34', '294,150,28', '90,188,20', '310,188,20'].map(s => { const [x, y, r] = s.split(',').map(Number); return hairPath('M' + (x - r) + ' ' + y + ' a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0 a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z', c); }).join(''), extras: () => '' },
  /* 6 կլոր փունջ փոքր սրածայրով */ { back: () => '', front: c => hairPath('M84 194 C68 78 138 36 200 36 C262 36 332 78 316 194 C310 166 296 152 274 148 Q244 144 200 170 Q156 144 126 148 C104 152 90 166 84 194Z', c), extras: () => '' },
  /* 7 վերևի կապ */ { back: () => '', front: c => hairPath(HAIR_CAP, c) + hairPath('M166 76 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0Z', c), extras: () => '' },
  /* 8 կողքի պոչ */ { back: () => '', front: c => hairPath(HAIR_CAP, c), extras: c => hairPath('M104 150 C52 158 36 214 52 266 C62 304 50 334 66 356 C98 342 116 300 110 258 C106 220 124 194 130 160Z', c) + '<circle cx="112" cy="152" r="11" fill="' + avatarSeam(c.hair, .3) + '"/>' },
  /* 9 գլխաշոր պոչով */ { back: () => '', front: c => hairPath('M84 196 C76 106 128 88 200 88 C272 88 324 106 316 196 C292 160 262 150 232 148 L200 176 L168 148 C138 150 108 160 84 196Z', c), extras: c => hairPath('M100 168 L64 344 L118 344 L132 190Z', c) },
  /* 10 երկար ծածկող */ { back: c => hairPath('M70 232 C64 100 130 58 200 58 C270 58 336 100 330 232 L340 396 L60 396Z', c), front: c => hairPath(HAIR_CAP, c), extras: c => hairPath('M84 150 C68 244 74 340 82 388 L126 388 C120 326 118 244 122 160Z', c) + hairPath(mirror('M84 150 C68 244 74 340 82 388 L126 388 C120 326 118 244 122 160Z'), c) },
  /* 11 օվալ՝ կորացված բաժանումով */ { back: c => hairPath('M78 232 C66 92 130 50 200 50 C270 50 334 92 322 232 C328 302 290 384 200 390 C110 384 72 302 78 232Z', c), front: c => hairPath(HAIR_CAP, c) + '<path d="M206 100 C196 124 172 142 146 150" fill="none" stroke="' + avatarSeam(c.hair, .3) + '" stroke-width="6" stroke-linecap="round"/>', extras: () => '' }
];

// ---------- Մորուք ----------
// Լրիվ մորուքը՝ մաշկից աստիճանաբար (gradient) անցնում է մազի գույնին, ինչպես հղման մեջ
const MOUSTACHE = (c, curl = false) => '<path d="M164 270 C178 258 194 262 200 270 C206 262 222 258 236 270 C224 280 208 275 200 277 C192 275 176 280 164 270Z" fill="' + c.hair + '"/>' +
  (curl ? '<path d="M164 270 q-16 -2 -14 -18 M236 270 q16 -2 14 -18" fill="none" stroke="' + c.hair + '" stroke-width="7" stroke-linecap="round"/>' : '');
const BEARD = 'M90 252 L310 252 L310 269 C310 305 282 342 244 342 H156 C118 342 90 305 90 269Z';
const AVATAR_BEARDS = [
  () => '', c => MOUSTACHE(c),
  c => MOUSTACHE(c) + '<path d="M180 308 C184 298 216 298 220 308 C222 326 178 326 180 308Z" fill="' + c.hair + '"/>',
  c => '<path d="' + BEARD + '" fill="url(#' + c.uid + 'bd)"/>' + MOUSTACHE(c),
  c => '<path d="' + BEARD + '" fill="url(#' + c.uid + 'bd)" opacity=".45"/>',
  c => MOUSTACHE(c, true)
];

// ---------- Գլխարկներ ----------
// { back՝ գլխի հետևում (օր. պոչ), front՝ գլխի վրա }. Խիտ նստում են գլխին՝ ճակատը ծածկելով (ինչպես հղման գլխարկը), ստորին եզրը ≤176
const hatPath = (d, c) => '<path d="' + d + '" fill="' + c.hat + '"/>';
const DOME = 'M92 172 C82 76 128 52 200 52 C272 52 318 76 308 172Z';
const BRIM_BAND = 'M82 152 C130 138 270 138 318 152 L320 178 C270 164 130 164 80 178Z';
const capSeams = c => '<g fill="none" stroke="' + c.hatSeam + '" stroke-width="5" stroke-linecap="round"><path d="M200 56 C176 92 168 132 174 160"/><path d="M200 56 C224 92 232 132 226 160"/><path d="M200 56 V150"/><path d="M200 56 C150 76 112 108 100 150"/><path d="M200 56 C250 76 288 108 300 150"/></g><circle cx="200" cy="50" r="9" fill="' + c.hatSeam + '"/>';
const capBrim = c => '<path d="' + BRIM_BAND + '" fill="' + c.hatBrim + '"/>';
const AVATAR_HATS = [
  { back: () => '', front: () => '' },
  /* 1 բինի */ { back: () => '', front: c => hatPath('M92 156 C84 76 130 58 200 58 C270 58 316 76 308 156Z', c) + '<path d="M140 62 C132 50 150 44 164 52" fill="none" stroke="' + c.hatSeam + '" stroke-width="9" stroke-linecap="round"/><path d="M82 138 H318 V170 Q318 178 310 178 H90 Q82 178 82 170Z" fill="' + c.hatBrim + '"/>' },
  /* 2 կողիկավոր բինի */ { back: () => '', front: c => hatPath('M92 156 C84 76 130 58 200 58 C270 58 316 76 308 156Z', c) + '<g fill="none" stroke="' + c.hatSeam + '" stroke-width="5" stroke-linecap="round"><path d="M128 74 V138 M156 62 V138 M184 58 V138 M216 58 V138 M244 62 V138 M272 74 V138"/></g><path d="M82 138 H318 V170 Q318 178 310 178 H90 Q82 178 82 170Z" fill="' + c.hatBrim + '"/><g stroke="' + c.hat + '" stroke-width="4" stroke-linecap="round"><path d="M110 146 V170 M138 146 V170 M166 146 V170 M194 146 V170 M222 146 V170 M250 146 V170 M278 146 V170"/></g>' },
  /* 3 դյուրագ */ { back: c => '<path d="M104 150 L68 330 L116 340 L140 176Z" fill="' + c.hatBrim + '"/>', front: c => hatPath('M88 180 C82 98 128 84 200 84 C272 84 318 98 312 180 C280 164 120 164 88 180Z', c) + '<path d="M200 86 V168" stroke="' + c.hatSeam + '" stroke-width="5" stroke-linecap="round" fill="none"/>' },
  /* 4 բեյսբոլի գլխարկ */ { back: () => '', front: c => hatPath(DOME, c) + capSeams(c) + capBrim(c) },
  /* 5 English Garden գլխարկ (բնօրինակ նշան՝ բողբոջ) */ { back: () => '', front: c => hatPath(DOME, c) + capSeams(c) + capBrim(c) +
    '<g fill="#fff" opacity=".96"><path d="M198 124 C178 124 168 110 170 94 C188 94 199 108 198 124Z"/><path d="M202 120 C222 120 232 106 230 90 C212 90 201 104 202 120Z"/><rect x="198.5" y="118" width="3" height="16" rx="1.5"/></g>' }
];

// ---------- Լրացումներ (նոր գլխին հարմարեցված) ----------
const AVATAR_GLASSES = [
  () => '',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="6"><circle cx="160" cy="205" r="38"/><circle cx="240" cy="205" r="38"/><path d="M197 200 Q200 194 203 200"/><path d="M122 200 L96 194 M278 200 L304 194"/></g>',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="6"><rect x="118" y="176" width="78" height="58" rx="14"/><rect x="204" y="176" width="78" height="58" rx="14"/><path d="M196 196 H204"/><path d="M118 192 L96 188 M282 192 L304 188"/></g>',
  c => '<g stroke="' + c.glasses + '" stroke-width="6"><rect x="118" y="176" width="78" height="58" rx="16" fill="#2a2a35" opacity=".94"/><rect x="204" y="176" width="78" height="58" rx="16" fill="#2a2a35" opacity=".94"/><path d="M196 192 H204" fill="none"/><path d="M118 190 L96 188 M282 190 L304 188" fill="none"/></g>',
  c => '<g fill="none" stroke="' + c.glasses + '" stroke-width="6" stroke-linejoin="round"><path d="M120 190 L196 176 Q202 208 190 230 Q154 244 124 226Z"/><path d="M280 190 L204 176 Q198 208 210 230 Q246 244 276 226Z"/></g>'
];
const AVATAR_FEATURES = [
  () => '',
  c => [[132, 250], [146, 262], [160, 252], [140, 274], [240, 252], [254, 262], [268, 250], [260, 274]].map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="' + c.freckle + '"/>').join(''),
  () => blush,
  c => '<path d="M270 150 L290 200" stroke="' + c.freckle + '" stroke-width="5" stroke-linecap="round"/><path d="M262 168 L284 162 M266 182 L288 176" stroke="' + c.freckle + '" stroke-width="4" stroke-linecap="round"/>',
  c => '<path d="M136 148 Q200 136 264 148 M144 164 Q200 154 256 164" fill="none" stroke="' + c.freckle + '" stroke-width="4" stroke-linecap="round"/>'
];
const GOLD = '#f5c542', SILVER = '#d7dbe3';
const earring = (fill, hoop) => [89, 311].map(x => hoop ? '<circle cx="' + x + '" cy="252" r="12" fill="none" stroke="' + fill + '" stroke-width="4"/>' : '<circle cx="' + x + '" cy="244" r="6" fill="' + fill + '"/>').join('');
const AVATAR_EARRINGS = [() => '', () => earring(GOLD, false), () => earring(SILVER, false), () => earring(GOLD, true), () => earring(SILVER, true)];
const AVATAR_NOSE_RINGS = [
  () => '',
  () => '<circle cx="214" cy="252" r="4" fill="' + GOLD + '"/>',
  () => '<circle cx="210" cy="258" r="8" fill="none" stroke="' + GOLD + '" stroke-width="3"/>'
];

function avatarContext(cfg, uid) {
  const P = AVATAR_PALETTES, skin = P.skin[cfg.skin], hair = P.hairColor[cfg.hairColor], hat = P.hatColor[cfg.hatColor], clothes = P.clothesColor[cfg.clothesColor];
  // Փակ աչքերի/հոնքերի/պեպենների գույնը՝ մաշկից ածանցված, միշտ ավելի մուգ՝ ցանկացած երանգի վրա կարդացվում է
  const line = avatarMix(skin, '#150609', .8);
  const brow = Math.abs(avatarLum(hair) - avatarLum(skin)) > .3 ? avatarMix(hair, '#150609', .2) : line;
  return {
    uid, skin, line, brow, freckle: avatarMix(skin, '#2a0f1c', .45),
    // Քիթ՝ մաշկը վարդագույն-կարմրավուն (≈ #ee9583 #ffc6b7-ի վրա)
    nose: avatarMix(skin, '#d9604f', .45), eye: P.eyeColor[cfg.eyeColor],
    hair, glasses: P.glassesColor[cfg.glassesColor], hat, hatBrim: avatarSeam(hat, .3), hatSeam: avatarSeam(hat, .2),
    clothes, hem: avatarMix(clothes, avatarLum(clothes) > .5 ? '#000000' : '#ffffff', .1), bg: P.bgColor[cfg.bgColor]
  };
}

let avatarUid = 0;
// renderAvatarSVG(config, { crop | viewBox, size, bg, animate, body: {sw,bw,ty} })
function renderAvatarSVG(config, opts = {}) {
  const cfg = normalizeAvatarConfig(config);
  const uid = 'av' + (++avatarUid) + '-';
  const c = avatarContext(cfg, uid);
  const vb = opts.viewBox || AVATAR_CAMERAS[opts.crop || 'medium'];
  const body = avatarBodyAttrs(opts.body || AVATAR_BODIES[cfg.body]);
  const hair = AVATAR_HAIR[cfg.hair], hat = AVATAR_HATS[cfg.hat], hatOn = cfg.hat > 0;
  const size = opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '';
  const animate = opts.animate ? ' class="av-animate"' : '';
  const bg = opts.bg === false ? '' : '<rect x="-600" y="-600" width="1600" height="2200" fill="' + c.bg + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + size + animate + ' preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ավատար" focusable="false">' +
    '<defs><linearGradient id="' + uid + 'bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.hair + '" stop-opacity="0"/><stop offset=".3" stop-color="' + c.hair + '" stop-opacity="0"/><stop offset=".7" stop-color="' + c.hair + '" stop-opacity=".95"/><stop offset="1" stop-color="' + c.hair + '"/></linearGradient>' +
    '<clipPath id="' + uid + 'cl"><path class="av-clothes" d="' + body.clothes + '"/></clipPath></defs>' + bg +
    '<g class="av-hairback">' + hair.back(c) + '</g>' + hat.back(c) +
    '<g class="av-torso"><path class="av-clothes" d="' + body.clothes + '" fill="' + c.clothes + '"/><g clip-path="url(#' + uid + 'cl)"><rect x="-200" y="' + HEM_Y + '" width="800" height="' + HEM_H + '" fill="' + c.hem + '"/></g></g>' +
    '<rect x="76" y="206" width="30" height="46" rx="14" fill="' + c.skin + '"/><rect x="294" y="206" width="30" height="46" rx="14" fill="' + c.skin + '"/>' +
    AVATAR_EARRINGS[cfg.earrings](c) +
    '<path d="' + HEAD_PATH + '" fill="' + c.skin + '"/>' +
    AVATAR_BEARDS[cfg.facialHair](c) +
    AVATAR_FEATURES[cfg.features](c) + AVATAR_EXPRESSIONS[cfg.expression](c) + AVATAR_NOSE_RINGS[cfg.nosePiercing](c) +
    (hatOn ? '' : '<g class="av-hairfront">' + hair.front(c) + '</g>') + '<g class="av-hairextras">' + hair.extras(c) + '</g>' +
    hat.front(c) + AVATAR_GLASSES[cfg.glasses](c) + '</svg>';
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
