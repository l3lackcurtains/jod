# Verify

The commands come from the profile (`.claude/jod.md` → "Verify commands"). Without a profile, read the package scripts (`package.json`, `pyproject.toml`, `Makefile`, `go.mod`, `Cargo.toml`, CI workflow files) and use what CI runs.

## Per change (`/jod:task test`, `/jod:commit`)
1. **Work out what you touched.** List the touched packages or apps from `git status --short` and `git diff --stat`.
2. **Build what depends on it.** Rebuild shared or generated code first (shared packages, OpenAPI/GraphQL codegen, ORM clients) when its source changed.
3. **Check each touched package.** For each:
   - typecheck or compile;
   - run the affected tests.

   Run the full suite of each touched package **once**: in `/jod:task done`, or in `/jod:commit` if `done` didn't already run it on this exact diff in this session. Not on every step.
4. **Lint only the files you changed**, without auto-fix. Fix only the errors on lines you changed; errors on other lines were already there.
5. **On failure, fix the cause, not the test.** Change a test only when it encodes behaviour the change intentionally replaces, and say so.

## Full gate (`/jod:ship`)
Run every check and collect the results; don't stop at the first failure:
- **Clean install** against the lockfile (frozen).
- **Typecheck everything.**
- **All test suites,** with exact counts, plus e2e for the areas changed since the release branch.
- **Production builds** of every app. They catch errors the typecheck and dev server miss: server/client boundaries, prerender, bundling.
- **Lint** of the files changed since the release branch.

Run long commands in the background with generous timeouts.

## Reporting
- **Report exact counts**, e.g. `api: tsc ok, 1078 passed · web: 272 passed`.
- **Never claim a pass you didn't see in this turn.** If a check wasn't run, say so.
- **Flaky tests:**
  - a one-off failure gets re-run in isolation;
  - a test that's flaky gets fixed, not ignored.
- **Failures from local leftovers:** if a failure comes only from local artifacts (a running dev server's generated files, stale caches), say so and confirm with a clean build (fresh clone, container build or CI) before calling it green.
