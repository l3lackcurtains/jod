# Phase: done

Goal: prove it's finished, record it, hand over.

1. **Final run:** the full suites of every touched package, plus the typecheck/build of every touched app, with exact counts (see [verify.md](../../jod-engineering/verify.md)).
2. **Coverage:** re-run the impact map's searches ([impact.md](../../jod-engineering/impact.md) §5). Each row must be done (with evidence), n/a, or left with a reason, and every layer the profile lists must appear.
3. **Record it:** if the project keeps a roadmap, changelog or permissions doc (per the profile), update it in the existing style: what shipped, edge cases, tests added, and what's still open.
4. **Learn.** Propose one line for the profile (Gotchas or Reference implementations) if:
   - the user corrected you;
   - a check failed for a non-obvious reason;
   - a bug came from a rule the code doesn't show.

   If the same rule was broken twice, propose a hook instead. Show the diff to the profile, and apply it only on the user's yes.
5. **Close the plan:** tick the last step in `.claude/plans/<slug>.md`, and delete the file once it's all done.
6. **Report** as a feature summary ([report.md](../../jod-engineering/report.md) → `/jod-task` done):
   - **Heading:** what the user now has, plus one sentence.
   - **Coverage:** the impact map as a table of surface → what changed → status (done / n/a / left, and why).
   - **Proof:** exact counts, and what was and wasn't seen live.
   - **Fixed on the way:** bugs found during the task.
   - **Noticed, not done:** things outside scope, worth a later task.
   - **Needs you:** env vars, migrations or backfills to run, vendor settings, deploy timing.
   - **Cleanup:** the cleanup reminder line, if cleanup is due ([cleanup](../../jod-cleanup/SKILL.md) §5).
   - **Next:** `/jod-commit` (not committed yet).
