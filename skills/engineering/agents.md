# Specialist agents

A domain agent (a database, Kubernetes, mobile, framework or security specialist) often does a step better than a generalist. jod hands it the work, not the control: the plan, the scope fence, the tests and the proof stay with jod.

Only when the tool can start subagents (Claude Code: the Agent tool). Otherwise do the work yourself and skip this file.

## 1. Find them
- **The profile first:** its "Agents" section maps areas to agents (e.g. `apps/api → nestjs-developer`, `migrations → postgres-pro`) and lists any to avoid. It wins.
- **Otherwise, what's available now:** the agent types the tool lists (Claude Code: the Agent tool's list, which includes `.claude/agents/`, `~/.claude/agents/` and plugin agents). Read each description; don't guess from the name alone.
- **Pick by the work, not the repo:** match the step's layer, stack and version (a NestJS endpoint → a NestJS agent; a slow query → a Postgres agent; a Compose file → a Docker agent). No clear match, or only a generic one (general-purpose, catch-all): do it yourself.

## 2. When to hand over
- **Worth it:** the step sits mostly in one domain the agent specialises in, and is more than a few lines: a migration with indexes and a backfill, a native mobile module, a Helm chart, a tricky query, a GraphQL schema change.
- **Not worth it:** a small or cross-cutting step (the brief would be longer than the change), tidying, docs, or a step that's mostly wiring between layers. Briefing costs time and drops detail.
- **One at a time.** One agent edits the working tree at a time; never two in parallel on the same checkout.

## 3. Brief it
It knows only what you write. Give it:
- the step's goal, its files, and the scope fence (what it must not touch);
- the reference files to copy (from the plan's "Patterns to follow") and the profile lines that apply: conventions, Hands-off, High-risk, the verify commands (including the focused test command);
- the tests to write first, and the behaviours they cover;
- the rules: no new dependencies or patterns the plan didn't name; no commits, pushes or migrations against shared databases; stop and report instead of improvising when the plan doesn't fit;
- what to return: the files it changed, each command it ran with its result, anything it assumed or couldn't confirm, and anything it noticed outside scope.

## 4. Take it back
- **Its diff goes through the build checkpoint** (drift alarm) like your own. Anything outside the fence: undo it, or stop and ask.
- **Its "it passed" is not evidence** (`engineering` §5): the test phase runs the checks again.
- **Review stays independent:** the agent that built a step never reviews it. A different specialist may run a risky step's doubt pass, or be the independent reviewer in `/jod:commit`, for its domain (a security agent for auth, a database agent for a migration), briefed per review.md §2.
- **Name it in the status line:** `✅ 2/4 db · built by postgres-pro · test (88 passed) · doubt (migration): 0`.
