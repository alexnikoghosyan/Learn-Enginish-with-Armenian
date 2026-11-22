const themedUnits = [
  [
    "Տանը",
    [
      [
        "door",
        "🚪",
        "Please close the door."
      ],
      [
        "window",
        "🪟",
        "Open the window, please."
      ],
      [
        "chair",
        "🪑",
        "I sat on a chair."
      ],
      [
        "table",
        "🍽️",
        "The keys are on the table."
      ],
      [
        "bed",
        "🛏️",
        "I go to bed at ten."
      ]
    ]
  ],
  [
    "Ընտանիք",
    [
      [
        "mother",
        "👩",
        "My mother likes tea."
      ],
      [
        "father",
        "👨",
        "My father works here."
      ],
      [
        "brother",
        "👦",
        "My brother plays football."
      ],
      [
        "sister",
        "👧",
        "My sister lives in Yerevan."
      ],
      [
        "child",
        "🧒",
        "The child is drawing a picture."
      ]
    ]
  ],
  [
    "Քաղաքում",
    [
      [
        "street",
        "🛣️",
        "They live on this street."
      ],
      [
        "shop",
        "🏪",
        "There is a shop near my house."
      ],
      [
        "school",
        "🏫",
        "I walk to school every day."
      ],
      [
        "library",
        "📚",
        "We study at the library."
      ],
      [
        "hospital",
        "🏥",
        "She works at a hospital."
      ]
    ]
  ],
  [
    "Ճանապարհորդություն",
    [
      [
        "car",
        "🚗",
        "We went there by car."
      ],
      [
        "bus",
        "🚌",
        "I take the bus to work."
      ],
      [
        "train",
        "🚆",
        "The train leaves at six."
      ],
      [
        "airport",
        "🛫",
        "We arrived at the airport early."
      ],
      [
        "ticket",
        "🎫",
        "I bought a ticket online."
      ]
    ]
  ],
  [
    "Սնունդ",
    [
      [
        "bread",
        "🍞",
        "I bought fresh bread."
      ],
      [
        "egg",
        "🥚",
        "I ate an egg for breakfast."
      ],
      [
        "cheese",
        "🧀",
        "Would you like some cheese?"
      ],
      [
        "rice",
        "🍚",
        "We had rice for dinner."
      ],
      [
        "lemon",
        "🍋",
        "I added lemon to my tea."
      ]
    ]
  ],
  [
    "Եղանակ",
    [
      [
        "sun",
        "☀️",
        "The sun is shining."
      ],
      [
        "rain",
        "🌧️",
        "The rain stopped at noon."
      ],
      [
        "snow",
        "❄️",
        "The children played in the snow."
      ],
      [
        "wind",
        "🌬️",
        "The wind is very strong today."
      ],
      [
        "cloud",
        "☁️",
        "There is a dark cloud in the sky."
      ]
    ]
  ]
];

themedUnits.push(...[
  [
    "Գնումներ",
    [
      [
        "price",
        "🏷️",
        "What is the price of this shirt?"
      ],
      [
        "cash",
        "💵",
        "Can I pay in cash?"
      ],
      [
        "receipt",
        "🧾",
        "Please keep your receipt."
      ],
      [
        "discount",
        "💸",
        "This shop offers a discount."
      ],
      [
        "size",
        "📏",
        "Do you have this in my size?"
      ]
    ]
  ],
  [
    "Աշխատանք",
    [
      [
        "office",
        "🏢",
        "I left my bag at the office."
      ],
      [
        "meeting",
        "🤝",
        "The meeting starts at ten."
      ],
      [
        "schedule",
        "🗓️",
        "Let me check my schedule."
      ],
      [
        "task",
        "📋",
        "I finished the first task."
      ],
      [
        "team",
        "👥",
        "Our team works together."
      ]
    ]
  ],
  [
    "Առողջություն",
    [
      [
        "doctor",
        "🩺",
        "I have an appointment with the doctor."
      ],
      [
        "nurse",
        "🧑‍⚕️",
        "The nurse showed me where to wait."
      ],
      [
        "medicine",
        "💊",
        "I picked up my medicine at the pharmacy."
      ],
      [
        "headache",
        "🤕",
        "I have a headache today."
      ],
      [
        "rest",
        "🛌",
        "I need some rest after work."
      ]
    ]
  ],
  [
    "Հագուստ",
    [
      [
        "shirt",
        "👔",
        "He is wearing a white shirt."
      ],
      [
        "coat",
        "🧥",
        "Take your coat. It is cold outside."
      ],
      [
        "shoe",
        "👟",
        "There is a stone in my shoe."
      ],
      [
        "dress",
        "👗",
        "She wore a blue dress."
      ],
      [
        "hat",
        "👒",
        "I wear a hat on sunny days."
      ]
    ]
  ],
  [
    "Ազատ ժամանակ",
    [
      [
        "music",
        "🎵",
        "I listen to music on the bus."
      ],
      [
        "movie",
        "🎬",
        "We watched a movie last night."
      ],
      [
        "game",
        "🎲",
        "Would you like to play a game?"
      ],
      [
        "swim",
        "🏊",
        "We swim every Saturday."
      ],
      [
        "dance",
        "💃",
        "They like to dance together."
      ]
    ]
  ],
  [
    "Կապ և հաղորդագրություններ",
    [
      [
        "phone",
        "📱",
        "I forgot my phone at home."
      ],
      [
        "message",
        "💬",
        "Please send me a message."
      ],
      [
        "email",
        "📧",
        "I will reply to your email tomorrow."
      ],
      [
        "call",
        "📞",
        "Can I call you after lunch?"
      ],
      [
        "address",
        "📍",
        "Can you send me your address?"
      ]
    ]
  ]
]);

const starterWords = [
  'coffee', 'milk', 'water', 'tea', 'apple', 'book', 'friend', 'home', 'learn', 'work',
  'help', 'like', 'want', 'need', 'read', 'write', 'speak', 'go', 'come', 'today',
  ...themedUnits.flatMap(([, items]) => items.map(([english]) => english))
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
for (const [, items] of themedUnits) {
  for (const [english, icon, example] of items) {
    curatedExamples[english] = [example, ''];
    if (!illustrations.has(english)) illustrations.set(english, [english, '', icon]);
  }
}
const wordOrder = [
  ...starterWords.map(english => WORDS.findIndex(word => word.en === english)).filter(index => index >= 0),
  ...WORDS.flatMap((word, index) => starterWords.includes(word.en) ? [] : [index])
];
const wordLessonStepCount = 4;
state.wordLessons ??= {};
let currentWordIndex = wordOrder[0];

function lessonEntry(index) {
  return state.wordLessons[index] ??= { step: 0, explanation: '', sentence: '', second: '', done: false };
}

function firstUnfinishedWord() {
  return nextCourseWord() ?? wordOrder[wordStartingPosition()];
}

const wordsPerUnit = 5;
const unitsPerPage = 3;
const pathUnitCount = Math.ceil(wordOrder.length / wordsPerUnit);
const pathUnitNames = ['Առաջին բառերը', 'Մարդիկ ու առօրյա', 'Պարզ արտահայտություններ', 'Խոսք և ժամանակ', ...themedUnits.map(([name]) => name)];
let pathPage = 0;
try {
  const savedPathPage = Number(localStorage.getItem('eg-word-path-page'));
  if (Number.isInteger(savedPathPage) && savedPathPage >= 0 && savedPathPage < Math.ceil(pathUnitCount / unitsPerPage)) {
    pathPage = savedPathPage;
  }
} catch {}

function showLearningPath(page) {
  pathPage = Math.max(0, Math.min(page, Math.ceil(pathUnitCount / unitsPerPage) - 1));
  try { localStorage.setItem('eg-word-path-page', String(pathPage)); } catch {}
  vocabulary('path');
  window.scrollTo(0, 0);
}

function wordPathIcon(word) {
  const illustration = illustrations.get(word.en.toLowerCase());
  if (illustration) return pictureArt(illustration[2], illustration[3], illustration[0]);
  const icon = WORD_HINTS[word.en]?.[2];
  if (icon) return '<span class="picture-emoji">' + esc(icon) + '</span>';
  return '<span class="path-letter">' + esc(Array.from(word.en).slice(0, 2).join('').toUpperCase()) + '</span>';
}

const reviewPathIcon = gardenIllustration('dumbbell');

function drawLearningPath() {
  const completed = wordOrder.filter(index => state.wordLessons[index]?.done).length;
  const nextIndex = nextCourseWord();
  const nextPosition = wordOrder.indexOf(state.cumulativeReview?.afterWord ?? state.cumulativeReview?.words.at(-1) ?? nextIndex);
  const nextPage = nextPosition < 0 ? 0 : Math.floor(nextPosition / (wordsPerUnit * unitsPerPage));
  const firstUnit = pathPage * unitsPerPage;
  const lastUnit = Math.min(firstUnit + unitsPerPage, pathUnitCount);
  const units = [];
  for (let unit = firstUnit; unit < lastUnit; unit++) {
    const indexes = wordOrder.slice(unit * wordsPerUnit, (unit + 1) * wordsPerUnit);
    const unitCompleted = indexes.filter(index => state.wordLessons[index]?.done).length;
    const title = pathUnitNames[unit] ?? (WORDS[indexes[0]].en + ' – ' + WORDS[indexes.at(-1)].en);
    const pending = state.cumulativeReview;
    const pendingWord = pending?.afterWord ?? pending?.words.at(-1);
    const nodes = indexes.map((index, offset) => {
      const done = state.wordLessons[index]?.done;
      const current = index === nextIndex && !pending;
      const reviewing = index === pendingWord;
      return renderPathStop(WORDS[index].en, offset * 2, done ? 'done' : current ? 'current' : 'locked',
        done || current ? 'openWordLesson(' + index + ')' : '', wordPathIcon(WORDS[index]), 'en') +
        renderPathStop('Կրկնություն', offset * 2 + 1,
          reviewing ? 'current' : done ? 'done' : 'locked',
          reviewing ? 'startCumulativeReview()' : done && !pending ? 'replayWordReview(' + index + ')' : '', reviewPathIcon);
    }).join('');
    units.push('<section class="path-unit" data-color="' + (unit % 7) + '"><div class="path-unit-heading"><div><small>Բաժին ' +
      (unit + 1) + '</small><h3>' + esc(title) + '</h3></div><span>' +
      unitCompleted + ' / ' + indexes.length + '</span></div><ol>' + nodes + '</ol>' + courseMilestone(unitCompleted === indexes.length && !indexes.includes(pendingWord)) + '</section>');
  }
  app.innerHTML = courseLayout('<h1>Բառեր</h1>' +
    '<div class="learning-path"><div class="path-intro"><div><h2>Ուսուցման ճանապարհ</h2><p>' +
    completed + ' / ' + WORDS.length + ' դաս ավարտված</p></div>' +
    (!state.cumulativeReview && nextIndex === undefined ? '<strong>Ճանապարհն ավարտված է ✓</strong>' : '') +
    '</div><div class="progress" role="progressbar" aria-label="Ուսուցման առաջընթաց" aria-valuemin="0" aria-valuemax="' +
    WORDS.length + '" aria-valuenow="' + completed + '"><span style="width:' + completed / WORDS.length * 100 +
    '%"></span></div><div class="path-page-controls">' +
    (pathPage > 0 ? '<button class="secondary path-previous" onclick="showLearningPath(' +
      (pathPage - 1) + ')">← Նախորդ</button>' : '') + '<small>Բաժիններ ' +
    (firstUnit + 1) + '–' + lastUnit + '</small>' +
    (lastUnit < pathUnitCount ? '<button class="secondary path-next" onclick="showLearningPath(' + (pathPage + 1) +
      ')">Հաջորդ →</button>' : '') + '</div>' +
    (pathPage !== nextPage ? '<button class="text-button path-return" onclick="showLearningPath(' + nextPage +
      ')">Գտնել իմ հաջորդ դասը</button>' : '') + units.join('') + '</div>', 'words');
  updatePathArrow();
}

function openWordLesson(index = firstUnfinishedWord()) {
  if (state.cumulativeReview && !state.wordLessons[index]?.done) {
    startCumulativeReview();
    return;
  }
  if (!state.wordLessons[index]?.done) index = firstUnfinishedWord();
  currentWordIndex = index;
  // Կիսատ թողած նոր բառի դասը հաջորդ մուտքին սկսվում է 0-ից (գրածդ սևագրերը պահվում են)
  if (!state.wordLessons[index]?.done) {
    const entry = lessonEntry(index);
    if (entry.step) { entry.step = 0; save(); }
  }
  beginLessonCounters('word:' + index);
  view = 'vocabulary';
  pictureTab = 'pictures';
  drawWordLesson();
  window.scrollTo(0, 0);
}

function wordArtwork(word, hint) {
  const entry = illustrations.get(word.en.toLowerCase());
  const hash = Array.from(word.en).reduce((number, letter) => (number * 31 + letter.codePointAt(0)) >>> 0, 0);
  const art = entry ? pictureArt(entry[2], entry[3], entry[0]) :
    hint?.[2] ? '<span class="picture-emoji" aria-hidden="true">' + hint[2] + '</span>' :
    '<span class="word-monogram" aria-hidden="true">' + esc(Array.from(word.en).slice(0, 2).join('').toUpperCase()) + '</span>';
  const caption = entry ? '' : hint?.[3] ? 'Թեմատիկ հուշում · ' + esc(hint[3]) : 'Տառային հուշում';
  return '<figure class="word-artwork" style="--word-hue:' + hash % 360 + '">' +
    art + '<strong lang="en">' + esc(word.en) + '</strong>' +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
}

function drawWordLesson(justCompleted = false) {
  const word = WORDS[currentWordIndex];
  const entry = lessonEntry(currentWordIndex);
  const hint = WORD_HINTS[word.en];
  const example = curatedExamples[word.en] ?? (hint?.[1] ? [hint[1], ''] : null);
  const meaning = hy(word) || word.mt;
  const machine = !state.notes[word.en] && !word.hy && Boolean(word.mt);
  const exampleBlock = example ? '<blockquote><span lang="en">' + esc(example[0]) + '</span>' +
    (example[1] ? '<small>' + esc(example[1]) + '</small>' : '') + '</blockquote>' : '';
  let content = '';
  if (entry.step === 0) {
    content = '<div class="new-word-caption">✦ ՆՈՐ ԲԱՌ</div>' + wordArtwork(word, hint) + '<div class="word-content">' +
      '<button class="secondary" data-speak="' + esc(word.en) + '">' + actionIcon('speaker') + ' Լսել արտասանությունը</button>' +
      (meaning ? '<h2>' + esc(meaning) + '</h2>' : '') +
      (machine ? '<small>Ավտոմատ թարգմանություն · ստուգիր իմաստը համատեքստում</small>' : '') +
      (typeof WORD_HINTS_HY !== 'undefined' && WORD_HINTS_HY[word.en] ? '<p>' + esc(WORD_HINTS_HY[word.en]) + '</p>' : '') +
      (exampleBlock ? '<h3>Օրինակ</h3>' + exampleBlock : '') + '</div>';
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
      (entry.done ? '<div role="status" class="lesson-reward' + (justCompleted ? ' is-new' : '') +
        '"><span class="reward-medal" aria-hidden="true">' + gardenIllustration('medal') + '</span><div><strong>Դասն ավարտված է։</strong>' +
        '<small>Գրածդ պահպանվել է «Իմ գրառումները» բաժնում։</small>' + rewardChips(justCompleted, justCompleted ? finishLessonCounters() : null) + '</div></div>' : '');
  }
  app.innerHTML = focusLessonHeader(entry.step, wordLessonStepCount, 'vocabulary', { showInitialFill: true }) + '<h1>Բառեր</h1>'  +
    '<section class="panel word-lesson-panel">' + content +
    '<p id="word-lesson-error" role="alert" class="word-lesson-error"></p></section>' +
    '<div class="word-actions lesson-controls">' +
    (entry.step ? '<button class="secondary" onclick="moveWordLesson(-1)">← Հետ</button>' : '') +
    '<button class="primary" onclick="moveWordLesson(1)">' +
    (entry.step < 3 ? 'Շարունակել →' : entry.done ? (state.cumulativeReview ? 'Սկսել կրկնությունը →' : 'Հաջորդ բառը →') : 'Ավարտել դասը ✓') +
    '</button></div>';
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
  if (lessonTransitionRunning) return;
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
        if (state.cumulativeReview) startCumulativeReview();
        else continueAfterReview();
        return;
      }
      entry.done = true;
      recordStudyDay();
      queueCumulativeReview(currentWordIndex);
      save();
      transitionLesson(() => drawWordLesson(true));
      if (Object.values(state.wordLessons).filter(item => item.done).length + state.lessons.length === 1 && !state.soundXp) offerMobileProgress();
      return;
    }
  }
  entry.step = Math.max(0, Math.min(3, entry.step + direction));
  save();
  transitionLesson(drawWordLesson, direction);
}
