# Jod

An engineering workflow plugin for [Claude Code](https://claude.com/claude-code), for projects run by a few highly effective engineers: move fast without derailing from the architecture, conventions and scope the project has, or is setting.

`/jod:setup` reads your stack and existing patterns and asks how you want to work. A project runs in one of three modes:
- **established:** settled patterns, followed strictly;
- **growing:** patterns followed, with planned improvements;
- **new:** conventions get decided and recorded as you build.

*Jod* (जोड) is Nepali for joining and assembling: putting the parts together so they hold. Every change goes through plan, build, test, review and check, then commit and ship. Five standards are built in:

- **Staying on the road:**
  - stay in scope; extend the existing architecture, no redesign;
  - no new dependencies, patterns or rewrites without a reason;
  - characterization tests before changing untested code;
  - tidy changes kept separate from behaviour changes;
  - a drift alarm when a change outgrows its plan.
- **Simplicity:** the simple, boring thing first; apply the other standards in proportion.
- **Architectural boundaries:** layers that each do one job, modules that talk through their public services, one source of truth for shared code.
- **Scalability:** stateless services, indexes, capped pagination, async jobs, timeouts.
- **Reliability:** graceful errors, transactions, idempotency, retries, tests that actually fail when the code breaks.
- **Security:** tenant scoping, authorisation, input validation, SSRF protection, secrets, rate limits.
- **Following existing patterns:** copy the closest existing code, reuse before you create, extract only when something would be duplicated.

Plans have an appetite and a cut line, and are saved to `.claude/plans/` so work can resume in a fresh session. A stuck session hands off and restarts instead of grinding on. Lessons go back into the profile, and rules broken twice become hooks. Releases come with a rollback plan and a post-deploy check.

Big-team ceremony (sign-offs, templates, design docs for small changes, coverage targets) is left out on purpose.

## Install

```
/plugin marketplace add l3lackcurtains/jod
/plugin install jod@jod
```

Then, in each repo:

```
/jod:setup
```

This scans the codebase and shows what it found. It then asks how you want to work: the mode, branch and release flow, safety rules, how strict plan approval and testing should be, and which pattern is current wherever the repo does one thing two ways. Finally it writes `.claude/jod.md`, a short **project profile**:
- the layers to change, in build order
- the verify commands
- the branches and release mode (local merge or PR)
- the dev-server and database rules
- the high-risk areas
- the reference implementations to copy
- code that's hands-off (generated or vendored)
- gotchas

Commit the profile; it's the only project-specific part.

## Commands

| Command | What it does |
|---|---|
| `/jod:task <task>` | Full loop: plan (waits for your OK, per the profile's plan-approval setting) → build → test → review → check → done. Small changes take a fast path. |
| `/jod:task plan\|build\|test\|review\|check\|done …` | Run one phase on its own |
| `/jod:fix-bug <symptom>` | Reproduce, trace the root cause backward, write a regression test that fails first, fix, hunt the same bug across the repo, verify |
| `/jod:commit` | Step 1: review the uncommitted diff, verify, commit in logical groups, push the work branch |
| `/jod:ship` | Step 2: final review across commits, the full gate and a deploy audit, then merge or open a PR, and return to the work branch |
| `/jod:setup [refresh]` | Create or update the project profile |

The `engineering` skill loads automatically when Claude builds or reviews code. It holds the standards:
- [principles](skills/engineering/principles.md): how to build it right
- [patterns](skills/engineering/patterns.md): how to follow the existing code
- [review](skills/engineering/review.md): how a diff gets reviewed
- [verify](skills/engineering/verify.md): what counts as proof

## Sources

The workflow draws on:
- Anthropic's [skill authoring](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and [Claude Code](https://code.claude.com/docs/en/best-practices) best practices
- [obra/superpowers](https://github.com/obra/superpowers): evidence before claiming done, root-cause tracing, test-driven development, plans without placeholders
- [Trail of Bits skills](https://github.com/trailofbits/skills): risk triage of a diff, hunting variants of a bug, insecure defaults
- Google's [engineering practices](https://google.github.io/eng-practices/): what to look for in a review, small changes
- Michael Feathers, *Working Effectively with Legacy Code* (characterization tests), and Kent Beck, [*Tidy First?*](https://tidyfirst.substack.com/) and [augmented coding](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes)
- 37signals [Shape Up](https://basecamp.com/shapeup) (appetite, fixed time with flexible scope), [Choose Boring Technology](https://mcfunley.com/choose-boring-technology), Instagram's "do the simple thing first"
- Mitchell Hashimoto, Armin Ronacher, Harper Reed and Geoffrey Huntley on agentic coding: learning loops, feedback tools agents can run themselves, spec files that survive sessions

## License

MIT
