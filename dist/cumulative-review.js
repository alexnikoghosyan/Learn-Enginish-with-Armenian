let activeReview = null;
let reviewQuestions = [];
let pictureSelectionIndex = null;
let reviewChecked = false;
let reviewPictures = [];
let reviewInputMode = 'typing';
let reviewBankChoices = [];

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
    const firstOfWord = questions.length;
    const meaning = hy(word) || state.wordLessons[index]?.explanation?.trim() || (typeof WORD_HINTS_HY !== 'undefined' && WORD_HINTS_HY[word.en]) || word.mt || word.en;
    const armenian = /[\u0531-\u0587]/.test(meaning);
    const example = curatedExamples[word.en];
    questions.push({ type: 'cloze', prompt: clozeForWord(word, meaning), answer: word.en, meaning,
      sentence: example?.[1] ? example : null });
    if (armenian) {
      questions.push({ type: 'to-en', prompt: meaning, answer: word.en });
      questions.push({ type: 'to-hy', prompt: word.en, answer: meaning });
    }
    const picture = pictureForReview(word);
    if (picture) questions.push({ type: 'picture', prompt: word.en, answer: word.en, picture });
    for (let i = firstOfWord; i < questions.length; i++) questions[i].index = index;
  }
  return questions;
}

function startCumulativeReview() {
  lessonAnswerStreak = 0;
  beginLessonCounters('review');
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
    if (saved.practice && typeof practicePick === 'function') reviewQuestions = practicePick(reviewQuestions);
    reviewQuestions.forEach((question, index) => { question.base = index; });
    // Սխալ պատասխանված հարցերը կրկնվում են վերջում (պահված են, որ էջը թարմացնելիս չկորչեն)
    for (const index of saved.retry || []) {
      if (reviewQuestions[index]) reviewQuestions.push({ ...reviewQuestions[index], retry: true });
    }
  }
  drawReviewQuestion();
  window.scrollTo(0, 0);
}

function drawReviewQuestion(mode = 'typing') {
  reviewChecked = false;
  pictureSelectionIndex = null;
  const cursor = activeReview.cursor;
  const question = reviewQuestions[cursor];
  if (!question) {
    reviewWasPractice = !!activeReview.practice;
    if (reviewWasPractice) {
      state.practiceXp = (state.practiceXp || 0) + SRS_PRACTICE_XP;
      logXp(SRS_PRACTICE_XP);
    }
    delete state.cumulativeReview;
    recordStudyDay();
    save();
    activeReview = null;
    app.innerHTML = '<h1>Կրկնություն</h1><section class="panel word-lesson-panel"><div class="lesson-reward is-new">' +
      '<span class="reward-medal" aria-hidden="true">' + gardenIllustration('medal') + '</span><div><strong>Կրկնությունն ավարտված է։</strong>' +
      '<small>' + (reviewWasPractice ? 'Կրկնեցիր քո ամենաթույլ բառերը։' : 'Կրկնեցիր անցած բոլոր բառերը։') + '</small>' + rewardChips(false, finishLessonCounters(), reviewWasPractice ? SRS_PRACTICE_XP : 0) + '</div></div><div class="tools">' +
      '<button class="primary" onclick="continueAfterReview()">' +
      (reviewWasPractice ? 'Վերադառնալ կրկնությանը →' : nextCourseWord() !== undefined ? 'Հաջորդ բառը →' : 'Վերադառնալ ճանապարհին →') +
      '</button></div></section>';
    return;
  }
  reviewInputMode = mode;
  const labels = {
    cloze: 'Լրացրու բաց թողած բառը', 'to-en': 'Գրիր անգլերեն տարբերակը',
    'to-hy': 'Գրիր հայերեն տարբերակը', picture: 'Ընտրիր բառին համապատասխան պատկերը'
  };
  const language = question.type === 'to-hy' ? 'hy' : 'en';
  const inlineAnswer = question.type === 'cloze' && mode === 'typing';
  const input = '<input id="review-answer" aria-label="Քո պատասխանը" oninput="updateReviewCheck()" autocomplete="off" spellcheck="false" maxlength="300" lang="' + language + '">';
  let exercise = '<label for="review-answer">Քո պատասխանը</label><textarea id="review-answer" rows="3" maxlength="300" ' +
    'oninput="updateReviewCheck()" spellcheck="false" lang="' + language + '"></textarea>';
  if (inlineAnswer) {
    const [before, after] = question.prompt.split('_____');
    exercise = '<div class="review-inline-answer" lang="en">' + esc(before) + input + esc(after || '') + '</div>';
  } else if (mode === 'bank') {
    const source = question.type === 'to-hy' ? WORDS.filter(word => hy(word)).map(word => hy(word)) : WORDS.map(word => word.en);
    const seen = new Set([normalizeReviewAnswer(question.answer)]);
    const choices = [question.answer];
    for (const option of shuffled(source)) {
      const key = normalizeReviewAnswer(option);
      if (!key || seen.has(key)) continue;
      choices.push(option);
      seen.add(key);
      if (choices.length === 4) break;
    }
    reviewBankChoices = shuffled(choices);
    exercise = '<input type="hidden" id="review-answer"><div class="review-bank" role="group" aria-label="Բառերի բանկ">' +
      reviewBankChoices.map((option, index) => '<button type="button" class="secondary" aria-pressed="false" lang="' +
        language + '" onclick="pickReviewWord(' + index + ')">' + esc(option) + '</button>').join('') + '</div>';
  }
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
      '" onclick="selectReviewPicture(' + index + ')">' + pictureArt(picture.emoji, picture.shape, picture.word) + '</button>'
    ).join('') + '</div>';
  }
  app.innerHTML = focusLessonHeader(cursor, reviewQuestions.length, 'vocabulary') +
    '<h1>Կրկնություն</h1><section class="panel word-lesson-panel review-panel">' +
    '<small' + (question.retry ? ' class="retry-label">Կրկնենք սխալը · ' : '>') + 'Հարց ' + (cursor + 1) + ' / ' + reviewQuestions.length + ' · ' + activeReview.words.length + ' բառ</small>' +
    '<h2>' + (mode === 'sentence' ? 'Գրիր ամբողջ նախադասությունն անգլերենով' : labels[question.type]) + '</h2><div class="review-prompt' +
    (question.type === 'to-hy' || mode === 'sentence' ? ' with-bear' : '') + '" lang="' + (question.type === 'to-en' ? 'hy' : 'en') + '">' +
    (question.type === 'to-hy' || question.type === 'picture' ?
      (question.type === 'to-hy' ? lessonBear() : '') +
      '<button type="button" class="secondary lesson-speech" data-speak="' + esc(question.prompt) + '">' +
    actionIcon('speaker') + '<span>' + esc(question.prompt) + '</span></button>' :
      mode === 'sentence' ? lessonBear() + '<span class="review-hint-bubble" lang="hy">' + esc(question.sentence[1]) + '</span>' :
      inlineAnswer ? '<span class="review-hint-bubble" lang="hy">' + esc(question.meaning) + '</span>' : esc(question.prompt)) +
    '</div><form onsubmit="event.preventDefault();checkReviewAnswer()">' + exercise +
    '<p id="review-feedback" role="status"></p><div class="tools lesson-controls">' +
    '<button class="primary" id="review-check" disabled>Ստուգել</button>' +
    '<button type="button" class="secondary" id="review-reveal" onclick="revealReviewAnswer()">Բաց թողնել</button>' +
    (question.type === 'picture' ? '' : '<button type="button" class="text-button" id="review-mode" onclick="drawReviewQuestion(\'' +
      (mode !== 'typing' ? 'typing' : question.sentence ? 'sentence' : 'bank') + '\')">' +
      (mode === 'sentence' ? 'Պարզեցնել առաջադրանքը' : mode === 'bank' ? 'Գրել ինքնուրույն' :
        question.sentence ? 'Դժվարացնել առաջադրանքը' : gardenIllustration('tiles') + 'Օգտագործել բառերի բանկը') + '</button>') +
    '</div></form></section>';
  paintLessonAnswerStreak();
}

function pickReviewWord(index) {
  if (reviewChecked) return;
  document.getElementById('review-answer').value = reviewBankChoices[index];
  app.querySelectorAll('.review-bank button').forEach((button, position) =>
    button.setAttribute('aria-pressed', String(index === position)));
  updateReviewCheck();
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
  if (lessonTransitionRunning) return;
  if (reviewChecked) {
    activeReview.cursor++;
    save();
    transitionLesson(drawReviewQuestion);
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
  const accepted = reviewInputMode === 'sentence' ? [question.sentence[0]] : question.type === 'to-hy' ?
    [question.answer, ...question.answer.replace(/\([^)]*\)/g, '').split(/[,;،/՝]/)] : [question.answer];
  if (accepted.some(answer => normalizeReviewAnswer(answer) === normalizeReviewAnswer(value))) {
    recordLessonAnswer(true);
    srsRecord(question.index, true);
    recordReviewCorrect();
    syncQuests();
    finishReviewQuestion('Ճիշտ է։ ✓');
  } else {
    markReviewWrong();
  }
}

// Սխալ պատասխան կամ «Բաց թողնել». ցույց ենք տալիս ճիշտ պատասխանը, անցնում ենք առաջ,
// իսկ հարցը կրկին կտրվի կրկնության վերջում (մինչև ճիշտ պատասխանվի)։
function markReviewWrong() {
  recordLessonAnswer(false);
  const question = reviewQuestions[activeReview.cursor];
  srsRecord(question.index, false);
  if (pictureSelectionIndex !== null) app.querySelectorAll('.review-grid button')[pictureSelectionIndex]?.classList.add('wrong');
  (activeReview.retry ??= []).push(question.base);
  reviewQuestions.push({ ...question, retry: true });
  save();
  const answer = reviewInputMode === 'sentence' ? question.sentence[0] : question.answer;
  finishReviewQuestion('', '<strong>Ճիշտ չէ։</strong> Ճիշտ պատասխանը՝ <span lang="' + (question.type === 'to-hy' ? 'hy' : 'en') + '">' +
    esc(answer) + '</span><small>Այս հարցը կկրկնենք վերջում։</small>');
}

function revealReviewAnswer() {
  if (reviewChecked) return;
  markReviewWrong();
}

function finishReviewQuestion(message, html = '') {
  reviewChecked = true;
  const feedback = document.getElementById('review-feedback');
  feedback.className = html ? 'answer-wrong' : 'answer-right';
  if (html) feedback.innerHTML = html;
  else feedback.textContent = message;
  document.getElementById('review-check').textContent = 'Շարունակել →';
  document.getElementById('review-check').disabled = false;
  document.getElementById('review-reveal').classList.add('hidden');
  document.getElementById('review-mode')?.classList.add('hidden');
  const question = reviewQuestions[activeReview.cursor];
  app.querySelectorAll('.review-grid button').forEach((button, index) => {
    if (reviewPictures[index].word === question.answer) button.classList.add('correct');
    button.disabled = true;
  });
}

function continueAfterReview() {
  if (reviewWasPractice) { reviewWasPractice = false; go('practice'); return; }
  const index = nextCourseWord();
  if (index === undefined) showLearningPath(pathPage);
  else openWordLesson(index);
}
