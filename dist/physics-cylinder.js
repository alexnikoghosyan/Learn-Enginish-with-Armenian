// measure / cylinder (չափագլան). Մարմինը քաշում ենք չափագլանի մեջ. այն իջնում է, ջրի մակարդակը բարձրանում է մարմնի ծավալով։
// params՝ { capacity = 100, division = 5, water = 40, labelEvery = 20, unit = 'մլ', bodies: [{ name, V, color, shape: 'round'|'square' }] }
// value()՝ { level, reading, immersed: [անուններ], V }  (V՝ ընկղմված մարմինների ծավալը = level − water)
PHYS_MEASURE.cylinder = {
  mount(el, params, onChange) {
    const capacity = params.capacity ?? 100;
    const step = params.division ?? 5;
    const water = params.water ?? 40;
    const every = params.labelEvery ?? 20;
    const unit = params.unit ?? 'մլ';
    const bodies = (params.bodies || []).map(body => ({ ...body, on: false }));
    const BOTTOM = 270;
    const TOP = 30;
    const yOf = ml => BOTTOM - ml * (BOTTOM - TOP) / capacity;
    const trayX = index => 70 + index * 90;
    const SIZE = 40;
    let level = water;
    let reading = 0;
    let dragging = -1;
    const nodes = [];

    const ticks = (() => {
      let out = '';
      for (let ml = 0; ml <= capacity + 1e-9; ml += step) {
        const label = Math.abs(ml / every - Math.round(ml / every)) < 1e-9;
        out += '<line x1="' + (label ? 308 : 316) + '" x2="326" y1="' + yOf(ml) + '" y2="' + yOf(ml) + '" stroke="#555" stroke-width="' + (label ? 2.2 : 1.4) + '"/>';
        if (label) out += '<text x="300" y="' + (yOf(ml) + 6) + '" text-anchor="end" font-size="18" font-weight="700" fill="#444">' + ml + '</text>';
      }
      return out;
    })();

    const shape = body => body.shape === 'square'
      ? '<rect x="' + -SIZE / 2 + '" y="' + -SIZE / 2 + '" width="' + SIZE + '" height="' + SIZE + '" rx="6" fill="' + body.color + '" stroke="rgba(0,0,0,.3)" stroke-width="3"/>'
      : '<circle r="' + SIZE / 2 + '" fill="' + body.color + '" stroke="rgba(0,0,0,.3)" stroke-width="3"/>';
    bodies.forEach((body, index) => Object.assign(body, { x: trayX(index), y: 150 }));

    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 300" role="img" aria-label="Չափագլան">' +
      '<rect class="c-water" x="328" width="64" fill="#5ec8ff" fill-opacity=".75"/>' +
      '<path d="M326 ' + (TOP - 8) + 'V' + (BOTTOM + 4) + 'Q326 ' + (BOTTOM + 14) + ' 336 ' + (BOTTOM + 14) + 'H384Q394 ' + (BOTTOM + 14) + ' 394 ' + (BOTTOM + 4) + 'V' + (TOP - 8) +
      '" fill="none" stroke="#7aa" stroke-width="4" stroke-linecap="round"/>' + ticks +
      bodies.map(body => '<g class="c-body phys-drag" tabindex="0" role="button" aria-pressed="false" aria-label="' + body.name + '">' + shape(body) +
        '<text class="c-name" y="' + (SIZE / 2 + 22) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#4b4b4b">' + body.name + '</text></g>').join('') +
      '</svg><div class="phys-controls"><div class="phys-readout">' +
      '<button type="button" class="secondary phys-step" data-dir="-1" aria-label="Նվազեցնել ցուցմունքը">−</button><output class="phys-value" aria-live="polite"></output>' +
      '<button type="button" class="secondary phys-step" data-dir="1" aria-label="Ավելացնել ցուցմունքը">+</button></div>' +
      (bodies.length ? '<span class="phys-hint">Քաշիր մարմինը չափագլանի մեջ կամ սեղմիր Enter</span>' : '') + '</div>';

    const svg = el.querySelector('svg');
    const surface = el.querySelector('.c-water');
    const output = el.querySelector('output');
    el.querySelectorAll('.c-body').forEach(node => nodes.push(node));
    const target = () => water + bodies.reduce((sum, body) => sum + (body.on ? body.V : 0), 0);
    const value = () => ({ level: target(), reading, immersed: bodies.filter(body => body.on).map(body => body.name), V: target() - water });

    function aim() {
      let stacked = 0;
      bodies.forEach((body, index) => {
        if (body.on) { body.tx = 360; body.ty = BOTTOM - SIZE / 2 - stacked++ * (SIZE + 2); } else { body.tx = trayX(index); body.ty = 150; }
      });
    }

    function paint() {
      surface.setAttribute('y', yOf(level));
      surface.setAttribute('height', BOTTOM + 10 - yOf(level));
      bodies.forEach((body, index) => {
        nodes[index].setAttribute('transform', 'translate(' + body.x + ' ' + body.y + ')');
        nodes[index].setAttribute('aria-pressed', body.on);
        nodes[index].querySelector('.c-name').style.opacity = body.on ? 0 : 1;
      });
      output.textContent = 'Ցուցմունք՝ ' + physFormat(reading, step) + ' ' + unit;
    }

    const loop = physLoop(dt => {
      const ease = 1 - Math.exp(-dt * 7);
      level += (target() - level) * ease;
      let moving = Math.abs(target() - level) > 0.02;
      if (!moving) level = target();
      aim();
      bodies.forEach((body, index) => {
        if (index === dragging) { moving = true; return; }
        body.x += (body.tx - body.x) * ease * 1.5;
        body.y += (body.ty - body.y) * ease * 1.5;
        if (Math.abs(body.tx - body.x) < 0.3 && Math.abs(body.ty - body.y) < 0.3) { body.x = body.tx; body.y = body.ty; } else moving = true;
      });
      paint();
      return moving;
    });

    function settle() {
      aim();
      if (physReduced()) { level = target(); bodies.forEach(body => { body.x = body.tx; body.y = body.ty; }); paint(); } else loop.wake();
      onChange(value());
    }

    bodies.forEach((body, index) => {
      physDrag(nodes[index], svg, {
        start() { dragging = index; if (body.on) { body.on = false; settle(); } loop.wake(); },
        move(point) { body.x = point.x; body.y = point.y; paint(); },
        end(point) { dragging = -1; body.on = point.x > 310 && point.x < 410 && point.y > TOP - 20 && point.y < BOTTOM + 20; settle(); }
      });
      nodes[index].addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        body.on = !body.on;
        settle();
      });
    });
    el.querySelectorAll('.phys-step').forEach(button => button.addEventListener('click', () => {
      reading = Math.min(capacity, Math.max(0, physRound(reading + Number(button.dataset.dir) * step, step)));
      paint();
      onChange(value());
    }));

    aim();
    bodies.forEach(body => { body.x = body.tx; body.y = body.ty; });
    paint();
    return {
      value,
      reset() { bodies.forEach(body => { body.on = false; }); reading = 0; settle(); paint(); },
      destroy() { loop.stop(); el.innerHTML = ''; }
    };
  }
};
