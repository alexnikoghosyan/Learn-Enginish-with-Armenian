const starterWords = [
  'coffee', 'milk', 'water', 'tea', 'apple', 'book', 'friend', 'home', 'learn', 'work',
  'help', 'like', 'want', 'need', 'read', 'write', 'speak', 'go', 'come', 'today'
];
const curatedExamples = {
  coffee: ['I drink coffee in the morning.', 'Ես առավոտյան սուրճ եմ խմում։'],
  milk: ['She puts milk in her tea.', 'Նա թեյի մեջ կաթ է լցնում։'],
  water: ['Can I have a glass of water?', 'Կարո՞ղ եմ մի բաժակ ջուր խնդրել։'],
  tea: ['Would you like some tea?', 'Թեյ կցանկանա՞ս։'],
  apple: ['I have an apple in my bag.', 'Պայուսակումս խնձոր կա։'],
  book: ['I read a book before bed.', 'Քնելուց առաջ գիրք եմ կարդում։'],
  friend: ['My friend lives near me.', 'Իմ ընկերը մոտակայքում է ապրում։'],
  home: ['I go home after school.', 'Ես դասերից հետո տուն եմ գնում։'],
  learn: ['We learn new words every day.', 'Մենք ամեն օր նոր բառեր ենք սովորում։'],
  work: ['I work in a small office.', 'Ես փոքր գրասենյակում եմ աշխատում։'],
  help: ['Can you help me with this exercise?', 'Կարո՞ղ ես օգնել ինձ այս վարժության հարցում։'],
  like: ['I like this song.', 'Ինձ դուր է գալիս այս երգը։'],
  want: ['I want to learn English.', 'Ես ուզում եմ անգլերեն սովորել։'],
  need: ['We need more time.', 'Մեզ ավելի շատ ժամանակ է պետք։'],
  read: ['They read the news every morning.', 'Նրանք ամեն առավոտ լուրերն են կարդում։'],
  write: ['Please write your name here.', 'Խնդրում եմ՝ անունդ գրիր այստեղ։'],
  speak: ['Do you speak English?', 'Դու անգլերեն խոսո՞ւմ ես։'],
  go: ['I go to school by bus.', 'Ես ավտոբուսով եմ գնում դպրոց։'],
  come: ['Can you come to my house?', 'Կարո՞ղ ես գալ իմ տուն։'],
  today: ['I have a lesson today.', 'Այսօր դաս ունեմ։']
};
const illustrations = new Map(Object.values(pictureTopics).flat().map(entry => [entry[0], entry]));
const wordOrder = [
  ...starterWords.map(english => WORDS.findIndex(word => word.en === english)).filter(index => index >= 0),
  ...WORDS.flatMap((word, index) => starterWords.includes(word.en) ? [] : [index])
];
const stepLabels = ['Սովորիր', 'Բացատրիր', 'Գրիր', 'Վերանայիր'];
state.wordLessons ??= {};
let currentWordIndex = wordOrder[0];

function lessonEntry(index) {
  return state.wordLessons[index] ??= { step: 0, explanation: '', sentence: '', second: '', done: false };
}

function firstUnfinishedWord() {
  return wordOrder.find(index => !state.wordLessons[index]?.done) ?? wordOrder[0];
}

function openWordLesson(index = firstUnfinishedWord()) {
  currentWordIndex = index;
  view = 'vocabulary';
  pictureTab = 'pictures';
  drawWordLesson();
  window.scrollTo(0, 0);
}

function wordArtwork(word, hint) {
  const entry = illustrations.get(word.en.toLowerCase());
  const hash = Array.from(word.en).reduce((number, letter) => (number * 31 + letter.codePointAt(0)) >>> 0, 0);
  const art = entry ? pictureArt(entry[2], entry[3]) :
    hint?.[2] ? '<span class="picture-emoji" aria-hidden="true">' + hint[2] + '</span>' :
    '<span class="word-monogram" aria-hidden="true">' + esc(Array.from(word.en).slice(0, 2).join('').toUpperCase()) + '</span>';
  const caption = entry ? '' : hint?.[3] ? 'Թեմատիկ հուշում · ' + esc(hint[3]) : 'Տառային հուշում';
  return '<figure class="word-artwork" style="--word-hue:' + hash % 360 + '">' +
    art + '<strong lang="en">' + esc(word.en) + '</strong>' +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
}

function drawWordLesson() {
  const word = WORDS[currentWordIndex];
  const entry = lessonEntry(currentWordIndex);
  const hint = WORD_HINTS[word.en];
  const example = curatedExamples[word.en] ?? (hint?.[1] ? [hint[1], ''] : null);
  const meaning = hy(word) || word.mt;
  const machine = !state.notes[word.en] && !word.hy && Boolean(word.mt);
  const lookup = 'https://translate.google.com/?sl=en&tl=hy&text=' + encodeURIComponent(word.en) + '&op=translate';
  const exampleBlock = example ? '<blockquote><span lang="en">' + esc(example[0]) + '</span>' +
    (example[1] ? '<small>' + esc(example[1]) + '</small>' : '') + '</blockquote>' : '';
  const count = Object.values(state.wordLessons).filter(item => item.done).length;
  let content = '';
  if (entry.step === 0) {
    content = wordArtwork(word, hint) + '<div class="word-content">' +
      '<button class="secondary" data-speak="' + esc(word.en) + '">◖)) Լսել արտասանությունը</button>' +
      (meaning ? '<h2>' + esc(meaning) + '</h2>' : '') +
      (machine ? '<small>Ավտոմատ թարգմանություն · ստուգիր իմաստը համատեքստում</small>' : '') +
      (hint?.[0] ? '<p lang="en">' + esc(hint[0]) + '</p>' : '') +
      (exampleBlock ? '<h3>Օրինակ</h3>' + exampleBlock : '') +
      '<p><a href="' + lookup + '" target="_blank" rel="noopener">Դիտել թարգմանության տարբերակները ↗</a></p></div>';
  } else if (entry.step === 1) {
    content = '<h2>Ի՞նչ է նշանակում <span lang="en">' + esc(word.en) + '</span>։</h2>' +
      '<p>Գրիր հայերենով, ինչպես կբացատրեիր ընկերոջդ։ Կարող ես նշել նաև, թե երբ է այն օգտագործվում։</p>' +
      '<label for="explanation">Իմ բացատրությունը</label>' +
      draftField('explanation', entry.explanation, 'Գրիր քո բառերով…');
  } else if (entry.step === 2) {
    content = '<h2>Կազմիր նախադասություն</h2><p>Գրիր անգլերեն նախադասություն՝ օգտագործելով <strong lang="en">' +
      esc(word.en) + '</strong> բառը։ Փորձիր նկարագրել մի իրական իրավիճակ։</p>' +
      (exampleBlock ? '<details><summary>Տեսնել օրինակ</summary>' + exampleBlock + '</details>' : '') +
      '<label for="sentence">Իմ նախադասությունը</label>' + draftField('sentence', entry.sentence, 'Գրիր անգլերեն…') +
      '<label for="second">Երկրորդ նախադասություն (ըստ ցանկության)</label>' + draftField('second', entry.second, 'Օգտագործիր բառը մեկ այլ իրավիճակում…');
  } else {
    content = '<h2>Վերանայիր գրածդ</h2><p>Ստուգիր՝ արդյոք բառը կիրառել ես ճիշտ իմաստով և նախադասությունը ամբողջական միտք է արտահայտում։</p>' +
      '<h3>Իմ բացատրությունը</h3><div class="written-answer">' + esc(entry.explanation) + '</div>' +
      '<h3>Իմ նախադասությունները</h3><div class="written-answer" lang="en">' +
      esc([entry.sentence, entry.second].filter(Boolean).join('\n')) + '</div>' +
      (exampleBlock ? '<h3>Համեմատիր օրինակի հետ</h3>' + exampleBlock : '') +
      (entry.done ? '<p role="status">Դասն ավարտված է։ Գրածդ պահպանված է։ ✓</p>' : '');
  }
  app.innerHTML = '<h1>Բառեր</h1>' + vocabularyTabs() +
    '<div class="word-lesson-meta"><small>Ավարտված է ' + count + ' / ' + WORDS.length + '</small>' +
    '<button class="text-button" onclick="vocabulary(\'dictionary\')">Ընտրել բառ →</button></div>' +
    '<ol class="lesson-steps">' + stepLabels.map((label, index) =>
      '<li ' + (entry.step === index ? 'aria-current="step"' : '') + '>' + esc(label) + '</li>').join('') + '</ol>' +
    '<section class="panel word-lesson-panel">' + content +
    '<p id="word-lesson-error" role="alert" class="word-lesson-error"></p>' +
    '<div class="tools word-actions">' +
    (entry.step ? '<button class="secondary" onclick="moveWordLesson(-1)">← Հետ</button>' : '') +
    '<button class="primary" onclick="moveWordLesson(1)">' +
    (entry.step < 3 ? 'Շարունակել →' : entry.done ? 'Հաջորդ բառը →' : 'Ավարտել դասը ✓') +
    '</button></div></section>';
}

function draftField(key, value, placeholder) {
  return '<textarea id="' + key + '" maxlength="1500" oninput="saveWordDraft(this)" placeholder="' +
    esc(placeholder) + '">' + esc(value) + '</textarea>';
}

function saveWordDraft(field) {
  lessonEntry(currentWordIndex)[field.id] = field.value;
  document.getElementById('word-lesson-error').textContent = '';
  save();
}

function moveWordLesson(direction) {
  const entry = lessonEntry(currentWordIndex);
  if (direction > 0) {
    const message = entry.step === 1 && !entry.explanation.trim() ? 'Շարունակելու համար գրիր քո բացատրությունը։' :
      entry.step === 2 && !/[A-Za-z]+[\s\S]*\s+[\s\S]*[A-Za-z]/.test(entry.sentence.trim()) ?
        'Գրիր ամբողջական նախադասություն անգլերենով։' : '';
    if (message) {
      document.getElementById('word-lesson-error').textContent = message;
      return;
    }
    if (entry.step === 3) {
      if (entry.done) {
        openWordLesson(firstUnfinishedWord());
        return;
      }
      entry.done = true;
      save();
      drawWordLesson();
      return;
    }
  }
  entry.step = Math.max(0, Math.min(3, entry.step + direction));
  save();
  drawWordLesson();
}
