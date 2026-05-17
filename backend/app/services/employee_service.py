from math import ceil
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def get_employees(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    country: Optional[str] = None,
    department: Optional[str] = None,
    job_title: Optional[str] = None,
) -> dict:
    query = db.query(Employee)

    # Full-text search across name, email, job title
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Employee.full_name.ilike(term),
                Employee.email.ilike(term),
                Employee.job_title.ilike(term),
            )
        )

    # Exact filters (uses our indexes)
    if country:
        query = query.filter(Employee.country == country)
    if department:
        query = query.filter(Employee.department == department)
    if job_title:
        query = query.filter(Employee.job_title == job_title)

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    employees = (
        query
        .order_by(Employee.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "data": employees,
    }


def get_employee_by_id(db: Session, employee_id: int) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.id == employee_id).first()


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    employee = Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(
    db: Session,
    employee_id: int,
    data: EmployeeUpdate,
) -> Optional[Employee]:
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        return None

    # Only update fields that were actually provided
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> bool:
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        return False
    db.delete(employee)
    db.commit()
    return True


def get_distinct_countries(db: Session) -> list[str]:
    rows = db.query(Employee.country).distinct().order_by(Employee.country).all()
    return [r.country for r in rows]


def get_distinct_departments(db: Session) -> list[str]:
    rows = db.query(Employee.department).distinct().order_by(Employee.department).all()
    return [r.department for r in rows]


def get_distinct_job_titles(db: Session) -> list[str]:
    rows = db.query(Employee.job_title).distinct().order_by(Employee.job_title).all()
    return [r.job_title for r in rows]