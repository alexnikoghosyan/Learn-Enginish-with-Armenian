function studyHome() {
  const grammarDone = LESSONS.filter((_, index) => state.lessons.includes(index)).length;
  const wordsDone = wordOrder.filter(index => state.wordLessons[index]?.done).length;
  const nextGrammar = LESSONS.findIndex((_, index) => !state.lessons.includes(index));
  const nextWord = wordOrder.find(index => !state.wordLessons[index]?.done);
  const grammarButton = nextGrammar < 0 ? "go('grammar')" : 'lesson(' + nextGrammar + ')';
  const wordButton = state.cumulativeReview ? 'startCumulativeReview()' : nextWord === undefined ? "go('vocabulary')" : 'resumeWordFromHome(' + nextWord + ')';
  app.innerHTML = `
    <div class="study-home">
      <header class="study-welcome">
        <h1>Սովորել</h1>
        <p>Ընտրիր քերականության կամ բառերի հաջորդ դասը։</p>
      </header>
      <div class="study-cards">
        <section class="panel study-card">
          <h2>Քերականություն</h2>
          <p>${grammarDone} / ${LESSONS.length} դաս ավարտված</p>
          <progress max="${LESSONS.length}" value="${grammarDone}" aria-label="Քերականության առաջընթաց"></progress>
          <p class="study-next">${nextGrammar < 0 ? 'Բոլոր դասերն ավարտված են։' : esc(LESSONS[nextGrammar].en)}</p>
          <button class="primary" onclick="${grammarButton}">${nextGrammar < 0 ? 'Վերանայել դասերը' : 'Շարունակել →'}</button>
          <button class="secondary" onclick="go('grammar')">Ուսուցման ճանապարհ</button>
        </section>
        <section class="panel study-card">
          <h2>Բառեր</h2>
          <p>${wordsDone} / ${WORDS.length} դաս ավարտված</p>
          <progress max="${WORDS.length}" value="${wordsDone}" aria-label="Բառերի առաջընթաց"></progress>
          <p class="study-next" lang="en">${nextWord === undefined ? '<span lang="hy">Բոլոր դասերն ավարտված են։</span>' : esc(WORDS[nextWord].en)}</p>
          <button class="primary" onclick="${wordButton}">${state.cumulativeReview ? 'Շարունակել կրկնությունը →' : nextWord === undefined ? 'Բացել ճանապարհը' : 'Շարունակել →'}</button>
          <button class="secondary" onclick="go('vocabulary')">Ուսուցման ճանապարհ</button>
        </section>
      </div>
    </div>`;
}

function resumeWordFromHome(index) {
  view = 'vocabulary';
  renderNavigation();
  openWordLesson(index);
}

function journal() {
  app.innerHTML = `
    <div class="study-home">
      <h1>Իմ գրառումները</h1>
      <label class="journal-label" for="journal-search">Որոնել գրառում</label>
      <input id="journal-search" type="search" placeholder="Բառ, բացատրություն կամ նախադասություն" oninput="drawJournalEntries(this.value)">
      <div id="journal-entries" aria-live="polite"></div>
    </div>`;
  drawJournalEntries('');
}

function drawJournalEntries(search) {
  const query = search.trim().toLowerCase();
  const entries = Object.entries(state.wordLessons).filter(([index, entry]) =>
    WORDS[index] && [entry.explanation, entry.sentence, entry.second].some(value => value?.trim())
  );
  const matches = entries.filter(([index, entry]) =>
    [WORDS[index].en, entry.explanation, entry.sentence, entry.second].some(value => value?.toLowerCase().includes(query))
  );
  const results = document.getElementById('journal-entries');
  if (!matches.length) {
    results.innerHTML = '<p class="muted">' + (entries.length ? 'Համապատասխան գրառում չկա։' : 'Բառի դասում գրածդ կհայտնվի այստեղ։') + '</p>';
    return;
  }
  results.innerHTML = matches.map(([index, entry]) => `
    <article class="panel journal-entry">
      <header><h2 lang="en">${esc(WORDS[index].en)}</h2><small>${entry.done ? 'Ավարտված' : 'Սևագիր'}</small></header>
      ${entry.explanation?.trim() ? '<p>' + esc(entry.explanation) + '</p>' : ''}
      ${[entry.sentence, entry.second].filter(value => value?.trim()).map(value => '<blockquote lang="en">' + esc(value) + '</blockquote>').join('')}
      <button class="secondary" onclick="resumeWordFromHome(${Number(index)})">Բացել բառի դասը →</button>
    </article>`).join('');
}
