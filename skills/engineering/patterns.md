# Follow the existing patterns

New code should look like it was written by whoever wrote the code next to it. Before writing anything, find how this repo already does the same kind of thing and copy that, instead of inventing a new way. The project's own rules live in its conventions docs (listed in `.claude/jod.md`, or `CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING.md`). This file explains *how to find the right example to copy*.

## 1. Find the closest examples (always 2–3, never 0)
For each thing you're about to create (page, component, dialog/form, table/list, hook, store, route, DTO/schema, service, job, migration, CLI command, SDK method, test), find its nearest siblings:
- **Same area first:** the folder of the feature you're extending.
- **Same kind elsewhere:** Glob by naming convention (`**/*-dialog.*`, `**/use-*.*`, `**/*.controller.*`, `**/*_service.py`, …), or Grep a distinctive call (`useMutation`, `@Controller`, `router.get`, `DialogTrigger`).
- **The profile's "Reference implementations"**, if it lists them.

Read the examples fully. When two disagree, prefer the most recently written one (`git log -1 --format=%cs -- <file>`), and propose a profile line ("X is the current way, Y is legacy") so the next session doesn't decide it again, differently.

## 2. Write down the pattern before coding
In the plan, add a short **"Patterns to follow"** list. For each new file, note what the siblings do:
- **Location and name:** folder, filename convention, export style, one-thing-per-file or not.
- **Structure:** the order of imports, types, hooks or dependencies, early returns, and the main body.
- **Data:** how it fetches and mutates (client, cache keys, invalidation), where types and validation schemas live, and generated code to regenerate rather than hand-edit.
- **UI building blocks:** the primitives and shared components the siblings use (never edit vendored primitives), and how icon-only actions get labels.
- **Styling:** the exact utility classes and tokens the siblings use for spacing, cards, text sizes, muted text, and dark mode (if the repo supports it).
- **States:** loading (skeleton or spinner, never blank), empty, error, no-access, and pending buttons.
- **Copy:** wording, terminology and casing (domain terms from the profile).
- **Server:** route decorators or middleware, validation, permission checks, tenant scoping, error types, logging, audit.
- **Tests:** location, naming, fixtures and mocking style of the sibling's test.

## 3. Reuse before you create
- **Search first.** Grep for an existing component, hook, helper, service or util that already does it, or nearly does.
- **Use it** if it fits. If it does 80% of what you need, extend it carefully with an optional prop, parameter or variant rather than forking a copy.
- **Extract** when the same markup or logic would now exist in a second or third place. Put it next to its users: the feature folder for feature-only code, the shared folder for app-wide code, a lib/util for pure helpers, a service in the owning module for server logic. Then update the old callers.
- **Don't** extract something used only once, and don't create a parallel version of something that already exists.
- **No new dependency, helper library or pattern** when the repo already has a way. If you think one is needed, write how the current code would do it and why that's too costly, then stop and ask. "We could, but it's harder" means use what's there.

## 4. Check before you finish
Diff your new files against the examples you chose. Anything different (folder, naming, structure, styling, states, permission handling) needs a reason; otherwise change it to match. In the summary, name the examples you followed, e.g. "Built like `invite-dialog.tsx` and `members-table.tsx`".
