# Impact: change it everywhere

A change isn't done when the code you were looking at changed. It's done when **everything that depends on it** has changed too: every app, package, client, doc, test and piece of stored data. Example: changing the API key format touches the API (generation, validation, the auth guard), the dashboard (display, copy button, masking), the SDKs and CLI (validation, config, error messages), the MCP tools (descriptions), the docs and examples, the tests and fixtures, the keys already stored, and SDK versions already in users' hands.

## 1. Name what changes
Write down exactly what is changing. This becomes your list of things to search for:
- **Literal values:** the old format or prefix (`sk_`), a regex that matches it, a sample value.
- **Names:** the function, type, field, column, enum value, constant, env var or config key, route path, event name, CLI flag, tool name.
- **Words:** the user-facing copy and error messages that describe it.
- **Behaviour:** the rule that changes (a limit, a validation, a default, the response shape).

## 2. Search everywhere
- **Run each term across the whole repo,** not one app: every app and package, plus docs, `*.md`, examples, READMEs, changelogs, fixtures, snapshots, seeds, mocks, env example files, CI config, Dockerfiles and manifests, email templates, translations, help text, OpenAPI specs, and tool or command descriptions.
- **Search generated code too,** but regenerate it instead of editing it.
- **Search case-insensitively and by pattern** as well as by exact name. A format check often lives in a regex in a different file.

## 3. Think past the search
These won't show up in a text search:
- **Stored data:** rows, keys, tokens, files and cache entries already in the old shape. Plan a migration, a compatibility path, or both.
- **Clients in the wild:** published SDK, CLI and app versions, integrations, and webhooks consumers already rely on. Keep the old form working or deprecate it, and say which.
- **Other repos and mirrors:** packages published from this repo, separate client repos, and the infrastructure config.
- **Outside the code:** vendor dashboards, provider settings, scheduled jobs, monitoring and alerts that match the old value.

## 4. Write the impact map
Put it in the plan, as a table. Every surface the profile lists appears in it, even when nothing changes there:

| Surface | Where (files) | Change | Status |
|---|---|---|---|
| API | `auth/api-key.service.ts`, `auth/app-auth.guard.ts` | new format; still accept the old one until the deprecation date | planned |
| Dashboard | `api-keys/key-row.tsx` | masking for the new length | planned |
| SDK / CLI / MCP | `sdk/src/client.ts`, `cli/src/config.ts`, `mcp/src/tools.ts` | validation regex, help text | planned |
| Docs | `docs/authentication.md`, the examples | new format, a migration note | planned |
| Stored data | `api_keys` collection | old keys keep working; no migration needed | n/a |
| Landing | none found | none | n/a (searched `sk_`, "API key") |

The impact map is where the plan's scope fence comes from. A surface you add later is drift: stop and ask, or add it to the plan.

## 5. Prove coverage
- **After the build,** run every search again. The old value may remain only where it's intentional (compatibility code, changelog entries, migration scripts), and each such hit gets a reason.
- **Each row of the map needs evidence** that it holds: a test, a typecheck, a rebuilt client, or a doc you re-read.
- **Report the map** with each row's status: done, n/a, or left (and why). Review and `/jod-ship` check it.
