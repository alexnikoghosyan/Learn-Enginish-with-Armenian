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
9. **Image quality gate — never accept a weak image.** Before using any image (attached by me, generated in Google Flow, rendered in Blender, or drawn as SVG), open it at full size and check it. If it does not match the request or the site's style rules, has a defect (wrong or extra object, hallucinated parts, garbled or unwanted text/numbers, wrong colours, off-centre or cropped, inaccurate scale/ticks/physics), or could clearly look better for the site, **do not accept it**: say plainly what is wrong and why, then regenerate or redraw it with a prompt that names the exact problem (e.g. "no blue drops; motion lines must be two short white curves"). Repeat until it passes. Never silently "make do". Record rejected images and the reason in `PROGRESS.md`.
10. **Image prompts must leave nothing to the model.** When generating an image (Google Flow or any other generator), describe every detail explicitly; never let the generator decide anything. Each prompt states: the exact subject and how many objects (and that there are no others); shape and proportions of every part; pose/orientation and viewing angle; position and framing (centered, padding, nothing cropped); exact colours as hex codes for every part; style (flat, two tones, offset "thickness" layer, no outline, no gloss, no gradient); background; and an explicit list of what must NOT appear (text, numbers, faces, extra objects, drops, shadows, etc.). Physics images must also state the physically correct situation (e.g. which side of the lever goes down). Keep the final prompts in `physics-src/flow-prompts.md` (one block per image id) so they can be reused and improved.
11. **Physics path nodes follow `docs/physics-nodes/`.** Before creating or changing any learning-path node (the buttons on `/physics/<grade>`) for any grade or topic, read `docs/physics-nodes/README.md` and all three parts (`1-rules.md`, `2-grades.md`, `3-code.md`) and follow them, including the QA checklist in section F. Chapters and lesson names come only from `PLAN.md`.

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
