# Changelog

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
