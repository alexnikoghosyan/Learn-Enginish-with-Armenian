const levelOptions = ['Սկսում եմ զրոյից', 'Գիտեմ մի քանի տարածված բառ', 'Կարող եմ պարզ զրույց վարել', 'Կարող եմ խոսել տարբեր թեմաներով', 'Կարող եմ մանրամասն քննարկել շատ թեմաներ'];
const sourceOptions = ['Facebook / Instagram', 'X (Twitter)', 'TikTok', 'Play Market', 'Ընկերներից', 'Նորություններից կամ բլոգից', 'YouTube / Google', 'Հեռուստատեսությունից', 'Ուրիշ'];
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
  if (['Facebook', 'Instagram'].includes(registration.source)) registration.source = 'Facebook / Instagram';
  if (['YouTube', 'Google-ի որոնումից'].includes(registration.source)) registration.source = 'YouTube / Google';
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

const signupFriendsIcon = '<img class="signup-source-image" src="data:image/webp;base64,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" alt="">';
const signupOtherIcon = '<img class="signup-source-image" src="data:image/webp;base64,UklGRhQOAABXRUJQVlA4WAoAAAAQAAAAVAAAVwAAQUxQSOsEAAAB8HZrt2nbtm2v6E055dEwbNs2pm3btm3btm0O27Ztdds9tJxSej/UUmsrtZQcEROAMaoCwF4v/cppd81w+LrbTvnKS/cCAFV0X7IA2zzvG9esYpurrvjeCzcHoNIxBfCoXy4kSTePkcLNSXLu7x8LQLukgk3efQlJKx5sM7wYycvfsiGgXZEEecOdZFhwnFGCvO0tCk2dUOBZV5LFOX438oqnA3l8otjur6Q5u+mF/NteUBlTAp71EM3ZXXcuehkkjUUx/SuysNuF/KFCx5Cxy2V0Z9fDeMG2yK1l7P8gZ9jHwjsPQ25JccTDLOxn4fLHIbeiePoqGvtqXP04aAuKQ9bQ2F/j0gOgs0rYcQ6NfTbesz3SLCRtdDmN/TZeNaUyWsbxLOx74R+RR1K8mzPsf+GroSMk2X2lRQXclu+DNExxGo01NF6+gUpTxqtZWMfCdyA3SNpsTngl3OdtLjKQ8VkW1rLwk8gARDZZFFGNiIWbiQCKD9JYz8IvQSGy6cLwinjM3xiS8UYaa2p8keSE86NUpcT/odh5HaMqwVXbA2+hsa7GtwPH1ydOx3ZLGJUJzt/8mXTWNvyxn6ZVx/ipf1XpxFvo1XHeupLRRlgpPpsopcRsvBSLNsh1bNU5GD5KGActRvHgoLXSrnHt+T/+wdWkj0DO/dP3fzeXozp5zY9/du5qekeMx+8BAM+4md4Uvv5jmwPY/HPrPJqc1z8DAPY4idYJ42kJmrNgq1vDG5wvAHLOwIvoDR63bgnJWZHOonUgYtm2UACYwJOaCv+OCQEgE/g7S9OTMAEAiu0WRYyv8OfIaEy4jkYy/OikGFR5lDtJ47VIaMz4BUsX3iRDsvyMhQyu2g7SINh2FYMs/J3oEHlrN942TPHbMfwKedjHuvFLNEmauJdOMvzopA0qj3YnabwppSH4XRciFm4KHZjEk+kkWfgHTAgAmcD/WEjS+RRMDmRstShifDQen6A5J2x1QzTQ+QIg5wy8lM6GuGVLpJwV6SQau2g8aQ8AePatdDZGrPvw5gA2+9g6jwY6r38GAOx9Gp3dNK4+/Qc/vIJ0Dg1y7u++/7uHOKqTV/zw+6euobGrxsFwjhjGQYsR6MFBY6srGC0wrBTjLKOU4pyllWLBVv3+dnoevPs8enWM//8arULvf2xEdcKOnr6PUZngwxvjH7TKWBwP+SBLbfga4OCIukSs3R1JzgurSuHfoBnPZF2cT5AsaYPrwyri8cCECDLew1KRwq8iAyLbrPSoRvjC7SQBUHyCVo3C9yIDgKTJ28Ir4XHLRJIBKJ7KUonCFyKjWfFfWhWMp0ExNMkOS9wr4L5sT0nDoHgpSwUKXwDFqBnf40zvZvg9ZIwsKmex9KzwClUZDUm2vInWK+NNO0jCbBW7zqH1yDhnVyhmrzhgDktvCuccAEWbiv0fZOlJ4cP7Q9GuYpfLONOLwsv2gqJtxdR/6d45N/5lGor2E/BN0jpWyE8CCeOUhKdcT7cOWfC2ZyEJxqyY/BHp3hE32lc3Qcb4FXj2FaRZB8zJ8x8FKLooCjz9EpLFx+KF5AWvALKgoyrAS84mGcWjlfASJE99MiAJHVYAx3z5BpIMs4gRIsycJG/79SMAUXRcBUiP/9Y1q9jmmqu+8AgFkqKHmgFgrxd8/L93LY5hS+/9z6desS8AZMUYAQBWUDggAgkAAJAoAJ0BKlUAWAA+LRKHQiGhC8TzKAwBYlsDLAP6qIe7BNT/uH4+flz8uVNfov3Q/I3p6D/daP6n7nPfB6jvzv7AH6U/7T0jP7N7JfMX+wX7ge7b/lPUX/lPUH/qv+V9LD2I/QA/ZX0tv27+Cz9w/SC/+eax9pX+J5TT2bycf6TwVfxg86d4X/Lv8TvInJv5f/oPy41Un/P+TN/K/E+7u9gD+P/yj/O/d38a39j92HuA+YP9d7gv8X/lX+e/uH+N/7/+X/////+6T2M+gp+phFx6m5fqnEejcpJ+6XD+LSw9yw+Fc+nmtPlY7AkFXDfYrGA5/rjRMO3H24paNLdRyQynM3+q5S0Pd5Iiow96x1U+9g+5kgwbTX/PMwgxcIQppvkJfeG6uNerg7VGr6VAlJtGDLL/+bcuWISusbCwFs15pFbmvvye7jXJL2b6AAD+//Jy9//27bJ//INl8KpFmi8s+6IQOBjmUNUNsxx18GzIwer7DLN2mWJIuHu50fcQmszpWvW6eQeAdYfWiP09p3FueHqzkvIde2xdJ2Ytvv8e5ZMXP8pe4TB0k/XjolLEV944XfU0KUXS82USdRli+wHlIi8q7UR75dfBCTQnp8GhB+pc0ATZVP6XD93M+oZp/Y07DA1vOk9Pyzz6DZxouQ08BVwFU5HbELfrQEK0NVl7y1mXZ5GxpUGQKSBJyKqHN28dGTXdM2GLF6SnLpEyD+aD+yvLq4Yp4MvjGsjFEuY9gZl+f+G2Osy8M5NbKhwGkbf9MUS5o039B9ZdnelcyDJ7yIA9LuR5mja/1diX/+Tk/71ULTbPbJzMwdw/p7oGMVUDbo6YW3PT06vxBfJnZ0rZesFKfRBh8+yeLHZ0qBXj/GWbnfzi260AcfGP/99xiYV7lXsaTZZAKeCtAP4CIeboYjP7EtbFRq4iSE5S85f/z8R6wna/g3/f9tf0WTJfqgh65hJnWZn15I14bTTzSeI/nFNEaA8x284KIUzguWtMaZK/nd+4foGxxJ4CNwSzqAaUU4+YlN6p0+dIiJKtfV70Zfd9PEEpCZqqva9vt42XBUAAB7eqtyQyB7FFEPxIH97Uo+mngOunnfiuVZEraJ9QTwA4tgOuBjL//AVrxPtMa/olKD7wxuB8L51xG+PyE4fKavQ0wJfQ49c+RvF0j2BdSlxnxkmRVQEHjGn4XA/w7hVsBp1m4yFMehLrAjaHYSZu/LgId+h1g75f/7/tLCMzm7SBfj5tdem34AlTmzeursJQaOHZgTrEd3LWXplVV+beocGiK5Hpwq+RoBlMSfjvp9ZPfsNNHvLtvWuaDURHHQHw9dnnccRoABDWKx7jmh+4HSYzFyBDcDE0/1tNFtCmvnEyCOnSGDf0CaZVio5tmWQbUNq/j7+7nskhVojO4I9bbaZjBFNmut5oFbqHr+4lems8/xcjnbrY6v5bP0S7bqimvBB6IdrXb49L6fXC6ZeW+9ZwevjX4KkkAf1oqXFmC82E/+dnWU2kYJqGax76nBMFqqn5i9D9JYrdlbQr7NGXul71vgrBVx/p17RUILcLO+LbTB31gUeaSWjEAwZTmQVlIYtiwr680gfdXWEaJ1LSppscpQr2RwHdKoA3AKiKzWABlsBlie6k9RthyxFxQFd+SIHxh/1VaH4iQgJZWVPNi6JO0pgJkumNfNnJAv+BaCMFDY7ecm0MnpYVT9mcpJv1seKeHZe/98tZpn/XfB5sfRui7WJpObeQ10pFj16n1ACwOLSImyhZ35qt6YNOYCvMmX8sJnO2jNrk0Yij5iemM/fVF5OFGODQYMjFcja2A5DtReFjlhuznI/psTheNe1NMRkbnaXkgrk88Pv5mE/q4DocNbfNjCybn7ZMTLl4Yj//jZ5g/11rB3V0zZLiFFmH0W9Udn2U3FO/b8kp+a1BwFiiQNG+crFD8JAc9llJAbjAjgJZxXETzq/LBZKFCU1xt4FJo2uwdzxXCqkyxxtqAC0LXmtxhjZTosEMNQUGIMsXNokEJDMhUW9PigrR81yCwpwvTpAF513ECQzL7HaEeKT6QH57Ttfc/An6a43TwYHhZZbAbmkLqZO+fNgCXcnH+rgZHE6wHRoGD8n753k5NNBOA9kHw/3g0ET98/R6X4so75uRqqFyBZS8DTHdd4KK2kh0ePppfci6iARh+6OM680AxzOt4tcH5eGumpFU6A2MGfNi7K8Er2lEEr25AXVPJWKESh7jpVy7mSG3JCINxbImYiTLczq0d+8zI4A/zhi4YC0+fTrAtZnlJ4jP4DJQd6FvORB5b9r+TNhN09HFcJsIplEtlzT97Sst5PZDwPzdvS4kYHPWJbnK6TX6buKswI7hRD6ySNCfPtYO3LKgikmt1B3fQjkIG0QfKZJdmoFvU49+EDku8RZsREN3lYRu46yPgX/PZMYN/PfnIEVfQIvmJ3eVFF8DRZkMvQQN9xdO6WnsWaJvaqLgahry2N2YdAx4vHYfo96p32HnHapfUm8KZqTeJhovO7TwEkMT3z0sa78nkvo6qvYB7KCe18W0i7RsG/DAC26Y4nnAagchPIisX5U7Rszz9CH7fka/5M4XUzWXXM2TNZDD6Sxe2gShewFD4rX/a2f//y1/nZV+9//qP+vlu08b9K55/7JW4Y789U8ndBIr+YsZ3icUeVAE4jUSGq27fmJvns/1ffFa2ulOcOyyWOU4M8Je70E8VoFGSGF0h+NA/DnzdoH4flFDDLQfyoTwgSmbUHDL5qixU2OSdGcV3G9GZop84LGrQHXyZEX2OAB5lZljS0jQUaLx/g+APqggDs7WonqB0xWhoU0LB+R6Xy/rF/qYtx9xytMcJloYP6jDRA1GA5zlDUgjmflz7ARd0x4bhEtAupvpLUvW4nwxk+DKhOysBEGImf1atX86dsnyCxawFSkPPOsEJtH/xurP/EgYEQ4e9+UVhptf4VeVXiOGySc7wBTdYtcVs7DFLI2eILXSES6zNULdNNun5chZ3/7xGHJ93633miOnqQ16uU/c/cjGlTO5tOUvwKISxxr2xOexXyuHPK/EMxwmOSnTikkeM6AAAAAA" alt="">';

const signupChoiceIcons = {
  level: levelOptions.map((_, level) => '<svg viewBox="0 0 24 24">' +
    [5, 8, 12, 16].map((height, index) => '<rect x="' + (3 + index * 5) + '" y="' + (20 - height) +
      '" width="3.5" height="' + height + '" rx="1.4" fill="' + (index < level ? '#1cb0f6' : '#e1e8ee') + '"/>').join('') +
    '</svg>'),
  source: [
    pairedSignupIcons('<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877f2"/><path fill="#fff" d="M14 24v-9h3l.5-3H14v-2c0-1 .3-2 2-2h2V5l-3-.3c-3 0-5 1.8-5 5V12H7v3h3v9z"/></svg>', '<svg viewBox="0 0 24 24"><defs><linearGradient id="signup-ig" x1="0%" y1="100%" x2="65%" y2="0%"><stop stop-color="#ffda78"/><stop offset=".26" stop-color="#fb8539"/><stop offset=".53" stop-color="#e22a73"/><stop offset=".77" stop-color="#a530a9"/><stop offset="1" stop-color="#505bc7"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#signup-ig)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" stroke-width="1.8"/><circle cx="16.5" cy="7.8" r="1" fill="white"/></svg>'),
    '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#171717"/><path d="M6 5h4l8 14h-4zM18 5 6 19" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 24 24"><g fill="none" stroke-width="3.1" stroke-linecap="round"><path stroke="#25f4ee" transform="translate(-.8,-.4)" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/><path stroke="#fe2c55" transform="translate(.8,.7)" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/><path stroke="#171717" d="M14 3v13a4.4 4.4 0 1 1-4.4-4.4M14 3c.6 3.3 2.4 5.2 5.6 5.7"/></g></svg>',
    '<svg viewBox="0 0 24 24"><path fill="#4285f4" d="M4.8 2.5A2 2 0 0 0 3 4.5v15a2 2 0 0 0 1.8 2L14.4 12z"/><path fill="#34a853" d="M4.8 2.5c.5-.1 1 0 1.5.3l11.2 6.3-3.1 2.9z"/><path fill="#fbbc04" d="m17.5 9.1 3.5 2a1 1 0 0 1 0 1.8l-3.5 2-3.1-2.9z"/><path fill="#ea4335" d="m17.5 14.9-11.2 6.3c-.5.3-1 .4-1.5.3l9.6-9.5z"/></svg>',
    signupFriendsIcon, '<img class="signup-source-image" src="data:image/webp;base64,UklGRrgCAABXRUJQVlA4WAoAAAAQAAAASwAAVwAAQUxQSGwAAAANcFNt27I8v////megCkHoQQZWhyoawGUkhb6CjDzYRERMgOPpJa71YsFPOAyYHCA0AlTKTB+MQIR6FdFDSACAgWlI5e//37VTeV+NSkjFqXBVKkLF3xTDnogmTRquxXRJI4iGDZD0y24wQwhWUDggJgIAAPANAJ0BKkwAWAA+KRCFQiGhDqz2AAwBQlpABXHPV1ro/7w5LOBb54ky91STp5sqSiRfTaBVIbp+KKln7q3SreLlV12muV5TWsQeIC99+xas233y39iK47zq0hp2JO6an0hSTb1Q4xSreWZBPxy5VPtuobZ3T06psAD++bDloe6/JY9yBX+UMISimlcFk8ZzLx8Vir2b8JNxVszLq/iX7E6xzyNDG7zVEvYCk50bYBH/yEHoXvVFMND0k+I2iGz9FJzzd6wDBnLOyKZtD6pjkMsVEVCIGNzz6HE47SyerWdtfN48CJTh7bQphm82ndaumLL4t1KDREwL3UKQjmT2sEmWjWu4JJPEaEm/px++Cs+V0mgPeh4YlHZO9vOsMsyHoAUKBL8XtzScJDaLvAAqlwr/9WrRDYwVBU1m33llf4peSmBXMqzfZmEbNwmgIvU06G6p7Mu6hched00gN0Oh8IuBxTHm3bFbs1tTCitKkHS2AM2NzJ3oR8luUeHpLjHobrKcC57NeJ81lQjfks7ZW5LMeTYKpQcp/CduH0r5yMkNSIfOlVPuwTcqAFesqTfQifHuMgd+q5WRykyIK9jUPjiP4za21lTT46ENlZNzbzvA3b8wDnKP4KPpSyFzs9wP6iraNZeKCWjqQOJ4kSIZzAtYEQy27NDgAL3u/VfIDxO28wV0q0Pd49AtcNrdpGmzi5FmtMDhUQjCeZDh8wmA1CSM29QAAAA=" alt="">',
    pairedSignupIcons('<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="5" fill="#ff0000"/><path d="m10 8 6 4-6 4z" fill="white"/></svg>', signupGoogleIcon),
    '<img class="signup-source-image" src="data:image/webp;base64,UklGRjABAABXRUJQVlA4WAoAAAAQAAAAKAAAHQAAQUxQSCIAAAABDzD/ERFCbRtJylzf1Pg9U/ZxRP8noK1s5CfqAihAtngBVlA4IOgAAACwBQCdASopAB4APikQhkIhoQ6tmgAMAUJaQAD2RPQ9PRSvTJPkSIGOl/LI+knWVJgJbhWyqHAA/vln9nWz1fb/Ex+Nz7DU4UX4ekTynFlpkEOX0HwgkUFwaqDv96B+xwO9cOijxrHQn7LPplkkWllP3e6rpH3nrq6B+EXltk9Wqs5WwDD7AMant0ZXO4ne2VWZhgcs8uvo/9OdOK0vuvX/iVo7f/Fz7xPTZ745rU2Lmyh/p+m17RL6NcF4lot1p965/2h95c++8LRSeh1Ws9XsfL/MikMjWohK1+31pP/80wROvS0AAAAA" alt="">', signupOtherIcon
  ],
  reasons: [signupFriendsIcon, '🎉', '📚', '⏳', '💼', '✈️', signupOtherIcon],
  dailyGoal: ['◷', '◷', '◷', '◷'],
  path: ['📗', '🧭', '🎯'],
  age: ['🎒', '🌱', '🌿', '🌳', '🍃', '⭐']
};

function pairedSignupIcons(first, second) {
  return '<span class="signup-paired-icons">' + first + second + '</span>';
}

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
    '<div class="signup-page"><h1>' + title + '</h1>' + (key === 'reasons' ? '<p>Կարող ես ընտրել մի քանի պատճառ։</p>' : '') +
    body + '<p class="account-error" role="status">' + esc(message) + '</p></div>' +
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
  if (app.querySelector('.signup-page[inert]')) return;
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
  if (await transitionSignupStep(1) && signupStep === authStep && account.authenticated) createStudyProfile();
}

async function transitionSignupStep(direction) {
  const page = app.querySelector('.signup-page');
  if (page?.inert) return false;
  const animate = page?.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animate) {
    page.inert = true;
    await page.animate([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(' + (-44 * direction) + 'px)', opacity: 0 }
    ], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    if (!page.isConnected) return false;
  }
  signupStep += direction;
  if (signupStep < 0) {
    signupStep = 0;
    showAccountWelcome();
  } else {
    drawSignup();
  }
  if (animate) (app.querySelector('.signup-page') || app.querySelector('.account-flow'))?.animate([
    { transform: 'translateX(' + (44 * direction) + 'px)', opacity: .25 },
    { transform: 'translateX(0)', opacity: 1 }
  ], { duration: 240, easing: 'ease-out' });
  return true;
}

function previousSignupStep() {
  return transitionSignupStep(-1);
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
