# Phase: plan

Goal: a plan the user approves before any code is written.

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

   List what you'll **reuse**, and anything you'd **extract** because it would otherwise be duplicated.
4. **Research only for product decisions** (pricing, limits, competitor parity): a quick web search; cite sources.
5. **Write the plan**, short:
   - **What changes:** per layer from the profile, plus which layers don't apply and why. Big work is split into steps A, B, C…, each shippable.
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
   - **Tests:** name the behaviours, including the failure, permission, duplicate and concurrent paths.
   - **Manual check:** which pages or flows to check, and as which roles.
   - **Risks,** and anything outside code (vendor settings, prices, DNS, compliance).
   - **No placeholders:** each step names its files and how it's checked. Not "handle edge cases" or "add validation"; say which ones.
6. **Stop.** Ask "Build it?" (or "Build step A?") and wait. Once it's approved, save the plan to the scratchpad as `plan.md`; the review checks the diff against it.

**Small change** (≤3 files, no schema, API contract, permission, money/data-integrity or security change): state the plan in 3 lines and build without waiting.
