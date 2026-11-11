function courseLayout(track, course) {
  const grammarDone = state.lessons.length;
  const wordsDone = Object.values(state.wordLessons).filter(item => item.done).length;
  const total = course === 'grammar' ? LESSONS.length : WORDS.length;
  const complete = course === 'grammar' ? grammarDone : wordsDone;
  const label = course === 'grammar' ? 'Քերականական թեմաներ' : 'Սովորած բառեր';
  const isGrammar = course === 'grammar';
  const nextTopic = LESSONS[nextGrammarTopic()];
  const nextWord = WORDS[wordOrder.find(index => !state.wordLessons[index]?.done)];
  const guide = isGrammar
    ? nextTopic ? '<strong>' + esc(nextTopic.title) + '</strong><p>' + esc(nextTopic.rule) + '</p>' : '<p>Բոլոր թեմաներն ավարտված են։</p>'
    : nextWord ? '<strong lang="en">' + esc(nextWord.en) + '</strong><p>' + esc(hy(nextWord)) + '</p>' : '<p>Բոլոր բառերն ավարտված են։</p>';
  const tabs = '<div class="course-switch" role="group" aria-label="Ուսուցման բաժիններ">' +
    '<button class="secondary" aria-pressed="' + !isGrammar + '" onclick="go(\'vocabulary\')">' +
    referenceIcon('words') + 'Բառեր</button><button class="secondary" aria-pressed="' + isGrammar +
    '" onclick="go(\'grammar\')">' + referenceIcon('grammar') + 'Քերականություն</button></div>';
  const guidePanel = '<details class="course-guide"><summary>' + referenceIcon('guide') +
    'Հաջորդ դասի հուշաթերթ</summary><div class="course-guide-copy">' + guide + '</div></details>';
  return '<div class="course-layout"><div class="course-track">' + tabs + guidePanel + track + '</div>' +
    '<div class="course-rail"><section class="panel course-progress"><h2>Քո առաջընթացը</h2>' +
    '<div class="course-stat">' + referenceIcon('progress', 'course-stat-icon') + '<div><strong>' +
    esc(label) + '</strong><p>' + complete + ' / ' + total + '</p></div></div>' +
    '<progress value="' + complete + '" max="' + total + '" aria-label="' + esc(label) + '"></progress></section>' +
    '<section class="panel course-progress"><h2>' + referenceIcon('goal') + 'Քո դասերը</h2>' +
    '<button class="secondary course-link" onclick="go(\'grammar\')">' + referenceIcon('grammar') + 'Քերականություն <strong>' + grammarDone +
    '</strong></button><button class="secondary course-link" onclick="go(\'vocabulary\')">' + referenceIcon('words') + 'Բառեր <strong>' + wordsDone +
    '</strong></button></section></div></div>';
}

function courseMilestone(complete) {
  return '<div class="course-milestone' + (complete ? ' is-complete' : '') + '">' + referenceIcon('chest') +
    '<small>' + (complete ? 'Բաժինն ավարտված է' : 'Բաժնի ավարտ') + '</small></div>';
}

function focusLessonHeader(step, total, exitAction) {
  return '<div class="focus-lesson-header"><button class="focus-lesson-close" onclick="' + exitAction +
    '" aria-label="Վերադառնալ ուսուցման ճանապարհին">×</button><progress value="' + step +
    '" max="' + total + '" aria-label="Դասի առաջընթաց"></progress><small>' +
    Math.min(step + 1, total) + ' / ' + total + '</small></div>';
}
