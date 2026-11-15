# Phase: review

Goal: an independent review of the uncommitted change, with real findings fixed.

1. **Follow [review.md](../../engineering/review.md)** on the current diff, in order:
   - risk triage;
   - a calibrated code-review pass;
   - the pattern, principles, silent-failure, test and surface checks;
   - the check against the saved plan.
2. **Fix what's real,** each real bug with a regression test that fails without the fix. Skip the rest with a one-line reason.
3. **Report:** one status line, then a table of finding → fixed / skipped (why).
4. **If anything changed,** the loop goes back to the test phase.
