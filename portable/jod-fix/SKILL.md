---
name: jod-fix
description: "Fix a bug properly — reproduce, trace the root cause backward, regression test that fails first, fix, hunt the same bug across the repo, verify live."
disable-model-invocation: true
---

# /jod-fix

Bug report: the user's description

Read `.claude/jod.md` (the profile) and [verify.md](../jod-engineering/verify.md). Fixes follow the surrounding code's patterns ([patterns.md](../jod-engineering/patterns.md)): no new style or helper when one already exists. **No fix before the root cause is shown with evidence.**

## 1. Reproduce
Pick the cheapest way that shows the bug, and record exactly what you saw:
- **a failing test** (preferred, since it becomes the regression test);
- **the running app,** as the role that hit the bug (check it's the current build; see the task check phase);
- **a read-only data query** (respect the profile's database rules);
- **the pasted log** (quote the exact line).

A screenshot path: Read the image. Rule out environment problems first: a misconfigured database, an unseeded test DB, stale containers or wrong env vars. If it can't be reproduced, say so and ask for the missing detail; don't fix blind.

## 2. Root cause
- **Trace backward.** Find the line that produces the bad value, then ask who called it and with what, one level at a time, until you reach where the bad value first appears. Fix it there, not where it shows.
- **It used to work?** Find a good commit and bisect before tracing: `git bisect start <bad> <good>`, then `git bisect run <focused test or script>`, then `git bisect reset` (in a temporary worktree if the tree has uncommitted changes: `jod-engineering` §2, "Git while working"). The first bad commit usually names the cause. Skip it when there's no known-good point or the check can't be scripted.
- **One hypothesis at a time.** Write it down ("X because Y") and test it with the smallest change or log. Don't stack guesses. After 2 failed fixes, stop: write what you tried and learned in the chat, and question the design with the user. Only if the work will continue in a fresh session, save that note as `.claude/plans/fix-<slug>.md`; `/jod-commit` deletes it with the fix.
- **Show the evidence:** the line, the data, the query, in one or two sentences. Separate the cause from things that are merely odd.
- **A specialist for the layer** ([agents.md](../jod-engineering/agents.md)): when the bug sits in one domain an available agent knows (a query plan, a container that won't start, a native crash, a cluster probe), give it the reproduction, the exact symptom and what you've ruled out, and ask for hypotheses with evidence, not a fix. You confirm the cause yourself before §3.
- **Money or data integrity:** check transaction boundaries, conditional updates, idempotency and rounding.
- **Outside our code** (a vendor revoked a token, an app review is pending): say so plainly and stop at what the code can improve, such as better handling or a notification.

## 3. Regression test, then fix
1. Write the test and run it **before** the fix, alone, with the profile's focused test command (the wider suites come in §5). It must fail with the bug's symptom, not with a setup or import error.
2. Fix the cause, not the symptom, with the smallest change. A fix deep in one domain may go to the specialist agent, briefed with the failing test and the cause ([agents.md](../jod-engineering/agents.md) §3); the test, the revert check below and §4–§5 stay with you. No refactor or redesign in a bug fix; propose it separately. See the test pass.
3. Revert the fix once and confirm the test goes red again.

## 4. Hunt the pattern, and cover the fix
If the fix changes a contract (a format, a field, a message, a behaviour), also follow [impact.md](../jod-engineering/impact.md) so every consumer gets it.

- **Start narrow:** a search that matches exactly this bug.
- **Widen one element at a time:** other fields, other modules or vendors, null and empty cases, other roles or portals.
- **Search the whole repo,** not just this module. Stop widening when most hits are false positives.
- **Fix every real occurrence,** or list the ones you left and why.

## 5. Verify
Typecheck, plus the full suites of the touched packages (exact counts) and e2e for the affected flow if the project has it. Then re-check live where the bug was visible.

Report as an incident note ([report.md](../jod-engineering/report.md) → `/jod-fix`), in this order:
- **Symptom:** what the user saw.
- **Cause:** one line, with `path:line`.
- **Fix:** what changed.
- **Same bug elsewhere:** what was fixed, and what was left (with why).
- **Proof:** the regression test failing without the fix, the suite counts, and the live check.
- **Needs you:** anything outside code (a data fix, reconnecting an account, a setting).
- **Learn:** if the bug came from a rule the code doesn't show, propose one Gotchas line for the profile (or a hook, if the same rule was broken before). Apply it only on the user's yes.
- **Next:** `/jod-commit` (not committed yet).
