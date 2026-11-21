from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Ensure SQLite database is always stored inside the backend directory
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "onebox.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="NOTE", index=True)
    remind_at = Column(DateTime, nullable=True, index=True)
    reminder_status = Column(String(50), nullable=True, default="PENDING", index=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


def init_db():
    """Create all database tables automatically and apply safe schema migrations for existing databases."""
    Base.metadata.create_all(bind=engine)

    # Safely migrate existing tables if columns are missing
    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(items)")).fetchall()
            existing_columns = {row[1] for row in result}

            if "remind_at" not in existing_columns:
                conn.execute(text("ALTER TABLE items ADD COLUMN remind_at DATETIME;"))
            if "reminder_status" not in existing_columns:
                conn.execute(text("ALTER TABLE items ADD COLUMN reminder_status VARCHAR(50) DEFAULT 'PENDING';"))
            if "is_completed" not in existing_columns:
                conn.execute(text("ALTER TABLE items ADD COLUMN is_completed BOOLEAN DEFAULT 0;"))
            conn.commit()
    except Exception:
        pass


def get_db():
    """FastAPI dependency to yield a database session and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
