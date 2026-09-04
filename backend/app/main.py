import os
import datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import (
    User, PatientProfile, Guardian, CognitiveProfile, Person,
    FaceRecognitionProfile, Memory, Reminder, Routine, Activity,
    Alert, GameSession, SyncQueue, Place
)
from app.schemas import (
    LoginRequest, TokenResponse, PatientProfileSchema, PatientOnboardingRequest,
    PersonCreate, PersonOut, MemoryCreate, MemoryOut, GameSessionSubmit,
    ReminderOut, RoutineOut, AlertOut, VoiceQueryRequest, FaceRecognizeRequest, SyncQueueItem,
    PlaceCreate, PlaceOut, FaceLoginRequest
)
from app.adaptive_engine import evaluate_and_update_difficulty
from app.face_service import recognize_face_from_embedding
from app.voice_service import process_voice_query
from app.seed import seed_database

# Initialize database tables & seed demo data
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="MANAS API",
    description="Memory Assistance & Neural Adaptive System - SIH 2026 Backend",
    version="1.0.0"
)

# CORS middleware for React Vite app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "MANAS Backend API",
        "status": "online",
        "sih_problem": "SIH26003 - MedTech / BioTech / HealthTech",
        "theme": "Cognitive Activity & Memory Support for Elderly"
    }

# ---------------------------- AUTHENTICATION ----------------------------

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    
    # Simple demo auth validation
    if not user:
        if req.email.startswith("vivek"):
            user = db.query(User).filter(User.role == "patient").first()
        elif req.email.startswith("ravi"):
            user = db.query(User).filter(User.role == "guardian").first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials. Use vivek@manas.org or ravi@manas.org")

    patient_id = user.patient_profile.id if user.patient_profile else None
    guardian_id = user.guardian_profile.id if user.guardian_profile else None

    # For demo ease, if patient requested but profile doesn't exist, bind default
    if user.role == "patient" and not patient_id:
        patient_id = 1
    if user.role == "guardian" and not guardian_id:
        guardian_id = 1

    return TokenResponse(
        access_token=f"demo_token_user_{user.id}",
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        patient_id=patient_id,
        guardian_id=guardian_id
    )

# ---------------------------- PATIENT ENDPOINTS ----------------------------

@app.get("/api/patient/profile")
def get_patient_profile(patient_id: int = 1, db: Session = Depends(get_db)):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return {
        "id": patient.id,
        "full_name": patient.user.full_name if patient.user else "Vivek Sharma",
        "age": patient.age,
        "preferred_language": patient.preferred_language,
        "voice_preference": patient.voice_preference,
        "emergency_contact": patient.emergency_contact,
        "onboarding_completed": patient.onboarding_completed
    }

@app.post("/api/patient/onboarding")
def complete_onboarding(req: PatientOnboardingRequest, patient_id: int = 1, db: Session = Depends(get_db)):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if patient:
        patient.age = req.age
        patient.preferred_language = req.preferred_language
        patient.voice_preference = req.voice_preference
        patient.onboarding_completed = True
        if patient.user:
            patient.user.full_name = req.full_name
        db.commit()
    return {"status": "success", "message": "Onboarding completed successfully!"}

@app.get("/api/patient/cognitive-profile")
def get_cognitive_profile(patient_id: int = 1, db: Session = Depends(get_db)):
    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    if not cog:
        cog = CognitiveProfile(patient_id=patient_id, current_difficulty=1)
        db.add(cog)
        db.commit()
        db.refresh(cog)

    return {
        "current_difficulty": cog.current_difficulty,
        "memory_score": cog.memory_score,
        "attention_score": cog.attention_score,
        "recall_score": cog.recall_score,
        "pattern_score": cog.pattern_score,
        "avg_response_time_ms": cog.avg_response_time_ms,
        "recent_trend": cog.recent_trend
    }

# ---------------------------- FAMILIAR PEOPLE & FACE RECOGNITION ----------------------------

@app.get("/api/people", response_model=List[PersonOut])
def get_people(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Person).filter(Person.patient_id == patient_id).all()

@app.post("/api/people", response_model=PersonOut)
def create_person(req: PersonCreate, patient_id: int = 1, db: Session = Depends(get_db)):
    person = Person(
        patient_id=patient_id,
        name=req.name,
        relationship=req.relationship,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        notes=req.notes
    )
    db.add(person)
    db.commit()
    db.refresh(person)

    # Save face recognition vector embedding if provided
    emb = req.embedding_data or [0.1 * i for i in range(16)]
    face_prof = FaceRecognitionProfile(person_id=person.id, embedding_data=emb)
    db.add(face_prof)
    db.commit()

    return person

@app.delete("/api/people/{person_id}")
def delete_person(person_id: int, patient_id: int = 1, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id, Person.patient_id == patient_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if person.face_profile:
        db.delete(person.face_profile)
    db.delete(person)
    db.commit()
    return {"status": "deleted"}

@app.post("/api/people/recognize-face")
def recognize_face(req: FaceRecognizeRequest, patient_id: int = 1, db: Session = Depends(get_db)):
    return recognize_face_from_embedding(db, patient_id, req.embedding)

# ---------------------------- FACE LOGIN & PLACES ----------------------------

@app.post("/api/auth/face-login")
def face_login(req: FaceLoginRequest, db: Session = Depends(get_db)):
    result = recognize_face_from_embedding(db, patient_id=1, target_embedding=req.embedding)
    if result and result.get("recognized"):
        user = db.query(User).filter(User.role == "patient").first()
        return {
            "success": True,
            "token": f"face_token_user_{user.id if user else 1}",
            "full_name": user.full_name if user else "Vivek Sharma",
            "message": result.get("message"),
            "patient_id": 1
        }
    else:
        return {
            "success": False,
            "message": result.get("message", "Face not recognized yet.")
        }

@app.get("/api/places", response_model=List[PlaceOut])
def get_places(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Place).filter(Place.patient_id == patient_id).all()

@app.post("/api/places", response_model=PlaceOut)
def create_place(req: PlaceCreate, patient_id: int = 1, db: Session = Depends(get_db)):
    place = Place(
        patient_id=patient_id,
        name=req.name,
        category=req.category,
        address=req.address,
        latitude=req.latitude,
        longitude=req.longitude,
        notes=req.notes,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return place

@app.delete("/api/places/{place_id}")
def delete_place(place_id: int, patient_id: int = 1, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id, Place.patient_id == patient_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    db.delete(place)
    db.commit()
    return {"status": "deleted"}

# ---------------------------- PERSONAL MEMORIES ----------------------------

@app.get("/api/memories", response_model=List[MemoryOut])
def get_memories(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Memory).filter(Memory.patient_id == patient_id).all()

@app.post("/api/memories", response_model=MemoryOut)
def create_memory(req: MemoryCreate, patient_id: int = 1, db: Session = Depends(get_db)):
    mem = Memory(
        patient_id=patient_id,
        title=req.title,
        description=req.description,
        place=req.place,
        people_involved=req.people_involved,
        memory_date=req.memory_date,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        voice_note_url=req.voice_note_url,
        tags=req.tags
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem

@app.delete("/api/memories/{memory_id}")
def delete_memory(memory_id: int, patient_id: int = 1, db: Session = Depends(get_db)):
    mem = db.query(Memory).filter(Memory.id == memory_id, Memory.patient_id == patient_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory record not found")
    db.delete(mem)
    db.commit()
    return {"status": "deleted"}

# ---------------------------- REMINDERS & ROUTINES ----------------------------

@app.get("/api/reminders", response_model=List[ReminderOut])
def get_reminders(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.patient_id == patient_id).all()

@app.post("/api/reminders/{reminder_id}/complete")
def complete_reminder(reminder_id: int, patient_id: int = 1, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.patient_id == patient_id).first()
    if rem:
        rem.status = "Completed"
        rem.completed_at = datetime.datetime.utcnow()
        db.commit()
    return {"status": "updated"}

@app.get("/api/routines", response_model=List[RoutineOut])
def get_routines(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Routine).filter(Routine.patient_id == patient_id).all()

@app.post("/api/routines/{routine_id}/toggle")
def toggle_routine(routine_id: int, patient_id: int = 1, db: Session = Depends(get_db)):
    rt = db.query(Routine).filter(Routine.id == routine_id, Routine.patient_id == patient_id).first()
    if rt:
        rt.status = "Completed" if rt.status == "Pending" else "Pending"
        db.commit()
    return {"status": "updated", "new_status": rt.status if rt else "Pending"}

# ---------------------------- COGNITIVE GAMES & ADAPTIVE ML ENGINE ----------------------------

@app.post("/api/games/submit-session")
def submit_game_session(req: GameSessionSubmit, patient_id: int = 1, db: Session = Depends(get_db)):
    session = GameSession(
        patient_id=patient_id,
        game_code=req.game_code,
        difficulty_level=req.difficulty_level,
        accuracy_percentage=req.accuracy_percentage,
        avg_response_time_ms=req.avg_response_time_ms,
        mistakes_count=req.mistakes_count,
        attempts_count=req.attempts_count,
        completed=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Run Adaptive Difficulty Engine
    adaptive_result = evaluate_and_update_difficulty(db, patient_id, req.game_code, session)

    return {
        "status": "success",
        "session_id": session.id,
        "adaptive_result": adaptive_result
    }

# ---------------------------- VOICE ASSISTANT ----------------------------

@app.post("/api/voice/ask")
def voice_ask(req: VoiceQueryRequest, patient_id: int = 1, db: Session = Depends(get_db)):
    return process_voice_query(db, patient_id, req.transcript)

# ---------------------------- GUARDIAN DASHBOARD & ANALYTICS ----------------------------

@app.get("/api/guardian/overview")
def get_guardian_overview(patient_id: int = 1, db: Session = Depends(get_db)):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    
    total_reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id).count()
    completed_reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id, Reminder.status == "Completed").count()
    adherence_rate = round((completed_reminders / total_reminders * 100), 1) if total_reminders > 0 else 100.0

    recent_sessions = db.query(GameSession).filter(GameSession.patient_id == patient_id).order_by(GameSession.played_at.desc()).limit(5).all()

    return {
        "patient": {
            "name": patient.user.full_name if patient and patient.user else "Vivek Sharma",
            "age": patient.age if patient else 74,
            "emergency_contact": patient.emergency_contact if patient else "+91 98640 12345"
        },
        "adherence_rate": adherence_rate,
        "cognitive_summary": {
            "current_difficulty": cog.current_difficulty if cog else 1,
            "memory_score": cog.memory_score if cog else 75.0,
            "attention_score": cog.attention_score if cog else 70.0,
            "pattern_score": cog.pattern_score if cog else 70.0,
            "recent_trend": cog.recent_trend if cog else "Stable Activity"
        },
        "recent_activities_count": len(recent_sessions)
    }

@app.get("/api/guardian/analytics")
def get_guardian_analytics(patient_id: int = 1, db: Session = Depends(get_db)):
    sessions = db.query(GameSession).filter(GameSession.patient_id == patient_id).order_by(GameSession.played_at.asc()).all()
    
    chart_data = []
    for s in sessions:
        day_str = s.played_at.strftime("%b %d") if s.played_at else "Day"
        chart_data.append({
            "date": day_str,
            "accuracy": s.accuracy_percentage,
            "difficulty": s.difficulty_level,
            "responseTime": round(s.avg_response_time_ms / 1000.0, 1),
            "game": s.game_code
        })

    return {
        "cognitive_trend": chart_data,
        "category_scores": [
            {"category": "Memory Recall", "score": 85},
            {"category": "Attention", "score": 78},
            {"category": "Pattern Recognition", "score": 80},
            {"category": "Response Performance", "score": 88}
        ]
    }

@app.get("/api/guardian/alerts", response_model=List[AlertOut])
def get_guardian_alerts(patient_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.patient_id == patient_id).order_by(Alert.created_at.desc()).all()

@app.post("/api/guardian/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = True
        db.commit()
    return {"status": "resolved"}

# ---------------------------- OFFLINE SYNCHRONIZATION ----------------------------

@app.post("/api/sync")
def process_sync_queue(items: List[SyncQueueItem], db: Session = Depends(get_db)):
    synced_ids = []
    for item in items:
        existing = db.query(SyncQueue).filter(SyncQueue.client_tx_id == item.client_tx_id).first()
        if not existing:
            sq = SyncQueue(
                client_tx_id=item.client_tx_id,
                entity_type=item.entity_type,
                payload=item.payload,
                status="Synced",
                synced_at=datetime.datetime.utcnow()
            )
            db.add(sq)
            synced_ids.append(item.client_tx_id)
    db.commit()
    return {"synced_count": len(synced_ids), "synced_ids": synced_ids}
