// Ֆիզիկա 7. մաթեմատիկա, դասընթացի կառուցվածք, դասերի քայլեր և իրագործելիություն, գործիքների բեռնում (առանց DOM-ի)
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, statSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const files = ['physics-math.js', 'physics-course.js', 'physics-lessons.js', 'physics-lessons-2.js', 'physics-tools.js', 'physics-ruler.js',
  'physics-scale.js', 'physics-cylinder.js', 'physics-spring.js', 'physics-tank.js', 'physics-frames.js', 'physics-media.js', 'physics-steps.js'];
const context = vm.createContext({});
// const/let-ը vm-ում չեն դառնում context-ի հատկություն, ուստի արժեքները հանում ենք ձեռքով
vm.runInContext(files.map(name => readFileSync(new URL(name, root), 'utf8')).join('\n') +
  '\n;globalThis.api = { physParseNumber, physClose, physRound, physFormat, physDensity, physConvert, physGoalMet, physCalc, PHYS_CALC, PHYS_G,' +
  ' PHYSICS_COURSE, PHYSICS_LESSONS, PHYS_TOOLS, PHYS_MEASURE, PHYS_STEPS, PHYS_LIQUIDS, PHYSICS_MEDIA };', context);
const api = context.api;
const list = array => Array.from(array);
const lessons = Object.entries(api.PHYSICS_LESSONS);
const subsets = values => values.reduce((all, value) => all.concat(all.map(sum => sum + value)), [0]);

test('physParseNumber: ստորակետ, կետ, բացատ, մինուս', () => {
  assert.equal(api.physParseNumber('2,5'), 2.5);
  assert.equal(api.physParseNumber(' 2.5 '), 2.5);
  assert.equal(api.physParseNumber('−3'), -3);
  assert.ok(Number.isNaN(api.physParseNumber('2,5 սմ')));
});

test('physClose, physRound, physFormat', () => {
  assert.ok(api.physClose(7.31, 7.3, 0.02));
  assert.ok(!api.physClose(7.4, 7.3, 0.02));
  assert.ok(api.physClose(102, 100, { rel: 0.02 }));
  assert.equal(api.physRound(7.34, 0.1), 7.3);
  assert.equal(api.physRound(5.39, 0.2), 5.4);
  assert.equal(api.physFormat(7.3, 0.1), '7,3');
  assert.equal(api.physFormat(5, 1), '5');
});

test('բանաձևեր և միավորների փոխարկում', () => {
  assert.equal(api.physDensity(540, 200), 2.7);
  assert.equal(api.physConvert(530, 'գ', 'կգ'), 0.53);
  assert.equal(api.physConvert(2700, 'կգ/մ³', 'գ/սմ³'), 2.7);
  assert.equal(api.physConvert(1, 'լ', 'սմ³'), 1000);
  assert.ok(Number.isNaN(api.physConvert(1, 'մ', 'կգ')));
  assert.equal(api.physCalc({ fn: 'physHydro', args: [1000, 0.3] }), 3000);
  assert.ok(api.physClose(api.physCalc({ fn: 'physStiffness', args: [2, 0.04] }), 50));
  assert.equal(api.PHYS_G, 10);
});

test('physGoalMet', () => {
  const goal = [{ key: 'aligned', value: true }, { key: 'reading', value: 7.3, tol: 0.001 }];
  assert.ok(api.physGoalMet(goal, { aligned: true, reading: 7.3 }));
  assert.ok(!api.physGoalMet(goal, { aligned: false, reading: 7.3 }));
  assert.ok(!api.physGoalMet(goal, { aligned: true, reading: 7.4 }));
});

test('դասընթացի կառուցվածք. 6 գլուխ, 55 §, էջերն աճող', () => {
  const chapters = api.PHYSICS_COURSE.chapters;
  assert.equal(chapters.length, 6);
  assert.deepEqual(list(chapters.map(chapter => chapter.page)), [5, 23, 42, 60, 99, 118]);
  const sections = chapters.flatMap(chapter => chapter.sections);
  assert.equal(sections.length, 55);
  sections.forEach((section, index) => assert.equal(section.n, index + 1));
  sections.slice(1).forEach((section, index) => assert.ok(section.page >= sections[index].page, '§' + section.n));
  assert.deepEqual(list(sections.filter(section => section.kind === 'lab').map(section => section.n)), [5, 9, 18, 21, 26, 29, 35, 39, 47, 51, 52]);
  assert.equal(sections.filter(section => section.kind === 'problems').length, 8);
  assert.equal(new Set(sections.map(section => section.id)).size, 55);
});

test('փորձնական դասեր. §4, 5, 19, 20, 21, 22, 25, 26, 43', () => {
  assert.deepEqual(list(Object.keys(api.PHYSICS_LESSONS)).sort(), ['s19', 's20', 's21', 's22', 's25', 's26', 's4', 's43', 's5']);
});

test('դասերի քայլեր. հայտնի տեսակներ, ավարտվում են recap-ով, ≥ 1/3 ինտերակտիվ, կարճ տեքստ', () => {
  const ids = new Set(api.PHYSICS_COURSE.chapters.flatMap(chapter => chapter.sections.map(section => section.id)));
  for (const [id, steps] of lessons) {
    assert.ok(ids.has(id), id + ' քարտեզում չկա');
    assert.equal(steps[steps.length - 1].k, 'recap', id);
    assert.equal(steps.filter(step => step.k === 'recap').length, 1, id);
    const interactive = steps.filter(step => !['explain', 'recap'].includes(step.k)).length;
    assert.ok(interactive * 3 >= steps.length, id + ': քիչ ինտերակտիվ քայլ');
    for (const step of steps) {
      assert.ok(step.k in api.PHYS_STEPS, id + ': ' + step.k);
      if (step.text) assert.ok(step.text.split(/[։.]/).filter(Boolean).length <= 2, id + ': երկար տեքստ');
      if (step.k === 'recap') assert.equal(step.points.length, 3, id);
      if (!['explain', 'recap', 'scrub'].includes(step.k)) assert.ok(step.why, id + ' ' + step.k + ': why չկա');
      if (['sim', 'choice', 'numeric', 'table'].includes(step.k)) assert.ok(step.hint, id + ' ' + step.k + ': hint չկա');
    }
  }
});

test('choice / predict. պատասխանի ինդեքսը ճիշտ է', () => {
  for (const [id, steps] of lessons) {
    for (const step of steps.filter(item => ['choice', 'predict'].includes(item.k))) {
      assert.ok(step.options.length >= 2, id);
      assert.ok(Number.isInteger(step.answer) && step.answer >= 0 && step.answer < step.options.length, id + ': ' + step.q);
    }
  }
});

test('numeric / table. calc-երը վերջավոր են, միավորը տարբերակների մեջ է', () => {
  for (const [id, steps] of lessons) {
    for (const step of steps.filter(item => item.k === 'numeric')) {
      const expected = step.calc ? api.physCalc(step.calc) : step.answer;
      assert.ok(Number.isFinite(expected), id + ': ' + step.q);
      assert.ok(step.units.includes(step.unit), id + ': միավոր');
    }
    for (const step of steps.filter(item => item.k === 'table')) {
      let inputs = 0;
      for (const row of step.rows) {
        assert.equal(row.length, step.columns.length, id);
        for (const cell of row.filter(item => typeof item === 'object')) {
          inputs++;
          assert.ok(Number.isFinite(cell.calc ? api.physCalc(cell.calc) : cell.ans), id);
        }
      }
      assert.ok(inputs > 0, id);
    }
  }
});

test('գործիքները բեռնվում են առանց DOM-ի', () => {
  for (const tool of ['measure', 'spring', 'tank', 'frames']) assert.equal(typeof api.PHYS_TOOLS[tool].mount, 'function', tool);
  for (const mode of ['ruler', 'scale', 'cylinder']) assert.equal(typeof api.PHYS_MEASURE[mode].mount, 'function', mode);
});

// Ամեն sim-ի նպատակը պետք է լինի հասանելի այդ գործիքի պարամետրերով
const KEYS = { ruler: ['aligned', 'reading'], scale: ['mass', 'cut'], cylinder: ['reading', 'V'], spring: ['F', 'saved', 'points', 'forces'], tank: ['h', 'rho', 'dirs'] };
test('sim-ի նպատակները հնարավոր են', () => {
  for (const [id, steps] of lessons) {
    for (const step of steps.filter(item => item.k === 'sim')) {
      const { params, goal } = step;
      const kind = step.tool === 'measure' ? params.mode : step.tool;
      assert.ok(KEYS[kind], id + ': ' + kind);
      const find = key => goal.find(condition => condition.key === key);
      goal.forEach(condition => assert.ok(KEYS[kind].includes(condition.key), id + ': ' + condition.key));
      if (kind === 'ruler') {
        const reading = find('reading').value;
        assert.equal(reading, params.objectLength);
        assert.ok(Math.abs(reading / params.division - Math.round(reading / params.division)) < 1e-9, id);
      } else if (kind === 'scale') {
        if (find('mass')) assert.ok(subsets(params.items.map(item => item.m)).includes(find('mass').value), id + ': mass');
        if (find('cut')) assert.ok(params.cut, id);
      } else if (kind === 'cylinder') {
        const bodies = (params.bodies || []).map(body => body.V);
        if (find('V')) assert.ok(subsets(bodies).includes(find('V').value), id + ': V');
        const reading = find('reading').value;
        assert.ok(subsets(bodies).includes(reading - params.water), id + ': reading');
        assert.ok(reading <= params.capacity && Math.abs(reading / params.division - Math.round(reading / params.division)) < 1e-9, id);
      } else if (kind === 'spring') {
        const g = api.PHYS_G;
        const forces = [1, 2, 3, 4, 5].map(count => Number((count * 0.1 * g).toFixed(3)));
        if (find('F')) assert.ok(forces.some(force => Math.abs(force - find('F').value) < 1e-9), id + ': F');
        if (find('points')) assert.ok(find('points').value <= forces.length, id);
        if (find('forces')) find('forces').value.split(',').forEach(force => assert.ok(forces.includes(Number(force)), id + ': ' + force));
      } else if (kind === 'tank') {
        if (find('h')) assert.ok(find('h').value <= (params.level ?? 40), id);
        if (find('rho')) assert.ok(list(api.PHYS_LIQUIDS.filter(item => (params.liquids || ['Ջուր']).includes(item.name)).map(item => item.rho)).includes(find('rho').value), id);
        if (find('dirs')) assert.ok(params.dirs && find('dirs').value <= 3, id);
      }
    }
  }
});

test('դասերի թվային պատասխանները համապատասխանում են գործիքների ֆիզիկային', () => {
  // §25, §43. 2 Ն ուժի դեպքում k = 50 Ն/մ-ով ձգումը 0,04 մ է. 30 սմ ջրի ճնշումը 3000 Պա է
  assert.ok(api.physClose(2 / 50, 0.04));
  assert.equal(api.physCalc({ fn: 'physHydro', args: [13600, 0.1] }), 13600);
  assert.ok(api.physClose(api.physCalc({ fn: 'physDensity', args: [130, 50] }), 2.6, 1e-9));
});

test('մեդիա. ամեն scrub քայլի թերթը կա dist/-ում և ≤ 400 KB, կադրերը ≤ 30', () => {
  const media = api.PHYSICS_MEDIA;
  for (const [name, entry] of Object.entries(media)) {
    assert.equal(entry.type, 'frames', name);
    assert.ok(entry.frames <= 30 && entry.w <= 400 && entry.h <= 400, name);
    assert.ok(statSync(new URL(entry.src.slice(1), root)).size <= 400 * 1024, name);
  }
  for (const [id, steps] of lessons) {
    for (const step of steps.filter(item => item.k === 'scrub')) assert.ok(media[step.media], id + ': ' + step.media);
  }
});
