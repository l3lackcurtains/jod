---
name: fix-bug
description: Fix a bug properly — reproduce, trace the root cause backward, regression test that fails first, fix, hunt the same bug across the repo, verify live.
argument-hint: "<symptom, error, pasted log, URL, screenshot path or issue id>"
disable-model-invocation: true
---

# /jod:fix-bug

Bug report: `$ARGUMENTS`

Read `.claude/jod.md` (the profile) and [verify.md](../engineering/verify.md). Fixes follow the surrounding code's patterns ([patterns.md](../engineering/patterns.md)): no new style or helper when one already exists. **No fix before the root cause is shown with evidence.**

## 1. Reproduce
Pick the cheapest way that shows the bug, and record exactly what you saw:
- **a failing test** (preferred, since it becomes the regression test);
- **the running app,** as the role that hit the bug (check it's the current build; see the task check phase);
- **a read-only data query** (respect the profile's database rules);
- **the pasted log** (quote the exact line).

A screenshot path: Read the image. Rule out environment problems first: a misconfigured database, an unseeded test DB, stale containers or wrong env vars. If it can't be reproduced, say so and ask for the missing detail; don't fix blind.

## 2. Root cause
- **Trace backward.** Find the line that produces the bad value, then ask who called it and with what, one level at a time, until you reach where the bad value first appears. Fix it there, not where it shows.
- **One hypothesis at a time.** Write it down ("X because Y") and test it with the smallest change or log. Don't stack guesses. After 3 failed fixes, stop and question the design with the user.
- **Show the evidence:** the line, the data, the query, in one or two sentences. Separate the cause from things that are merely odd.
- **Money or data integrity:** check transaction boundaries, conditional updates, idempotency and rounding.
- **Outside our code** (a vendor revoked a token, an app review is pending): say so plainly and stop at what the code can improve, such as better handling or a notification.

## 3. Regression test, then fix
1. Write the test and run it **before** the fix. It must fail with the bug's symptom, not with a setup or import error.
2. Fix the cause, not the symptom, and see the test pass.
3. Revert the fix once and confirm the test goes red again.

## 4. Hunt the pattern
- **Start narrow:** a search that matches exactly this bug.
- **Widen one element at a time:** other fields, other modules or vendors, null and empty cases, other roles or portals.
- **Search the whole repo,** not just this module. Stop widening when most hits are false positives.
- **Fix every real occurrence,** or list the ones you left and why.

## 5. Verify
Typecheck, plus the full suites of the touched packages (exact counts) and e2e for the affected flow if the project has it. Then re-check live where the bug was visible.

Report:
- cause (one line)
- fix
- other places fixed
- tests (counts)
- live check result
- anything the user must do outside code (a data fix, reconnecting an account, a setting).

Not committed: suggest `/jod:commit`, then `/jod:ship` to release.
