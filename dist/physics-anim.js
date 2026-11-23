// Ցուցադրական անիմացիաների նվագարկիչ. ամեն անիմացիա ժամանակի մաքուր ֆունկցիա է (PLAN.md, Ե)։
//   PHYS_ANIMS[id] = { duration (մվ), kind: 'svg'|'canvas', label, cues: [{ at, text | html }], build(stage, params) → refs, draw(refs, t, params) }
// physSceneAnim-ը ստեղծում է svg տեսակի անիմացիա՝ scene(t, params) → SVG տող (ամեն կադրին վերանկարվում է)։
// Վերին մակարդակում DOM չկա։
const PHYS_ANIMS = {};
const PHYS_HOLD = 1000;

function physSceneAnim({ duration, label, cues, size: [width, height], scene }) {
  return {
    duration, kind: 'svg', label, cues,
    build(stage) {
      stage.innerHTML = '<svg class="phys-svg" viewBox="0 0 ' + width + ' ' + height + '" role="presentation" focusable="false"><g class="a-scene"></g></svg>';
      return { scene: stage.querySelector('.a-scene') };
    },
    draw(refs, t, params) { refs.scene.innerHTML = scene(t, params || {}); }
  };
}

// Զսպանակաձև շարժում (squash & stretch). prefers-reduced-motion-ի դեպքում՝ առանց տատանման
const physBounce = (seconds, options) => (physReduced() ? physEase.out(physClamp(seconds / 0.6)) : physSpring(seconds, options));

function physAnimPlayer(el, id, params = {}, { loop = true } = {}) {
  const anim = PHYS_ANIMS[id];
  const reduced = physReduced();
  el.innerHTML = '<div class="phys-stage" role="img" aria-label="' + physEsc(anim.label) + '"></div><p class="phys-caption" role="status" aria-live="polite"></p>' +
    '<div class="phys-anim-controls"><button type="button" class="secondary" data-act="replay">' + (reduced ? 'Դիտել' : 'Կրկնել') + '</button>' +
    '<button type="button" class="secondary" data-act="pause">Դադար</button><button type="button" class="secondary" data-act="speed" aria-pressed="false">0,5×</button></div>';
  const stage = el.querySelector('.phys-stage');
  const caption = el.querySelector('.phys-caption');
  const pauseButton = el.querySelector('[data-act="pause"]');
  let canvas = null;
  if (anim.kind === 'canvas') { canvas = document.createElement('canvas'); stage.appendChild(canvas); }
  const refs = canvas ? { canvas, context: canvas.getContext('2d') } : anim.build(stage, params);
  let t = 0;
  let speed = 1;
  let playing = false;
  let suspended = false;
  let lastCue = -1;
  let observer = null;
  let resizer = null;

  function fit() {
    const ratio = window.devicePixelRatio || 1;
    const box = stage.getBoundingClientRect();
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    draw();
  }

  function draw() {
    const time = Math.min(t, anim.duration);
    anim.draw(refs, time, params);
    const index = anim.cues.reduce((found, cue, position) => (cue.at <= time ? position : found), -1);
    if (index !== lastCue) {
      lastCue = index;
      const cue = anim.cues[index];
      if (cue && cue.html) caption.innerHTML = cue.html; else caption.textContent = cue ? cue.text : '';
    }
  }

  const loopTimer = physLoop(dt => {
    if (!playing) return false;
    t += dt * 1000 * speed;
    if (t >= anim.duration + PHYS_HOLD) {
      if (loop) t = 0; else { t = anim.duration; playing = false; pauseButton.textContent = 'Դադար'; }
    }
    draw();
    return playing;
  });

  function play() { playing = true; suspended = false; pauseButton.textContent = 'Դադար'; loopTimer.wake(); }
  function pause() { playing = false; loopTimer.stop(); pauseButton.textContent = 'Շարունակել'; }
  function replay() { t = 0; lastCue = -1; el.querySelector('[data-act="replay"]').textContent = 'Կրկնել'; play(); }

  el.querySelector('[data-act="replay"]').addEventListener('click', replay);
  pauseButton.addEventListener('click', () => (playing ? pause() : t >= anim.duration && !loop ? replay() : play()));
  el.querySelector('[data-act="speed"]').addEventListener('click', event => {
    speed = speed === 1 ? 0.5 : 1;
    event.currentTarget.setAttribute('aria-pressed', speed !== 1);
  });

  // Կանգ ենք առնում, երբ նվագարկիչը չի երևում (այլ ներդիր կամ էջի ներքև) և շարունակում ենք վերադառնալիս
  const suspend = () => { if (playing) { suspended = true; playing = false; loopTimer.stop(); } };
  const resume = () => { if (suspended) { suspended = false; playing = true; loopTimer.wake(); } };
  const onVisibility = () => (document.hidden ? suspend() : resume());
  document.addEventListener('visibilitychange', onVisibility);
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(entries => (entries[entries.length - 1].isIntersecting ? resume() : suspend()));
    observer.observe(el);
  }
  if (canvas && typeof ResizeObserver !== 'undefined') { resizer = new ResizeObserver(fit); resizer.observe(stage); }

  if (canvas) fit();
  if (reduced) { t = anim.duration; draw(); } else { draw(); play(); }
  return {
    play, pause, replay,
    time: () => t,
    seek(ms) { t = ms; lastCue = -1; draw(); },
    destroy() {
      loopTimer.stop();
      document.removeEventListener('visibilitychange', onVisibility);
      if (observer) observer.disconnect();
      if (resizer) resizer.disconnect();
      el.innerHTML = '';
    }
  };
}
