// Ցուցադրական անիմացիաներ (1/2). ruler-division (§4), density-compare (§20)։ Նվագարկիչը՝ physics-anim.js, կերպարները՝ physics-art*.js։
const physText = (x, y, text, { size = 18, fill = '#4B4B4B', anchor = 'middle', weight = 800 } = {}) =>
  '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" font-size="' + size + '" font-weight="' + weight + '" fill="' + fill + '">' + physEsc(text) + '</text>';

PHYS_ANIMS['ruler-division'] = physSceneAnim({
  duration: 8000, label: 'Քանոնի բաժանման արժեքի որոշումը', size: [560, 200],
  cues: [
    { at: 0, text: 'Քանոնի սանդղակը՝ միլիմետրերով։' },
    { at: 1500, text: 'Խոշորացնում ենք և նայում 10 և 20 նշումներին։' },
    { at: 3300, text: 'Հաշվում ենք բաժանումները 10-ի և 20-ի միջև։' },
    { at: 6300, html: '<ul class="phys-lines"><li>(<i>20</i> − <i>10</i>) : <i>10</i> = 1 մմ</li></ul>' }
  ],
  scene(t) {
    const from = physTween(t, 1500, 3000, 0, 8);
    const to = physTween(t, 1500, 3000, 30, 22);
    const count = t < 3300 ? -1 : Math.min(10, Math.floor(physPhase(t, 3300, 6200) * 11));
    const hi = count >= 0 ? { from: 10, to: 20, count } : null;
    const x = value => 20 + (value - from) * 520 / (to - from);
    let overlay = '';
    if (t >= 1000) for (const value of [10, 20]) overlay += physText(x(value), 50, value + ' մմ', { fill: '#1899D6' }) + '<path d="M' + x(value) + ' 60V100" stroke="#1CB0F6" stroke-width="3" stroke-dasharray="5 4"/>';
    for (let i = 1; i < count; i++) overlay += '<circle cx="' + x(10 + i) + '" cy="98" r="4" fill="#FF9600"/>';
    if (count >= 1) {
      const size = 16 * Math.min(1.25, physBounce((t - 3300 - (count - 1) * 560) / 1000, { damping: 0.35 }) + 0.2);
      overlay += '<circle cx="' + x(10 + count) + '" cy="84" r="' + size + '" fill="#FF9600"/>' + physText(x(10 + count), 90, count, { fill: '#fff' });
    }
    if (t >= 6300) overlay += '<path d="M' + x(10) + ' 100v-12H' + x(11) + 'v12" fill="none" stroke="#58CC02" stroke-width="4"/>' + physText((x(10) + x(11)) / 2, 76, '1 մմ', { fill: '#3D7A00' });
    return physPlace(PHYS_ART.ruler, { ...PHYS_ART.ruler.poster, from, to, hi }, 0, 102) + overlay;
  }
});

// Երեք նույն ծավալի խորանարդ հերթով ցատկում են կշեռքի նժարին. կշեռքը իջնում է զսպանակաձև, ցուցմունքը փոխվում է
const PHYS_CUBES = [{ name: 'Փայտ', m: 70, color: '#C68642' }, { name: 'Ալյումին', m: 270, color: '#B5BCC4' }, { name: 'Պողպատ', m: 780, color: '#6B7785' }];
PHYS_ANIMS['density-compare'] = physSceneAnim({
  duration: 9000, label: 'Նույն ծավալի երեք խորանարդ կշեռքի վրա', size: [560, 340],
  cues: [
    { at: 0, text: 'Երեք մարմին՝ նույն ծավալով (100 սմ³)։' },
    { at: 3300, text: 'Կշեռքը ցույց է տալիս յուրաքանչյուրի զանգվածը։' },
    { at: 6500, html: '<i>ρ</i> = <i>m</i> / <i>V</i>՝ ամեն մարմնի համար։' },
    { at: 8300, text: 'Ամենախիտը պողպատն է։' }
  ],
  scene(t) {
    const FLY = 1100;
    const start = index => 600 + index * 2900;
    const active = PHYS_CUBES.reduce((found, _, index) => (t >= start(index) ? index : found), -1);
    const land = active >= 0 ? start(active) + FLY : 0;
    const sink = active >= 0 && t >= land ? 12 * physBounce((t - land) / 1000, { damping: 0.3 }) : 0;
    const panTop = 40 + 52 + sink;
    let out = '<line x1="10" x2="190" y1="232" y2="232" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/>';
    PHYS_CUBES.forEach((cube, index) => {
      const home = 46 + index * 56;
      const state = { color: cube.color, shape: 'cube', size: 0.62 };
      if (index > active) out += physPlace(PHYS_ART.cube, state, home, 226);
      else if (index === active) {
        const p = physPhase(t, start(index), start(index) + FLY);
        const x = home + (370 - home) * physEase.inOut(p);
        const y = 226 + (panTop - 226) * physEase.inOut(p) - 70 * Math.sin(Math.PI * p);
        out += physPlace(PHYS_ART.cube, { ...state, size: 0.62 + 0.18 * p }, x, p < 1 ? y : panTop);
      }
    });
    const shown = active >= 0 ? Math.round(PHYS_CUBES[active].m * physEase.out(physPhase(t, land, land + 700))) : 0;
    out += physPlace(PHYS_ART.scale, { sink, text: String(shown) }, 200, 40);
    PHYS_CUBES.forEach((cube, index) => {
      if (t < start(index) + FLY + 800) return;
      const rho = cube.m / 100;
      out += physText(20, 270 + index * 24, cube.name + '. ' + cube.m + ' գ / 100 սմ³ = ' + String(rho).replace('.', ',') + ' գ/սմ³', { anchor: 'start', size: 16, weight: 700, fill: index === 2 && t >= 8300 ? '#3D7A00' : '#4B4B4B' });
    });
    return out;
  }
});
