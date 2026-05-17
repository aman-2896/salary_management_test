from datetime import date, datetime
from sqlalchemy import Column, Integer, String,Float, Date, DateTime,Index
from sqlalchemy.sql import func
from app.core.database import Base

class Employee(Base):
    __tablename__="employees"

    id = Column(Integer,primary_key=True,index=True)
    full_name= Column(String(200), nullable=False)
    email= Column(String(200),unique=True,nullable=False)
    job_title= Column(String(150),nullable=False)
    department= Column(String(100),nullable=False)
    country= Column(String(100),nullable=False)
    salary= Column(Float, nullable=False)
    currency= Column(String(10),nullable=False,default='USD')
    employment_type= Column(String(50),nullable=False,default="Full-Time")
    hire_date= Column(Date,nullable=False)
    created_at= Column(DateTime, server_default=func.now())
    updated_at= Column(DateTime, server_default=func.now(), onupdate=func.now())


    __table_args__ = (
            Index("ix_employee_country", "country"),
            Index("ix_employee_job_title", "job_title"),
            Index("ix_employee_country_job_title", "country", "job_title"),
            Index("ix_employee_department", "department"),
        )