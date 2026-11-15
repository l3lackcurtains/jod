# Phase: build

Goal: the approved plan (or the current step) implemented on every layer, tests first.

1. **Tests first** for the core behaviour, in the location and style the profile and the sibling tests use. Run them and see them fail for the right reason, not with a setup error.
2. **Implement in the profile's layer order.**
   - Rebuild shared and generated code (shared packages, codegen) as soon as its source changes, before compiling the code that uses it.
   - If existing data needs it, add a migration or backfill script.
3. **Follow the plan's "Patterns to follow"** ([patterns.md](../../engineering/patterns.md)).
   - Open the model file next to the one you're writing and match its folder, naming, structure, UI pieces, classes, states and permission handling.
   - Grep before creating anything: reuse what exists. When something would now be duplicated, extract it and update the old callers.
   - No plan (`/keel:task build` alone)? Do the pattern study first.
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
5. **Edit safely.**
   - Read before writing; use Edit for existing files; never write over a file you haven't read.
   - Keep the file's line endings.
   - Respect the profile's "Hands-off" list.
6. **Make the new tests pass,** then hand over to the test phase.
7. **One status line:** what was built per layer, which layers were skipped and why, and which existing files the new code is modelled on.
