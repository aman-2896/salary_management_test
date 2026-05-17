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
