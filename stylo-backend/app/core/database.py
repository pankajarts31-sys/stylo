"""
Database engine and session factory.
Defaults to SQLite locally — swap DATABASE_URL to postgresql:// on Railway.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

_DATABASE_URL = settings.database_url

# SQLite needs check_same_thread=False; Postgres doesn't use this kwarg
_connect_args = {"check_same_thread": False} if _DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(_DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
