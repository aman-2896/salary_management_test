# Trade-off Decisions

## SQLite vs PostgreSQL

Chose SQLite: zero setup, easy deployment, sufficient for 10k rows.
Trade-off: no concurrent writes at scale. For a real org with multiple HR managers
writing simultaneously, PostgreSQL would be the correct choice.

## SQLAlchemy (sync) vs async

Chose sync for simplicity and testability. FastAPI supports async SQLAlchemy but
adds complexity (async sessions, connection pooling) with minimal benefit at this scale.

## shadcn/ui vs Ant Design / MUI

Chose shadcn/ui: headless, composable, no version lock-in. You own the component code.
Trade-off: more initial setup than AntD, but better long-term maintainability.
