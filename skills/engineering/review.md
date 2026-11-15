# How we review

One procedure, used by `/sip:task review`, `/sip:commit` and `/sip:ship`. The goal is to find real bugs, not to produce comments. A reviewer asked to find problems will always find *something*, so calibrate.

## 0. Skip what's already reviewed
- `/sip:commit`: if `/sip:task review` already ran on this exact diff in this session and nothing changed since, don't review again; run only steps 3–4 on what changed after it.
- `/sip:ship`: don't re-review commits one by one; look only for cross-commit issues (step 4).

## 1. Triage by risk
List the changed files and mark them **HIGH** when they touch:
- the profile's "High-risk areas";
- otherwise: auth and permissions, tenant scoping, payments and billing webhooks, money or stock math, crypto and secrets, outbound fetches of user URLs, queue and job processors, migrations and schema/index changes, plan or feature limits, personal or sensitive data.

Read HIGH files line by line as an attacker would, as a second instance or a concurrent user, and as a retried request or job. If the diff **removes** a guard, a validation, a tenant filter, a transaction, an audit call or a limit check, run `git log -S '<removed code>'` to see why it was there, and justify the removal or put it back.

## 2. Independent review
- **Run a code-review pass** on the diff: the `code-review` skill if available, or a fresh subagent given only the diff and the standards. Its scope is correctness, security, data integrity and missed surfaces; style is out of scope.
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
- **Tests that bite.** Would each new test fail if the code broke? Name the change that would turn it red. A test that only mirrors the implementation doesn't count.
- **Every surface.** Is every layer listed in the profile updated, or explicitly not applicable?

## 4. Against the plan, and across commits
- **Check against the plan.** When there's an approved plan (saved to the scratchpad in the plan phase), give a **fresh** subagent the plan and the diff: is every item done, and every listed edge case tested? It reports gaps only.
- **Across the whole release (`/sip:ship`):**
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
- **Re-review if needed.** If the fixes were substantial, run steps 2–3 once more on the new diff only.
