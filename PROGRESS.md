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

### Հետազոտություն
- Duolingo/Brilliant մեխանիզմների զեկույցը (չաթում)։ Բարձրացման թվերը ոչ պաշտոնական են (Duolingo-ն չի հրապարակում)։

## Վիճակ

- `npm run build` և `npm test`՝ անցնում են (2026-11-23)։
- Տեղակայված է Փուլ 1-ը և մուտքի ուղղումը. Փուլ 1.1-ը **դեռ տեղակայված չէ** (commit/push/deploy չեն արվել)։
- Ոչինչ commit/push չի արվել GitHub-ում։

## Next (Հաջորդ անելիքներ)

0. **Ֆիզիկա.**
   - **Flow նկարները դեռ չկան** (`physics-src/images/<id>.png`). առաջարկները՝ `physics-src/flow-prompts.md` (15 նկար, 2 «պատրաստ նմուշ»՝ `ruler`, `spring-weight`, որոնք այս պանակում չեն)։ Նկարները դնելուց հետո՝ `python physics-media.py` և `python physics-media.py --palette <id>`։
   - **Համեմատել Flow նկարի հետ** (Ե2, 24c). SVG կերպարները՝ `spring` (`spring-weight`), `ruler` (`ruler`), `cube` (`three-cubes`), `scale` (`kitchen-scale`), `cylinder` (`stone-cylinder`), `stopwatch` (`stopwatch`)։ SVG ռենդերները արդեն պահված են `physics-src/compare/art-<id>.svg.png`-ում. Flow նկարի կողքին դնել, ուղղել ձևը/համամասնությունը/գույները (`PHYS_ART`-ում), թեստը կստուգի գույները palette-ի հետ։
   - Փուլ 2 (գլուխ II, `particles` Canvas գործիք) նոր `/plan`-ով։ Նախ ստուգել դասագրքում՝ `g`, հեղուկների խտությունները, §49։ Քայլերի `run` տեսակը (Coddy ոճ) դեռ չկա. `predict` + `sim` զույգը փոխարինում է դրան։
   - Ուշադրություն. `dist/app.js`-ը արգելում է Tab-ը ամբողջ կայքում (`preventDefault`), ուստի գործիքները Tab → Enter-ով հասանելի չեն։ Որոշել՝ թողնել թե փոխել։
   - `C:\physics-src\` թղթապանակը (Blender-ի առաջին ռենդերից) կարելի է ջնջել ձեռքով։
1. **Տեղակայում.** Cloudflare-ում մուտք անել (`wrangler login`՝ Chrome-ում «Allow»), հետո աշխատեցնել `deploy-leagues.bat`-ը (build → D1 միգրացիա `0004_leagues.sql` → `pages deploy`)։ Արդյունքը՝ `deploy-log.txt`։ Վերջին փորձը կանգնեց մուտքի քայլում։
2. Տեղակայումից հետո ստուգել `armduo.pages.dev/practice` և `/leaderboard` (իրական հաշվով)։
3. Git commit/push՝ միայն լիգաների/կրկնության ֆայլերով (`publish.bat`-ը մի օգտագործիր. `git add -A`-ը կավելացնի ջնջված հին tarball-ները)։
4. Չանել (ուզածի դեպքում)՝ followers/friends, friend streak, լիգայի privacy toggle, լիգային միանալ առաջին XP-ից հետո։
5. `leaderboard.js`-ը նոր տարբերակով բրաուզերում դեռ չի ստուգվել (mock API-ով)։
6. Մաքրել ժամանակավոր ֆայլերը՝ `deploy-log.txt` (git-ում չմտցնել)։
