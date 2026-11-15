# How jod reports

Each command reports in the shape that fits its job: a bug fix reads like an incident note, a release like release notes with a runbook, a commit like a commit log. A few basics are shared.

## Shared basics
- **Outcome first.** The first line says whether it worked: `✅` done · `⚠️` done, but something needs the user · `⛔` blocked or failed. The rest supports it.
- **Exact facts:** counts as numbers (`312 passed`, not "all tests pass"), files as `path:line`, commits as `` `abc1234` subject``.
- **Tables** only where items compare across the same columns (checks, findings, commits). Short bullets everywhere else. Leave out empty sections; never write "None".
- **Short:** say what was done and what it means. Don't restate the plan or narrate the steps.
- **End with one `Next:`** line: the single command or decision that comes next.

## Per command

### `/jod-task <phase>`: a status line
One line per phase, with a short table only when something failed or was found:
```
✅ build · 4 files, inside the fence · modelled on orders-export.ts
✅ test · api 312 passed · web 88 passed
⚠️ review · 2 fixed, 1 skipped (table below)
```

### `/jod-task` done: a feature summary
What the user now has, by layer, then the proof:
```markdown
## ✅ CSV export for invoices
Admins and accountants can export the invoice list as CSV, streamed and capped at 50k rows.

| Layer | What changed |
|---|---|
| API | `GET /invoices/export` with the `invoices.export` permission, tenant-scoped |
| Web | "Export" button on the invoices table |

**Proof:** api 312 passed · web 88 passed · checked live as admin (works) and viewer (403)
**Fixed on the way:** the export ignored the tenant filter on archived invoices (+ regression test)
**Noticed, not done:** `orders-table.tsx` duplicates the date formatter
**Next:** `/jod-commit`
```

### `/jod-fix`: an incident note
A story in order, so the cause is clear:
```markdown
## ✅ Fixed: Bluesky comments missing from the inbox
**Symptom:** replies on older posts never appeared.
**Cause:** sync only fetched posts from the last 7 days (`comments.service.ts:212`).
**Fix:** sync walks every post with comments enabled, paged.
**Same bug elsewhere:** Threads sync had the same window, fixed. Mastodon is fine (it uses notifications).
**Proof:** regression test fails without the fix · api 1,095 passed · checked live: 3 missing replies appear
**Next:** `/jod-commit`
```

### `/jod-commit`: a commit log
Short. The commits are the content:
```markdown
## ✅ Committed and pushed to development
| Commit | |
|---|---|
| `a1b2c3d` | feat(invoices): CSV export |
| `d4e5f6a` | test(invoices): export permissions |

Review: 1 fixed, 0 open · Checks: api 312 passed, web 88 passed
Left alone: `apps/web/tmp.ts` (not from this session)
**Next:** `/jod-ship` when you want to release (3 commits waiting)
```

### `/jod-ship`: a release verdict and a runbook
The verdict and gate first; then the steps a human follows after the merge:
```markdown
## ✅ Released to main · `9f8e7d6`
| Gate | Result |
|---|---|
| Tests | ✅ api 312 · web 88 |
| Production builds | ✅ |
| Production check (Docker Compose) | ✅ healthy in 40 s · 3 smoke requests ok · clean shutdown |
| Deploy audit | ⚠️ 1 new env var |

**After deploy**
1. Set `EXPORT_MAX_ROWS` on the server.
2. Deploy api and web together.

**Rollback:** redeploy `4c3b2a1`. Nothing one-way.
**Verify in production:** `GET /invoices/export` returns a CSV; a failure shows as a 500 in the api logs.
**Next:** deploy · back on `development`
```

### `/jod-setup`: a profile summary
What jod learned, what you decided, and what's left to confirm:
```markdown
## ✅ Profile written · `.claude/jod.md`
**Found:** pnpm monorepo (api: NestJS, web: Next.js) · Docker Compose in production · 1,200 commits
**You chose:** mode `growing` · fast path for small changes · test-first where it pays
**To confirm:** 2 lines marked `TODO (confirm)` (the staging URL, the queue dashboard)
**Guards offered:** 3 deny rules, in the snippet below
**Next:** `/jod-task <your first task>`
```

## When blocked (any command)
Make the blocker unmissable, and offer a way forward:
```markdown
## ⛔ /jod-ship blocked · production check failed
`api` exited on start: `Missing required env var REDIS_URL`

**Options**
1. Add `REDIS_URL` to `.env.production.example` and re-run (recommended).
2. Release anyway: you accept the risk explicitly.

**Next:** option 1
```
