# Engineering principles

Every task is built to these, not just "make it work". [patterns.md](patterns.md) is about *looking like* the codebase; this file is about *being well built*. For each principle, find how **this repo already does it** (the profile's "Reference implementations", or Grep) and use that. Don't invent a second way.

Apply what's relevant: a copy change doesn't need a scalability plan, but every new endpoint, query, job, form, money or data flow does.

## 0. Simplicity (the counterweight to everything below)
- Do the simple thing first: the smallest change that solves today's problem. No abstraction, option or config for a case nobody has yet.
- Use the boring, existing stack. No new dependency, service or datastore until you've written how the current stack would do it and why that's too costly. "We could, but it's harder" means use the current stack.
- Apply the rest of this file in proportion. An internal admin toggle doesn't need idempotency keys and a recovery sweeper; a payment does.
- Delete what the change makes dead (Grep for callers first).
- **Review asks:** Could this be half the code? Is anything here for a future that may never come?

## 1. Architectural boundaries
- **Rule:**
  - Each module or feature owns its data and logic, with layers that each do one job:
    - entry points (controllers, routes, handlers, CLI commands) parse input, check access and delegate;
    - services hold the business rules;
    - adapters hold the I/O with external systems;
    - models or schemas hold the data.
  - Modules talk through their public services or APIs, never by reaching into another module's tables, models or internals.
  - Shared constants and types have one source of truth (a shared package or module), never copied.
  - UI: pages compose components → components call hooks/stores → hooks call the one API client. No business rules in templates.
  - Clients (SDKs, CLIs, other apps) use the public API only.
  - **Change, don't rewrite.** Extend the existing code in place. If a module truly needs replacing, do it incrementally: the new path sits beside the old one, callers move one at a time with each step shippable, and the old path is deleted at the end. A big-bang rewrite needs the user's explicit OK.
- **Review asks:** Is logic in the wrong layer (a fat controller, a UI computing what the API should)? Is there a new cross-module import of another module's internals? Is there a duplicated constant or type?

## 2. Self-documenting code
- **Rule:**
  - **Names:** names a reader can trust: boolean prefixes per the repo's convention, units in names (`timeoutMs`, `amountCents`), named constants for limits and magic values.
  - **Types:** types at every boundary (request/response, DTOs, public functions); no `any` or untyped dicts crossing a boundary.
  - **Comments:** only for the *why* a reader can't see in the code: a vendor quirk, a race, a business or legal rule (name the rule itself, e.g. "invoices are kept for 7 years by law"). Write them about the code as it is now, for someone who has never seen the plan. Never:
    - tracker, plan or ticket ids, step labels or review rounds ("roadmap 3.1", "step B", "PROJ-123", "fix for #42"): they belong in the commit message and the docs;
    - history ("added for…", "was X, now Y", "new:", "moved from…"): git keeps history;
    - comments that restate the code, author or date stamps, decorative banners;
    - commented-out code (delete it; git has it);
    - a TODO without an owner or an issue.

    The same rules apply to test names and to doc comments that ship as API docs.
  - **Public API docs:** API schema/docs (OpenAPI, docstrings) updated with the code.
- **Review asks:** Would a new teammate understand this without asking? Any `any`, magic value, misleading name, or unexplained rule? Any comment with a tracker id, history, restated code or commented-out code?

## 3. Scalability
- **Stateless services.** No per-instance memory state that must be shared: no in-memory caches, locks, counters or sessions. Shared state goes in the database, cache or queue. Scheduled work must be safe with several instances: dedupe with a stable job id or a distributed lock.
- **Indexes.** Every new query filter or sort has an index declared with the model or in a migration.
  - Composite key order: equality, then sort, then range.
  - Scope keys (tenant/org/workspace) go first.
  - Uniqueness is enforced by a unique index, not just a check in code.
  - Weigh new indexes against existing data size.
- **Pagination.** Every list endpoint is paginated with a capped `limit`; no unbounded queries. Fetch only the fields you need. No N+1: batch the lookups, or join/aggregate. Large exports and reports stream or run as jobs.
- **Async work.** Anything slow, external or retryable (sending, media processing, syncs, webhooks, email, imports, heavy recalculation) goes to the queue/job system with bounded retries and backoff, not inside the request. The request returns quickly with a status the client can poll.
- **Outbound calls.** Every HTTP or RPC call has a timeout. Respect vendor rate limits and the product's plan limits.
- **Review asks:** Does this still work with two instances, 100× the data, and a slow dependency? Is any query missing an index, or any list missing a limit?

## 4. Reliability and resilience
- **Graceful errors.**
  - Server: raise the framework's typed errors with a clear message, and let the global handler shape the response.
  - Catch only to add context, recover, or mark state failed; never swallow. Log through the project logger, never `console`/`print`.
  - Client: every mutation has error handling that the user sees; every view handles loading, empty, error and no-access states. No blank screens.
  - Partial failure is a modelled state, not an exception.
- **Consistency.** Writes that must agree (money, stock, counters, multi-document changes) happen in one transaction, or as a conditional/compare-and-set update. Never read-then-write. Money uses integer minor units and explicit rounding.
- **Idempotency.**
  - Create/charge endpoints that clients may retry accept an idempotency key.
  - Jobs and webhook handlers are safe to run twice: check "already done" before acting.
  - Writes use upserts or conditional updates.
  - Buttons can't double-submit.
- **Retries and recovery.** Use bounded retries with backoff for transient errors, and none for permanent ones (4xx, revoked auth → surface "reconnect"). Stuck work is recovered by a sweeper job, not by hand.
- **Automated testing.**
  - Tests come first where it pays: business logic, bugs, money, permissions.
  - Each behaviour has a test that fails if it breaks, and you can name the code change that would turn it red. Coverage percentages don't count.
  - Cover the happy path, validation, permission denied, the failure path and the duplicate/retry path. Concurrency-sensitive flows get a test with two requests at once.
  - Each fixed bug gets a regression test, seen failing before the fix.
  - Mock only external boundaries (third-party APIs, storage, email), not the code under test.
- **Review asks:** What happens if this runs twice, half-fails, times out, two users do it at once, or the dependency returns 500? Is that path tested? Is any failure **silent**: an empty `catch`, catch-log-and-continue, a default returned on error, or retries ending without marking failure?

## 5. Security
- **AuthN and AuthZ.**
  - Authenticated by default; public routes are explicit and few.
  - Every route checks the specific permission.
  - **Every query is scoped to the tenant** (org, workspace, account) taken from the session, never from the client body. Otherwise a user can read or change another tenant's data by changing an ID (IDOR).
  - Users of a portal or end-user role only ever see their own records.
- **Input.**
  - Validate at the boundary: schema validation with unknown fields rejected, and caps on string lengths, array sizes, amounts and uploads.
  - Check uploads by content signature, not file extension.
  - Escape user input before it goes into a regex, query or shell command.
- **Outbound URLs.** Server-side fetches of user-supplied URLs (webhooks, imports, previews) must block private/internal addresses, including after DNS resolution and redirects, to prevent SSRF.
- **Secrets.**
  - Third-party tokens are encrypted at rest.
  - Never log or return secrets, tokens or keys; mask them.
  - Config is fail-closed: a missing secret crashes at startup instead of falling back to a default.
  - New env vars go in the example env file only, without values.
- **Abuse.** Rate limits on auth, public, expensive and AI endpoints. Plan and feature limits are enforced on the server, never only in the UI.
- **Privacy.** Collect and return only the personal data the feature needs; no personal or sensitive data in logs or URLs; audit access to sensitive records where the law requires it.
- **Client.** No raw HTML from user content; validate external links; no tokens in URLs or new storage locations.
- **Review asks:** Can tenant A read or change tenant B's data? Can a low role do a high role's action? Can an attacker make the server fetch an internal URL? Is any secret logged or defaulted?

## 6. Operability
- Log meaningful events with context (tenant id, entity id, job id, request id), without secrets or personal data. Every new path logs one line you can search for in production.
- Schema and API changes are backward compatible:
  - new fields have defaults, or ship with a backfill script, noted for the release;
  - never remove or rename a field that external clients use without a deprecation path.

## Using this in the loop
- **Plan:** an **Engineering** section with only the principles that apply: boundaries, indexes and pagination, what goes async, consistency and idempotency, failure paths, permission and tenant scoping, security risks, compatibility, and the tests that cover each.
- **Build:** implement those decisions now, not "later".
- **Review:** walk the "Review asks" for each principle touched. Real gaps are findings to fix with tests, not notes.
