# Sip

An engineering workflow plugin for [Claude Code](https://claude.com/claude-code), for small teams of senior engineers who want speed **and** quality.

*Sip* (सीप) is Nepali for skill or craftsmanship. Every change goes through plan, build, test, review and check, then commit and ship. Five standards are built in:

- **Architectural boundaries:** layers that each do one job, modules that talk through their public services, one source of truth for shared code.
- **Scalability:** stateless services, indexes, capped pagination, async jobs, timeouts.
- **Reliability:** graceful errors, transactions, idempotency, retries, tests that actually fail when the code breaks.
- **Security:** tenant scoping, authorisation, input validation, SSRF protection, secrets, rate limits.
- **Following existing patterns:** copy the closest existing code, reuse before you create, extract only when something would be duplicated.

Big-team ceremony (sign-offs, templates, design docs for small changes, coverage targets) is left out on purpose.

## Install

```
/plugin marketplace add l3lackcurtains/sip
/plugin install sip@sip
```

Then, in each repo:

```
/sip:setup
```

This reads the codebase and writes `.claude/sip.md`, a short **project profile**:
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
| `/sip:task <task>` | Full loop: plan (waits for your OK) → build → test → review → check → done. Small changes take a fast path. |
| `/sip:task plan\|build\|test\|review\|check\|done …` | Run one phase on its own |
| `/sip:fix-bug <symptom>` | Reproduce, trace the root cause backward, write a regression test that fails first, fix, hunt the same bug across the repo, verify |
| `/sip:commit` | Step 1: review the uncommitted diff, verify, commit in logical groups, push the work branch |
| `/sip:ship` | Step 2: final review across commits, the full gate and a deploy audit, then merge or open a PR, and return to the work branch |
| `/sip:setup [refresh]` | Create or update the project profile |

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

## License

MIT
