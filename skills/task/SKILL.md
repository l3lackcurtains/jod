---
name: task
description: "Do a task (feature, improvement, roadmap item) end to end — plan, build, test, manual check, done — with engineering principles and existing patterns enforced. Run all phases, or one sub-command on its own."
argument-hint: "[plan|build|test|check|done] <task description, roadmap id or notes>"
disable-model-invocation: true
---

# /jod:task

Arguments: `$ARGUMENTS`

## Pick the mode
- **First word is a sub-command** (`plan`, `build`, `test`, `check`, `done`): run **only that phase**, using the rest as input and the conversation for context.
- **Anything else:** the whole text is the task; run every phase in order.
- **A roadmap or issue id:** its spec (from the docs or the `gh issue` the profile points to) is the starting point.
- **A saved plan slug** (`.claude/plans/<slug>.md` exists): resume from it. Read the plan and its handoff notes, then continue at the first unticked step, in a fresh session if the old one is long.

| Sub-command | Phase file | What it does |
|---|---|---|
| `plan` | [phases/plan.md](phases/plan.md) | Explore, study patterns, split the work into steps, then ask: run all steps, or step by step (no answer → run all) |
| `build` | [phases/build.md](phases/build.md) | Tests first, then every layer, following patterns and principles |
| `test` | [phases/test.md](phases/test.md) | Typecheck + tests of touched packages until green |
| `check` | [phases/check.md](phases/check.md) | See it working in the real app |
| `done` | [phases/done.md](phases/done.md) | Final run, docs, summary; hands over to `/jod:commit` |

## Size it once, up front
Decide from what you already know (the ask, a quick grep), not after a full exploration. Say the size in one line.

| Size | When | The loop |
|---|---|---|
| **quick** | about 3 files or fewer, one code layer (docs it touches don't count), no risk surface (below), nothing the user must decide | A 3-line plan (what, files, check), no question, no plan file, no impact table. Build with the focused test → one test run of the related tests + typecheck → a live check only if a user sees the change → a short done report. |
| **standard** | everything else | The phases below, as written. |

**Risk surface means standard, always:** a schema or migration, a public contract, permissions or tenant scoping, money or stock math, auth or secrets, deleting data. **Escalate** the moment a quick task grows (a 4th file, a second layer, a risk surface appears): say so, write the standard plan, and continue from there. Unsure? Pick standard.

Most solo work is quick. Its speed comes from doing less ceremony, not from skipping proof: a behaviour change still gets a test that failed first, and "done" still needs a run you saw pass.

## Rules for the full loop
1. **Before starting,** read `.claude/jod.md` (the project profile; missing → offer `/jod:setup`) and the `engineering` skill (stay on the road, stop-and-ask, evidence).
   - Each phase opens the guide it needs when it reaches it: [patterns.md](../engineering/references/patterns.md) and [principles.md](../engineering/references/principles.md) in plan and build, [verify.md](../engineering/references/verify.md) in test and done, [review.md](../engineering/references/review.md) §1 in a doubt pass.
   - Don't load them all up front.
2. **Wait for the plan's OK** when [plan.md](phases/plan.md) says to (it follows the profile's "Plan approval"); don't build before it.
3. **Work through the plan's steps in the chosen mode:** "run all steps" (the default) or "step by step", which pauses for "next" after each step. Each step: build → test → a doubt pass if the plan marks it risky ([doubt.md](phases/doubt.md)) → a live check if one is due ([check.md](phases/check.md)). Then post its status line and tick it in the plan file, with "check pending" if its live check comes later. When every step is done, run `done` once.
   - **Fixes re-run only what they touch** ([verify.md](../engineering/references/verify.md) "Run the least that proves it"), and the live check only if the fix changed something a user can see.
   - **Restart instead of grinding.** After 2 failed rounds on the same problem, write a handoff into the plan file (save the plan now if it wasn't saved): what was tried, what each attempt showed, and the current best hypothesis. Then recommend `/clear` and a fresh `/jod:task build <slug>`. Don't make a third attempt in a polluted context.
   - The drift alarm (`engineering` §2) can stop any step; the build checkpoint checks it.
4. **The task ends at `done`.** Reviewing the change, committing, pushing, branches and releases are `/jod:commit`'s and `/jod:ship`'s jobs: don't do them here, and don't plan for them. Git as a tool is fine (`engineering` §2, "Git while working").
5. **Post one status line per phase**, e.g. `✅ test · 1078 passed`, `⚠️ doubt (migration) · 1 fixed`. End the loop with the done report ([report.md](../engineering/references/report.md)).

Copy this checklist and keep it updated:
```
Plan: approved / no wait needed · Mode: run all steps | step by step
- [ ] 1. <step goal>: build · test · doubt (if risky) · check (now | pending)
- [ ] 2. <step goal>: build · test · doubt (if risky) · check (now | pending)
- [ ] … (as many as the plan has)
- [ ] done
Failed rounds on the current step: 0 (at 2: hand off and restart)
```

## Current state
- Uncommitted: !`git status --short | head -20 || true`
- Profile: !`test -f .claude/jod.md && echo "found" || echo "MISSING: offer /jod:setup"`
