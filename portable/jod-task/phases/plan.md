# Phase: plan

Goal: a plan the user approves before any code is written.

**Approval follows the profile's "Plan approval":**
- `always`: every plan waits for OK.
- `fast path` (the default): a small change (≤3 files; no schema, public contract, permission, money/data-integrity or security change) gets a 3-line plan (what, files, how it's checked) and goes straight to build. Everything else waits.
- `multi-step work only`: only plans with more than one step wait.

Everything that waits follows the steps below.

1. **Understand the ask.** Restate it in one sentence. For a roadmap or issue id, read its spec and acceptance criteria. If something decides the design (policy, pricing, permissions, user-visible behaviour) and can't be found in the code, ask the user: at most 3 questions, each with a recommended option. Don't ask what the code can answer.
2. **Explore.** Find the code the change touches: Grep/Glob, or one Explore agent for broad sweeps. Note the current behaviour, and any gaps or bugs you notice on the way.
3. **Study the existing patterns** ([patterns.md](../../jod-engineering/patterns.md)). For each new file, read 2–3 of its closest siblings and note:
   - folder and filename
   - structure
   - data pattern
   - UI pieces and classes
   - loading/empty/error/no-access states
   - permission handling
   - tests

   List what you'll **reuse**, and anything you'd **extract** because it would otherwise be duplicated. When there's no sibling yet (mode `new`), name the convention you'll set and why; it's recorded in the profile once approved.
4. **Research only for product decisions** (pricing, limits, competitor parity): a quick web search; cite sources. For a library or framework API the plan relies on and you're unsure of, check the installed version's docs now (`jod-engineering` §2), not during build.
5. **Write the plan**, short:
   - **Appetite and cut line:** how much this is worth (hours, a day, a week). List what's in, and under **Not doing** what's cut or left for later. If it won't fit, cut scope, don't stretch the time. Ship the smallest version a user can use.
   - **Fits the existing design?** Say which existing architecture and patterns it extends. If it needs a new dependency or pattern, or a change to a boundary, data model or public contract, call that out: a decision for the user in `established`, a justified choice in `growing` and `new`.
   - **Impact map** ([impact.md](../../jod-engineering/impact.md)): name what changes, search the whole repo for it, think past the search (stored data, clients in the wild, other repos), and list every surface → files → change, including the ones that don't apply and why. This becomes the **scope fence** the drift alarm compares against. Tidying the change needs goes in as its own step first (behaviour unchanged, tests green).
   - **Steps:** as many as the work needs, with no fixed number. Size them by the load: how many layers and files, how risky, how many separate outcomes.
     - Each step is one coherent, verifiable piece: it builds, its tests pass, and it leaves the app working. Examples: "tidy: extract the CSV writer", "API: export endpoint + permission", "web: export button".
     - For each step, give its goal, its files (inside the scope fence) and its check, and tag it:
       - **user-visible** (UI, an API response a client shows, CLI output): live check right after it ([check.md](check.md));
       - **risky** (as defined in [review.md](review.md) "In the loop"): a doubt pass after its tests;
       - **built by** you or a specialist agent ([agents.md](../../jod-engineering/agents.md)).
     - A one-step plan is fine for a focused change. Split when a step would mix concerns (tidy + behaviour, API + UI + migration), or would be too big to review in one go.
     - Order them so each builds on the last: tidying and data first, then the API, the UI, and the docs. Within that, put the riskiest step as early as possible, so a wrong assumption shows up before the rest is built on it.
   - **Engineering** ([principles.md](../../jod-engineering/principles.md)), only what applies:
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
6. **Ask how to run it.** Show the plan, then ask one question: "How should I run these N steps?"
   - **Run all steps (Recommended):** build every step back to back, each through test (a doubt pass for risky steps, a live check when due), with a status line after each. Stop only for a stop-and-ask, the drift alarm, or 2 failed rounds.
   - **Step by step:** after each step, show its status and wait for "next" (or for changes).

   The user can also answer with changes to the plan; revise it, and ask again.

   **No answer means run all steps.** That covers a headless or scheduled run, a question that can't be shown, or one that's dismissed without a choice. A stop by the user (Esc) is not a "no answer": stop.

   **Save it only when it needs tracking:** more than one step, step-by-step mode, or work likely to outlast the session. Then write `.claude/plans/<slug>.md` (keep `.claude/plans/` out of git) with the step checklist and the chosen mode; tick steps as they land and append handoff notes. `/jod-task build <slug>` resumes from it in a fresh session, in the same mode, and `/jod-commit` reviews against it, then deletes it. A one-step plan stays in the conversation.
