---
name: cleanup
description: "Find and remove what the codebase no longer needs: bad comments, unused code, unused files, dependencies, config and leftovers. Scans read-only, asks what to remove, removes it in behaviour-neutral groups with proof, and records when it last ran so the other commands can remind you."
argument-hint: "[release | path or area] [comments|code|files|deps|all]"
disable-model-invocation: true
---

# /jod:cleanup

Scope: `$ARGUMENTS` (a path or area, and/or a kind; default: the whole repo, every kind)

**`release` scope** (run by `/jod:ship` before its gate): only what the release adds or orphans.
- The lines and files changed in `git diff main...development`: bad comments in added lines, leftover debug logging, commented-out code, new TODOs without an owner.
- What those commits made dead: exports, files, dependencies, config and tests whose last user was removed in the release.
- Old debt in untouched files stays out of a release cleanup; that's the regular cleanup's job.

Dead code, stale comments and forgotten files make every later change slower: more to read, more to search, more to keep green. Cleanup removes them on purpose, on a rhythm, instead of as drive-by tidying inside feature work. It **never changes behaviour**: it removes only what it can show is unused, and only what the user picked.

Read `.claude/jod.md` (the profile: Hands-off, generated code, Conventions, the Cleanup section) and the comment rules in [principles.md](../engineering/references/principles.md) §2.

## 1. Start clean
- **A clean tree.** Cleanup lands as its own commits, never mixed with feature work. With uncommitted changes, stop and suggest `/jod:commit` first, or ask to limit the scope to files nobody is changing.
- **The right branch:** `development` or a side branch, never `main`.
- **A green baseline.** Run the typecheck and tests of the packages in scope and keep the counts. On a red baseline, report it and stop: never clean on red.

## 2. Scan (read-only)
Collect candidates with evidence. Skip the profile's Hands-off and generated paths, vendored code, applied migrations, and everything on the profile's Cleanup "Keep" list.

| Kind | Look for |
|---|---|
| **Comments** | Anything [principles.md](../engineering/references/principles.md) §2 rules out: tracker, plan or ticket ids, step labels, change history, restated code, comments the code now contradicts, commented-out code, TODOs with no owner or issue, banners. Also in test names and in doc comments that ship as API docs. |
| **Unused code** | Exports, functions, classes, components, hooks, types and constants with no callers; unreachable branches; feature flags that are always on or off; leftover debug logging. |
| **Unused files** | Modules nothing imports; orphaned tests, fixtures, snapshots and assets; scripts that point at things that no longer exist; stray notes and scratch files an agent left behind; jod plan files in `.claude/plans/` whose work is committed or abandoned. |
| **Dependencies and config** | Manifest entries nothing imports; env vars and config keys nothing reads; package scripts for removed files. |

**Proving "unused":**
- Use the repo's own dead-code or unused-dependency tooling if it has some. Never add a tool without asking.
- Otherwise search the **whole repo** (every app, package, test, script, config and doc) for the name, and also as a string: dynamic imports, injection tokens, route and path strings, templates, reflection, serialized or stored names.
- "Nothing here calls it" is not enough for: public API routes and package entry points, SDK and CLI surface, webhooks, scheduled jobs, migration and backfill scripts that still have to run somewhere, framework conventions (file-based routes, lifecycle hooks), anything loaded by name or stored in data. These are **needs you**, never removed on your own judgement.

Rate each candidate:
- **certain:** private, and zero references;
- **likely:** the only references are its own tests or docs;
- **needs you:** public, loaded by name, data-related, or a one-off script.

## 3. Ask
Show a summary table: kind → count → a few examples (`path:line`) → confidence. Then ask with AskUserQuestion (multi-select) which groups to clean, recommending the **certain** ones. List the **needs you** items one by one so the user can tick each. Nothing is removed without a yes. For a large set, offer to go one area or one kind at a time.

## 4. Clean in small, behaviour-neutral groups
One kind (or one area) per group, so each becomes its own commit.
- **Comments:** reword to the *why*, or delete. Never drop a real reason (a vendor quirk, a race, a legal rule) along with the tracker id: keep the reason, lose the id.
- **Code and files:** delete, and fix the imports. Remove the tests that only tested the removed code, and name them. No renames, refactors or "while I'm here" changes.
- **Dependencies:** remove them through the package manager, so the lockfile follows.
- **Generated output** that came from what you changed (API docs from doc comments, for example): regenerate it, never hand-edit it.
- **After each group:** run the typecheck and tests in scope. The counts match the baseline, minus the removed tests you named. If anything breaks, put that item back, mark it "in use (why)", and add it to the profile's Keep list when the reason isn't visible in the code.

## 5. Record, and remind
- **Profile, Cleanup section:** after a whole-repo run, set `Last: <date> (<scope>)` (a `release` or single-area run doesn't reset the reminder), add the Keep entries you learned, and, if the same kind of bad comment or leftover keeps coming back, propose a Conventions line (or a hook) so new code stops adding it. Apply profile changes only on the user's yes.
- **Reminder (the one definition):** cleanup is **due** when the profile's cadence has passed since `Last`, or when there is no `Last` and the repo has history. When it's due, the `/jod:task` done, `/jod:commit` and `/jod:ship` reports add one line before `Next:`:
  `🧹 Cleanup due (last: <date or never>, every <cadence>) → /jod:cleanup`
  A reminder never runs cleanup and never blocks anything. Cadence `on request` means no reminders.

## Never
Change behaviour, rename or restructure, delete data or run migrations, touch Hands-off or generated paths by hand, or remove anything that is only "probably" unused.

## Report
Report as a cleanup log ([report.md](../engineering/references/report.md) → `/jod:cleanup`):
- **Heading:** what was cleaned and the net lines removed; behaviour unchanged.
- **Table:** kind → removed → kept (needs you, or in use and why).
- **Proof:** baseline vs after counts, typecheck and builds.
- **Profile:** the new `Last` date and any Keep entries.
- **Next:** `/jod:commit`, one commit per kind.
