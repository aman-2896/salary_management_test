from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.employee import Employee



def get_salary_stats_by_country(db: Session, country: str) -> dict:
    """Min, max, average salary for all employees in a country."""
    result = (
        db.query(
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
            func.avg(Employee.salary).label("avg_salary"),
            func.count(Employee.id).label("headcount"),
        )
        .filter(Employee.country == country)
        .first()
    )

    return {
        "country": country,
        "min_salary": round(result.min_salary or 0, 2),
        "max_salary": round(result.max_salary or 0, 2),
        "avg_salary": round(result.avg_salary or 0, 2),
        "headcount": result.headcount,
    }


def get_avg_salary_by_job_title_in_country(
    db: Session, country: str
) -> list[dict]:
    """Average salary for each job title within a specific country."""
    rows = (
        db.query(
            Employee.job_title,
            func.avg(Employee.salary).label("avg_salary"),
            func.count(Employee.id).label("headcount"),
        )
        .filter(Employee.country == country)
        .group_by(Employee.job_title)
        .order_by(func.avg(Employee.salary).desc())
        .all()
    )

    return [
        {
            "job_title": row.job_title,
            "avg_salary": round(row.avg_salary, 2),
            "headcount": row.headcount,
        }
        for row in rows
    ]


# ── extra metrics (HR-userful) ────────────────────────────────────────────

def get_department_breakdown(db: Session) -> list[dict]:
    """
    Headcount and average salary per department across the whole org.
    Helps HR spot underpaid departments at a glance.
    """
    rows = (
        db.query(
            Employee.department,
            func.count(Employee.id).label("headcount"),
            func.avg(Employee.salary).label("avg_salary"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
        )
        .group_by(Employee.department)
        .order_by(func.avg(Employee.salary).desc())
        .all()
    )

    return [
        {
            "department": row.department,
            "headcount": row.headcount,
            "avg_salary": round(row.avg_salary, 2),
            "min_salary": round(row.min_salary, 2),
            "max_salary": round(row.max_salary, 2),
        }
        for row in rows
    ]


def get_top_paid_job_titles(db: Session, limit: int = 10) -> list[dict]:
    """
    Top N highest-paying job titles globally by average salary.
    Useful for benchmarking compensation strategy.
    """
    rows = (
        db.query(
            Employee.job_title,
            func.avg(Employee.salary).label("avg_salary"),
            func.count(Employee.id).label("headcount"),
        )
        .group_by(Employee.job_title)
        .order_by(func.avg(Employee.salary).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "job_title": row.job_title,
            "avg_salary": round(row.avg_salary, 2),
            "headcount": row.headcount,
        }
        for row in rows
    ]


def get_salary_distribution(db: Session, country: str | None = None) -> list[dict]:
    """
    Salary histogram — splits employees into 8 bands.
    Helps HR visualise whether compensation is evenly spread
    or clustered at extremes.
    """
    query = db.query(Employee.salary)
    if country:
        query = query.filter(Employee.country == country)

    salaries = [row.salary for row in query.all()]
    if not salaries:
        return []

    min_s = min(salaries)
    max_s = max(salaries)
    band_count = 8
    band_size = (max_s - min_s) / band_count

    # Build bands
    bands = []
    for i in range(band_count):
        band_min = min_s + i * band_size
        band_max = min_s + (i + 1) * band_size
        count = sum(1 for s in salaries if band_min <= s < band_max)
        bands.append({
            "band": f"{int(band_min):,} – {int(band_max):,}",
            "min": round(band_min, 2),
            "max": round(band_max, 2),
            "count": count,
        })

    # Last band is inclusive on both ends
    bands[-1]["count"] += sum(1 for s in salaries if s == max_s)

    return bands


def get_salary_percentile_bands(db: Session, country: str | None = None) -> dict:
    """
    Breaks workforce into four salary bands: bottom 25%, mid 50%, top 25%.
    Gives HR a quick read on pay equity and spread.
    """
    query = db.query(Employee.salary)
    if country:
        query = query.filter(Employee.country == country)

    salaries = sorted([row.salary for row in query.all()])
    if not salaries:
        return {}

    def percentile(data: list[float], p: float) -> float:
        idx = int(len(data) * p / 100)
        return round(data[min(idx, len(data) - 1)], 2)

    return {
        "p25": percentile(salaries, 25),
        "p50": percentile(salaries, 50),
        "p75": percentile(salaries, 75),
        "p90": percentile(salaries, 90),
        "total_employees": len(salaries),
    }


def get_headcount_by_country(db: Session) -> list[dict]:
    """Total employees per country — useful for org overview."""
    rows = (
        db.query(
            Employee.country,
            func.count(Employee.id).label("headcount"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .group_by(Employee.country)
        .order_by(func.count(Employee.id).desc())
        .all()
    )

    return [
        {
            "country": row.country,
            "headcount": row.headcount,
            "avg_salary": round(row.avg_salary, 2),
        }
        for row in rows
    ]