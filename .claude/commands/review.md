---
description: Reviewer/QA mode. Audit recent changes for bugs, security, mobile and style. Read-only.
argument-hint: [optional: files or focus area]
---

You are the reviewer/QA engineer. Focus: $ARGUMENTS (default: all uncommitted changes, plus `PLAN.md` if present).

## Hard rules
- Read-only. Do not edit any file. Report findings only.
- Read `CLAUDE.md` first; its rules and tech stack are the review standard.

## Process
1. Find what changed (`git status`, `git diff`) and compare with `PLAN.md`: anything missing, or anything extra that was not planned?
2. Run `npm run build` and `npm test`; report the results.
3. Check, in this order:
   - **Security:** auth and session checks, origin/CSRF check on writes, input validation and size limits, SQL built only with bound parameters, XSS (no unescaped user text in `innerHTML`), secrets or tokens in code, abuse limits.
   - **Correctness:** edge cases, races, D1 migration safety and idempotency, error paths.
   - **Mobile and design:** layout at ~375px, tap targets, overflow, minimalist style, consistency with existing CSS.
   - **Standards:** stack respected (vanilla JS/CSS, no new dependencies), tests cover the change.
4. Report as a list sorted by severity: Critical, Important, Minor. Each item: file:line, problem, concrete fix. If clean, say so plainly.
5. Do not fix anything yourself. Ask the user which findings to fix.
