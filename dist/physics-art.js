// SVG «երկվորյակներ». Flow նկարների կոդային կրկնօրինակներ, որոնք կարող են շարժվել (PLAN.md, Ե2)։
// Ոճի կանոն՝ երկու հարթ տոն (բաց/մուգ կես), տակից տեղաշարժված մուգ «հաստության» շերտ, առանց եզրագծի, առանց փայլի, առանց դեմքի,
// Duolingo գունապնակ (#1CB0F6 #58CC02 #FFC800 #FF9600 #CE82FF #FF4B4B #AFAFAF)։ Գույները՝ physics-src/palettes/<ref>.json-ից, եթե Flow նկարը կա։
//   PHYS_ART[id] = { ref, w, h, group(state) → SVG տարրեր art-ի սեփական կոորդինատներով, build(state) → { svg, parts } }
//   parts՝ շարժվող տարրերի թվային դիրքերը (օր.՝ զսպանակի ծայրի y), որպեսզի անիմացիան/գործիքը այլ տարրեր դնի դրանց մոտ։
// Վերին մակարդակում DOM չկա։ Մնացած կերպարները՝ physics-art-2.js (scale, cylinder, stopwatch)։
const PHYS_ART = {};
const physTone = color => ({ light: physLerpColor(color, '#ffffff', 0.22), base: color, dark: physLerpColor(color, '#000000', 0.2) });

// Ուղղանկյուն՝ երկու տոնով (ձախ կես՝ բաց) և մուգ «հաստության» շերտով ներքևում
function physBlock(x, y, w, h, color, { r = 8, depth = 6 } = {}) {
  const tone = physTone(color);
  const rect = (dx, dy, width, fill) => '<rect x="' + dx + '" y="' + dy + '" width="' + width + '" height="' + h + '" rx="' + r + '" fill="' + fill + '"/>';
  return rect(x, y + depth, w, tone.dark) + rect(x, y, w, tone.base) + '<rect x="' + x + '" y="' + y + '" width="' + w / 2 + '" height="' + h + '" rx="' + Math.min(r, w / 4) + '" fill="' + tone.light + '"/>';
}

// Շրջան՝ նույն կանոնով
function physDisc(cx, cy, r, color, depth = 6) {
  const tone = physTone(color);
  return '<circle cx="' + cx + '" cy="' + (cy + depth) + '" r="' + r + '" fill="' + tone.dark + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + tone.base +
    '"/><path d="M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + 'Z" fill="' + tone.light + '"/>';
}

const physArtSvg = (art, state, label) => {
  const { group, parts } = art.render(state);
  return { svg: '<svg class="phys-svg" viewBox="0 0 ' + art.w + ' ' + art.h + '" role="img" aria-label="' + label + '">' + group + '</svg>', parts };
};

// ---------- spring (spring-weight). տուփ 200×330, ամրակը վերևում, բեռները ներքևում ----------
PHYS_ART.spring = {
  ref: 'spring-weight', w: 200, h: 330, label: 'Զսպանակ բեռով',
  poster: { length: 130, loads: 1 }, // Flow նկարի հանգիստ վիճակը. spring-double անիմացիան սկսվում է հենց դրանից (24d)
  // state՝ { length = 90 (զսպանակի երկարությունը), loads = 0 (բեռների քանակը) }
  render({ length = 90, loads = 0 } = {}) {
    const top = 16;
    const end = top + length;
    let points = '100,' + top;
    for (let i = 1; i < 13; i++) points += ' ' + (100 + (i % 2 ? 28 : -28)) + ',' + (top + 6 + (length - 12) * i / 13);
    points += ' 100,' + end;
    const coil = (dy, color) => '<polyline points="' + points + '" transform="translate(0 ' + dy + ')" fill="none" stroke="' + color + '" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>';
    const tone = physTone('#AFAFAF');
    let weights = '';
    for (let i = 0; i < loads; i++) weights += physBlock(62, end + 22 + i * 34, 76, 28, i % 2 ? '#FFC800' : '#1CB0F6', { r: 8, depth: 5 });
    const group = physBlock(24, 0, 152, 16, '#AFAFAF', { r: 6, depth: 4 }) + coil(4, tone.dark) + coil(0, tone.base) +
      '<rect x="97" y="' + end + '" width="6" height="' + (loads ? 22 : 14) + '" fill="' + tone.dark + '"/>' + weights;
    return { group, parts: { top, endY: end, bottom: end + 22 + loads * 34 } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};

// ---------- ruler (ruler). տուփ 560×96. սանդղակը՝ [from, to] միջակայքում ----------
PHYS_ART.ruler = {
  ref: 'ruler', w: 560, h: 96, label: 'Քանոն',
  poster: { from: 0, to: 30, step: 1, major: 10 }, // ruler-division անիմացիայի սկզբնական (t = 0) վիճակը
  // state՝ { from = 0, to = 12, step = 0.1, major = 1, width = 520 (սանդղակի լայնությունը), x0 = 20, bodyWidth = 560, hi: { from, to, count } (ընդգծվող գծիկներ) }
  render({ from = 0, to = 12, step = 0.1, major = 1, width = 520, x0 = 20, bodyWidth = 560, hi = null } = {}) {
    const k = width / (to - from);
    const x = value => x0 + (value - from) * k;
    const hot = hi ? value => (value >= hi.from - 1e-9 && value <= hi.to + 1e-9 && (value - hi.from) / step <= hi.count + 1e-9 ? '#E25A00' : null) : undefined;
    const group = physBlock(0, 8, bodyWidth, 78, '#FFC800', { r: 10, depth: 6 }) + physTicks(from, to, step, x, 8, { major, hot });
    return { group, parts: { k, x0, x0Value: from, y: 8, height: 78 } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};

// ---------- cube (three-cubes). սկզբնակետը՝ ներքևի կենտրոնում, տարրը ձգվում է վերև ----------
PHYS_ART.cube = {
  ref: 'three-cubes', w: 120, h: 110, label: 'Մարմին',
  // state՝ { color, shape: 'cube'|'round'|'flat'|'tall', size = 1 }
  render({ color = '#B5BCC4', shape = 'cube', size = 1 } = {}) {
    const dims = { cube: [72, 72], flat: [88, 48], tall: [56, 92], round: [72, 72] }[shape] || [72, 72];
    const [w, h] = dims.map(value => value * size);
    const depth = 6 * size;
    const body = shape === 'round' ? physDisc(0, -h / 2 - depth, w / 2, color, depth) : physBlock(-w / 2, -h - depth, w, h, color, { r: 10 * size, depth });
    return { group: body, parts: { width: w, height: h + depth } };
  },
  group(state) { return this.render(state).group; },
  build(state) {
    const r = this.render(state);
    return { svg: '<svg class="phys-svg" viewBox="0 0 120 110" role="img" aria-label="' + this.label + '"><g transform="translate(60 104)">' + r.group + '</g></svg>', parts: r.parts };
  }
};

// art-ի տարրը դնում է տեսարանում՝ (x, y) դիրքով և scale-ով
const physPlace = (art, state, x, y, scale = 1) => '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')">' + art.group(state) + '</g>';
