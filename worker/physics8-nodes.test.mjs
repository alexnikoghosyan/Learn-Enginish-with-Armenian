// Ֆիզիկա 8. ուղու կլորակները (Design/physics8-path-nodes → physics8-nodes-art.js, physics8-nodes.css)
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const esc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function load(grade) {
  const context = vm.createContext({ physGrade: grade, matchMedia: () => ({ matches: false }), esc });
  vm.runInContext(read('physics-nodes-art.js') + '\n' + read('physics8-nodes-art.js') + '\n' + read('physics-nodes.js') +
    '\n;globalThis.api = { PHYS8_NODE_ART, PHYS8_NODE_META, PHYS_NODE_ART, physNodeKit, physNodeStopHtml };', context);
  return context.api;
}
const eight = load(8);
const seven = load(7);
const section = { id: 's3', n: 3, title: 'Փորձ' };
const css = read('physics8-nodes.css').replace(/\/\*[\s\S]*?\*\//g, '');

test('կլորակներ 8. 5 գլուխ × 3 վիճակ, SVG 140×140, առանց կտավի {{…}} անցքերի և id-ների', () => {
  assert.deepEqual(Object.keys(eight.PHYS8_NODE_ART), ['1', '2', '3', '4', '5']);
  for (const states of Object.values(eight.PHYS8_NODE_ART)) {
    assert.deepEqual(Object.keys(states), ['done', 'current', 'locked']);
    for (const { svg } of Object.values(states)) {
      assert.ok(svg.startsWith('<svg aria-hidden="true" width="140" height="140" viewBox="0 0 140 140"'));
      assert.ok(svg.endsWith('</svg>'));
      assert.ok(!svg.includes('{{') && !/\sid="/.test(svg));
    }
  }
});

test('կլորակներ 8. գույները, cut-ը (START → դաս) և պատուհանի հեռավորությունը՝ կտավից', () => {
  const meta = eight.PHYS8_NODE_META;
  assert.deepEqual([1, 2, 3, 4, 5].map(n => meta[n].color), ['#388201', '#C81E1E', '#8A3FC4', '#8A6500', '#137BAC']);
  assert.deepEqual([1, 2, 3, 4, 5].map(n => meta[n].cut), [560, 840, 900, 800, 1000]);
  assert.deepEqual([1, 2, 3, 4, 5].map(n => meta[n].gap), [72, 66, 66, 72, 72]);
});

test('կլորակներ 8. 8-րդում՝ g8cN դաս և 8-րդի SVG, 7-րդում՝ chN և 7-րդի SVG (չի փոխվել)', () => {
  const html8 = eight.physNodeStopHtml(2, section, 'current', 1);
  assert.match(html8, /class="path-stop phys-stop g8c2 is-current"/);
  assert.ok(html8.includes(eight.PHYS8_NODE_ART[2].current.svg));
  assert.match(html8, /data-cut="840"/);
  assert.match(html8, /--card-gap:66px/);
  assert.ok(!/\bch2\b/.test(html8));
  const html7 = seven.physNodeStopHtml(2, section, 'current', 1);
  assert.match(html7, /class="path-stop phys-stop ch2 is-current"/);
  assert.ok(html7.includes(seven.PHYS_NODE_ART[2].current.svg.replace(/\{u\}/g, '1').slice(0, 60)));
  assert.match(html7, /data-cut="900"/);
  assert.ok(!html7.includes('--card-gap'));
});

test('կլորակներ 8. CSS-ը մեկուսացված է. միայն .phys-path .g8cN, keyframes՝ g8cN- նախածանցով, բոլոր անիմացիաները գոյություն ունեն', () => {
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
  assert.ok(!/\.ch\d/.test(css));
  const frames = new Set([...css.matchAll(/@keyframes ([\w-]+)/g)].map(match => match[1]));
  for (const name of frames) assert.match(name, /^g8c[1-5]-/);
  const rules = css.replace(/@keyframes [\w-]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').replace(/@media[^{]*\{/g, '');
  for (const [, selectors] of rules.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    for (const part of selectors.split(',')) if (part.trim()) assert.match(part.trim(), /^\.phys-path \.g8c[1-5][ :.]/, part);
  }
  for (const [, value] of rules.matchAll(/animation(?:-name)?\s*:([^;}]*)/g)) {
    const name = value.trim().split(/\s+/)[0];
    if (name !== 'none') assert.ok(frames.has(name), name);
  }
});

test('կլորակներ 8. ֆայլերը ≤ 300 տող, index.html-ը միացնում է CSS-ը և art-ը physics-nodes.js-ից առաջ', () => {
  for (const name of ['physics8-nodes-art.js', 'physics8-nodes.css', 'physics-nodes.js']) assert.ok(read(name).split('\n').length <= 300, name);
  const html = read('index.html');
  assert.ok(html.includes('<link rel="stylesheet" href="/physics8-nodes.css">'));
  assert.ok(html.indexOf('/physics8-nodes-art.js') > 0 && html.indexOf('/physics8-nodes-art.js') < html.indexOf('/physics-nodes.js'));
});
