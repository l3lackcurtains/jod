# How we review

One procedure, used by `/jod-task review`, `/jod-commit` and `/jod-ship`. The goal is to find real bugs, not to produce comments. A reviewer asked to find problems will always find *something*, so calibrate.

## 0. Skip what's already reviewed
- `/jod-commit`: if `/jod-task review` already ran on this exact diff in this session and nothing changed since, don't review again; run only §3–§4 on what changed after it.
- `/jod-ship`: don't re-review commits one by one; look only for cross-commit issues (step 4).

## 1. Triage by risk
List the changed files and mark them **HIGH** when they touch:
- the profile's "High-risk areas";
- otherwise: auth and permissions, tenant scoping, payments and billing webhooks, money or stock math, crypto and secrets, outbound fetches of user URLs, queue and job processors, migrations and schema/index changes, plan or feature limits, personal or sensitive data.

Read HIGH files line by line as an attacker would, as a second instance or a concurrent user, and as a retried request or job. If the diff **removes** a guard, a validation, a tenant filter, a transaction, an audit call or a limit check, run `git log -S '<removed code>'` to see why it was there, and justify the removal or put it back.

## 2. Independent review
- **Scale it by risk.** Run one independent pass (the `code-review` skill, or a fresh subagent given the diff, the plan file if there is one, and these standards) when the diff has a HIGH file or more than ~200 changed lines. Otherwise our own checks (§3–§4) are enough. Its scope is correctness, security, data integrity, missed surfaces and gaps against the plan; style is out of scope.
- **Keep only findings you'd bet on (confidence ≥80).** Before fixing one, confirm it in the code.
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
- **Gamed tests.** Grep the added lines for `.skip`, `.only`, `xit`, `@ts-ignore`, `eslint-disable`, `as any`. Check `git diff` for deleted test cases, loosened assertions, enlarged snapshots, and mocks of the code under test.
- **Tests that bite.** Would each new test fail if the code broke? Name the change that would turn it red. A test that only mirrors the implementation doesn't count.
- **Every surface.** Is every layer listed in the profile updated, or explicitly not applicable?

## 4. Against the plan, and across commits
- **Check against the plan** (`.claude/plans/<slug>.md`, if there is one): is every item done, and every listed edge case tested? Do it yourself, or as part of the independent pass in §2; never as a second subagent.
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
