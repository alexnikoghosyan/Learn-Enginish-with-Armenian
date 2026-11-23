// Ֆիզիկայի մաքուր ֆունկցիաներ (առանց DOM-ի). նշագրումը՝ ըստ դասագրքի (ρ = m/V)։
function physParseNumber(text) {
  const clean = String(text).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(clean) ? Number(clean) : NaN;
}

// tol՝ բացարձակ թիվ կամ { rel: 0.02 }
function physClose(value, target, tol = 0) {
  const limit = typeof tol === 'object' ? Math.abs(target) * tol.rel : tol;
  return Math.abs(value - target) <= limit + 1e-9;
}

function physDecimals(step) {
  return (String(step).split('.')[1] || '').length;
}

function physRound(value, step) {
  return Number((Math.round(value / step) * step).toFixed(physDecimals(step)));
}

// Թիվը հայերեն ձևով (ստորակետ) ըստ բաժանման արժեքի
function physFormat(value, step = 1) {
  return value.toFixed(physDecimals(step)).replace('.', ',');
}

// Ազատ անկման արագացումը Ն/կգ-ով. ՄԻԱՅՆ մոտավոր 10 է, ստուգել դասագրքում (§24, էջ 74–78)
const PHYS_G = 10;

const physDensity = (mass, volume) => mass / volume;
const physMass = (density, volume) => density * volume;
const physVolume = (mass, density) => mass / density;
const physElastic = (stiffness, x) => stiffness * x;
const physStiffness = (force, x) => force / x;
const physWeight = (mass, g = PHYS_G) => mass * g;
const physHydro = (density, depth, g = PHYS_G) => density * g * depth;

// Միավորը ՄՀ-ի համապատասխան միավորի վերածող գործակիցներ
const PHYS_UNITS = {
  length: { 'մմ': 0.001, 'սմ': 0.01, 'մ': 1 },
  mass: { 'գ': 0.001, 'կգ': 1 },
  volume: { 'սմ³': 1e-6, 'մլ': 1e-6, 'լ': 1e-3, 'մ³': 1 },
  density: { 'կգ/մ³': 1, 'գ/սմ³': 1000 }
};

function physConvert(value, from, to) {
  const group = Object.values(PHYS_UNITS).find(units => from in units && to in units);
  if (!group) return NaN;
  return Number((value * group[from] / group[to]).toPrecision(12));
}

// Դասի քայլերում թվային պատասխանը գրվում է calc: { fn, args }-ով, որպեսզի թեստը ստուգի այն այստեղի բանաձևերով
const PHYS_CALC = { physDensity, physMass, physVolume, physElastic, physStiffness, physWeight, physHydro, physConvert };
const physCalc = ({ fn, args }) => PHYS_CALC[fn](...args);

// Դասի sim քայլի նպատակը. conditions = [{ key, value, tol? }], tol չկա՝ խիստ հավասարություն
function physGoalMet(goal, current) {
  return goal.every(({ key, value, tol }) =>
    tol === undefined ? current[key] === value : Math.abs(current[key] - value) <= tol + 1e-9);
}

// ---------- Անիմացիաների օգնականներ (ժամանակի մաքուր ֆունկցիաներ) ----------
const physClamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const physPhase = (t, t0, t1) => physClamp((t - t0) / (t1 - t0));
const physEase = {
  linear: k => k,
  inOut: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  out: k => 1 - Math.pow(1 - k, 3),
  back: k => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2)
};
const physTween = (t, t0, t1, from, to, ease = physEase.inOut) => from + (to - from) * ease(physPhase(t, t0, t1));

function physLerpColor(a, b, k) {
  const part = (hex, i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  return '#' + [0, 1, 2].map(i => Math.round(part(a, i) + (part(b, i) - part(a, i)) * physClamp(k)).toString(16).padStart(2, '0')).join('');
}

// Զսպանակաձև (մարող տատանում) շարժում t վայրկյանում. 0-ից սկսվում է, անցնում է 1-ից, տատանվում և կանգնում 1-ի վրա
function physSpring(t, { freq = 2.2, damping = 0.18 } = {}) {
  if (t <= 0) return 0;
  const omega = 2 * Math.PI * freq;
  return 1 - Math.exp(-damping * omega * t) * Math.cos(omega * Math.sqrt(1 - damping * damping) * t);
}
