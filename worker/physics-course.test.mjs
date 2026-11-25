// Ֆիզիկա 7 | 8. դասընթացների քարտեզները, g, հերթականություն, կողպում, առաջընթացի անջատվածություն, ուղիներ (առանց DOM-ի, node:vm)
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const files = ['physics-math.js', 'physics-text.js', 'physics-tools.js', 'physics-course.js', 'physics8-course.js', 'physics-lessons.js', 'physics-lessons-2.js', 'physics-lessons-3.js',
  'physics8-lessons-ch1-part1.js', 'physics-anim.js', 'physics-anims.js', 'physics8-anims-ch1.js', 'physics-motion.js', 'physics-media.js', 'physics-steps.js', 'physics-build.js', 'physics-lesson.js'];
const source = files.map(name => readFileSync(new URL(name, root), 'utf8')).join('\n');

// Յուրաքանչյուր թեստ՝ իր մաքուր context-ով (state, PHYSICS8_LESSONS-ը փոխվում են)
function fresh() {
  const context = vm.createContext({ state: {}, matchMedia: () => ({ matches: false }) });
  vm.runInContext(source + '\n;globalThis.api = { physCourse, physState, physLessonsOf, physPath, physSetGrade, physicsReady, physicsDone, physicsSections, physicsNext, physicsCanOpen, ' +
    'physicsProgress, PHYSICS_COURSE, PHYSICS8_COURSE, PHYSICS_COURSES, PHYSICS_LESSONS, PHYSICS8_LESSONS, PHYS_ANIMS, PHYS_STEPS, PHYS_TOOLS, physBuildMet, physGoalMet, physMotionPath };', context);
  return { api: context.api, state: context.state };
}

test('Ֆիզիկա 8. 5 գլուխ, 56 § (s1…s56 հերթով, եզակի), grade 8, g = 9,8; Ֆիզիկա 7. 6 գլուխ, 55 §, g = 10', () => {
  const { api } = fresh();
  const eight = api.PHYSICS8_COURSE;
  assert.equal(eight.grade, 8);
  assert.equal(eight.g, 9.8);
  assert.equal(eight.chapters.length, 5);
  const sections = eight.chapters.flatMap(chapter => chapter.sections);
  assert.equal(sections.length, 56);
  assert.deepEqual(Array.from(sections, section => section.id), Array.from({ length: 56 }, (_, index) => 's' + (index + 1)));
  assert.deepEqual(Array.from(eight.chapters, chapter => chapter.sections.length), [10, 14, 15, 8, 9]);
  assert.ok(sections.every(section => section.title.length > 3 && ['lesson', 'lab', 'problems'].includes(section.kind)));
  assert.equal(sections[4].kind, 'lab');
  assert.equal(sections[5].kind, 'problems');
  const seven = api.PHYSICS_COURSE;
  assert.equal(seven.grade, 7);
  assert.equal(seven.g, 10);
  assert.equal(seven.chapters.length, 6);
  assert.equal(seven.chapters.flatMap(chapter => chapter.sections).length, 55);
  assert.equal(api.PHYSICS_COURSES[7], seven);
  assert.equal(api.PHYSICS_COURSES[8], eight);
});

test('Ֆիզիկա 7-ի վարքը չի փոխվել. լռելյայն դասարանը 7 է, ուղիները՝ /physics, պատրաստ դասերը՝ նույնը, հերթականությունը խիստ է', () => {
  const { api, state } = fresh();
  assert.equal(api.physCourse(), api.PHYSICS_COURSE);
  assert.equal(api.physPath(), '/physics');
  assert.equal(api.physPath('s4'), '/physics/lesson/s4');
  const ready = Object.keys(api.PHYSICS_LESSONS);
  assert.ok(ready.length >= 13);
  assert.ok(ready.every(id => api.physicsReady(id)));
  assert.equal(api.physicsNext().id, 's1');
  assert.ok(api.physicsCanOpen(api.physicsSections()[0]));
  assert.ok(!api.physicsCanOpen(api.physicsSections()[1]), 's2-ը կողպված է, քանի դեռ s1-ը ավարտված չէ');
  state.physics.done.s1 = true;
  assert.equal(api.physicsNext().id, 's2');
  assert.ok(api.physicsCanOpen(api.physicsSections()[0]), 'ավարտվածը կրկնելու համար բաց է');
  assert.deepEqual({ ...api.physicsProgress() }, { total: 55, done: 1 });
});

test('Ֆիզիկա 8. բաց է սկզբից (7-ն ավարտելու կարիք չկա), առաջընթացը 7-ից անջատ է, չպատրաստ դասը չի բացվում', () => {
  const { api, state } = fresh();
  api.physSetGrade(8);
  assert.equal(api.physCourse(), api.PHYSICS8_COURSE);
  assert.equal(api.physState(), state.physics8);
  assert.equal(api.physicsNext().id, 's1');
  assert.deepEqual({ ...api.physicsProgress() }, { total: 56, done: 0 });
  const [first, second] = api.physicsSections();
  assert.ok(api.physicsCanOpen(first), '§1-ը պատրաստ է և բաց է սկզբից');
  assert.ok(!api.physicsReady('s2'), '§2-ը դեռ գրված չէ («Շուտով»)');
  // պատրաստ դաս ավելացնելիս. միայն հերթականը (s1) է բացվում, s2-ը՝ ոչ
  api.PHYSICS8_LESSONS.s1 = [{ k: 'recap', points: ['ա'] }];
  api.PHYSICS8_LESSONS.s2 = [{ k: 'recap', points: ['բ'] }];
  assert.ok(api.physicsCanOpen(first));
  assert.ok(!api.physicsCanOpen(second));
  state.physics8.done.s1 = true;
  assert.equal(api.physicsNext().id, 's2');
  assert.ok(api.physicsCanOpen(second) && api.physicsCanOpen(first));
  // 8-ի առաջընթացը 7-ինը չի փոխում և հակառակը
  assert.deepEqual({ ...state.physics.done }, {});
  api.physSetGrade(7);
  assert.equal(api.physicsNext().id, 's1');
  assert.ok(!api.physicsDone('s1'));
  assert.deepEqual({ ...api.physicsProgress() }, { total: 55, done: 0 });
  assert.deepEqual({ ...api.physicsProgress(8) }, { total: 56, done: 1 });
  assert.ok(api.physicsDone('s1', 8));
});

test('ուղիներ. /physics (7), /physics/8, /physics/8/lesson/sN', () => {
  const { api } = fresh();
  api.physSetGrade(8);
  assert.equal(api.physPath(), '/physics/8');
  assert.equal(api.physPath('s3'), '/physics/8/lesson/s3');
  api.physSetGrade(7);
  assert.equal(api.physPath('s3'), '/physics/lesson/s3');
});

test('կառուցվածք. նոր ֆայլերը ≤ 300 տող, 8-ից պատրաստ է միայն §1-ը, index.html-ը միացնում է physics8-course.js-ը', () => {
  for (const name of ['physics8-course.js', 'physics-lesson.js', 'physics.js']) assert.ok(readFileSync(new URL(name, root), 'utf8').split('\n').length <= 300, name);
  const { api } = fresh();
  assert.deepEqual(Object.keys(api.PHYSICS8_LESSONS), ['s1']);
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.ok(html.indexOf('physics-course.js') < html.indexOf('physics8-course.js') && html.indexOf('physics8-course.js') < html.indexOf('physics-lesson.js'));
});

test('Ֆիզիկա 8, §1. 8–12 քայլ, մեկ recap վերջում, hint/why, ճիշտ պատասխաններ, թվերը', () => {
  const { api } = fresh();
  const steps = api.PHYSICS8_LESSONS.s1;
  assert.ok(steps.length >= 8 && steps.length <= 12);
  assert.equal(steps.findIndex(step => step.k === 'recap'), steps.length - 1);
  for (const step of steps) {
    if (['sim', 'build', 'choice', 'predict', 'numeric', 'table'].includes(step.k)) assert.ok(step.why, step.k);
    if (['sim', 'build', 'choice', 'numeric', 'table'].includes(step.k)) assert.ok(step.hint, step.k);
    if (['choice', 'predict'].includes(step.k)) assert.ok(step.options[step.answer], step.q);
    if (step.k === 'numeric') assert.ok(step.units.includes(step.unit), step.q);
  }
  const calcs = steps.flatMap(step => (step.k === 'numeric' ? [step.calc] : step.k === 'table' ? step.rows.map(row => row[3].calc) : []));
  assert.deepEqual(Array.from(calcs.map(({ fn, args }) => args[0] / args[1])), [6, 12, 30, 18, 40]);
  for (const name of ['physics8-lessons-ch1-part1.js', 'physics8-anims-ch1.js', 'physics-motion.js', 'physics-build.js', 'physics.css']) assert.ok(readFileSync(new URL(name, root), 'utf8').split('\n').length <= 300, name);
});

test('Ֆիզիկա 8, §1. կառուցվածք, անիմացիաներ, motion-ի նպատակները, build-ի ստուգում', () => {
  const { api } = fresh();
  const steps = api.PHYSICS8_LESSONS.s1;
  assert.equal(steps[0].k, 'watch');
  assert.equal(steps[1].k, 'predict');
  assert.ok(steps.every(step => step.k in api.PHYS_STEPS));
  for (const step of steps.filter(item => item.anim)) {
    const anim = api.PHYS_ANIMS[step.anim];
    assert.ok(anim.duration >= 5000 && anim.duration <= 15000, step.anim);
    for (let t = 0; t <= anim.duration; t += 250) anim.draw({ scene: {} }, t, {});
  }
  assert.ok(steps.filter(step => step.k === 'sim').every(step => step.tool in api.PHYS_TOOLS));
  assert.equal(api.physMotionPath([10, 30, 20], 30), 600);
  assert.equal(api.physMotionPath([10, 30, 20], 15), 250);
  const [, second] = steps.filter(step => step.k === 'sim');
  assert.ok(api.physGoalMet(second.goal, { avg: 20, uneven: true, ran: true }));
  assert.ok(!api.physGoalMet(second.goal, { avg: 20, uneven: false, ran: true }));
  const build = steps.find(step => step.k === 'build');
  assert.ok(api.physBuildMet(build, [2, 5, 4, 3, 0]));
  assert.ok(!api.physBuildMet(build, [2, 5, 0, 3, 4]));
});

