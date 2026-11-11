function courseLayout(track, course) {
  const grammarDone = state.lessons.length;
  const wordsDone = Object.values(state.wordLessons).filter(item => item.done).length;
  const total = course === 'grammar' ? LESSONS.length : WORDS.length;
  const complete = course === 'grammar' ? grammarDone : wordsDone;
  const label = course === 'grammar' ? 'Քերականական թեմաներ' : 'Սովորած բառեր';
  return '<div class="course-layout"><div class="course-track">' + track + '</div>' +
    '<div class="course-rail"><section class="panel course-progress"><h2>Քո առաջընթացը</h2>' +
    '<div class="course-stat"><span class="course-stat-icon" aria-hidden="true">★</span><div><strong>' +
    esc(label) + '</strong><p>' + complete + ' / ' + total + '</p></div></div>' +
    '<progress value="' + complete + '" max="' + total + '" aria-label="' + esc(label) + '"></progress></section>' +
    '<section class="panel course-progress"><h2>Քո դասերը</h2>' +
    '<button class="secondary course-link" onclick="go(\'grammar\')">Քերականություն <strong>' + grammarDone +
    '</strong></button><button class="secondary course-link" onclick="go(\'vocabulary\')">Բառեր <strong>' + wordsDone +
    '</strong></button></section></div></div>';
}

function focusLessonHeader(step, total, exitAction) {
  return '<div class="focus-lesson-header"><button class="focus-lesson-close" onclick="' + exitAction +
    '" aria-label="Վերադառնալ ուսուցման ճանապարհին">×</button><progress value="' + step +
    '" max="' + total + '" aria-label="Դասի առաջընթաց"></progress><small>' +
    Math.min(step + 1, total) + ' / ' + total + '</small></div>';
}
