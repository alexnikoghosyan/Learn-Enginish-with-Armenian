let activeReview = null;
let reviewQuestions = [];
let pictureSelectionIndex = null;
let reviewChecked = false;
let reviewPictures = [];

const reviewPictureBank = [...illustrations].map(([word, entry]) => ({
  word, emoji: entry[2], shape: entry[3]
}));

function queueCumulativeReview(afterWord) {
  state.cumulativeReview = {
    words: wordOrder.filter(index => state.wordLessons[index]?.done),
    afterWord,
    cursor: 0
  };
}

function replayWordReview(index) {
  if (!state.cumulativeReview) {
    queueCumulativeReview(index);
    save();
  }
  startCumulativeReview();
}

function normalizeReviewAnswer(value) {
  return value.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
    .replace(/[.!?։՞՜]+$/g, '').trim().replace(/\s+/g, ' ');
}

function clozeForWord(word, meaning) {
  const example = curatedExamples[word.en]?.[0] ?? WORD_HINTS[word.en]?.[1];
  const pattern = word.en.replace(/[.*+?^$|{}()\[\]\\]/g, '\\$&');
  const token = new RegExp('(?<![a-z])' + pattern + '(?![a-z])', 'i');
  if (example && token.test(example)) return example.replace(token, '_____');
  return 'The English word for “' + meaning + '” is _____.';
}

function pictureForReview(word) {
  const entry = illustrations.get(word.en.toLowerCase());
  if (entry) return { word: word.en, emoji: entry[2], shape: entry[3] };
  const icon = WORD_HINTS[word.en]?.[2];
  return icon ? { word: word.en, emoji: icon } : null;
}

function makeReviewQuestions(indices) {
  const questions = [];
  for (const index of indices) {
    const word = WORDS[index];
    if (!word) continue;
    const meaning = hy(word) || state.wordLessons[index]?.explanation?.trim() || WORD_HINTS[word.en]?.[0] || word.en;
    const armenian = /[\u0531-\u0587]/.test(meaning);
    questions.push({ type: 'cloze', prompt: clozeForWord(word, meaning), answer: word.en });
    if (armenian) {
      questions.push({ type: 'to-en', prompt: meaning, answer: word.en });
      questions.push({ type: 'to-hy', prompt: word.en, answer: meaning });
    }
    const picture = pictureForReview(word);
    if (picture) questions.push({ type: 'picture', prompt: word.en, answer: word.en, picture });
  }
  return questions;
}

function startCumulativeReview() {
  const saved = state.cumulativeReview;
  if (!saved) {
    showLearningPath(pathPage);
    return;
  }
  view = 'vocabulary';
  pictureTab = 'cards';
  renderNavigation();
  if (activeReview !== saved) {
    activeReview = saved;
    reviewQuestions = makeReviewQuestions(saved.words);
  }
  drawReviewQuestion();
  window.scrollTo(0, 0);
}

function drawReviewQuestion() {
  reviewChecked = false;
  pictureSelectionIndex = null;
  const cursor = activeReview.cursor;
  const question = reviewQuestions[cursor];
  if (!question) {
    delete state.cumulativeReview;
    recordStudyDay();
    save();
    activeReview = null;
    app.innerHTML = '<h1>Կրկնություն</h1><section class="panel word-lesson-panel"><div class="lesson-reward is-new">' +
      '<span class="reward-medal" aria-hidden="true">★</span><div><strong>Կրկնությունն ավարտված է։</strong>' +
      '<small>Կրկնեցիր անցած բոլոր բառերը։</small></div></div><div class="tools">' +
      '<button class="primary" onclick="continueAfterReview()">' +
      (nextCourseWord() !== undefined ? 'Հաջորդ բառը →' : 'Վերադառնալ ճանապարհին →') +
      '</button></div></section>';
    return;
  }
  const labels = {
    cloze: 'Լրացրու բաց թողած բառը', 'to-en': 'Գրիր անգլերեն տարբերակը',
    'to-hy': 'Գրիր հայերեն տարբերակը', picture: 'Ընտրիր բառին համապատասխան պատկերը'
  };
  let exercise = '<label for="review-answer">Քո պատասխանը</label>' +
    '<input id="review-answer" oninput="updateReviewCheck()" autocomplete="off" spellcheck="false" maxlength="300" ' +
    'lang="' + (question.type === 'to-hy' ? 'hy' : 'en') + '">';
  if (question.type === 'picture') {
    const size = activeReview.words.length >= 8 ? 8 : 6;
    const seen = new Set([question.picture.shape || question.picture.emoji]);
    const choices = [question.picture];
    for (const picture of shuffled(reviewPictureBank)) {
      const key = picture.shape || picture.emoji;
      if (seen.has(key) || picture.word === question.answer) continue;
      choices.push(picture);
      seen.add(key);
      if (choices.length === size) break;
    }
    reviewPictures = shuffled(choices);
    exercise = '<div class="picture-grid review-grid">' + reviewPictures.map((picture, index) =>
      '<button type="button" class="picture-tile" aria-pressed="false" aria-label="Պատկեր ' + (index + 1) +
      '" onclick="selectReviewPicture(' + index + ')">' + pictureArt(picture.emoji, picture.shape) + '</button>'
    ).join('') + '</div>';
  }
  app.innerHTML = focusLessonHeader(cursor, reviewQuestions.length, 'vocabulary') +
    '<h1>Կրկնություն</h1><section class="panel word-lesson-panel review-panel">' +
    '<small>Հարց ' + (cursor + 1) + ' / ' + reviewQuestions.length + ' · ' + activeReview.words.length + ' բառ</small>' +
    '<h2>' + labels[question.type] + '</h2><div class="review-prompt' +
    (question.type === 'to-hy' ? ' with-bear' : '') + '" lang="' + (question.type === 'to-en' ? 'hy' : 'en') + '">' +
    (question.type === 'to-hy' || question.type === 'picture' ?
      (question.type === 'to-hy' ? lessonBear() : '') +
      '<button type="button" class="secondary lesson-speech" data-speak="' + esc(question.prompt) + '">' +
      actionIcon('speaker') + '<span>' + esc(question.prompt) + '</span></button>' : esc(question.prompt)) + '</div><form onsubmit="event.preventDefault();checkReviewAnswer()">' + exercise +
    '<p id="review-feedback" role="status"></p><div class="tools lesson-controls">' +
    '<button class="primary" id="review-check" disabled>Ստուգել</button>' +
    '<button type="button" class="secondary hidden" id="review-reveal" onclick="revealReviewAnswer()">Տեսնել պատասխանը</button>' +
    '<button type="button" class="secondary" onclick="go(\'vocabulary\')">Շարունակել ավելի ուշ</button>' +
    '</div></form></section>';
}

function selectReviewPicture(index) {
  if (reviewChecked) return;
  pictureSelectionIndex = index;
  updateReviewCheck();
  app.querySelectorAll('.review-grid button').forEach((button, position) =>
    button.setAttribute('aria-pressed', String(index === position)));
}

function updateReviewCheck() {
  const answer = document.getElementById('review-answer');
  const check = document.getElementById('review-check');
  if (check) check.disabled = !reviewChecked && (answer ? !answer.value.trim() : pictureSelectionIndex === null);
}

function checkReviewAnswer() {
  if (reviewChecked) {
    activeReview.cursor++;
    save();
    drawReviewQuestion();
    return;
  }
  const question = reviewQuestions[activeReview.cursor];
  const value = question.type === 'picture' ? reviewPictures[pictureSelectionIndex]?.word :
    document.getElementById('review-answer').value.trim();
  const feedback = document.getElementById('review-feedback');
  if (!value) {
    feedback.textContent = question.type === 'picture' ? 'Նախ ընտրիր պատկեր։' : 'Նախ գրիր պատասխանդ։';
    return;
  }
  const accepted = question.type === 'to-hy' ?
    [question.answer, ...question.answer.replace(/\([^)]*\)/g, '').split(/[,;،/՝]/)] : [question.answer];
  if (accepted.some(answer => normalizeReviewAnswer(answer) === normalizeReviewAnswer(value))) {
    finishReviewQuestion('Ճիշտ է։ ✓');
  } else {
    feedback.textContent = 'Փորձիր ևս մեկ անգամ։';
    document.getElementById('review-reveal').classList.remove('hidden');
  }
}

function revealReviewAnswer() {
  finishReviewQuestion('Ճիշտ պատասխանը՝ ' + reviewQuestions[activeReview.cursor].answer);
}

function finishReviewQuestion(message) {
  reviewChecked = true;
  document.getElementById('review-feedback').textContent = message;
  document.getElementById('review-check').textContent = 'Շարունակել →';
  document.getElementById('review-reveal').classList.add('hidden');
  const question = reviewQuestions[activeReview.cursor];
  app.querySelectorAll('.review-grid button').forEach((button, index) => {
    if (reviewPictures[index].word === question.answer) button.classList.add('correct');
    button.disabled = true;
  });
}

function continueAfterReview() {
  const index = nextCourseWord();
  if (index === undefined) showLearningPath(pathPage);
  else openWordLesson(index);
}
