import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

# This pulls the Neon URL when on Render, and falls back to SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cramzero.db")

# SQLAlchemy requires "postgresql://" instead of "postgres://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 30}
    )
    
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=25,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- ADD THIS MISSING FUNCTION ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
