# How we review

One procedure: `/jod-commit` runs it on every change (from `/jod-task` or `/jod-fix`), `/jod-ship` across commits. The goal is to find real bugs, not to produce comments. A reviewer asked to find problems will always find *something*, so calibrate.

## 0. What was already looked at
- `/jod-commit`: the task loop's doubt passes don't replace this review (each looked at one decision), but you can spend less time on what they already questioned.
- `/jod-ship`: don't re-review commits one by one; look only for cross-commit issues (step 4).

## 1. Triage by risk
List the changed files and mark them **HIGH** when they touch:
- the profile's "High-risk areas";
- otherwise: auth and permissions, tenant scoping, payments and billing webhooks, money or stock math, crypto and secrets, outbound fetches of user URLs, queue and job processors, migrations and schema/index changes, plan or feature limits, personal or sensitive data.

Read HIGH files line by line as an attacker would, as a second instance or a concurrent user, and as a retried request or job. If the diff **removes** a guard, a validation, a tenant filter, a transaction, an audit call or a limit check, run `git log -S '<removed code>'` to see why it was there, and justify the removal or put it back.

## 2. Independent review
- **Scale it by risk.** Run one independent pass (the `code-review` skill, or a fresh subagent given the diff, the plan file if there is one, and these standards) when the diff has a HIGH file or more than ~200 changed lines. Otherwise our own checks (§3–§4) are enough. Its scope is correctness, security, data integrity, missed surfaces and gaps against the plan; style is out of scope.
- **Pick the reviewer by risk:** for a HIGH file in one domain, a specialist agent for it (security for auth, database for a migration) when one is available ([agents.md](agents.md)); never the agent that built the change.
- **Don't brief it with your conclusions.** Give it the diff, the plan and these standards, not your reasoning or "this should be fine": a reviewer told what to believe tends to confirm it. Ask it to find what's wrong, not to summarise.
- **Keep only findings you'd bet on (confidence ≥80).** Before fixing one, confirm it in the code. Zero findings is a valid result.
- **Introduced or pre-existing?** Check with `git diff`/`git blame` whether this change caused the problem. A pre-existing defect goes under "Noticed, not done" unless the change makes it worse or depends on it; fixing it here is drift.
- **Don't build robustness nobody needs (YAGNI).** If a finding suggests a "more robust" feature, Grep for real callers first. No callers means skip it.

## 3. Our own checks (always, whatever the reviewer said)
- **Patterns** ([patterns.md](patterns.md) §4). Do new files match their siblings? Does a new component, hook or helper duplicate an existing one? Is there copy-paste that should be shared?
- **Principles** ([principles.md](principles.md)). Walk the "Review asks" for each principle the change touches.
- **Silent failures.** Look for:
  - an empty `catch`, or catch-log-and-continue
  - optional chaining silently skipping a write
  - a default value returned on error
  - a swallowed transaction error
  - retries that end without marking the job failed
  - a client mutation without error handling
- **Drift.**
  - **Scope:** anything in the diff that isn't in the plan or the ask: remove it or justify it.
  - **New design:** new dependencies, patterns, abstractions or config options: is each one justified in the plan?
  - **Mixed changes:** is a tidy or refactor mixed into the behaviour change? Split it.
  - **Contracts:** did a public contract (API field, URL, flag, format) change?
- **Comments** ([principles.md](principles.md) §2). Grep the added lines (code, test names, API doc comments) for tracker or plan ids, step labels, history wording and commented-out code. Reword to the *why* or delete.
- **Gamed tests.** Grep the added lines for `.skip`, `.only`, `xit`, `@ts-ignore`, `eslint-disable`, `as any`. Check `git diff` for deleted test cases, loosened assertions, enlarged snapshots, and mocks of the code under test.
- **Tests that bite.** Would each new test fail if the code broke? Name the change that would turn it red. A test that only mirrors the implementation doesn't count.
- **Coverage** ([impact.md](impact.md) §5). Re-run the impact searches. Any hit on the old value or name outside intentional compatibility code needs fixing or a reason. Is every row of the impact map done with evidence, or explicitly n/a? Is every layer the profile lists covered?
## 4. Against the plan, and across commits
- **Check against the plan** (`.claude/plans/<slug>.md`, if there is one): is every item done, and every listed edge case tested? A plan with steps left unticked means the task isn't finished: say so, and review what's there. Do it yourself, or as part of the independent pass in §2; never as a second subagent.
- **Across the whole release (`/jod-ship`):**
  - interactions between commits
  - leftovers (debug code, TODOs, stray files)
  - half-finished work
  - schema changes that need a backfill
  - removed or renamed API fields that external clients rely on
  - permission changes for existing roles.

## 5. Act
- **Fix** what's real. Every real bug gets a regression test that fails without the fix.
- **Skip** everything else with a one-line reason.
- **Report a table:** finding → fixed / skipped (why).
- **Re-review if needed.** If the fixes were substantial, run §2–§3 once more on the new diff only.
