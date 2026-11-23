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
