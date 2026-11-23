# Working rules for this project

1. **Read `CLAUDE.md` and `PROGRESS.md` before starting any work.** `PROGRESS.md` shows what was done and what comes next. Update it at the end of every session: add completed steps under **Done**, update **Next** with remaining work.
2. **After every change, run `npm run build` and `npm test`.** Do not finish the work while either reports errors; fix them first.
   - `build` runs `node worker/pages-build.mjs`; `test` runs `node --test worker/leaderboard.test.mjs` (see `package.json`). Add new test files to the `test` script.
3. **Minimalist style.** Keep UI, code, and copy simple; add nothing that wasn't asked for.
4. **Responsive is mandatory.** Every UI change must work on phone screens (check ~375px width) as well as desktop.
5. **Ask when unsure.** If any part of a request is unclear or only partly understood, ask questions until you understand it with 95%+ confidence before changing anything.
6. **Do not edit any file without approval.** For every new problem, first think deeply and analyze it as a senior architect, propose 2–3 solutions (with trade-offs), and **wait for my approval**. Write code or change files only after I approve.
7. **File size limit: no file may exceed 250–300 lines.** If a component grows past that, split it into smaller sub-files.
8. **Verify design and new-page changes in a real browser.** After every design change or new page, if the server is running (e.g. on localhost), use the Playwright MCP tools to open the site, check it at desktop and phone sizes, click the buttons, and confirm nothing on screen is broken or overlapping.

---

## Tech stack — always preserve these standards

### Hosting & runtime
- **Cloudflare Pages** (advanced mode / Direct Upload) — static assets + Worker
- **Cloudflare Workers** (ES modules, `.mjs`) — serverless backend; bundled by `worker/pages-build.mjs` into `deploy/_worker.js`
- **Cloudflare D1** (SQLite dialect) — database; migrations in `drizzle/`

### Backend
- Pure **ES modules** (`.mjs`), no bundler, no TypeScript, no external npm packages
- Worker source files: `worker/account.mjs`, `worker/google-auth.mjs`, `worker/email-auth.mjs`, `worker/leaderboard.mjs`
- Build script strips `export` keywords and concatenates files → `deploy/_worker.js`
- Auth: Google OAuth + email-based auth (custom, no library)

### Frontend
- **Vanilla JavaScript** — no framework (no React, Vue, etc.)
- **Vanilla CSS** — no Tailwind or other CSS framework; CSS lives inline in `dist/index.html` and in separate `.css` files (`dist/interface.css`, `dist/leaderboard.css`, `dist/practice.css`)
- **SPA** with client-side routing (`dist/routes.js`)
- Fonts: Google Fonts — Noto Sans Armenian + Nunito (loaded via `@import` in CSS)
- PWA: `dist/manifest.webmanifest` + icons

### Content / build tooling
- Python scripts (`build.py`, `hints.py`, `translate.py`, `images.py`, `leaderboard-assets.py`) — generate JS content files in `dist/`
- Node.js built-in test runner (`node --test`) — no Jest or Vitest
- Wrangler CLI — deploy: `npx wrangler pages deploy deploy --project-name armduo`

### Key constraints
- **No npm runtime dependencies** — `package.json` has only `scripts`, no `dependencies`/`devDependencies`
- Keep all JS as plain ES modules; do not introduce TypeScript or a bundler
- Do not add CSS preprocessors; write plain CSS
