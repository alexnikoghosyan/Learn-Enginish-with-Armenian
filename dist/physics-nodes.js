// Ֆիզիկա 7. ուղու կլորակները (Design/physics-path-nodes/*.dc.html). SVG-ները՝ physics-nodes-art.js (գեներացված), CSS-ը՝ physics-nodes.css։
// Շերտերի կարգը (անիմացիաները իրար չեն խանգարում)՝ c- (մեծ, «ՍԿՍԵԼ») > p- (սեղմելու փոքր) > o-rot (պտույտի անկյուն) > h- (մկնիկը վրան) > նկար։
// Վիճակի դասերը (.hov, .tapA/.tapB, .clickA/.clickB, .done/.current/.locked) դրվում են .phys-state-ի վրա (IV գլխում՝ .grp)։
const physNodes = { open: '', busy: false, taps: {}, clicks: {}, timer: 0 };
const PHYS_NODE_WORDS = { done: 'ավարտված', current: 'ընթացիկ դաս', locked: 'փակ' };
const PHYS_CARD_GAP = { 4: 50, 6: 36 }; // պատուհանի հեռավորությունը կլորակի տակից (IV՝ +28, VI՝ +6)
let physNodeUid = 0;

const physNodeCalm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const physNodeStateOf = id => app.querySelector('.phys-state[data-id="' + id + '"]');
const physNodeHovered = state => state.dataset.hover === '1';

// Մեկ կլորակ (li). n՝ գլխի համարը (1–6), section՝ §, status՝ done|current|locked, bend՝ դիրքը ուղու վրա
function physNodeStopHtml(n, section, status, bend) {
  const art = PHYS_NODE_ART[n][status];
  const meta = PHYS_NODE_META[n];
  const uid = ++physNodeUid;
  const title = '§' + section.n + '. ' + section.title;
  const grouped = n === 4;
  const button = '<button type="button" class="phys-btn" aria-label="' + esc(title + ' — ' + PHYS_NODE_WORDS[status]) + '" aria-expanded="false" aria-controls="phys-card-' + section.id + '"' +
    (status === 'locked' ? ' aria-disabled="true"' : '') + (status === 'current' ? ' aria-current="step"' : '') + '>' + art.svg.replace(/\{u\}/g, uid) + '</button>';
  const shell = grouped ? art.spring + '<div class="c-bn"><div class="p-bn"><div class="h-bn">' + button + '</div></div></div>' : button;
  const bubble = status === 'current' ? '<div class="phys-start" aria-hidden="true"><div>ՍԿՍԵԼ<i></i></div></div>' : '';
  return '<li class="path-stop phys-stop ch' + n + ' is-' + status + '" style="--bend:' + bend + ';--pc:' + meta.color + ';--ps:' + meta.shadow + '" data-id="' + section.id + '">' +
    '<div class="phys-state ' + (grouped ? 'grp' : 'node') + ' ' + status + '" data-id="' + section.id + '" data-status="' + status + '">' + shell + bubble + '</div>' +
    '<span class="phys-title"><strong>' + esc(title) + '</strong></span></li>';
}

// Դասի պատուհանը (դիզայնի տեքստերով). soon՝ հաջորդ դասը դեռ պատրաստ չէ
function physCardHtml(section, status, soon) {
  const title = '<div class="phys-card-title">§' + section.n + '. ' + esc(section.title) + '</div>';
  const text = status === 'done' ? 'Ավարտված է։ Կարող ես կրկնել։' : status === 'current' ? 'Հաջորդ դասը քեզ է սպասում։' :
    soon ? 'Այս դասը շուտով կհայտնվի։' : 'Ավարտիր նախորդ դասերը, որ այս դասը բացվի։';
  const button = status === 'locked' ? '<button type="button" class="cta" disabled>' + (soon ? 'ՇՈՒՏՈՎ' : 'ՓԱԿ Է') + '</button>' :
    '<button type="button" class="cta" data-start="' + section.id + '">' + (status === 'done' ? 'ԿՐԿՆԵԼ' : 'ՍԿՍԵԼ') + '</button>';
  return title + '<p>' + text + '</p>' + button;
}

// Սահուն «հանգստացում» մկնիկը հանելիս. ոչինչ կտրուկ չի վերադառնում, պտտվողները ետ չեն գնում (իներցիա, 750 մվ)
function physNodeSettle(root) {
  try {
    if (!root || !root.getAnimations || physNodeCalm()) { if (root) root.classList.remove('hov'); return; }
    const spinners = [];
    root.querySelectorAll('.h-orb,.h-sp,.h-gb').forEach(el => {
      const animations = el.getAnimations().filter(a => a.animationName);
      const rotor = el.parentNode;
      if (!animations.length || !rotor || !rotor.classList || !rotor.classList.contains('o-rot')) return;
      const m = new DOMMatrix(getComputedStyle(el).transform);
      spinners.push({ rotor, ang: Math.atan2(m.b, m.a) * 180 / Math.PI, v: 360 / (Number(animations[0].effect.getTiming().duration) || 1000) });
    });
    const snap = [];
    root.querySelectorAll('*').forEach(el => {
      if (el.classList && (el.classList.contains('h-orb') || el.classList.contains('h-sp') || el.classList.contains('h-gb'))) return;
      const animations = el.getAnimations().filter(a => a.animationName);
      if (animations.length) { const cs = getComputedStyle(el); snap.push({ el, names: animations.map(a => a.animationName).join(','), t: cs.transform, o: cs.opacity }); }
    });
    root.classList.remove('hov');
    const T = 750;
    spinners.forEach(sp => {
      const base = parseFloat(sp.rotor.getAttribute('data-rot') || '0') + sp.ang;
      const end = base + sp.v * T / 3;
      sp.rotor.style.transform = 'rotate(' + end + 'deg)';
      sp.rotor.setAttribute('data-rot', String(end % 360));
      sp.rotor.animate([{ transform: 'rotate(' + base + 'deg)' }, { transform: 'rotate(' + end + 'deg)' }], { duration: T, easing: 'cubic-bezier(.2,.6,.4,1)' });
    });
    snap.forEach(s => {
      const names = s.el.getAnimations().filter(a => a.animationName).map(a => a.animationName).join(',');
      if (names === s.names) return;
      const cs = getComputedStyle(s.el);
      if (cs.transform === s.t && cs.opacity === s.o) return;
      s.el.animate([{ transform: s.t, opacity: s.o }, { transform: cs.transform, opacity: cs.opacity }], { duration: 380, easing: 'cubic-bezier(.2,.7,.3,1)' });
    });
  } catch (error) { if (root) root.classList.remove('hov'); }
}

// Փոքր անիմացիա (սեղմել) / մեծ անիմացիա (ՍԿՍԵԼ). A/B դասերը հերթափոխվում են, որ ամեն անգամ նորից սկսվի
function physNodeFlip(state, store, kind) {
  const id = state.dataset.id;
  store[id] = (store[id] || 0) + 1;
  state.classList.remove(kind + 'A', kind + 'B');
  state.classList.add(kind + (store[id] % 2 ? 'A' : 'B'));
}

// Բաց պատուհանը փակվում է. կլորակը հանգստանում է, եթե մկնիկը վրան չէ
function physNodeCloseCard() {
  const id = physNodes.open;
  if (!id) return;
  physNodes.open = '';
  const stop = app.querySelector('.phys-stop[data-id="' + id + '"]');
  if (!stop) return;
  stop.classList.remove('has-card');
  stop.querySelector('.phys-card')?.remove();
  stop.querySelector('.phys-btn')?.setAttribute('aria-expanded', 'false');
  const state = stop.querySelector('.phys-state');
  if (!physNodeHovered(state)) physNodeSettle(state);
}

// Պատուհանի հորիզոնական դիրքը. կլորակի կենտրոնում, բայց էկրանի (և ուղու) եզրից ≥ 12 px, սլաքը՝ կլորակի վրա
function physNodePlaceCard(stop, card, state) {
  const path = app.querySelector('.phys-path');
  const zoom = parseFloat(getComputedStyle(path).getPropertyValue('--phys-node-scale')) || 1;
  const area = path.getBoundingClientRect();
  const box = stop.getBoundingClientRect();
  const node = state.getBoundingClientRect();
  const center = node.left + node.width / 2;
  const width = 252 * zoom;
  const low = Math.max(12, area.left + 12), high = Math.min(innerWidth - 12, area.right - 12);
  const left = Math.max(low, Math.min(high - width, center - width / 2));
  card.style.left = (left - box.left) / zoom + 'px';
  card.style.setProperty('--arrow', (center - left) / zoom - 8 + 'px');
}

function physNodeOpenCard(id) {
  const stop = app.querySelector('.phys-stop[data-id="' + id + '"]');
  const state = stop.querySelector('.phys-state');
  const status = state.dataset.status;
  const section = physicsSections().find(item => item.id === id);
  const card = document.createElement('div');
  card.className = 'phys-card' + (status === 'locked' ? ' is-locked' : '');
  card.id = 'phys-card-' + id;
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Դասի պատուհան');
  card.innerHTML = physCardHtml(section, status, status === 'locked' && section === physicsNext());
  stop.appendChild(card);
  stop.classList.add('has-card');
  physNodePlaceCard(stop, card, state);
  state.classList.add('hov'); // պատուհանը բաց լինելու ընթացքում կլորակը պահում է hov վիճակը
  stop.querySelector('.phys-btn').setAttribute('aria-expanded', 'true');
  physNodes.open = id;
}

function physNodeToggle(id) {
  if (physNodes.busy) return;
  const previous = physNodes.open;
  const state = physNodeStateOf(id);
  physNodeFlip(state, physNodes.taps, 'tap');
  if (previous) physNodeCloseCard();
  if (previous !== id) physNodeOpenCard(id);
}

async function physNodeOpenLesson(id) {
  if (physNodeCalm()) { openPhysicsLesson(id); return; }
  const out = app.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
  await out.finished.catch(() => {});
  openPhysicsLesson(id);
  out.cancel();
  app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
}

// «ՍԿՍԵԼ» / «ԿՐԿՆԵԼ». մեծ անիմացիա, դասը բացվում է գագաթնակետին (PHYS_NODE_META[n].cut մվ)
function physNodeStart(id) {
  if (physNodes.busy) return;
  const state = physNodeStateOf(id);
  const stop = state.parentElement;
  if (!physNodeHovered(state)) physNodeSettle(state);
  physNodeCloseCard();
  physNodeFlip(state, physNodes.clicks, 'click');
  physNodes.busy = true;
  const cut = PHYS_NODE_META[Number(stop.className.match(/ch(\d)/)[1])].cut;
  physNodes.timer = setTimeout(() => physNodeOpenLesson(id), physNodeCalm() ? 0 : Math.max(0, cut - 120)); // 120 մվ մարումը վերջանում է հենց cut պահին
}

// Կլորակների իրադարձությունները. մկնիկը վրան (միայն hover-ով սարքերում), սեղմում, պատուհանի կոճակ
function physNodeBind(root) {
  root.querySelectorAll('.phys-state').forEach(state => {
    if (matchMedia('(hover: hover)').matches) {
      state.addEventListener('mouseenter', () => { if (physNodes.busy) return; state.dataset.hover = '1'; state.classList.add('hov'); });
      state.addEventListener('mouseleave', () => {
        delete state.dataset.hover;
        if (physNodes.open === state.dataset.id) return; // պատուհանը բաց է. hov-ը մնում է
        physNodeSettle(state);
      });
    }
    state.querySelector('.phys-btn').addEventListener('click', event => { event.stopPropagation(); physNodeToggle(state.dataset.id); });
  });
  root.addEventListener('click', event => {
    const start = event.target.closest('[data-start]');
    if (start) { event.stopPropagation(); physNodeStart(start.dataset.start); }
  });
}

// IV գլխում «ՍԿՍԵԼ» պիտակը կլորակի կողքին է. եթե ձախից տեղ չկա՝ դրվում է աջից
function physNodeBubbles(root) {
  const area = root.getBoundingClientRect();
  root.querySelectorAll('.grp .phys-start').forEach(bubble => {
    const node = bubble.parentElement.getBoundingClientRect();
    bubble.classList.toggle('is-right', node.left - area.left < 104 + 42 + 8);
  });
}

// Կետագծային հետագիծը III գլխում (անիվ). անցնում է կլորակների կենտրոններով, ոլորանները՝ ինչպես դիզայնում
function physNodeTrack(root) {
  root.querySelectorAll('.path-unit').forEach(unit => {
    const list = unit.querySelector('ol');
    list.querySelector('.phys-track')?.remove();
    if (!unit.querySelector('.phys-stop.ch3')) return;
    const origin = list.getBoundingClientRect();
    const points = [...list.querySelectorAll('.phys-btn')].map(button => { const r = button.getBoundingClientRect(); return [r.left + r.width / 2 - origin.left, r.top + r.height / 2 - origin.top]; });
    let d = 'M' + points[0].join(' ');
    for (let i = 1; i < points.length; i++) { const mid = (points[i - 1][1] + points[i][1]) / 2; d += ' C' + points[i - 1][0] + ' ' + mid + ' ' + points[i][0] + ' ' + mid + ' ' + points[i].join(' '); }
    list.insertAdjacentHTML('afterbegin', '<svg class="phys-track" aria-hidden="true" width="' + origin.width + '" height="' + origin.height + '"><path d="' + d + '" fill="none" stroke="#84D8FF" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 14"/></svg>');
  });
}

// Փակում՝ Escape-ով և պատուհանից դուրս սեղմելով (ռեգիստրվում է մեկ անգամ)
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !physNodes.open) return;
    const button = app.querySelector('.phys-stop[data-id="' + physNodes.open + '"] .phys-btn');
    physNodeCloseCard();
    button?.focus();
  });
  document.addEventListener('click', event => {
    if (physNodes.open && !event.target.closest('.phys-card, .phys-state')) physNodeCloseCard();
  });
  window.addEventListener('resize', () => { const root = app.querySelector('.phys-path'); if (root) { physNodeTrack(root); physNodeBubbles(root); if (physNodes.open) { const id = physNodes.open; physNodeCloseCard(); physNodeOpenCard(id); } } });
}

function physNodesReset() {
  clearTimeout(physNodes.timer);
  Object.assign(physNodes, { open: '', busy: false, taps: {}, clicks: {} });
}
