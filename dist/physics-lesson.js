// Ֆիզիկայի դասի շարժիչ. քայլերի տեսակները՝ physics-steps.js-ում։
state.physics ??= { done: {}, at: {} };
state.physicsXp ??= 0;
let physLesson = null;

const physicsReady = id => Boolean(PHYSICS_LESSONS[id]);
// Blender կադրաշերտի քայլը ցուցադրվում է միայն եթե մեդիան կա և էջը սերվերից է (file:-ում՝ բաց է թողնվում)
const physMediaReady = name => typeof PHYSICS_MEDIA !== 'undefined' && Boolean(PHYSICS_MEDIA[name]) && location.protocol !== 'file:';
const physicsSections = () => PHYSICS_COURSE.chapters.flatMap(chapter => chapter.sections);

function physicsProgress() {
  const ready = physicsSections().filter(section => physicsReady(section.id));
  return { total: ready.length, done: ready.filter(section => state.physics.done[section.id]).length };
}

function physicsNextInChapter(chapter) {
  return chapter.sections.find(section => physicsReady(section.id) && !state.physics.done[section.id]);
}

function physicsNextSection(id) {
  const chapter = PHYSICS_COURSE.chapters.find(item => item.sections.some(section => section.id === id));
  return chapter && physicsNextInChapter(chapter);
}

function physicsCloseTool() {
  if (physLesson && physLesson.tool) { physLesson.tool.destroy(); physLesson.tool = null; }
}

function openPhysicsLesson(id) {
  if (!physicsReady(id)) return;
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
  const { steps, i } = physLesson;
  const step = steps[i];
  const kind = PHYS_STEPS[step.k];
  const action = kind.check ? 'checkPhysicsStep()' : step.k === 'recap' ? 'finishPhysicsLesson()' : 'nextPhysicsStep()';
  app.innerHTML = '<section class="lesson-body phys-lesson">' + focusLessonHeader(i, steps.length, 'physics') + kind.html(step) +
    '<div class="phys-feedback" role="status" aria-live="polite" hidden></div><div class="phys-actions">' +
    (step.k === 'sim' ? '<button class="secondary" onclick="resetPhysicsTool()">Սկսել նորից</button>' : '') +
    '<button class="primary" id="phys-main" onclick="' + action + '">' +
    (kind.check ? 'Ստուգել' : step.k === 'recap' ? 'Ավարտել' : 'Շարունակել') + '</button></div></section>';
  if (kind.mount) kind.mount(step);
}

function resetPhysicsTool() {
  physLesson.tool.reset();
  app.querySelector('.phys-feedback').hidden = true;
}

// Առաջին սխալից հետո՝ հուշում, երկրորդից հետո՝ բացատրություն և անցում հաջորդ քայլին
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
  box.className = 'phys-feedback ' + (kind.once ? 'is-neutral' : ok ? 'is-correct' : 'is-wrong');
  box.innerHTML = '<strong>' + lead + '</strong> ' + esc(done ? step.why : step.hint);
  if (!done) return;
  if (kind.reveal) kind.reveal(step, ok);
  const main = app.querySelector('#phys-main');
  main.textContent = 'Շարունակել';
  main.setAttribute('onclick', 'nextPhysicsStep()');
}

function nextPhysicsStep() {
  physLesson.i++;
  physLesson.tries = 0;
  state.physics.at[physLesson.id] = physLesson.i;
  save();
  transitionLesson(drawPhysicsStep);
}

function finishPhysicsLesson() {
  const { id } = physLesson;
  const fresh = !state.physics.done[id];
  physicsCloseTool();
  if (fresh) { state.physics.done[id] = true; state.physicsXp += 10; logXp(10); }
  delete state.physics.at[id];
  recordStudyDay();
  save();
  const results = finishLessonCounters();
  const next = physicsNextSection(id);
  app.innerHTML = '<section class="lesson-body panel"><div class="lesson-reward is-new" role="status">' +
    '<span class="reward-medal" aria-hidden="true">' + gardenIllustration('medal') + '</span><div><strong>Դասն ավարտված է։</strong><small>' +
    results.correct + ' / ' + results.total + ' ճիշտ պատասխան</small>' + rewardChips(fresh, results, fresh ? 10 : 0) + '</div></div><div class="tools">' +
    (next ? '<button class="primary" onclick="openPhysicsLesson(\'' + next.id + '\')">Հաջորդ դասը →</button>' : '') +
    '<button class="secondary" onclick="go(\'physics\')">Վերադառնալ ճանապարհին</button></div></section>';
}
