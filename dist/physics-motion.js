// motion. Կաթոցիկով սայլակ. երեք հավասար (10 վ) տեղամաս, ամեն մեկի արագությունը՝ սահիչով։ Ամեն 2 վայրկյանը մեկ կաթիլ։
// value()՝ { avg (մ/վ), uneven: արագությունները հավասար չեն, ran: ընթացիկ արժեքներով սայլակը հասել է վերջ }
const PHYS_MOTION_NAMES = ['AB', 'BC', 'CD'];

// Ճանապարհը (մ) t վայրկյանում (0–30)
const physMotionPath = (speeds, t) => speeds.reduce((sum, v, i) => sum + v * physClamp(t - i * 10, 0, 10), 0);

PHYS_TOOLS.motion = {
  mount(el, params = {}, onChange) {
    const start = params.speeds || [10, 10, 10];
    const max = params.max ?? 30;
    let speeds = [...start];
    let t = 0;
    let ran = false;
    const x = metres => 40 + metres / (max * 30) * 480;

    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 120" role="img" aria-label="Կաթոցիկով սայլակ"><line x1="10" x2="550" y1="82" y2="82" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/><g class="m-scene"></g></svg>' +
      '<div class="phys-controls">' + PHYS_MOTION_NAMES.map((name, i) => '<label class="phys-range"><span>' + name + '՝ <b class="m-speed"></b> մ/վ</span><input type="range" min="0" max="' + max + '" step="5" data-part="' + i + '"></label>').join('') +
      '<button type="button" class="secondary phys-run">Գործարկել</button></div><output class="phys-density" aria-live="polite"></output>';

    const scene = el.querySelector('.m-scene');
    const readout = el.querySelector('output');
    const ranges = [...el.querySelectorAll('input')];
    const avg = () => physMotionPath(speeds, 30) / 30;
    const value = () => ({ avg: avg(), uneven: new Set(speeds).size > 1, ran });

    function paint() {
      let out = '';
      for (let second = 0; second <= t; second += 2) out += '<circle cx="' + x(physMotionPath(speeds, second)) + '" cy="96" r="5" fill="#1CB0F6"/>';
      scene.innerHTML = out + physDripCart(x(physMotionPath(speeds, t)), 82, '#FF9600');
      readout.textContent = ran ? 's = ' + physMotionPath(speeds, 30) + ' մ · t = 30 վ · միջին արագությունը՝ ' + String(Number(avg().toFixed(1))).replace('.', ',') + ' մ/վ' : 'Ընտրիր արագությունները և սեղմիր «Գործարկել»։';
      onChange(value());
    }

    // 30 վայրկյանը ցուցադրվում է 3 վայրկյանում
    const loop = physLoop(dt => {
      t = Math.min(30, t + dt * 10);
      ran = t >= 30;
      paint();
      return !ran;
    });

    function set(next) {
      loop.stop();
      speeds = next;
      t = 0;
      ran = false;
      ranges.forEach((range, i) => { range.value = speeds[i]; });
      el.querySelectorAll('.m-speed').forEach((node, i) => { node.textContent = speeds[i]; });
      paint();
    }

    ranges.forEach(range => range.addEventListener('input', () => set(speeds.map((v, i) => (i === Number(range.dataset.part) ? Number(range.value) : v)))));
    el.querySelector('.phys-run').addEventListener('click', () => {
      set(speeds);
      if (physReduced()) { t = 30; ran = true; paint(); } else loop.wake();
    });

    set(speeds);
    return {
      value,
      reset() { set([...start]); },
      destroy() { loop.stop(); el.innerHTML = ''; }
    };
  }
};
