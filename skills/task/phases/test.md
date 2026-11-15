# Phase: test

Goal: every touched package compiles and its tests pass.

1. Follow [verify.md](../../engineering/verify.md) "Per change", with the commands from the profile.
2. Start with the affected test paths; finish with the full suite of each touched package, plus e2e for touched money, data-integrity, permission or concurrency flows if the project has e2e.
3. On failure: read the error and fix the cause. Change a test only when it encodes behaviour the task intentionally changes, and say so.
4. Report exact results, e.g. `api: tsc ok, 1078 passed · web: 258 passed`. Never claim a pass you didn't see in this turn.
