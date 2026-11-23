// measure / scale. Թվային կշեռք. մարմինները քաշում ենք նժարին (կամ Enter/Space-ով դնում ու հանում ենք),
// ցուցմունքը սահուն հասնում է գումարային զանգվածին, իսկ նժարը իջնում է ըստ զանգվածի (requestAnimationFrame)։
// params՝ { items: [{ name, m, V?, color, shape: 'round'|'flat'|'tall' }], unit = 'գ', capacity = 1000, cut?: true, density?: true }
// cut՝ «Կտրել» կոճակը կիսում է նժարի մարմինների m-ը և V-ն (իսկ m/V-ն մնում է նույնը). density՝ ցույց է տալիս m, V, m/V
// value()՝ { mass, onPan: [անուններ], cut: կտրումների քանակը }
PHYS_MEASURE.scale = {
  mount(el, params, onChange) {
    const items = params.items.map(item => ({ ...item }));
    const unit = params.unit ?? 'գ';
    const capacity = params.capacity ?? 1000;
    const SIZES = { round: [72, 72], flat: [84, 52], tall: [60, 84] };
    const PAN_TOP = 176;
    const trayX = index => items.length > 1 ? 70 + index * 420 / (items.length - 1) : 280;
    const TRAY_Y = 70;
    const nodes = [];
    let shown = 0;
    let sink = 0;
    let dragging = -1;
    let cutCount = 0;

    const shape = (item, w, h) => item.shape === 'round'
      ? '<circle r="' + w / 2 + '" fill="' + item.color + '" stroke="rgba(0,0,0,.25)" stroke-width="3"/>'
      : '<rect x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h + '" rx="12" fill="' + item.color + '" stroke="rgba(0,0,0,.25)" stroke-width="3"/>';
    const body = items.map((item, index) => {
      item.shape = SIZES[item.shape] ? item.shape : 'round';
      const [w, h] = SIZES[item.shape];
      Object.assign(item, { w, h, on: false, x: trayX(index), y: TRAY_Y, slot: 0, m0: item.m, V0: item.V, cuts: 0, s: 1 });
      return '<g class="s-item phys-drag" tabindex="0" role="button" aria-pressed="false" aria-label="' + item.name + '">' +
        shape(item, w, h) + '<text class="s-name" y="' + (h / 2 + 22) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#4b4b4b">' + item.name + '</text></g>';
    }).join('');

    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 300" role="img" aria-label="Թվային կշեռք">' +
      '<rect x="110" y="206" width="340" height="76" rx="18" fill="#e5e5e5" stroke="#c9c9c9" stroke-width="3"/>' +
      '<rect x="170" y="222" width="220" height="44" rx="8" fill="#263238"/>' +
      '<text class="s-display" x="372" y="256" text-anchor="end" font-size="32" font-weight="800" fill="#58cc02" font-family="monospace">0</text>' +
      '<text x="136" y="250" font-size="18" font-weight="700" fill="#777">' + unit + '</text>' +
      '<rect x="270" y="190" width="20" height="18" fill="#afafaf"/>' +
      '<rect class="s-pan" x="140" y="' + PAN_TOP + '" width="280" height="14" rx="7" fill="#afafaf"/>' + body + '</svg>' +
      '<div class="phys-controls"><span class="phys-hint">Քաշիր մարմինները նժարին կամ սեղմիր Enter</span>' +
      (params.cut ? '<button type="button" class="secondary phys-cut">Կտրել</button>' : '') +
      '<button type="button" class="secondary phys-clear">Մաքրել նժարը</button></div>' +
      (params.density ? '<output class="phys-density" aria-live="polite"></output>' : '') + '<div class="phys-live" role="status" aria-live="polite"></div>';
    const density = el.querySelector('.phys-density');

    const svg = el.querySelector('svg');
    const display = el.querySelector('.s-display');
    const pan = el.querySelector('.s-pan');
    const live = el.querySelector('.phys-live');
    el.querySelectorAll('.s-item').forEach(node => nodes.push(node));

    const mass = () => items.reduce((sum, item) => sum + (item.on ? item.m : 0), 0);
    const value = () => ({ mass: mass(), onPan: items.filter(item => item.on).map(item => item.name), cut: cutCount });
    const volume = () => items.reduce((sum, item) => sum + (item.on ? item.V : 0), 0);
    const showDensity = () => {
      if (!density) return;
      const v = volume();
      density.textContent = v ? 'm = ' + mass() + ' ' + unit + ' · V = ' + String(Number(v.toFixed(2))).replace('.', ',') + ' սմ³ · m/V = ' + physFormat(mass() / v, 0.01) + ' ' + unit + '/սմ³' : '';
    };

    function targets() {
      const placed = items.filter(item => item.on);
      const gap = Math.min(92, 250 / Math.max(1, placed.length));
      placed.forEach((item, slot) => { item.slot = slot; item.tx = 280 + (slot - (placed.length - 1) / 2) * gap; item.ty = PAN_TOP + sink - item.h * item.s / 2; });
      items.forEach((item, index) => { if (!item.on) { item.tx = trayX(index); item.ty = TRAY_Y; } });
    }

    function paint() {
      pan.setAttribute('y', PAN_TOP + sink);
      display.textContent = Math.round(shown);
      items.forEach((item, index) => {
        nodes[index].setAttribute('transform', 'translate(' + item.x + ' ' + item.y + ') scale(' + item.s + ')');
        nodes[index].setAttribute('aria-pressed', item.on);
        nodes[index].querySelector('.s-name').style.opacity = item.on ? 0 : 1;
      });
    }

    const loop = physLoop(dt => {
      const ease = 1 - Math.exp(-dt * 12);
      const goal = mass();
      shown += (goal - shown) * ease;
      if (Math.abs(goal - shown) < 0.5) shown = goal;
      sink = 12 * Math.min(1, shown / capacity);
      targets();
      let moving = shown !== goal;
      items.forEach((item, index) => {
        const size = Math.pow(0.75, item.cuts);
        item.s += (size - item.s) * ease;
        if (Math.abs(size - item.s) < 0.002) item.s = size; else moving = true;
        if (index === dragging) { moving = true; return; }
        item.x += (item.tx - item.x) * ease;
        item.y += (item.ty - item.y) * ease;
        if (Math.abs(item.tx - item.x) < 0.3 && Math.abs(item.ty - item.y) < 0.3) { item.x = item.tx; item.y = item.ty; } else moving = true;
      });
      paint();
      return moving;
    });

    function settle(announce) {
      items.forEach(item => { item.s = Math.pow(0.75, item.cuts); });
      if (physReduced()) { shown = mass(); sink = 12 * Math.min(1, shown / capacity); targets(); items.forEach(item => { item.x = item.tx; item.y = item.ty; }); paint(); } else loop.wake();
      showDensity();
      if (announce) live.textContent = 'Կշեռքը ցույց է տալիս ' + mass() + ' ' + unit;
      onChange(value());
    }

    items.forEach((item, index) => {
      const node = nodes[index];
      physDrag(node, svg, {
        start() { dragging = index; if (item.on) { item.on = false; settle(false); } loop.wake(); },
        move(point) { item.x = point.x; item.y = point.y; paint(); },
        end(point) {
          dragging = -1;
          item.on = point.x > 120 && point.x < 440 && point.y > PAN_TOP - 90 && point.y < PAN_TOP + 40;
          settle(true);
        }
      });
      node.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        item.on = !item.on;
        settle(true);
      });
    });
    const cut = el.querySelector('.phys-cut');
    if (cut) cut.addEventListener('click', () => {
      const onPan = items.filter(item => item.on);
      if (!onPan.length) { live.textContent = 'Նախ դիր մարմին նժարին'; return; }
      onPan.forEach(item => { item.m /= 2; if (item.V) item.V /= 2; item.cuts++; });
      cutCount++;
      settle(true);
    });
    el.querySelector('.phys-clear').addEventListener('click', () => { items.forEach(item => { item.on = false; }); settle(true); });

    targets();
    items.forEach(item => { item.x = item.tx; item.y = item.ty; });
    paint();
    return {
      value,
      reset() { cutCount = 0; items.forEach(item => { Object.assign(item, { on: false, m: item.m0, V: item.V0, cuts: 0 }); }); settle(false); },
      destroy() { loop.stop(); el.innerHTML = ''; }
    };
  }
};
