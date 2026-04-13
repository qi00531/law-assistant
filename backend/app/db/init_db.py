from app.db.base import Base
from app.db.session import engine
from app.models.note import Note


def init_db() -> None:
    """Create database tables for the MVP."""
    Base.metadata.create_all(bind=engine)


__all__ = ["Note", "init_db"]
