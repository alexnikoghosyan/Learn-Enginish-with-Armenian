// Ինտերակտիվ գործիքների ընդհանուր հիմքը. վերին մակարդակում DOM-ի հասանելիություն չկա (թեստը բեռնում է vm-ում)։
// Գործիք = { mount(el, params, onChange) → { value(), reset(), destroy() } }
const PHYS_TOOLS = {};
const PHYS_MEASURE = {}; // measure-ի ռեժիմները՝ ruler, scale (ֆայլերը՝ physics-ruler.js, physics-scale.js)
let physUid = 0;

PHYS_TOOLS.measure = {
  mount(el, params, onChange) { return PHYS_MEASURE[params.mode].mount(el, params, onChange); }
};

function physReduced() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Մկնիկի/մատի կետը SVG-ի viewBox-ի կոորդինատներով
function physPoint(svg, event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

// Քաշում Pointer Events-ով (մկնիկ, մատ, գրիչ)։ handlers՝ { start(p), move(p, origin), end(p) }
function physDrag(target, svg, handlers) {
  target.addEventListener('pointerdown', event => {
    if (event.button > 0) return;
    event.preventDefault();
    target.setPointerCapture(event.pointerId);
    const origin = physPoint(svg, event);
    if (handlers.start) handlers.start(origin);
    const move = moved => handlers.move(physPoint(svg, moved), origin);
    const stop = ended => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', stop);
      target.removeEventListener('pointercancel', stop);
      if (handlers.end) handlers.end(physPoint(svg, ended));
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
  });
}

// requestAnimationFrame-ի ցիկլ. frame(dt վայրկյաններով) վերադարձնում է true, քանի դեռ անիմացիան շարունակվում է
function physLoop(frame) {
  let id = 0;
  let last = 0;
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    id = frame(dt) ? requestAnimationFrame(tick) : 0;
  };
  return {
    wake() { if (!id) { last = performance.now(); id = requestAnimationFrame(tick); } },
    stop() { cancelAnimationFrame(id); id = 0; }
  };
}

// Սանդղակի գծիկներ [from, to] միջակայքում. x(value)՝ կոորդինատ, long/mid/short՝ գծիկի երկարությունները,
// major՝ երկար գծիկների քայլը (1՝ սմ/մլ-ի համար, 10՝ մմ-ի համար), hot(value)՝ ընդգծված գծիկ (գույն կամ null)
function physTicks(from, to, step, x, y, { long = 30, mid = 21, short = 14, labels = true, size = 18, major = 1, hot = () => null } = {}) {
  let out = '';
  for (let i = Math.ceil(from / step - 1e-9); i * step <= to + 1e-9; i++) {
    const value = Number((i * step).toFixed(4));
    const whole = Math.abs(value / major - Math.round(value / major)) < 1e-6;
    const half = Math.abs(value * 2 / major - Math.round(value * 2 / major)) < 1e-6;
    const length = whole ? long : half ? mid : short;
    const color = hot(value) || '#5a4600';
    out += '<line x1="' + x(value) + '" x2="' + x(value) + '" y1="' + y + '" y2="' + (y + length) + '" stroke="' + color + '" stroke-width="' + (whole ? 2.4 : 1.6) + '"/>';
    if (whole && labels) out += '<text x="' + x(value) + '" y="' + (y + long + size + 3) + '" text-anchor="middle" font-size="' + size + '" font-weight="700" fill="' + (hot(value) || '#5a4600') + '">' + Math.round(value) + '</text>';
  }
  return out;
}
