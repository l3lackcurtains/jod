# Phase: done

Goal: prove it's finished, record it, hand over.

1. **Final run:** the full suites of every touched package, plus the typecheck/build of every touched app, with exact counts (see [verify.md](../../engineering/verify.md)).
2. **Every layer:** walk the profile's layer list once more. Each layer either changed or is explicitly not applicable.
3. **Record it:** if the project keeps a roadmap, changelog or permissions doc (per the profile), update it in the existing style: what shipped, edge cases, tests added, and what's still open.
4. **Summary for the user** (short, in this order):
   - what works now, by layer
   - bugs found and fixed on the way
   - checks with exact counts, and what was and wasn't seen live
   - anything outside code: env vars, migrations or backfills to run, vendor settings, deploy timing
   - not committed: suggest `/jod:commit`, then `/jod:ship` when it's time to release.
