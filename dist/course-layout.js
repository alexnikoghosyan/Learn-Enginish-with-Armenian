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
    '<button class="secondary course-link" onclick="switchCourse(\'grammar\')">' + referenceIcon('grammar') + 'Քերականություն <strong>' + grammarDone +
    '</strong></button><button class="secondary course-link" onclick="switchCourse(\'vocabulary\')">' + referenceIcon('words') + 'Բառեր <strong>' + wordsDone +
    '</strong></button></section></div></div>';
}

function courseMilestone(complete) {
  return '<div class="course-milestone' + (complete ? ' is-complete' : '') + '">' + referenceIcon('chest') +
    '<small>' + (complete ? 'Բաժինն ավարտված է' : 'Բաժնի ավարտ') + '</small></div>';
}

function focusLessonHeader(step, total, destination, { showCount = true, showInitialFill = false } = {}) {
  const fill = showInitialFill ? Math.max(step, total * .1) : step;
  return '<div class="focus-lesson-header"><button class="focus-lesson-close" onclick="this.parentElement.querySelector(\'dialog\').showModal()"' +
    ' aria-label="Փակել դասը">×</button><progress value="' + fill +
    '" max="' + total + '" aria-label="Դասի առաջընթաց"></progress>' +
    (showCount ? '<small>' + Math.min(step + 1, total) + ' / ' + total + '</small>' : '') +
    '<dialog class="lesson-exit-dialog" aria-labelledby="lesson-exit-title">' +
    '<div class="exit-owl" aria-hidden="true">🦉</div><h2 id="lesson-exit-title">Դո՞ւրս գալ դասից</h2>' +
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
