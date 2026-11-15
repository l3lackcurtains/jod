# Phase: build

Goal: the approved plan (or the current step) implemented on every layer, tests first.

1. **Pin, then test** (timing per the profile's "Tests"; test-first is the default). If you'll change code that has no tests, first write characterization tests: call it, assert whatever it returns today (even if it's odd), name each test after what the code does, and see them pass. They stay green through the change, except for the behaviour the plan changes on purpose. Surprising results get raised, not "fixed". Then write the tests for the new behaviour, in the location and style the profile and the sibling tests use, and see them fail for the right reason, not with a setup error.
2. **Implement in the profile's layer order.**
   - Rebuild shared and generated code (shared packages, codegen) as soon as its source changes, before compiling the code that uses it.
   - If existing data needs it, add a migration or backfill script.
3. **Follow the plan's "Patterns to follow"** ([patterns.md](../../engineering/patterns.md)).
   - Open the model file next to the one you're writing and match its folder, naming, structure, UI pieces, classes, states and permission handling.
   - Grep before creating anything: reuse what exists. When something would now be duplicated, extract it and update the old callers.
   - No plan (`/jod:task build` alone)? Do the pattern study first.
   - A convention set by this change (mode `new`/`growing`): add its line to the profile's Conventions now, so the next file follows it.
4. **Build it right** ([principles.md](../../engineering/principles.md)). Implement the plan's Engineering decisions now, not "later":
   - thin entry points
   - tenant-scoped queries
   - indexes for new filters
   - capped pagination
   - slow work async, with retries
   - transactions and idempotent writes/jobs
   - timeouts on outbound calls
   - clear errors
   - no secrets in logs

   Test the failure, permission and duplicate paths, not only the happy path.
5. **Stay on the road** (`engineering` §2).
   - Touch only the planned files.
   - Tidying goes in as its own step before the behaviour change, never mixed in.
   - No new dependencies, patterns or abstractions that the plan didn't justify.
6. **Edit safely.**
   - Read before writing; use Edit for existing files; never write over a file you haven't read.
   - Keep the file's line endings.
   - Respect the profile's "Hands-off" list.
7. **Make the new tests pass.**
8. **Checkpoint.** Run `git diff --stat` and `git status --short`, and compare them with the plan's scope fence using the drift alarm list (`engineering` §2). If any item fires, stop and ask. Otherwise tick the step in the plan file and hand over to the test phase.
9. **One status line:** what was built per layer, which layers were skipped and why, and which existing files the new code is modelled on.
