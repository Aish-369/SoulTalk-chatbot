import os
import logging
import time
from typing import Generator
from sqlalchemy import create_engine, pool, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError, DatabaseError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load SoulTalk environment parameters
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

DATABASE_URL = os.getenv("DATABASE_URL")

# Production-grade resilient database engine creation for Neon PostgreSQL
# Automatically falls back to SQLite if PostgreSQL/Neon is unreachable (e.g. offline mode)
sqlite_engine = create_engine(
    "sqlite:///./local_soultalk.db",
    connect_args={"check_same_thread": False},
    echo=False
)
SqliteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

engine = None
SessionLocal = None

if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
    logger.info("Using SQLite database engine as primary")
    engine = sqlite_engine
    SessionLocal = SqliteSessionLocal
elif DATABASE_URL.startswith("postgresql"):
    if "sslmode" not in DATABASE_URL:
        DATABASE_URL = f"{DATABASE_URL}&sslmode=require"
    try:
        engine = create_engine(
            DATABASE_URL,
            poolclass=pool.QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 3},
            echo=False
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("Configured Neon PostgreSQL database engine with 3s connect timeout")
    except Exception as e:
        logger.warning(f"Could not initialize PostgreSQL engine: {e}. Defaulting to SQLite fallback.")
        engine = sqlite_engine
        SessionLocal = SqliteSessionLocal
else:
    engine = sqlite_engine
    SessionLocal = SqliteSessionLocal

Base = declarative_base()

def test_connection(max_retries: int = 2) -> bool:
    """Test database connection with fast fallback."""
    for attempt in range(max_retries):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(0.5)
    return False

def get_db() -> Generator[Session, None, None]:
    """Get database session with seamless offline fallback."""
    try:
        db = SessionLocal()
        # Ping connection
        db.execute(text("SELECT 1"))
        yield db
        db.commit()
        return
    except Exception as e:
        logger.warning(f"Primary DB session failed: {e}. Switching to offline SQLite fallback.")
        # Fallback to local SQLite session
        try:
            Base.metadata.create_all(bind=sqlite_engine)
            fallback_db = SqliteSessionLocal()
            yield fallback_db
            fallback_db.commit()
        except Exception as fallback_err:
            logger.error(f"Fallback SQLite error: {fallback_err}")
            raise
        finally:
            fallback_db.close()
    finally:
        try:
            db.close()
        except Exception:
            pass
