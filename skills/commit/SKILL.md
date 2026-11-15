---
name: commit
description: Step 1 of 2. Review the uncommitted changes on the work branch properly, fix what holds up, verify, commit in logical groups and push, so the tree is clean and ready for a new task or /keel:ship.
argument-hint: "[no-push]"
disable-model-invocation: true
---

# /keel:commit

Options: `$ARGUMENTS` (`no-push` = commit but don't push)

Step 1 of 2: `/keel:commit` keeps the work branch clean and reviewed; `/keel:ship` (step 2) releases it. The branch names, commit style and never-stage list come from `.claude/keel.md`.

## Context
- Branch: !`git branch --show-current`
- vs origin: !`git status -sb | head -1`
- Changes: !`git status --short || true`
- Size: !`git diff --stat | tail -1 || true`

## Steps
1. **Branch.** Check you're on the profile's work branch (or a feature branch, if that's the project's flow). On the release branch, stop and ask. Nothing uncommitted? Say "nothing to commit; ready for a new task or `/keel:ship`" and stop.
2. **Know the change.**
   - Read the full diff (`git diff`, plus `git status` for new files) and group it into logical units, one per feature or fix.
   - Changes you didn't make in this session aren't yours (another session's work in progress, or accidental edits): list them and ask before including them.
3. **Review properly** with [review.md](../engineering/review.md): risk triage, a calibrated review, then the pattern, principles, silent-failure, test and surface checks.
   - If `/keel:task review` already covered this exact diff in this session, review only what changed since (review.md §0).
   - Fix what's real, with a regression test per bug. Skip the rest with a one-line reason.
4. **Verify** ([verify.md](../engineering/verify.md) "Per change"): typecheck and the full suites of every touched package, rebuilding shared or generated code first. Lint only the changed files, without auto-fix. **Never commit red.**
5. **Overwrite check.** Run `git diff --numstat`. A file with big deletions and few additions may have been rewritten instead of edited, especially tests. Compare it with `git show HEAD:<file>` and restore anything lost.
6. **Stage explicitly** (never `git add -A` or `git add .`).
   - Never stage: env files (except examples), secrets, worktrees, scratch or debug files, build output, plus anything on the profile's never-stage list.
   - Glance at the staged diff for secrets (keys, tokens, connection strings).
7. **Commit** in the logical groups from step 2, using the repo's message style (`git log --oneline -15`) with a short bullet body of what and why. Use a heredoc.
   - A refactor or rename goes in its own commit, before the feature.
   - Tests go in the same commit as the logic they cover.
   - Never leave a commit that doesn't build.
8. **Push** the branch unless `no-push`. Never force-push. Never touch the release branch here.

## Report
- Review: finding → fixed / skipped (why)
- Checks with exact counts
- Commits (`hash subject`), pushed or not
- Uncommitted changes left alone (not yours)
- What's waiting for release (`git log --oneline <release>..<work>`), and "Ready for a new task, or `/keel:ship` to release."
