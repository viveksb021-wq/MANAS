import datetime
import hashlib
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import (
    User, PatientProfile, Guardian, CognitiveProfile, Person,
    FaceRecognitionProfile, Memory, Reminder, Routine, Activity,
    Alert, Game, GameSession, GameResult, Place
)

from app.auth import hash_password

def ensure_schema_migrations():
    """Ensure SQLite table columns match updated models without requiring manual DB deletion."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for table in Base.metadata.sorted_tables:
            try:
                if engine.dialect.name == "sqlite":
                    result = conn.execute(text(f"PRAGMA table_info({table.name})")).fetchall()
                    existing_cols = {row[1] for row in result}
                else:
                    result = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table.name}'")).fetchall()
                    existing_cols = {row[0] for row in result}

                if not existing_cols:
                    continue

                for col in table.columns:
                    if col.name not in existing_cols:
                        col_type = col.type.compile(engine.dialect)
                        try:
                            conn.execute(text(f"ALTER TABLE {table.name} ADD COLUMN {col.name} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
            except Exception:
                pass


def seed_database():
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "vivek@manas.org").first():
            print("Database already seeded with MANAS demo records.")
            return

        print("Seeding MANAS demo database with rich North Eastern Region records...")

        # 1. Create Guardian User: Ravi
        guardian_user = User(
            email="ravi@manas.org",
            hashed_password=hash_password("ravi123"),
            role="guardian",
            full_name="Ravi"
        )
        db.add(guardian_user)
        db.commit()
        db.refresh(guardian_user)

        guardian = Guardian(
            user_id=guardian_user.id,
            phone_number="+91 98640 12345",
            relationship_to_patient="Son"
        )
        db.add(guardian)
        db.commit()
        db.refresh(guardian)

        # 2. Create Patient User: Prasad
        patient_user = User(
            email="vivek@manas.org",
            hashed_password=hash_password("vivek123"),
            role="patient",
            full_name="Prasad"
        )
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)

        patient = PatientProfile(
            user_id=patient_user.id,
            guardian_id=guardian.id,
            age=74,
            preferred_language="en",
            voice_preference="gentle_female",
            emergency_contact="+91 98640 12345",
            onboarding_completed=True
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # 3. Create Cognitive Activity Profile
        cog_profile = CognitiveProfile(
            patient_id=patient.id,
            current_difficulty=2,  # Easy -> Medium
            memory_score=82.5,
            attention_score=78.0,
            recall_score=85.0,
            pattern_score=80.0,
            avg_response_time_ms=2850.0,
            recent_trend="Consistent High Engagement"
        )
        db.add(cog_profile)

        # 4. Enrolled Familiar People (Complete Authoritative Family Roster)
        p1_family = [
            {"name": "Prasad", "relationship": "Patient", "photo_url": "/images/family/patient.jpeg", "notes": "Self profile - 74 years old, retired school principal in Shillong."},
            {"name": "Sunita", "relationship": "Wife", "photo_url": "/images/family/wife.jpeg", "notes": "Coordinates morning tea, daily medications & garden strolls."},
            {"name": "Ravi", "relationship": "Son", "photo_url": "/images/family/son.jpeg", "notes": "Your elder son. Visits every weekend from Guwahati and calls daily."},
            {"name": "Meera", "relationship": "Daughter", "photo_url": "/images/family/daughter.webp", "notes": "Your daughter. Lives nearby in Laitumkhrah, Shillong."},
            {"name": "Biren", "relationship": "1st Brother", "photo_url": "/images/family/brother-1.jpeg", "notes": "Your eldest brother. Retired engineer living in Jorhat."},
            {"name": "Kamla", "relationship": "1st Brother's Wife", "photo_url": "/images/family/brother-1-wife.jpeg", "notes": "Sister-in-law. Loves baking traditional Pitha sweets."},
            {"name": "Arun", "relationship": "Grandson", "photo_url": "/images/family/brother-1-son.jpeg", "notes": "14 years old. Loves playing classical guitar."},
            {"name": "Pooja", "relationship": "1st Brother's Daughter", "photo_url": "/images/family/brother-1-daughter.jpeg", "notes": "Niece. Studying medical science in Dibrugarh."},
            {"name": "Vikram", "relationship": "2nd Brother", "photo_url": "/images/family/brother-2.jpeg", "notes": "Your younger brother. Visits during Bihu festival."},
            {"name": "Asha", "relationship": "2nd Brother's Wife", "photo_url": "/images/family/brother-2-wife.jpeg", "notes": "Younger sister-in-law. Coordinates family video calls."},
            {"name": "Dr. Haren Barua", "relationship": "Family Doctor", "photo_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80", "notes": "Physician at Shillong Medical Center."},
            {"name": "JYOTHIKA", "relationship": "Spouse", "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", "notes": "Cherished family member enrolled by caregiver."}
        ]

        p1_persons = []
        for mem in p1_family:
            p = Person(
                patient_id=patient.id,
                name=mem["name"],
                relationship=mem["relationship"],
                photo_url=mem["photo_url"],
                notes=mem["notes"],
                frequently_seen=True,
                is_active=True
            )
            db.add(p)
            p1_persons.append(p)
        db.commit()

        # Enroll calibrated face recognition embeddings
        embeddings_map = {
            "Ravi": [0.15, 0.22, -0.31, 0.70, 0.45, -0.05, 0.62, 0.21, -0.11, 0.50, 0.40, -0.15, 0.38, 0.20, -0.05, 0.65] + [0.0]*48,
            "Meera": [-0.10, 0.35, 0.18, -0.25, 0.65, 0.48, -0.12, 0.58, 0.42, -0.18, 0.75, 0.10, -0.28, 0.60, 0.20, -0.10] + [0.0]*48,
            "Arun": [0.25, 0.11, -0.42, 0.88, 0.33, -0.12, 0.55, 0.19, -0.05, 0.62, 0.31, -0.22, 0.44, 0.15, -0.08, 0.77] + [0.0]*48,
            "Sunita": [-0.15, 0.41, 0.22, -0.38, 0.73, 0.52, -0.15, 0.69, 0.35, -0.12, 0.81, 0.02, -0.34, 0.55, 0.28, -0.17] + [0.0]*48
        }
        for p in p1_persons:
            vec = embeddings_map.get(p.name, [0.12 * ((hash(p.name + str(i)) % 100) / 100.0 - 0.5) for i in range(64)])
            db.add(FaceRecognitionProfile(person_id=p.id, embedding_data=vec, sample_embeddings=[vec], confidence_threshold=0.75, sample_images_count=1))

        # 4.1 Ensure Patient 2 (Biren Das) and family
        p2_user = db.query(User).filter(User.email == "biren@manas.org").first()
        if not p2_user:
            p2_user = User(email="biren@manas.org", hashed_password=hash_password("biren123"), role="patient", full_name="Biren Das")
            db.add(p2_user)
            db.commit()
            db.refresh(p2_user)

        patient2 = db.query(PatientProfile).filter(PatientProfile.id == 2).first()
        if not patient2:
            patient2 = PatientProfile(id=2, user_id=p2_user.id, guardian_id=guardian.id, age=79, emergency_contact="+91 94350 11223", preferred_language="as", onboarding_completed=True)
            db.add(patient2)
            db.commit()
            db.refresh(patient2)
        else:
            patient2.guardian_id = guardian.id
            db.commit()

        p2_family = [
            {"name": "Biren Das", "relationship": "Patient", "photo_url": "/images/family/patient.jpg", "notes": "Self profile - 79 years old, retired tea estate supervisor."},
            {"name": "Meera Das", "relationship": "Daughter", "photo_url": "/images/family/daughter.jpg", "notes": "Primary caregiver for Biren. Calls every morning."},
            {"name": "Pritam Das", "relationship": "Son", "photo_url": "/images/family/son.jpg", "notes": "Son living in Guwahati. Brings groceries on Saturdays."},
            {"name": "Kavita Das", "relationship": "Wife", "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", "notes": "Beloved wife."}
        ]
        for mem in p2_family:
            existing = db.query(Person).filter(Person.patient_id == patient2.id, Person.name == mem["name"]).first()
            if not existing:
                db.add(Person(patient_id=patient2.id, name=mem["name"], relationship=mem["relationship"], photo_url=mem["photo_url"], notes=mem["notes"], frequently_seen=True, is_active=True))
        db.commit()

        # 5. Personal Memories (NER Theme)
        m1 = Memory(
            patient_id=patient.id,
            title="Family Trip to Shillong Peak",
            description="Beautiful sunny morning overlooking the pine hills of Shillong with Ravi and young Arun.",
            place="Shillong, Meghalaya",
            people_involved="Ravi, Arun",
            memory_date="November 2024",
            photo_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
            tags="Shillong, Family, Nature"
        )
        m2 = Memory(
            patient_id=patient.id,
            title="Bihu Festival Celebration",
            description="Traditional Assam Bihu festival at home with homemade Pitha sweets and folk music.",
            place="Guwahati, Assam",
            people_involved="Whole Family",
            memory_date="April 2025",
            photo_url="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
            tags="Bihu, Festival, Tradition"
        )
        m3 = Memory(
            patient_id=patient.id,
            title="Tea Garden Stroll in Majuli",
            description="Walking through lush green tea gardens while birds sang softly in the early mist.",
            place="Majuli Island, Assam",
            people_involved="Vivek, Ravi",
            memory_date="January 2026",
            photo_url="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80",
            tags="Majuli, Tea Garden, Calm"
        )
        db.add_all([m1, m2, m3])

        # 5.1 Saved Important Places
        p1 = Place(
            patient_id=patient.id,
            name="Shillong Medical Centre",
            category="Hospital",
            address="Laitumkhrah, Shillong, Meghalaya 793003",
            latitude=25.5788,
            longitude=91.8933,
            notes="Dr. Haren Barua's clinic. Open 9 AM - 5 PM.",
            photo_url="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
        )
        p2 = Place(
            patient_id=patient.id,
            name="Home in Laitumkhrah",
            category="Home",
            address="Main Road, Laitumkhrah, Shillong",
            latitude=25.5711,
            longitude=91.8890,
            notes="Family residence.",
            photo_url="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"
        )
        p3 = Place(
            patient_id=patient.id,
            name="Arun's Residence",
            category="Family",
            address="GS Road, Guwahati, Assam 781005",
            latitude=26.1445,
            longitude=91.7362,
            notes="Grandson Arun's home.",
            photo_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
        )
        p4 = Place(
            patient_id=patient.id,
            name="Ward's Lake & Park",
            category="Worship",
            address="Police Bazar, Shillong, Meghalaya",
            latitude=25.5760,
            longitude=91.8845,
            notes="Favorite morning walk spot with pine trees.",
            photo_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
        )
        db.add_all([p1, p2, p3, p4])

        # 6. Reminders & Routines
        r1 = Reminder(patient_id=patient.id, title="Blood Pressure Medicine", category="Medicine", scheduled_time="08:00 AM", status="Completed")
        r2 = Reminder(patient_id=patient.id, title="Hydration - 2 Glasses Water", category="Hydration", scheduled_time="01:00 PM", status="Pending")
        r3 = Reminder(patient_id=patient.id, title="Evening Walk in Garden", category="Activity", scheduled_time="05:30 PM", status="Pending")
        r4 = Reminder(patient_id=patient.id, title="Night Medication", category="Medicine", scheduled_time="08:00 PM", status="Pending")
        db.add_all([r1, r2, r3, r4])

        rt1 = Routine(patient_id=patient.id, time_of_day="07:30 AM", title="Morning Tea & Gentle Breathing", icon_symbol="☀️", status="Completed")
        rt2 = Routine(patient_id=patient.id, time_of_day="08:00 AM", title="Morning Medication", icon_symbol="💊", status="Completed")
        rt3 = Routine(patient_id=patient.id, time_of_day="10:00 AM", title="Cognitive Training Activity", icon_symbol="🧠", status="Pending")
        rt4 = Routine(patient_id=patient.id, time_of_day="01:00 PM", title="Hydration & Lunch", icon_symbol="💧", status="Pending")
        rt5 = Routine(patient_id=patient.id, time_of_day="06:00 PM", title="Evening Walk", icon_symbol="🚶", status="Pending")
        db.add_all([rt1, rt2, rt3, rt4, rt5])

        # 7. Caregiver Alerts
        a1 = Alert(patient_id=patient.id, alert_type="Daily Routine Completed", message="Vivek completed his morning tea & gentle breathing routine on time.", severity="Low", is_resolved=True)
        a2 = Alert(patient_id=patient.id, alert_type="Cognitive Activity High Score", message="Vivek achieved 92% accuracy in Memory Recall game today at level 2 difficulty.", severity="Low", is_resolved=False)
        db.add_all([a1, a2])

        # 8. Historical Game Sessions for Recharts Graphs
        now = datetime.datetime.utcnow()
        sessions = [
            GameSession(patient_id=patient.id, game_code="memory_recall", difficulty_level=1, accuracy_percentage=75.0, avg_response_time_ms=3500.0, mistakes_count=1, played_at=now - datetime.timedelta(days=6)),
            GameSession(patient_id=patient.id, game_code="attention_challenge", difficulty_level=1, accuracy_percentage=80.0, avg_response_time_ms=3200.0, mistakes_count=1, played_at=now - datetime.timedelta(days=5)),
            GameSession(patient_id=patient.id, game_code="pattern_rec", difficulty_level=1, accuracy_percentage=85.0, avg_response_time_ms=3000.0, mistakes_count=0, played_at=now - datetime.timedelta(days=4)),
            GameSession(patient_id=patient.id, game_code="memory_recall", difficulty_level=2, accuracy_percentage=88.0, avg_response_time_ms=2800.0, mistakes_count=0, played_at=now - datetime.timedelta(days=3)),
            GameSession(patient_id=patient.id, game_code="attention_challenge", difficulty_level=2, accuracy_percentage=90.0, avg_response_time_ms=2600.0, mistakes_count=0, played_at=now - datetime.timedelta(days=2)),
            GameSession(patient_id=patient.id, game_code="pattern_rec", difficulty_level=2, accuracy_percentage=92.0, avg_response_time_ms=2500.0, mistakes_count=0, played_at=now - datetime.timedelta(days=1)),
        ]
        db.add_all(sessions)

        db.commit()
        print("Successfully seeded MANAS demo database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
