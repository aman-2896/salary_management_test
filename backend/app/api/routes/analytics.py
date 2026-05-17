from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/salary-stats")
def salary_stats(
    country: str = Query(..., description="Country to analyse"),
    db: Session = Depends(get_db),
):
    """Min, max, avg salary for a given country."""
    return analytics_service.get_salary_stats_by_country(db, country)


@router.get("/salary-by-job-title")
def salary_by_job_title(
    country: str = Query(..., description="Country to analyse"),
    db: Session = Depends(get_db),
):
    """Average salary per job title within a country."""
    return analytics_service.get_avg_salary_by_job_title_in_country(db, country)


@router.get("/department-breakdown")
def department_breakdown(db: Session = Depends(get_db)):
    """Headcount, avg, min, max salary per department across the org."""
    return analytics_service.get_department_breakdown(db)


@router.get("/top-paid-roles")
def top_paid_roles(
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Top N highest-paying job titles by average salary."""
    return analytics_service.get_top_paid_job_titles(db, limit)


@router.get("/salary-distribution")
def salary_distribution(
    country: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Salary histogram bands — global or filtered by country."""
    return analytics_service.get_salary_distribution(db, country)


@router.get("/salary-percentiles")
def salary_percentiles(
    country: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """P25, P50, P75, P90 salary percentiles — global or by country."""
    return analytics_service.get_salary_percentile_bands(db, country)


@router.get("/headcount-by-country")
def headcount_by_country(db: Session = Depends(get_db)):
    """Total employees and avg salary per country."""
    return analytics_service.get_headcount_by_country(db)