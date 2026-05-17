# Salary Management Tool

A full-stack salary management tool for 10,000 employees,
built for an HR Manager persona.

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python 3.13, FastAPI, SQLAlchemy, SQLite |
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS |
| State     | TanStack Query                          |
| Charts    | Recharts                                |
| Testing   | pytest, in-memory SQLite fixtures       |

## Features

### Employee Management

- Add, view, edit, delete employees via UI
- Server-side pagination (20 per page) across 10,000 employees
- Search across name, email, job title
- Filter by country and department
- CSV export of filtered results

### Salary Insights

- Min, max, average salary per country
- Average salary by job title within a country
- Salary percentile bands (P25, P50, P75, P90)
- Salary distribution histogram
- Department breakdown (headcount + avg salary)
- Top 10 highest paid roles globally
- Global headcount by country

## Project Structure

```
salary-management/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI route handlers
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic layer
│   │   └── core/            # DB connection, config
│   ├── tests/               # pytest unit tests
│   ├── seed.py              # Bulk insert seed script
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/             # Typed API client modules
│       ├── components/      # Reusable UI components
│       ├── pages/           # EmployeesPage, InsightsPage
│       └── lib/             # Utility helpers
└── docs/
    ├── ARCHITECTURE.md
    ├── TRADEOFFS.md
    ├── PROMPTS.md
    └── PERFORMANCE.md
```

## Local Setup

### Backend

```
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py              # seeds 10,000 employees
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Tests

```bash
cd backend
pytest tests/ -v
```

## AI Tools Used

See `docs/PROMPTS.md` for every prompt used during development,
the decisions made from each, and the reasoning behind them.

## Architecture Decisions

See `docs/ARCHITECTURE.md` and `docs/TRADEOFFS.md` for detailed
explanations of every major technical decision.