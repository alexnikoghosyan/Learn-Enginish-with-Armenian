// Դասի քայլերի տեսակները (տե՛ս PLAN.md). Ամեն տեսակ՝ { html(step), mount?(step), check?(step) → bool, graded?, once?, reveal?(step, ok) }
// check չունեցող տեսակները միայն ցուցադրվում են («Շարունակել»)։ once՝ կանխատեսում, ստուգվում է մեկ անգամ և չի գնահատվում։
const physOptions = step => '<div class="phys-options" role="group" aria-label="Պատասխանի տարբերակներ">' + step.options.map((option, index) =>
  '<button type="button" class="option phys-choice" aria-pressed="false" onclick="pickPhysicsOption(' + index + ')">' + esc(option) + '</button>').join('') + '</div>';

function pickPhysicsOption(index) {
  physLesson.picked = index;
  app.querySelectorAll('.phys-choice').forEach((button, position) => button.setAttribute('aria-pressed', position === index));
  app.querySelector('#phys-main').disabled = false;
}

function revealPhysicsOptions(step) {
  app.querySelectorAll('.phys-choice').forEach((button, position) => {
    button.disabled = true;
    if (position === step.answer) button.classList.add('correct');
    else if (position === physLesson.picked) button.classList.add('wrong');
  });
}

const physInput = (label, attrs = '') => '<input type="text" inputmode="decimal" autocomplete="off" class="phys-input" aria-label="' + label + '"' + attrs + '>';
const physNumberOf = input => physParseNumber(input.value);

// Աղյուսակի բջիջ՝ թիվ/տեքստ (ցուցադրվում է) կամ { ans, tol? } / { calc, tol? } (լրացվող)
function physCellValue(cell) {
  return cell.calc ? physCalc(cell.calc) : cell.ans;
}

const PHYS_STEPS = {
  explain: { html: step => '<p class="phys-text">' + esc(step.text) + '</p>' },
  recap: { html: step => '<h2>Դասի ամփոփում</h2><ul class="phys-recap">' + step.points.map(point => '<li>' + esc(point) + '</li>').join('') + '</ul>' },
  sim: {
    graded: true,
    html: step => '<p class="phys-task">' + esc(step.task) + '</p><div class="phys-tool"></div>',
    mount(step) { physLesson.tool = PHYS_TOOLS[step.tool].mount(app.querySelector('.phys-tool'), step.params, () => {}); },
    check: step => physGoalMet(step.goal, physLesson.tool.value())
  },
  scrub: {
    html: step => '<p class="phys-task">' + esc(step.caption) + '</p><div class="phys-tool"></div>',
    mount(step) { physLesson.tool = PHYS_TOOLS.frames.mount(app.querySelector('.phys-tool'), { media: step.media, label: step.label }, () => {}); }
  },
  choice: {
    graded: true,
    html: step => '<p class="phys-task">' + esc(step.q) + '</p>' + physOptions(step),
    mount() { app.querySelector('#phys-main').disabled = true; },
    check: step => physLesson.picked === step.answer,
    reveal: revealPhysicsOptions
  },
  predict: {
    once: true,
    html: step => '<p class="phys-task">' + esc(step.q) + '</p>' + physOptions(step),
    mount() { app.querySelector('#phys-main').disabled = true; },
    check: step => physLesson.picked === step.answer,
    reveal: revealPhysicsOptions
  },
  numeric: {
    graded: true,
    html: step => '<p class="phys-task">' + esc(step.q) + '</p><div class="phys-numeric">' + physInput('Պատասխան') +
      (step.units ? '<select class="phys-unit" aria-label="Միավոր">' + step.units.map(unit => '<option>' + esc(unit) + '</option>').join('') + '</select>' : '') + '</div>',
    check(step) {
      const expected = step.calc ? physCalc(step.calc) : step.answer;
      const unit = app.querySelector('.phys-unit');
      return physClose(physNumberOf(app.querySelector('.phys-input')), expected, step.tol ?? 0) && (!unit || unit.value === step.unit);
    }
  },
  table: {
    graded: true,
    html: step => '<p class="phys-task">' + esc(step.q) + '</p><div class="phys-table-wrap"><table class="phys-table"><thead><tr>' +
      step.columns.map(column => '<th scope="col">' + esc(column) + '</th>').join('') + '</tr></thead><tbody>' +
      step.rows.map((row, r) => '<tr>' + row.map((cell, c) => '<td>' + (typeof cell === 'object' ?
        physInput(esc(step.columns[c]), ' data-cell="' + r + ':' + c + '" size="5"') : esc(cell)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>',
    check: step => [...app.querySelectorAll('[data-cell]')].every(input => {
      const [r, c] = input.dataset.cell.split(':').map(Number);
      const cell = step.rows[r][c];
      return physClose(physNumberOf(input), physCellValue(cell), cell.tol ?? 0);
    })
  }
};
