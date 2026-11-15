# Doubt a risky step

Not a review: the review of the whole change is `/jod:commit`'s job. This is one quick question while it's still cheap to change course: is this step's risky decision wrong? Later steps build on it, so a mistake found only at commit means redoing them.

A step gets one doubt pass, after its tests pass, when it:
- touches a HIGH file (the profile's High-risk areas, or the list in [engineering/review.md](../../engineering/review.md) §1);
- or makes a decision that's hard to undo: a migration or schema change, a public contract, money or stock math, permissions or tenant scoping, idempotency or ordering.

Every other step goes straight on; the build checkpoint and the tests are its guard.

1. **Ask what's wrong with the decision, not the whole step.** Give an independent reviewer (a specialist for the domain when one is available, [agents.md](../../engineering/agents.md); never the agent that built it) the smallest piece that holds the decision (the migration, the guard, the function), the plan's contract for it, and the attacker questions from engineering/review.md §1. Don't give it your reasoning. Without subagents, do it yourself, reading it as an attacker.
2. **Keep findings you'd bet on** (confidence ≥80). Fix what's real with a regression test; re-run the tests that cover it. Skip the rest with a reason.
3. **At most 2 rounds.** If the second round still finds real problems, the design is in doubt: stop and ask.
4. **Status line:** `doubt (migration): 1 fixed` or `doubt (permission): 0`.
