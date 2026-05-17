# AI Prompts Used

This file documents every significant prompt given to AI tools during development.
It shows how AI was used intentionally to accelerate work while maintaining
engineering quality and correctness.

---

## Prompt 1 — Schema design

**Tool**: Claude
**Prompt**: "I'm building a salary management tool for 10,000 employees. The user
persona is an HR Manager. What fields should the Employee model have beyond the
required ones (full_name, job_title, country, salary)? Justify each field from
an HR perspective."
**Used for**: Deciding to add department, employment_type, hire_date, currency, email

## Prompt 2 — SQLAlchemy model with indexes

**Tool**: Claude
**Prompt**: "Design a SQLAlchemy Employee model for a salary management system
with 10,000 employees. Include fields: full_name, email, job_title, department,
country, salary, currency, employment_type, hire_date, created_at, updated_at.
Add database indexes optimised for analytics queries that GROUP BY country and
job_title. Use DeclarativeBase (SQLAlchemy 2.x style)."
**Used for**: `app/models/employee.py` — final model structure and index strategy
**Decision made**: Added a composite index on (country, job_title) together, not
just individually — because the primary analytics query filters on both
simultaneously. Single-column indexes would still require a full scan for that
combined filter.

---

## Prompt 3 — Name files for seed script

**Tool**: Claude
**Prompt**: "Give me two plain text files for a seed script — first_names.txt
and last_names.txt. Each file should have one name per line. Include ~80 diverse
first names and ~80 diverse last names representing a global workforce across
different ethnicities and cultures, since our employee data spans 15 countries."
**Used for**: `backend/seed/first_names.txt` and `backend/seed/last_names.txt`
**Decision made**: Chose culturally diverse names intentionally — the seeded data
spans 15 countries, so names from only one culture would feel unrealistic and
would not reflect a global org. Realistic data makes the insights dashboard
more meaningful during the demo.

---

## Prompt 4 — Seed script with bulk inserts

**Tool**: Claude
**Prompt**: "Write a Python seed script for SQLite using SQLAlchemy that inserts
10,000 employee records. Use bulk_insert_mappings inside a single transaction
with a batch size of 500. The script should be idempotent (clear before
re-seeding), accept a --count argument, load names from first_names.txt and
last_names.txt, and print time taken on completion."
**Used for**: `backend/seed/seed.py`
**Decision made**: Batch size of 500 chosen deliberately — stays safely under
SQLite's 999 bound variables limit per statement, while keeping the number of
transactions minimal. bulk_insert_mappings was chosen over session.add() because
it bypasses ORM object instantiation entirely, which is the main bottleneck at
this scale.

## Prompt 5 — Pydantic schemas and service layer

**Tool**: Claude
**Prompt**: "Write Pydantic v2 schemas for an Employee CRUD API. Include
EmployeeCreate (all required fields + validators), EmployeeUpdate (all optional
for partial updates), EmployeeResponse (adds id, created_at, updated_at, with
from_attributes=True). Validators: salary positive, full_name not whitespace,
employment_type from allowed set. Also write a service layer separating DB
logic from route handlers, with get_employees supporting pagination, search
across name/email/job_title, and filters for country/department/job_title."
**Used for**: `app/schemas/employee.py`, `app/services/employee_service.py`
**Decision made**: Service layer kept separate from routes deliberately — this
makes unit testing possible without spinning up the HTTP server. Routes are
just thin wrappers that call services and handle HTTP concerns (status codes,
404s). Business logic lives only in the service layer.

## Prompt 6 — Analytics service endpoints

**Tool**: Claude
**Prompt**: "Write a SQLAlchemy analytics service for a salary management system
with 10,000 employees. Required metrics: min/max/avg salary by country, average
salary by job_title within a specific country. Extra metrics meaningful to an
HR Manager: headcount and avg/min/max salary per department, top N highest paid
job titles globally by average salary, salary histogram distribution split into
8 bands, salary percentile bands (P25, P50, P75, P90), headcount and avg salary
per country. Use SQLAlchemy func for all aggregations, no raw SQL. Also write
the FastAPI router that exposes each metric as a GET endpoint."
**Used for**: `app/services/analytics_service.py`, `app/api/routes/analytics.py`
**Decision made**: Extra metrics were chosen specifically for the HR Manager
persona — department breakdown helps spot underpaid teams, percentile bands
surface pay equity issues, top paid roles helps benchmark compensation strategy.
These are not random additions; each one answers a question an HR Manager would
actually ask when opening this dashboard.

## Prompt 7 — Unit tests with fixture data

**Tool**: Claude
**Prompt**: "Write pytest unit tests for a FastAPI salary management service.
Use an in-memory SQLite test database so tests never touch the real DB.
Write a conftest.py with a db fixture (fresh per test) and a sample_employees
fixture with known deterministic values. Test CRUD operations, pagination,
search, and all analytics functions. Test names should read like sentences
describing what they verify."
**Used for**: `tests/conftest.py`, `tests/test_employee_service.py`,
`tests/test_analytics_service.py`
**Decision made**: In-memory SQLite with drop_all after each test guarantees
zero state leakage between tests. Using known fixture values (e.g. exact
salaries of 90k, 120k, 140k) means we can assert exact averages — no
approximations needed.

## Prompt 8 — Frontend scaffold and API layer

**Tool**: Claude
**Prompt**: "Set up a React 18 + Vite + TypeScript frontend for a salary
management tool. Install TanStack Query for server state, Axios for HTTP,
React Router for navigation, Recharts for charts, Tailwind CSS for styling,
Radix UI for accessible primitives. Create typed API modules for employees
(CRUD + meta endpoints) and analytics. Build an app shell with a fixed
sidebar navigation using a dark navy theme."
**Used for**: `frontend/` scaffold, `src/api/`, `src/App.tsx`
**Decision made**: All API calls centralised in `src/api/` — one file per
domain (employees, analytics). This means if the base URL or any endpoint
changes, there is exactly one place to update it. Components never call
axios directly.


## Prompt 9 — Employee list page with CRUD modals

**Tool**: Claude
**Prompt**: "Build a React employees page with a paginated table showing
full_name, email, job_title, department, country, salary, employment_type,
hire_date. Add a search bar filtering across name/email/job_title, dropdown
filters for country and department, an Add Employee button, and edit/delete
icons per row. Build a modal form for add/edit with field validation and a
separate delete confirmation modal. Use TanStack Query for data fetching with
placeholderData so the table doesn't flash on page change."
**Used for**: `src/pages/EmployeesPage.tsx`, `src/components/EmployeeFormModal.tsx`,
`src/components/DeleteConfirmModal.tsx`
**Decision made**: placeholderData keeps the previous page visible while the
next page loads — avoids a jarring blank flash on pagination which would feel
broken to an HR manager flipping through 500 pages of employees.


## Prompt 10 — Insights dashboard

**Tool**: Claude
**Prompt**: "Build a React insights dashboard for an HR salary management tool
using Recharts. Required: min/max/avg salary stat cards per country, avg salary
by job title per country. Extras that add HR value: salary percentile band
visualisation (P25/P50/P75/P90), salary distribution histogram, department avg
salary horizontal bar chart, top 10 highest paid roles globally, headcount per
country bar chart. Country selector drives the country-level charts. Use
TanStack Query for all data fetching."
**Used for**: `src/pages/InsightsPage.tsx`
**Decision made**: Country selector is a single control that drives four charts
simultaneously — distribution, percentiles, job title breakdown, and stat cards.
This is intentional UX: an HR manager analysing a specific country gets a
complete picture in one view without re-selecting country four times.
