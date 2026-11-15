---
name: task
description: Do a task (feature, improvement, roadmap item) end to end — plan, build, test, review, manual check, done — with engineering principles and existing patterns enforced. Run all phases, or one sub-command on its own.
argument-hint: "[plan|build|test|review|check|done] <task description, roadmap id or notes>"
disable-model-invocation: true
---

# /jod:task

Arguments: `$ARGUMENTS`

## Pick the mode
- **First word is a sub-command** (`plan`, `build`, `test`, `review`, `check`, `done`): run **only that phase**, using the rest as input and the conversation for context.
- **Anything else:** the whole text is the task; run every phase in order.
- **A roadmap or issue id:** its spec (from the docs or the `gh issue` the profile points to) is the starting point.

| Sub-command | Phase file | What it does |
|---|---|---|
| `plan` | [phases/plan.md](phases/plan.md) | Explore, study patterns, decide engineering, show a plan, **wait for OK** |
| `build` | [phases/build.md](phases/build.md) | Tests first, then every layer, following patterns and principles |
| `test` | [phases/test.md](phases/test.md) | Typecheck + tests of touched packages until green |
| `review` | [phases/review.md](phases/review.md) | Calibrated review, fix what holds up |
| `check` | [phases/check.md](phases/check.md) | See it working in the real app |
| `done` | [phases/done.md](phases/done.md) | Final run, docs, summary; hands over to `/jod:commit` |

## Rules for the full loop
1. **Read before starting:**
   - `.claude/jod.md` (the project profile; missing → offer `/jod:setup`)
   - [principles.md](../engineering/principles.md) (build it right)
   - [patterns.md](../engineering/patterns.md) (copy the codebase)
   - [review.md](../engineering/review.md) (how we review)
   - [verify.md](../engineering/verify.md) (what counts as proof).
2. **Wait for the plan's OK.** The plan phase ends by stopping for the user's OK; don't build before it.
   - **Fast path:** a small change (≤3 files, no schema, API contract, permission, money/data-integrity or security change) gets a 3-line plan and goes straight to build.
3. **Build big work step by step** (A, B, C…), each one shippable. After building a step, run test → review → check. If any of them changes code, go round again.
   - **Max 3 rounds** per step. If it's still failing, stop and show what's stuck and what you'd try, instead of guessing.
4. **Never commit, push or merge here.** `done` hands over to `/jod:commit`; `/jod:ship` releases.
5. **Post one short line per phase**, e.g. "tests: 1078 passed", "review: 3 fixed, 1 skipped".

Copy this checklist and keep it updated:
```
Step A
- [ ] plan (approved / fast path)
- [ ] build
- [ ] test: counts
- [ ] review: fixed / skipped
- [ ] check: what was seen live
- [ ] done
Round: 1 / 3
```

## Current state
- Branch: !`git branch --show-current`
- Uncommitted: !`git status --short | head -20 || true`
- Profile: !`test -f .claude/jod.md && echo "found" || echo "MISSING: offer /jod:setup"`
