// Կրկնություն (Practice). Բառերի ինտերվալային կրկնություն (HLR-lite՝ Duolingo-ի Half-Life Regression-ի պարզեցված տարբերակ),
// սխալների հերթ, օրվա առաջադրանքներ, streak-ի պաշտպանություն և ձեռքբերումներ։
// Ամբողջ վիճակը պահվում է state-ում (localStorage), սերվերի փոփոխություն չի պահանջվում։
//
// state.srs[wordIndex] = { h: կիսակյանք (ժամ), t: վերջին պատասխանի ժամանակ (ms), r: ճիշտ, w: սխալ, bad: 1՝ վերջին պատասխանը սխալ էր }
// Հիշելու հավանականություն՝ p = 2^(−Δ/h)։ p < 0.8 → բառը կրկնության կարիք ունի։

const SRS_START_HOURS = 24;
const SRS_MIN_HOURS = 12;
const SRS_MAX_HOURS = 24 * 180;
const SRS_DUE_P = 0.8;
const SRS_SET_SIZE = 10;
const SRS_PRACTICE_XP = 10;
const QUEST_DEFS = [
  { id: 'xp', title: 'Վաստակիր 30 XP', target: 30 },
  { id: 'review', title: 'Ճիշտ պատասխանիր 10 կրկնության հարցի', target: 10 },
  { id: 'perfect', title: 'Ավարտիր դասը առանց սխալի', target: 1 }
];

let reviewWasPractice = false;

function todayKey() {
  return studyDayKey(new Date());
}

// ---------- Օրվա հաշվիչներ ----------

function dailyState() {
  const day = todayKey();
  if (!state.daily || state.daily.day !== day) state.daily = { day, reviewed: 0, perfect: 0 };
  return state.daily;
}

function logXp(points) {
  if (!points) return;
  const day = todayKey();
  if (!state.xpToday || state.xpToday.day !== day) state.xpToday = { day, xp: 0 };
  state.xpToday.xp += points;
  if (state.xpToday.xp > (state.bestDayXp || 0)) state.bestDayXp = state.xpToday.xp;
}

function todayXp() {
  return state.xpToday && state.xpToday.day === todayKey() ? state.xpToday.xp : 0;
}

function recordPerfectLesson() {
  dailyState().perfect++;
  state.perfectLessons = (state.perfectLessons || 0) + 1;
}

function recordReviewCorrect() {
  dailyState().reviewed++;
  state.reviewedTotal = (state.reviewedTotal || 0) + 1;
}

// ---------- Բառերի կրկնություն (SRS) ----------

function learnedWordIndexes() {
  const lessons = state.wordLessons || {};
  return Object.keys(lessons).filter(index => lessons[index]?.done).map(Number);
}

function srsLearn(index, now = Date.now()) {
  if (!Number.isInteger(index)) return;
  state.srs ??= {};
  state.srs[index] ??= { h: SRS_START_HOURS, t: now, r: 0, w: 0 };
}

function srsRecord(index, correct, now = Date.now()) {
  if (!Number.isInteger(index)) return;
  state.srs ??= {};
  const entry = state.srs[index] ??= { h: SRS_START_HOURS, t: now, r: 0, w: 0 };
  if (correct) {
    entry.r++;
    // Նույն սեսիայի կրկնվող ճիշտ պատասխանները համարյա չեն մեծացնում ինտերվալը,
    // լիարժեք աճ տրվում է միայն երբ նախորդ ինտերվալի կեսն արդեն անցել է
    const waited = (now - entry.t) / 3600000;
    entry.h = Math.min(SRS_MAX_HOURS, entry.h * (waited >= entry.h * 0.5 ? 2.2 : 1.1));
    delete entry.bad;
  } else {
    entry.w++;
    entry.h = Math.max(SRS_MIN_HOURS, entry.h / 2);
    entry.bad = 1;
  }
  entry.t = now;
}

function srsStrength(index, now = Date.now()) {
  const entry = state.srs?.[index];
  if (!entry) return 0.5; // առանց պատմության (հին առաջընթաց) բառերը համարվում են կրկնության կարիք ունեցող
  return Math.pow(2, -((now - entry.t) / 3600000) / entry.h);
}

function srsDueWords(now = Date.now()) {
  return learnedWordIndexes().filter(index => srsStrength(index, now) < SRS_DUE_P)
    .sort((a, b) => srsStrength(a, now) - srsStrength(b, now));
}

function srsMistakeWords() {
  return learnedWordIndexes().filter(index => state.srs?.[index]?.bad);
}

// Կրկնության համար յուրաքանչյուր բառից մեկ հարց (օրվա սերմով՝ որ էջը թարմացնելիս նույնը մնա)
function practicePick(questions) {
  const groups = new Map();
  for (const question of questions) {
    if (!groups.has(question.index)) groups.set(question.index, []);
    groups.get(question.index).push(question);
  }
  const day = new Date().getDate();
  return [...groups.values()].map(list => list[(list[0].index * 7 + day) % list.length]);
}

function startPractice(kind) {
  if (state.cumulativeReview) return startCumulativeReview(); // նախ ավարտել սպասվող կրկնությունը
  const list = (kind === 'mistakes' ? srsMistakeWords() : srsDueWords()).slice(0, SRS_SET_SIZE);
  if (!list.length) return practice();
  state.cumulativeReview = { words: list, afterWord: undefined, cursor: 0, practice: kind };
  save();
  startCumulativeReview();
}

// ---------- Օրվա առաջադրանքներ ----------

function questProgress() {
  const daily = dailyState();
  return QUEST_DEFS.map(quest => {
    const raw = quest.id === 'xp' ? todayXp() : quest.id === 'review' ? daily.reviewed : daily.perfect;
    return { ...quest, value: Math.min(quest.target, raw), done: raw >= quest.target };
  });
}

// Ավարտված առաջադրանքները հաշվվում են մեկ անգամ օրվա ընթացքում (ձեռքբերումների համար)
function syncQuests() {
  const day = todayKey();
  if (!state.questLog || state.questLog.day !== day) state.questLog = { day, ids: [] };
  let changed = false;
  for (const quest of questProgress()) {
    if (quest.done && !state.questLog.ids.includes(quest.id)) {
      state.questLog.ids.push(quest.id);
      state.questsTotal = (state.questsTotal || 0) + 1;
      changed = true;
    }
  }
  return changed;
}

// ---------- Streak-ի պաշտպանություն ----------

function awardStreakFreeze(streak) {
  state.bestStreak = Math.max(state.bestStreak || 0, streak);
  if (streak > 0 && streak % 7 === 0 && state.freezeEarnedAt !== streak && (state.freezes || 0) < 2) {
    state.freezes = (state.freezes || 0) + 1;
    state.freezeEarnedAt = streak;
  }
}

// Եթե երեկ բաց է թողնվել, բայց մեկ օր առաջ շարքը կենդանի էր, ծախսվում է պաշտպանություն
function applyStreakFreeze(now = new Date()) {
  if (!((state.freezes || 0) > 0)) return;
  const days = new Set(state.studyDays || []);
  const frozen = new Set(state.frozenDays || []);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const before = new Date(yesterday);
  before.setDate(before.getDate() - 1);
  const y = studyDayKey(yesterday);
  const b = studyDayKey(before);
  if (days.has(y) || frozen.has(y) || !(days.has(b) || frozen.has(b))) return;
  state.freezes--;
  (state.frozenDays ??= []).push(y);
  state.frozenDays = state.frozenDays.slice(-30);
  save();
}

// ---------- «Կրկնություն» էջ ----------

function strengthLabel(p) {
  return p >= 0.8 ? 'ամուր' : p >= 0.5 ? 'միջին' : 'թույլ';
}

function practiceQuestCard() {
  const rows = questProgress().map(quest =>
    '<li class="pr-quest' + (quest.done ? ' is-done' : '') + '"><div><strong>' + esc(quest.title) + '</strong>' +
    '<span>' + quest.value + ' / ' + quest.target + '</span></div><div class="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' +
    quest.target + '" aria-valuenow="' + quest.value + '"><span style="width:' + (100 * quest.value / quest.target) + '%"></span></div></li>').join('');
  const freezes = state.freezes || 0;
  return '<section class="pr-card"><h2>Օրվա առաջադրանքներ</h2><ul class="pr-quests">' + rows + '</ul>' +
    '<p class="pr-note">Շարքի պաշտպանություն՝ <b>' + freezes + ' / 2</b>։ Ամեն 7 օրը մեկ ստանում ես մեկը. եթե մի օր բաց թողնես, այն ավտոմատ փրկում է շարքդ։</p></section>';
}

function practiceWeakest() {
  const now = Date.now();
  const list = learnedWordIndexes().map(index => ({ index, p: srsStrength(index, now) }))
    .sort((a, b) => a.p - b.p).slice(0, 8);
  if (!list.length) return '';
  return '<section class="pr-card"><h2>Ամենաթույլ բառերդ</h2><ul class="pr-words">' + list.map(item => {
    const word = WORDS[item.index];
    if (!word) return '';
    return '<li><div><strong lang="en">' + esc(word.en) + '</strong><span lang="hy">' + esc(hy(word) || '') + '</span></div>' +
      '<div class="pr-strength"><div class="pr-bar" aria-hidden="true"><span class="' + (item.p < 0.5 ? 'is-weak' : item.p < 0.8 ? 'is-mid' : '') +
      '" style="width:' + Math.max(4, Math.round(item.p * 100)) + '%"></span></div><small>' + strengthLabel(item.p) + ' · ' + Math.round(item.p * 100) + '%</small></div></li>';
  }).join('') + '</ul></section>';
}

function practice() {
  applyStreakFreeze();
  if (syncQuests()) save();
  const learned = learnedWordIndexes().length;
  const due = srsDueWords().length;
  const mistakes = srsMistakeWords().length;
  const pending = !!state.cumulativeReview;
  const card = (title, count, text, kind, label) =>
    '<section class="pr-card pr-action"><div class="pr-count" aria-hidden="true">' + count + '</div><div><h2>' + title + '</h2><p>' + text + '</p>' +
    '<button class="primary" ' + (count || pending ? 'onclick="startPractice(\'' + kind + '\')"' : 'disabled') + '>' + label + '</button></div></section>';
  let body;
  if (!learned) {
    body = '<section class="pr-card"><p>Դեռ սովորած բառ չունես։ Անցիր առաջին բառի դասը, և այն կհայտնվի այստեղ կրկնության համար։</p>' +
      '<button class="primary" onclick="go(\'vocabulary\')">Սկսել բառերի դասերը</button></section>';
  } else {
    body = (pending ? '<section class="pr-card pr-pending"><p><strong>Սպասվող կրկնություն կա։</strong> Ավարտիր այն, հետո կարող ես սկսել նորը։</p>' +
      '<button class="primary" onclick="startCumulativeReview()">Շարունակել կրկնությունը</button></section>' : '') +
      '<div class="pr-actions">' +
      card('Բառեր', due, due ? 'Այս բառերը սկսում են մոռացվել։ Կրկնիր դրանք հիմա (մինչև ' + SRS_SET_SIZE + ' բառ, +' + SRS_PRACTICE_XP + ' XP)։' : 'Այս պահին բոլոր բառերդ ամուր են։ Վերադարձիր ավելի ուշ։', 'due', 'Կրկնել բառերը') +
      card('Սխալներ', mistakes, mistakes ? 'Բառեր, որոնցում վերջին անգամ սխալվել ես։' : 'Սխալված բառեր չկան։ Հիանալի է։', 'mistakes', 'Շտկել սխալները') +
      '</div>' + practiceQuestCard() + practiceWeakest();
  }
  app.innerHTML = '<div class="practice-page"><h1>Կրկնություն</h1><p class="pr-lead">Բառերը մոռացվում են, եթե դրանք չես կրկնում։ Այստեղ կրկնիր հենց այն, ինչ հիմա ամենաշատն է մոռացվում։</p>' +
    '<div class="pr-summary"><span><b>' + learned + '</b> սովորած բառ</span><span><b>' + due + '</b> կրկնության կարիք ունի</span><span><b>' + mistakes + '</b> սխալ</span></div>' +
    body + '</div>';
}

// ---------- Ձեռքբերումներ (պրոֆիլ) ----------

const AWARD_DEFS = [
  { title: 'Բառապաշար', unit: 'բառ', steps: [5, 10, 25, 50, 100, 250, 500], value: () => learnedWordIndexes().length },
  { title: 'Օրերի շարք', unit: 'օր', steps: [3, 7, 14, 30, 100, 365], value: () => Math.max(state.bestStreak || 0, typeof currentStudyStreak === 'function' ? currentStudyStreak() : 0) },
  { title: 'Կրկնություն', unit: 'ճիշտ պատասխան', steps: [10, 50, 100, 500, 1000], value: () => state.reviewedTotal || 0 },
  { title: 'Առաջադրանքներ', unit: 'առաջադրանք', steps: [3, 10, 25, 50, 100], value: () => state.questsTotal || 0 }
];

function leagueNameFor(index) {
  const league = typeof LEADERBOARD_LEAGUES !== 'undefined' ? LEADERBOARD_LEAGUES[index] : null;
  return league ? league.name + ' լիգա' : '—';
}

function achievementsMarkup() {
  const streak = Math.max(state.bestStreak || 0, typeof currentStudyStreak === 'function' ? currentStudyStreak() : 0);
  const record = (label, value) => '<li><strong>' + value + '</strong><small>' + label + '</small></li>';
  const records = '<ul class="ach-records">' +
    record('Ամենաերկար շարք', streak) + record('Օրվա առավելագույն XP', state.bestDayXp || 0) +
    record('Կատարյալ դասեր', state.perfectLessons || 0) +
    record('Ամենաբարձր լիգա', Number.isInteger(state.bestLeague) ? esc(leagueNameFor(state.bestLeague)) : '—') + '</ul>';
  const awards = AWARD_DEFS.map(def => {
    const value = def.value();
    const level = def.steps.filter(step => value >= step).length;
    const next = def.steps[level];
    const text = next ? value + ' / ' + next + ' ' + def.unit : 'Բոլոր մակարդակները բացված են';
    return '<li class="ach-award' + (level ? ' is-earned' : '') + '"><div class="ach-level" aria-label="Մակարդակ ' + level + '">' + level + '</div><div><strong>' + def.title +
      '</strong><small>' + text + '</small>' + (next ? '<div class="pr-bar" aria-hidden="true"><span style="width:' + Math.min(100, 100 * value / next) + '%"></span></div>' : '') + '</div></li>';
  }).join('');
  return '<section class="profile-card-box"><h2>Ձեռքբերումներ</h2><h3 class="ach-sub">Անձնական ռեկորդներ</h3>' + records +
    '<h3 class="ach-sub">Մրցանակներ</h3><ul class="ach-awards">' + awards + '</ul></section>';
}
