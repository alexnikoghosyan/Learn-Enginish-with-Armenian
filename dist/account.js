const levelOptions = ['Սկսում եմ զրոյից', 'Գիտեմ մի քանի տարածված բառ', 'Կարող եմ պարզ զրույց վարել', 'Կարող եմ խոսել տարբեր թեմաներով', 'Կարող եմ մանրամասն քննարկել շատ թեմաներ'];
const sourceOptions = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'Play Market', 'Ընկերներից', 'Ուրիշ'];
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
function grammarStartingIndex() { return [0, 5, 10, 20, 30][courseLevel()]; }
function wordStartingPosition() { return [0, 5, 20, 50, 80][courseLevel()]; }
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
    if (signupStep === 6) await createStudyProfile();
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
    '<button class="primary" onclick="drawSignup()">Գրանցվել</button>' +
    '<a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Մուտք գործել</a>' +
    '<button class="text-button" onclick="continueAsGuest()">Շարունակել առանց հաշվի</button></div></div>';
}

const signupChoiceIcons = {
  level: levelOptions.map((_, level) => '<svg viewBox="0 0 24 24">' +
    [5, 8, 12, 16].map((height, index) => '<rect x="' + (3 + index * 5) + '" y="' + (20 - height) +
      '" width="3.5" height="' + height + '" rx="1.4" fill="' + (index < level ? '#1cb0f6' : '#e1e8ee') + '"/>').join('') +
    '</svg>'),
  source: [
    '<svg viewBox="0 0 24 24"><defs><linearGradient id="signup-ig" x1="0%" y1="100%" x2="65%" y2="0%"><stop stop-color="#ffda78"/><stop offset=".26" stop-color="#fb8539"/><stop offset=".53" stop-color="#e22a73"/><stop offset=".77" stop-color="#a530a9"/><stop offset="1" stop-color="#505bc7"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#signup-ig)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" stroke-width="1.8"/><circle cx="16.5" cy="7.8" r="1" fill="white"/></svg>',
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877f2"/><path fill="#fff" d="M14 24v-9h3l.5-3H14v-2c0-1 .3-2 2-2h2V5l-3-.3c-3 0-5 1.8-5 5V12H7v3h3v9z"/></svg>',
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#171717"/><path d="M6 5h4l8 14h-4zM18 5 6 19" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#171717"/><path d="M14 5v11a3.4 3.4 0 1 1-3.4-3.4M14 5c0 3 2 4.7 5 4.8" fill="none" stroke="#28e3df" stroke-width="2.7" stroke-linecap="round" transform="translate(-.8,.8)"/><path d="M14 5v11a3.4 3.4 0 1 1-3.4-3.4M14 5c0 3 2 4.7 5 4.8" fill="none" stroke="white" stroke-width="2.7" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24"><path fill="#32a66b" d="M4 3v18l9-9z"/><path fill="#51b9f0" d="m4 3 13 7-4 2z"/><path fill="#f9bd42" d="m17 10 4 2-4 2-4-2z"/><path fill="#e8516a" d="m4 21 13-7-4-2z"/></svg>',
    '👥', '✨'
  ],
  reasons: ['🤝', '🎉', '📚', '⏳', '💼', '✈️', '✨'],
  age: ['🎒', '🌱', '🌿', '🌳', '🍃', '⭐']
};

function signupIcon(markup) {
  return '<span class="signup-choice-icon" aria-hidden="true">' + markup + '</span>';
}

function drawSignup(message = '') {
  document.getElementById('nav').innerHTML = '';
  const [key, title, choices] = onboardingQuestions[signupStep];
  let body = '';
  if (choices) {
    body = '<div class="account-options">' + choices.map(([value, label], index) => {
      const chosen = key === 'reasons' ? (registration.reasons || []).includes(value) : registration[key] === value;
      return '<button class="secondary" aria-pressed="' + chosen + '" onclick="chooseSignupOption(' + index +
        ')">' + signupIcon(signupChoiceIcons[key][index]) + esc(label) + '</button>';
    }).join('') + '</div>';
  } else if (key === 'auth') {
    body = account.authenticated ? '<button class="primary" onclick="createStudyProfile()">Ստեղծել պրոֆիլը</button>' :
      '<div class="account-actions"><a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">' + signupIcon('<b class="signup-google">G</b>') + 'Շարունակել Google-ով</a>' +
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
  app.innerHTML = '<section class="account-flow"><div class="account-step"><button class="icon-btn" onclick="previousSignupStep()" aria-label="Նախորդ">←</button>' +
    '<progress value="' + signupStep + '" max="' + onboardingQuestions.length + '" aria-label="Գրանցման առաջընթաց"></progress></div>' +
    '<h1>' + title + '</h1>' + (key === 'reasons' ? '<p>Կարող ես ընտրել մի քանի պատճառ։</p>' : '') +
    body + '<p class="account-error" role="status">' + esc(message) + '</p>' +
    (key === 'auth' ? '' : '<button class="primary" onclick="nextSignupStep()">Շարունակել →</button>') + '</section>';
  if (key === 'username' && registration.username) scheduleUsernameCheck(document.getElementById('signup-input'));
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
  accountStorage('eg-registration', JSON.stringify(registration));
  signupStep++;
  drawSignup();
  if (signupStep === 6 && account.authenticated) createStudyProfile();
}

function previousSignupStep() {
  if (signupStep > 0) { signupStep--; drawSignup(); }
  else showAccountWelcome();
}

async function createStudyProfile() {
  if (accountBusy) return;
  accountBusy = true;
  try {
    const response = await fetch('/api/account', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registration)
    });
    if (response.status === 409) {
      signupStep = 5;
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
    state.lessons.length + '</strong> քերականական դաս</span></div>' + profileStatistics() +
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
