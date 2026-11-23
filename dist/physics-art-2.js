// SVG «երկվորյակներ», շարունակություն (ոճի կանոնը՝ physics-art.js)։ scale (kitchen-scale), cylinder (stone-cylinder), stopwatch (stopwatch)։

// ---------- scale. տուփ 340×190. նժարը իջնում է sink-ի չափով, ցուցմունքը՝ text ----------
PHYS_ART.scale = {
  ref: 'kitchen-scale', w: 340, h: 190, label: 'Թվային կշեռք',
  // state՝ { sink = 0, text = '0' }
  render({ sink = 0, text = '0' } = {}) {
    const group = physBlock(20, 96, 300, 84, '#E5E5E5', { r: 20, depth: 6 }) +
      '<rect x="60" y="112" width="220" height="44" rx="10" fill="#37464F"/>' +
      '<text x="268" y="145" text-anchor="end" font-size="30" font-weight="800" font-family="monospace" fill="#58CC02">' + physEsc(text) + '</text>' +
      '<rect x="150" y="68" width="40" height="32" fill="#AFAFAF"/>' + physBlock(36, 52 + sink, 268, 18, '#AFAFAF', { r: 9, depth: 4 });
    return { group, parts: { panTop: 52 + sink, left: 36, right: 304, cx: 170 } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};

// ---------- cylinder. տուփ 130×300. ջրի մակարդակը՝ level (մլ) ----------
PHYS_ART.cylinder = {
  ref: 'stone-cylinder', w: 130, h: 300, label: 'Չափագլան',
  top: 24, bottom: 270, left: 52, right: 108,
  // state՝ { level = 40, capacity = 100, division = 5, labelEvery = 20, ticks = true }
  render({ level = 40, capacity = 100, division = 5, labelEvery = 20, ticks = true } = {}) {
    const { top, bottom, left, right } = this;
    const y = ml => bottom - ml * (bottom - top) / capacity;
    let marks = '';
    for (let ml = 0; ticks && ml <= capacity + 1e-9; ml += division) {
      const label = Math.abs(ml / labelEvery - Math.round(ml / labelEvery)) < 1e-9;
      marks += '<line x1="' + (label ? 20 : 30) + '" x2="46" y1="' + y(ml) + '" y2="' + y(ml) + '" stroke="#4B4B4B" stroke-width="' + (label ? 2.4 : 1.6) + '"/>';
      if (label) marks += '<text x="14" y="' + (y(ml) + 6) + '" text-anchor="end" font-size="16" font-weight="700" fill="#4B4B4B">' + ml + '</text>';
    }
    const shift = (dx, fill) => '<path d="M' + (left - 4 + dx) + ' ' + (top - 8) + 'V' + (bottom - 8) + 'Q' + (left - 4 + dx) + ' ' + (bottom + 6) + ' ' + (left + 8 + dx) + ' ' + (bottom + 6) + 'H' + (right - 8 - dx) + 'Q' + (right + 4 - dx) + ' ' + (bottom + 6) + ' ' + (right + 4 - dx) + ' ' + (bottom - 8) + 'V' + (top - 8) + 'Z" fill="' + fill + '"/>';
    const water = '<rect x="' + left + '" y="' + y(level) + '" width="' + (right - left) + '" height="' + (bottom + 4 - y(level)) + '" fill="#1CB0F6"/>' +
      '<rect x="' + left + '" y="' + y(level) + '" width="' + (right - left) / 2 + '" height="' + (bottom + 4 - y(level)) + '" fill="#49C0F8"/>';
    const group = shift(0, '#DDF4FF') + '<path d="M' + (left - 4) + ' ' + (top - 8) + 'V' + (bottom - 8) + 'Q' + (left - 4) + ' ' + (bottom + 6) + ' ' + (left + 8) + ' ' + (bottom + 6) + 'H' + (left + 14) + 'V' + (top - 8) + 'Z" fill="#C4ECFF"/>' + water + marks;
    return { group, parts: { surfaceY: y(level), left, right, bottom, top, yOf0: bottom, yOfMax: top } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};

// ---------- stopwatch. տուփ 160×190. սլաքի անկյունը՝ angle (աստիճան, 0՝ վերև), ցուցմունքը՝ text ----------
PHYS_ART.stopwatch = {
  ref: 'stopwatch', w: 160, h: 190, label: 'Վայրկենաչափ',
  render({ angle = 0, text = '' } = {}) {
    let dial = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      dial += '<line x1="' + (80 + Math.sin(a) * 48) + '" y1="' + (108 - Math.cos(a) * 48) + '" x2="' + (80 + Math.sin(a) * 54) + '" y2="' + (108 - Math.cos(a) * 54) + '" stroke="#AFAFAF" stroke-width="3" stroke-linecap="round"/>';
    }
    const rad = angle * Math.PI / 180;
    const group = physBlock(66, 0, 28, 14, '#AFAFAF', { r: 4, depth: 3 }) + '<rect x="74" y="12" width="12" height="20" fill="#AFAFAF"/>' +
      physDisc(80, 108, 70, '#FF9600', 8) + '<circle cx="80" cy="108" r="58" fill="#FFFFFF"/>' + dial +
      (text ? '<text x="80" y="144" text-anchor="middle" font-size="18" font-weight="800" fill="#4B4B4B">' + physEsc(text) + '</text>' : '') +
      '<line x1="80" y1="108" x2="' + (80 + Math.sin(rad) * 42) + '" y2="' + (108 - Math.cos(rad) * 42) + '" stroke="#FF4B4B" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="108" r="6" fill="#37464F"/>';
    return { group, parts: { cx: 80, cy: 108, r: 70 } };
  },
  group(state) { return this.render(state).group; },
  build(state) { return physArtSvg(this, state, this.label); }
};
