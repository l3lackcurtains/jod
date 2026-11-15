# Phase: done

Goal: prove it's finished, record it, hand over.

1. **Final run:** the full suites of every touched package, plus the typecheck/build of every touched app, with exact counts (see [verify.md](../../jod-engineering/verify.md)).
2. **Every layer:** walk the profile's layer list once more. Each layer either changed or is explicitly not applicable.
3. **Record it:** if the project keeps a roadmap, changelog or permissions doc (per the profile), update it in the existing style: what shipped, edge cases, tests added, and what's still open.
4. **Learn.** Propose one line for the profile (Gotchas or Reference implementations) if:
   - the user corrected you;
   - a check failed for a non-obvious reason;
   - a bug came from a rule the code doesn't show.

   If the same rule was broken twice, propose a hook instead. Show the diff to the profile, and apply it only on the user's yes.
5. **Close the plan:** tick the last step in `.claude/plans/<slug>.md`, and delete the file once it's all done.
6. **Summary for the user** (short, in this order):
   - what works now, by layer
   - bugs found and fixed on the way
   - checks with exact counts, and what was and wasn't seen live
   - **Noticed, not done:** things outside scope, worth a later task
   - anything outside code: env vars, migrations or backfills to run, vendor settings, deploy timing
   - not committed: suggest `/jod-commit`, then `/jod-ship` when it's time to release.
