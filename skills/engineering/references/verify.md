# Verify

The commands come from the profile (`.claude/jod.md` → "Verify commands"). Without a profile, read the package scripts (`package.json`, `pyproject.toml`, `Makefile`, `go.mod`, `Cargo.toml`, CI workflow files) and use what CI runs.

## Run the least that proves it
- **Three sizes of test run:** use the smallest one that proves the claim you're making.
  - *focused*: one test file or test name, while writing code (the profile's focused command).
  - *related*: the tests that import the changed files, once per step. Use the runner's own mode, not a whole folder: `jest --findRelatedTests <files>`, `vitest related <files> --run`, `pytest <the test files for the changed modules>`, `go test` on the touched packages only, `cargo test -p <crate>`. The profile's "Related tests" command, when it has one.
  - *full*: every suite of the touched packages, once per change.

  A profile without a focused or related command (made before it had one): work it out from the test runner, and propose adding it to the profile.
- **Don't re-run a pass.** A command that passed in this session counts as evidence until a file it covers changes (check with `git status`/`git diff`). After a change, re-run only the commands that cover the changed files. The same goes for builds and codegen: rebuild only when their sources changed since the last run.

## Typecheck fast
A full typecheck of a big project takes about a minute, and re-running it after every edit was the second-largest cost in real sessions. So:
- **Once per step,** after its edits, not after each edit. While writing, the focused test is the feedback loop.
- **Watch mode when the tool allows it:** start the profile's watch typecheck once in the background (e.g. `tsc --noEmit --watch --preserveWatchOutput`, `cargo watch -x check`) and read its latest output after the step's edits, instead of starting a cold compile. Stop it when the task ends.
- **Otherwise incremental:** `tsc --noEmit --incremental` (or `tsc -b` for project references), `mypy` with its cache, `go vet` on the touched packages. Only the touched package, unless the change crosses packages.

## Per change (`/jod:task test`, `/jod:commit`)
1. **Work out what you touched.** List the touched packages or apps from `git status --short` and `git diff --stat`.
2. **Build what depends on it.** Rebuild shared or generated code first (shared packages, OpenAPI/GraphQL codegen, ORM clients) when its source changed.
3. **Check each touched package.** For each:
   - typecheck or compile (the fast way, above);
   - run the related tests.

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

## Production check (`/jod:ship`)
**Goal:** prove the release starts and serves the way production runs it, not just that it compiles. The runtime and commands come from the profile's "Production" section. Run everything locally, and never against production systems.

### In every runtime
1. **Clean checkout.** `git worktree add <tmp> development`, then a frozen install and the production build there. This catches files missing from git and builds that only work on your machine. Remove the worktree at the end.
2. **Production-like config.** Start from the production env example. Use safe dummy secrets and local services, set `NODE_ENV=production` (or the stack's equivalent), and leave out dev-only overrides.
   - Every env var the code reads must exist in the example.
   - A missing required variable must stop startup with a clear error.
3. **Migrations.** Run them on a fresh local database, and check they're safe to re-run. If the deploy order matters (expand → deploy → contract), say so in the report.
4. **Start, smoke, stop.** Start it exactly as production does (see below), then:
   - wait for the health or readiness check;
   - hit the health endpoint, plus one real request per area changed in this release;
   - read the logs for errors or warnings in the first ~30 seconds;
   - send SIGTERM and confirm a clean shutdown.

### By runtime
- **Direct process** (a runtime command, a process manager, a service unit, or a binary): run the profile's production start command against the built output, not the dev command. Check that the process-manager or service config points to the right entry file, port and env.
- **Docker Compose:**
  - `docker compose -f <prod file> config`: validates the file and fills in env vars. Any warning about an unset variable is a finding.
  - `docker compose -f <prod file> -p jod-ship-check up -d --build --wait` (`--wait` makes compose wait until the services are healthy), with production-like env. Smoke-test, then `docker compose -p jod-ship-check down -v`.
  - Check the file: every long-running service has a health check and a restart policy; no source folders are bind-mounted; image tags are pinned; ports follow the profile's rules.
- **Kubernetes:**
  - Render the manifests with the project's own tool (the profile says which), then validate them: `kubectl apply --dry-run=server` if the profile allows cluster access, otherwise a client-side dry run or schema validation.
  - Check:
    - images use the tag being built, never `latest`;
    - readiness and liveness probes hit real endpoints;
    - resource requests and limits are set;
    - every env, ConfigMap and Secret reference exists;
    - migrations run as a Job or init container, ordered before the new pods.
  - Build each image, and run it locally with the Deployment's `command`/`args`, env and port, then smoke-test it.
- **Serverless or static:** the production build, function bundle size and runtime limits, and env vars per environment. If the host offers a local emulator, smoke-test with it.

If any step can't run here (no Docker, no cluster access, a missing tool), report exactly what wasn't verified. It's a BLOCK unless the user accepts the risk.

## Reporting
- **Report exact counts**, e.g. `api: tsc ok, 1078 passed · web: 272 passed`.
- **Never claim a pass you didn't see.** It must be from this session, on the files as they are now; if it was reused rather than re-run, say "unchanged since <when>". If a check wasn't run, say so.
- **Flaky tests:**
  - a one-off failure gets re-run in isolation;
  - a test that's flaky gets fixed, not ignored.
- **Failures from local leftovers:** if a failure comes only from local artifacts (a running dev server's generated files, stale caches), say so and confirm with a clean build (fresh clone, container build or CI) before calling it green.
