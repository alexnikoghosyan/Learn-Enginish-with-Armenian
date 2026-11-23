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

### Ֆիզիկա 7, `/physics` (Փուլ 1, տե՛ս `PLAN.md` և `README.md`-ի «Physics»)
- Ճանապարհ՝ 6 գլուխ, 55 § կլոր հանգույցներով։ **Պատրաստ դասեր (9).** §4, 5, 19, 20, 21, 22, 25, 26, 43. մնացածը կողպված է։
- Գործիքներ՝ `measure` (չափաքանոն, կշեռք + «Կտրել»/խտություն, չափագլան), `spring` (Հուկ + աստիճանավորում), `tank` (p = ρgh, ձևեր, ուղղություններ, հեղուկներ), `frames` (Blender sprite)։
- Քայլերի տեսակներ՝ explain, sim, choice, predict, numeric, table, scrub, recap (`physics-steps.js`)։ +10 XP, հասնում է պրոֆիլին։
- Blender կադրաշերտ `cylinder-displacement` (§21)՝ սցենար `physics-src/blender/`, `physics-media.py`, `dist/physics/frames/*.webp` (72 KB), `pages-build.mjs`-ը պատճենում է այն։
- Ինտեգրում՝ գլխավոր էջի 3-րդ քարտ, «Ֆիզիկա» կոճակ վահանակում, `/physics`, `/physics/lesson/s4`։ Թեստեր՝ `worker/physics.test.mjs` (13)։
- Ստուգված Playwright-ով 1280px և 375px. բոլոր 9 դասերը անցնում են UI-ով ավարտից ավարտ, 61 էկրան + 12 լուծված վիճակ՝ առանց տեքստերի համընկնման և հորիզոնական scroll-ի, սլայդերները (մկնիկ, ստեղնաշար) աշխատում են։
- Վերականգնվեցին `dist/index.html`, `garden-*.png` (ջնջվել էին 19:04-ին), `index.html`-ին ավելացվեցին `practice.css/js` հղումները։

### Հետազոտություն
- Duolingo/Brilliant մեխանիզմների զեկույցը (չաթում)։ Բարձրացման թվերը ոչ պաշտոնական են (Duolingo-ն չի հրապարակում)։

## Վիճակ

- `npm run build` և `npm test`՝ անցնում են (2026-11-23)։
- **Տեղակայված չէ.** `armduo.pages.dev`-ը դեռ հին տարբերակն է։
- Ոչինչ commit/push չի արվել GitHub-ում։

## Next (Հաջորդ անելիքներ)

0. **Ֆիզիկա.** Փուլ 2 (գլուխներ I–II մնացածը, `particles` Canvas գործիք) նոր `/plan`-ով։ Նախ ստուգել դասագրքում՝ `g`, հեղուկների խտությունները, §49։ Քայլերի `run` տեսակը (Coddy ոճ) դեռ չկա. `predict` + `sim` զույգը փոխարինում է դրան։
   - Ուշադրություն. `dist/app.js`-ը արգելում է Tab-ը ամբողջ կայքում (`preventDefault`), ուստի գործիքները Tab → Enter-ով հասանելի չեն. սլայդերները և + / − կոճակները աշխատում են ստեղնաշարով միայն եթե կենտրոնացվեն մկնիկով։ Որոշել՝ թողնել թե փոխել։
   - `C:\physics-src\` թղթապանակը (Blender-ի առաջին ռենդերից) կարելի է ջնջել ձեռքով։
1. **Տեղակայում.** Cloudflare-ում մուտք անել (`wrangler login`՝ Chrome-ում «Allow»), հետո աշխատեցնել `deploy-leagues.bat`-ը (build → D1 միգրացիա `0004_leagues.sql` → `pages deploy`)։ Արդյունքը՝ `deploy-log.txt`։ Վերջին փորձը կանգնեց մուտքի քայլում։
2. Տեղակայումից հետո ստուգել `armduo.pages.dev/practice` և `/leaderboard` (իրական հաշվով)։
3. Git commit/push՝ միայն լիգաների/կրկնության ֆայլերով (`publish.bat`-ը մի օգտագործիր. `git add -A`-ը կավելացնի ջնջված հին tarball-ները)։
4. Չանել (ուզածի դեպքում)՝ followers/friends, friend streak, լիգայի privacy toggle, լիգային միանալ առաջին XP-ից հետո։
5. `leaderboard.js`-ը նոր տարբերակով բրաուզերում դեռ չի ստուգվել (mock API-ով)։
6. Մաքրել ժամանակավոր ֆայլերը՝ `deploy-log.txt` (git-ում չմտցնել)։
