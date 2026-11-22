function switchCourse(destination) {
  if (view === destination) return;
  go(destination);
  app.querySelector('.course-track')?.classList.add('course-enter');
}

function courseLayout(track, course) {
  const grammarDone = state.lessons.length;
  const wordsDone = Object.values(state.wordLessons).filter(item => item.done).length;
  const total = course === 'grammar' ? LESSONS.length : WORDS.length;
  const complete = course === 'grammar' ? grammarDone : wordsDone;
  const label = course === 'grammar' ? 'Քերականական թեմաներ' : 'Սովորած բառեր';
  return '<div class="course-layout"><div class="course-track">' + track + '<button class="icon-btn path-jump" hidden onclick="jumpToCurrentLesson()" aria-label="Գնալ ընթացիկ դասին">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
    '<div class="course-rail"><section class="panel course-progress"><h2>Քո առաջընթացը</h2>' +
    '<div class="course-stat">' + referenceIcon('progress', 'course-stat-icon') + '<div><strong>' +
    esc(label) + '</strong><p>' + complete + ' / ' + total + '</p></div></div>' +
    '<progress value="' + complete + '" max="' + total + '" aria-label="' + esc(label) + '"></progress></section>' +
    '<section class="panel course-progress"><h2>' + referenceIcon('goal') + 'Քո դասերը</h2>' +
    '<button class="secondary course-link"' + (course === 'grammar' ? ' aria-current="page"' : '') + ' onclick="switchCourse(\'grammar\')">' + referenceIcon('grammar') + 'Քերականություն <strong>' + grammarDone +
    '</strong></button><button class="secondary course-link"' + (course === 'grammar' ? '' : ' aria-current="page"') + ' onclick="switchCourse(\'vocabulary\')">' + referenceIcon('words') + 'Բառեր <strong>' + wordsDone +
    '</strong></button></section></div></div>';
}

function courseMilestone(complete) {
  return '<div class="course-milestone' + (complete ? ' is-complete' : '') + '">' + referenceIcon('chest') +
    '<small>' + (complete ? 'Բաժինն ավարտված է' : 'Բաժնի ավարտ') + '</small></div>';
}

let lessonAnswerStreak = 0;

function paintLessonAnswerStreak() {
  const label = app.querySelector('.lesson-answer-streak');
  if (label) label.textContent = lessonAnswerStreak >= 3 ? lessonAnswerStreak + ' անընդմեջ ճիշտ պատասխան' : '';
}

function recordLessonAnswer(correct) {
  lessonAnswerStreak = correct ? lessonAnswerStreak + 1 : 0;
  paintLessonAnswerStreak();
}

function focusLessonHeader(step, total, destination, { showCount = true, showInitialFill = false } = {}) {
  const fill = showInitialFill ? Math.max(step, total * .1) : step;
  return '<div class="focus-lesson-header"><button class="focus-lesson-close" onclick="this.parentElement.querySelector(\'dialog\').showModal()"' +
    ' aria-label="Փակել դասը">×</button><div class="lesson-progress-track"><span class="lesson-answer-streak" role="status"></span><div class="lesson-meter" role="progressbar" aria-label="Դասի առաջընթաց" aria-valuemin="0" aria-valuenow="' + fill + '" aria-valuemax="' + total + '"><span style="width:' + (100 * fill / total) + '%"></span></div></div>' +
    (showCount ? '<small>' + Math.min(step + 1, total) + ' / ' + total + '</small>' : '') +
    '<dialog class="lesson-exit-dialog" aria-labelledby="lesson-exit-title">' +
    '<div class="exit-owl" aria-hidden="true">' + gardenIllustration('bear') + '</div><h2 id="lesson-exit-title">Դո՞ւրս գալ դասից</h2>' +
    '<p>Այս պահին չավարտած հարցը կարող է չպահպանվել։</p><form method="dialog">' +
    '<button class="primary" autofocus>Շարունակել սովորել</button></form>' +
    '<button class="text-button lesson-leave" onclick="this.closest(\'dialog\').close();go(\'' + destination +
    '\')">Դուրս գալ</button></dialog></div>';
}

function updatePathArrow() {
  const arrow = app.querySelector('.path-jump');
  if (!arrow) return;
  const current = app.querySelector('.path-node.path-current');
  if (!current) { arrow.hidden = true; return; }
  const rect = current.getBoundingClientRect();
  const above = rect.top < 60;
  const below = rect.bottom > window.innerHeight - 85;
  arrow.hidden = !above && !below;
  arrow.classList.toggle('points-down', !above && below);
}

function jumpToCurrentLesson() {
  const current = app.querySelector('.path-node.path-current');
  if (!current) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  current.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  current.focus({ preventScroll: true });
}

window.addEventListener('scroll', updatePathArrow, { passive: true });
window.addEventListener('resize', updatePathArrow);

let lessonTransitionRunning = false;

function setLessonProgress(value) {
  const meter = app.querySelector('.lesson-meter');
  if (!meter) return;
  meter.setAttribute('aria-valuenow', value);
  meter.firstElementChild.style.width = (100 * value / Number(meter.getAttribute('aria-valuemax'))) + '%';
}

async function transitionLesson(render, direction = 1) {
  if (lessonTransitionRunning) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render();
    return;
  }
  lessonTransitionRunning = true;
  const previousMeter = app.querySelector('.lesson-meter span');
  const previousWidth = previousMeter && previousMeter.getBoundingClientRect().width;
  const oldContent = app.firstElementChild;
  const animatedContent = () => [...app.children].flatMap(element =>
    element.matches('.focus-lesson-header') ? [] :
      element.querySelector(':scope > .focus-lesson-header') ?
        [...element.children].filter(child => !child.matches('.focus-lesson-header')) : [element]);
  const animate = (frames, duration) => Promise.all(animatedContent().map(element =>
    element.animate(frames, { duration, easing: 'ease-out', fill: 'backwards' }).finished.catch(() => {})));
  try {
    const outgoing = animatedContent().map(element => element.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(' + (-direction * 24) + 'px)' }
    ], { duration: 140, easing: 'ease-in', fill: 'forwards' }));
    await Promise.all(outgoing.map(animation => animation.finished.catch(() => {})));
    if (oldContent !== app.firstElementChild) return;
    render();
    const next = app.querySelector('.lesson-meter span');
    if (next && previousMeter) {
      next.animate([{ width: previousWidth + 'px' }, { width: next.style.width }],
        { duration: 360, easing: 'ease-out' });
    }
    await animate([
      { opacity: 0, transform: 'translateX(' + (direction * 24) + 'px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], 220);
  } finally {
    lessonTransitionRunning = false;
  }
}
