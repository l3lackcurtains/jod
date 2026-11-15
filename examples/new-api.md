# Jod profile: trailhead-api (example)

<!-- An example profile for a new Python service. Conventions get added as they're decided. -->

## How we work
- Mode: `new`. 3 weeks old, 40 commits; most conventions not decided yet.
- Plan approval: `multi-step work only`.
- Tests: `test-first where it pays`.

## Conventions
<!-- Each line was decided during a /jod:task and recorded right away. -->
- Layout: by feature, `app/<feature>/{router,service,models,schemas}.py`.
- Validation: Pydantic v2 schemas at the router boundary.
- DB access: SQLAlchemy 2.0 async sessions through `app/db.py:get_session`. No raw SQL in routers.
- Errors: raise `AppError(code, message, status)`; one handler in `app/errors.py`.
- Tests: pytest in `tests/<feature>/`, using a real Postgres via testcontainers; mock only external HTTP.

## Stack
- Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, uv.

## Layers (in build order)
1. `app/<feature>/models.py` + an Alembic migration (`uv run alembic revision --autogenerate`)
2. `schemas.py` → `service.py` → `router.py`
3. `README.md` API section

## Verify commands
- Typecheck: `uv run pyright`
- Tests: `uv run pytest tests/<feature>` (full: `uv run pytest`)
- Lint: `uv run ruff check <files>` (no `--fix`)

Full gate: `uv sync --frozen && uv run pyright && uv run pytest && uv run ruff check .`

## Branches and release
- Work on `development`; only `/jod:ship` merges it into `main`. Nothing deploys automatically yet.

## Production
- Runtime: Docker Compose on a VPS. Definition: `deploy/compose.prod.yml`.
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2` (the container's CMD).
- Health: `GET /healthz` on :8000. Smoke: `GET /trails?limit=1`.
- Production env example: `.env.production.example`.
- Migrations: `alembic upgrade head` runs in the container entrypoint before uvicorn starts.

## Local environment
- Claude may start `uv run fastapi dev` (:8000).
- Database: local Docker Postgres; disposable, so writes are fine.

## High-risk areas
- `app/auth/`

## Reference implementations
- Feature: `app/trails/` (the first full feature; copy it)

## Cleanup
- Cadence: `after each release`. Last: `never`.
