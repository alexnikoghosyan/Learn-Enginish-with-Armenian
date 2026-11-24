// Ֆիզիկա 7. մաթեմատիկա, անիմացիաների օգնականներ, տեքստի օգնականներ, հերթականություն, դասերի ձև, արժեքների ցուցակներ,
// նկարներ/սխեմաներ/կերպարներ, անիմացիաներ, գործիքների բեռնում (առանց DOM-ի, node:vm)
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, statSync, existsSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const src = new URL('../physics-src/', import.meta.url);
const files = ['physics-math.js', 'physics-text.js', 'physics-course.js', 'physics-lessons.js', 'physics-lessons-2.js', 'physics-lessons-3.js', 'physics-tools.js',
  'physics-art.js', 'physics-art-2.js', 'physics-sprites.js', 'physics-nodes-art.js', 'physics-nodes.js', 'physics-ruler.js', 'physics-scale.js', 'physics-cylinder.js', 'physics-spring.js', 'physics-tank.js', 'physics-frames.js',
  'physics-figs.js', 'physics-anim.js', 'physics-anims.js', 'physics-anims-2.js', 'physics-media.js', 'physics-steps.js'];
const read = names => names.map(name => readFileSync(new URL(name, root), 'utf8')).join('\n');
// const/let-ը vm-ում չեն դառնում context-ի հատկություն, ուստի արժեքները հանում ենք ձեռքով
function load(names, exports, globals = {}) {
  const context = vm.createContext({ ...globals });
  vm.runInContext(read(names) + '\n;globalThis.api = { ' + exports + ' };', context);
  return context.api;
}
const api = load(files, 'physParseNumber, physCleanNumber, physClose, physRound, physFormat, physDensity, physConvert, physGoalMet, physCalc, PHYS_G, physPhase, physEase, physTween, physLerpColor, physSpring, ' +
  'physRich, physFormula, physGivenHtml, physLinesHtml, physHeroHtml, PHYSICS_COURSE, PHYSICS_LESSONS, PHYS_TOOLS, PHYS_MEASURE, PHYS_STEPS, PHYS_LIQUIDS, PHYSICS_MEDIA, PHYSICS_IMAGES, ' +
  'PHYS_FIGS, PHYS_ART, PHYS_ANIMS, PHYS_LESSON_ART_PLAN, PHYS_NODE_ART, PHYS_NODE_META, physNodeStopHtml, physCardHtml, physSprite, physCubeHalvesSvg, PHYS_PENCIL_CUTS', { matchMedia: () => ({ matches: false }), esc: text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])) });
const list = array => Array.from(array);
const lessons = Object.entries(api.PHYSICS_LESSONS);
const steps = lessons.flatMap(([id, items]) => items.map((step, index) => ({ id, index, step })));
const subsets = values => values.reduce((all, value) => all.concat(all.map(sum => sum + value)), [0]);
const imageList = JSON.parse(readFileSync(new URL('image-list.json', src), 'utf8'));

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
});

test('բանաձևեր և միավորների փոխարկում', () => {
  assert.equal(api.physDensity(540, 200), 2.7);
  assert.equal(api.physConvert(530, 'գ', 'կգ'), 0.53);
  assert.equal(api.physConvert(2700, 'կգ/մ³', 'գ/սմ³'), 2.7);
  assert.equal(api.physConvert(1500, 'մլ', 'լ'), 1.5);
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

test('անիմացիայի օգնականներ. physPhase, physEase, physTween, physLerpColor (սահմանային արժեքներ, clamp)', () => {
  assert.equal(api.physPhase(-5, 0, 10), 0);
  assert.equal(api.physPhase(15, 0, 10), 1);
  assert.equal(api.physPhase(5, 0, 10), 0.5);
  for (const ease of Object.values(api.physEase)) { assert.ok(Math.abs(ease(0)) < 1e-9); assert.ok(Math.abs(ease(1) - 1) < 1e-9); }
  assert.equal(api.physTween(0, 0, 10, 20, 40, api.physEase.linear), 20);
  assert.equal(api.physTween(99, 0, 10, 20, 40, api.physEase.linear), 40);
  assert.equal(api.physTween(5, 0, 10, 0, 100, api.physEase.linear), 50);
  assert.equal(api.physLerpColor('#000000', '#ffffff', 0), '#000000');
  assert.equal(api.physLerpColor('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(api.physLerpColor('#000000', '#ffffff', 5), '#ffffff');
});

test('զսպանակաձև շարժում. physSpring(0) = 0, մեծ t-ում → 1, անցնում է նպատակից', () => {
  assert.equal(api.physSpring(0), 0);
  assert.ok(Math.abs(api.physSpring(6) - 1) < 0.01);
  let peak = 0;
  for (let t = 0; t < 2; t += 0.01) peak = Math.max(peak, api.physSpring(t));
  assert.ok(peak > 1, 'չի անցնում նպատակից');
});

test('տեքստի օգնականներ. **թավ**, թեք նշաններ, ինդեքսներ, escape, ստորակետով թվեր', () => {
  assert.equal(api.physRich('ա **բ** գ'), 'ա <strong>բ</strong> գ');
  assert.ok(api.physRich('<b>').includes('&lt;b&gt;'));
  assert.ok(api.physFormula('ρ = m / V').includes('<i>ρ</i>') && api.physFormula('ρ = m / V').includes('<i>m</i>'));
  assert.ok(api.physFormula('V₁ և V₂').includes('<i>V</i><sub>1</sub>'));
  const html = api.physGivenHtml({ given: [['m', 540, 'գ'], ['V', 0.5, 'մ³']], find: 'ρ', steps: ['ρ = m / V', 'ρ = 540 / 200'] });
  for (const part of ['Տրված է՝', 'Գտնել՝', 'Լուծում՝', 'phys-solution', '0,5 մ³', '540 գ']) assert.ok(html.includes(part), part);
  assert.ok(api.physLinesHtml(['ա', 'բ']).startsWith('<ul class="phys-lines">'));
  assert.ok(!api.physLinesHtml('ա').includes('<ul'));
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
});

// ---------- Հերթականություն (խիստ §1 → §55) ----------
const sequenceFiles = ['physics-math.js', 'physics-text.js', 'physics-course.js', 'physics-lessons.js', 'physics-lessons-2.js', 'physics-lessons-3.js', 'physics-lesson.js', 'physics.js'];
function sequence(ids) {
  const context = vm.createContext({ state: { physics: { done: Object.fromEntries(ids.map(id => [id, true])), at: {} } } });
  vm.runInContext(read(sequenceFiles) + '\n;globalThis.api = { physicsNext, physicsCanOpen, physicsStatus, physicsProgress, physicsSections };', context);
  return context.api;
}

test('հերթականություն. դատարկ վիճակում հաջորդը §1 է, և բացվում է միայն այն', () => {
  const seq = sequence([]);
  assert.equal(seq.physicsNext().id, 's1');
  const sections = seq.physicsSections();
  assert.deepEqual(list(sections.filter(section => seq.physicsCanOpen(section)).map(section => section.id)), ['s1']);
  assert.deepEqual(list(sections.filter(section => seq.physicsStatus(section, seq.physicsNext()) === 'current').map(section => section.id)), ['s1']);
});

test('հերթականություն. §1–§3 ավարտված → §4', () => {
  assert.equal(sequence(['s1', 's2', 's3']).physicsNext().id, 's4');
});

test('հերթականություն. հերթից դուրս ավարտված §20-ը չի փոխում հերթականությունը, բայց կարելի է կրկնել', () => {
  const seq = sequence(['s20']);
  assert.equal(seq.physicsNext().id, 's1');
  const s20 = seq.physicsSections().find(section => section.id === 's20');
  assert.ok(seq.physicsCanOpen(s20));
  assert.equal(seq.physicsStatus(s20, seq.physicsNext()), 'done');
  assert.ok(!seq.physicsCanOpen(seq.physicsSections().find(section => section.id === 's19')), 'չավարտված §19-ը պետք է կողպված լինի');
});

test('հերթականություն. պատրաստ չեղած հաջորդի դեպքում ոչինչ current չէ', () => {
  const done = ['s1', 's2', 's3', 's4', 's5', 's6'];
  const seq = sequence(done);
  assert.equal(seq.physicsNext().id, 's7');
  const sections = seq.physicsSections();
  assert.ok(sections.every(section => seq.physicsStatus(section, seq.physicsNext()) !== 'current'));
  assert.ok(!sections.some(section => !done.includes(section.id) && seq.physicsCanOpen(section)));
  assert.deepEqual({ ...seq.physicsProgress() }, { total: 55, done: 6 });
});

// ---------- Դասերի ձև ----------
test('փորձնական դասեր. §1–6, 19–22, 25, 26, 43 (13 դաս)', () => {
  assert.deepEqual(list(Object.keys(api.PHYSICS_LESSONS)).sort(), ['s1', 's19', 's2', 's20', 's21', 's22', 's25', 's26', 's3', 's4', 's43', 's5', 's6']);
});

test('I գլուխ. §1, §2, §3, §6 ունեն քայլեր և ավարտվում են recap-ով', () => {
  for (const id of ['s1', 's2', 's3', 's6']) {
    assert.ok(api.PHYSICS_LESSONS[id].length >= 6, id);
    assert.equal(api.PHYSICS_LESSONS[id].at(-1).k, 'recap', id);
  }
});

test('դասերի քայլեր. հայտնի տեսակներ, ավարտվում են recap-ով, ≥ 1/3 ինտերակտիվ, կարճ տեքստ', () => {
  const ids = new Set(api.PHYSICS_COURSE.chapters.flatMap(chapter => chapter.sections.map(section => section.id)));
  for (const [id, items] of lessons) {
    assert.ok(ids.has(id), id + ' քարտեզում չկա');
    assert.equal(items.at(-1).k, 'recap', id);
    assert.equal(items.filter(step => step.k === 'recap').length, 1, id);
    const interactive = items.filter(step => !['explain', 'recap', 'watch'].includes(step.k)).length;
    assert.ok(interactive * 3 >= items.length, id + ': քիչ ինտերակտիվ քայլ');
    assert.ok(items.length >= 5 && items.length <= 10, id + ': ' + items.length + ' քայլ');
  }
  for (const { id, step } of steps) {
    assert.ok(step.k in api.PHYS_STEPS, id + ': ' + step.k);
    if (step.text) assert.ok(step.text.split(/[։.]/).filter(Boolean).length <= 2, id + ': երկար տեքստ');
    if (step.k === 'recap') assert.equal(step.points.length, 3, id);
    if (!['explain', 'recap', 'scrub', 'watch'].includes(step.k)) assert.ok(step.why, id + ' ' + step.k + ': why չկա');
    if (['sim', 'choice', 'numeric', 'table'].includes(step.k)) assert.ok(step.hint, id + ' ' + step.k + ': hint չկա');
  }
});

// ---------- Արժեքները ցուցակով ----------
const VALUE = /\d+(?:,\d+)?\s*(?:գ\/սմ³|կգ\/մ³|կՊա|Ն\/մ|սմ³|կգ|Պա|մմ|սմ|մլ|գ|մ|լ|Ն)(?![\p{L}])/gu;

test('արժեքներ. text/q/task/hint/why տողում երկու և ավելի «թիվ + միավոր» չկա (դրանք given/steps/lines/զանգվածներում են)', () => {
  for (const { id, index, step } of steps) {
    for (const key of ['text', 'q', 'task', 'hint', 'why', 'caption']) {
      if (typeof step[key] !== 'string') continue;
      const found = step[key].match(VALUE) || [];
      assert.ok(found.length < 2, id + '#' + index + ' ' + key + ': ' + found.join(' | ') + ' ← ' + step[key]);
    }
  }
});

test('given. յուրաքանչյուր տարր [նշան, թիվ, միավոր] է, find-ը տող է', () => {
  let count = 0;
  for (const { id, index, step } of steps.filter(item => item.step.given)) {
    count++;
    assert.ok(Array.isArray(step.given) && step.given.length >= 1, id);
    for (const item of step.given) {
      assert.equal(item.length, 3, id + '#' + index);
      assert.equal(typeof item[0], 'string');
      assert.equal(typeof item[1], 'number', id + '#' + index);
      assert.equal(typeof item[2], 'string');
    }
    if (step.find !== undefined) assert.equal(typeof step.find, 'string');
  }
  assert.ok(count >= 8, 'given-ը քիչ է օգտագործված');
  for (const { step } of steps.filter(item => item.step.steps)) step.steps.forEach(line => assert.equal(typeof line, 'string'));
});

test('choice / predict. պատասխանի ինդեքսը ճիշտ է', () => {
  for (const { id, step } of steps.filter(item => ['choice', 'predict'].includes(item.step.k))) {
    assert.ok(step.options.length >= 2, id);
    assert.ok(Number.isInteger(step.answer) && step.answer >= 0 && step.answer < step.options.length, id + ': ' + step.q);
  }
});

test('numeric / table. calc-երը վերջավոր են, միավորը տարբերակների մեջ է', () => {
  for (const { id, step } of steps.filter(item => item.step.k === 'numeric')) {
    assert.ok(Number.isFinite(step.calc ? api.physCalc(step.calc) : step.answer), id + ': ' + step.q);
    assert.ok(step.units.includes(step.unit), id + ': միավոր');
  }
  for (const { id, step } of steps.filter(item => item.step.k === 'table')) {
    let inputs = 0;
    for (const row of step.rows) {
      assert.equal(row.length, step.columns.length, id);
      for (const cell of row.filter(item => typeof item === 'object')) { inputs++; assert.ok(Number.isFinite(cell.calc ? api.physCalc(cell.calc) : cell.ans), id); }
    }
    assert.ok(inputs > 0, id);
  }
});

// ---------- Նկարներ, սխեմաներ, կերպարներ ----------
test('նկարներ. ամեն img/pics id կա PHYSICS_IMAGES-ում և Flow ցուցակում', () => {
  const used = new Set();
  for (const { id, step } of steps) {
    const toolImgs = [...(step.params?.items || []), ...(step.params?.bodies || [])].map(item => item.img).filter(Boolean);
    for (const name of [].concat(step.img || [], step.pics || [], toolImgs, step.params?.img || [])) {
      assert.ok(api.PHYSICS_IMAGES[name], id + ': ' + name + ' չկա PHYSICS_IMAGES-ում');
      assert.ok(imageList[name], id + ': ' + name + ' չկա image-list.json-ում');
      used.add(name);
    }
  }
  assert.ok(used.size >= 20, 'քիչ նկար է օգտագործված');
});

test('նկարներ. ամեն գրառում՝ .webp, հայերեն alt, ֆայլը կա և ≤ 25 KB', () => {
  const entries = Object.entries(api.PHYSICS_IMAGES);
  assert.ok(entries.length >= 34);
  for (const [name, entry] of entries) {
    assert.ok(imageList[name], name);
    assert.ok(entry.src.endsWith('.webp'), name + ': src');
    assert.ok(/[Ա-֏]/.test(entry.alt), name + ': alt հայերեն չէ');
    const file = new URL(entry.src.slice(1), root);
    assert.ok(existsSync(file), name + ': ֆայլը չկա');
    assert.ok(statSync(file).size <= 25 * 1024, name + ': > 25 KB');
  }
});

test('նկարներ. 6 գլուխների շապիկները կան, PHYS_LESSON_ART_PLAN-ի id-ները գոյություն ունեն', () => {
  const chapters = api.PHYSICS_COURSE.chapters;
  assert.equal(chapters.length, 6);
  chapters.forEach((chapter, index) => {
    assert.equal(chapter.cover, 'chapter-' + (index + 1) + '-cover');
    assert.ok(api.PHYSICS_IMAGES[chapter.cover], chapter.cover);
  });
  for (const name of ['home-card', 'lesson-complete']) assert.ok(api.PHYSICS_IMAGES[name], name);
  for (const name of Object.keys(api.PHYS_LESSON_ART_PLAN)) assert.ok(api.PHYSICS_IMAGES[name], name);
});

test('hero. նկարի բացակայության դեպքում hero չկա, fig/anim-ի դեպքում կա', () => {
  assert.equal(api.physHeroHtml({ img: 'ruler' }).includes('phys-img'), Boolean(api.PHYSICS_IMAGES.ruler));
  assert.ok(api.physHeroHtml({ fig: 'ruler-ticks' }).includes('<svg'));
  assert.ok(api.physHeroHtml({ anim: 'ruler-division' }).includes('phys-anim'));
  assert.equal(api.physHeroHtml({ text: 'ա' }), '');
});

test('սխեմաներ (fig). ամեն fig կա PHYS_FIGS-ում, svg()-ն <svg-ով սկսվող տող է, label-ը ոչ դատարկ', () => {
  for (const { id, step } of steps.filter(item => item.step.fig)) assert.ok(api.PHYS_FIGS[step.fig], id + ': ' + step.fig);
  for (const name of ['ruler-ticks', 'fx-graph', 'pressure-arrows', 'formula-card']) {
    assert.ok(api.PHYS_FIGS[name], name);
    assert.ok(api.PHYS_FIGS[name].svg().startsWith('<svg'), name);
    assert.ok(api.PHYS_FIGS[name].label.length > 0, name);
  }
});

const hexColors = svg => [...new Set(svg.match(/#[0-9a-fA-F]{6}/g) || [])].map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));

test('կերպարներ (PHYS_ART). ref-ը Flow ցուցակում է, build()-ը <svg-ով սկսվող տող է, գույները համընկնում են palette-ի հետ (եթե կա)', () => {
  const ids = ['spring', 'ruler', 'cube', 'scale', 'cylinder', 'stopwatch'];
  assert.deepEqual(list(Object.keys(api.PHYS_ART)).sort(), [...ids].sort());
  for (const id of ids) {
    const art = api.PHYS_ART[id];
    assert.ok(imageList[art.ref], id + ': ref ' + art.ref);
    const built = art.build({});
    assert.ok(built.svg.startsWith('<svg') && typeof built.parts === 'object', id);
    assert.ok(art.group({}).length > 50, id);
    const palette = new URL('palettes/' + art.ref + '.json', src);
    if (existsSync(palette)) {
      const colors = hexColors(built.svg);
      for (const variant of (art.colors || []).slice(0)) colors.push(...hexColors(art.build({ color: variant }).svg));
      for (const entry of JSON.parse(readFileSync(palette, 'utf8')).colors.filter(item => item.share >= 0.05)) {
        const rgb = [1, 3, 5].map(i => parseInt(entry.hex.slice(i, i + 2), 16));
        assert.ok(colors.some(color => Math.hypot(color[0] - rgb[0], color[1] - rgb[1], color[2] - rgb[2]) < 70), id + ': ' + entry.hex);
      }
    }
  }
  assert.ok(api.PHYS_ART.spring.build({ length: 150, loads: 2 }).parts.endY > api.PHYS_ART.spring.build({ length: 90, loads: 2 }).parts.endY);
});

// ---------- Անիմացիաներ ----------
test('անիմացիաներ. տևողություն 5–15 վ, kind, ենթագրերը դասավորված, draw()-ը աշխատում է բոլոր պահերին', () => {
  const ids = ['ruler-division', 'density-compare', 'spring-double', 'hydro-depth', 'fall-observe'];
  assert.deepEqual(list(Object.keys(api.PHYS_ANIMS)).sort(), [...ids].sort());
  for (const id of ids) {
    const anim = api.PHYS_ANIMS[id];
    assert.ok(anim.duration >= 5000 && anim.duration <= 15000, id);
    assert.ok(['svg', 'canvas'].includes(anim.kind), id);
    assert.ok(anim.label.length > 0, id);
    anim.cues.forEach((cue, index) => {
      assert.ok(cue.at < anim.duration, id + ' cue ' + index);
      assert.ok(cue.text || cue.html, id);
      if (index) assert.ok(cue.at > anim.cues[index - 1].at, id + ' cue-երի հերթականություն');
    });
    for (let t = 0; t <= anim.duration; t += 200) {
      const refs = { scene: {} };
      anim.draw(refs, t, {});
      assert.ok(typeof refs.scene.innerHTML === 'string' && refs.scene.innerHTML.length > 20, id + ' t=' + t);
    }
  }
});

test('anim/watch. ամեն watch.anim և explain.anim կա PHYS_ANIMS-ում, բոլոր 5 անիմացիաները օգտագործվում են', () => {
  const used = steps.filter(item => item.step.anim).map(item => item.step.anim);
  for (const name of used) assert.ok(api.PHYS_ANIMS[name], name);
  assert.deepEqual(list([...new Set(used)]).sort(), ['density-compare', 'fall-observe', 'hydro-depth', 'ruler-division', 'spring-double']);
  assert.ok(steps.some(item => item.id === 's25' && item.step.k === 'watch'));
});

test('նկարից անիմացիա անցում (24d). spring-double-ի և ruler-division-ի t = 0 կադրը պարունակում է կերպարի poster վիճակը', () => {
  const refs = { scene: {} };
  api.PHYS_ANIMS['spring-double'].draw(refs, 0, {});
  assert.ok(refs.scene.innerHTML.includes(api.PHYS_ART.spring.group(api.PHYS_ART.spring.poster)), 'զսպանակը «թռչում» է');
  api.PHYS_ANIMS['ruler-division'].draw(refs, 0, {});
  assert.ok(refs.scene.innerHTML.includes(api.PHYS_ART.ruler.group(api.PHYS_ART.ruler.poster)), 'քանոնը «թռչում» է');
});

test('գործիքները բեռնվում են առանց DOM-ի', () => {
  for (const tool of ['measure', 'spring', 'tank', 'frames']) assert.equal(typeof api.PHYS_TOOLS[tool].mount, 'function', tool);
  for (const mode of ['ruler', 'scale', 'cylinder']) assert.equal(typeof api.PHYS_MEASURE[mode].mount, 'function', mode);
});

// Ամեն sim-ի նպատակը պետք է լինի հասանելի այդ գործիքի պարամետրերով
const KEYS = { ruler: ['aligned', 'reading'], scale: ['mass', 'cut'], cylinder: ['reading', 'V'], spring: ['F', 'saved', 'points', 'forces'], tank: ['h', 'rho', 'dirs'] };
test('sim-ի նպատակները հնարավոր են', () => {
  for (const { id, step } of steps.filter(item => item.step.k === 'sim')) {
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
      const forces = [1, 2, 3, 4, 5].map(count => Number((count * 0.1 * api.PHYS_G).toFixed(3)));
      if (find('F')) assert.ok(forces.some(force => Math.abs(force - find('F').value) < 1e-9), id + ': F');
      if (find('points')) assert.ok(find('points').value <= forces.length, id);
      if (find('forces')) find('forces').value.split(',').forEach(force => assert.ok(forces.includes(Number(force)), id + ': ' + force));
    } else if (kind === 'tank') {
      if (find('h')) assert.ok(find('h').value <= (params.level ?? 40), id);
      if (find('rho')) assert.ok(list(api.PHYS_LIQUIDS.filter(item => (params.liquids || ['Ջուր']).includes(item.name)).map(item => item.rho)).includes(find('rho').value), id);
      if (find('dirs')) assert.ok(params.dirs && find('dirs').value <= 3, id);
    }
  }
});

test('մեդիա. ամեն scrub քայլի թերթը կա dist/-ում և ≤ 400 KB, կադրերը ≤ 30', () => {
  const media = api.PHYSICS_MEDIA;
  for (const [name, entry] of Object.entries(media)) {
    assert.equal(entry.type, 'frames', name);
    assert.ok(entry.frames <= 30 && entry.w <= 400 && entry.h <= 400, name);
    assert.ok(statSync(new URL(entry.src.slice(1), root)).size <= 400 * 1024, name);
  }
  for (const { id, step } of steps.filter(item => item.step.k === 'scrub')) assert.ok(media[step.media], id + ': ' + step.media);
});

test('ֆայլերի չափը. ոչ մի ֆիզիկայի ֆայլ > 300 տող, physics-anim*.js ընդհանուր ≤ 25 KB', () => {
  for (const name of [...files, 'physics-lesson.js', 'physics.js', 'physics.css', 'physics-nodes.css']) assert.ok(readFileSync(new URL(name, root), 'utf8').split('\n').length <= 300, name);
  const animBytes = ['physics-anim.js', 'physics-anims.js', 'physics-anims-2.js'].reduce((sum, name) => sum + statSync(new URL(name, root)).size, 0);
  assert.ok(animBytes <= 25 * 1024, 'physics-anim*.js ' + animBytes + ' բայթ');
});

test('սպրայթներ. ամեն նկարի box-ը 512 կտավի մեջ է, physSprite-ը տալիս է նշված լայնությունը, նկար չկա՝ null', () => {
  for (const [name, entry] of Object.entries(api.PHYSICS_IMAGES)) {
    const [x0, y0, x1, y1] = entry.box;
    assert.ok(x0 >= 0 && y0 >= 0 && x1 <= 512 && y1 <= 512 && x1 > x0 && y1 > y0, name + ': box');
  }
  const apple = api.physSprite('apple', 80);
  assert.equal(apple.w, 80);
  assert.ok(apple.h > 0 && apple.svg.startsWith('<image'));
  assert.equal(api.physSprite('no-such-image', 80), null);
  // հավասար չափ. երեք խորանարդները նույն չափի են (±1 px)
  const boxes = ['cube-wood', 'cube-aluminium', 'cube-steel'].map(id => api.PHYSICS_IMAGES[id].box);
  for (const box of boxes) assert.ok(Math.abs((box[2] - box[0]) - (boxes[0][2] - boxes[0][0])) <= 2 && Math.abs((box[3] - box[1]) - (boxes[0][3] - boxes[0][1])) <= 2);
  // չափերը իրար նկատմամբ. գիրք > խնձոր > բանալի (բարձրությամբ)
  const items = Object.fromEntries(api.PHYSICS_LESSONS.s19[1].params.items.map(item => [item.img, api.physSprite(item.img, item.objW).h]));
  assert.ok(items.book > items.apple && items.apple > items.key);
  // մատիտը. բաժանումները աճող են
  assert.ok(api.PHYS_PENCIL_CUTS[0] > 0 && api.PHYS_PENCIL_CUTS[0] < api.PHYS_PENCIL_CUTS[1] && api.PHYS_PENCIL_CUTS[1] < 1);
  assert.equal(api.PHYSICS_LESSONS.s20[2].params.items.length, 3);
  assert.ok(api.PHYSICS_LESSONS.s20[2].params.items.every(item => item.objW === 76), 'խորանարդները նույն չափով');
  assert.ok((api.physCubeHalvesSvg(60).match(/<polygon/g) || []).length >= 10);
});

test('թվի դաշտ. տառերը հանվում են, մնում են թվանշաններ, մեկ տասնորդական նշան և սկզբի մինուսը', () => {
  assert.equal(api.physCleanNumber('12abc'), '12');
  assert.equal(api.physCleanNumber('սմ 4,5'), '4,5');
  assert.equal(api.physCleanNumber('1.2,3'), '1.23');
  assert.equal(api.physCleanNumber('−3-4'), '-34');
  assert.equal(api.physCleanNumber('  7 '), '7');
  assert.equal(api.physCleanNumber(''), '');
});

// ---------- Ուղու կլորակները (Design/physics-path-nodes) ----------
test('կլորակներ. 6 գլխի 3 վիճակը կա, IV-ում՝ զսպանակով, գույները՝ դիզայնի աղյուսակից, «pulse» օղակ չկա', () => {
  const colors = { 1: '#388201', 2: '#945DB7', 3: '#137BAC', 4: '#A86200', 5: '#D13D3D', 6: '#008089' };
  for (let n = 1; n <= 6; n++) {
    for (const state of ['done', 'current', 'locked']) {
      const art = api.PHYS_NODE_ART[n][state];
      assert.ok(art.svg.startsWith('<svg') && art.svg.includes('aria-hidden="true"'), n + ' ' + state);
      assert.ok(!/class="[^"]*pulse/.test(art.svg), 'պուլսացող օղակ չպետք է լինի. ' + n + ' ' + state);
      assert.equal(Boolean(art.spring), n === 4, n + ' ' + state + ' spring');
    }
    assert.equal(api.PHYS_NODE_META[n].color, colors[n]);
  }
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(n => api.PHYS_NODE_META[n].cut), [1150, 900, 620, 850, 1000, 850]);
});

test('կլորակներ. կոճակի attribute-ները (aria-label, aria-expanded, aria-controls, aria-disabled), յուրահատուկ clipPath id', () => {
  const section = api.PHYSICS_COURSE.chapters[0].sections[0];
  const done = api.physNodeStopHtml(1, section, 'done', 0);
  const current = api.physNodeStopHtml(1, section, 'current', 1);
  const locked = api.physNodeStopHtml(1, section, 'locked', 2);
  assert.ok(done.includes('— ավարտված"') && current.includes('— ընթացիկ դաս"') && locked.includes('— փակ"'));
  assert.ok(done.includes('aria-expanded="false"') && done.includes('aria-controls="phys-card-s1"'));
  assert.ok(locked.includes('aria-disabled="true"') && !/ disabled[ >]/.test(locked));
  assert.ok(current.includes('aria-current="step"') && current.includes('ՍԿՍԵԼ') && !done.includes('ՍԿՍԵԼ'));
  assert.ok(!done.includes('{u}'));
  assert.notEqual(done.match(/id="(lc\d+)"/)[1], api.physNodeStopHtml(1, section, 'done', 0).match(/id="(lc\d+)"/)[1]);
  assert.ok(/<button type="button" class="phys-btn"/.test(done), 'կլորակը <button type="button"> է');
});

test('կլորակներ. դասի պատուհանի տեքստերը (դիզայնից) և կոճակները', () => {
  const section = api.PHYSICS_COURSE.chapters[0].sections[0];
  const done = api.physCardHtml(section, 'done', false);
  assert.ok(done.includes('Ավարտված է։ Կարող ես կրկնել։') && done.includes('ԿՐԿՆԵԼ') && done.includes('data-start="s1"'));
  const current = api.physCardHtml(section, 'current', false);
  assert.ok(current.includes('Հաջորդ դասը քեզ է սպասում։') && current.includes('ՍԿՍԵԼ'));
  const locked = api.physCardHtml(section, 'locked', false);
  assert.ok(locked.includes('Ավարտիր նախորդ դասերը, որ այս դասը բացվի։') && locked.includes('disabled') && locked.includes('ՓԱԿ Է') && !locked.includes('data-start'));
  assert.ok(api.physCardHtml(section, 'locked', true).includes('շուտով'));
});

test('կլորակներ. չափերը 1:1 դիզայնի հետ. կլորակ 72, քայլ 200, անուն +76 (190 px, 14 px), պատուհան 252 (+66/+94/+72), մասշտաբի փոփոխական', () => {
  const css = readFileSync(new URL('physics.css', root), 'utf8');
  for (const rule of ['--phys-node-scale: 1', '--step: 200px', '--cy: 60px', 'width: 72px; height: 72px', 'calc(var(--cy) + 76px)', 'width: 190px', 'font-size: 14px; line-height: 1.3; font-weight: 700', 'color: #3c3c3c',
    'color: #afafaf', 'width: 252px', '--card-gap: 66px', '--card-gap: 94px', '--card-gap: 72px', '--path-swing: 62px', '--path-swing: 48px', 'margin-top: 40px', 'zoom: var(--phys-node-scale)', 'box-shadow: 0 5px 0 var(--ps)'])
    assert.ok(css.includes(rule), rule);
  const art = readFileSync(new URL('physics-nodes-art.js', root), 'utf8');
  assert.ok(art.includes('width=\\"140\\" height=\\"140\\" viewBox=\\"0 0 140 140\\"'), 'SVG 140×140');
});

test('կլորակներ. CSS-ում «ներս մտնելը» միայն պատուհանի կոճակի համար է, ch7-ը դարձել է ch6', () => {
  const css = readFileSync(new URL('physics-nodes.css', root), 'utf8') + readFileSync(new URL('physics.css', root), 'utf8');
  assert.ok(!css.includes('ch7'));
  assert.ok(css.includes('.phys-path .ch6 .done.clickA .c-nd'));
  assert.ok(!/\.(node|phys-btn|phys-state)[^{]*:active/.test(css), 'կլորակը սեղմելիս ներս չի մտնում');
  assert.ok(css.includes('.cta:active{transform:translateY(4px)}'));
  assert.ok(css.includes('prefers-reduced-motion'));
});
