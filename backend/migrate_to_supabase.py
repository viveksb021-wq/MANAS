"""
MANAS Supabase Migration & Verification Script
Initializes tables and seeds demo clinical records in Supabase PostgreSQL.
"""
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.models import User, PatientProfile, Guardian, Game, Memory, Person, Reminder
from app.seed import seed_database

def run_migration():
    masked_url = settings.DATABASE_URL
    if "@" in masked_url:
        prefix, rest = masked_url.split("@", 1)
        scheme_user = prefix.split(":")[0] + "://***:***"
        masked_url = f"{scheme_user}@{rest}"

    print(f"[*] Connecting to database: {masked_url}")
    print("[*] Verifying/creating all SQLAlchemy tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("[+] All tables verified successfully.")

    print("[*] Running seed data procedure...")
    seed_database()

    db = SessionLocal()
    try:
        users_count = db.query(User).count()
        patients_count = db.query(PatientProfile).count()
        guardians_count = db.query(Guardian).count()
        games_count = db.query(Game).count()
        memories_count = db.query(Memory).count()
        people_count = db.query(Person).count()
        reminders_count = db.query(Reminder).count()

        print("\n================= MANAS DATABASE STATUS =================")
        print(f" Users registered:     {users_count}")
        print(f" Patient profiles:     {patients_count}")
        print(f" Guardians:            {guardians_count}")
        print(f" Games catalog:        {games_count}")
        print(f" People I Know:        {people_count}")
        print(f" Memories recorded:    {memories_count}")
        print(f" Reminders scheduled:  {reminders_count}")
        print("==========================================================\n")
        print("[+] Supabase migration & verification completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
