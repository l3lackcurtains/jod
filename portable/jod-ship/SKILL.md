---
name: jod-ship
description: "Step 2 of 2, and the only thing that touches main. Final cross-commit review of everything on development, the full gate, a production-readiness check that runs the release the way production does (direct, Docker Compose, Kubernetes…), then merge development into main and return to development."
disable-model-invocation: true
---

# /jod-ship

Options: from the request (`verdict-only` = run the review and the checks, report, don't merge)

Step 2 of 2. `/jod-commit` (step 1) reviews work and commits it to `development`; `/jod-ship` releases `development` to `main`. **This is the only place `main` is touched.** No PRs, no other branches into `main`. The branch names, how production runs, and whether pushing `main` deploys all come from `.claude/jod.md` (defaults: `development` → `main`).

## Context
- Branch: run `git branch --show-current`
- Status: run `git status --short || true`
- Waiting for main: run `git log --oneline main..development 2>/dev/null | head -40 || true`

## 1. Preconditions
- **Branch:** you must be on `development`. On any other branch, stop: side branches go into `development` first (`/jod-commit` does that).
- **Uncommitted changes:** stop and say "run `/jod-commit` first". Don't commit them here.
- **In sync:** run `git fetch`. `development` must be pushed and level with `origin/development`. `main` must not have commits that `development` lacks, apart from earlier release merges (`git log --no-merges development..origin/main` must be empty). If it has any, stop and report them: someone touched `main` directly.
- **Something to ship:** if nothing is waiting (`git log main..development`), say so and stop.

## 2. Final review
- **List what's being released:** the commits waiting, and the roadmap items or issues they cover.
- **Review the combined diff** `main...development` with [review.md](../jod-engineering/references/review.md), limited to what per-commit reviews miss:
  - risk triage of HIGH files (§1);
  - cross-commit issues (§4): interactions, leftovers, half-finished work, backfills, breaking API fields, permission changes;
  - [principles](../jod-engineering/references/principles.md) gaps that only show across the release: missing indexes, unscoped queries, non-idempotent writes, schema changes that break existing data.
- **Skip the review** only if every waiting commit is docs- or config-only; say so.
- **Real findings:** fix them on `development` (a regression test per bug), commit with `fix(scope): …`, push, then continue. Skip the rest with a reason.

## 2b. Release cleanup
Before the gate, so the gate tests what actually ships: run [cleanup](../jod-cleanup/SKILL.md) with the `release` scope over the commits waiting. It lists what the release adds or leaves behind (bad comments, debug leftovers, commented-out code, code and files these commits made unused), and asks which to clean.
- **Cleaned:** one `chore(cleanup): …` commit per kind on `development`, pushed, then continue to the gate.
- **Skipped or declined:** continue, and list the open items in the report.
- **`verdict-only`:** list the candidates; change nothing.

## 3. Gate
Run every check and collect the results; don't stop at the first failure.
1. **Code gate** ([verify.md](../jod-engineering/references/verify.md) "Full gate"):
   - clean install against the lockfile;
   - typecheck;
   - all test suites (exact counts) plus e2e for changed areas;
   - production builds;
   - lint of the changed files.
2. **Production check** ([verify.md](../jod-engineering/references/verify.md) "Production check"): build and run the release **the way the profile says production runs it** (direct process, Docker Compose, Kubernetes, serverless…), from a clean checkout, with production-like config. Smoke-test it, then tear it down. This runs locally only; it never deploys anything.
3. **Deploy audit** of `git diff main...development`:
   - **Env vars:** are new ones in the production env example? Are they set on the server? Does each fail at startup when missing, rather than falling back? (Grep for `env.X || '…'` / `?? '…'` on secrets, auth, CORS and URLs.)
   - **Dependencies:** changes, and anything imported at runtime but installed only for development.
   - **Data:** migrations and backfills, their order relative to the deploy (expand → deploy → contract), and schema or index changes to existing data.
   - **Users and clients:** permission or plan-limit changes for existing users; removed or renamed API fields.
   - **Infrastructure:** changes to Dockerfiles, compose files, manifests or charts, ports, health checks and resources.
   - **Outside code:** vendor dashboards, prices, app settings, DNS, compliance items.
   - **Rollback:** how to undo this release (redeploy the previous image or commit; revert the merge). Flag anything one-way: migrations that can't be reversed, data backfills, external side effects.

**Verdict:** a table of each check → pass/fail (with counts, or the first error), then **RELEASE** or **BLOCK**.
- A production check that couldn't run (no Docker, no cluster access) counts as **BLOCK**. State exactly what wasn't verified; the user may accept the risk explicitly.
- On BLOCK: list the fixes needed, offer `/jod-fix`, and stop.

## 4. Release (on RELEASE, unless `verdict-only`)
If pushing `main` deploys (per the profile), first show the commits, the deploy audit and the post-deploy steps, and ask "Release to production now?". Proceed only on a yes. Otherwise, running `/jod-ship` is the go-ahead.

```
git checkout main && git pull --ff-only origin main
git merge --no-ff development -m "Release: <one-line summary of what ships>"
git push origin main
git checkout development
```
- **Conflict:** abort the merge (`git merge --abort`), switch back to `development`, and report.
- **Never** force-push, open a PR, commit on `main` directly, or merge any branch other than `development` into it.

## Report
Report as a release verdict and runbook ([report.md](../jod-engineering/references/report.md) → `/jod-ship`):
- **Heading:** released, with the merge `hash`, or blocked.
- **Gate:** a table of check → result with counts, including the production check (the runtime, what was started, and the smoke results).
- **Review:** findings fixed or skipped, one line each.
- **Release cleanup:** what was cleaned (lines, per kind) and what was left open.
- **After deploy:** numbered steps in order (migrations, env vars, settings).
- **Rollback:** how to undo the release, and anything one-way.
- **Verify in production:** per change, how to see it works and what a failure looks like.
- **Cleanup:** the cleanup reminder line, if cleanup is due ([cleanup](../jod-cleanup/SKILL.md) §5).
- **Next:** deploy, and confirm you're back on `development`.
