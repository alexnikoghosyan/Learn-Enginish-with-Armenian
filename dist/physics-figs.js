// SVG սխեմաներ (PLAN.md, Դ). Flow նկարները չեն կարող ճշգրիտ սանդղակներ ու թվեր տալ, ուստի դրանք կոդով են։
//   PHYS_FIGS[id] = { label, svg(params) → '<svg …>', group?(params) → SVG տարրեր (անիմացիայի մեջ ներդնելու համար) }
// Հայերեն պիտակները՝ SVG <text>-ով (էջի տառատեսակ)։ Վերին մակարդակում DOM չկա։
const PHYS_FIGS = {};
const physFig = (width, height, body, label) => '<svg class="phys-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + physEsc(label) + '">' + body + '</svg>';

// Քանոնի հատված ճշգրիտ գծիկներով՝ 10 և 20 նշումներ, նրանց միջև 10 բաժանում
PHYS_FIGS['ruler-ticks'] = {
  label: 'Քանոնի հատված՝ 10 և 20 նշումները և նրանց միջև 10 բաժանումը',
  svg() {
    const x = value => 20 + (value - 5) * 26;
    const ruler = physPlace(PHYS_ART.ruler, { from: 5, to: 25, step: 1, major: 10, width: 520 }, 0, 40);
    const arrow = (value, text) => physText(x(value), 28, text, { fill: '#1899D6' }) + '<path d="M' + x(value) + ' 34V50" stroke="#1CB0F6" stroke-width="3"/>';
    const brace = '<path d="M' + x(10) + ' 150v8H' + x(20) + 'v-8" fill="none" stroke="#58CC02" stroke-width="4" stroke-linejoin="round"/>' + physText((x(10) + x(20)) / 2, 182, '10 բաժանում', { fill: '#3D7A00' });
    return physFig(560, 196, arrow(10, '10 մմ') + arrow(20, '20 մմ') + ruler + brace, this.label);
  }
};

// F–x գրաֆիկ. ուղիղ գիծ սկզբնակետից, չափված կետերով (k = 50 Ն/մ)
PHYS_FIGS['fx-graph'] = {
  label: 'F–x գրաֆիկ՝ ուղիղ գիծ, որը սկսվում է սկզբնակետից',
  svg() {
    const px = f => 70 + f * 100;
    const py = x => 230 - x * 24;
    let ticks = '';
    for (let f = 1; f <= 4; f++) ticks += '<line x1="' + px(f) + '" x2="' + px(f) + '" y1="230" y2="238" stroke="#777" stroke-width="3"/>' + physText(px(f), 262, f, { fill: '#777', size: 18, weight: 700 });
    for (let x = 2; x <= 8; x += 2) ticks += '<line x1="62" x2="70" y1="' + py(x) + '" y2="' + py(x) + '" stroke="#777" stroke-width="3"/>' + physText(52, py(x) + 6, x, { fill: '#777', size: 18, weight: 700, anchor: 'end' });
    const dots = [1, 2, 3, 4].map(f => '<circle cx="' + px(f) + '" cy="' + py(2 * f) + '" r="9" fill="#FF9600"/>').join('');
    const body = '<path d="M70 20V230H500" fill="none" stroke="#AFAFAF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' + ticks +
      '<line x1="70" y1="230" x2="' + px(4.3) + '" y2="' + py(8.6) + '" stroke="#1CB0F6" stroke-width="5" stroke-linecap="round"/>' + dots +
      physText(500, 292, 'F, Ն', { fill: '#4B4B4B', anchor: 'end' }) + physText(80, 24, 'x, սմ', { fill: '#4B4B4B', anchor: 'start' }) + physText(330, 78, 'F = kx', { size: 28, fill: '#1899D6', anchor: 'start' });
    return physFig(560, 300, body, this.label);
  }
};

// Անոթ հեղուկով և ճնշման սլաքներ. սլաքները մեծանում են խորության հետ։ params.depth (0…1)՝ մեկ զոնդ, առանց՝ երեք զոնդ
PHYS_FIGS['pressure-arrows'] = {
  label: 'Անոթ հեղուկով. ճնշման սլաքները մեծանում են խորության հետ',
  group({ depth } = {}) {
    const left = 170;
    const right = 390;
    const top = 50;
    const bottom = 270;
    const probe = (fraction, fixed) => {
      const y = top + (bottom - top) * fraction;
      const length = 12 + 38 * fraction;
      let arrows = '';
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x1 = 280 + dx * 12;
        const y1 = y + dy * 12;
        arrows += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x1 + dx * length) + '" y2="' + (y1 + dy * length) + '" stroke="#FF4B4B" stroke-width="5" stroke-linecap="round"/>';
      }
      return arrows + '<circle cx="280" cy="' + y + '" r="11" fill="#FF9600"/>' + (fixed ? '' : physText(left - 14, y + 6, 'h', { fill: '#4B4B4B', anchor: 'end' }));
    };
    const water = '<rect x="' + (left + 3) + '" y="' + top + '" width="' + (right - left - 6) + '" height="' + (bottom - top) + '" fill="#1CB0F6" fill-opacity=".85"/>' +
      '<path d="M' + left + ' ' + (top - 14) + 'V' + bottom + 'H' + right + 'V' + (top - 14) + '" fill="none" stroke="#AFAFAF" stroke-width="6" stroke-linejoin="round"/>';
    const probes = depth === undefined ? [0.2, 0.52, 0.84].map(fraction => probe(fraction, false)).join('') : probe(depth, false);
    return water + probes + physText(450, 160, 'p', { size: 30, fill: '#E25A00' }) + '<path d="M425 90V240" stroke="#E25A00" stroke-width="3" stroke-linecap="round"/><path d="M417 232L425 244L433 232" fill="none" stroke="#E25A00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  },
  svg(params) { return physFig(560, 300, this.group(params || {}), this.label); }
};

// Միավորների փոխարկման սանդղակ՝ մմ ↔ սմ ↔ մ
PHYS_FIGS['formula-card'] = {
  label: 'Երկարության միավորների փոխարկում՝ մմ, սմ, մ',
  svg() {
    const box = (x, color, text) => physBlock(x, 30, 120, 70, color, { r: 16, depth: 6 }) + physText(x + 60, 76, text, { size: 28, fill: '#fff' });
    const stroke = 'fill="none" stroke="#AFAFAF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
    const gap = (x, divide, multiply) => '<path d="M' + x + ' 52h60m-10 -8l10 8l-10 8" ' + stroke + '/>' + physText(x + 30, 40, divide, { size: 19, fill: '#3D7A00' }) +
      '<path d="M' + (x + 60) + ' 88h-60m10 -8l-10 8l10 8" ' + stroke + '/>' + physText(x + 30, 118, multiply, { size: 19, fill: '#1899D6' });
    const body = box(30, '#58CC02', 'մմ') + box(220, '#1CB0F6', 'սմ') + box(410, '#CE82FF', 'մ') + gap(150, ':10', '×10') + gap(340, ':100', '×100');
    return physFig(560, 136, body, this.label);
  }
};
