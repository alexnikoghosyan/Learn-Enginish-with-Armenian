// Ավատարի կոնստրուկտոր (/profile/avatar). Ձախ՝ կենդանի նախադիտում (SVG), աջ՝ 9 ներդիր և տարբերակների վահանակ։
// Վարքը՝ գույնի փոփոխությունը՝ մեկ կադրում (առանց անցման), ներդիրի փոփոխությունը՝ վահանակը մեկ կադրում փոխվում է,
// նկարիչները 220 մվ-ում բացվում են շարք առ շարք (40 մվ ուշացումով), մարմնի տեսակը՝ սահուն մորֆով (~320 մվ),
// տեսախցիկը՝ 200 մվ ease-out, իսկ ավատարը անընդհատ թարթում է, նայում է կողքերը և «շնչում»։
const avIcon = body => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
const AVATAR_TABS = [
  { label: 'Մաշկ', cam: 'medium', icon: avIcon('<path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/>'),
    sections: [{ title: 'Մաշկի գույն', field: 'skin', type: 'swatch', cols: 6 }] },
  { label: 'Մարմին', cam: 'body', icon: avIcon('<circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-4.5 3-7 7-7s7 2.5 7 7"/>'),
    sections: [{ title: 'Մարմին', field: 'body', type: 'thumb', cols: 3, crop: [30, 235, 340, 340] }] },
  { label: 'Դեմք', cam: 'face', icon: avIcon('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5Q12 18 15.5 14.5"/><path d="M9 10h.01M15 10h.01"/>'),
    sections: [{ title: 'Աչքերի գույն', field: 'eyeColor', type: 'swatch', cols: 6 },
      { title: 'Դեմքի արտահայտություն', field: 'expression', type: 'thumb', cols: 3, crop: [100, 110, 200, 200] }] },
  { label: 'Մազեր', cam: 'face', icon: avIcon('<path d="M5 14C5 7 9 4 12 4s7 3 7 10c-2-3-4-4.5-7-4.5S7 11 5 14Z"/><path d="M5 14v4M19 14v4"/>'),
    sections: [{ title: 'Մազերի գույն', field: 'hairColor', type: 'swatch', cols: 6 },
      { title: 'Սանրվածք', field: 'hair', type: 'thumb', cols: 3, crop: [70, 30, 260, 260] }] },
  { label: 'Ակնոց և այլն', cam: 'face', icon: avIcon('<circle cx="7.5" cy="13" r="3.5"/><circle cx="16.5" cy="13" r="3.5"/><path d="M11 13h2M4 12 3 9M20 12l1-3"/>'),
    sections: [{ title: 'Ակնոցի գույն', field: 'glassesColor', type: 'swatch', cols: 6 },
      { title: 'Ակնոց', field: 'glasses', type: 'thumb', cols: 3, crop: [90, 120, 220, 220] },
      { title: 'Դեմքի առանձնահատկություններ', field: 'features', type: 'thumb', cols: 3, crop: [90, 100, 220, 220] },
      { title: 'Ականջօղեր', field: 'earrings', type: 'thumb', cols: 3, crop: [80, 140, 240, 240] },
      { title: 'Քթի օղ', field: 'nosePiercing', type: 'thumb', cols: 3, crop: [130, 160, 140, 140] }] },
  { label: 'Մորուք', cam: 'face', icon: avIcon('<path d="M3 11c4-3 7-1 9 0 2-1 5-3 9 0-3 4-7 1-9 2-2-1-6 2-9-2Z"/>'),
    sections: [{ title: 'Մորուք և բեղ', field: 'facialHair', type: 'thumb', cols: 3, crop: [100, 150, 200, 200] }] },
  { label: 'Գլխարկ', cam: 'face', icon: avIcon('<path d="M5 15c0-7 4-10 8-10s6 3 6 10Z"/><path d="M3 15h19"/>'),
    sections: [{ title: 'Գլխարկի գույն', field: 'hatColor', type: 'swatch', cols: 6 },
      { title: 'Գլխարկ', field: 'hat', type: 'thumb', cols: 3, crop: [60, 20, 280, 280] }] },
  { label: 'Հագուստ', cam: 'medium', icon: avIcon('<path d="M8 4 3 8l2.5 3L8 9.5V20h8V9.5l2.5 1.5L21 8l-5-4c-1 2-7 2-8 0Z"/>'),
    sections: [{ title: 'Հագուստի գույն', field: 'clothesColor', type: 'swatch', cols: 6 }] },
  { label: 'Ֆոն', cam: 'medium', icon: avIcon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 16 6-6 5 5 3-3 4 4"/><circle cx="16" cy="8.5" r="1.3"/>'),
    sections: [{ title: 'Ֆոնի գույն', field: 'bgColor', type: 'swatch', cols: 6 }] }
];

let avatarDraft = null, avatarInitial = '', avatarTab = 0, avatarCam = null, avatarCamRaf = 0, avatarBodyRaf = 0;
let avatarIdleTimers = [], avatarSaving = false, avatarCamTimer = 0, avatarBodyTimer = 0;
const avatarThumbCache = new Map();
const avatarReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const avatarEase = t => 1 - Math.pow(1 - t, 3);

function openAvatarBuilder() {
  view = 'profile';
  renderNavigation();
  avatarDraft = normalizeAvatarConfig(currentAvatarConfig());
  avatarInitial = JSON.stringify(avatarDraft);
  avatarTab = 0;
  avatarCam = AVATAR_CAMERAS[AVATAR_TABS[0].cam].slice();
  drawAvatarBuilder();
  window.scrollTo(0, 0);
}

function closeAvatarBuilder() {
  stopAvatarIdle();
  go('profile');
}

function drawAvatarBuilder() {
  stopAvatarIdle();
  app.innerHTML = '<div class="avatar-builder"><header class="avatar-head"><button type="button" class="icon-btn avatar-back" aria-label="Հետ" onclick="closeAvatarBuilder()">' +
    avIcon('<path d="M19 12H5m6-6-6 6 6 6"/>') + '</button><h1>Փոխել ավատարը</h1></header>' +
    '<section class="avatar-card"><div class="avatar-preview" id="avatar-preview"></div><div class="avatar-editor">' +
    '<div class="avatar-tabs" role="tablist" aria-label="Ավատարի մասեր">' + AVATAR_TABS.map((tab, index) =>
      '<button type="button" role="tab" class="av-tab" id="av-tab-' + index + '" aria-label="' + tab.label + '" aria-selected="' + (index === avatarTab) +
      '" tabindex="' + (index === avatarTab ? 0 : -1) + '" data-tip="' + tab.label + '" onclick="selectAvatarTab(' + index + ')" onkeydown="avatarTabKey(event,' + index + ')">' + tab.icon + '</button>').join('') +
    '</div><div class="avatar-panel" id="avatar-panel" role="tabpanel" tabindex="-1"></div></div></section>' +
    '<div class="avatar-actions"><p id="avatar-status" role="status"></p><button type="button" class="avatar-done" id="avatar-done" disabled onclick="saveAvatarBuilder()">Պատրաստ է</button></div></div>';
  paintAvatarPreview();
  paintAvatarPanel(false);
  startAvatarIdle();
}

function paintAvatarPreview(bodyParams) {
  const holder = document.getElementById('avatar-preview');
  if (holder) holder.innerHTML = renderAvatarSVG(avatarDraft, { viewBox: avatarCam, animate: true, body: bodyParams });
}

// ---------- Ներդիրներ ----------
function selectAvatarTab(index) {
  if (index === avatarTab) return;
  avatarTab = index;
  document.querySelectorAll('.av-tab').forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    if (i === index) tab.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
  paintAvatarPanel(true);
  tweenAvatarCamera(AVATAR_CAMERAS[AVATAR_TABS[index].cam]);
}

function avatarTabKey(event, index) {
  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
  if (!step && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? AVATAR_TABS.length - 1 : (index + step + AVATAR_TABS.length) % AVATAR_TABS.length;
  selectAvatarTab(next);
  document.getElementById('av-tab-' + next)?.focus();
}

function tweenAvatarCamera(target) {
  cancelAnimationFrame(avatarCamRaf);
  clearTimeout(avatarCamTimer);
  const from = avatarCam.slice(), to = target.slice();
  if (avatarReduced()) { avatarCam = to; setAvatarViewBox(); return; }
  // Եթե դիտարկիչը կադրերը դադարեցրել է (թաքնված ներդիր), վերջնական վիճակը միևնույն է կկիրառվի
  avatarCamTimer = setTimeout(() => { cancelAnimationFrame(avatarCamRaf); avatarCam = to; setAvatarViewBox(); }, 320);
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / 200), k = avatarEase(t);
    avatarCam = from.map((v, i) => v + (to[i] - v) * k);
    setAvatarViewBox();
    if (t < 1) avatarCamRaf = requestAnimationFrame(step);
  };
  avatarCamRaf = requestAnimationFrame(step);
}

function setAvatarViewBox() {
  document.querySelector('#avatar-preview svg')?.setAttribute('viewBox', avatarCam.map(v => +v.toFixed(2)).join(' '));
}

// ---------- Վահանակ ----------
function avatarThumb(section, index) {
  const cfg = { ...avatarDraft, [section.field]: index };
  const key = section.field + '|' + JSON.stringify(cfg);
  let svg = avatarThumbCache.get(key);
  if (!svg) {
    svg = renderAvatarSVG(cfg, { viewBox: section.crop, bg: false });
    if (avatarThumbCache.size > 600) avatarThumbCache.clear();
    avatarThumbCache.set(key, svg);
  }
  return svg;
}

function avatarCell(section, index, row) {
  const checked = avatarDraft[section.field] === index;
  const label = section.title + ' ' + (index + 1);
  const inner = section.type === 'swatch' ? '<i style="background:' + AVATAR_PALETTES[section.field][index] + '"></i>' : avatarThumb(section, index);
  return '<button type="button" role="radio" class="av-cell ' + section.type + '" data-field="' + section.field + '" data-index="' + index +
    '" aria-checked="' + checked + '" aria-label="' + label + '" tabindex="' + (checked ? 0 : -1) + '" style="--row:' + row + '">' + inner + '</button>';
}

function paintAvatarPanel(resetScroll) {
  const panel = document.getElementById('avatar-panel');
  if (!panel) return;
  const tab = AVATAR_TABS[avatarTab];
  panel.setAttribute('aria-labelledby', 'av-tab-' + avatarTab);
  panel.innerHTML = tab.sections.map((section, s) => {
    const count = AVATAR_RANGES[section.field];
    return '<section class="av-section"><h2 id="av-sec-' + s + '">' + section.title + '</h2><div class="av-grid cols-' + section.cols + '" role="radiogroup" aria-labelledby="av-sec-' + s +
      '" data-field="' + section.field + '" onkeydown="avatarCellKey(event)" onclick="avatarCellClick(event)">' +
      Array.from({ length: count }, (_, i) => avatarCell(section, i, Math.floor(i / section.cols))).join('') + '</div></section>';
  }).join('');
  if (resetScroll) panel.scrollTop = 0;
}

// Գույնի փոփոխությունից հետո թարմացնում ենք նկարչությունների (thumb) բջիջները (նույն ընտրությունը)
function refreshAvatarThumbs() {
  const tab = AVATAR_TABS[avatarTab];
  tab.sections.filter(section => section.type === 'thumb').forEach(section => {
    document.querySelectorAll('.av-cell.thumb[data-field="' + section.field + '"]').forEach(cell => {
      cell.innerHTML = avatarThumb(section, Number(cell.dataset.index));
    });
  });
}

function avatarCellClick(event) {
  const cell = event.target.closest('.av-cell');
  if (cell) setAvatarOption(cell.dataset.field, Number(cell.dataset.index));
}

function avatarCellKey(event) {
  const cell = event.target.closest('.av-cell');
  if (!cell) return;
  const group = cell.parentElement, cells = [...group.children], at = cells.indexOf(cell);
  const cols = group.classList.contains('cols-3') ? 3 : 6;
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[event.key];
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setAvatarOption(cell.dataset.field, Number(cell.dataset.index)); return; }
  if (!move) return;
  event.preventDefault();
  const target = cells[at + move];
  if (target) { target.focus(); }
}

function setAvatarOption(field, value) {
  if (avatarDraft[field] === value) return;
  const previous = avatarDraft[field];
  avatarDraft[field] = value;
  document.querySelectorAll('.av-cell[data-field="' + field + '"]').forEach(cell => {
    const on = Number(cell.dataset.index) === value;
    cell.setAttribute('aria-checked', String(on));
    cell.tabIndex = on ? 0 : -1;
  });
  if (field === 'body') morphAvatarBody(AVATAR_BODIES[previous], AVATAR_BODIES[value]);
  else paintAvatarPreview();
  if (/Color$|^skin$/.test(field)) refreshAvatarThumbs();
  const done = document.getElementById('avatar-done');
  if (done) done.disabled = JSON.stringify(avatarDraft) === avatarInitial;
  const status = document.getElementById('avatar-status');
  if (status) status.textContent = '';
}

// Մարմնի տեսակի մորֆ. թվային պարամետրերը (ուս, բարձրություն, վիզ) սահուն են փոխվում, ձևը մնում է նույն կառուցվածքով
function morphAvatarBody(from, to) {
  cancelAnimationFrame(avatarBodyRaf);
  clearTimeout(avatarBodyTimer);
  paintAvatarPreview(from);
  if (avatarReduced()) { paintAvatarPreview(to); return; }
  avatarBodyTimer = setTimeout(() => { cancelAnimationFrame(avatarBodyRaf); paintAvatarPreview(); }, 480);
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / 320), k = avatarEase(t);
    const p = { sw: from.sw + (to.sw - from.sw) * k, ty: from.ty + (to.ty - from.ty) * k, nw: from.nw + (to.nw - from.nw) * k };
    const svg = document.querySelector('#avatar-preview svg');
    if (!svg) return;
    const attrs = avatarBodyAttrs(p);
    svg.querySelectorAll('.av-clothes').forEach(el => el.setAttribute('d', attrs.clothes));
    svg.querySelector('.av-neck')?.setAttribute('d', attrs.neck);
    const chest = svg.querySelector('.av-chest');
    if (chest) { chest.setAttribute('cy', attrs.chestY); chest.setAttribute('rx', attrs.chestRx); }
    if (t < 1) avatarBodyRaf = requestAnimationFrame(step);
  };
  avatarBodyRaf = requestAnimationFrame(step);
}

// ---------- Պահպանում ----------
async function saveAvatarBuilder() {
  if (avatarSaving || JSON.stringify(avatarDraft) === avatarInitial) return;
  avatarSaving = true;
  const done = document.getElementById('avatar-done');
  if (done) done.disabled = true;
  state.avatarConfig = { ...avatarDraft };
  save();
  try {
    if (account.profile) {
      const response = await fetch('/api/account/avatar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: avatarDraft }) });
      if (!response.ok) throw new Error('avatar');
      account.profile = (await response.json()).profile;
    }
    closeAvatarBuilder();
  } catch {
    const status = document.getElementById('avatar-status');
    if (status) status.textContent = 'Չհաջողվեց պահպանել հաշվում։ Փորձիր կրկին։';
    if (done) done.disabled = false;
  } finally { avatarSaving = false; }
}

// ---------- Անգործուն անիմացիա (թարթում, հայացք) ----------
function stopAvatarIdle() {
  avatarIdleTimers.forEach(clearTimeout);
  avatarIdleTimers = [];
  cancelAnimationFrame(avatarCamRaf);
  cancelAnimationFrame(avatarBodyRaf);
  clearTimeout(avatarCamTimer);
  clearTimeout(avatarBodyTimer);
}

function startAvatarIdle() {
  if (avatarReduced()) return;
  const alive = () => document.getElementById('avatar-preview') && document.visibilityState === 'visible';
  const later = (fn, min, max) => avatarIdleTimers.push(setTimeout(fn, min + Math.random() * (max - min)));
  const blink = () => {
    if (!document.getElementById('avatar-preview')) return;
    if (alive()) {
      const eyes = document.querySelector('#avatar-preview .av-eyes');
      if (eyes) { eyes.style.transform = 'scaleY(.08)'; setTimeout(() => { eyes.style.transform = ''; }, 110); }
    }
    later(blink, 3000, 5000);
  };
  const look = () => {
    if (!document.getElementById('avatar-preview')) return;
    if (alive()) {
      const dx = (Math.random() * 2 - 1) * 5;
      document.querySelectorAll('#avatar-preview .av-iris').forEach(iris => { iris.style.transform = 'translateX(' + dx.toFixed(1) + 'px)'; });
    }
    later(look, 1500, 3000);
  };
  later(blink, 1200, 3000);
  later(look, 900, 2000);
}

