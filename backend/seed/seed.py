"""
Seed script for 10,000 employees.

Usage:
    python seed.py              # seed 10,000 employees (default)
    python seed.py --count 500  # seed a custom number

Performance:
    Uses bulk_insert_mappings in batches of 500 inside a single transaction.
    Inserts 10,000 rows in ~2s on SQLite. See docs/PERFORMANCE.md for details.

Idempotent:
    Safe to run multiple times — clears existing data before inserting.
"""

import argparse
import random
import time
from datetime import date, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.database import engine, SessionLocal, Base
from app.models.employee import Employee


# ── constants ─────────────────────────────────────────────────────────────────

DEPARTMENTS = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Finance", "Human Resources", "Operations", "Legal", "Customer Success",
]

JOB_TITLES = [
    "Software Engineer", "Senior Software Engineer", "Staff Engineer",
    "Product Manager", "Senior Product Manager",
    "UX Designer", "UI Designer", "Product Designer",
    "Data Analyst", "Data Scientist", "ML Engineer",
    "DevOps Engineer", "Site Reliability Engineer",
    "Marketing Manager", "Content Strategist",
    "Sales Representative", "Account Executive", "Sales Manager",
    "Financial Analyst", "Accountant", "Finance Manager",
    "HR Specialist", "HR Manager", "Recruiter",
    "Operations Manager", "Business Analyst",
    "Legal Counsel", "Compliance Officer",
    "Customer Success Manager", "Support Specialist",
]

COUNTRIES = [
    "United States", "United Kingdom", "Germany", "France", "India",
    "Canada", "Australia", "Netherlands", "Singapore", "Brazil",
    "Japan", "Spain", "Sweden", "Poland", "Mexico",
]

EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"]

CURRENCIES = {
    "United States": "USD", "United Kingdom": "GBP", "Germany": "EUR",
    "France": "EUR",         "India": "INR",          "Canada": "CAD",
    "Australia": "AUD",      "Netherlands": "EUR",     "Singapore": "SGD",
    "Brazil": "BRL",         "Japan": "JPY",           "Spain": "EUR",
    "Sweden": "SEK",         "Poland": "PLN",          "Mexico": "MXN",
}

SALARY_RANGES = {
    "United States": (50_000, 250_000),
    "United Kingdom": (35_000, 180_000),
    "Germany":        (40_000, 160_000),
    "France":         (35_000, 140_000),
    "India":          (8_000,   60_000),
    "Canada":         (45_000, 180_000),
    "Australia":      (50_000, 190_000),
    "Netherlands":    (40_000, 160_000),
    "Singapore":      (45_000, 200_000),
    "Brazil":         (15_000,  80_000),
    "Japan":          (35_000, 140_000),
    "Spain":          (28_000, 110_000),
    "Sweden":         (40_000, 160_000),
    "Poland":         (20_000,  90_000),
    "Mexico":         (12_000,  70_000),
}


# ── helpers ───────────────────────────────────────────────────────────────────

def load_names(filename: str) -> list[str]:
    """Load names from a text file, one name per line."""
    path = Path(__file__).parent / filename
    return [line.strip() for line in path.read_text().splitlines() if line.strip()]


def random_hire_date() -> date:
    start = date(2010, 1, 1)
    end = date(2024, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


def build_employee_record(idx: int, first_names: list[str], last_names: list[str]) -> dict:
    """Build a single employee dict ready for bulk insert."""
    first = random.choice(first_names)
    last = random.choice(last_names)
    country = random.choice(COUNTRIES)
    salary_min, salary_max = SALARY_RANGES[country]

    return {
        "full_name": f"{first} {last}",
        "email": f"{first.lower()}.{last.lower()}.{idx}@company.com",
        "job_title": random.choice(JOB_TITLES),
        "department": random.choice(DEPARTMENTS),
        "country": country,
        "salary": round(random.uniform(salary_min, salary_max), 2),
        "currency": CURRENCIES[country],
        "employment_type": random.choices(
            EMPLOYMENT_TYPES, weights=[80, 10, 10]
        )[0],
        "hire_date": random_hire_date(),
    }


# ── seed ──────────────────────────────────────────────────────────────────────

def seed(db: Session, records: list[dict], batch_size: int = 500) -> float:
    """
    Bulk insert records in batches inside a single transaction.

    bulk_insert_mappings bypasses ORM object instantiation entirely —
    no per-row Python object overhead, no per-row commit.
    A single transaction wraps all rows; SQLite fsyncs once at commit.
    Batch size of 500 stays safely under SQLite's per-statement variable limit.
    """
    start = time.perf_counter()
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        db.bulk_insert_mappings(Employee, batch)
    db.commit()
    return time.perf_counter() - start


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed the employee database")
    parser.add_argument(
        "--count",
        type=int,
        default=10_000,
        help="Number of employees to seed (default: 10000)",
    )
    args = parser.parse_args()

    # Load names from the required text files
    print("Loading name files...")
    first_names = load_names("first_names.txt")
    last_names = load_names("last_names.txt")
    print(
        f"  {len(first_names)} first names × {len(last_names)} last names "
        f"= {len(first_names) * len(last_names):,} unique combinations"
    )

    # Generate all records in memory before touching the DB
    print(f"\nGenerating {args.count:,} employee records...")
    records = [
        build_employee_record(i, first_names, last_names)
        for i in range(args.count)
    ]

    # Ensure tables exist, then wipe and re-seed (idempotent)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("\nClearing existing employees...")
        db.query(Employee).delete()
        db.commit()

        print(f"Inserting {args.count:,} employees in batches of 500...")
        elapsed = seed(db, records)

        final_count = db.query(Employee).count()
        print(f"\n  ✓ {final_count:,} employees inserted in {elapsed:.2f}s")
    finally:
        db.close()


if __name__ == "__main__":
    main()