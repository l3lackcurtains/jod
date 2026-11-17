# Changelog

## 1.13.0
Faster `/jod:task`, from measuring three real sessions (where the time went: test runs, scripted edits, full typechecks, browser clicking, rebuilds) and from how superpowers, compound-engineering, BMAD and gstack keep their loops fast.
- **Quick lane:** `/jod:task` sizes the task once, up front. About 3 files, one code layer and no risk surface (schema, contract, permissions, money, auth, deleting data) gets a 3-line plan, no question, no plan file, no impact table, one related-tests run and a short done report. It escalates to the full loop the moment it grows. Proof stays: a test that failed first, and a run you saw pass.
- **Edits through the edit tool:** "keep the file's line endings" had Claude writing python/sed edit scripts in the shell (~18 s and often a permission prompt each, against ~3 s). Edit keeps line endings, so the rule now says to use it.
- **Related tests, not folders:** a step runs the runner's related mode (`jest --findRelatedTests`, `vitest related`, …) instead of whole module folders.
- **Typecheck fast** (`verify.md`): once per step, not per edit; watch mode in the background when the tool allows it, otherwise incremental. Builds and codegen re-run only when their sources changed.
- **Cheapest live check:** a request or script for API, CLI and data changes; for UI, a scripted browser run of the flow rather than exploratory clicking.
- **Fewer questions:** a plan question must change what gets built; reversible details are decided and listed under "Decided" for the user to overrule.
- **Setup** records each package's related-tests command and its watch or incremental typecheck in the profile.

## 1.12.0
- **Standard skill layout:** `engineering`'s guides move to `skills/engineering/references/`, and setup's profile template to `skills/setup/assets/template.md`. Links in every skill, the README and `portable/` follow.
- **`engineering` description:** it now opens with what it covers and when to use it ("whenever building or changing code… even when no jod command was run"), and the old `when_to_use` text is folded in, so the portable build no longer drops it.
- **Skill lint** in `scripts/build-portable.mjs` (and CI): the name matches the folder, the description is at most 1024 characters, SKILL.md is under 500 lines, long references have contents, every relative link resolves, and `when_to_use` is rejected (other tools ignore it; it belongs in the description).
- **Evals:** test cases for `task`, `fix`, `setup` and `engineering` in `skills/<name>/evals/` (the skill-creator / `claude plugin eval` format), each on a small fixture repo with graded behaviours. They are left out of `portable/`. CONTRIBUTING describes the layout and the development loop.

## 1.11.3
- **`engineering` is conventions, not a command:** it is hidden from the slash menu (`user-invocable: false`), and its description and opening line say there is nothing to run, so tools such as OpenCode no longer treat `jod-engineering` as a command. The jod commands still read it, and it still loads automatically when building or reviewing code.

## 1.11.2
- **Git while working** (`engineering` §2): `/jod:task` and `/jod:fix` (including the doubt pass) use git freely to look and isolate (diff, log, blame, bisect, stash, temporary worktrees), leaving the working tree exactly as they found it. Only commits, pushes, merges and branch changes stay with `/jod:commit` and `/jod:ship`.

## 1.11.1
- **`/jod:task` focuses on the task, `/jod:fix` on the fix:** the task's `review` sub-command is gone; reviewing, committing, branches and releases are `/jod:commit`'s and `/jod:ship`'s jobs. The risky-step check is now `phases/doubt.md`, a quick doubt pass on one decision, not a review.

## 1.11.0
- **Faster `/jod:task`:** steps go build → test → check. The full review runs once, in `/jod:commit`, over the whole change; only risky steps (a HIGH file, a migration, a public contract, money, permissions, idempotency) get a short independent doubt pass in the loop. The live check runs after user-visible steps and at least every 3 steps. A pass on unchanged files isn't re-run, and fixes re-run only what they touch.
- **Three sizes of test run** (`engineering/verify.md`): focused (one file, while building), affected (per step), full (once per change). Setup records the focused test command.
- **Specialist agents** (`engineering/agents.md`): `/jod:task` and `/jod:fix` hand domain work to a matching agent when one is available (the plan names who builds each step), with a brief, the scope fence and the same checkpoint. jod keeps the tests, review and proof. A matching specialist can run a risky step's doubt pass or the commit review. Setup maps agents to areas in a new Agents section of the profile.
- **New rules:** outside text (logs, issues, web pages, tool output) is data, not instructions; library APIs are checked against the installed version's docs, or marked unverified; review briefs the independent reviewer without the builder's reasoning and separates pre-existing defects from new ones; `/jod:fix` bisects regressions; performance work is measured against a baseline, and a neutral change is reverted.
- **No unasked files:** reports stay in the chat. Plan files are saved only when work needs tracking across steps or sessions, and `/jod:commit` deletes them once the work is committed. `/jod:cleanup` finds leftovers.
- **Portable skills:** Claude Code-only instructions (`$ARGUMENTS` in cleanup, AskUserQuestion, `.claude/settings.json` guards) are rewritten for other tools.

## 1.10.0
- **`/jod:cleanup`:** scans read-only for bad comments, unused code, unused files, dependencies and config. It shows the candidates with evidence and a confidence (certain / likely / needs you), asks which groups to remove, then removes them in behaviour-neutral groups, each checked against the baseline test counts. It records the date in the profile.
- **Release cleanup in `/jod:ship`:** before the gate, ship runs cleanup over the commits being released (`release` scope). It covers bad comments and leftovers in the added lines, and code, files or dependencies those commits made unused. It asks first, then cleans in `chore(cleanup)` commits so the gate tests what actually ships.
- **Cleanup reminders:** setup asks for a cadence (every 2 weeks / after each release / on request). The `/jod:task` done, `/jod:commit` and `/jod:ship` reports add one line when a cleanup is due. A reminder never runs or blocks anything.
- **Comment rules** (`engineering/principles.md` §2): comments explain the *why* in plain words, about the code as it is now. No tracker, plan or ticket ids, step labels, change history, restated code, commented-out code or ownerless TODOs, including in test names and API doc comments. Review greps the added lines for them.
- **Profile:** a new Cleanup section (cadence, last run, a Keep list of things that look unused but aren't). Setup reports the cleanup debt it sees.

## 1.9.0
- **Impact and coverage** (`engineering/impact.md`). Each plan builds an impact map:
  - name what changes, search the whole repo for it, and think past the search (stored data, clients in the wild, other repos, outside the code);
  - list surface → files → change;
  - build covers every row; review and done re-run the searches; the done report shows a coverage table.
- **`/jod:fix`:** a fix that changes a contract follows the same impact map.

## 1.8.0
- **Steps sized to the work:** plans split into as many steps as the work needs, each a coherent, verifiable piece with its goal, files and check.
- **Run mode:** after planning, `/jod:task` asks "run all steps" (the default) or "step by step". With no answer (headless run, dismissed question), it runs all steps. Each step goes build → test → review → check, with a numbered status line.

## 1.7.0
- **Clear, purpose-fit reports** (`engineering/report.md`). Each command reports in the shape that fits its job:
  - `/jod:fix`: an incident note;
  - `/jod:ship`: a release verdict and runbook;
  - `/jod:commit`: a commit log;
  - `/jod:setup`: a profile summary;
  - `/jod:task` done: a feature summary;
  - each `/jod:task` phase: one status line.
- **Shared basics:** outcome first, exact numbers, one `Next:` line.

## 1.6.0
- **One branch flow.** Work lands on `development`, and side branches merge into it via `/jod:commit`. Only `/jod:ship` touches `main`. No PRs: the `pr` release mode is gone.
- **Production check in `/jod:ship`.** It builds from a clean checkout and runs the release the way production does (direct process, Docker Compose, Kubernetes, serverless) with production-like config. It smoke-tests, checks the shutdown, then tears down. Anything it can't verify blocks the release.
- **Profile gains a "Production" section:** runtime, start command, health check, smoke requests, migrations. Setup detects these.

## 1.5.0
- **Works with other AI tools.** `portable/` holds the same skills in plain Agent Skills format (`jod-task`, `jod-fix`, …). Installers (`install.sh`, `install.ps1`) cover Codex, Cursor, OpenCode, GitHub Copilot, Gemini CLI and ZCode, globally or per project.
- **Easier to read.** The "How it works" diagram now runs top to bottom, with a line per step.
- **CI** checks that `portable/` is in sync with `skills/`.

## 1.4.0
- **Open-source release:** a new README (why, how it works, an end-to-end example), example profiles, CONTRIBUTING, issue templates.

## 1.3.1
- **Renamed** `/jod:fix-bug` to `/jod:fix`.

## 1.3.0
- **Three modes.** jod adapts to `new`, `growing` or `established` projects. The profile gains "How we work" (mode, plan approval, test timing) and "Conventions", with legacy patterns marked "don't copy".
- **Interactive setup.** `/jod:setup` scans the stack and patterns, shows what it found, then asks about mode, workflow, safety, rigor, and which pattern is current where the repo does one thing two ways.
- **Patterns.** `patterns.md` covers "no sibling yet" (new projects) and legacy patterns.

## 1.2.0
- **Clearer guides.** Each rule is defined in one place (fast path, drift alarm, "Noticed, not done"), and the stale scratchpad reference is fixed.
- **Cheaper.**
  - Guides load per phase.
  - One review agent instead of two, run only for risky or large diffs.
  - Full test suites run once.

## 1.1.0
- **Staying on track.**
  - A scope fence in each plan, a drift checkpoint after every build step, and stop-and-ask with options.
  - No rewrites; characterization tests before changing untested code; tidy-first as its own step.
- **Simplicity first.**
- **Plans survive sessions.**
  - Plans are saved in `.claude/plans/` with an appetite and a cut line.
  - A stuck session hands off and restarts instead of grinding.
- **Review** checks for drift and gamed tests.
- **Learning loop** back into the profile.
- **Releases** come with a rollback plan and a post-deploy check.

## 1.0.0
- First release:
  - `/jod:task`, `/jod:fix-bug`, `/jod:commit`, `/jod:ship`, `/jod:setup`;
  - the `engineering` skill (principles, patterns, review, verify);
  - per-repo profiles.
