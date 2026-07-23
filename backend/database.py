from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Text, Enum, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aveness.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class BookingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    cancelled = "cancelled"
    completed = "completed"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True)
    address = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    preferred_date = Column(Date, nullable=True)
    preferred_time = Column(String, nullable=True)
    status = Column(String, default=BookingStatus.pending.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def _ensure_columns():
    """Add columns introduced after a table already exists in production.
    There's no migration framework here, so this brings an existing
    `bookings` table up to date with the current model on startup.
    """
    inspector = inspect(engine)
    if "bookings" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("bookings")}
    with engine.begin() as conn:
        if "preferred_date" not in existing:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN preferred_date DATE"))
        if "preferred_time" not in existing:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN preferred_time VARCHAR"))


def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_columns()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
