import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

from app.core.database import Base
from app.models.employee import Employee

# Separate in-memory SQLite for tests — never touches employees.db
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Fresh DB for every test — tables created, test runs, tables dropped.
    Guarantees full isolation between tests.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_employees(db):
    """
    Inserts a known, deterministic set of employees.
    Tests that use this fixture can assert exact values.
    """
    employees = [
        Employee(
            full_name="Alice Johnson",
            email="alice.johnson@company.com",
            job_title="Software Engineer",
            department="Engineering",
            country="United States",
            salary=120_000,
            currency="USD",
            employment_type="Full-time",
            hire_date=date(2021, 3, 15),
        ),
        Employee(
            full_name="Bob Smith",
            email="bob.smith@company.com",
            job_title="Software Engineer",
            department="Engineering",
            country="United States",
            salary=140_000,
            currency="USD",
            employment_type="Full-time",
            hire_date=date(2020, 6, 1)
        ),
        Employee(
            full_name="Carol White",
            email="carol.white@company.com",
            job_title="HR Manager",
            department="Human Resources",
            country="United States",
            salary=90_000,
            currency="USD",
            employment_type="Full-time",
            hire_date=date(2019, 11, 20),
        ),
        Employee(
            full_name="David Lee",
            email="david.lee@company.com",
            job_title="Software Engineer",
            department="Engineering",
            country="United Kingdom",
            salary=80_000,
            currency="GBP",
            employment_type="Full-time",
            hire_date=date(2022, 1, 10),
        ),
        Employee(
            full_name="Eva Green",
            email="eva.green@company.com",
            job_title="Product Manager",
            department="Product",
            country="United Kingdom",
            salary=95_000,
            currency="GBP",
            employment_type="Contract",
            hire_date=date(2023, 5, 1),
        ),
    ]
    db.add_all(employees)
    db.commit()
    return employees