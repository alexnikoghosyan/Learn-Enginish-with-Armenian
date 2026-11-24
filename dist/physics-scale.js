// measure / scale. Թվային կշեռք. մարմինները քաշում ենք նժարին (կամ Enter/Space-ով դնում ու հանում ենք),
// ցուցմունքը սահուն հասնում է գումարային զանգվածին, իսկ նժարը իջնում է ըստ զանգվածի (requestAnimationFrame)։
// params՝ { items: [{ name, m, V?, color, shape: 'round'|'flat'|'tall', img?, objW?, halves? }], unit = 'գ', capacity = 1000, cut?: true, density?: true }
// img՝ Flow նկարի id (physics-sprites.js), objW՝ առարկայի լայնությունը. նկար չկա՝ հին ձևը (PHYS_ART.cube). halves՝ կտրելուց հետո նկարվում է կիսված խորանարդը
// cut՝ «Կտրել» կոճակը կիսում է նժարի մարմինների m-ը և V-ն (իսկ m/V-ն մնում է նույնը). density՝ ցույց է տալիս m, V, m/V
// value()՝ { mass, onPan: [անուններ], cut: կտրումների քանակը }
PHYS_MEASURE.scale = {
  mount(el, params, onChange) {
    const items = params.items.map(item => ({ ...item }));
    const unit = params.unit ?? 'գ';
    const capacity = params.capacity ?? 1000;
    const SIZES = { round: [72, 72], flat: [88, 48], tall: [56, 92], cube: [72, 72] };
    const PAN_TOP = 176;
    const trayX = index => items.length > 1 ? 70 + index * 420 / (items.length - 1) : 280;
    const TRAY_Y = 70;
    const nodes = [];
    let shown = 0;
    let sink = 0;
    let dragging = -1;
    let cutCount = 0;

    // Մարմինները՝ PHYS_ART.cube-ով (սկզբնակետը ներքևի կենտրոնում), կենտրոնը՝ (0, 0)
    const shape = item => item.sprite ? item.sprite.svg : '<g transform="translate(0 ' + (item.h + 6) / 2 + ')">' + PHYS_ART.cube.group({ color: item.color, shape: item.shape }) + '</g>';
    // Կիսված խորանարդը՝ նույն լայնությամբ, ինչ նկարը (1,836·a = objW)
    const halves = item => '<g transform="translate(0 ' + (item.h + 6) / 2 + ')">' + physCubeHalvesSvg(item.objW / 1.836) + '</g>';
    const body = items.map((item, index) => {
      item.shape = SIZES[item.shape] ? item.shape : 'round';
      item.sprite = item.img ? physSprite(item.img, item.objW ?? 64) : null;
      const [w, h] = item.sprite ? [item.sprite.w, item.sprite.h - 6] : SIZES[item.shape];
      Object.assign(item, { w, h, on: false, x: trayX(index), y: TRAY_Y, slot: 0, m0: item.m, V0: item.V, cuts: 0, s: 1 });
      return '<g class="s-item phys-drag" tabindex="0" role="button" aria-pressed="false" aria-label="' + item.name + '"><g class="s-shape">' +
        shape(item) + '</g><text class="s-name" y="' + ((h + 6) / 2 + 22) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#4b4b4b">' + item.name + '</text></g>';
    }).join('');

    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 300" role="img" aria-label="Թվային կշեռք">' +
      '<g class="s-art" transform="translate(110 124)"></g>' +
      '<text x="150" y="266" font-size="18" font-weight="700" fill="#777">' + unit + '</text>' + body + '</svg>' +
      '<div class="phys-controls"><span class="phys-hint">Քաշիր մարմինները նժարին կամ սեղմիր Enter</span>' +
      (params.cut ? '<button type="button" class="secondary phys-cut">Կտրել</button>' : '') +
      '<button type="button" class="secondary phys-clear">Մաքրել նժարը</button></div>' +
      (params.density ? '<output class="phys-density" aria-live="polite"></output>' : '') + '<div class="phys-live" role="status" aria-live="polite"></div>';
    const density = el.querySelector('.phys-density');

    const svg = el.querySelector('svg');
    const art = el.querySelector('.s-art');
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
      placed.forEach((item, slot) => { item.slot = slot; item.tx = 280 + (slot - (placed.length - 1) / 2) * gap; item.ty = PAN_TOP + sink - (item.h + 6) * item.s / 2; });
      items.forEach((item, index) => { if (!item.on) { item.tx = trayX(index); item.ty = TRAY_Y; } });
    }

    function paint() {
      art.innerHTML = PHYS_ART.scale.group({ sink, text: String(Math.round(shown)) });
      items.forEach((item, index) => {
        nodes[index].setAttribute('transform', 'translate(' + item.x + ' ' + item.y + ') scale(' + item.s + ')');
        nodes[index].setAttribute('aria-pressed', item.on);
        if (item.halves && item.sprite) { // կտրելուց հետո՝ կիսված խորանարդ (SVG), հակառակ դեպքում՝ նկարը
          const cutNow = item.cuts > 0;
          if (item.showCut !== cutNow) { item.showCut = cutNow; nodes[index].querySelector('.s-shape').innerHTML = cutNow ? halves(item) : shape(item); }
        }
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
        const size = item.halves && item.sprite ? 1 : Math.pow(0.75, item.cuts);
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
      items.forEach(item => { item.s = item.halves && item.sprite ? 1 : Math.pow(0.75, item.cuts); });
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
