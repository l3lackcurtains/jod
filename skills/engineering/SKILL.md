---
name: engineering
description: Keel's engineering standards and the project's profile. Use when adding or changing a feature, endpoint, schema, job, permission, price or user-facing behaviour, before reviewing code, or before claiming any change is complete. Covers architecture boundaries, scalability, reliability, security, following existing code patterns, how to review, and how to verify.
when_to_use: Building or changing code in a repo, reviewing a diff, or about to say "done".
---

# Engineering standards (Keel)

## 1. Load the project profile
Read `.claude/keel.md` in the repo. It holds everything specific to this project: the layers/surfaces to change in order, the verify commands, branches, the dev-server and database rules, the high-risk areas, the conventions docs and the gotchas. **Where the profile and this plugin disagree, the profile wins.**

No profile? Say so and offer `/keel:setup` (it generates one by reading the repo). Until then, use `CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING.md` and the package scripts, and ask before anything risky.

## 2. The standards
- [principles.md](principles.md): how to build it right (boundaries, self-documenting code, scalability, reliability, security, operability).
- [patterns.md](patterns.md): look like the code next to you; reuse before create; when to extract.
- [review.md](review.md): how we review (risk triage, calibrated findings, silent failures, tests that bite).
- [verify.md](verify.md): what counts as proof.

## 3. Every surface
A change isn't done until every layer/surface listed in the profile has it (API, UI, SDKs, CLI, docs, marketing site, internal docs, whatever this repo has). Walk the list and say which ones **don't** apply and why.

## 4. Done means evidence
The command you ran **in this turn**, its exit code and the counts. "Should work", "probably", an earlier run, or a subagent saying it passed is not evidence: re-run it. Lint passing doesn't prove a typecheck; a typecheck doesn't prove behaviour; unit tests don't prove the e2e.

## 5. Never, unless the user says so in this conversation
- Commit, push, merge or deploy outside `/keel:commit` and `/keel:ship`.
- Write to a shared or production database, send real emails/posts/payments, or call paid external services.
- Start dev servers when the profile says the user runs them.
- Edit generated code or vendored UI primitives the profile marks as off-limits.
- Overwrite a file you haven't read. Use Edit for existing files; check `git status` shows `M`, not a surprise rewrite.
