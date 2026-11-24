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
    // Բեռը՝ hook-weight նկար (physics-sprites.js), մի քանի բեռ կախվում են իրար տակ. նկար չկա՝ հին գլանաձև բլոկ
    const sprite = loads ? physSprite('hook-weight', 32) : null;
    let weights = '';
    let bottom = end + 22 + loads * 34;
    if (sprite) {
      // Ստորին բեռի օղակը թաքնվում է վերինի տակ (վերինները նկարվում են վերջում), ուստի կախված են իրար տակ
      const pitch = sprite.h * 0.9;
      bottom = end + 14 + (loads - 1) * pitch + sprite.h;
      for (let i = loads - 1; i >= 0; i--) weights += '<g transform="translate(100 ' + (end + 14 + i * pitch + sprite.h / 2) + ')">' + sprite.svg + '</g>';
    } else {
      // Բեռը՝ գլանաձև (էլիպսաձև վերին երես), ամրակը՝ L-աձև (պատի թիթեղ + թև)
      const weight = (y, color) => {
        const t = physTone(color);
        return '<rect x="62" y="' + (y + 5) + '" width="76" height="28" rx="8" fill="' + t.dark + '"/><rect x="62" y="' + y + '" width="76" height="28" rx="8" fill="' + t.base +
          '"/><rect x="62" y="' + y + '" width="38" height="28" rx="8" fill="' + t.light + '"/><ellipse cx="100" cy="' + (y + 4) + '" rx="38" ry="6" fill="' + t.light + '"/>';
      };
      for (let i = 0; i < loads; i++) weights += weight(end + 22 + i * 34, i % 2 ? '#FFC800' : '#C6C1CC');
    }
    const group = physBlock(24, 0, 152, 16, '#5388C9', { r: 6, depth: 4 }) + physBlock(24, 0, 18, 64, '#5388C9', { r: 6, depth: 4 }) + coil(4, '#63488A') + coil(0, '#D486FD') +
      '<rect x="97" y="' + end + '" width="6" height="' + (loads ? (sprite ? 18 : 22) : 14) + '" fill="#C6C1CC"/>' + weights;
    return { group, parts: { top, endY: end, bottom } };
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
    // Հորիզոնական երկու շերտ՝ վերևում բաց, ներքևում մուգ, տակը՝ հաստություն
    const body = '<rect x="0" y="14" width="' + bodyWidth + '" height="78" rx="10" fill="#9C650A"/><rect x="0" y="8" width="' + bodyWidth + '" height="78" rx="10" fill="#E0A408"/>' +
      '<path d="M0 36V18a10 10 0 0 1 10-10H' + (bodyWidth - 10) + 'a10 10 0 0 1 10 10V36Z" fill="#FFDB4B"/>';
    const group = body + physTicks(from, to, step, x, 8, { major, hot });
    return { group, parts: { k, x0, x0Value: from, y: 8, height: 78 } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};

// ---------- cube (three-cubes). սկզբնակետը՝ ներքևի կենտրոնում, տարրը ձգվում է վերև ----------
PHYS_ART.cube = {
  ref: 'three-cubes', w: 120, h: 110, label: 'Մարմին',
  colors: ['#B97B40', '#BFBEBE', '#454448'], // Flow նկարի երեք խորանարդների գույները (փայտ, ալյումին, մուգ). palette-ի ստուգումը միավորում է դրանք
  // state՝ { color, shape: 'cube'|'round'|'flat'|'tall', size = 1 }
  render({ color = '#B5BCC4', shape = 'cube', size = 1 } = {}) {
    const dims = { cube: [72, 72], flat: [88, 48], tall: [56, 92], round: [72, 72] }[shape] || [72, 72];
    const [w, h] = dims.map(value => value * size);
    const depth = 6 * size;
    if (shape === 'cube') { // իզոմետրիկ խորանարդ՝ վերին երես (բաց), ձախ (հիմնական), աջ (մուգ)
      const a = w / 2, b = w / 4, s = h * 0.66, tone = physTone(color);
      const poly = (points, fill) => '<polygon points="' + points + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="1" stroke-linejoin="round"/>';
      const body = poly(-a + ',' + -b + ' 0,0 0,' + -(2 * b + s - b) + ' ' + -a + ',' + -(b + s), tone.base) + poly('0,0 ' + a + ',' + -b + ' ' + a + ',' + -(b + s) + ' 0,' + -(2 * b + s - b), tone.dark) +
        poly(-a + ',' + -(b + s) + ' 0,' + -(2 * b + s) + ' ' + a + ',' + -(b + s) + ' 0,' + -(b + s - b), tone.light);
      return { group: body, parts: { width: w, height: 2 * b + s } };
    }
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
