// build քայլ. բանաձևը հավաքել բլոկներից (հպումով). { q, options: բլոկները (խառը, ավելորդներով), answer: ճիշտ հերթականությունը, hint, why }
// Բանկի բլոկին սեղմելիս այն ավելանում է բանաձևին, բանաձևի բլոկին սեղմելիս՝ վերադառնում է։
const physBlockHtml = text => '<span>' + (text === '/' ? ':' : physFormula(text)) + '</span>'; // span՝ որ flex-ը ինդեքսը չբաժանի
const physBuildMet = (step, picked) => picked.map(i => step.options[i]).join(' ') === step.answer.join(' ');

function drawPhysicsBuild(step) {
  const { built } = physLesson;
  const block = (i, action, hidden) => '<button type="button" class="option phys-block" onclick="' + action + '(' + i + ')"' + (hidden ? ' disabled' : '') + '>' + physBlockHtml(step.options[i]) + '</button>';
  app.querySelector('.phys-built').innerHTML = built.map(i => block(i, 'dropPhysicsBlock')).join('');
  app.querySelector('.phys-bank').innerHTML = step.options.map((_, i) => block(i, 'addPhysicsBlock', built.includes(i))).join('');
  app.querySelector('#phys-main').disabled = !built.length;
}

function addPhysicsBlock(i) {
  physLesson.built.push(i);
  drawPhysicsBuild(physLesson.steps[physLesson.i]);
}

function dropPhysicsBlock(i) {
  physLesson.built = physLesson.built.filter(item => item !== i);
  drawPhysicsBuild(physLesson.steps[physLesson.i]);
}

PHYS_STEPS.build = {
  graded: true,
  html: step => physQuestion(step) + '<div class="phys-built" role="group" aria-label="Քո բանաձևը" aria-live="polite"></div><div class="phys-bank" role="group" aria-label="Բլոկներ"></div>',
  mount(step) { physLesson.built = []; drawPhysicsBuild(step); },
  check: step => physBuildMet(step, physLesson.built),
  reveal(step, ok) {
    app.querySelectorAll('.phys-block').forEach(button => { button.disabled = true; });
    const row = app.querySelector('.phys-built');
    if (!ok) row.innerHTML = step.answer.map(text => '<span class="option phys-block">' + physBlockHtml(text) + '</span>').join('');
    row.classList.add('is-done');
  }
};
