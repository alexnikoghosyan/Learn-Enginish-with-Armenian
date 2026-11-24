// Ֆիզիկայի դասի շարժիչ. քայլերի տեսակները՝ physics-steps.js-ում։ Դասերը բացվում են ԽԻՍՏ հերթականությամբ (§1 → §55)։
state.physics ??= { done: {}, at: {} };
state.physicsXp ??= 0;
let physLesson = null;

const physicsReady = id => Boolean(PHYSICS_LESSONS[id]);
const physicsDone = id => Boolean(state.physics.done[id]);
const physicsSections = () => PHYSICS_COURSE.chapters.flatMap(chapter => chapter.sections);

// Դասընթացի հերթականությամբ առաջին չավարտված §-ը (պատրաստ լինի, թե ոչ)
const physicsNext = () => physicsSections().find(section => !physicsDone(section.id));

// Բացվում է միայն պատրաստ դասը, որը կամ ավարտված է (կրկնել), կամ հերթական (current) է
function physicsCanOpen(section) {
  return Boolean(section) && physicsReady(section.id) && (physicsDone(section.id) || section === physicsNext());
}

function physicsProgress() {
  const sections = physicsSections();
  return { total: sections.length, done: sections.filter(section => physicsDone(section.id)).length };
}

// Blender կադրաշերտի քայլը ցուցադրվում է միայն եթե մեդիան կա և էջը սերվերից է (file:-ում՝ բաց է թողնվում)
const physMediaReady = name => typeof PHYSICS_MEDIA !== 'undefined' && Boolean(PHYSICS_MEDIA[name]) && !physFileMode();

function physicsCloseTool() {
  if (physLesson && physLesson.tool) { physLesson.tool.destroy(); physLesson.tool = null; }
}

function openPhysicsLesson(id) {
  if (!physicsCanOpen(physicsSections().find(section => section.id === id))) { go('physics'); return; }
  view = 'physics';
  renderNavigation();
  const steps = PHYSICS_LESSONS[id].filter(step => step.k !== 'scrub' || physMediaReady(step.media));
  physLesson = { id, steps, i: Math.min(state.physics.at[id] || 0, steps.length - 1), tries: 0, tool: null, picked: null };
  beginLessonCounters('phys:' + id);
  drawPhysicsStep();
  window.scrollTo(0, 0);
}

function drawPhysicsStep() {
  physicsCloseTool();
  physLesson.picked = null;
  physLesson.busy = false;
  const { steps, i } = physLesson;
  const step = steps[i];
  const kind = PHYS_STEPS[step.k];
  const action = kind.check ? 'checkPhysicsStep()' : step.k === 'recap' ? 'finishPhysicsLesson()' : 'nextPhysicsStep()';
  app.innerHTML = '<section class="lesson-body phys-lesson">' + focusLessonHeader(i, steps.length, 'physics') +
    '<div class="phys-content">' + kind.html(step) + '</div><div class="phys-bar"><div class="phys-feedback" role="status" aria-live="polite" hidden></div><div class="phys-actions">' +
    (step.k === 'sim' ? '<button class="secondary" onclick="resetPhysicsTool()">Սկսել նորից</button>' : '') +
    '<button class="primary" id="phys-main" onclick="' + action + '">' +
    (kind.check ? 'Ստուգել' : step.k === 'recap' ? 'Ավարտել' : 'Շարունակել') + '</button></div></div></section>';
  if (kind.mount) kind.mount(step);
}

function resetPhysicsTool() {
  physLesson.tool.reset();
  app.querySelector('.phys-feedback').hidden = true;
  app.querySelector('.phys-bar').className = 'phys-bar';
}

// Առաջին սխալից հետո՝ հուշում, երկրորդից հետո՝ բացատրություն և անցում հաջորդ քայլին։ Ներքևի շերտը գունավորվում է
function checkPhysicsStep() {
  const step = physLesson.steps[physLesson.i];
  const kind = PHYS_STEPS[step.k];
  const ok = kind.check(step);
  if (kind.graded && physLesson.tries === 0) recordLessonAnswer(ok);
  physLesson.tries++;
  const done = ok || kind.once || physLesson.tries >= 2;
  const box = app.querySelector('.phys-feedback');
  const lead = kind.once ? (ok ? 'Ճիշտ կանխատեսում։' : 'Տեսնենք՝ ինչպես է իրականում։') : ok ? 'Ճիշտ է։' : 'Ճիշտ չէ։';
  box.hidden = false;
  app.querySelector('.phys-bar').className = 'phys-bar ' + (kind.once ? 'is-neutral' : ok ? 'is-correct' : 'is-wrong');
  box.innerHTML = '<strong>' + lead + '</strong> ' + physLinesHtml(done ? step.why : step.hint);
  if (!done) return;
  if (kind.reveal) kind.reveal(step, ok);
  const main = app.querySelector('#phys-main');
  main.textContent = 'Շարունակել';
  main.setAttribute('onclick', 'nextPhysicsStep()');
}

// Արագ կրկնակի սեղմումը չպետք է բաց թողնի քայլ կամ դուրս գա քայլերի սահմաններից
function nextPhysicsStep() {
  if (physLesson.busy || physLesson.i + 1 >= physLesson.steps.length) return;
  physLesson.busy = true;
  physLesson.i++;
  physLesson.tries = 0;
  state.physics.at[physLesson.id] = physLesson.i;
  save();
  transitionLesson(drawPhysicsStep);
}

function finishPhysicsLesson() {
  if (!physLesson || physLesson.finishing) return;
  physLesson.finishing = true;
  const { id } = physLesson;
  const fresh = !physicsDone(id);
  physicsCloseTool();
  if (fresh) { state.physics.done[id] = true; state.physicsXp += 10; logXp(10); }
  delete state.physics.at[id];
  recordStudyDay();
  save();
  const results = finishLessonCounters();
  const next = physicsNext();
  const ready = next && physicsReady(next.id);
  app.innerHTML = '<section class="lesson-body panel"><div class="lesson-reward is-new" role="status">' +
    '<span class="reward-medal" aria-hidden="true">' + (physImageReady('lesson-complete') ? physImageTag('lesson-complete', 'phys-medal-img') : gardenIllustration('medal')) + '</span><div><strong>Դասն ավարտված է։</strong><small>' +
    results.correct + ' / ' + results.total + ' ճիշտ պատասխան</small>' + rewardChips(fresh, results, fresh ? 10 : 0) + '</div></div>' +
    (next && !ready ? '<p class="phys-text">Հաջորդ դասը շուտով կհայտնվի։</p>' : '') + '<div class="tools">' +
    (ready ? '<button class="primary" onclick="openPhysicsLesson(\'' + next.id + '\')">Հաջորդ դասը →</button>' : '') +
    '<button class="secondary" onclick="go(\'physics\')">Վերադառնալ ճանապարհին</button></div></section>';
}
