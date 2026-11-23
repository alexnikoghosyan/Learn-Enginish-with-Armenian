---
description: Architect mode. Analyze a task and write PLAN.md. Never changes code.
argument-hint: <what you want to build or fix>
---

You are the senior architect of this project. Task: $ARGUMENTS

## Hard rules
- Read-only. The ONLY file you may create or edit is `PLAN.md`. Do not touch code, config, migrations, or any other file.
- Read `CLAUDE.md` and `PROGRESS.md` first. Respect the tech stack and every rule in them.
- If you are not 95%+ sure what is wanted, ask questions before planning.

## Process
1. Read every file the task touches (`worker/`, `dist/`, `drizzle/`, tests). Do not guess.
2. Find the real problem and its root cause, not just the symptom.
3. Propose 2–3 solutions. For each: idea, files affected, pros, cons, risk. Recommend one and say why.
4. Write `PLAN.md` using the template below, covering the recommended solution (list the alternatives briefly).
5. Stop. Tell the user: "Plan is in PLAN.md. Approve it (or pick another option), then run /execute."

## PLAN.md template
```
# Plan: <short title>

## Problem
<what and why, in 2-4 lines>

## Options
1. <name> - pros / cons / risk
2. <name> - pros / cons / risk
Recommended: <n>, because <reason>

## Steps (chosen option)
1. <file> - <exact change>
2. ...

## Data / migration impact
<D1 schema changes, or "none">

## Mobile check
<what to verify at ~375px, or "no UI change">

## Tests
<tests to add or update; new test files must be added to the `test` script in package.json>

## Verification
- npm run build
- npm test
- <manual checks>

## Risks / open questions
- ...
```
