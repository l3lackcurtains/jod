---
name: jod-task
description: "Do a task (feature, improvement, roadmap item) end to end — plan, build, test, review, manual check, done — with engineering principles and existing patterns enforced. Run all phases, or one sub-command on its own."
disable-model-invocation: true
---

# /jod-task

Arguments: the user's request

## Pick the mode
- **First word is a sub-command** (`plan`, `build`, `test`, `review`, `check`, `done`): run **only that phase**, using the rest as input and the conversation for context.
- **Anything else:** the whole text is the task; run every phase in order.
- **A roadmap or issue id:** its spec (from the docs or the `gh issue` the profile points to) is the starting point.
- **A saved plan slug** (`.claude/plans/<slug>.md` exists): resume from it. Read the plan and its handoff notes, then continue at the first unticked step, in a fresh session if the old one is long.

| Sub-command | Phase file | What it does |
|---|---|---|
| `plan` | [phases/plan.md](phases/plan.md) | Explore, study patterns, decide engineering, show a plan, **wait for OK** |
| `build` | [phases/build.md](phases/build.md) | Tests first, then every layer, following patterns and principles |
| `test` | [phases/test.md](phases/test.md) | Typecheck + tests of touched packages until green |
| `review` | [phases/review.md](phases/review.md) | Calibrated review, fix what holds up |
| `check` | [phases/check.md](phases/check.md) | See it working in the real app |
| `done` | [phases/done.md](phases/done.md) | Final run, docs, summary; hands over to `/jod-commit` |

## Rules for the full loop
1. **Before starting,** read `.claude/jod.md` (the project profile; missing → offer `/jod-setup`) and the `jod-engineering` skill (stay on the road, stop-and-ask, evidence).
   - Each phase opens the guide it needs when it reaches it: [patterns.md](../jod-engineering/patterns.md) and [principles.md](../jod-engineering/principles.md) in plan and build, [verify.md](../jod-engineering/verify.md) in test and done, [review.md](../jod-engineering/review.md) in review.
   - Don't load them all up front.
2. **Wait for the plan's OK** when [plan.md](phases/plan.md) says to (it follows the profile's "Plan approval"); don't build before it.
3. **Build big work step by step** (A, B, C…), each one shippable. After building a step, run test → review → check. If any of them changes code, go round again.
   - **Restart instead of grinding.** After 2 failed rounds on the same problem, write a handoff into the plan file: what was tried, what each attempt showed, and the current best hypothesis. Then recommend `/clear` and a fresh `/jod-task build <slug>`. Don't make a third attempt in a polluted context.
   - The drift alarm (`jod-engineering` §2) can stop any step; the build checkpoint checks it.
4. **Never commit, push or merge here.** Work happens on `development` (or a side branch that `/jod-commit` merges into it). `done` hands over to `/jod-commit`; only `/jod-ship` touches `main`.
5. **Post one short line per phase**, e.g. "tests: 1078 passed", "review: 3 fixed, 1 skipped".

Copy this checklist and keep it updated:
```
Step A
- [ ] plan (approved / no wait needed)
- [ ] build
- [ ] test: counts
- [ ] review: fixed / skipped
- [ ] check: what was seen live
- [ ] done
Failed rounds: 0 (at 2: hand off and restart)
```

## Current state
- Branch: run `git branch --show-current`
- Uncommitted: run `git status --short | head -20 || true`
- Profile: run `test -f .claude/jod.md && echo "found" || echo "MISSING: offer /jod-setup"`
