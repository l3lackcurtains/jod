# Phase: test

Goal: every touched package compiles and its tests pass.

1. Follow [verify.md](../../engineering/references/verify.md) "Per change", with the commands from the profile.
2. Run the related tests (the runner's related mode, not whole folders) and the typecheck of each touched package, the fast way ([verify.md](../../engineering/references/verify.md) "Typecheck fast"). Skip any that already passed on these files ("Don't re-run a pass"). Add e2e only for touched money, data-integrity, permission or concurrency flows, if the project has e2e. The full suites run once, in `done`.
3. On failure: read the error and fix the cause. Change a test only when it encodes behaviour the task intentionally changes, and say so.
4. Report one status line, e.g. `✅ test · api 1078 passed · web 258 passed`. If anything failed, add a table of check → exact error. Never claim a pass you didn't see this session on the files as they are now.
