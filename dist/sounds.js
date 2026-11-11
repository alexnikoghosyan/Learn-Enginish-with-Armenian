const vowelSounds = [
  ['ɑ','hot','hat'], ['æ','cat','cut'], ['ʌ','but','bat'], ['ɛ','bed','bad'],
  ['eɪ','say','see'], ['ɝ','bird','bed'], ['ɪ','ship','sheep'], ['i','sheep','ship'],
  ['ə','about','bout'], ['oʊ','boat','bought'], ['ʊ','foot','food'], ['u','food','foot'],
  ['aʊ','cow','coy'], ['aɪ','time','tame'], ['ɔɪ','boy','bay']
];
const consonantSounds = [
  ['b','book','cook'], ['tʃ','chair','share'], ['d','day','they'],
  ['f','fish','dish'], ['ɡ','go','no'], ['h','home','foam'],
  ['dʒ','job','chop'], ['k','key','tea'], ['l','light','right'],
  ['m','moon','noon'], ['n','nose','rose'], ['ŋ','sing','sin'],
  ['p','pig','big'], ['ɹ','red','led'], ['s','see','she'],
  ['ʒ','beige','base'], ['ʃ','shoe','Sue'], ['t','time','dime'],
  ['ð','then','den'], ['θ','think','sink'], ['v','very','berry'],
  ['w','wet','vet'], ['j','yet','wet'], ['z','zoo','Sue']
];
const soundInventory = [...vowelSounds, ...consonantSounds];
state.soundProgress ??= {};
state.soundXp ??= 0;
let selectedSound = null;
let soundRound = [];
let soundCursor = 0;
let soundCorrect = 0;
let soundAttempted = 0;
let soundAnswer = null;
let soundChecked = false;

function sounds() {
  const practiced = soundInventory.filter(([ipa]) => state.soundProgress[ipa] > 0).length;
  function soundGrid(title, entries) {
    return '<section class="sound-group"><h2>' + title + '</h2><div class="sound-grid">' +
      entries.map(([ipa, word]) => {
        const index = soundInventory.findIndex(sound => sound[0] === ipa);
        const complete = Math.min(3, state.soundProgress[ipa] || 0);
        return '<button class="sound-tile" data-speak="' + esc(word) + '" aria-pressed="' + (selectedSound === index) +
          '" onclick="selectSound(' + index + ', this)" aria-label="Լսել ' + esc(word) +
          '"><strong lang="en">' + ipa + '</strong><span lang="en">' + esc(word) +
          '</span><progress max="3" value="' + complete + '" aria-label="Հնչյունի առաջընթաց"></progress></button>';
      }).join('') + '</div></section>';
  }
  app.innerHTML = '<div class="course-layout sounds-layout"><div class="course-track sound-track">' +
    '<header class="sounds-intro"><h1>Սովորենք անգլերենի հնչյունները</h1>' +
    '<p>Լսիր բառերը, կրկնիր բարձրաձայն և վարժվիր տարբերել նման հնչյունները։</p>' +
    '<button class="primary sound-start" onclick="startSoundRound()">Սկսել · +10 միավոր</button></header>' +
    '<div id="sound-selection" aria-live="polite">' + soundSelectionMarkup() + '</div>' +
    soundGrid('Ձայնավորներ', vowelSounds) + soundGrid('Բաղաձայններ', consonantSounds) +
    '</div><div class="course-rail"><section class="panel course-progress"><h2>Հնչյունների առաջընթացը</h2>' +
    '<div class="course-stat">' + referenceIcon('progress') + '<div><strong>' + practiced + ' / ' + soundInventory.length +
    '</strong><p>Վարժված հնչյուններ</p></div></div><progress max="' + soundInventory.length + '" value="' + practiced +
    '" aria-label="Հնչյունների առաջընթաց"></progress></section><section class="panel course-progress"><h2>Լսելու վարժություններ</h2>' +
    '<p><strong>' + state.soundXp + '</strong> միավոր</p></section></div></div>';
}

function soundSelectionMarkup() {
  if (selectedSound === null) return '';
  const [ipa, word] = soundInventory[selectedSound];
  return '<div class="sound-selected"><span><strong lang="en">/' + ipa + '/ · ' + esc(word) +
    '</strong></span><button class="secondary" onclick="startSoundRound(' + selectedSound + ')">Վարժվել այս հնչյունով</button></div>';
}

function selectSound(index, button) {
  selectedSound = index;
  app.querySelector('.sound-tile[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-pressed', 'true');
  document.getElementById('sound-selection').innerHTML = soundSelectionMarkup();
}

function startSoundRound(index = null) {
  const soundsToPractice = index === null ? shuffled(soundInventory).slice(0, 6) :
    Array.from({ length: 6 }, () => soundInventory[index]);
  soundRound = soundsToPractice.map(([ipa, word, alternative], question) => {
    const sameMode = question % 3 === 2;
    const first = Math.random() < .5 ? word : alternative;
    const second = Math.random() < .5 ? word : alternative;
    return sameMode
      ? { ipa, audio: [first, second], options: ['Նույնն են', 'Տարբեր են'], answer: first === second ? 0 : 1 }
      : { ipa, audio: [first], options: [word, alternative], answer: first === word ? 0 : 1 };
  });
  soundCursor = 0;
  soundCorrect = 0;
  soundAttempted = 0;
  drawSoundQuestion();
}

function drawSoundQuestion() {
  soundAnswer = null;
  soundChecked = false;
  const question = soundRound[soundCursor];
  const pair = question.audio.length === 2;
  app.innerHTML = focusLessonHeader(soundCursor, soundRound.length, "go('sounds')", { showCount: false, lead: .6 }) +
    '<section class="lesson-body sound-question"><h1>' + (pair ? 'Նո՞ւյնն են հնչում, թե՞ տարբեր' : 'Ո՞ր բառը լսեցիր') +
    '</h1><div class="sound-audio">' + question.audio.map((word, index) =>
      '<button class="secondary sound-play" data-speak="' + esc(word) + '" aria-label="Լսել ձայն ' + (index + 1) +
      '" onclick="animateSoundSpeaker(this)"><svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<path fill="currentColor" d="M7 17h5L22 9a2 2 0 0 1 3 2v26a2 2 0 0 1-3 2l-10-8H7a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z"/>' +
      '<path class="sound-wave-inner" d="M31 17a8 8 0 0 1 0 14"/><path class="sound-wave-outer" d="M36 10a16 16 0 0 1 0 28"/></svg>' +
      (pair ? '<span>' + (index + 1) + '</span>' : '') + '</button>'
    ).join('') + '</div><div class="options sound-options">' + question.options.map((option, index) =>
      '<button class="option" aria-pressed="false" onclick="chooseSoundAnswer(' + index + ')"><span class="sound-option-number" aria-hidden="true">' +
      (index + 1) + '</span>' + esc(option) + '</button>'
    ).join('') + '</div><p id="sound-feedback" role="status"></p></section>' +
    '<div class="tools lesson-controls sound-controls"><button class="secondary" id="sound-skip" onclick="advanceSoundRound()">Բաց թողնել</button>' +
    '<button class="primary" id="sound-check" onclick="checkSoundAnswer()" disabled>Ստուգել</button></div>';
  window.scrollTo(0, 0);
}

function animateSoundSpeaker(button) {
  button.classList.remove('is-speaking');
  void button.offsetWidth;
  button.classList.add('is-speaking');
}

function chooseSoundAnswer(index) {
  if (soundChecked) return;
  soundAnswer = index;
  app.querySelectorAll('.sound-options button').forEach((button, position) =>
    button.setAttribute('aria-pressed', String(index === position)));
  document.getElementById('sound-check').disabled = false;
}

function checkSoundAnswer() {
  if (soundAnswer === null) return;
  if (soundChecked) {
    advanceSoundRound();
    return;
  }
  const question = soundRound[soundCursor];
  soundChecked = true;
  soundAttempted++;
  document.getElementById('sound-skip').hidden = true;
  if (soundAnswer === question.answer) {
    soundCorrect++;
    state.soundProgress[question.ipa] = Math.min(3, (state.soundProgress[question.ipa] || 0) + 1);
    save();
  }
  app.querySelectorAll('.sound-options button').forEach((button, index) => {
    if (index === question.answer) button.classList.add('correct');
    else if (index === soundAnswer) button.classList.add('wrong');
    button.disabled = true;
  });
  document.getElementById('sound-feedback').textContent = soundAnswer === question.answer ? 'Ճիշտ է։ ✓' :
    'Ճիշտ պատասխանը՝ ' + question.options[question.answer];
  document.getElementById('sound-check').textContent = 'Շարունակել →';
}

function advanceSoundRound() {
  if (soundCursor >= soundRound.length) return;
  soundCursor++;
  if (soundCursor < soundRound.length) { drawSoundQuestion(); return; }
  const points = soundAttempted ? 10 : 0;
  state.soundXp += points;
  save();
  app.innerHTML = '<section class="lesson-body panel"><div class="lesson-reward is-new" role="status">' +
    '<span class="reward-medal" aria-hidden="true">★</span><div><strong>Վարժությունն ավարտված է։</strong><small>' +
    soundCorrect + ' / ' + soundRound.length + ' ճիշտ պատասխան' + (points ? ' · +10 միավոր' : '') +
    '</small></div></div><div class="tools"><button class="primary" onclick="go(\'sounds\')">' +
    'Վերադառնալ հնչյուններին</button></div></section>';
}
