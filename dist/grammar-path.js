state.grammarPractice ??= {};
let grammarTopic = 0;
let arrangementTiles = [];
let arrangedWords = [];

function renderPathStop(title, offset, status, action, icon, language = 'hy') {
  const current = status === 'current';
  const done = status === 'done';
  const label = current ? 'Սկսել' : done ? 'Ավարտված' : 'Դեռ հասանելի չէ';
  const bend = [0, 1, 2, 2, 1, 0, 0, 1, 2, 1][offset % 10];
  return '<li class="path-stop" style="--bend:' + bend + '">' +
    '<button class="path-node path-' + status + '" aria-label="' + esc(title + ' · ' + label) + '"' +
    (current ? ' aria-current="step" aria-expanded="false" onclick="togglePathPreview(this)"' :
      action ? ' onclick="' + action + '"' : ' disabled') + '>' +
    '<span class="path-node-icon" aria-hidden="true">' + (done ? '✓' : icon) +
    '</span></button><span><strong lang="' + language + '">' + esc(title) + '</strong>' +
    (current ? '<small class="path-current-label">' + label + '</small>' : '') + '</span>' +
    (current ? '<div class="path-preview" hidden><strong lang="' + language + '">' + esc(title) +
      '</strong><button class="secondary" onclick="' + action + '">Սկսել</button></div>' : '') + '</li>';
}

function closePathPreview(preview) {
  preview.hidden = true;
  preview.parentElement.querySelector('.path-node').setAttribute('aria-expanded', 'false');
}

function togglePathPreview(button) {
  const preview = button.parentElement.querySelector('.path-preview');
  if (!preview.hidden) { closePathPreview(preview); return; }
  app.querySelectorAll('.path-preview:not([hidden])').forEach(closePathPreview);
  preview.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  preview.querySelector('button').focus({ preventScroll: true });
}

document.addEventListener('click', event => {
  app.querySelectorAll('.path-preview:not([hidden])').forEach(preview => {
    if (!preview.parentElement.contains(event.target)) closePathPreview(preview);
  });
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const preview = app.querySelector('.path-preview:not([hidden])');
  if (preview) {
    closePathPreview(preview);
    preview.parentElement.querySelector('.path-node').focus();
  }
});

function nextGrammarTopic() {
  return LESSONS.findIndex((_, index) => !state.lessons.includes(index));
}

function grammar() {
  const next = nextGrammarTopic();
  const units = [];
  for (let start = 0; start < LESSONS.length; start += 5) {
    const stops = LESSONS.slice(start, start + 5).map((topic, offset) => {
      const index = start + offset;
      const done = state.lessons.includes(index);
      const available = index === next;
      const read = done || state.grammarPractice[index] !== undefined;
      return renderPathStop(topic.en, offset * 2, read ? 'done' : available ? 'current' : 'locked',
        done || available ? 'lesson(' + index + ', false)' : '', '★', 'en') +
        renderPathStop('Վարժություն', offset * 2 + 1, done ? 'done' : available && read ? 'current' : 'locked',
          done || available && read ? 'openGrammarPractice(' + index + ')' : '', '✎');
    }).join('');
    units.push('<section class="path-unit" data-color="' + Math.floor(start / 5) % 7 +
      '"><div class="path-unit-heading"><h3>Բաժին ' + (Math.floor(start / 5) + 1) + '</h3></div><ol>' + stops + '</ol>' + courseMilestone(LESSONS.slice(start, start + 5).every((_, offset) => state.lessons.includes(start + offset))) + '</section>');
  }
  app.innerHTML = courseLayout('<div class="learning-path"><h1>Քերականության ճանապարհ</h1><div class="path-intro"><p>' +
    state.lessons.length + ' / ' + LESSONS.length + ' թեմա ավարտված</p>' +
    '</div>' + units.join('') + '</div>', 'grammar');
}

function lesson(index, resume = true) {
  if (index !== nextGrammarTopic() && !state.lessons.includes(index)) return;
  if (resume && !state.lessons.includes(index) && state.grammarPractice[index] !== undefined) {
    openGrammarPractice(index);
    return;
  }
  view = 'grammar';
  renderNavigation();
  const topic = LESSONS[index];
  app.innerHTML = '<section class="lesson-body">' + focusLessonHeader(0, 1 + grammarPracticeKinds(grammarExercises[index]).length, 'grammar', { showInitialFill: true }) +
    '<p class="muted">Դաս ' + (index + 1) + ' / ' + LESSONS.length + '</p><h1>' + esc(topic.title) +
    '</h1><h2 lang="en">' + esc(topic.en) + '</h2><div class="rule">' + esc(topic.rule) +
    '</div><h2 style="margin-top:24px">Օրինակներ</h2>' + topic.examples.map(([english, armenian]) =>
    '<div class="example"><b lang="en">' + esc(english) + ' <button class="icon-btn" data-speak="' +
    esc(english) + '" aria-label="Լսել օրինակը">' + actionIcon('speaker') + '</button></b><small>' + esc(armenian) + '</small></div>'
  ).join('') + '<div class="tools lesson-controls"><button class="primary" onclick="beginGrammarPractice(' + index +
    ')">Անցնել վարժությանը →</button></div></section>';
  window.scrollTo(0, 0);
}

function beginGrammarPractice(index) {
  if (index !== nextGrammarTopic() && !state.lessons.includes(index)) return;
  state.grammarPractice[index] ??= 0;
  save();
  openGrammarPractice(index);
}

function openGrammarPractice(index) {
  if (index !== nextGrammarTopic() && !state.lessons.includes(index)) return;
  if (state.grammarPractice[index] === undefined && !state.lessons.includes(index)) return;
  grammarTopic = index;
  view = 'grammar';
  renderNavigation();
  if (state.lessons.includes(index) && state.grammarPractice[index] === undefined) {
    state.grammarPractice[index] = 0;
  }
  drawGrammarPractice();
  window.scrollTo(0, 0);
}

function grammarPracticeKinds(exercise) {
  return exercise.form ? ['write', 'form', 'arrange'] : ['write', 'arrange'];
}

function grammarTokens(sentence) {
  return sentence.replace(/[,.?!]/g, '').split(/\s+/);
}

function drawGrammarPractice() {
  const task = grammarExercises[grammarTopic];
  const steps = grammarPracticeKinds(task);
  const step = state.grammarPractice[grammarTopic];
  const kind = steps[step];
  const input = '<label for="grammar-answer">Քո պատասխանը</label><input id="grammar-answer" lang="en" autocomplete="off" spellcheck="false">';
  let body;
  if (kind === 'write') {
    const cues = grammarTokens(task.sentence).sort((a, b) => a.localeCompare(b)).join(' · ');
    body = '<h2>Ինքդ գրիր նախադասությունը</h2><p>' + esc(task.meaning) +
      '</p><p>Գործածիր այս բոլոր բառերը և սկսիր <strong lang="en">' + esc(grammarTokens(task.sentence)[0]) +
      '</strong> բառով։</p><div class="grammar-cues" lang="en">' + esc(cues) + '</div>' + input;
  } else if (kind === 'form') {
    const words = task.sentence.split(' ');
    const index = words.findIndex(word => grammarTokens(word)[0].toLowerCase() === task.form.toLowerCase());
    words[index] = words[index].replace(new RegExp(task.form, 'i'), '_____');
    body = '<h2>Գրիր բառի ճիշտ ձևը</h2><p>Փոխիր <strong lang="en">' + esc(task.base) +
      '</strong> բառը՝ նախադասության բացը լրացնելու համար։</p><div class="grammar-cues" lang="en">' +
      esc(words.join(' ')) + '</div>' + input;
  } else {
    const ordered = grammarTokens(task.arrangement);
    arrangementTiles = shuffled(ordered);
    if (arrangementTiles.join(' ') === ordered.join(' ')) arrangementTiles.push(arrangementTiles.shift());
    arrangedWords = [];
    body = '<h2>Դասավորիր խառնված բառերը</h2><p>Ընտրիր բոլոր բառերը ճիշտ հերթականությամբ։ Սխալ բառը հեռացնելու համար սեղմիր դրա վրա։</p>' +
      '<div id="arranged-words" class="grammar-tiles grammar-output" aria-label="Քո նախադասությունը"></div>' +
      '<div id="available-words" class="grammar-tiles" aria-label="Խառնված բառերը"></div>';
  }
  app.innerHTML = '<section class="lesson-body">' + focusLessonHeader(step + 1, steps.length + 1, 'grammar') +
    '<div class="panel grammar-practice"><small>Վարժություն ' + (step + 1) + ' / ' + steps.length +
    '</small>' +
    '<form onsubmit="event.preventDefault();checkGrammarPractice()">' + body +
    '<p id="grammar-feedback" role="status"></p><div class="tools lesson-controls"><button class="primary">Ստուգել</button>' +
    '<button class="secondary" type="button" onclick="lesson(grammarTopic, false)">Տեսնել կանոնը</button>' +
    '</div></form></div></section>';
  if (kind === 'arrange') drawGrammarTiles();
}

function drawGrammarTiles() {
  const tile = (index, placed) => '<button type="button" class="secondary" lang="en" onclick="toggleGrammarTile(' +
    index + ')"' + (!placed && arrangedWords.includes(index) ? ' disabled' : '') + '>' +
    esc(arrangementTiles[index]) + '</button>';
  document.getElementById('available-words').innerHTML = arrangementTiles.map((_, index) => tile(index, false)).join('');
  document.getElementById('arranged-words').innerHTML = arrangedWords.map(index => tile(index, true)).join('');
}

function toggleGrammarTile(index) {
  if (arrangedWords.includes(index)) arrangedWords = arrangedWords.filter(value => value !== index);
  else arrangedWords.push(index);
  drawGrammarTiles();
}

function normalizeGrammar(value) {
  return grammarTokens(value.toLowerCase().trim().replace(/[’‘]/g, "'")).join(' ');
}

function checkGrammarPractice() {
  const task = grammarExercises[grammarTopic];
  const steps = grammarPracticeKinds(task);
  const step = state.grammarPractice[grammarTopic];
  const kind = steps[step];
  const value = kind === 'arrange' ? arrangedWords.map(index => arrangementTiles[index]).join(' ') :
    document.getElementById('grammar-answer').value;
  const expected = kind === 'write' ? task.sentence : kind === 'form' ? task.form : task.arrangement;
  if (normalizeGrammar(value) !== normalizeGrammar(expected)) {
    document.getElementById('grammar-feedback').textContent = 'Դեռ ճիշտ չէ։ Ստուգիր բառերի ձևը և հերթականությունը ու նորից փորձիր։';
    return;
  }
  if (step + 1 < steps.length) {
    state.grammarPractice[grammarTopic]++;
    save();
    drawGrammarPractice();
    return;
  }
  if (!state.lessons.includes(grammarTopic)) state.lessons.push(grammarTopic);
  delete state.grammarPractice[grammarTopic];
  save();
  const next = nextGrammarTopic();
  app.innerHTML = '<section class="lesson-body panel"><div class="lesson-reward is-new" role="status">' +
    '<span class="reward-medal" aria-hidden="true">★</span><div><strong>Վարժությունն ավարտված է։</strong>' +
    '<small>' + (next >= 0 ? 'Հաջորդ քերականական դասը բացվել է։' : 'Ավարտել ես քերականության ճանապարհը։') +
    '</small></div></div><div class="tools">' +
    (next >= 0 ? '<button class="primary" onclick="lesson(' + next + ')">Հաջորդ դասը →</button>' : '') +
    '<button class="secondary" onclick="go(\'grammar\')">Վերադառնալ ճանապարհին</button></div></section>';
}
