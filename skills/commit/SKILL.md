---
name: commit
description: "Step 1 of 2. Review the uncommitted changes properly, fix what holds up, verify, commit in logical groups to development (merging any side branch into development) and push, so the tree is clean and ready for a new task or /jod:ship. Never touches main."
argument-hint: "[no-push]"
disable-model-invocation: true
---

# /jod:commit

Options: `$ARGUMENTS` (`no-push` = commit but don't push)

Step 1 of 2: `/jod:commit` keeps `development` clean and reviewed; `/jod:ship` (step 2) is the only thing that releases it to `main`. No PRs. The branch names (defaults `development` and `main`), commit style and never-stage list come from `.claude/jod.md`.

## Context
- Branch: !`git branch --show-current`
- vs origin: !`git status -sb | head -1`
- Changes: !`git status --short || true`
- Size: !`git diff --stat | tail -1 || true`

## Steps
1. **Branch.** Work lands on `development`.
   - **On `development`:** continue.
   - **On `main`:** never commit there. Move the uncommitted work with `git stash`, `git checkout development`, `git stash pop`, then continue. If `development` doesn't exist yet, ask, then create it from `main` (`git checkout -b development main && git push -u origin development`).
   - **On a side branch** (an experiment, a spike, a worktree): commit there as below, then merge it into `development` in step 8. Never into `main`.
   - **Nothing uncommitted** (and no side branch waiting to merge): say "nothing to commit; ready for a new task or `/jod:ship`" and stop.
2. **Know the change.**
   - Read the full diff (`git diff`, plus `git status` for new files) and group it into logical units, one per feature or fix.
   - Changes you didn't make in this session aren't yours (another session's work in progress, or accidental edits): list them and ask before including them.
3. **Review properly** with [review.md](../engineering/review.md): risk triage, a calibrated review, then the pattern, principles, silent-failure, test and surface checks.
   - This is the full review of work from `/jod:task` (which only doubts its risky steps) and `/jod:fix`. Review against its plan: the matching file in `.claude/plans/`, or the plan in this conversation.
   - If `/jod:task review` already covered this exact diff in this session, review only what changed since (review.md §0).
   - Fix what's real, with a regression test per bug. Skip the rest with a one-line reason.
4. **Verify** ([verify.md](../engineering/verify.md) "Per change"): typecheck and the full suites of every touched package, rebuilding shared or generated code first.
   - Skip the suites if `/jod:task done` ran them on this exact diff in this session and nothing changed since; say so.
   - Lint only the changed files, without auto-fix.
   - **Never commit red.**
5. **Overwrite check.** Run `git diff --numstat`. A file with big deletions and few additions may have been rewritten instead of edited, especially tests. Compare it with `git show HEAD:<file>` and restore anything lost.
6. **Stage explicitly** (never `git add -A` or `git add .`).
   - Never stage: env files (except examples), secrets, worktrees, scratch or debug files, build output, plus anything on the profile's never-stage list.
   - Glance at the staged diff for secrets (keys, tokens, connection strings).
7. **Commit** in the logical groups from step 2, using the repo's message style (`git log --oneline -15`) with a short bullet body of what and why. Use a heredoc.
   - A refactor or rename goes in its own commit, before the feature.
   - Tests go in the same commit as the logic they cover.
   - Never leave a commit that doesn't build.
8. **Land on `development`.**
   - On a side branch: `git checkout development && git pull --ff-only`, then `git merge --no-ff <branch>`. Resolve conflicts here; if they're beyond trivial, stop and ask. Re-run the affected tests after the merge, then delete the side branch, locally and on the remote if it was pushed.
   - Push `development` unless `no-push`. Never force-push. Never open a PR. **Never touch `main` here.**
9. **Close the plans:** delete the `.claude/plans/` files whose work is now committed (a task marked done, a fix note), and the folder if it's empty. Keep plans with unticked steps.

## Report
Report as a commit log ([report.md](../engineering/report.md) → `/jod:commit`):
- **The commits:** a table of hash · subject, and whether they were pushed.
- **One line each:** the review (fixed / open) and the checks (exact counts).
- **Left alone:** uncommitted changes that aren't yours.
- **Cleanup:** the cleanup reminder line, if cleanup is due ([cleanup](../cleanup/SKILL.md) §5).
- **Next:** `/jod:ship`, with the number of commits waiting (`git log --oneline main..development`).
