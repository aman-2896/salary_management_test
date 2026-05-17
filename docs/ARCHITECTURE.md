# Architecture Overview

## Summary

A salary management tool for 10,000 employees, built for an HR Manager persona.
Full-stack: REST API backend + React SPA frontend.

## Backend

- **Python 3.13 + FastAPI** — async-ready, auto-generates OpenAPI docs, excellent Pydantic integration
- **SQLAlchemy (sync)** — ORM for clean model definitions; Alembic for migrations
- **SQLite** — sufficient for 10k rows, zero-config, easy to deploy; swap to PostgreSQL for production scale
- **Uvicorn** — ASGI server

## Frontend

- **React 18 + Vite + TypeScript** — fast dev experience, type safety
- **TanStack Query** — server-state management, caching, background refetch
- **TanStack Table** — headless table with server-side pagination
- **shadcn/ui** — accessible components, full control over styling
- **Recharts** — salary distribution and insight charts

## Database Schema

See `backend/app/models/employee.py` for the full model.
Key design: indexes on `country` and `job_title` for fast analytics GROUP BY queries.

## Project Structure

```
salary-management/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── core/
│   ├── tests/
│   ├── seed.py
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api/
│       └── hooks/
└── docs/
```
