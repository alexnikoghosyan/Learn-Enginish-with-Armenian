// measure / ruler. Առարկան քաշում ենք այնպես, որ ձախ ծայրը լինի 0-ի վրա, հետո կարդում ենք աջ ծայրի ցուցմունքը։
// params՝ { objectLength, min = 0, max = 12, division = 0.1, start = 1.6, unit = 'սմ' }
// value()՝ { reading, length, aligned, division }
PHYS_MEASURE.ruler = {
  mount(el, params, onChange) {
    const min = params.min ?? 0;
    const max = params.max ?? 12;
    const step = params.division ?? 0.1;
    const length = params.objectLength;
    const unit = params.unit ?? 'սմ';
    const start = params.start ?? 1.6;
    const lo = min - 1;
    const hi = max - length;
    const k = 472 / (max - min);
    const x = cm => 44 + (cm - min) * k;
    const ZOOM = 5;
    const CX = 280;
    const clip = 'phys-clip-' + (++physUid);
    let left = start;
    let reading = min;
    let zoomed = false;
    let base = start;

    el.innerHTML = '<svg class="phys-svg" viewBox="0 36 560 164" role="img" aria-label="Չափաքանոն և առարկա">' +
      '<g transform="translate(24 104)">' + PHYS_ART.ruler.group({ from: min, to: max, step, width: 472, x0: 20, bodyWidth: 512 }) + '</g>' +
      '<text x="522" y="188" text-anchor="end" font-size="18" font-weight="700" fill="#5a4600">' + unit + '</text>' +
      '<g class="r-guides" stroke="#1cb0f6" stroke-width="2" stroke-dasharray="5 4"><line y1="88" y2="112"/><line y1="88" y2="112"/></g>' +
      '<g class="r-obj phys-drag"><rect class="r-body" y="56" height="32" rx="6" fill="#1cb0f6"/>' +
      '<rect class="r-cap-l" y="56" width="5" height="32" fill="#0084bb"/><rect class="r-cap-r" y="56" width="5" height="32" fill="#0084bb"/>' +
      '<rect class="r-grab" y="40" height="60" fill="transparent"/></g>' +
      '<g class="r-lens"><clipPath id="' + clip + '"><rect x="24" y="196" width="512" height="96" rx="10"/></clipPath>' +
      '<rect x="24" y="196" width="512" height="96" rx="10" fill="#ffe08a" stroke="#1cb0f6" stroke-width="3"/>' +
      '<g clip-path="url(#' + clip + ')"><rect x="24" y="196" width="256" height="20" fill="#1cb0f6"/><g class="r-lens-ticks"></g></g>' +
      '<line x1="' + CX + '" x2="' + CX + '" y1="196" y2="292" stroke="#0084bb" stroke-width="3"/></g></svg>' +
      '<div class="phys-controls"><label class="phys-range"><span>Առարկայի դիրք</span>' +
      '<input type="range" min="' + lo + '" max="' + hi + '" step="0.05" value="' + start + '"></label>' +
      '<div class="phys-readout"><button type="button" class="secondary phys-step" data-dir="-1" aria-label="Նվազեցնել ցուցմունքը">−</button>' +
      '<output class="phys-value" aria-live="polite"></output>' +
      '<button type="button" class="secondary phys-step" data-dir="1" aria-label="Ավելացնել ցուցմունքը">+</button></div>' +
      '<button type="button" class="secondary phys-zoom" aria-pressed="false">Խոշորացնել</button></div>';

    const svg = el.querySelector('svg');
    const object = el.querySelector('.r-obj');
    const range = el.querySelector('input[type=range]');
    const output = el.querySelector('output');
    const lens = el.querySelector('.r-lens');
    const lensTicks = el.querySelector('.r-lens-ticks');
    const guides = el.querySelectorAll('.r-guides line');
    const set = (selector, attrs) => Object.entries(attrs).forEach(([name, value]) => el.querySelector(selector).setAttribute(name, value));

    function value() {
      return { reading: Number(reading.toFixed(4)), length, aligned: Math.abs(left - min) < 1e-9, division: step };
    }

    function draw() {
      const right = left + length;
      set('.r-body', { x: x(left), width: length * k });
      set('.r-cap-l', { x: x(left) });
      set('.r-cap-r', { x: x(right) - 5 });
      set('.r-grab', { x: x(left), width: length * k });
      guides[0].setAttribute('x1', x(left));
      guides[0].setAttribute('x2', x(left));
      guides[1].setAttribute('x1', x(right));
      guides[1].setAttribute('x2', x(right));
      lens.style.display = zoomed ? '' : 'none';
      svg.setAttribute('viewBox', zoomed ? '0 36 560 264' : '0 36 560 164');
      if (zoomed) lensTicks.innerHTML = physTicks(right - 1.3, right + 1.3, step, cm => CX + (cm - right) * k * ZOOM, 218, { long: 30, mid: 22, short: 14 });
      range.value = left;
      range.setAttribute('aria-valuetext', 'Ձախ ծայրը՝ ' + physFormat(left, 0.01) + ' ' + unit);
      output.textContent = 'Ցուցմունք՝ ' + physFormat(reading, step) + ' ' + unit;
      onChange(value());
    }

    function moveTo(next) {
      const snapped = Math.abs(next - min) < 0.15 ? min : next;
      left = Number(Math.min(hi, Math.max(lo, snapped)).toFixed(2));
      draw();
    }

    physDrag(object, svg, { start() { base = left; }, move(point, origin) { moveTo(base + (point.x - origin.x) / k); } });
    range.addEventListener('input', () => moveTo(Number(range.value)));
    el.querySelectorAll('.phys-step').forEach(button => button.addEventListener('click', () => {
      reading = Math.min(max, Math.max(min, physRound(reading + Number(button.dataset.dir) * step, step)));
      draw();
    }));
    const zoom = el.querySelector('.phys-zoom');
    zoom.addEventListener('click', () => {
      zoomed = !zoomed;
      zoom.setAttribute('aria-pressed', zoomed);
      draw();
    });

    draw();
    return {
      value,
      reset() { left = start; reading = min; zoomed = false; zoom.setAttribute('aria-pressed', 'false'); draw(); },
      destroy() { el.innerHTML = ''; }
    };
  }
};
