# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus

# Database configuration
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")  # Default MySQL port
DB_NAME = os.getenv("DB_NAME", "hackathon_eval")

# Construct database URL for MySQL
DATABASE_URL = f"mysql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine with MySQL-specific configurations
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable automatic reconnection
    pool_recycle=3600,   # Recycle connections every hour
    pool_size=5,         # Maximum number of connections in the pool
    max_overflow=10      # Maximum number of connections that can be created beyond pool_size
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()