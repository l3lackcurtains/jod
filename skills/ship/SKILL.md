---
name: ship
description: Step 2 of 2. Final cross-commit review of everything waiting for the release branch, the full gate (clean install, typecheck, all tests, production builds, lint, deploy audit), then merge or open a PR per the project profile, and return to the work branch.
argument-hint: "[verdict-only]"
disable-model-invocation: true
---

# /keel:ship

Options: `$ARGUMENTS` (`verdict-only` = run the review and gate, report, don't merge)

Step 2 of 2. `/keel:commit` (step 1) reviews and commits work; `/keel:ship` releases it. The work branch, release branch, release mode (`merge` or `pr`) and whether the release deploys all come from `.claude/keel.md`. If there's no profile, detect the default branch (`git symbolic-ref refs/remotes/origin/HEAD`) and ask before merging.

## Context
- Branch: !`git branch --show-current`
- Status: !`git status --short || true`
- Recent branches: !`git branch --sort=-committerdate | head -5`

## 1. Preconditions
- **Branch:** you must be on the work branch (or the feature branch being released). Otherwise stop and ask.
- **Uncommitted changes:** stop and say "run `/keel:commit` first". Don't commit them here.
- **In sync:** run `git fetch`. The branch must be pushed and level with its remote. If nothing is waiting for the release branch (`git log --oneline <release>..<work>`), say so and stop.

## 2. Final review
- **List what's being released:** the commits waiting, and the roadmap items or issues they cover.
- **Review the combined diff** `<release>...<work>` with [review.md](../engineering/review.md), limited to what per-commit reviews miss:
  - risk triage of HIGH files (§1);
  - cross-commit issues (§4): interactions, leftovers, half-finished work, backfills, breaking API fields, permission changes;
  - [principles](../engineering/principles.md) gaps that only show across the release: missing indexes, unscoped queries, non-idempotent writes, schema changes that break existing data.
- **Skip the review** only if every waiting commit is docs- or config-only; say so.
- **Real findings:** fix them on the work branch (a regression test per bug), commit with `fix(scope): …`, push, then continue. Skip the rest with a reason.

## 3. Gate
Run every check and collect the results; don't stop at the first failure. Use the profile's full gate, per [verify.md](../engineering/verify.md):
1. Clean install against the lockfile.
2. Build shared and generated code, then typecheck everything.
3. All test suites, with exact counts, plus e2e for the areas changed since the release branch.
4. Production builds of every app, in the background.
5. Lint of the files changed since the release branch, reporting only errors on changed lines.
6. **Deploy audit** of `git diff <release>...<work>`:
   - new env vars: in the example files? Set on the server?
   - dependency changes
   - migrations and backfills to run, and schema or index changes to existing data
   - permission or plan-limit changes for existing users
   - removed or renamed API fields (breaking for external clients)
   - outside-code steps: vendor dashboards, prices, app settings, DNS
   - compliance items
   - fail-open defaults: grep for `env.X || '…'` / `?? '…'` on secrets, auth, CORS or URLs. They must fail at startup when missing.

**Verdict:** a table of each check → pass/fail (with counts or the first error), then **RELEASE** or **BLOCK**. On BLOCK: list the fixes needed, offer `/keel:fix-bug`, and stop.

## 4. Release (on RELEASE, unless `verdict-only`)
If the profile says the release deploys, or asks for a timing confirmation, show the commits, the deploy audit and the post-deploy steps, and ask "Release to production now?". Proceed only on a yes. Otherwise, running `/keel:ship` is the go-ahead.

**Mode `merge`:**
```
git checkout <release> && git pull --ff-only origin <release>
git merge --no-ff <work> -m "Merge <work>: <one-line summary of the release>"
git push origin <release>
git checkout <work>
```
If the merge conflicts, abort it (`git merge --abort`), switch back to `<work>` and report.

**Mode `pr`:** run `gh pr create --base <release> --head <work>`. The title summarises the release; the body lists the commits, the gate table and the deploy steps. Report the PR URL. Merge it only if the profile says to.

Never force-push.

## Report
- Final review (fixed/skipped + why)
- Gate table with counts
- Merge commit `hash`, or the PR URL
- **Back on `<work>`**
- Post-release steps (migrations, env vars, settings), repeated from the audit
