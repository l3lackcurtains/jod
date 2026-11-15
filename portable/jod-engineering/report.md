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
One line per phase or step, with a short table only when something failed or was found. In "run all steps" mode, prefix each line with the step (`2/4`):
```
✅ 1/3 tidy · extracted lib/csv.ts · tests green before and after · check pending
✅ 2/3 api · build, test (312 passed), doubt (permission): 1 fixed, check (403 for viewer; covers 1/3) ✓
⚠️ 3/3 web · check: export button missing for admin (table below)
```

### `/jod-task` done: a feature summary
What the user now has, by layer, then the proof:
```markdown
## ✅ CSV export for invoices
Admins and accountants can export the invoice list as CSV, streamed and capped at 50k rows.

| Surface | What changed | Status |
|---|---|---|
| API | `GET /invoices/export` with the `invoices.export` permission, tenant-scoped | ✅ |
| Web | "Export" button on the invoices table | ✅ |
| SDK / CLI | `invoices.export()` / `invoices export --csv` | ✅ |
| Docs | API reference + SDK page | ✅ |
| Landing | none (searched "export", "CSV") | n/a |

**Proof:** api 312 passed · web 88 passed · checked live as admin (works) and viewer (403)
**Fixed on the way:** the export ignored the tenant filter on archived invoices (+ regression test)
**Noticed, not done:** `orders-table.tsx` duplicates the date formatter
**Next:** `/jod-commit`
```

### `/jod-cleanup`: a cleanup log
What left the codebase, what stayed and why, and the proof nothing changed:
```markdown
## ✅ Cleanup: apps/api (comments, unused code)
−1,240 lines across 86 files; behaviour unchanged.

| Kind | Removed | Kept |
|---|---|---|
| Comments | 212 tracker ids reworded to the why, 31 commented-out blocks | 4 TODOs with an owner |
| Unused code | 18 exports, 3 components | `legacyExport()`: public route (needs you) |
| Files | 6 | `scripts/backfill-x.ts`: still to run in production |

**Proof:** api 1,498 → 1,481 passed (17 tests of removed code) · tsc ok · web build ok
**Profile:** Last cleanup 2026-11-15 · Keep + `scripts/backfill-*`
**Next:** `/jod-commit` (one commit per kind)
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
