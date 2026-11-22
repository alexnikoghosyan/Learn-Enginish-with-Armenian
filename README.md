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
- To add parts: append to the arrays in `avatar-config.js` and raise the matching number in both range tables.

## Next steps

- Password reset ("Մոռացե՞լ ես գաղտնաբառը") – needs an email sender (e.g. Cloudflare Email / Resend) and a reset-token table.
- Server-side progress sync (progress is still only in `localStorage`).
- More word illustrations (Google Flow, style rules in the ArmDuo project README).
- Translation cleanup + CEFR levels.
- Gamification follow-ups: achievements, daily quests (XP, streak and the lesson results screen are done).
