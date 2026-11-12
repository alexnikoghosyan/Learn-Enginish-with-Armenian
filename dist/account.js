const levelOptions = ['Սկսում եմ զրոյից', 'Գիտեմ մի քանի տարածված բառ', 'Կարող եմ պարզ զրույց վարել', 'Կարող եմ խոսել տարբեր թեմաներով', 'Կարող եմ մանրամասն քննարկել շատ թեմաներ'];
const sourceOptions = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'Play Market', 'Ընկերներից', 'Նորություններից կամ բլոգից', 'YouTube', 'Հեռուստատեսությունից', 'Google-ի որոնումից', 'Ուրիշ'];
const reasonOptions = [
  ['people', 'Շփվել մարդկանց հետ'], ['fun', 'Սովորել հաճույքի համար'], ['education', 'Օգնել ուսմանս'],
  ['time', 'Ժամանակս օգտակար անցկացնել'], ['career', 'Զարգացնել կարիերաս'], ['travel', 'Պատրաստվել ճանապարհորդության'],
  ['other', 'Ուրիշ պատճառ']
];
const ageOptions = ['13–17', '18–24', '25–34', '35–44', '45–54', '55+'];
const profileAvatars = { bear: '🐻', fox: '🦊', frog: '🐸', cat: '🐱', rabbit: '🐰', owl: '🦉' };
const onboardingQuestions = [
  ['level', 'Որքա՞ն անգլերեն գիտես', levelOptions.map((label, index) => [index, label])],
  ['source', 'Որտեղի՞ց իմացար մեր մասին', sourceOptions.map(value => [value, value])],
  ['reasons', 'Ինչո՞ւ ես ուզում անգլերեն սովորել', reasonOptions],
  ['dailyGoal', 'Ի՞նչ նպատակ դնենք օրվա համար', [[5, 'Օրական 5 րոպե'], [10, 'Օրական 10 րոպե'], [15, 'Օրական 15 րոպե'], [20, 'Օրական 20 րոպե']]],
  ['reminders', 'Կցանկանա՞ս սովորելու հիշեցումներ'],
  ['path', 'Որտեղի՞ց սկսենք', [['basics', 'Սկսել հիմքերից'], ['test', 'Ստուգել իմ մակարդակը'], ['self', 'Սկսել իմ նշած մակարդակից']]],
  ['placement', 'Քո մեկնարկային դասը'],
  ['age', 'Քանի՞ տարեկան ես', ageOptions.map(value => [value, value === '13–17' ? '18-ից ցածր' : value])],
  ['name', 'Ինչպե՞ս դիմենք քեզ'],
  ['username', 'Ընտրիր օգտանուն'],
  ['auth', 'Ինչպե՞ս ես ուզում գրանցվել']
];
let account = { authenticated: false, profile: null };
let registration = {};
let signupStep = 0;
let guestMode = false;
let accountBusy = false;
let usernameTimer;
let displayedSignupStep = 0;
const usernameStep = onboardingQuestions.findIndex(([key]) => key === 'username');
const authStep = onboardingQuestions.findIndex(([key]) => key === 'auth');
let placementIndex = -1;
let placementPoints = 0;

const placementQuestions = [
  ['I ___ a student.', ['am', 'is', 'are'], 0],
  ['She ___ to work every day.', ['go', 'goes', 'going'], 1],
  ['We ___ that film yesterday.', ['see', 'have seen', 'saw'], 2],
  ['I have lived here ___ 2020.', ['for', 'since', 'from'], 1],
  ['If I had more time, I ___ read more.', ['will', 'would', 'am'], 1],
  ['When I arrived, they ___ already left.', ['had', 'have', 'are'], 0]
];

function accountStorage(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
  return null;
}

function studyStorageKey() {
  return account.profile ? 'eg-study-' + account.profile.username : 'eg-v1';
}

function useAccountProgress(importGuest = false) {
  let saved = null;
  try { saved = JSON.parse(accountStorage(studyStorageKey())); } catch {}
  if (saved) state = saved;
  else if (!importGuest) state = {};
  state.known ??= [];
  state.lessons ??= [];
  state.notes ??= {};
  state.review ??= {};
  state.wordLessons ??= {};
  state.grammarPractice ??= {};
  state.soundProgress ??= {};
  state.soundXp ??= 0;
  save();
}

function courseLevel() { return account.profile?.level ?? 0; }
function grammarStartingIndex(level = courseLevel()) { return [0, 5, 10, 20, 30][level]; }
function wordStartingPosition(level = courseLevel()) { return [0, 5, 20, 50, 80][level]; }
function nextCourseWord() {
  return wordOrder.slice(wordStartingPosition()).find(index => !state.wordLessons[index]?.done);
}

async function loadAccount() {
  // The downloadable copy still works as a device-local guest.
  if (location.protocol === 'file:') {
    guestMode = true;
    render();
    return;
  }
  try {
    const response = await fetch('/api/account', { cache: 'no-store' });
    if (!response.ok) throw new Error('account');
    account = await response.json();
  } catch {
    app.innerHTML = '<div class="account-flow"><h1>Հաշիվները ժամանակավորապես անհասանելի են</h1>' +
      '<button class="primary" onclick="loadAccount()">Փորձել կրկին</button>' +
      '<button class="secondary" onclick="continueAsGuest()">Շարունակել առանց հաշվի</button></div>';
    return;
  }
  try { registration = JSON.parse(accountStorage('eg-registration')) || {}; } catch {}
  guestMode = accountStorage('eg-guest') === 'yes';
  if (account.profile) {
    accountStorage('eg-registration', null);
    useAccountProgress();
    render();
  } else if (account.authenticated) {
    signupStep = onboardingQuestions.findIndex(([key]) => key === 'auth' || registration[key] === undefined);
    drawSignup();
    if (signupStep === authStep) await createStudyProfile();
  } else if (guestMode) render();
  else showAccountWelcome();
}

function continueAsGuest() {
  guestMode = true;
  accountStorage('eg-guest', 'yes');
  go('vocabulary');
}

function showAccountWelcome() {
  document.getElementById('nav').innerHTML = '';
  app.innerHTML = '<div class="account-flow"><div class="account-mascot">' + lessonBear() +
    '</div><h1>Սովորիր անգլերեն քո տեմպով</h1><div class="account-actions">' +
    '<button class="primary" onclick="startSignup()">Գրանցվել</button>' +
    '<a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Մուտք գործել</a>' +
    '<button class="text-button" onclick="continueAsGuest()">Շարունակել առանց հաշվի</button></div></div>';
}

const signupGoogleIcon = '<svg viewBox="0 0 24 24"><path fill="#4285f4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v4h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6H19c2-1.8 3-4.5 3-7.7Z"/><path fill="#34a853" d="M12 22c2.8 0 5.1-.9 7-2.1l-3.5-2.6c-.9.6-2.1.9-3.5.9-2.7 0-5-1.8-5.8-4.2H2.7v2.7A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.2 14a6.3 6.3 0 0 1 0-4V7.3H2.7a10 10 0 0 0 0 9.4Z"/><path fill="#ea4335" d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.3 5.3L6.2 10C7 7.6 9.3 5.8 12 5.8Z"/></svg>';

const signupChoiceIcons = {
  level: levelOptions.map((_, level) => '<svg viewBox="0 0 24 24">' +
    [5, 8, 12, 16].map((height, index) => '<rect x="' + (3 + index * 5) + '" y="' + (20 - height) +
      '" width="3.5" height="' + height + '" rx="1.4" fill="' + (index < level ? '#1cb0f6' : '#e1e8ee') + '"/>').join('') +
    '</svg>'),
  source: [
    '<svg viewBox="0 0 24 24"><defs><linearGradient id="signup-ig" x1="0%" y1="100%" x2="65%" y2="0%"><stop stop-color="#ffda78"/><stop offset=".26" stop-color="#fb8539"/><stop offset=".53" stop-color="#e22a73"/><stop offset=".77" stop-color="#a530a9"/><stop offset="1" stop-color="#505bc7"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#signup-ig)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" stroke-width="1.8"/><circle cx="16.5" cy="7.8" r="1" fill="white"/></svg>',
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877f2"/><path fill="#fff" d="M14 24v-9h3l.5-3H14v-2c0-1 .3-2 2-2h2V5l-3-.3c-3 0-5 1.8-5 5V12H7v3h3v9z"/></svg>',
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#171717"/><path d="M6 5h4l8 14h-4zM18 5 6 19" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 24 24"><g fill="none" stroke-width="3.1" stroke-linecap="round"><path stroke="#25f4ee" transform="translate(-.8,-.4)" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/><path stroke="#fe2c55" transform="translate(.8,.7)" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/><path stroke="#171717" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/></g></svg>',
    '<svg viewBox="0 0 24 24"><path fill="#32a66b" d="M4 3v18l9-9z"/><path fill="#51b9f0" d="m4 3 13 7-4 2z"/><path fill="#f9bd42" d="m17 10 4 2-4 2-4-2z"/><path fill="#e8516a" d="m4 21 13-7-4-2z"/></svg>',
    '<img src="data:image/webp;base64,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" width="28" height="24" alt="">', '📰',
    '<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="5" fill="#ff0000"/><path d="m10 8 6 4-6 4z" fill="white"/></svg>',
    '📺', signupGoogleIcon, '✨'
  ],
  reasons: ['🤝', '🎉', '📚', '⏳', '💼', '✈️', '✨'],
  dailyGoal: ['◷', '◷', '◷', '◷'],
  path: ['📗', '🧭', '🎯'],
  age: ['🎒', '🌱', '🌿', '🌳', '🍃', '⭐']
};

function signupIcon(markup) {
  return '<span class="signup-choice-icon" aria-hidden="true">' + markup + '</span>';
}

function startSignup() {
  signupStep = 0;
  displayedSignupStep = 0;
  delete registration.level;
  delete registration.placement;
  accountStorage('eg-registration', JSON.stringify(registration));
  drawSignup();
}

function drawSignup(message = '') {
  document.getElementById('nav').innerHTML = '';
  const [key, title, choices] = onboardingQuestions[signupStep];
  let body = '';
  if (choices) {
    body = '<div class="account-options' + (key === 'source' ? ' signup-sources' : '') + '">' + choices.map(([value, label], index) => {
      const chosen = key === 'reasons' ? (registration.reasons || []).includes(value) : registration[key] === value;
      const detail = key === 'dailyGoal' ? ['Թեթև', 'Սովորական', 'Լուրջ', 'Ինտենսիվ'][index] :
        key === 'path' ? ['Առաջին բառերն ու կանոնները', 'Վեց հարցով մոտավոր գնահատում', 'Հիմնված է քո առաջին պատասխանի վրա'][index] : '';
      return '<button class="secondary" aria-pressed="' + chosen + '" onclick="chooseSignupOption(' + index +
        ')">' + signupIcon(signupChoiceIcons[key][index]) + '<span>' + esc(label) +
        (detail ? '<small class="signup-option-detail">' + esc(detail) + '</small>' : '') + '</span></button>';
    }).join('') + '</div>';
  } else if (key === 'reminders') {
    body = '<div class="signup-bubble">' + lessonBear() +
      '<p>Կարող եմ ժամը 19։00-ին հիշեցնել սովորելու մասին, երբ կայքը բաց է։</p></div>' +
      '<div class="account-options"><button class="secondary" aria-pressed="' + (registration.reminders === true) +
      '" onclick="chooseStudyReminder(true)">🔔 Միացնել հիշեցումը</button><button class="secondary" aria-pressed="' +
      (registration.reminders === false) + '" onclick="chooseStudyReminder(false)">Հիմա ոչ</button></div>';
  } else if (key === 'placement') {
    if (registration.path === 'test' && registration.placement === undefined) {
      if (placementIndex < 0) { placementIndex = 0; placementPoints = 0; }
      const [prompt, options] = placementQuestions[placementIndex];
      body = '<p>Հարց ' + (placementIndex + 1) + ' / ' + placementQuestions.length + '</p><h2 lang="en">' +
        esc(prompt) + '</h2><div class="account-options">' + options.map((option, index) =>
        '<button class="secondary" lang="en" onclick="answerPlacement(' + index + ')">' + esc(option) + '</button>'
      ).join('') + '</div>';
    } else {
      const level = registration.placement ?? 0;
      body = '<div class="signup-bubble">' + lessonBear() + '<p>Բառերի ճանապարհը կսկսես <strong>' +
        (Math.floor(wordStartingPosition(level) / wordsPerUnit) + 1) + '-րդ բաժնից</strong>։ Քերականության մեջ՝ <strong>' +
        (grammarStartingIndex(level) + 1) + '-րդ դասից</strong>։</p></div>';
    }
  } else if (key === 'auth') {
    body = account.authenticated ? '<button class="primary" onclick="createStudyProfile()">Ստեղծել պրոֆիլը</button>' :
      '<div class="account-actions"><a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">' + signupIcon(signupGoogleIcon) + 'Շարունակել Google-ով</a>' +
      '<a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">' + signupIcon('✉️') + 'Շարունակել էլ․ փոստով</a></div>' +
      '<p class="muted">Մուտքի էջում ընտրիր Google-ը կամ էլ․ փոստը։</p>';
  } else {
    body = '<form onsubmit="event.preventDefault();nextSignupStep()"><label for="signup-input">' +
      (key === 'name' ? 'Անուն' : 'Օգտանուն') + '</label><div class="signup-field"><input id="signup-input" value="' + esc(registration[key] || '') +
      '" maxlength="' + (key === 'name' ? '50' : '20') + '" autocomplete="' + key +
      '"' + (key === 'username' ? ' autocapitalize="none" spellcheck="false" oninput="scheduleUsernameCheck(this)" aria-describedby="username-status"' : '') +
      '>' + (key === 'username' ? '<span id="username-mark" aria-hidden="true" hidden></span>' : '') + '</div>' +
      (key === 'username' ? '<small>3–20 նիշ։ Սկսիր անգլերեն տառով։ Կարող ես օգտագործել թվեր և _ նշանը։</small>' +
        '<small id="username-status" role="status"></small><div id="username-suggestions"></div>' : '') + '</form>';
  }
  app.innerHTML = '<section class="account-flow"><div class="account-step"><button type="button" class="signup-back" onclick="previousSignupStep()" aria-label="Հետ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<div class="signup-progress" role="progressbar" aria-label="Գրանցման առաջընթաց" aria-valuemin="0" aria-valuemax="' +
    onboardingQuestions.length + '" aria-valuenow="' + signupStep + '"><span style="width:' +
    (signupStep / onboardingQuestions.length * 100) + '%"></span></div></div>' +
    '<h1>' + title + '</h1>' + (key === 'reasons' ? '<p>Կարող ես ընտրել մի քանի պատճառ։</p>' : '') +
    body + '<p class="account-error" role="status">' + esc(message) + '</p>' +
    (key === 'auth' || (key === 'placement' && registration.placement === undefined) ? '' :
      '<div class="signup-controls"><button class="primary" onclick="nextSignupStep()"' + (key === 'level' && registration.level === undefined ? ' disabled' : '') + '>Շարունակել →</button></div>') + '</section>';
  if (displayedSignupStep !== signupStep && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    app.querySelector('.signup-progress span')?.animate([
      { width: (displayedSignupStep / onboardingQuestions.length * 100) + '%' },
      { width: (signupStep / onboardingQuestions.length * 100) + '%' }
    ], { duration: 310, easing: 'cubic-bezier(.2,.75,.3,1)' });
  }
  displayedSignupStep = signupStep;
  if (key === 'username' && registration.username) scheduleUsernameCheck(document.getElementById('signup-input'));
}

async function chooseStudyReminder(enabled) {
  registration.reminders = enabled;
  if (enabled && 'Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch {}
  }
  if (onboardingQuestions[signupStep][0] === 'reminders') drawSignup();
}

function answerPlacement(answer) {
  if (placementQuestions[placementIndex][2] === answer) placementPoints++;
  placementIndex++;
  if (placementIndex >= placementQuestions.length) {
    registration.placement = [0, 0, 1, 2, 2, 3, 4][placementPoints];
    placementIndex = -1;
  }
  drawSignup();
}

function scheduleUsernameCheck(input) {
  clearTimeout(usernameTimer);
  const mark = document.getElementById('username-mark');
  mark.hidden = true;
  input.removeAttribute('aria-invalid');
  document.getElementById('username-status').textContent = '';
  document.getElementById('username-suggestions').replaceChildren();
  if (/^[a-z][a-z0-9_]{2,19}$/i.test(input.value.trim())) {
    usernameTimer = setTimeout(() => checkSignupUsername(input), 300);
  }
}

async function checkSignupUsername(input) {
  const value = input.value.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(value)) return false;
  try {
    const response = await fetch('/api/username?name=' + encodeURIComponent(value), { cache: 'no-store' });
    if (!response.ok) throw new Error('username');
    const result = await response.json();
    if (!input.isConnected || input.value.trim().toLowerCase() !== value) return false;
    const mark = document.getElementById('username-mark');
    mark.className = result.available ? 'username-free' : 'username-taken';
    mark.textContent = result.available ? '✓' : '×';
    mark.hidden = false;
    input.setAttribute('aria-invalid', String(!result.available));
    document.getElementById('username-status').textContent = result.available ? 'Օգտանունն ազատ է։' : 'Օգտանունը զբաղված է։';
    const suggestions = document.getElementById('username-suggestions');
    suggestions.replaceChildren();
    for (const name of (result.suggestions || []).slice(0, 3)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.textContent = name;
      button.onclick = () => { input.value = name; input.focus(); scheduleUsernameCheck(input); };
      suggestions.append(button);
    }
    return result.available;
  } catch {
    if (input.isConnected && input.value.trim().toLowerCase() === value) {
      document.getElementById('username-status').textContent = 'Չհաջողվեց ստուգել օգտանունը։ Փորձիր կրկին։';
    }
    return false;
  }
}

function chooseSignupOption(index) {
  const [key, , choices] = onboardingQuestions[signupStep];
  const [value] = choices[index];
  if (key === 'reasons') {
    const chosen = new Set(registration.reasons || []);
    if (chosen.has(value)) chosen.delete(value); else chosen.add(value);
    registration.reasons = [...chosen];
  } else registration[key] = value;
  drawSignup();
}

async function nextSignupStep() {
  const [key] = onboardingQuestions[signupStep];
  const input = document.getElementById('signup-input');
  if (input) registration[key] = input.value.trim();
  const value = registration[key];
  if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    drawSignup('Նախ լրացրու այս քայլը։');
    return;
  }
  if (key === 'username' && !/^[a-z][a-z0-9_]{2,19}$/i.test(value)) {
    drawSignup('Մուտքագրիր նշված ձևաչափով օգտանուն։');
    return;
  }
  if (key === 'username') {
    clearTimeout(usernameTimer);
    if (!(await checkSignupUsername(input)) || !input.isConnected) return;
    registration.username = input.value.trim().toLowerCase();
  }
  if (key === 'path') {
    delete registration.placement;
    placementIndex = -1;
    if (value !== 'test') registration.placement = value === 'basics' ? 0 : registration.level;
  }
  accountStorage('eg-registration', JSON.stringify(registration));
  signupStep++;
  drawSignup();
  if (signupStep === authStep && account.authenticated) createStudyProfile();
}

function previousSignupStep() {
  if (signupStep > 0) { signupStep--; drawSignup(); }
  else showAccountWelcome();
}

async function createStudyProfile() {
  if (accountBusy) return;
  accountBusy = true;
  app.innerHTML = '<section class="account-flow signup-loading" role="status">' + lessonBear() + '<p>Պատրաստում ենք քո պրոֆիլը…</p></section>';
  try {
    const response = await fetch('/api/account', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...registration, level: registration.placement ?? registration.level })
    });
    if (response.status === 409) {
      signupStep = usernameStep;
      drawSignup('Այս օգտանունն արդեն զբաղված է։ Փորձիր ուրիշը։');
      return;
    }
    if (!response.ok) throw new Error('profile');
    account.profile = (await response.json()).profile;
    useAccountProgress(true);
    accountStorage('eg-registration', null);
    accountStorage('eg-guest', null);
    pathPage = Math.floor(wordStartingPosition() / (wordsPerUnit * unitsPerPage));
    accountStorage('eg-word-path-page', String(pathPage));
    go('vocabulary');
  } catch {
    drawSignup('Պրոֆիլը չպահպանվեց։ Փորձիր կրկին։');
  } finally {
    accountBusy = false;
  }
}

function studyDayKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
}

function recordStudyDay() {
  const day = studyDayKey(new Date());
  state.studyDays ??= [];
  if (!state.studyDays.includes(day)) state.studyDays.push(day);
}

function currentStudyStreak(now = new Date()) {
  const days = new Set(state.studyDays || []);
  const day = new Date(now);
  if (!days.has(studyDayKey(day))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (days.has(studyDayKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function profileStatistics() {
  const words = Object.values(state.wordLessons).filter(item => item.done).length;
  const streak = currentStudyStreak();
  const xp = 10 * (words + state.lessons.length) + state.soundXp;
  const flame = '<svg viewBox="0 0 28 28" aria-hidden="true"><path fill="currentColor" d="M15 2c1 6 8 8 8 15a9 9 0 1 1-18 0c0-4 2-7 5-9 0 3 2 4 2 4 2-3 3-6 3-10z"/><path fill="#fff" d="M14 15c-2 3-3 4-3 6a3 3 0 0 0 6 0c0-2-2-4-3-6z"/></svg>';
  const lightning = '<svg viewBox="0 0 28 28" aria-hidden="true"><path fill="currentColor" d="M16 2 5 15c-1 1 0 3 1 3h6l-1 7c0 1 1 2 2 1l10-13c1-1 0-3-1-3h-6l2-7c0-1-1-2-2-1z"/></svg>';
  return '<section class="profile-statistics"><h2>Վիճակագրություն</h2><div class="profile-stat-grid">' +
    '<div class="profile-stat-box ' + (streak ? 'has-streak' : '') + '">' + flame +
    '<div><strong>' + streak + '</strong><small>Օրերի շարք</small></div></div>' +
    '<div class="profile-stat-box profile-xp">' + lightning +
    '<div><strong>' + xp.toLocaleString('hy-AM') + '</strong><small>Փորձի միավորներ</small></div></div></div></section>';
}

function dailyGoalMarkup() {
  const goal = account.profile.daily_goal || 10;
  const seconds = state.studyTime?.[studyDayKey(new Date())] || 0;
  const minutes = Math.floor(seconds / 60);
  return '<section class="profile-statistics"><h2>Օրվա նպատակ</h2><p>' + minutes + ' / ' + goal +
    ' րոպե այսօր</p><progress class="daily-goal-progress" aria-label="Օրվա նպատակ" value="' +
    Math.min(seconds, goal * 60) + '" max="' + goal * 60 + '"></progress></section>';
}

function studyTimerTick() {
  if (!account.profile || document.visibilityState !== 'visible') return;
  const now = new Date();
  const day = studyDayKey(now);
  if (app.querySelector('.focus-lesson-header')) {
    state.studyTime ??= {};
    state.studyTime[day] = (state.studyTime[day] || 0) + 30;
    save();
    return;
  }
  if (!account.profile.reminders || now.getHours() < 19 || (state.studyTime?.[day] || 0) >= account.profile.daily_goal * 60 ||
      accountStorage(studyStorageKey() + '-reminder-day') === day) return;
  accountStorage(studyStorageKey() + '-reminder-day', day);
  const message = 'Այսօրվա անգլերենի նպատակիդ համար դեռ ժամանակ կա։';
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('English Garden', { body: message }); return; } catch {}
  }
  const status = document.getElementById('study-reminder');
  if (status) {
    status.textContent = message;
    setTimeout(() => { status.textContent = ''; }, 7000);
  }
}

window.setInterval(studyTimerTick, 30000);

function profile() {
  const user = account.profile;
  if (!user) {
    app.innerHTML = '<div class="account-flow"><h1>Անձնական պրոֆիլ</h1>' +
      '<button class="primary" onclick="showAccountWelcome()">Գրանցվել կամ մուտք գործել</button></div>';
    return;
  }
  app.innerHTML = '<section class="account-flow profile-card"><div class="profile-avatar">' + profileAvatars[user.avatar] +
    '</div><h1>' + esc(user.name) + '</h1><p>@' + esc(user.username) + '</p>' +
    '<p>' + esc(levelOptions[user.level]) + '</p><div class="profile-stats"><span><strong>' +
    Object.values(state.wordLessons).filter(item => item.done).length + '</strong> բառ</span><span><strong>' +
    state.lessons.length + '</strong> քերականական դաս</span></div>' + profileStatistics() + dailyGoalMarkup() +
    '<h2>Ընտրիր ավատար</h2><div class="avatar-options">' + Object.entries(profileAvatars).map(([key, icon]) =>
      '<button class="secondary" aria-label="' + key + '" aria-pressed="' + (key === user.avatar) +
      '" onclick="saveAvatar(\'' + key + '\')">' + icon + '</button>').join('') + '</div>' +
    '<p id="profile-status" role="status"></p><a class="secondary" href="/signout-with-chatgpt?return_to=%2F" target="_top">Դուրս գալ հաշվից</a></section>';
}

async function saveAvatar(avatar) {
  if (accountBusy) return;
  accountBusy = true;
  try {
    const response = await fetch('/api/account/avatar', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar }) });
    if (!response.ok) throw new Error('avatar');
    account.profile = (await response.json()).profile;
    if (view === 'profile') profile();
  } catch {
    const status = document.getElementById('profile-status');
    if (status) status.textContent = 'Ավատարը չպահպանվեց։ Փորձիր կրկին։';
  } finally { accountBusy = false; }
}

function offerMobileProgress() {
  if (!window.matchMedia('(max-width: 730px) and (pointer: coarse)').matches || accountStorage(studyStorageKey() + '-mobile-progress')) return;
  accountStorage(studyStorageKey() + '-mobile-progress', 'shown');
  const dialog = document.createElement('dialog');
  dialog.className = 'lesson-exit-dialog';
  dialog.innerHTML = '<div class="exit-owl" aria-hidden="true">🏅</div><h2>Առաջին դասն ավարտեցիր։</h2>' +
    '<p>Ցույց տուր առաջընթացդ կամ ավելացրու կայքը հեռախոսի գլխավոր էկրանին։</p><div class="account-actions">' +
    (navigator.share ? '<button class="primary" onclick="shareStudyProgress()">Կիսվել առաջընթացով</button>' : '') +
    '<button class="secondary" onclick="this.closest(\'dialog\').querySelector(\'.install-help\').hidden=false">Ինչպես ավելացնել էկրանին</button>' +
    '<small class="install-help" hidden>Բացիր դիտարկիչի ընտրացանկը և ընտրիր «Ավելացնել գլխավոր էկրանին»։</small>' +
    '<form method="dialog"><button class="text-button">Հետո</button></form></div>';
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
}

async function shareStudyProgress() {
  const words = Object.values(state.wordLessons).filter(item => item.done).length;
  try {
    await navigator.share({ title: 'English Garden', text: 'English Garden-ում սովորել եմ ' + words +
      ' բառ և ավարտել ' + state.lessons.length + ' քերականական դաս։', url: location.origin });
  } catch {}
}
