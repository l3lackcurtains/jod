# Phase: review

The full review runs once, in `/jod:commit`, over the whole change. The task loop doesn't review every step; it only doubts the risky ones (below). `/jod:task review` runs the full review now, on demand.

## On demand: `/jod:task review`
Goal: an independent review of the uncommitted change, with real findings fixed.

1. **Follow [review.md](../../engineering/review.md)** on the whole diff, in order:
   - risk triage;
   - a calibrated code-review pass;
   - the pattern, principles, silent-failure, test and surface checks;
   - the check against the plan (saved, or in the conversation).
2. **Fix what's real,** each real bug with a regression test that fails without the fix. Skip the rest with a one-line reason.
3. **Report:** one status line, then a table of finding → fixed / skipped (why).
4. **If anything changed,** re-run only what covers the changed files: their tests and the typecheck of their package.

`/jod:commit` won't review this diff again if nothing changed since (engineering/review.md §0).

## In the loop: doubt a risky step
Later steps build on earlier ones, so a wrong decision found only at commit means redoing them. A step gets one short doubt pass, after its tests pass, when it:
- touches a HIGH file (the profile's High-risk areas, or the list in [engineering/review.md](../../engineering/review.md) §1);
- or makes a decision that's hard to undo: a migration or schema change, a public contract, money or stock math, permissions or tenant scoping, idempotency or ordering.

Every other step goes straight on; the build checkpoint and the tests are its guard.

1. **Ask what's wrong with the decision, not the whole step.** Give an independent reviewer (a specialist for the domain when one is available, [agents.md](../../engineering/agents.md); never the agent that built it) the smallest piece that holds the decision (the migration, the guard, the function), the plan's contract for it, and the attacker questions from engineering/review.md §1. Don't give it your reasoning. Without subagents, do it yourself, reading it as an attacker.
2. **Keep findings you'd bet on** (confidence ≥80). Fix what's real with a regression test; re-run the tests that cover it. Skip the rest with a reason.
3. **At most 2 rounds.** If the second round still finds real problems, the design is in doubt: stop and ask.
4. **Status line:** `doubt (migration): 1 fixed` or `doubt (permission): 0`.
