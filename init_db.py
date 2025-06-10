from models import Base
from database import engine

def init_database():
    print("Creating all database tables...")
    Base.metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()
