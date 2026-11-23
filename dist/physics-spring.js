// spring. Կախված զսպանակ և բեռներ. ձգումը թրթռում է ու հանգստանում (requestAnimationFrame), x = F/k։
// params՝ { mode: 'hooke'|'graduate', k = 50 (Ն/մ), g = PHYS_G, step = 0.1 (կգ), maxLoad = 0.5 (կգ) }
// hooke    → «Գրանցել»-ը ավելացնում է (F, x) կետ F–x գրաֆիկի վրա. value()՝ { mass, F, x (սմ), points, saved }
// graduate → «Նշել»-ը սանդղակի վրա նշում է ծայրի դիրքը. value()՝ { mass, F, marks, forces: '1,2,3' }
PHYS_TOOLS.spring = {
  mount(el, params, onChange) {
    const mode = params.mode ?? 'hooke';
    const k = params.k ?? 50;
    const g = params.g ?? PHYS_G;
    const step = params.step ?? 0.1;
    const maxCount = Math.round((params.maxLoad ?? 0.5) / step);
    const X0 = 180;
    const Y0 = 22;
    const L0 = 56;
    const S = 12;
    const REST = Y0 + L0;
    let count = 0;
    let pos = 0;
    let speed = 0;
    const saved = new Map();

    const force = () => Number((count * step * g).toFixed(3));
    const stretch = () => Number((force() / k * 100).toFixed(2));
    const coil = length => {
      let points = X0 + ',' + Y0;
      for (let i = 1; i < 14; i++) points += ' ' + (X0 + (i % 2 ? 15 : -15)) + ',' + (Y0 + 6 + (length - 12) * i / 14);
      return points + ' ' + X0 + ',' + (Y0 + length);
    };
    let strip = '';
    if (mode === 'hooke') {
      for (let cm = 0; cm <= 12; cm++) strip += '<line x1="252" x2="' + (cm % 2 ? 262 : 270) + '" y1="' + (REST + cm * S) + '" y2="' + (REST + cm * S) + '" stroke="#555" stroke-width="2"/>' +
        (cm % 2 ? '' : '<text x="276" y="' + (REST + cm * S + 6) + '" font-size="18" font-weight="700" fill="#444">' + cm + '</text>');
      strip += '<text x="252" y="' + (REST + 12 * S + 26) + '" font-size="16" font-weight="700" fill="#777">x, սմ</text>';
    } else strip = '<rect x="250" y="' + (REST - 4) + '" width="30" height="' + (12 * S + 8) + '" rx="6" fill="#fff" stroke="#bbb" stroke-width="2"/>';
    let graph = '';
    if (mode === 'hooke') {
      graph = '<g transform="translate(320 50)"><path d="M0 0V190H210" fill="none" stroke="#777" stroke-width="3"/>';
      for (let n = 1; n <= 5; n++) graph += '<line x1="' + n * 42 + '" x2="' + n * 42 + '" y1="190" y2="196" stroke="#777" stroke-width="2"/><text x="' + n * 42 + '" y="216" text-anchor="middle" font-size="16" fill="#555">' + n + '</text>';
      for (let n = 2; n <= 10; n += 2) graph += '<line x1="-6" x2="0" y1="' + (190 - n * 19) + '" y2="' + (190 - n * 19) + '" stroke="#777" stroke-width="2"/><text x="-10" y="' + (196 - n * 19) + '" text-anchor="end" font-size="16" fill="#555">' + n + '</text>';
      graph += '<text x="105" y="240" text-anchor="middle" font-size="16" font-weight="700" fill="#777">F, Ն</text><text x="-8" y="-10" font-size="16" font-weight="700" fill="#777">x, սմ</text>' +
        '<polyline class="k-line" fill="none" stroke="#1cb0f6" stroke-width="3"/><g class="k-dots" fill="#1cb0f6"></g></g>';
    }

    el.innerHTML = '<svg class="phys-svg" viewBox="0 0 560 300" role="img" aria-label="Զսպանակ և բեռներ">' +
      '<rect x="120" y="10" width="120" height="12" rx="4" fill="#9a9a9a"/><polyline class="k-coil" fill="none" stroke="#8a8a8a" stroke-width="4" stroke-linejoin="round"/>' +
      '<g class="k-load"></g><path class="k-pointer" fill="#ff4b4b"/>' + strip + '<g class="k-marks"></g>' + graph + '</svg>' +
      '<div class="phys-controls"><div class="phys-readout"><button type="button" class="secondary phys-step" data-dir="-1" aria-label="Հանել բեռը">−</button>' +
      '<output class="phys-value" aria-live="polite"></output><button type="button" class="secondary phys-step" data-dir="1" aria-label="Ավելացնել բեռը">+</button></div>' +
      '<button type="button" class="secondary phys-save">' + (mode === 'hooke' ? 'Գրանցել' : 'Նշել') + '</button></div>';

    const q = selector => el.querySelector(selector);
    const save = q('.phys-save');
    const marks = [];
    const settled = () => Math.abs(pos - stretch()) < 0.02 && Math.abs(speed) < 0.05;
    const value = () => mode === 'hooke'
      ? { mass: count * step, F: force(), x: stretch(), points: saved.size, saved: count > 0 && saved.has(force()) }
      : { mass: count * step, F: force(), marks: marks.length, forces: [...new Set(marks.map(mark => mark.F))].sort((a, b) => a - b).join(',') };

    function paint() {
      const end = REST + pos * S;
      q('.k-coil').setAttribute('points', coil(end - Y0));
      q('.k-pointer').setAttribute('d', 'M236 ' + (end - 8) + 'L248 ' + end + 'L236 ' + (end + 8) + 'Z');
      q('.k-load').innerHTML = '<line x1="' + X0 + '" x2="' + X0 + '" y1="' + end + '" y2="' + (end + 10) + '" stroke="#777" stroke-width="3"/>' +
        Array.from({ length: count }, (_, i) => '<rect x="' + (X0 - 24) + '" y="' + (end + 10 + i * 15) + '" width="48" height="13" rx="4" fill="' + (i % 2 ? '#ff9600' : '#ffc800') + '" stroke="rgba(0,0,0,.25)" stroke-width="2"/>').join('');
      q('output').textContent = 'Բեռ՝ ' + physFormat(count * step, step) + ' կգ · F = ' + String(force()).replace('.', ',') + ' Ն';
      save.disabled = count === 0 || !settled();
      q('.k-marks').innerHTML = marks.map(mark => '<line x1="250" x2="280" y1="' + (REST + mark.x * S) + '" y2="' + (REST + mark.x * S) + '" stroke="#1cb0f6" stroke-width="3"/>' +
        '<text x="290" y="' + (REST + mark.x * S + 6) + '" font-size="18" font-weight="700" fill="#1899d6">' + String(mark.F).replace('.', ',') + ' Ն</text>').join('');
      if (mode === 'hooke') {
        const points = [...saved].sort((a, b) => a[0] - b[0]);
        q('.k-line').setAttribute('points', points.map(([f, x]) => f * 42 + ',' + (190 - x * 19)).join(' '));
        q('.k-dots').innerHTML = points.map(([f, x]) => '<circle cx="' + f * 42 + '" cy="' + (190 - x * 19) + '" r="6"/>').join('');
      }
    }

    const loop = physLoop(dt => {
      const omega = 13;
      const aim = stretch();
      for (let t = 0; t < dt; t += 1 / 240) {
        speed += ((aim - pos) * omega * omega - 2 * 0.28 * omega * speed) / 240;
        pos += speed / 240;
      }
      if (settled()) { pos = aim; speed = 0; }
      paint();
      return !settled();
    });

    function change() {
      if (physReduced()) { pos = stretch(); speed = 0; paint(); } else loop.wake();
      paint();
      onChange(value());
    }

    el.querySelectorAll('.phys-step').forEach(button => button.addEventListener('click', () => {
      count = Math.min(maxCount, Math.max(0, count + Number(button.dataset.dir)));
      change();
    }));
    save.addEventListener('click', () => {
      if (mode === 'hooke') saved.set(force(), stretch());
      else if (!marks.some(mark => mark.F === force())) marks.push({ F: force(), x: stretch() });
      paint();
      onChange(value());
    });

    paint();
    return {
      value,
      reset() { count = 0; pos = 0; speed = 0; saved.clear(); marks.length = 0; change(); },
      destroy() { loop.stop(); el.innerHTML = ''; }
    };
  }
};
