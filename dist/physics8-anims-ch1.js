// Ֆիզիկա 8, գլուխ I-ի անիմացիաներ։ p8-bus և drip-track (§1). drip-track՝ երկու կաթոցիկով սայլակ. նույն ճանապարհը, նույն ժամանակը,
// բայց մեկի կաթիլները հավասարահեռ են, մյուսինը՝ ոչ։ Նվագարկիչը՝ physics-anim.js
const PHYS_DRIP_GAPS = [[55, 55, 55, 55, 55, 55, 55, 55], [20, 35, 55, 80, 100, 80, 50, 20]];
const PHYS_DRIP_TICK = 700;
const PHYS_DRIP_START = 600;

// Կաթիլների x դիրքերը (առաջինը՝ մեկնարկի կետում)
const physDripMarks = gaps => gaps.reduce((marks, gap) => marks.concat(marks[marks.length - 1] + gap), [60]);

function physDripCart(x, ground, color) {
  return '<g transform="translate(' + x + ' ' + ground + ')"><rect x="-30" y="-34" width="60" height="22" rx="6" fill="' + color + '"/>' +
    '<rect x="-7" y="-52" width="14" height="18" rx="4" fill="#1CB0F6"/>' +
    '<circle cx="-17" cy="-10" r="10" fill="#4B4B4B"/><circle cx="17" cy="-10" r="10" fill="#4B4B4B"/></g>';
}

// Կեռ (§1). ավտոբուսը արագանում, դանդաղում, կանգնում է կանգառում և նորից շարժվում
const physBusX = t => (t < 5000 ? physTween(t, 500, 4000, 80, 290) : physTween(t, 6000, 9000, 290, 480));
PHYS_ANIMS['p8-bus'] = physSceneAnim({
  duration: 9500, label: 'Ավտոբուսը շարժվում է, կանգնում կանգառում և նորից շարժվում', size: [560, 200],
  cues: [
    { at: 0, text: 'Ավտոբուսը արագանում է։' },
    { at: 2300, text: 'Կանգառին մոտենալիս դանդաղում է։' },
    { at: 4000, text: 'Կանգնած է։' },
    { at: 6000, text: 'Նորից շարժվում է։' }
  ],
  scene(t) {
    const x = physBusX(t);
    const windows = [-48, -18, 12].map(dx => '<rect x="' + dx + '" y="-62" width="24" height="22" rx="4" fill="#DDF4FF"/>').join('');
    return '<line x1="10" x2="550" y1="164" y2="164" stroke="#E5E5E5" stroke-width="8" stroke-linecap="round"/>' +
      '<line x1="360" x2="360" y1="160" y2="50" stroke="#AFAFAF" stroke-width="6" stroke-linecap="round"/><circle cx="360" cy="46" r="18" fill="#1CB0F6"/>' + physText(360, 54, 'Կ', { size: 22, fill: '#fff' }) +
      '<g transform="translate(' + x + ' 160)"><rect x="-60" y="-74" width="120" height="62" rx="14" fill="#FFC800"/>' + windows + '<rect x="42" y="-62" width="12" height="40" rx="4" fill="#DDF4FF"/>' +
      '<circle cx="-34" cy="-10" r="14" fill="#4B4B4B"/><circle cx="34" cy="-10" r="14" fill="#4B4B4B"/></g>';
  }
});

PHYS_ANIMS['drip-track'] = physSceneAnim({
  duration: 7400, label: 'Կաթոցիկով երկու սայլակ. հավասարաչափ և անհավասարաչափ շարժում', size: [560, 260],
  cues: [
    { at: 0, text: 'Կաթիլներն ընկնում են հավասար ժամանակամիջոցներում։' },
    { at: 2600, text: 'Վերևում կաթիլների միջև հեռավորությունները հավասար են, ներքևում՝ ոչ։' },
    { at: 6200, text: 'Ներքևի սայլակի շարժումը անհավասարաչափ է։' }
  ],
  scene(t) {
    const step = physClamp((t - PHYS_DRIP_START) / PHYS_DRIP_TICK, 0, 8);
    const whole = Math.floor(step);
    return PHYS_DRIP_GAPS.map((gaps, row) => {
      const ground = 94 + row * 130;
      const marks = physDripMarks(gaps);
      const x = marks[whole] + (whole < 8 ? gaps[whole] * (step - whole) : 0);
      const drops = marks.slice(0, whole + 1).map(mark => '<circle cx="' + mark + '" cy="' + (ground + 12) + '" r="6" fill="#1CB0F6"/>').join('');
      return physText(20, ground - 66, row ? 'Անհավասարաչափ' : 'Հավասարաչափ', { anchor: 'start', size: 22, fill: row ? '#E25A00' : '#1899D6' }) +
        '<line x1="20" x2="540" y1="' + ground + '" y2="' + ground + '" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/>' +
        drops + physDripCart(x, ground, row ? '#FF9600' : '#58CC02');
    }).join('');
  }
});
