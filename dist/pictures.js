const pictureTopics = {
  'Խմիչքներ': [
    ['coffee', 'սուրճ', '☕', 'coffee'], ['milk', 'կաթ', '🥛', 'milk'],
    ['water', 'ջուր', '💧', 'water'], ['tea', 'թեյ', '🍵', 'tea'],
    ['juice', 'հյութ', '🧃'], ['beer', 'գարեջուր', '🍺']
  ],
  'Սնունդ': [
    ['apple', 'խնձոր', '🍎'], ['bread', 'հաց', '🍞'], ['egg', 'ձու', '🥚'],
    ['cheese', 'պանիր', '🧀'], ['broccoli', 'բրոկոլի', '🥦'], ['corn', 'եգիպտացորեն', '🌽'],
    ['rice', 'բրինձ', '🍚'], ['lemon', 'կիտրոն', '🍋']
  ],
  'Կենդանիներ': [
    ['cat', 'կատու', '🐈'], ['dog', 'շուն', '🐕'], ['cow', 'կով', '🐄'],
    ['horse', 'ձի', '🐎'], ['fish', 'ձուկ', '🐟'], ['whale', 'կետ', '🐋'],
    ['wolf', 'գայլ', '🐺'], ['chicken', 'հավ', '🐔']
  ],
  'Առարկաներ': [
    ['book', 'գիրք', '📕'], ['bag', 'պայուսակ', '🎒'], ['clock', 'ժամացույց', '🕒'],
    ['chair', 'աթոռ', '🪑'], ['bed', 'մահճակալ', '🛏️'], ['door', 'դուռ', '🚪'],
    ['key', 'բանալի', '🔑'], ['camera', 'տեսախցիկ, լուսանկարչական ապարատ', '📷']
  ],
  'Տրանսպորտ և վայրեր': [
    ['car', 'մեքենա', '🚗'], ['train', 'գնացք', '🚆'], ['boat', 'նավակ', '🛥️'],
    ['airplane', 'ինքնաթիռ', '✈️'], ['ambulance', 'շտապօգնության մեքենա', '🚑'],
    ['school', 'դպրոց', '🏫'], ['house', 'տուն', '🏠'], ['bridge', 'կամուրջ', '🌉']
  ]
};

for (const [topic, entries] of Object.entries(pictureTopics)) {
  pictureTopics[topic] = entries.filter(([english, armenian]) => {
    const word = WORDS.find(entry => entry.en.toLowerCase() === english);
    if (!word) return false;
    word.hy ||= armenian;
    return true;
  });
}

let pictureTopic = Object.keys(pictureTopics)[0];
let pictureSelection = '';
let pictureExercise = null;
let pictureTab = 'pictures';

function vocabulary(tab = 'pictures') {
  pictureTab = tab;
  if (tab === 'dictionary') { words(); return; }
  if (tab === 'cards') { cards(); return; }
  picturePage();
}

function vocabularyTabs() {
  const tabs = [['pictures', 'Պատկերային բառեր'], ['dictionary', 'Ամբողջ բառացանկը'], ['cards', 'Կրկնություն']];
  return '<div class="picture-tabs">' + tabs.map(([tab, name]) =>
    '<button class="secondary" aria-pressed="' + (pictureTab === tab) + '" onclick="vocabulary(\'' + tab + '\')">' + name + '</button>'
  ).join('') + '</div>';
}

function selectPictureTopic(topic) {
  pictureTopic = topic;
  pictureSelection = '';
  pictureExercise = null;
  picturePage();
}

function pictureArt(emoji, shape) {
  if (!shape) return '<span class="picture-emoji" aria-hidden="true">' + emoji + '</span>';
  return '<span class="drink-art ' + shape + '" aria-hidden="true"><i></i><b></b></span>';
}

function picturePage() {
  const entries = pictureTopics[pictureTopic];
  const exercise = pictureExercise;
  const selected = entries.find(([english]) => english === pictureSelection);
  const prompt = exercise
    ? '<h2>Ընտրիր «' + esc(exercise.target[1]) + '» բառի պատկերը</h2>'
    : '<p class="muted">Սեղմիր քարտին՝ լսելու բառը և տեսնելու հայերեն իմաստը։</p>';
  app.innerHTML = '<h1>Բառեր</h1>' + vocabularyTabs() +
    '<div class="picture-topics">' + Object.keys(pictureTopics).map((topic, index) =>
      '<button class="secondary" aria-pressed="' + (topic === pictureTopic) +
      '" onclick="selectPictureTopic(Object.keys(pictureTopics)[' + index + '])">' + topic + '</button>'
    ).join('') + '</div>' + prompt +
    '<div class="picture-grid">' + (exercise?.choices || entries).map(([english, armenian, emoji, shape]) => {
      const active = english === pictureSelection;
      const result = exercise?.checked && active ? (english === exercise.target[0] ? ' correct' : ' wrong') : '';
      return '<button class="picture-tile' + result + '" aria-pressed="' + active +
        '" onclick="pickPicture(\'' + english + '\')">' + pictureArt(emoji, shape) +
        '<strong lang="en">' + english + '</strong>' + (!exercise && active ? '<small>' + esc(armenian) + '</small>' : '') + '</button>';
    }).join('') + '</div>' +
    '<div class="picture-feedback" aria-live="polite">' +
    (exercise?.checked ? (pictureSelection === exercise.target[0] ? 'Ճիշտ է։ ✓' : 'Ճիշտ պատասխանը՝ ' + exercise.target[0]) : '') + '</div>' +
    '<div class="tools">' +
    (exercise ? (exercise.checked
      ? '<button class="primary" onclick="startPictureExercise()">Հաջորդ բառը →</button>'
      : '<button class="primary" onclick="checkPicture()" ' + (selected ? '' : 'disabled') + '>Ստուգել</button>') +
      '<button class="secondary" onclick="selectPictureTopic(pictureTopic)">Ավարտել վարժությունը</button>'
      : '<button class="primary" onclick="startPictureExercise()">Փորձել վարժությունը →</button>' +
        (selected ? '<button class="secondary" data-speak="' + selected[0] + '">Լսել կրկին</button>' : '')) +
    '</div>';
}

function pickPicture(english) {
  if (pictureExercise?.checked) return;
  pictureSelection = english;
  picturePage();
  if (!pictureExercise) app.querySelector('[data-speak]')?.click();
  app.querySelector('.picture-tile[aria-pressed="true"]')?.focus();
}

function startPictureExercise() {
  const entries = pictureTopics[pictureTopic];
  const candidates = entries.filter(entry => entry !== pictureExercise?.target);
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const distractors = shuffled(entries.filter(entry => entry !== target)).slice(0, 3);
  pictureExercise = { target, choices: shuffled([target, ...distractors]), checked: false };
  pictureSelection = '';
  picturePage();
}

function shuffled(entries) {
  const result = [...entries];
  for (let index = result.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [result[index], result[random]] = [result[random], result[index]];
  }
  return result;
}

function checkPicture() {
  if (!pictureSelection || !pictureExercise || pictureExercise.checked) return;
  pictureExercise.checked = true;
  picturePage();
}
