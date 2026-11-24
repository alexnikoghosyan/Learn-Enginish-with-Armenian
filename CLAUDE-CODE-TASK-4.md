# CLAUDE-CODE-TASK-4 — Physics 7: wire the 34 finished Flow images into the app (code only)

Read `CLAUDE.md`, `PROGRESS.md`, `PLAN.md` (Section Դ/Զ/Է) first. Update `PROGRESS.md` when done.
All images are FINISHED and approved. Do NOT generate, redraw or alter images, and do NOT touch `physics-src/images/`. Code only.

## State you start from
- `python3 physics-media.py` already ran: `dist/physics/img/<id>.<hash>.webp` (34 files, 512×512, transparent bg, ≤25 KB) and `dist/physics-media.js` with `PHYSICS_IMAGES = { id: { src, alt } }` (Armenian alt). Re-run it only if you add/replace a source image. Never hand-edit the generated files.
- `physics-src/palettes/<id>.json` exists for all 34. `npm test` = 31/31 green, `node worker/pages-build.mjs` works.
- Image ids: accelerator, aluminium-cube, aragats-station, atom, balance-scale, chapter-1-cover … chapter-6-cover, dynamometer, experiment-child, home-card, kitchen-scale, lesson-complete, lever, magnifier, measuring-cylinder, measuring-tape, observatory, observe-child, phenomena-apple, phenomena-echo, phenomena-ice, phenomena-rainbow, phenomena-shadow, ruler, spring-weight, stone-cylinder, stopwatch, three-cubes, train, weight-1kg.
- Already used in lessons via `img:` (explain screens, `physics-text.js` → `physImageReady`): aluminium-cube, atom, dynamometer, kitchen-scale, magnifier, measuring-cylinder, observatory, phenomena-apple, phenomena-rainbow, ruler, spring-weight, stone-cylinder, stopwatch, three-cubes, weight-1kg.

## Tasks
1. **Unused images → UI.** Use each exactly where it fits, with the `img`/hero mechanism that already exists (no new image pipeline):
   - `chapter-1-cover … chapter-6-cover`: chapter header/banner on the `/physics` path (one per chapter, 6 chapters) and the chapter intro.
   - `home-card`: the Physics card on the home page (replace any placeholder/emoji art).
   - `lesson-complete`: the lesson-complete screen (+10 XP) for physics lessons.
   - `observe-child` / `experiment-child`: §3 (observation vs experiment) explain steps and the two `choice` options if the step type supports an image.
   - `phenomena-ice`, `phenomena-echo`, `phenomena-shadow`: §1 classification `choice` steps (thermal / sound / light) as the picture of the phenomenon.
   - `measuring-tape`: §4 or §6 (length measurement / unit conversion) explain step.
   - `aragats-station`, `accelerator`: the matching explain step in §2 (Armenian physicists / cosmic-ray station) or leave unused and list them under "Next" in `PROGRESS.md` if no lesson uses them yet.
   - `lever`, `balance-scale`, `train`: do NOT force them into current lessons. Register them in a `PHYS_LESSON_ART_PLAN` comment/list in `physics-course.js` for chapters III–IV (train → motion, lever and balance-scale → forces/equilibrium) and mention in `PROGRESS.md`.
2. **Alt text and fallback.** Each `<img>` has the Armenian `alt` from `PHYSICS_IMAGES`; `onerror` hides the hero (already the pattern); under `file:` images stay hidden (`physFileMode`). No external requests.
3. **Layout.** Hero image max ~220 px tall on 375 px wide screens, centered, `object-fit: contain`, transparent bg on the lesson-card background; no layout shift (set `width`/`height`). Check light and dark theme if the app has both.
4. **SVG twins.** Compare each `PHYS_ART` twin with its Flow image (palettes/contact sheet in `physics-src/compare/`). Colours already match the palette (test enforces it); verify shapes/proportions, adjust `physics-art*.js` where the twin clearly differs, keep the style rule (two flat tones, thickness layer, no outline/gloss).
5. **Tests** (`worker/physics.test.mjs`): every `img:` id used in lessons exists in `PHYSICS_IMAGES`; every `PHYSICS_IMAGES` entry has `src` ending `.webp` and non-empty Armenian alt; each `.webp` is ≤ 25 KB and file exists in `dist/physics/img/`; chapter covers cover chapters 1–6. Keep all existing tests green.
6. **Verify like a user** (Playwright, mobile 375×812 and desktop): open `/physics`, a lesson of every chapter that has an image, the complete screen, the home card. Take screenshots, LOOK at them, fix anything cropped, blurry, misaligned. Save screenshots to `physics-src/compare/` (git-ignored).
7. **Build + deploy readiness.** `npm test`, `node worker/pages-build.mjs`, then follow the repo's deploy steps (`deploy.bat` flow). Do not deploy without telling the user what changed. Update `README.md` («Physics») and `PROGRESS.md` (Done/Next, date).

## Rules
- Never accept a visibly weak result: if an image looks wrong in the UI, report which one and why, do not hide it silently.
- No new npm dependencies, no frameworks. Vanilla JS globals, classic scripts.
- Armenian UI text; do not copy text from the textbook.
- Do not edit files outside this task's scope without asking.
