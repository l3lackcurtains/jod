# Phase: build

Goal: the approved plan (or the current step) implemented on every layer, tests first.

1. **Pin, then test first.** If you'll change code that has no tests, first write characterization tests: call it, assert whatever it returns today (even if it's odd), name each test after what the code does, and see them pass. They stay green through the change, except for the behaviour the plan changes on purpose. Surprising results get raised, not "fixed". Then write the tests for the new behaviour, in the location and style the profile and the sibling tests use, and see them fail for the right reason, not with a setup error.
2. **Implement in the profile's layer order.**
   - Rebuild shared and generated code (shared packages, codegen) as soon as its source changes, before compiling the code that uses it.
   - If existing data needs it, add a migration or backfill script.
3. **Follow the plan's "Patterns to follow"** ([patterns.md](../../engineering/patterns.md)).
   - Open the model file next to the one you're writing and match its folder, naming, structure, UI pieces, classes, states and permission handling.
   - Grep before creating anything: reuse what exists. When something would now be duplicated, extract it and update the old callers.
   - No plan (`/jod:task build` alone)? Do the pattern study first.
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
5. **Stay on the road** (engineering §2).
   - Touch only the planned files.
   - Tidying the code first is fine, but as a separate change before the behaviour change, never mixed in.
   - No new dependencies, patterns or abstractions that the plan didn't justify.
   - If you hit the drift alarm (files outside the plan, about 2× the size, an unplanned migration), stop and ask.
6. **Edit safely.**
   - Read before writing; use Edit for existing files; never write over a file you haven't read.
   - Keep the file's line endings.
   - Respect the profile's "Hands-off" list.
7. **Make the new tests pass.**
8. **Checkpoint.** Run `git diff --stat` and `git status --short` and compare them with the plan's scope fence. Stop and ask if:
   - a file outside the fence changed;
   - a lockfile or manifest changed without a planned dependency;
   - a new folder or a new kind of file appeared;
   - the diff is more than about 2× the plan;
   - a public type, DTO, route or schema changed that the plan didn't name.

   Otherwise tick the step in the plan file and hand over to the test phase.
9. **One status line:** what was built per layer, which layers were skipped and why, and which existing files the new code is modelled on.
