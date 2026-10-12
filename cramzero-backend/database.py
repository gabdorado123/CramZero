from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Connects to your local XAMPP MySQL
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:8111/cramzero_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# THIS IS THE VARIABLE PYTHON IS LOOKING FOR:
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()