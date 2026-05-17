from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models import employee
from app.core.database import Base
from app.api.routes import employees
from app.api.routes import employees, analytics



Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Salary management API",
    description="Hr Salary management for emplyees",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(employees.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
@app.get("/health")
def health_check():
    return {"status":"ok"}