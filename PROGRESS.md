# PROGRESS

Read `CLAUDE.md` and this file at the start of every session; update it after each piece of work.

_Վերջին թարմացում՝ 2026-11-23_

## Done (Արված քայլեր)

### Վարկանիշ (լիգաներ), `/leaderboard`
- Duolingo-ի «Рейтинги» էջը՝ `dist/leaderboard.js`, `leaderboard.css`, `leaderboard-art.js` (գեներացվում է `leaderboard-assets.py`-ով)։
- Սերվեր՝ `worker/leaderboard.mjs` (`GET /api/leaderboard`, `PUT /api/leaderboard/status`, `POST /api/xp`), միգրացիա `drizzle/0004_leagues.sql`, `schema.sql`, հաղորդակցում `worker/pages-build.mjs`-ում։
- 10 իրական լիգա, ≤30 հոգանոց խմբեր, շաբաթը՝ երկուշաբթի 00:00 Երևանի ժամով։ Բարձրացում՝ ըստ լիգայի տոկոսի (67/50/33/23/23/23/23/23/17/0), իջեցում՝ ներքևի 7/30 (Obsidian/Diamond՝ 5/30), Բրոնզում՝ ոչ։
- XP-ը կլիենտից է (`POST /api/xp`), սերվերը սահմանափակում է (≤200 մեկ հարցում, ≤3000 շաբաթական)։
- Թեստեր՝ `worker/leaderboard.test.mjs` (24 ստուգում), անցնում են։

### Կրկնություն (Practice), `/practice`
- `dist/practice.js`, `practice.css`, նավիգացիայի 2-րդ կետ։
- Բառերի SRS (HLR-lite)՝ `state.srs`, «Բառեր» և «Սխալներ» հերթեր, 10 բառանոց սեթ, +10 XP։
- Օրվա 3 առաջադրանք, streak-ի պաշտպանություն (+1 ամեն 7 օրը, մաքս 2), ձեռքբերումներ պրոֆիլում (ռեկորդներ + 4 մրցանակ)։
- Ստուգված Playwright-ով (SRS թարմացում, streak freeze, պրոֆիլ, բջջային նավիգացիա 3×2)։
- Դետալներ՝ `README.md` (բաժին «Practice»)։

### Ֆիզիկա 7, `/physics` (Փուլ 1 + Փուլ 1.1, տե՛ս `PLAN.md` և `README.md`-ի «Physics»)
- **Փուլ 1 (նախորդ նիստեր).** ճանապարհ (6 գլուխ, 55 §), գործիքներ `measure`/`spring`/`tank`/`frames`, քայլերի տեսակներ, Blender կադրաշերտ (§21), +10 XP։
- **Փուլ 1.1 (2026-11-23).**
  - Խիստ հերթականություն §1 → §55 (`physicsNext`, «Շուտով», կողպված ուղիղ հասցեն վերադարձնում է ճանապարհին), գլխավոր էջի քարտը և վահանակը՝ «ավարտված / 55»։
  - Արժեքները ցուցակով (`given`/`find`/`steps`/`lines`, զանգվածներ `hint`/`why`-ում), թեստը պահանջում է, որ մեկ տողում երկու «թիվ + միավոր» չլինի։ Վերագրված են 9 դասերի տեքստերը։
  - Duolingo ոճի բացատրության էկրան (`img`/`fig`/`anim`, hero քարտ), ներքևի ամրացված գունավորվող շերտ։
  - 4 SVG սխեմա (`physics-figs.js`), 6 SVG կերպար (`physics-art*.js`), 5 անիմացիա + նվագարկիչ (`physics-anim*.js`), `watch` քայլ։ Գործիքները (ruler, scale, cylinder, spring) նկարվում են նույն կերպարներով։
  - Նոր դասեր՝ §1, §2 (փաստերը ստուգված են WebSearch-ով), §3, §6։ Պատրաստ են 13 դաս։
  - `physics-media.py`՝ նկարների ռեժիմ և `--palette` (չեն ձախողվում, եթե նկարներ չկան), `physics-src/flow-prompts.md`, `image-list.json`։
  - Ստուգված Playwright-ով 1280px և 375px. §1 → §6 UI-ով մաքուր localStorage-ով, բոլոր 13 դասերը ավարտից ավարտ 100%, 98 էկրան × 2 լայնություն՝ առանց համընկնման/հորիզոնական scroll-ի, անիմացիաների կառավարում (Կրկնել, 0,5×, Դադար, ներդիր/տեսանելիություն, `prefers-reduced-motion`), `file:` մեկ ֆայլ։ Նկարները՝ `physics-src/compare/` (git-ում չեն)։
  - Պաշտպանություն. «Շարունակել»-ի արագ կրկնակի սեղմումը չի բաց թողնում քայլ։
  - Թեստեր՝ `worker/physics.test.mjs` (31)։
- Վերականգնվեցին `dist/index.html`, `garden-*.png` (ջնջվել էին 19:04-ին)։ `dist/account.js`-ում ավելացվեց `state.physics` լռելյայն արժեքը (մուտք գործածների դատարկ գլխավոր էջի սխալը, արդեն տեղակայված է)։

- **Նկարների միացում (2026-11-24, CLAUDE-CODE-TASK-4).** 34 Flow նկարները միացված են (չեն փոխվել)։
  - Ճանապարհ. 6 գլխի շապիկ (`chapter-1..6-cover`) + «ավարտված / ընդամենը դաս»; գլխավոր էջի Ֆիզիկա քարտում `home-card`; ավարտի էկրանում `lesson-complete`։
  - Դասեր. `img` հիմա կարող է զանգված լինել (զույգ hero՝ `.phys-imgs.is-pair`); `pics`՝ տարբերակների նկարներ։ §1՝ ice/echo/shadow, §2՝ atom/observatory/aragats-station/accelerator/magnifier, §3՝ observe-child/experiment-child (բացատրություն + երկու ընտրություն), §6՝ measuring-tape։
  - Հայերեն alt՝ `PHYSICS_IMAGES`-ից, `onerror`՝ թաքցնում է, `file:`-ում թաքնված է (`physImageReady`), արտաքին հարցում չկա։ Hero ≤ ~220px (375px-ում), կենտրոնում, `width/height` դրված, սպիտակ ֆոն։
  - Չօգտագործված (չստիպվեց). `train`, `lever`, `balance-scale`՝ գրանցված են `PHYS_LESSON_ART_PLAN`-ում (`physics-course.js`) և կօգտագործվեն §14/§16, §23/§30, §30 գրելիս։
  - SVG երկվորյակները համեմատվեցին Flow-ի հետ և ուղղվեցին. spring (L-ամրակ, գլանաձև բեռ), ruler (երկու հորիզոնական շերտ), cube (իզոմետրիկ), scale (էլիպս նժար), cylinder (շրջանակ + հիմք), stopwatch (նարնջագույն դեմք, կապույտ գծիկներ, դեղին կոճակներ)։ Գործիքները և անիմացիաները աշխատում են (անփոփոխ երկրաչափություն)։
  - `pages-build` հիմա մաքրում է `deploy/physics` պատճենելուց առաջ (հին `.webp`-եր չեն մնում)։
  - Դիտարկումներ (rule 9). նկարները չեն մերժվել. ներքին սպիտակ տարածքները լուծված են hero-ի սպիտակ ֆոնով, մի քանի լայն նկար թողնում է դատարկ շերտ, echo-ի շուրջ հալո կա (ընդունելի)։
  - Playwright. 375×812 և 1280, 13 դասի բոլոր էկրանները՝ առանց հորիզոնական scroll-ի, ճանապարհ, գլխավոր քարտ, ավարտի էկրան, գործիքներ; սքրինշոթներ՝ `physics-src/compare/`։ Թեստեր՝ `worker/physics.test.mjs` (33)։

- **Նկարները գործիքներում (2026-11-24).** 9 նոր Flow նկար (key, book, apple, stone, pencil, hook-weight, ice-melting, table, foam-ball) + 3 խորանարդ (cube-wood/aluminium/steel՝ կտրված three-cubes-ից, հավասար չափով). ընդամենը 46 նկար։
  - Pipeline. `physics-media.py`՝ `BG_SEEDS` (բանալու անցքը թափանցիկ), `DEHALO` (սպիտակ եզրագիծ չի մնում, foam-ball-ի սպիտակ խորանարդը մնում է անթափանց), `box` (առարկայի սահմանները 512 կտավում), `physics-media.js`-ում մեկ նկար՝ մեկ տող։ Հին 34 նկարների hash-երը չեն փոխվել։
  - Կոդ. նոր `dist/physics-sprites.js`՝ `physSprite`, մատիտի 3 մասը (`physPencilHtml/Layout`, `PHYS_PENCIL_CUTS`), `physCubeHalvesSvg`։ Եթե նկար չկա (`file:`), մնում է հին ձևը։
  - Կշեռք (s19 ×2, s5, s20, s21). item-ներին `img/objW`. գիրք > խնձոր > բանալի. s20-ի երեք խորանարդը նույն չափով (76), ինչը ուղղում է «նույն ծավալ» սխալը։ Cut (s20). կտրելուց հետո նկարվում է կիսված ալյումինե խորանարդ (SVG, երկու հավասար կես a×a×a/2, բացվածք). նույնը՝ s20-ի հաջորդ հարցի `fig: 'cube-cut'`։ Ուշադրություն. կտրելուց հետո նժարին երևում են երկու կեսերը, իսկ m, V ցույց են տալիս մեկ կեսի արժեքը (գործիքի տրամաբանությունը չփոխվեց)։
  - Չափագլան (s21). քար → stone։ Քանոն (s3, s4 ×2, s5). կապույտ ուղղանկյան փոխարեն մատիտ. ձախ ծայրը ճշգրիտ 0-ին, աջը՝ objectLength-ին (ստուգված 6,4 / 7,3 / 5,4 / 6,8 սմ-ի համար). պատասխանը չի փոխվել։ Զսպանակ (s25, s26). բեռները hook-weight են, կախվում են իրար տակ։
  - s1 քայլ 2՝ նկարային տարբերակներ (phenomena-apple, table, book, apple). s19 քայլ 5՝ foam-ball. phenomena-ice → ice-melting։
  - Playwright 380px և 1280px. s19 (205 գ = խնձոր + բանալի ընդունվում է), s20 (cut), s21, s25, s5, s3/s4 քանոն, s1. Սքրինշոթներ՝ `physics-src/compare/v-*.png`, `v2-*.png`։ Թեստեր՝ 34։
  - Rule 9. 9 նկարը ընդունվեցին (բանալու անցքը, foam-ball-ի սպիտակ խորանարդը, ice-melting-ի կաթիլները ստուգված). ice-melting-ի կաթիլների փոքր սպիտակ փայլը չեմ մաքրել (նկարը սպիտակ քարտի վրա է)։ Մերժվածները (a30398d9, df2bafb5, c46fb334, b146fcdb, 00b78cce) չեն օգտագործվել։

- **Ուղու նոր կլորակները (2026-11-24, `Design/physics-path-nodes/PROMPT.md`).** `/physics`-ը նկարվում է `physics()`-ով (`dist/physics.js`), որը նախկինում օգտագործում էր ընդհանուր `renderPathStop`-ը (`grammar-path.js`). Հիմա՝ `physNodeStopHtml`։
  - Նոր ֆայլեր. `physics-nodes-build.py` (6 `.dc.html`-ից գեներացնում է `dist/physics-nodes-art.js` և `dist/physics-nodes.css`), `dist/physics-nodes.js` (տրամաբանությունը), `dist/physics.css`-ի վերջում՝ դասավորությունը։ Գեներացվող CSS-ի ամեն սելեկտոր սկսվում է `.phys-path `-ով, `.ch7`-ը (VI-ի ֆայլում) դարձել է `.ch6`։ `index.html`-ը միացնում է `physics-nodes.css`, `physics-nodes-art.js`, `physics-nodes.js`։
  - Կլորակները. I խոշորացույց, II ատոմ, III անիվ (+ կետագծային հետագիծ), IV զսպանակ + բեռ, V ատամնանիվ, VI մանոմետր. գույները՝ գլխի աղյուսակից։ Վիճակները՝ ավարտված / ընթացիկ (մշտական շարժում + ցատկոտող «ՍԿՍԵԼ») / փակ (մոխրագույն + կողպեք)։ Պուլսացող օղակը հանված է, կլորակը սեղմելիս ներս չի մտնում (միայն պատուհանի `.cta`)։
  - Փոխազդեցություն. `hov` (միայն `(hover: hover)`), `settle` (380 մվ սահուն վերադարձ, պտտվողները ետ չեն գնում, 750 մվ իներցիա), `tapA/tapB`, `clickA/clickB`, պատուհան (ավարտված / ընթացիկ / փակ), մեկ բաց պատուհան, `Escape` և դուրս սեղմելը, `busy`, դասը բացվում է գագաթնակետին (I 1150 · II 900 · III 620 · IV 850 · V 1000 · VI 850 մվ, 120 մվ մարումը վերջանում է հենց այդ պահին), `prefers-reduced-motion`՝ ամեն ինչ անջատվում է, դասը բացվում է անմիջապես։ IV-ում պատուհանը +28 px ներքև, VI-ում՝ +6 px։
  - Մատչելիություն. `<button type="button">`, `aria-label` («<դաս> — ավարտված / ընթացիկ դաս / փակ»), `aria-expanded`, `aria-controls`, փակը՝ `aria-disabled="true"`, SVG-ները `aria-hidden`։
  - Շեղումներ դիզայնից (կայքի ուղու դասավորության պատճառով). ուղու կոորդինատները կայքինն են (bend), անունները՝ `PHYSICS_COURSE`-ից. գլխի պաստառում պահված է շապիկի նկարը. §-ի տեսակի (ԼԱ / խնդիրներ) նշանները այլևս չկան (կլորակը ամբողջ գլխում նույնն է). հաջորդ դասը, եթե դեռ պատրաստ չէ, փակ է, պատուհանում՝ «Այս դասը շուտով կհայտնվի։» և «ՇՈՒՏՈՎ»։ IV-ում «ՍԿՍԵԼ»-ը կողքին է, ձախ կողմում տեղ չլինելու դեպքում՝ աջից։
  - Playwright 375 և 1280. 6 գլուխների սքրինշոթները (`physics-src/compare/n3-*`), hover/settle, պատուհաններ (ավարտված/ընթացիկ/փակ), Escape, դուրս սեղմել, ՍԿՍԵԼ → `/physics/lesson/<id>`, reduced-motion, առանց հորիզոնական scroll-ի։ Թեստեր՝ 39։

- **Ուղու չափերը 1:1 դիզայնի հետ (2026-11-24).** `physics.css`-ի կլորակների բլոկը վերագրված է. կլորակ Ø72 (SVG 140×140, կենտրոնը (70,66)), քայլը՝ կենտրոնից կենտրոն **200 px** (դիզայնի ֆայլերում 200, ոչ 210. գլխի `--step` փոփոխականը), ընթացիկից առաջ +40 px, զիգզագը ±62 px (≤480px՝ ±48), անունը կենտրոնից +76 px (190 px, 14 px/700/1.3, #3C3C3C, փակը #AFAFAF, `pointer-events: none`), պատուհան 252 px (վերին եզրը կենտրոնից +66, IV՝ +94, VI՝ +72, padding 16, radius 16, shadow 0 5px 0 մուգ գույն, ≥12 px եզրից), գլխի գոտու ֆոնը՝ կլորակի գույնի մգացված տարբերակը (#388201, #945DB7, #137BAC, #A86200, #D13D3D, #008089)։ `--phys-node-scale` (`.phys-path`-ի վրա, լռելյայն 1)՝ `zoom`-ով մասշտաբում է ամբողջը։
  - IV գլուխ. քայլը 224 px (200-ի փոխարեն), որովհետև զսպանակի վերին եզրը (կենտրոնից −110) 200-ի և 210-ի դեպքում հատվում է նախորդ անվան հետ. 224-ի դեպքում ոչինչ չի հատվում։
  - Ստուգված Playwright-ով 320/375/1280. անունը +76, լայնությունը 190, պատուհան 252 px, բոլոր 55 կլորակի նկարների/անունների հատումներ՝ 0 (հանգստի վիճակում), հորիզոնական scroll չկա։
  - Բացահայտված սխալ. `phys-unit` դասը գոյություն ուներ (թվի դաշտի միավորների ցանկ), ուստի գլխի բլոկը շրջանակ էր ստանում. վերանվանված է `phys-chapter`։

- **Փուլ 8.0 — երկու դասընթացի ենթակառուցվածք (2026-11-25, `PLAN.md`).** Ֆիզիկա 8-ը նույն `/physics` բաժնում է, վերևում «Ֆիզիկա 7 | Ֆիզիկա 8» ընտրիչ։
  - `dist/physics8-course.js`. 5 գլուխ, 56 § (`s1…s56`), `grade: 8`, `g: 9.8`, `PHYSICS8_LESSONS = {}` (դասեր դեռ չկան), `PHYSICS_COURSES = {7, 8}`։ Ֆիզիկա 7-ի քարտեզին ավելացվել է `g: 10`։
  - Շարժիչ (`physics-lesson.js`). `physGrade` (7/8), `physCourse()`, `physState()` (`state.physics` / `state.physics8`), `physLessonsOf()`, `physPath()`, `physSetGrade()`. `physicsReady/Done/Next/Sections/Progress/CanOpen` ընդունում են ընտրովի `grade`՝ լռելյայն ընթացիկը։ XP-ն ընդհանուր է (`state.physicsXp`)։ 7-ի վարքը չի փոխվել (գլխավոր էջի քարտը՝ `physicsProgress(7)`)։
  - Ուղիներ (`routes.js`). `/physics` (7), `/physics/lesson/sN`, `/physics/8`, `/physics/8/lesson/sN`. վերնագիր «Ֆիզիկա 8», անհայտ/չպատրաստ դասը՝ 8-ի ճանապարհ։ Ընտրիչը (`physGradeTabs`, `openPhysicsGrade`) փոխում է ուղին և Back/Forward-ը աշխատում է։
  - `state.physics8 = { done, at }` (`account.js`-ի լռելյայն + `??=`՝ հին հաշիվները չեն կոտրվում)։ 8-ը բաց է սկզբից, ներսում խիստ հերթական. քանի որ դասեր չկան, բոլոր 56 կլորակները «փակ» են, առաջինի պատուհանում՝ «Այս դասը շուտով կհայտնվի։» / «ՇՈՒՏՈՎ»։
  - Թեստեր՝ `worker/physics-course.test.mjs` (5 թեստ. քարտեզներ, g, հերթականություն/կողպում, առաջընթացի անջատվածություն, ուղիներ), ավելացված է `package.json`-ի `test`-ում. ընդհանուր 45։ Playwright 375/1280. 7-ի ճանապարհը անփոփոխ, 8-ի ճանապարհը (5 գլուխ, 56 կլորակ), ընտրիչ, Back, ուղիների ուղիղ բացում, 7-ի դասը բացվում է։
  - Բաց հարց. III գլխի §25–§39 վերնագրերը գրքի OCR բովանդակությունից են (16 կետ՝ 15 §-ի համար), ճշգրտել Փուլ 8.3-ում. էջերի համարները (`page`) հայտնի են միայն մասամբ (`null`)։ Գլուխների նկարները/գույները 8-ի համար դեռ 7-ինն են (կլորակների SVG 1–5)։

- **Ֆիզիկա 8, §1-ի դասը (2026-11-25, `PHYSICS8-LESSON-SPEC.md`-ի կառուցվածքով).** 12 քայլ՝ `watch` (ավտոբուս) → `predict` → 2 `sim` (`motion`) → օրենք (`explain` + `build`) → `numeric`/`table`/`numeric` → ակնթարթային արագություն (`explain` + `choice`) → `recap`։ §1-ը բաց է սկզբից, §2-ից սկսած՝ «Շուտով»։
  - Նոր ֆայլեր. `physics8-lessons-ch1-part1.js`, `physics8-anims-ch1.js` (`p8-bus`, `drip-track`), `physics-motion.js` (`motion` գործիք), `physics-build.js` (`build` քայլ)։ Փոփոխված. `physics-math.js` (`physSpeed`, `physDistance`), `physics-text.js` (`_միջ` → ստորին ինդեքս), `physics.css`, `index.html`, `physics-course.test.mjs`։
  - Սպեցիֆիկացիայից տարբերությունները. քայլերի դաշտերը շարժիչինն են (`k`, ոչ թե `type`). `build`-ը՝ `{ options, answer }`. «Գիտե՞ս» փաստ չկա (OCR տեքստում §1-ի «Հետաքրքիր է իմանալ» չի գտնվել). `predict`-ի `reveal` անիմացիա չկա. `sim`-ը ստուգվում է «Ստուգել»-ով, ինչպես 7-ում. `graph` քայլը դեռ չկա։ Սպեցիֆիկացիան ավելացված է `PLAN.md`-ի «Դասի կառուցվածք» բաժնում։
  - Playwright. 375 px՝ դասն անցնում է մինչև վերջ (7/7, +10 XP, 7-ի առաջընթացը չի փոխվում), `build`-ի սխալ պատասխանի ճյուղը ստուգված է. 1280 px՝ ստուգված են 1-ին և 3-րդ քայլերը։ Գտնված և ուղղված. `motion`-ը չէր բացվում առանց `params`-ի, `_միջ`-ը չէր ձևավորվում տողային hint/why-ում և `build`-ի բլոկում։ `npm test`՝ 47/47։

### Հետազոտություն
- Duolingo/Brilliant մեխանիզմների զեկույցը (չաթում)։ Բարձրացման թվերը ոչ պաշտոնական են (Duolingo-ն չի հրապարակում)։
- (2026-11-24) §2. Համբարձումյանի, Ալիխանյանի, Ալիխանովի նկարազարդումները փոխարինվել են իրական լուսանկարներով (օգտատիրոջ ընտրած՝ #6, #10, #23). սև-սպիտակ, 4:5, մաքրված և սրված, կլոր անկյուններ։ `physics-media.py`-ում `PHOTOS` ճյուղ՝ ֆոնը չի դառնում թափանցիկ։ Մերժված տարբերակ՝ առաջին մշակումը (չափազանց ուժեղ սրում, Ալիխանովի գլուխն ու կզակը կտրված)։

## Վիճակ

- `npm run build` և `npm test`՝ անցնում են (2026-11-25, 47/47)։
- 2026-11-25. Ֆիզիկա 8 §1-ը commit/push արված է (`b4e2065`) և տեղակայված `armduo.pages.dev`-ում. live ֆայլերը համընկնում են `dist/`-ի հետ, դասը բացվում է։
- **Օգտատիրոջ կանոն (2026-11-25).** ամեն փոփոխությունից հետո հրապարակել՝ միայն փոխված ֆայլերի commit + push, հետո `wrangler pages deploy`։ `publish.bat`-ը չօգտագործել (`git add -A`)։

## Next (Հաջորդ անելիքներ)

0. **Ֆիզիկա.**
   - Նկարներ. `train`/`lever`/`balance-scale`-ը միացնել համապատասխան դասերը գրելիս (`PHYS_LESSON_ART_PLAN`)։
   - Փուլ 2 (գլուխ II, `particles` Canvas գործիք) նոր `/plan`-ով։ Նախ ստուգել դասագրքում՝ `g`, հեղուկների խտությունները, §49։ Քայլերի `run` տեսակը (Coddy ոճ) դեռ չկա. `predict` + `sim` զույգը փոխարինում է դրան։
   - Ուշադրություն. `dist/app.js`-ը արգելում է Tab-ը ամբողջ կայքում (`preventDefault`), ուստի գործիքները Tab → Enter-ով հասանելի չեն։ Որոշել՝ թողնել թե փոխել։
   - `C:\physics-src\` թղթապանակը (Blender-ի առաջին ռենդերից) կարելի է ջնջել ձեռքով։
1. **Տեղակայում.** Cloudflare-ում մուտք անել (`wrangler login`՝ Chrome-ում «Allow»), հետո աշխատեցնել `deploy-leagues.bat`-ը (build → D1 միգրացիա `0004_leagues.sql` → `pages deploy`)։ Արդյունքը՝ `deploy-log.txt`։ Վերջին փորձը կանգնեց մուտքի քայլում։
2. Տեղակայումից հետո ստուգել `armduo.pages.dev/practice` և `/leaderboard` (իրական հաշվով)։
3. Git commit/push՝ միայն լիգաների/կրկնության ֆայլերով (`publish.bat`-ը մի օգտագործիր. `git add -A`-ը կավելացնի ջնջված հին tarball-ները)։
4. Չանել (ուզածի դեպքում)՝ followers/friends, friend streak, լիգայի privacy toggle, լիգային միանալ առաջին XP-ից հետո։
5. `leaderboard.js`-ը նոր տարբերակով բրաուզերում դեռ չի ստուգվել (mock API-ով)։
6. Մաքրել ժամանակավոր ֆայլերը՝ `deploy-log.txt` (git-ում չմտցնել)։

## Physics images: rejected in Flow (rule 9)
- chapter-2 water molecule: 3 flat discs, looked like a cartoon mouse head -> replaced by water drop.
- ice cube v1: floated above puddle with a gap -> regenerated sitting on puddle.
- atom v1: gloss highlights, offset dark shadows, pointed V artefact; atom v2: nucleus missing -> v3 approved.
- apple (blue drops), ruler (uneven ticks), scale-as-jar, balance with asymmetric chain, dynamometer with dark outlines, cube with diagonal-split face, spring cropped at top: rejected earlier.
- Final images: physics-src/images/ (34 files, 2K JPG). Next: run physics-media.py (512x512 WebP <=25 KB, centre spring, --palette), hide side marks on stone-cylinder.
