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
  return '<div class="course-layout"><div class="course-track">' + track + '</div>' +
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

function focusLessonHeader(step, total, destination, { showCount = true } = {}) {
  return '<div class="focus-lesson-header"><button class="focus-lesson-close" onclick="this.parentElement.querySelector(\'dialog\').showModal()"' +
    ' aria-label="Փակել դասը">×</button><progress value="' + step +
    '" max="' + total + '" aria-label="Դասի առաջընթաց"></progress>' +
    (showCount ? '<small>' + Math.min(step + 1, total) + ' / ' + total + '</small>' : '') +
    '<dialog class="lesson-exit-dialog" aria-labelledby="lesson-exit-title">' +
    '<div class="exit-owl" aria-hidden="true">🦉</div><h2 id="lesson-exit-title">Դո՞ւրս գալ դասից</h2>' +
    '<p>Այս պահին չավարտած հարցը կարող է չպահպանվել։</p><form method="dialog">' +
    '<button class="primary" autofocus>Շարունակել սովորել</button></form>' +
    '<button class="text-button lesson-leave" onclick="this.closest(\'dialog\').close();go(\'' + destination +
    '\')">Դուրս գալ</button></dialog></div>';
}
