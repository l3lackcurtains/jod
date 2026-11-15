---
name: engineering
description: Jod's engineering standards and the project's profile, for established projects: stay in scope, follow the existing architecture and conventions, build it right, verify with evidence. Use when adding or changing a feature, endpoint, schema, job, permission, price or user-facing behaviour, before reviewing code, or before claiming any change is complete. Covers architecture boundaries, scalability, reliability, security, following existing code patterns, how to review, and how to verify.
when_to_use: Building or changing code in a repo, reviewing a diff, or about to say "done".
---

# Engineering standards (Jod)

## 1. Load the project profile
Read `.claude/jod.md` in the repo. It holds everything specific to this project: the layers/surfaces to change in order, the verify commands, branches, the dev-server and database rules, the high-risk areas, the conventions docs and the gotchas. **Where the profile and this plugin disagree, the profile wins.**

No profile? Say so and offer `/jod:setup` (it generates one by reading the repo). Until then, use `CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING.md` and the package scripts, and ask before anything risky.

## 2. Stay on the road
Jod is for **established projects that already work**. The job is to extend them the way they're built, not to redesign them.
- **Scope:** do what was asked and planned, nothing more.
- **Architecture and conventions:** extend the existing design. Changing a boundary, a data model, a core pattern or a public contract is a decision for the user: stop and ask.
- **No new dependencies, services, patterns or abstractions** unless the plan says why the current stack can't do it.
- **No rewrites.** Change the smallest unit that solves the problem. Cleanup ("tidying") goes in its own commit, before the behaviour change, never mixed in.
- **Protect what users rely on:** public APIs, data, URLs, CLI flags, file formats. Add, don't break.
- **Pin before you change:** before touching code with no tests, write a characterization test that records what it does today, then change it.
- **Noticed, not done:** a bug, smell or cleanup outside the task gets one line in the report's "Noticed, not done", not a fix on the side. Drive-by tidying is drift too.
- **Stop and ask** when:
  - the plan turns out to be wrong;
  - a step needs a different approach than agreed;
  - you'd add a dependency or a second way of doing something the repo already does;
  - you'd change a public contract or existing data;
  - you'd touch a High-risk or Hands-off area the plan didn't name;
  - the **drift alarm** fires (the build checkpoint checks it after every step):
    - a file outside the plan's scope fence changed;
    - a lockfile or manifest changed without a planned dependency;
    - a new folder or kind of file appeared;
    - the change is about 2× the planned size;
    - an unplanned migration or public contract change appeared.

  Say what you found, give two options with a recommendation, and wait. Improvising past a surprise is how work derails.

## 3. The standards
- [principles.md](principles.md): how to build it right (boundaries, self-documenting code, scalability, reliability, security, operability).
- [patterns.md](patterns.md): look like the code next to you; reuse before create; when to extract.
- [review.md](review.md): how we review (risk triage, calibrated findings, silent failures, tests that bite).
- [verify.md](verify.md): what counts as proof.

## 4. Every surface
A change isn't done until every layer/surface listed in the profile has it (API, UI, SDKs, CLI, docs, marketing site, internal docs, whatever this repo has). Walk the list and say which ones **don't** apply and why.

## 5. Done means evidence
The command you ran **in this turn**, its exit code and the counts. "Should work", "probably", an earlier run, or a subagent saying it passed is not evidence: re-run it. Lint passing doesn't prove a typecheck; a typecheck doesn't prove behaviour; unit tests don't prove the e2e.

## 6. Never, unless the user says so in this conversation
- Commit, push, merge or deploy outside `/jod:commit` and `/jod:ship`.
- Write to a shared or production database, send real emails/posts/payments, or call paid external services.
- Start dev servers when the profile says the user runs them.
- Edit generated code or vendored UI primitives the profile marks as off-limits.
- Overwrite a file you haven't read. Use Edit for existing files; check `git status` shows `M`, not a surprise rewrite.
- Weaken a test to make it pass: no `.skip`/`.only`, deleted cases, loosened assertions or mocks of the code under test.

Rules with zero exceptions work better as hooks or deny rules than as prose; `/jod:setup` offers them.
