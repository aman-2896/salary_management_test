from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict


VALID_EMPLOYMENT_TYPES = {"Full-time", "Part-time", "Contract"}
VALID_CURRENCIES = {"USD", "GBP", "EUR", "INR", "CAD", "AUD", "SGD",
                    "BRL", "JPY", "SEK", "PLN", "MXN"}


class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    job_title: str
    department: str
    country: str
    salary: float
    currency: str
    employment_type: str
    hire_date: date

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("full_name cannot be empty or whitespace")
        return v.strip()

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("salary must be a positive number")
        return v

    @field_validator("employment_type")
    @classmethod
    def valid_employment_type(cls, v: str) -> str:
        if v not in VALID_EMPLOYMENT_TYPES:
            raise ValueError(
                f"employment_type must be one of {VALID_EMPLOYMENT_TYPES}"
            )
        return v

    @field_validator("currency")
    @classmethod
    def valid_currency(cls, v: str) -> str:
        if v not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return v

    @field_validator("job_title", "department", "country")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("field cannot be empty or whitespace")
        return v.strip()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    """All fields optional — supports partial updates (PATCH-style via PUT)."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    country: Optional[str] = None
    salary: Optional[float] = None
    currency: Optional[str] = None
    employment_type: Optional[str] = None
    hire_date: Optional[date] = None

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("full_name cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("salary must be a positive number")
        return v

    @field_validator("employment_type")
    @classmethod
    def valid_employment_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_EMPLOYMENT_TYPES:
            raise ValueError(
                f"employment_type must be one of {VALID_EMPLOYMENT_TYPES}"
            )
        return v

    @field_validator("currency")
    @classmethod
    def valid_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return v


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedEmployeeResponse(BaseModel):
    """Wrapper for paginated list responses."""
    total: int
    page: int
    page_size: int
    total_pages: int
    data: list[EmployeeResponse]