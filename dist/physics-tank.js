// tank. Հեղուկով անոթ և ճնշաչափի զոնդ. p = ρgh։ Զոնդը քաշում ենք խորությամբ, կարելի է փոխել ուղղությունը և հեղուկը։
// params՝ { shape: 'rect'|'wide'|'narrow'|'funnel'|'compare', level = 40 (սմ), liquids: [անուններ], dirs?: true }
// value()՝ { h (սմ), rho, p (Պա), shape, dir, dirs: օգտագործված ուղղությունների քանակը }
const PHYS_LIQUIDS = [
  { name: 'Ջուր', rho: 1000, color: '#5ec8ff' }, { name: 'Յուղ', rho: 900, color: '#ffd966' },
  { name: 'Ծովի ջուր', rho: 1030, color: '#3fa7e0' }, { name: 'Սնդիկ', rho: 13600, color: '#b8bcc4' }
];
const PHYS_DIRS = [['down', 'Ներքև'], ['side', 'Կողք'], ['up', 'Վերև']];

PHYS_TOOLS.tank = {
  mount(el, params, onChange) {
    const shape = params.shape ?? 'rect';
    const level = params.level ?? 40;
    const liquids = PHYS_LIQUIDS.filter(item => (params.liquids || ['Ջուր']).includes(item.name));
    const PX = 5;
    const BOTTOM = 255;
    const SURFACE = BOTTOM - level * PX;
    // [կենտրոն, վերևի լայնություն, ներքևի լայնություն]
    const SHAPES = { rect: [280, 160, 160], wide: [280, 280, 280], narrow: [280, 70, 70], funnel: [280, 240, 80] };
    const vessels = shape === 'compare' ? [[100, 150, 150], [280, 56, 56], [460, 140, 50]] : [SHAPES[shape]];
    let liquid = liquids[0];
    let h = 0;
    let dir = 'down';
    const used = new Set(['down']);
    const arrows = { down: 'M0 -7V7M-5 2L0 8L5 2', up: 'M0 7V-7M-5 -2L0 -8L5 -2', side: 'M-7 0H7M2 -5L8 0L2 5' };

    const outline = ([cx, top, bottom], rim) => cx - top / 2 + ',' + (SURFACE - rim) + ' ' + (cx - bottom / 2) + ',' + BOTTOM + ' ' + (cx + bottom / 2) + ',' + BOTTOM + ' ' + (cx + top / 2) + ',' + (SURFACE - rim);
    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 300" role="img" aria-label="Անոթ և ճնշաչափի զոնդ">' +
      vessels.map(vessel => '<polygon class="t-liquid" points="' + outline(vessel, 0) + '" fill-opacity=".8"/>' +
        '<polyline points="' + outline(vessel, 16) + '" fill="none" stroke="#7a8a96" stroke-width="5" stroke-linejoin="round"/>').join('') +
      vessels.map(([cx]) => '<g class="t-probe phys-drag"><line class="t-guide" x1="' + cx + '" x2="' + cx + '" stroke="#555" stroke-dasharray="4 4" stroke-width="2"/>' +
        '<circle class="t-ball" cx="' + cx + '" r="14" fill="#ff9600" stroke="#b86a00" stroke-width="3"/><path class="t-arrow" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<text class="t-label" x="' + cx + '" text-anchor="middle" font-size="18" font-weight="800" fill="#3c3c3c"></text></g>').join('') + '</svg>' +
      '<div class="phys-controls"><label class="phys-range"><span>Խորություն h</span><input type="range" min="0" max="' + level + '" step="1" value="0"></label>' +
      (params.dirs ? '<div class="phys-group" role="group" aria-label="Զոնդի ուղղություն">' + PHYS_DIRS.map(([id, name]) => '<button type="button" class="secondary" data-dir="' + id + '" aria-pressed="' + (id === 'down') + '">' + name + '</button>').join('') + '</div>' : '') +
      (liquids.length > 1 ? '<div class="phys-group" role="group" aria-label="Հեղուկ">' + liquids.map((item, i) => '<button type="button" class="secondary" data-liquid="' + i + '" aria-pressed="' + (i === 0) + '">' + item.name + '</button>').join('') + '</div>' : '') +
      '</div><output class="phys-density" aria-live="polite"></output>';

    const svg = el.querySelector('svg');
    const range = el.querySelector('input');
    const readout = el.querySelector('output');
    const probes = [...el.querySelectorAll('.t-probe')];
    const pressure = () => Math.round(physHydro(liquid.rho, h / 100));
    const text = p => p >= 1000 ? String(Number((p / 1000).toFixed(2))).replace('.', ',') + ' կՊա' : p + ' Պա';
    const value = () => ({ h, rho: liquid.rho, p: pressure(), shape, dir, dirs: used.size });

    function paint() {
      const y = SURFACE + h * PX;
      el.querySelectorAll('.t-liquid').forEach(node => node.setAttribute('fill', liquid.color));
      probes.forEach(probe => {
        probe.querySelector('.t-ball').setAttribute('cy', y);
        probe.querySelector('.t-guide').setAttribute('y1', SURFACE);
        probe.querySelector('.t-guide').setAttribute('y2', y);
        const cx = Number(probe.querySelector('.t-ball').getAttribute('cx'));
        probe.querySelector('.t-arrow').setAttribute('d', arrows[dir]);
        probe.querySelector('.t-arrow').setAttribute('transform', 'translate(' + cx + ' ' + y + ')');
        const label = probe.querySelector('.t-label');
        label.setAttribute('y', Math.max(y - 22, SURFACE - 22));
        label.textContent = h ? text(pressure()) : '';
      });
      range.value = h;
      range.setAttribute('aria-valuetext', 'Խորություն՝ ' + h + ' սմ');
      readout.textContent = liquid.name + ' (ρ = ' + liquid.rho + ' կգ/մ³) · h = ' + h + ' սմ = ' + String(h / 100).replace('.', ',') + ' մ · p = ρgh = ' + pressure() + ' Պա';
      onChange(value());
    }

    probes.forEach(probe => physDrag(probe, svg, {
      move(point) { h = Math.min(level, Math.max(0, Math.round((point.y - SURFACE) / PX))); paint(); }
    }));
    range.addEventListener('input', () => { h = Number(range.value); paint(); });
    el.querySelectorAll('[data-dir]').forEach(button => button.addEventListener('click', () => {
      dir = button.dataset.dir;
      used.add(dir);
      el.querySelectorAll('[data-dir]').forEach(other => other.setAttribute('aria-pressed', other === button));
      paint();
    }));
    el.querySelectorAll('[data-liquid]').forEach(button => button.addEventListener('click', () => {
      liquid = liquids[Number(button.dataset.liquid)];
      el.querySelectorAll('[data-liquid]').forEach(other => other.setAttribute('aria-pressed', other === button));
      paint();
    }));

    paint();
    return {
      value,
      reset() { h = 0; dir = 'down'; used.clear(); used.add('down'); liquid = liquids[0]; el.querySelectorAll('[data-dir]').forEach(b => b.setAttribute('aria-pressed', b.dataset.dir === 'down')); el.querySelectorAll('[data-liquid]').forEach((b, i) => b.setAttribute('aria-pressed', i === 0)); paint(); },
      destroy() { el.innerHTML = ''; }
    };
  }
};
