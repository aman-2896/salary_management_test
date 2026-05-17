from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    PaginatedEmployeeResponse,
)
from app.services import employee_service

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=PaginatedEmployeeResponse)
def list_employees(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    country: Optional[str] = Query(default=None),
    department: Optional[str] = Query(default=None),
    job_title: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return employee_service.get_employees(
        db, page, page_size, search, country, department, job_title
    )


@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(db, data)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = employee_service.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = employee_service.update_employee(db, employee_id, data)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = employee_service.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")


@router.get("/meta/countries", response_model=list[str])
def list_countries(db: Session = Depends(get_db)):
    """Returns distinct countries — used to populate filter dropdowns in the UI."""
    return employee_service.get_distinct_countries(db)


@router.get("/meta/departments", response_model=list[str])
def list_departments(db: Session = Depends(get_db)):
    return employee_service.get_distinct_departments(db)


@router.get("/meta/job-titles", response_model=list[str])
def list_job_titles(db: Session = Depends(get_db)):
    return employee_service.get_distinct_job_titles(db)