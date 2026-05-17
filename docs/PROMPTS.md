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
**Decision made**: Added composite index on (country, job_title) together, not just
individually — because the analytics query filters on both simultaneously.
