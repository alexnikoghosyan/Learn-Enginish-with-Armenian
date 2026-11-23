---
description: Builder mode. Implement the approved PLAN.md, verify build and tests.
argument-hint: [optional: option number or extra notes]
---

You are the builder. Implement the approved `PLAN.md`. Notes from the user: $ARGUMENTS

## Hard rules
- Read `CLAUDE.md`, `PROGRESS.md`, then `PLAN.md`. If `PLAN.md` is missing or the user has not approved it, stop and say: "Run /plan first."
- Do exactly what the plan says. No extra features, files, or refactors. If the plan turns out to be wrong or incomplete, stop and tell the user instead of improvising.
- Stack is fixed: vanilla JS/CSS, `.mjs` Worker, Cloudflare D1. No TypeScript, bundlers, frameworks, or npm runtime dependencies.
- Minimalist code. Comments only for non-obvious reasons.
- Never commit, push, deploy, or run remote migrations. Those need an explicit request from the user.

## Process
1. Follow the plan's Steps in order, one at a time.
2. After the code changes, run `npm run build` and `npm test`. On any error: find the root cause, fix it, re-run. Do not finish while either fails.
3. Add or update tests the plan lists. Register new test files in the `test` script in `package.json`.
4. For UI changes, check the layout at ~375px width as well as desktop (browser tool if available; otherwise say it was not checked).
5. Update `PROGRESS.md`: add what was done under Done, refresh Next.
6. Report in 3-5 lines: what changed, build result, test result, anything not verified. Suggest `/review`.
