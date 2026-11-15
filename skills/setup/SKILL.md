---
name: setup
description: Create or refresh this repo's Jod profile (.claude/jod.md) by reading the codebase — layers to change, verify commands, branches, release mode, dev-server and database rules, high-risk areas, reference implementations and gotchas.
argument-hint: "[refresh]"
disable-model-invocation: true
---

# /jod:setup

Options: `$ARGUMENTS` (`refresh` = update an existing profile, keeping what the user wrote)

The profile is how the rest of Jod stays project-agnostic: every skill reads `.claude/jod.md` first. Fill it from **evidence in the repo**, not guesses. Mark anything you couldn't confirm as `TODO (confirm)`.

## 1. Read the repo
- **Instructions:** `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `README*`, docs about conventions or architecture.
- **Workspace layout:** workspaces and packages (`package.json` workspaces, `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `pyproject.toml`, `go.work`, `Cargo.toml`), plus the apps and packages folders.
- **Scripts and CI:** package scripts, the `Makefile`, `.github/workflows/*` or other CI. Use what CI runs as the source of truth for the gate.
- **Package manager:** from the lockfile (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lock`, `uv.lock`, `poetry.lock`).
- **Git and release:**
  - branches: `git branch -a`, the default branch, and `git log --oneline -20` for the commit message style;
  - whether the repo uses PRs (`gh pr list --state merged --limit 5`) or local merges;
  - deploy config (Dockerfiles, `docker-compose*`, Dokploy/Vercel/Fly/Render config). Does a push to the release branch deploy?
- **Environment:** the env example files.
  - Does local dev point at a shared or production database, queue or cache? Look at the example env and any `.env` comments, but never print secret values.
  - Dev ports and dev scripts.
- **Testing:** test frameworks and where tests live (next to the source, `__tests__/`, `test/`, e2e folders), and any special e2e setup (seeded DB, replica set, emulators).
- **Hands-off code:** generated folders (`gen/`, `__generated__`, codegen config) and vendored UI primitives.
- **Reference implementations:** the best existing example of each kind of thing: one module or endpoint, one list endpoint with pagination, one job or queue processor, one form dialog, one table/list view, one hook.
- **High-risk areas:** auth, permissions, payments or billing, money or stock, personal data, webhooks, crypto, outbound fetches.
- **Architecture to keep:** the core decisions the codebase is built on, which a change must extend rather than replace. Examples: the module layout, data access and state management patterns, API style, auth model, and "no ORM"-style choices visible in the code or docs.
- **Feedback tools:** where the logs go locally, how to see sent emails and queued jobs, and test accounts per role.

## 2. Ask only what the repo can't tell you
Use AskUserQuestion, at most 4 questions, each with a recommended option. Typical questions:
- **Work branch:** which branch day-to-day work goes on (`development`, or feature branches).
- **Release mode:** local `--no-ff` merge, or a PR.
- **Deploys:** whether pushing the release branch deploys, and so needs a timing confirmation.
- **Dev servers:** whether Claude may start them.
- **Shared database:** whether the local DB is shared or production (then it's read-only).

## 3. Write `.claude/jod.md`
Start from [template.md](template.md). Keep it short and specific. Every line should be something Claude couldn't have guessed. Link to existing docs instead of copying them.

With `refresh`: read the existing profile first, keep what the user wrote, and update only what the repo shows has changed. Check that each Reference implementation still exists and is still the newest of its kind, and flag the ones that aren't. Show a summary of what changed.

## 4. Report and guards
Show the profile and list the `TODO (confirm)` lines.

Then offer the hard guards as ready `.claude/settings.json` snippets. Keep the set small: only rules with zero exceptions.
- `permissions.deny` for edits to the profile's Hands-off paths, e.g. `Edit(/apps/web/src/components/ui/**)`;
- deny `Bash(git push --force:*)`, `Bash(git add -A:*)`, and the wrong package managers;
- optionally, ask before edits to the lockfile and manifests, so dependency changes are always deliberate;
- deny dev-server commands if the user runs them;
- optional: a Stop hook that runs the fastest typecheck, only if it takes under ~20 s.

Add them only if the user says yes. Also suggest adding `.claude/plans/` to `.gitignore`.

Don't commit the profile; `/jod:commit` will.
