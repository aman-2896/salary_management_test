from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
SQL_ALCHEMY_DB_URL = 'sqlite:///.employees.db'

engine=create_engine(
    SQL_ALCHEMY_DB_URL,
    connect_args={"check_same_thread":False} #sqlite access same thread fsale
)

SessionLocal = sessionmaker(autocommit=False, autoflush =False, bind=engine)


class Base(DeclarativeBase):
    pass

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
