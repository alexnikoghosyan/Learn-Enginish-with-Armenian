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

## Next steps

- Password reset ("Մոռացե՞լ ես գաղտնաբառը") – needs an email sender (e.g. Cloudflare Email / Resend) and a reset-token table.
- Server-side progress sync (progress is still only in `localStorage`).
- More word illustrations, gamification (XP, hearts, streak), CEFR-sorted and re-checked translations.
