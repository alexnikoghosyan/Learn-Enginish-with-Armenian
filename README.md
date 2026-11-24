# English Garden (ArmDuo)

Free web app that teaches English to Armenian speakers. Live: https://armduo.pages.dev

## Layout

- `dist/` – the static front-end (plain JS in global scope, script order in `index.html` matters).
- `worker/` – Cloudflare Pages advanced-mode worker, bundled by `worker/pages-build.mjs` into `deploy/_worker.js`:
  - `account.mjs` – profile API (`/api/username`, `/api/account`, `/api/account/avatar`).
  - `google-auth.mjs` – Google OAuth (`/auth/google?mode=signin|signup&return_to=…`), signed `eg_session` cookie, friendly error pages.
  - `email-auth.mjs` – email + password accounts (`POST /auth/email/signup`, `POST /auth/email/signin`).
  - `single-file.mjs` – builds the offline copy `../../outputs/English-Garden.html` (everything inlined, `#/` routes).
- `schema.sql` / `drizzle/` – D1 (`armduo-db`) schema and migrations.

## Publish

`publish.bat` commits (message from `commit-message.txt`), pushes, builds `deploy/`, deploys to Cloudflare Pages and rebuilds the single file.
Manual: `node worker\pages-build.mjs` then `npx wrangler pages deploy deploy --project-name armduo --branch main --commit-dirty=true`.

New D1 migration: `npx wrangler d1 execute armduo-db --remote --file drizzle/000N_name.sql` (never drop data).

## URLs

History-API routing in `dist/routes.js` (the worker serves `index.html` for unknown non-file paths):
`/`, `/grammar`, `/grammar/lesson/3`, `/grammar/lesson/3/practice`, `/words`, `/words/unit/2/lesson/4`,
`/words/dictionary`, `/words/cards`, `/words/pictures`, `/review`, `/sounds`, `/sounds/practice`, `/journal`,
`/profile`, `/signin`, `/signup`, `/welcome`. Locked lessons fall back to their course path, unknown paths to `/`.

## Accounts

- Account ids: `google:<sub>` or `email:<uuid>`; both use the same `profiles` row and `eg_session` cookie.
- Passwords: PBKDF2-SHA256, 100 000 iterations (Workers maximum), random 16-byte salt; only the hash is stored.
- Rate limit: 5 failed sign-ins per IP + email and 5 sign-ups per IP per 10 minutes (`auth_attempts`).
- Secrets (set in Cloudflare, never committed): `GOOGLE_CLIENT_SECRET`, optional `SESSION_SECRET`.

## Mistakes and lesson results

- No hearts: a wrong answer shows "Ճիշտ չէ" with the correct answer, then the lesson moves on.
- Wrongly answered questions come back at the end (marked "Կրկնենք սխալը") until answered correctly:
  grammar practice (`state.grammarRetry`), word review (`state.cumulativeReview.retry`) and sounds.
- The reward card after a grammar, word, review or sounds lesson shows XP, accuracy (when the lesson had checked answers) and streak.

## Profile page

`profile()` in `dist/account.js` (Duolingo-style): centre column (banner with large avatar + pencil button that opens the
avatar picker, name / username / "Գրանցվել է՝ month year", one 2x2 "Վիճակագրություն" grid, sign out) and a right column
(language badge, streak, XP, "Օրվա նպատակ" bar, "Ձեռքբերումներ" placeholder). Below 1240px it becomes one column and the
top stats row is hidden. Sidebar is 255px with uppercase nav labels on desktop only (mobile bottom nav unchanged).
Avatar banner colours: `profileBannerColors`.

## Avatar builder

`/profile/avatar` (pencil on the profile banner). Original layered-SVG character art, no canvas or libraries:
- `dist/avatar-config.js` - `AVATAR_DEFAULT`, `AVATAR_RANGES`, palettes, part libraries and `renderAvatarSVG(config, {crop|viewBox, bg, animate, body})`.
- `dist/avatar-builder.js` - the page: 9 tabs, swatch and thumbnail panels (radiogroups, roving tabindex), camera and body-morph tweens,
  idle blink / look / breathing (off for `prefers-reduced-motion`), save.
- Storage: `state.avatarConfig` (localStorage, anonymous) and `profiles.avatar_config` (JSON, D1) via `PUT /api/account/avatar {config}`.
  The worker validates integer ranges (`avatarRanges` in `worker/account.mjs` must match `AVATAR_RANGES`) and size (<= 600 bytes).
  The old `avatar` key (animals) still works and is shown until the builder is used.
- Migration `drizzle/0003_avatar_config.sql` (run on the remote D1 before deploying).
- Config version 2 (`v: 2`): 12 hair styles (incl. top bun, side ponytail, headwrap, hooded long, oval with parting, round puff), 5 hats + none
  (beanie, ribbed beanie, durag, panel-seam cap, English Garden cap), 6 morphable bodies, 15 skin tones. Old `v: 1` configs are migrated
  on load (`AVATAR_V1_HAIR` / `AVATAR_V1_HAT`); the worker accepts v 1 and v 2.
- Art style (TASK-3): chunky flat "chibi" - squircle head (55% of the frame), plain white eyes with dark pupils, pink nose, small mouth, no neck, no shading,
  tapered dark torso with a hem band. Defaults: skin #7d4a3f, background #afafaf, clothes #424242, cap #575757, pupil #3d3d3d.
- Hats hide the hair's `front` (top) part; only `back` and `extras` (sides, tails) stay visible, so hair never pokes through.
- To add parts: append to the arrays in `avatar-config.js` and raise the matching number in both range tables.

## Next steps

- Password reset ("Մոռացե՞լ ես գաղտնաբառը") – needs an email sender (e.g. Cloudflare Email / Resend) and a reset-token table.
- Server-side progress sync (progress is still only in `localStorage`).
- More word illustrations (Google Flow, style rules in the ArmDuo project README).
- Translation cleanup + CEFR levels.
- Gamification follow-ups: achievements, daily quests (XP, streak and the lesson results screen are done).

## Leaderboard page (`/leaderboard`, nav «Վարկանիշ»)

Real users, 10 leagues (Բրոնզե … Ադամանդե), groups of ≤30, weekly (Monday 00:00 UTC) promotion/demotion.

- `worker/leaderboard.mjs` – API: `GET /api/leaderboard`, `PUT /api/leaderboard/status`, `POST /api/xp {total}`. Wired in `worker/pages-build.mjs`.
- XP is client-reported (total sync): first sync sets a baseline, then credit = min(delta, 200) per call, max 3000/week. Synced from `leaderboard()`, `studyTimerTick` and on tab hide.
- Promote share per league `[.67,.5,.33,.23,.23,.23,.23,.23,.17,0]` of the group (min 1, xp>0, 20 of 30 in Bronze … 5 in Obsidian, none in Diamond). Demote: bottom `floor(n*7/30)` (`floor(n*5/30)` in Obsidian/Diamond; none in Bronze). Week starts Monday 00:00 Asia/Yerevan (= Sunday 20:00 UTC). Zero-xp members who would stay in Bronze are dropped and rejoin on next view.
- **Migration (run once before deploy):** `npx wrangler d1 execute armduo-db --remote --file drizzle/0004_leagues.sql` (also appended to `schema.sql`).
- Tests: `node --no-warnings worker/leaderboard.test.mjs` (24 checks).
- `dist/leaderboard.js` – page; `dist/leaderboard.css` – sizes (592px list, 368px right column, 48px avatars, 64px row pitch); `dist/leaderboard-art.js` – generated by `leaderboard-assets.py` (leagues 7–10 are hue-shifted Sapphire art; gems/hearts are placeholders).
- Offline/`file:` and guests see a "sign in / online only" message.

## Practice («Կրկնություն», `/practice`, nav item 2)

Based on Duolingo's spaced repetition (Settles & Meeder, ACL 2016, Half-Life Regression) in a simplified client-only form (`dist/practice.js`, `dist/practice.css`; all state in `state`, no server/D1 change):
- `state.srs[wordIndex] = {h,t,r,w,bad}`: half-life in hours, last answer time, right/wrong counts, `bad` = last answer wrong. Strength `p = 2^(-Δ/h)`; a learned word is *due* when `p < 0.8` (words without history count as due).
- Update: correct → `h *= 2.2` (only `*1.1` if less than half the interval has passed, so repeats inside one session don't inflate it), wrong → `h = max(12h, h/2)`. New word starts at 24h (`srsLearn` on word-lesson completion).
- «Բառեր» (due, weakest first) and «Սխալներ» start a set of ≤10 words through the existing cumulative-review engine (`state.cumulativeReview.practice`), one question per word (`practicePick`). Finishing a set gives +10 XP (`state.practiceXp`, included in `profileCounts().xp`, so it also feeds the league XP).
- Daily quests (3): 30 XP today, 10 correct review answers, 1 flawless lesson (`questProgress`, `state.xpToday`, `state.daily`). XP sources call `logXp()`.
- Streak: 1 lesson/review/sound round = streak day (unchanged). New streak protection: +1 per 7-day streak (max 2, `state.freezes`); a missed single day is bridged automatically (`state.frozenDays`, `applyStreakFreeze`).
- Profile «Ձեռքբերումներ»: personal records (best streak, best day XP, flawless lessons, highest league from the leaderboard) and 4 level awards (words, streak, reviews, quests).
- Not implemented (needs server work): followers/friends, friend streaks, joining a league only after the first XP of the week, league opt-out/public-profile toggle.

## Physics (`/physics`)

«Ֆիզիկա 7»՝ ինտերակտիվ դասեր (նախ արա, հետո բացատրիր), ճանապարհը նույն ոճով, ինչ քերականությունը։ 55 § (6 գլուխ), պատրաստ են 13 դաս (§1–6, 19–22, 25, 26, 43)։ Պլանը՝ `PLAN.md`։

- **Հերթականություն (խիստ §1 → §55).** `physicsNext()`՝ առաջին չավարտված §։ Բացվում է միայն այն (եթե պատրաստ է) և արդեն ավարտվածները (կրկնելու համար). եթե հերթականը պատրաստ չէ, ճանապարհին նրա վրա «Շուտով» է, և ոչինչ չի բացվում։ Կողպված դասի ուղիղ հասցեն (`/physics/lesson/s20`) վերադարձնում է ճանապարհին։
- **Ֆայլեր (`dist/`).** `physics-math.js` (բանաձևեր, թվի ընթերցում, `physPhase/physEase/physTween/physLerpColor/physSpring`), `physics-text.js` (`given/find/steps`, `physRich`, `physFormula`, hero), `physics-course.js` (քարտեզը), `physics-lessons.js`, `-2.js`, `-3.js` (դասեր), `physics-steps.js` (քայլերի տեսակները), `physics-lesson.js` (շարժիչ, ներքևի շերտ), `physics.js` (ճանապարհի էջը), `physics.css`։
- **Գործիքներ (`PHYS_TOOLS`, SVG/Canvas).** `measure` (ruler, scale + «Կտրել»/խտություն, cylinder), `spring` (Հուկ, աստիճանավորում), `tank` (p = ρgh), `frames` (Blender sprite)։ Տեսքը՝ `PHYS_ART` կերպարներով։
- **Քայլերի տեսակներ.** `explain`, `watch`, `sim`, `choice`, `predict` (չի գնահատվում), `numeric` (թիվ + միավոր, `calc`-ով), `table`, `scrub`, `recap`։ Առաջին սխալից հետո՝ հուշում, երկրորդից՝ բացատրություն. ներքևի ամրացված շերտը կանաչ/կարմիր է դառնում։
- **Արժեքները ցուցակով.** թիվ + միավոր երբեք մեկ նախադասության մեջ չեն. դրանք `given: [[նշան, թիվ, միավոր], …]`, `find`, `steps`, `lines` կամ զանգված-տարբերակով `hint`/`why` (ամեն տարր՝ առանձին տող)։ `**թավ**`՝ հիմնական տերմիններ։ Թեստը ստուգում է (`worker/physics.test.mjs`)։
- **Բացատրության էկրանի նկար.** `explain { img | fig | anim, labels? }`. `img`՝ Flow նկար (`PHYSICS_IMAGES`, ֆայլի բացակայության դեպքում hero-ն չի ցուցադրվում), `fig`՝ SVG սխեմա (`physics-figs.js`՝ ruler-ticks, fx-graph, pressure-arrows, formula-card), `anim`՝ անիմացիա։
- **Անիմացիաներ (`watch { anim }`).** `physics-anim.js`՝ նվագարկիչ (ավտոմատ սկիզբ, «Կրկնել», «Դադար», «0,5×», կանգ՝ երբ չի երևում, `prefers-reduced-motion`-ով՝ վերջնական կադր և «Դիտել»)։ `physics-anims.js`, `-2.js`՝ ruler-division, density-compare, spring-double, hydro-depth, fall-observe (ժամանակի մաքուր ֆունկցիաներ `scene(t)`)։
- **Կերպարներ (`PHYS_ART`).** `physics-art.js`, `-2.js`՝ spring, ruler, cube, scale, cylinder, stopwatch. երկու հարթ տոն, տակից «հաստության» շերտ, առանց եզրագծի։ `poster`՝ նկարի հանգիստ վիճակը, որից սկսվում է անիմացիան (առանց «թռչելու»)։
- **Նկարների pipeline.** `physics-src/flow-prompts.md` (կաղապար և ցուցակ), Flow նկարները՝ `physics-src/images/<id>.png` (git-ում չեն) → `python physics-media.py` (512×512, սպիտակը թափանցիկ, WebP ≤ 25 KB → `dist/physics/img/`, ցուցակը՝ `dist/physics-media.js`), `--palette <id>`՝ գերիշխող գույները → `physics-src/palettes/<id>.json`։ Հայերեն alt-երը՝ `physics-src/image-list.json`։ Սկրիպտը չի ձախողվում, եթե նկարներ չկան։
- **Blender կադրաշերտ.** `physics-src/blender/<id>.py` → `blender -b --python ... -- <ԱԲՍՈԼՅՈՒՏ ուղի>/physics-src/renders/<id>` → `python physics-media.py` (`dist/physics/frames/`)։ `file:`-ում `scrub` քայլերը բաց են թողնվում։
- **Նկարները UI-ում.** `physImageReady(id)` (false `file:`-ում), `physImageTag(id, class, wrapper)` (հայերեն alt, `width/height`, `onerror`՝ հեռացնում է)։ `explain.img`՝ id կամ զանգված (զույգ), `choice.pics`՝ տարբերակների նկարներ, `chapter.cover`՝ գլխի շապիկ ճանապարհում, `home-card`՝ գլխավոր էջում, `lesson-complete`՝ ավարտի էկրանում։ Դեռ չօգտագործվածները՝ `PHYS_LESSON_ART_PLAN` (`physics-course.js`)։ `pages-build`-ը մաքրում է `deploy/physics`-ը։
- **Նկարները գործիքներում.** `dist/physics-sprites.js`՝ `physSprite(id, objW)` (նկարը կենտրոնը (0,0)-ում, `PHYSICS_IMAGES[id].box`-ով), մատիտը 3 մասից (`physPencilHtml/Layout`), `physCubeHalvesSvg(a)`։ Կշեռքի/չափագլանի item-ներ՝ `{ img, objW }` (+ `halves: true`՝ կտրելուց հետո կիսված խորանարդ), քանոն՝ `params.img` (լռելյայն `pencil`), զսպանակը՝ `hook-weight`։ Նկար չկա՝ հին ձևը։
- **Նոր դաս.** `physics-lessons*.js`-ում ավելացնել `sNN: [...]` (id-ն քարտեզում է, վերջին քայլը՝ `recap`)։ Ստուգումները՝ `npm test`։
- **Առաջընթաց.** `state.physics` և `state.physicsXp` (+10 XP դասի առաջին ավարտին)։ Նոր API կամ D1 փոփոխություն չկա։
- **Արժեքներ, որոնք պետք է ստուգել դասագրքում.** `g = 10 Ն/կգ` (`PHYS_G`), հեղուկների խտությունները (`physics-tank.js`), §49-ի վերնագիրը։ §2-ի փաստերը ստուգված են WebSearch-ով։
