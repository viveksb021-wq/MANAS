import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Database URL configured dynamically via settings (supports PostgreSQL & SQLite)
DB_PATH = settings.DATABASE_URL

# For SQLite, set check_same_thread to False; pool_pre_ping for Postgres
connect_args = {"check_same_thread": False} if DB_PATH.startswith("sqlite") else {}

engine = create_engine(
    DB_PATH,
    connect_args=connect_args,
    pool_pre_ping=True if not DB_PATH.startswith("sqlite") else False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
