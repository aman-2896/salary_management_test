from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.services import employee_service
from datetime import date

def test_create_employee(db):
    data = EmployeeCreate(
        full_name="Jane Doe",
        email="jane.doe@company.com",
        job_title="Data Analyst",
        department="Finance",
        country="Germany",
        salary=75_000,
        currency="EUR",
        employment_type="Full-time",
        hire_date=date(2023, 1, 1),
    )
    employee = employee_service.create_employee(db, data)

    assert employee.id is not None
    assert employee.full_name == "Jane Doe"
    assert employee.salary == 75_000


def test_get_employee_by_id_returns_correct_employee(db, sample_employees):
    target = sample_employees[0]
    result = employee_service.get_employee_by_id(db, target.id)

    assert result is not None
    assert result.id == target.id
    assert result.full_name == target.full_name


def test_get_employee_by_id_returns_none_for_missing(db):
    result = employee_service.get_employee_by_id(db, 99999)
    assert result is None


def test_update_employee_changes_only_provided_fields(db, sample_employees):
    target = sample_employees[0]
    original_email = target.email

    update = EmployeeUpdate(salary=999_000)
    updated = employee_service.update_employee(db, target.id, update)

    assert updated.salary == 999_000
    assert updated.email == original_email  # unchanged


def test_update_employee_returns_none_for_missing(db):
    update = EmployeeUpdate(salary=50_000)
    result = employee_service.update_employee(db, 99999, update)
    assert result is None


def test_delete_employee_removes_record(db, sample_employees):
    target = sample_employees[0]
    deleted = employee_service.delete_employee(db, target.id)

    assert deleted is True
    assert employee_service.get_employee_by_id(db, target.id) is None


def test_delete_employee_returns_false_for_missing(db):
    result = employee_service.delete_employee(db, 99999)
    assert result is False


def test_get_employees_pagination(db, sample_employees):
    page1 = employee_service.get_employees(db, page=1, page_size=2)
    assert len(page1["data"]) == 2
    assert page1["total"] == 5
    assert page1["total_pages"] == 3


def test_get_employees_search_by_name(db, sample_employees):
    result = employee_service.get_employees(db, search="Alice")
    assert len(result["data"]) == 1
    assert result["data"][0].full_name == "Alice Johnson"


def test_get_employees_filter_by_country(db, sample_employees):
    result = employee_service.get_employees(db, country="United Kingdom")
    assert result["total"] == 2
    for emp in result["data"]:
        assert emp.country == "United Kingdom"