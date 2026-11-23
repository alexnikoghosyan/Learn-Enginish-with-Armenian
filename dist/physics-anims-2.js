// Ցուցադրական անիմացիաներ (2/2). spring-double (§25), hydro-depth (§43), fall-observe (§3)։ physText-ը՝ physics-anims.js-ում։

// Բեռը կրկնապատկվում է → ձգումը կրկնապատկվում է. F–x կետերը դասավորվում են ուղղի վրա։ Սկսվում է spring-weight նկարի հանգիստ վիճակից (PHYS_ART.spring.poster)
PHYS_ANIMS['spring-double'] = physSceneAnim({
  duration: 8000, label: 'Բեռը կրկնապատկվում է, և զսպանակի ձգումը կրկնապատկվում է', size: [560, 340],
  cues: [
    { at: 0, text: 'Զսպանակ՝ մեկ բեռով։' },
    { at: 3300, text: 'Երկրորդ բեռ՝ ձգումը կրկնապատկվում է։' },
    { at: 5800, html: '<i>F</i> մեծացավ 2 անգամ → <i>x</i> մեծացավ 2 անգամ։' }
  ],
  scene(t) {
    const poster = PHYS_ART.spring.poster;
    const stretch = 60 + 60 * physBounce((t - 3500) / 1000, { damping: 0.3 });
    const second = t >= 3500;
    let out = physPlace(PHYS_ART.spring, { ...poster, length: 70 + stretch, loads: second ? 2 : poster.loads }, 40, 0);
    out += '<path d="M330 40V270H540" fill="none" stroke="#AFAFAF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      physText(540, 296, 'F', { fill: '#777' }) + physText(318, 40, 'x', { fill: '#777', anchor: 'end' });
    const points = [[1, 60, 700], [2, 120, 5200]].filter(point => t >= point[2]);
    if (points.length === 2) out += '<line x1="330" y1="270" x2="' + (330 + 100 + 100 * physEase.out(physPhase(t, 5200, 5900))) + '" y2="' + (270 - 60 - 60 * physEase.out(physPhase(t, 5200, 5900))) + '" stroke="#1CB0F6" stroke-width="4" stroke-linecap="round"/>';
    else if (points.length === 1) out += '<line x1="330" y1="270" x2="' + (330 + 100 * physEase.out(physPhase(t, 700, 1400))) + '" y2="' + (270 - 60 * physEase.out(physPhase(t, 700, 1400))) + '" stroke="#1CB0F6" stroke-width="4" stroke-linecap="round"/>';
    points.forEach(([f, x, at]) => {
      out += '<circle cx="' + (330 + f * 100) + '" cy="' + (270 - x) + '" r="' + 9 * Math.min(1.2, physBounce((t - at) / 1000, { damping: 0.35 })) + '" fill="#FF9600"/>';
    });
    if (t >= 5800) out += physText(470, 130, '2×', { size: 34, fill: '#3D7A00' });
    return out;
  }
});

// Ճնշումը մեծանում է խորության հետ, իսկ նույն խորության վրա անոթի ձևից կախված չէ. p = ρgh
const physVessel = (cx, top, bottom, level, y0) => {
  const points = (cx - top / 2) + ',' + y0 + ' ' + (cx - bottom / 2) + ',' + (y0 + level) + ' ' + (cx + bottom / 2) + ',' + (y0 + level) + ' ' + (cx + top / 2) + ',' + y0;
  return '<polygon points="' + points + '" fill="#1CB0F6" fill-opacity=".85"/><polyline points="' + points + '" fill="none" stroke="#AFAFAF" stroke-width="6" stroke-linejoin="round"/>';
};
PHYS_ANIMS['hydro-depth'] = physSceneAnim({
  duration: 10000, label: 'Հիդրոստատիկ ճնշումը խորության հետ', size: [560, 300],
  cues: [
    { at: 0, text: 'Զոնդը իջնում է հեղուկի մեջ։' },
    { at: 2200, text: 'Որքան խորն է, այնքան ճնշումը մեծ է։' },
    { at: 5200, text: 'Երեք տարբեր անոթ՝ նույն խորությունը։' },
    { at: 7600, text: 'Ճնշումը բոլորում նույնն է։' },
    { at: 9000, html: '<i>p</i> = <i>ρgh</i>' }
  ],
  scene(t) {
    if (t < 5000) return '<g opacity="' + (1 - physPhase(t, 4600, 5000)) + '">' + PHYS_FIGS['pressure-arrows'].group({ depth: physTween(t, 500, 4200, 0.05, 1, physEase.out) }) + '</g>';
    const depth = physTween(t, 5600, 7400, 0.1, 0.75, physEase.out);
    let out = '<g opacity="' + physPhase(t, 5000, 5400) + '">';
    [[100, 150, 150], [280, 56, 56], [460, 140, 50]].forEach(([cx, top, bottom]) => {
      const y = 70 + 170 * depth;
      const length = 14 + 26 * depth;
      out += physVessel(cx, top, bottom, 190, 60) + '<circle cx="' + cx + '" cy="' + y + '" r="10" fill="#FF9600"/>';
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) out += '<line x1="' + (cx + dx * 12) + '" y1="' + (y + dy * 12) + '" x2="' + (cx + dx * (12 + length)) + '" y2="' + (y + dy * (12 + length)) + '" stroke="#FF4B4B" stroke-width="4" stroke-linecap="round"/>';
    });
    return out + '</g>';
  }
});

// Դիտում (նայում ենք) և փորձ (ժամանակը չափում ենք վայրկենաչափով)
PHYS_ANIMS['fall-observe'] = physSceneAnim({
  duration: 8000, label: 'Դիտում և փորձ. գնդակի անկում', size: [560, 300],
  cues: [
    { at: 0, text: 'Դիտում՝ պարզապես նայում ենք, թե ինչ է լինում։' },
    { at: 3600, text: 'Փորձ՝ ժամանակը չափում ենք վայրկենաչափով։' },
    { at: 6200, text: 'Փորձը տալիս է թիվ, որը կարելի է համեմատել։' }
  ],
  scene(t) {
    const GROUND = 248;
    const drop = (from, to) => (t < from ? 40 : t >= to ? GROUND : 40 + (GROUND - 40) * Math.pow(physPhase(t, from, to), 2));
    let y = 40;
    let label = '';
    if (t < 2400) { y = drop(600, 1500); label = 'Դիտում'; }
    else if (t < 3600) y = physTween(t, 2400, 3600, GROUND, 40);
    else { y = drop(4200, 5100); label = 'Փորձ'; }
    const landed = t >= 1500 ? (t < 2400 ? 1500 : 5100) : 99999;
    const since = (t - landed) / 1000;
    if (since > 0 && since < 2 && (t < 2400 || t >= 4200)) y -= 36 * Math.exp(-3.5 * since) * Math.abs(Math.sin(since * 9));
    const squash = since > 0 && since < 0.25 ? 1 - 0.25 * (1 - since / 0.25) : 1;
    const watch = t >= 4200 ? Math.min(t, 5100) - 4200 : 0;
    const reading = t >= 5100 ? '0,9 վ' : '';
    return '<line x1="20" x2="260" y1="' + (GROUND + 28) + '" y2="' + (GROUND + 28) + '" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/>' +
      '<g transform="translate(130 ' + (y + 22) + ') scale(' + (2 - squash) + ' ' + squash + ') translate(-130 -' + (y + 22) + ')">' + physDisc(130, y, 22, '#FF4B4B', 5) + '</g>' +
      (label ? physText(130, 24, label, { size: 22, fill: label === 'Փորձ' ? '#E25A00' : '#1899D6' }) : '') +
      physPlace(PHYS_ART.stopwatch, { angle: watch * 0.12, text: reading }, 340, 40);
  }
});
