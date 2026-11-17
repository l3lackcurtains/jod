# Contributing to jod

Thanks for helping. jod is plain Markdown that Claude reads, so every line costs context and attention. The bar for adding text is high; the bar for cutting it is low.

## What helps most
- **Drift reports:** a real session where jod let Claude go off track. What happened, which guide should have caught it, and a suggested fix.
- **Confusing guides:** two rules that disagree, a rule defined twice, or an instruction Claude kept misreading.
- **Profiles for other stacks:** add an example to `examples/` (Rails, Django, Go, Laravel, mobile…).
- **Cuts:** generic advice Claude already follows without being told.

## Principles for changes
- **Project-agnostic.** Anything specific to one project belongs in that project's profile (`.claude/jod.md`), not in the plugin.
- **One definition per rule.** Other files link to it rather than restating it.
- **Short and imperative.** Plain words, a clear verb, examples only when they clarify.
- **For small teams.** No process designed to coordinate many people.
- **Cheap by default.** Extra subagents, full test runs and long reads need a reason.

## How a skill is laid out
Each skill follows the [Agent Skills](https://agentskills.io) anatomy:
```
skills/<name>/
├── SKILL.md      the entry point: frontmatter (name = folder, description = when to use it) and the workflow, under 500 lines
├── references/   guides read only when a step needs them (engineering's principles, review, verify…)
├── phases/       task only: one file per phase, read when that phase runs
├── assets/       files copied into output, not read as instructions (setup's profile template)
└── evals/        test cases for developing the skill; never shipped to users
```
- **The description is the trigger.** For `engineering` (the only skill Claude loads on its own) it decides when the standards apply: what it does and when to use it come first, within 1024 characters. The commands set `disable-model-invocation`, so their description is just what the `/` menu shows.
- **Link guides from where they're needed**, with when to read them, rather than loading everything up front.
- `node scripts/build-portable.mjs --check` lints all of this (name, description length, SKILL.md size, every relative link) and fails CI on a problem.

## Developing a change
1. **Edit `skills/`**, then run `node scripts/build-portable.mjs` (lint + rebuild `portable/`).
2. **Run the evals** for the skills you touched. Each case in `skills/<name>/evals/<case>/` has a prompt, a fixture repo (`files/`, scaffolded as a git repo on `development` by `place-files.sh`) and one grader per checked behaviour. Either:
   - from `skills/<name>/`: `claude plugin eval . --scaffold --allow-tools Write,Edit,Bash` (runs each case with and without the skill; billed model runs), or
   - ask Claude to "use skill-creator to run jod's <name> evals", which also opens a side-by-side viewer for your review.
3. **A drift report becomes a case.** When jod lets Claude go off track, add a case that reproduces it before changing the guide, and watch it fail then pass. `commit` and `ship` have no cases because they push and merge.
4. **Try it for real:**
   ```
   claude plugin validate .
   /plugin marketplace add ./path/to/your/jod-clone
   /plugin install jod@jod
   ```
   Then run `/jod:setup` and a small `/jod:task` in a real repo, and describe what changed (and the eval results) in the PR.

## Releasing
Bump `version` in `.claude-plugin/plugin.json`, add a `CHANGELOG.md` entry, then tag `vX.Y.Z`.

## Portable skills
`portable/` is generated, so edit `skills/` only. Then run:
```
node scripts/build-portable.mjs
```
CI fails if `portable/` is out of date.
