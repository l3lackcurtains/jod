# Jod profile: shop-cart

## How we work
- Mode: `established`. Small library, consistent patterns.
- Plan approval: `fast path for small changes`.
- Tests: `test-first where it pays`.

## Stack
- `src/`: plain ES modules, Node 20, `node:test`. No dependencies.

## Layers / surfaces (in build order)
1. `src/*.js` with a `*.test.js` next to each module.
2. `README.md` if public functions change.

## Verify commands
| Package | Typecheck/compile | Focused test (one file) | Tests | Notes |
|---|---|---|---|---|
| root | n/a | `node --test src/cart.test.js` | `npm test` | no lint |

## Branches and release
- Work on `development`. Only `/jod:ship` merges into `main`.

## Conventions
- Money is integer cents; never floats in stored or returned amounts.
- Named exports only; one module per concern.

## Hands-off
- Nothing.
