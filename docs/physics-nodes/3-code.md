# ArmDuo · Կլորակների պռոմպտ · մաս 3 (հավելվածներ)

> Այս ֆայլը ArmDuo-ի կլորակների վերջնական պռոմպտի մաս 3/3-ն է։ Մասերն են. 1 — `docs/physics-nodes/1-rules.md` (A–D. դեր, տեխնիկական spec, մոտիվի ընթացակարգ, թյուրըմբռնումներ), 2 — `docs/physics-nodes/2-grades.md` (E–I. ոճեր ըստ 9–12 դասարանների, ստուգացուցակ, ելք, թեստ, ապացույցներ), 3 — `docs/physics-nodes/3-code.md` (հավելվածներ. HTML կառուցվածք, ընդհանուր CSS և JS, ռեգիստր)։ Պռոմպտն օգտագործելիս միացրու երեքը հերթականությամբ։


# ՀԱՎԵԼՎԱԾ 1 · ԿԼՈՐԱԿԻ ԵՎ ԷՋԻ ՆԵՐՔԻՆ ԿԱՌՈՒՑՎԱԾՔ (ՕՐԻՆԱԿ)

```html
<div class="ch5" style="position: relative; width: 360px; height: 1160px; background: #FFFFFF; overflow: hidden; font-family: 'Noto Sans Armenian', system-ui, sans-serif">
  <!-- banner -->
  <div style="position:absolute; left:16px; top:20px; width:328px; box-sizing:border-box; padding:16px 20px; background:{BANNER}; border-radius:16px; box-shadow:0px 5px 0px {BANNER_SHADOW}; color:#FFFFFF">
    <div style="font-size:13px; font-weight:800; letter-spacing:1px">ԳԼՈՒԽ {N}</div>
    <div style="margin-top:4px; font-size:18px; line-height:1.3; font-weight:800">{ՎԵՐՆԱԳԻՐ}</div>
  </div>
  <!-- node (ընթացիկ) -->
  <button class="node current {{c2}}" type="button" aria-label="{ԴԱՍ} — ընթացիկ դաս" aria-expanded="{{e2}}" aria-controls="card2"
          onClick="{{k2}}" data-node="2" onMouseEnter="{{m2}}" onMouseLeave="{{l2}}"
          style="position:absolute; left:166px; top:584px; width:140px; height:140px">
    <svg aria-hidden="true" width="140" height="140" viewBox="0 0 140 140" style="overflow:visible">
      <circle cx="70" cy="73" r="36" fill="{DARK}"></circle>
      <circle cx="70" cy="66" r="36" fill="{MAIN}"></circle>
      <g class="c-lid"><g class="p-lid"><g class="h-lid"><g class="idl"> … </g></g></g></g>
    </svg>
  </button>
  <div style="position:absolute; left:141px; top:726px; width:190px; text-align:center; font-size:14px; line-height:1.3; font-weight:700; color:#3C3C3C; pointer-events:none">{ԴԱՍ}</div>
  <!-- «ՍԿՍԵԼ» պիտակ -->
  <div class="bob" style="position:absolute; left:184px; top:528px; width:104px; pointer-events:none"> … </div>
  <!-- popup -->
  <sc-if value="{{o2}}" hint-placeholder-val="{{ false }}">
    <div class="card" id="card2" style="position:absolute; left:96px; top:722px; width:252px; …">
      … <button class="cta" type="button" onClick="{{g2}}">ՍԿՍԵԼ</button>
    </div>
  </sc-if>
  <!-- դասի էկրան -->
  <sc-if value="{{lessonOpen}}" hint-placeholder-val="{{ false }}"><div class="lesson" …> … {{lessonTitle}} … </div></sc-if>
</div>
```

CSS կանոնների օրինակ (թեյնիկի կափարիչը, 8-րդ դասարան).
```css
.ch5 .c-lid,.ch5 .p-lid,.ch5 .h-lid{transform-origin:70px 50px}
@keyframes rattle{0%,100%{transform:translate(0px,0px) rotate(0deg)}25%{transform:translate(0px,-1.2px) rotate(-2deg)}50%{transform:translate(0px,0px) rotate(0deg)}75%{transform:translate(0px,-1px) rotate(2deg)}}
.ch5 .node.hov:not(.locked) .h-lid{animation:rattle .22s linear infinite}
@keyframes lidhop-ta{…} @keyframes lidhop-tb{…}
.ch5 .done.tapA .p-lid,.ch5 .current.tapA .p-lid{animation:lidhop-ta .45s}
.ch5 .done.tapB .p-lid,.ch5 .current.tapB .p-lid{animation:lidhop-tb .45s}
@keyframes clid-a{…} @keyframes clid-b{…}
.ch5 .done.clickA .c-lid,.ch5 .current.clickA .c-lid{animation:clid-a 1s}
.ch5 .done.clickB .c-lid,.ch5 .current.clickB .c-lid{animation:clid-b 1s}
@media (prefers-reduced-motion: reduce){.ch5 *{animation:none !important;transition:none !important}}
```

---

# ՀԱՎԵԼՎԱԾ 2 · ԸՆԴՀԱՆՈՒՐ CSS ԵՎ JS (ՆՈՒՅՆԸ ԲՈԼՈՐ ԴԱՍԱՐԱՆՆԵՐՈՒՄ)

## Ընդհանուր CSS
```css
body{margin:0}
a{color:#1899D6}a:hover{color:#1453A3}
.node{display:block;background:none;border:0;padding:0;margin:0;cursor:pointer}
.node.locked{cursor:not-allowed}
.node:focus-visible{outline:3px solid #1CB0F6;outline-offset:2px;border-radius:50%}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bob{50%{transform:translateY(-5px)}}
.bob{animation:bob 1.6s ease-in-out infinite}
.spin-slow{animation:spin 14s linear infinite}
.shk{transform-origin:70px 66px}
@keyframes pop{0%{opacity:0;transform:translateY(-6px) scale(.9)}100%{opacity:1;transform:translateY(0px) scale(1)}}
.card{animation:pop .22s cubic-bezier(.3,1.4,.6,1);transform-origin:50% 0%}
.cta{display:block;width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:12px 0px;font-family:inherit;font-size:15px;font-weight:800;letter-spacing:.8px;cursor:pointer;transition:transform .06s,box-shadow .06s}
.cta:active{transform:translateY(4px)}
.cta:focus-visible{outline:3px solid #FFFFFF;outline-offset:2px}
.cta:disabled{cursor:not-allowed}
.cta:disabled:active{transform:none}
@keyframes shake-ta{0%,100%{transform:translateX(0px)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
@keyframes shake-tb{0%,100%{transform:translateX(0px)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.locked.tapA .shk{animation:shake-ta .45s ease-in-out}
.locked.tapB .shk{animation:shake-tb .45s ease-in-out}
@keyframes lessonIn{0%{opacity:0}100%{opacity:1}}
@keyframes lessonBody{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0px)}}
@keyframes barIn{0%{width:0%}}
.lesson{animation:lessonIn .12s linear}
.lesson > div{animation:lessonBody .3s cubic-bezier(.2,.8,.3,1) .08s backwards}
.bar{animation:barIn .6s ease-out .25s backwards}
.xbtn:focus-visible{outline:3px solid #1CB0F6;outline-offset:2px;border-radius:12px}
```

## JS (Claude Design · DCLogic)
`__LESSONS__`-ը փոխարինիր գլխի 4 դասերի զանգվածով, իսկ `__CUT__`-ը՝ cut-ի ms-ով։ Կայքում (vanilla JS) նույն վարքը պահիր՝ փոխարինելով `setState`-ը սեփական render-ով և `cut()`-ից հետո անցնելով `/physics/lesson/<id>`։
```js
class Component extends DCLogic {
keep() {
return true;
}
renderVals() {
const st = this.state || {};
const open = st.open === undefined ? -1 : st.open;
const t = st.t || [0, 0, 0, 0];
const g = st.g || [0, 0, 0, 0];
const h = st.h || [false, false, false, false];
const out = {};
for (let i = 0; i < 4; i++) {
const tap = t[i] === 0 ? '' : (t[i] % 2 ? 'tapA' : 'tapB');
const go = g[i] === 0 ? '' : (g[i] % 2 ? 'clickA' : 'clickB');
const hov = h[i] || (this.keep() && open === i);
out['c' + i] = tap + ' ' + go + (hov ? ' hov' : '');
out['o' + i] = open === i;
out['e' + i] = open === i ? 'true' : 'false';
out['k' + i] = () => this.toggle(i);
out['g' + i] = () => this.start(i);
out['m' + i] = () => this.setHov(i, true);
out['l' + i] = (e) => this.leave(i, e);
}
const L = __LESSONS__;
const lesson = st.lesson === undefined ? -1 : st.lesson;
out.lessonOpen = lesson !== -1;
out.lessonTitle = lesson === -1 ? '' : L[lesson];
out.closeLesson = () => this.closeLesson();
return out;
}
settle(root) {
try {
const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!root || !root.getAnimations || calm) { if (root) root.classList.remove('hov'); return; }
const SP = '.h-orb,.h-sp,.h-gb,.h-cv';
const spinners = [];
root.querySelectorAll(SP).forEach((el) => {
const an = el.getAnimations().filter((a) => a.animationName);
const o = el.parentNode;
if (!an.length || !o || !o.classList || !o.classList.contains('o-rot')) return;
const m = new DOMMatrix(getComputedStyle(el).transform);
spinners.push({ o: o, ang: Math.atan2(m.b, m.a) * 180 / Math.PI, v: 360 / (Number(an[0].effect.getTiming().duration) || 1000) });
});
const snap = [];
root.querySelectorAll('*').forEach((el) => {
if (el.matches && el.matches(SP)) return;
const an = el.getAnimations().filter((a) => a.animationName);
if (an.length) {
const cs = getComputedStyle(el);
snap.push({ el: el, names: an.map((a) => a.animationName).join(','), t: cs.transform, o: cs.opacity });
}
});
root.classList.remove('hov');
const T = 750;
spinners.forEach((sp) => {
const base = parseFloat(sp.o.getAttribute('data-rot') || '0') + sp.ang;
const end = base + sp.v * T / 3;
sp.o.style.transform = 'rotate(' + end + 'deg)';
sp.o.setAttribute('data-rot', String(end % 360));
sp.o.animate([{ transform: 'rotate(' + base + 'deg)' }, { transform: 'rotate(' + end + 'deg)' }], { duration: T, easing: 'cubic-bezier(.2,.6,.4,1)' });
});
snap.forEach((s) => {
const names = s.el.getAnimations().filter((a) => a.animationName).map((a) => a.animationName).join(',');
if (names === s.names) return;
const cs = getComputedStyle(s.el);
if (cs.transform === s.t && cs.opacity === s.o) return;
s.el.animate([{ transform: s.t, opacity: s.o }, { transform: cs.transform, opacity: cs.opacity }], { duration: 380, easing: 'cubic-bezier(.2,.7,.3,1)' });
});
} catch (err) {}
}
nodeEl(i) {
return typeof document !== 'undefined' ? document.querySelector('[data-node="' + i + '"]') : null;
}
setHov(i, v) {
const h = ((this.state && this.state.h) || [false, false, false, false]).slice();
h[i] = v;
this.setState({ h: h });
}
leave(i, e) {
const st = this.state || {};
const t = e && e.currentTarget;
const root = t ? ((t.closest && t.closest('.grp')) || t) : null;
if (!(this.keep() && st.open === i)) this.settle(root);
this.setHov(i, false);
}
toggle(i) {
const s = this.state || {};
if (s.busy) return;
const h = s.h || [false, false, false, false];
const prev = s.open === undefined ? -1 : s.open;
const next = prev === i ? -1 : i;
if (this.keep() && prev !== -1 && prev !== next && !h[prev]) this.settle(this.nodeEl(prev));
const tt = (s.t || [0, 0, 0, 0]).slice();
tt[i] += 1;
this.setState({ t: tt, open: next });
}
start(i) {
const s = this.state || {};
if (s.busy) return;
const h = s.h || [false, false, false, false];
if (this.keep() && !h[i]) this.settle(this.nodeEl(i));
const gg = (s.g || [0, 0, 0, 0]).slice();
gg[i] += 1;
this.setState({ g: gg, open: -1, busy: true });
let finished = false;
const done = () => {
if (finished) return;
finished = true;
this.setState({ busy: false, lesson: i });
};
const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(done, calm ? 0 : this.cut());
}
closeLesson() {
this.setState({ lesson: -1 });
}
cut() {
return __CUT__;
}
}
```

---

# ՀԱՎԵԼՎԱԾ 3 · ՌԵԳԻՍՏՐ (ԱՐԴԵՆ ՊԱՏՐԱՍՏ)

**8-րդ դասարան** (կտավ՝ https://claude.ai/artifact/CaXGDoDWJVKvRJqdet8Y6i)
| Գլուխ | Դասեր (առաջին 4) | Մոտիվ | Ձև | START / cut |
|---|---|---|---|---|
| I · Կինեմատիկա | §1–4 | Թեք հարթություն + գնդակ, strobe 1:3:5 | object | 700 / 560 ms |
| II · Դինամիկայի հիմնական օրենքները | §11–14 | Հրթիռ | object | ~1600 / 840 ms |
| III · Մեխանիկական տատանումներ և ալիքներ | §25–28 | Մաթեմատիկական ճոճանակ | object | առաջին առաջարկից |
| IV · Ներքին էներգիա | §40–43 | Թեյնիկ, կափարիչը բարձրացնում է գոլորշին | round | 1000 / 800 ms |
| V · Նյութի ագրեգատային վիճակների փոփոխությունը | §48–51 | Սառույց → ջրափոս → գոլորշի | round | 1200 / 1000 ms |

**7-րդ դասարան** (կտավ՝ https://claude.ai/artifact/4ScDErJifnKGNEfABDZsG9). խոշորացույց, ատոմ, անիվ, զսպանակով բեռ, ատամնանիվ, մանոմետր։ Մանրամասները՝ claude.ai-ի ArmDuo նախագծի `claude/physics-path-nodes.md` փաստաթղթում։
