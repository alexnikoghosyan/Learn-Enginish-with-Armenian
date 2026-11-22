// Հասցեներ (History API). ամեն էկրան ունի իր /ուղին, Back/Forward-ը և refresh-ը աշխատում են։
// Սկավառակից բացված մեկ ֆայլի տարբերակում (file:) սերվեր չկա, ուստի օգտագործվում է #/ուղի։
//   /                         գլխավոր («Սովորել»)
//   /grammar                  քերականության ճանապարհ
//   /grammar/lesson/3         3-րդ դասի կանոնը,  /grammar/lesson/3/practice՝ վարժությունը
//   /words                    բառերի ճանապարհ
//   /words/unit/2/lesson/4    2-րդ բաժնի 4-րդ բառի դասը
//   /words/dictionary, /words/cards, /words/pictures
//   /review, /sounds, /sounds/practice, /journal, /profile, /signup, /signin, /welcome
const routeUsesHash = location.protocol === 'file:';
let routeApplying = false;
let routeCounter = 0;

function readRoute() {
  const raw = routeUsesHash ? location.hash.replace(/^#/, '') || '/' : location.pathname + location.search;
  const [pathPart, queryPart = ''] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts, query: new URLSearchParams(queryPart) };
}

function wordLessonPath(index = currentWordIndex) {
  const position = wordOrder.indexOf(index);
  if (position < 0) return '/words';
  return '/words/unit/' + (Math.floor(position / wordsPerUnit) + 1) + '/lesson/' + (position % wordsPerUnit + 1);
}

function routeTitle(path) {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  const [section, kind, number, extra] = parts;
  const titles = {
    grammar: kind === 'lesson' ? (extra === 'practice' ? 'Վարժություն ' + number : 'Դաս ' + number) + ' — Քերականություն' : 'Քերականություն',
    words: kind === 'unit' ? (WORDS[currentWordIndex]?.en || 'Դաս') + ' — Բառեր' :
      ({ dictionary: 'Բառարան', cards: 'Բառաքարտեր', pictures: 'Նկարներ' })[kind] || 'Բառեր',
    review: 'Կրկնություն', sounds: kind === 'practice' ? 'Վարժություն — Հնչյուններ' : 'Հնչյուններ',
    journal: 'Իմ գրառումները', profile: 'Պրոֆիլ', signup: 'Գրանցում', signin: 'Մուտք'
  };
  const title = section ? titles[section] : 'Սովորել';
  return title ? title + ' — English Garden' : 'English Garden — Անգլերեն քայլ առ քայլ';
}

function setRoute(target) {
  routeCounter++;
  document.title = routeTitle(target);
  const current = routeUsesHash ? location.hash.replace(/^#/, '') || '/' : location.pathname + location.search;
  if (current === target) return;
  const url = routeUsesHash ? '#' + target : target;
  try {
    if (routeApplying) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
  } catch {}
}

// Էկրանը նկարող ֆունկցիան փաթաթում ենք. եթե այն իսկապես նոր էկրան է նկարել (և ներսում ավելի ճշգրիտ
// ուղի չի գրանցվել), գրանցում ենք դրա ուղին։
function routeHook(name, pathFor) {
  const original = window[name];
  if (typeof original !== 'function') return;
  window[name] = function (...args) {
    const mark = routeCounter;
    const before = app.firstElementChild;
    const finish = () => {
      if (routeCounter !== mark || app.firstElementChild === before) return;
      const path = pathFor(...args);
      if (path) setRoute(path);
    };
    const result = original.apply(this, args);
    if (result && typeof result.then === 'function') result.then(finish, () => {});
    else finish();
    return result;
  };
}

routeHook('studyHome', () => '/');
routeHook('grammar', () => '/grammar');
routeHook('lesson', index => '/grammar/lesson/' + (index + 1));
routeHook('openGrammarPractice', index => '/grammar/lesson/' + (index + 1) + '/practice');
routeHook('drawLearningPath', () => '/words');
routeHook('drawWordLesson', () => wordLessonPath());
routeHook('startCumulativeReview', () => '/review');
routeHook('words', () => '/words/dictionary');
routeHook('cards', () => '/words/cards');
routeHook('picturePage', () => '/words/pictures');
routeHook('sounds', () => '/sounds');
routeHook('startSoundRound', () => '/sounds/practice');
routeHook('journal', () => '/journal');
routeHook('profile', () => '/profile');
routeHook('showAccountWelcome', () => '/welcome');
routeHook('drawSignup', () => '/signup');
routeHook('showSignin', error => '/signin' + (error ? '?error=' + encodeURIComponent(error) : ''));

function resumeSignupStep() {
  signupStep = onboardingQuestions.findIndex(([key]) => key === 'auth' || registration[key] === undefined);
  drawSignup();
}

function applyRoute({ parts, query }) {
  const [section, kind, number, extra, more] = parts;
  const n = Number(number);
  const accountPages = ['signin', 'signup', 'welcome'];
  if (accountPages.includes(section)) {
    if (routeUsesHash || account.profile) return go('home');
    if (section === 'signin') return showSignin(query.get('error') || '');
    if (section === 'signup') return resumeSignupStep();
    return account.authenticated ? resumeSignupStep() : showAccountWelcome();
  }
  // Առանց հաշվի և առանց «Շարունակել առանց հաշվի» ընտրության՝ միայն մուտքի էկրանները
  if (!account.profile && !guestMode) return account.authenticated ? resumeSignupStep() : showAccountWelcome();
  if (!section) return go('home');
  if (section === 'grammar') {
    if (kind === 'lesson' && Number.isInteger(n) && n >= 1 && n <= LESSONS.length && !more) {
      const mark = routeCounter;
      if (extra === 'practice') openGrammarPractice(n - 1);
      else if (extra === undefined) lesson(n - 1, false);
      if (routeCounter !== mark) return;
    }
    return go('grammar'); // կողպված կամ անհայտ դաս → դասընթացի ճանապարհը
  }
  if (section === 'words') {
    if (kind === 'unit' && number && extra === 'lesson' && more) {
      const position = (Number(number) - 1) * wordsPerUnit + (Number(more) - 1);
      const index = Number.isInteger(position) && position >= 0 ? wordOrder[position] : undefined;
      if (index !== undefined && (state.wordLessons[index]?.done || index === firstUnfinishedWord())) {
        const mark = routeCounter;
        openWordLesson(index);
        if (routeCounter !== mark) return;
      }
      return go('vocabulary');
    }
    if (kind === 'dictionary' || kind === 'cards') {
      view = 'vocabulary';
      renderNavigation();
      return vocabulary(kind);
    }
    if (kind === 'pictures') {
      view = 'vocabulary';
      renderNavigation();
      return picturePage();
    }
    return go('vocabulary');
  }
  if (section === 'review') return state.cumulativeReview ? startCumulativeReview() : go('vocabulary');
  if (section === 'sounds') {
    go('sounds');
    if (kind === 'practice') startSoundRound();
    return;
  }
  if (section === 'journal' || section === 'profile') return go(section);
  return go('home');
}

function openRoute(route = readRoute()) {
  routeApplying = true;
  const mark = routeCounter;
  try {
    applyRoute(route);
  } catch {
    try { go('home'); } catch {}
  } finally {
    if (routeCounter === mark) setRoute(route.path);
    routeApplying = false;
  }
}

window.addEventListener('popstate', () => {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  openRoute();
});
