// frames. Blender-ով նախապես ռենդերված կադրերի sprite-թերթ. սլայդերը ֆիզիկական պարամետր է (օր.՝ իջեցման աստիճան), ոչ թե ժամանակ։
// params՝ { media, label = 'Իջեցում' }   value()՝ { frame, percent, seen (դիտած կադրերի քանակը) }
PHYS_TOOLS.frames = {
  mount(el, params, onChange) {
    const media = PHYSICS_MEDIA[params.media];
    const last = media.frames - 1;
    const seen = new Set([0]);
    let frame = 0;
    let ready = false;
    el.innerHTML = '<canvas class="phys-canvas" width="' + media.w + '" height="' + media.h + '" role="img" aria-label="' + (params.label ?? 'Իջեցում') + '"></canvas>' +
      '<div class="phys-controls"><label class="phys-range"><span>' + (params.label ?? 'Իջեցում') + '՝ <b class="f-value"></b></span>' +
      '<input type="range" min="0" max="' + last + '" step="1" value="0"></label></div><p class="phys-hint" role="status"></p>';
    const canvas = el.querySelector('canvas');
    const range = el.querySelector('input');
    const note = el.querySelector('.phys-hint');
    const context = canvas.getContext('2d');
    const image = new Image();
    const percent = () => Math.round(100 * frame / last);
    const value = () => ({ frame, percent: percent(), seen: seen.size });

    function draw() {
      range.value = frame;
      range.setAttribute('aria-valuetext', (params.label ?? 'Իջեցում') + '՝ ' + percent() + '%');
      el.querySelector('.f-value').textContent = percent() + '%';
      if (!ready) return;
      context.clearRect(0, 0, media.w, media.h);
      context.drawImage(image, frame % media.cols * media.w, Math.floor(frame / media.cols) * media.h, media.w, media.h, 0, 0, media.w, media.h);
    }

    image.onload = () => { ready = true; draw(); };
    image.onerror = () => { note.textContent = 'Պատկերը չբեռնվեց։ Շարունակիր դասը։'; };
    image.src = media.src;
    range.addEventListener('input', () => { frame = Number(range.value); seen.add(frame); draw(); onChange(value()); });
    draw();
    return {
      value,
      reset() { frame = 0; seen.clear(); seen.add(0); draw(); onChange(value()); },
      destroy() { el.innerHTML = ''; }
    };
  }
};
