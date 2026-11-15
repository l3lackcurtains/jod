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

## Testing a change locally
```
claude plugin validate .
/plugin marketplace add ./path/to/your/jod-clone
/plugin install jod@jod
```
Then run `/jod:setup` and a small `/jod:task` in a real repo, and describe what changed in the PR.

## Releasing
Bump `version` in `.claude-plugin/plugin.json`, add a `CHANGELOG.md` entry, then tag `vX.Y.Z`.
