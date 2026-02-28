"""
Database engine and session factory.
Defaults to SQLite locally — swap DATABASE_URL to postgresql:// on Railway.

Uses lazy initialization so an import-time connection failure does NOT crash the app.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

_engine = None
_SessionLocal = None


def _get_database_url() -> str:
    # Railway injects DATABASE_URL (postgres:// or postgresql://) directly into os.environ
    url = os.environ.get("DATABASE_URL", "sqlite:///./stylo.db")
    # SQLAlchemy requires postgresql://, not postgres:// (older Railway format)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def _get_engine():
    global _engine
    if _engine is None:
        url = _get_database_url()
        connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        _engine = create_engine(url, connect_args=connect_args)
    return _engine


def _get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


# Expose as module-level attributes for backward compatibility
class _EngineProxy:
    def __getattr__(self, name):
        return getattr(_get_engine(), name)


class Base(DeclarativeBase):
    pass


# Lazy engine — only connects when first used
engine = _get_engine()
SessionLocal = _get_session_local()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
