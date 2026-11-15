---
name: setup
description: "Create or refresh this repo's Jod profile (.claude/jod.md). Scans the stack and existing patterns, shows what it found, asks how you want to work (mode, workflow, safety, rigor, which patterns are canonical), then writes the profile every Jod skill follows. Works for new, growing and established projects."
argument-hint: "[refresh]"
disable-model-invocation: true
---

# /jod:setup

Options: `$ARGUMENTS` (`refresh` = update an existing profile, keeping what the user wrote)

The profile is how the rest of Jod adapts to each project: every skill reads `.claude/jod.md` first. Facts come from **evidence in the repo**; preferences come from **the user**. Mark anything you couldn't confirm as `TODO (confirm)`.

## 1. Scan the repo
Gather facts quietly. Use one Explore agent for a large monorepo.
- **Instructions:** `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `README*`, and any docs on conventions or architecture.
- **Stack and layout:**
  - languages, frameworks and their versions;
  - workspaces and packages (`package.json` workspaces, `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `pyproject.toml`, `go.work`, `Cargo.toml`);
  - the apps and packages folders;
  - the package manager, from the lockfile.
- **Scripts and CI:** package scripts, the `Makefile`, and `.github/workflows/*` or other CI. What CI runs is the source of truth for the gate.
- **Git and release:**
  - branches (`git branch -a`) and the default branch;
  - the commit style (`git log --oneline -20`);
  - whether `development` exists, and what's on `main` but not on it;
  - how production runs: a direct process (a process-manager config or service unit), containers (Dockerfiles and a production compose file), Kubernetes (manifests or charts), or a serverless/static host (that host's config file); plus the health endpoints, the production start command and the production env example. Read this from the files in the repo, without assuming any particular host;
  - CI/CD: does pushing `main` deploy?
- **Environment:**
  - the env example files: does local dev point at a shared or production database, queue or cache? (Never print secret values);
  - dev ports and scripts;
  - where logs go;
  - how to see sent emails and queued jobs locally.
- **Testing:** the frameworks, where tests live, and any e2e setup (seeded DB, replica set, emulators).
- **Hands-off:** generated code, vendored UI primitives.
- **Patterns in use.** For each kind of thing (module or endpoint, validation, data access, error handling, list pagination, jobs, forms, tables, data hooks, state, styling, tests), find the best example. Note where the repo does the same thing two different ways, e.g. two form libraries, or two styles of data fetching.
- **High-risk areas:** auth, permissions, payments or billing, money or stock, personal data, webhooks, crypto, outbound fetches.
- **Maturity signals:**
  - commit count and age (`git rev-list --count HEAD`, the first commit date);
  - the amount of source code;
  - test count;
  - conventions docs;
  - how consistent the patterns are.

## 2. Show what you found
Before asking anything, give a short summary (≤12 lines):
- the stack;
- the layers;
- the verify commands;
- the release flow;
- the main patterns, with their example files;
- any inconsistencies;
- the risky areas;
- the maturity you read from the signals.

The user's answers should react to this, not start from a blank page.

## 3. Ask how they want to work
Use AskUserQuestion: at most 2 rounds of up to 4 questions each.
- Every option comes from what you saw (their stack, their patterns), and the recommended option goes first.
- Skip any question the repo already answers clearly.

**Round 1: how Jod should behave.**
- **Mode** (recommend from the maturity signals):
  - `established`: the patterns are settled; follow them strictly, and treat any new pattern or dependency as the user's decision.
  - `growing`: follow existing patterns. Improvements are allowed as their own planned step, and new conventions are recorded once decided.
  - `new`: few patterns exist yet. Choose the standard, boring option for this stack, ask when the choice matters, and record each convention in the profile so later work follows it.
- **Branches:** Jod's flow is fixed: work on `development`, side branches merge into `development`, and only `/jod:ship` merges `development` into `main`. No PRs. Ask only if the repo uses other names (`dev`, `master`), or if `development` doesn't exist yet (offer to create it from `main`).
- **Production:** confirm how production runs and how to smoke-test it locally (health URL, one key request). Ask whether Claude may use a cluster context for server-side dry runs (Kubernetes only).
- **Safety:**
  - may Claude start dev servers?
  - is the local database shared or production (then read-only)?
  - does pushing `main` deploy (then confirm the timing first)?
- **Rigor:**
  - **Plan approval:** always / fast path for small changes (recommended) / only for multi-step work.
  - **Tests:** test-first where it pays (recommended) / tests after, in the same change / only for logic and bugs.

**Round 2: patterns.** Ask only when needed:
- **Inconsistencies you found:** which one is canonical? Example: "Forms use two different libraries (A in 12 files, B in 30 files). Which is the current way?" The other one becomes "legacy: don't copy".
- **Mode `new`:** the conventions that matter for this stack and aren't decided yet. Offer the stack's standard choices. Examples: test location (next to the source / `__tests__/`); folder structure (by feature / by type); validation and data-fetching libraries; error-response shape.

## 4. Write `.claude/jod.md`
Start from [template.md](template.md).
- **Put in:** the facts from step 1 and the answers from step 3.
- **Mark inconsistent patterns:** "current" and "legacy: don't copy".
- **Keep it short:** every line is something Claude couldn't guess. Link to existing docs instead of copying them.

With `refresh`:
- Read the existing profile first and keep what the user wrote. Update only what the repo shows has changed.
- Check that each Reference implementation still exists and is still the newest of its kind.
- Re-ask only the questions whose answer may have changed. For example, the Mode may move from `new` to `growing` as the codebase grows.
- Show a summary of what changed.

## 5. Report and guards
Show the profile, and list the `TODO (confirm)` lines.

Then offer the hard guards as ready `.claude/settings.json` snippets. Keep the set small: only rules with zero exceptions.
- `permissions.deny` for edits to the Hands-off paths, e.g. `Edit(/apps/web/src/components/ui/**)`;
- deny `Bash(git push --force:*)`, `Bash(git add -A:*)`, `Bash(gh pr create:*)`, and the wrong package managers;
- optionally, ask before edits to the lockfile and manifests, so dependency changes are always deliberate;
- deny dev-server commands if the user runs them;
- optionally, a Stop hook that runs the fastest typecheck, only if it takes under ~20 s.

Add them only if the user says yes. Also suggest adding `.claude/plans/` to `.gitignore`.

Don't commit the profile; `/jod:commit` will.
