# Jod profile: <project name>

<!-- Read by every Jod skill. Keep it short, specific and true. Link to docs instead of copying them. -->

## How we work
- Mode: `<established | growing | new>`. <one line why, e.g. "3 years, 1,200 commits, consistent patterns">
- Plan approval: `<always | fast path for small changes | multi-step work only>`.
- Tests: `<test-first where it pays | tests after, same change | logic and bugs only>`.

## Stack
<one line per app/package: path, framework, language, test runner>

Conventions docs: <CLAUDE.md, docs/…>. Package manager: <pnpm 9, only>.

## Layers / surfaces (in build order)
<!-- Every change walks this list; say which don't apply and why. -->
1. <shared package: path, rebuild command>
2. <API: path; module structure; DTO/validation; tests next to source>
3. <codegen step, if any: command; never hand-edit <path>>
4. <web: pages / hooks / components / types / tests paths>
5. <SDKs, CLI, MCP, integrations>
6. <public docs, marketing site, internal docs/roadmap to update>

## Verify commands
| Package | Typecheck/compile | Tests | Notes |
|---|---|---|---|
| <api> | <cmd> | <cmd> (full: <cmd>, ~<time>) | <lint: changed files only, no --fix> |

Full gate (`/jod:ship`):
```
<install --frozen-lockfile>
<build shared/codegen>
<typecheck all>
<test all>
<build all>
<e2e: how, and what it needs (seeded DB, replica set…)>
```

## Branches and release
- Work on `<development>`; side branches merge into it. Only `/jod:ship` merges it into `<main>` (local `--no-ff`, no PRs).
- Pushing `main` deploys: `<yes, via CI → host / no, deployed manually>`. Confirm timing before release: `<yes/no>`.

## Production
- Runtime: `<direct process | Docker Compose | Kubernetes | serverless/static>`. Definition: `<docker-compose.prod.yml / k8s/overlays/prod / Procfile / …>`.
- Start command: `<node dist/main.js | docker compose -f … up | the Deployment's command>`.
- Health: `<GET /health on :3000>`. Smoke requests: `<one key request per app>`.
- Production env example: `<.env.production.example>`.
- Migrations: `<how and when they run: on boot, a Job, a manual step>`.
- Cluster access for dry runs: `<none | kubectl context X, read-only>`.
- Commit style: `<feat(scope): …>`; references: `<roadmap id / issue #>`.
- Never stage: `<.env*, generated files, worktrees, …>`.

## Local environment
- Dev servers: `<the user runs them; never start them>` / `<Claude may start: commands, ports>`.
- Database: `<local / SHARED or PRODUCTION: reads only, writes need an explicit yes>`. How to run a read-only check: `<…>`.
- Queues/cache: `<local Redis on …; never point dev at production's>`.
- Manual check: `<URLs, test accounts/roles, browser tool>`.
- Feedback tools: `<API log file / how to tail>`, `<how to see sent emails / queued jobs locally>`. If a check needs the user every time, propose a small script that does it.

## Parallel sessions
- Worktree setup: `<.worktreeinclude: .env files>`, `<install cmd>`.
- Shared between sessions: `<ports, DB, Redis>`. Run in parallel only on separate areas; never two sessions running dev servers or migrations.

## Architecture to keep
<!-- Extend these; changing one is a decision for the user. -->
- <module layout / layering>
- <data access, state management, API style, auth model>
- <deliberate choices: "no ORM", "no global state", "server components by default", …>

## High-risk areas
<!-- Reviewed line by line, as an attacker would. -->
- <auth/guards: paths>
- <billing/webhooks: paths>
- <money/stock/transactions: paths>
- <personal/medical data, compliance: rules that apply>

## Conventions
<!-- Decided ways of doing things. New ones are added as they're decided (mode `new`/`growing`). -->
- <forms: @tanstack/react-form + Zod. Legacy, don't copy: react-hook-form in `old/…`>
- <tests: next to the source, `*.spec.ts`>

## Reference implementations
<!-- The best existing example of each kind; new code copies these. -->
- Module/endpoint: <path>
- Paginated list endpoint: <path>
- Job/queue processor: <path>
- Idempotency / transactions: <path>
- Form dialog: <path>
- Table/list view: <path>
- Data hook: <path>
- Shared UI building blocks: <paths>

## Hands-off
- <vendored UI primitives path: never edit, fix at call sites>
- <generated code path: regenerate with <cmd>>

## Gotchas
<!-- Learned the hard way. One line each. -->
- <…>
