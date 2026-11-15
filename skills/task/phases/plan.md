# Phase: plan

Goal: a plan the user approves before any code is written.

**Approval follows the profile's "Plan approval":**
- `always`: every plan waits for OK.
- `fast path` (the default): a small change (≤3 files; no schema, public contract, permission, money/data-integrity or security change) gets a 3-line plan (what, files, how it's checked) and goes straight to build. Everything else waits.
- `multi-step work only`: only plans with steps A, B, C… wait.

Everything that waits follows the steps below.

1. **Understand the ask.** Restate it in one sentence. For a roadmap or issue id, read its spec and acceptance criteria. If something decides the design (policy, pricing, permissions, user-visible behaviour) and can't be found in the code, ask with AskUserQuestion: at most 3 questions, each with a recommended option. Don't ask what the code can answer.
2. **Explore.** Find the code the change touches: Grep/Glob, or one Explore agent for broad sweeps. Note the current behaviour, and any gaps or bugs you notice on the way.
3. **Study the existing patterns** ([patterns.md](../../engineering/patterns.md)). For each new file, read 2–3 of its closest siblings and note:
   - folder and filename
   - structure
   - data pattern
   - UI pieces and classes
   - loading/empty/error/no-access states
   - permission handling
   - tests

   List what you'll **reuse**, and anything you'd **extract** because it would otherwise be duplicated. When there's no sibling yet (mode `new`), name the convention you'll set and why; it's recorded in the profile once approved.
4. **Research only for product decisions** (pricing, limits, competitor parity): a quick web search; cite sources.
5. **Write the plan**, short:
   - **Appetite and cut line:** how much this is worth (hours, a day, a week). List what's in, and under **Not doing** what's cut or left for later. If it won't fit, cut scope, don't stretch the time. Ship the smallest version a user can use.
   - **Fits the existing design?** Say which existing architecture and patterns it extends. If it needs a new dependency or pattern, or a change to a boundary, data model or public contract, call that out: a decision for the user in `established`, a justified choice in `growing` and `new`.
   - **What changes:** per layer from the profile, plus which layers don't apply and why. List the files and modules you expect to touch: this is the **scope fence** the drift alarm compares against. Tidying the change needs goes in as its own step first (behaviour unchanged, tests green). Big work is split into steps A, B, C…, each shippable.
   - **Engineering** ([principles.md](../../engineering/principles.md)), only what applies:
     - boundaries (which layer owns what)
     - indexes and pagination
     - what goes async
     - transactions and idempotency
     - failure paths
     - permission and tenant scoping
     - security risks
     - backward compatibility and backfills
   - **Patterns to follow:** for each new file, where it goes and which existing file(s) it's modelled on; what's reused; what's extracted.
   - **Data/API changes:** fields, schema, endpoints, env vars, migrations.
   - **Tests:** name the behaviours, including the failure, permission, duplicate and concurrent paths. Untested code you'll change gets a characterization test first.
   - **Manual check:** which pages or flows to check, and as which roles.
   - **Risks,** and anything outside code (vendor settings, prices, DNS, compliance).
   - **No placeholders:** each step names its files and how it's checked. Not "handle edge cases" or "add validation"; say which ones.
6. **Stop.** Ask "Build it?" (or "Build step A?") and wait. Once it's approved, save it to `.claude/plans/<slug>.md` (keep `.claude/plans/` out of git) with the step checklist. Tick steps as they land and append handoff notes. The review checks the diff against it, and `/jod:task build <slug>` resumes from it in a fresh session.
