# Sip profile: <project name>

<!-- Read by every Sip skill. Keep it short, specific and true. Link to docs instead of copying them. -->

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

Full gate (`/sip:ship`):
```
<install --frozen-lockfile>
<build shared/codegen>
<typecheck all>
<test all>
<build all>
<e2e: how, and what it needs (seeded DB, replica set…)>
```

## Branches and release
- Work branch: `<development>`. Release branch: `<main>`.
- Release mode: `<merge>` (local `git merge --no-ff`) or `<pr>` (open a PR with `gh`).
- Pushing the release branch deploys: `<yes, via CI → host / no>`. Confirm timing before release: `<yes/no>`.
- Commit style: `<feat(scope): …>`; references: `<roadmap id / issue #>`.
- Never stage: `<.env*, generated files, worktrees, …>`.

## Local environment
- Dev servers: `<the user runs them; never start them>` / `<Claude may start: commands, ports>`.
- Database: `<local / SHARED or PRODUCTION: reads only, writes need an explicit yes>`. How to run a read-only check: `<…>`.
- Queues/cache: `<local Redis on …; never point dev at production's>`.
- Manual check: `<URLs, test accounts/roles, browser tool>`.

## High-risk areas
<!-- Reviewed line by line, as an attacker would. -->
- <auth/guards: paths>
- <billing/webhooks: paths>
- <money/stock/transactions: paths>
- <personal/medical data, compliance: rules that apply>

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
