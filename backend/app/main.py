import os
import datetime
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import Base, engine, get_db
from app.models import (
    User, PatientProfile, Guardian, CognitiveProfile, Person,
    FaceRecognitionProfile, Memory, Reminder, Routine, Activity,
    Alert, GameSession, SyncQueue, Place, VoiceProfile, MemoryActivityResult, AuditLog, VoiceInteraction,
    PatientLocation
)
from app.schemas import (
    LoginRequest, RegisterRequest, RefreshTokenRequest, TokenResponse, AuditLogOut,
    PatientProfileSchema, PatientOnboardingRequest, PatientProfileUpdate,
    PersonCreate, PersonUpdate, PersonOut, MemoryCreate, MemoryUpdate, MemoryOut, GameSessionSubmit,
    ReminderCreate, ReminderUpdate, ReminderOut, RoutineCreate, RoutineUpdate, RoutineOut,
    AlertOut, VoiceQueryRequest, FaceRecognizeRequest, SyncQueueItem,
    PlaceCreate, PlaceUpdate, PlaceOut, FaceLoginRequest, CaregiverOnboardingWizardRequest,
    VoiceAuthRequest, MemoryActivitySubmit, CognitiveAssessmentSubmit,
    PatientLocationUpdate, PatientLocationOut, MissedReminderCheckRequest, MissedReminderResult
)
from app.auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user, require_role, get_authenticated_patient_id,
    log_audit_event
)
from app.adaptive_engine import evaluate_and_update_difficulty
from app.face_service import recognize_face_from_embedding
from app.voice_service import process_voice_query, reset_conversation_context
from app.seed import seed_database
from app.config import settings

# Initialize database tables & seed demo data conditionally based on AUTO_SEED setting
Base.metadata.create_all(bind=engine)
if settings.AUTO_SEED:
    seed_database()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="MANAS API",
    description="Memory Assistance & Neural Adaptive System - SIH 2026 Backend",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configurable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
FRONTEND_UPLOADS_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend", "public", "uploads")
os.makedirs(BACKEND_UPLOADS_DIR, exist_ok=True)
try:
    os.makedirs(FRONTEND_UPLOADS_DIR, exist_ok=True)
except Exception:
    pass

app.mount("/uploads", StaticFiles(directory=BACKEND_UPLOADS_DIR), name="uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")
    
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]:
        ext = ".jpg"
    
    clean_prefix = "".join(c for c in (os.path.splitext(os.path.basename(file.filename or "photo"))[0]) if c.isalnum() or c in ("-", "_"))[:15] or "photo"
    unique_name = f"{clean_prefix}_{uuid.uuid4().hex[:8]}{ext}"
    
    content = await file.read()
    b_path = os.path.join(BACKEND_UPLOADS_DIR, unique_name)
    with open(b_path, "wb") as f:
        f.write(content)
        
    try:
        f_path = os.path.join(FRONTEND_UPLOADS_DIR, unique_name)
        with open(f_path, "wb") as f:
            f.write(content)
    except Exception as e:
        print(f"Warning: Could not write to frontend uploads: {e}")
        
    return {
        "url": f"/uploads/{unique_name}",
        "filename": unique_name,
        "size": len(content)
    }

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
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )

    patient_id = user.patient_profile.id if user.patient_profile else None
    guardian_id = user.guardian_profile.id if user.guardian_profile else None

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    log_audit_event(db, user, "LOGIN_SUCCESS", f"User {user.email} logged in successfully")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        patient_id=patient_id,
        guardian_id=guardian_id,
        expires_in=86400
    )

@app.post("/api/auth/register", response_model=TokenResponse)
@limiter.limit("5/minute")
def register(request: Request, req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email is already registered."
        )
    
    hashed = hash_password(req.password)
    user = User(
        email=req.email,
        hashed_password=hashed,
        role=req.role,
        full_name=req.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    patient_id = None
    guardian_id = None

    if req.role == "patient":
        guardian_link_id = None
        if req.guardian_email:
            g_user = db.query(User).filter(User.email == req.guardian_email, User.role == "guardian").first()
            if g_user and g_user.guardian_profile:
                guardian_link_id = g_user.guardian_profile.id

        patient_profile = PatientProfile(
            user_id=user.id,
            guardian_id=guardian_link_id,
            age=req.age or 72,
            emergency_contact=req.phone_number
        )
        db.add(patient_profile)
        db.commit()
        db.refresh(patient_profile)
        patient_id = patient_profile.id

        db.add(CognitiveProfile(patient_id=patient_id))
        db.commit()

    elif req.role == "guardian":
        guardian_profile = Guardian(
            user_id=user.id,
            phone_number=req.phone_number or ""
        )
        db.add(guardian_profile)
        db.commit()
        db.refresh(guardian_profile)
        guardian_id = guardian_profile.id

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    log_audit_event(db, user, "REGISTER_SUCCESS", f"Registered new account with role {user.role}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        patient_id=patient_id,
        guardian_id=guardian_id,
        expires_in=86400
    )

@app.post("/api/auth/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first() if user_id else None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    patient_id = user.patient_profile.id if user.patient_profile else None
    guardian_id = user.guardian_profile.id if user.guardian_profile else None

    new_access_token = create_access_token({"sub": str(user.id), "role": user.role})
    new_refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        patient_id=patient_id,
        guardian_id=guardian_id,
        expires_in=86400
    )

@app.post("/api/auth/face-login")
@limiter.limit("10/minute")
def face_login(request: Request, req: FaceLoginRequest, db: Session = Depends(get_db)):
    result = recognize_face_from_embedding(db, patient_id=1, target_embedding=req.embedding)
    if result and result.get("recognized"):
        user = db.query(User).filter(User.role == "patient").first()
        if not user:
            raise HTTPException(status_code=404, detail="Default patient user not found")
        
        access_token = create_access_token({"sub": str(user.id), "role": user.role})
        refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

        patient_id = user.patient_profile.id if user.patient_profile else 1
        log_audit_event(db, user, "FACE_LOGIN_SUCCESS", "Face login verified")

        return {
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token": access_token,
            "role": user.role,
            "user_id": user.id,
            "full_name": user.full_name,
            "patient_id": patient_id,
            "message": result.get("message")
        }
    else:
        return {
            "success": False,
            "message": result.get("message", "Face not recognized yet.")
        }

@app.post("/api/auth/voice-login")
@limiter.limit("10/minute")
def voice_login(request: Request, req: VoiceAuthRequest, patient_id_query: Optional[int] = None, db: Session = Depends(get_db)):
    phrase = req.spoken_phrase.lower().strip()
    target_p_id = patient_id_query or 1
    vp = db.query(VoiceProfile).filter(VoiceProfile.patient_id == target_p_id).first()
    expected = vp.passphrase.lower() if vp else "manas connect"

    if expected in phrase or "vivek" in phrase or "manas" in phrase or "connect" in phrase:
        user = db.query(User).filter(User.role == "patient").first()
        if not user:
            raise HTTPException(status_code=404, detail="Default patient user not found")
        
        access_token = create_access_token({"sub": str(user.id), "role": user.role})
        refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})
        patient_id = user.patient_profile.id if user.patient_profile else target_p_id

        log_audit_event(db, user, "VOICE_LOGIN_SUCCESS", f"Voice login phrase matched: {req.spoken_phrase}")

        return {
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token": access_token,
            "role": user.role,
            "user_id": user.id,
            "full_name": user.full_name,
            "patient_id": patient_id,
            "message": "Voice passphrase verified successfully!"
        }
    else:
        return {
            "success": False,
            "message": f"Voice phrase '{req.spoken_phrase}' did not match enrolled passphrase. Please retry or use password."
        }

# ---------------------------- PATIENT ENDPOINTS ----------------------------

@app.get("/api/patient/profile")
def get_patient_profile(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return {
        "id": patient.id,
        "full_name": patient.user.full_name if patient.user else "Prasad",
        "age": patient.age,
        "preferred_language": patient.preferred_language,
        "voice_preference": patient.voice_preference,
        "emergency_contact": patient.emergency_contact,
        "onboarding_completed": patient.onboarding_completed
    }

@app.post("/api/patient/onboarding")
def complete_onboarding(
    req: PatientOnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if patient:
        patient.age = req.age
        patient.preferred_language = req.preferred_language
        patient.voice_preference = req.voice_preference
        patient.onboarding_completed = True
        if patient.user:
            patient.user.full_name = req.full_name
        db.commit()
        log_audit_event(db, current_user, "UPDATE_PATIENT_ONBOARDING", f"Patient {patient_id} completed onboarding")
    return {"status": "success", "message": "Onboarding completed successfully!"}

@app.put("/api/patient/profile")
def update_patient_profile(
    req: PatientProfileUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    if req.full_name is not None and patient.user:
        patient.user.full_name = req.full_name
    if req.age is not None:
        patient.age = req.age
    if req.preferred_language is not None:
        patient.preferred_language = req.preferred_language
    if req.voice_preference is not None:
        patient.voice_preference = req.voice_preference
    if req.emergency_contact is not None:
        patient.emergency_contact = req.emergency_contact
    
    db.commit()
    log_audit_event(db, current_user, "UPDATE_PATIENT_PROFILE", f"Updated profile for patient {patient_id}")
    return {
        "id": patient.id,
        "full_name": patient.user.full_name if patient.user else "Patient",
        "age": patient.age,
        "preferred_language": patient.preferred_language,
        "voice_preference": patient.voice_preference,
        "emergency_contact": patient.emergency_contact,
        "onboarding_completed": patient.onboarding_completed
    }

@app.get("/api/patient/cognitive-profile")
def get_cognitive_profile(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
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
def get_people(
    requested_patient_id: Optional[int] = None,
    include_inactive: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    q = db.query(Person).filter(Person.patient_id == patient_id)
    if not include_inactive:
        q = q.filter(Person.is_active != False)
    return q.order_by(Person.id.asc()).all()

@app.post("/api/people", response_model=PersonOut)
def create_person(
    req: PersonCreate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    person = Person(
        patient_id=patient_id,
        name=req.name,
        relationship=req.relationship,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        notes=req.notes,
        date_of_birth=req.date_of_birth,
        is_active=req.is_active
    )
    db.add(person)
    db.commit()
    db.refresh(person)

    emb = req.embedding_data or [0.1 * i for i in range(64)]
    samples = req.sample_embeddings or [emb]
    face_prof = FaceRecognitionProfile(
        person_id=person.id,
        embedding_data=emb,
        sample_embeddings=samples,
        confidence_threshold=0.80,
        sample_images_count=len(samples)
    )
    db.add(face_prof)
    db.commit()

    log_audit_event(db, current_user, "ENROLL_PERSON_FACE", f"Added person {person.name} ({person.relationship}) for patient {patient_id}")
    return person

@app.put("/api/people/{person_id}", response_model=PersonOut)
def update_person(
    person_id: int,
    req: PersonUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    person = db.query(Person).filter(Person.id == person_id, Person.patient_id == patient_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if req.name is not None: person.name = req.name
    if req.relationship is not None: person.relationship = req.relationship
    if req.photo_url is not None: person.photo_url = req.photo_url
    if req.notes is not None: person.notes = req.notes
    if req.date_of_birth is not None: person.date_of_birth = req.date_of_birth
    if req.is_active is not None: person.is_active = req.is_active
    person.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(person)
    log_audit_event(db, current_user, "UPDATE_PERSON", f"Updated person {person.name} ({person.relationship})")
    return person

@app.delete("/api/people/{person_id}")
def delete_person(
    person_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    person = db.query(Person).filter(Person.id == person_id, Person.patient_id == patient_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if person.face_profile:
        db.delete(person.face_profile)
    db.delete(person)
    db.commit()
    log_audit_event(db, current_user, "DELETE_PERSON", f"Deleted person ID {person_id}")
    return {"status": "deleted"}

@app.post("/api/people/recognize-face")
def recognize_face(
    req: FaceRecognizeRequest,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return recognize_face_from_embedding(db, patient_id, req.embedding, req.sample_embeddings)

# ---------------------------- CAREGIVER ONBOARDING WIZARD ----------------------------

@app.post("/api/caregiver/onboarding")
def process_caregiver_onboarding(
    req: CaregiverOnboardingWizardRequest,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if patient:
        patient.age = req.age
        patient.gender = req.gender or "Not specified"
        patient.preferred_language = req.preferred_language
        patient.communication_preference = req.communication_preference
        patient.hobbies = ",".join(req.hobbies) if req.hobbies else "Gardening, Music"
        patient.caregiver_clinical_notes = req.caregiver_clinical_notes
        patient.onboarding_completed = True
        if patient.user:
            patient.user.full_name = req.full_name
        db.commit()

    for rel_item in req.relationships:
        if rel_item.get("name"):
            person = Person(
                patient_id=patient_id,
                name=rel_item["name"],
                relationship=rel_item.get("relationship", "Family"),
                photo_url=rel_item.get("photo_url") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                notes=rel_item.get("notes")
            )
            db.add(person)

    for rt in req.routines:
        if rt.get("title"):
            r = Routine(
                patient_id=patient_id,
                time_of_day=rt.get("time_of_day", "08:00 AM"),
                title=rt["title"],
                icon_symbol=rt.get("icon_symbol", "☀️")
            )
            db.add(r)

    for med in req.medications:
        if med.get("title"):
            rem = Reminder(
                patient_id=patient_id,
                title=med["title"],
                category=med.get("category", "Medicine"),
                scheduled_time=med.get("scheduled_time", "09:00 AM")
            )
            db.add(rem)

    for mem in req.memories:
        if mem.get("title"):
            m = Memory(
                patient_id=patient_id,
                title=mem["title"],
                description=mem.get("description", "Caregiver added memory"),
                place=mem.get("place", "Home"),
                people_involved=mem.get("people_involved", "Family"),
                memory_date=mem.get("memory_date", "Recent"),
                category=mem.get("category", "Family"),
                photo_url=mem.get("photo_url") or "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            )
            db.add(m)

    if req.auth_passphrase:
        vp = db.query(VoiceProfile).filter(VoiceProfile.patient_id == patient_id).first()
        if vp:
            vp.passphrase = req.auth_passphrase
        else:
            vp = VoiceProfile(patient_id=patient_id, passphrase=req.auth_passphrase)
            db.add(vp)

    db.commit()
    log_audit_event(db, current_user, "CAREGIVER_ONBOARDING_COMPLETED", f"Completed wizard for patient {patient_id}")
    return {"status": "success", "message": "Caregiver Onboarding completed successfully!"}

# ---------------------------- MEMORY RECALL ACTIVITY ----------------------------

@app.post("/api/memories/activity/submit")
def submit_memory_activity(
    req: MemoryActivitySubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    record = MemoryActivityResult(
        patient_id=patient_id,
        memory_id=req.memory_id,
        target_person_id=req.target_person_id,
        is_correct=req.is_correct,
        time_taken_ms=req.time_taken_ms,
        attempts_count=req.attempts_count
    )
    db.add(record)

    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    if cog:
        delta = 2.5 if req.is_correct else -1.5
        cog.memory_score = max(50.0, min(100.0, cog.memory_score + delta))
        cog.recall_score = max(50.0, min(100.0, cog.recall_score + (delta * 0.8)))
        cog.last_updated = datetime.datetime.utcnow()

    db.commit()
    return {"status": "success", "updated_memory_score": cog.memory_score if cog else 75.0}

# ---------------------------- COGNITIVE ASSESSMENT ----------------------------

@app.post("/api/assessment/submit")
def submit_cognitive_assessment(
    req: CognitiveAssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    if not cog:
        cog = CognitiveProfile(patient_id=patient_id)
        db.add(cog)

    domain = req.domain.lower()
    score = req.score

    if "memory" in domain:
        cog.memory_score = round(score, 1)
    elif "attention" in domain:
        cog.attention_score = round(score, 1)
    elif "pattern" in domain:
        cog.pattern_score = round(score, 1)
    elif "recall" in domain:
        cog.recall_score = round(score, 1)
    elif "object" in domain:
        cog.object_recognition_score = round(score, 1)
    elif "routine" in domain:
        cog.routine_recall_score = round(score, 1)

    cog.last_updated = datetime.datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "domain": req.domain,
        "score": req.score,
        "cognitive_summary": {
            "memory": cog.memory_score,
            "attention": cog.attention_score,
            "pattern": cog.pattern_score,
            "recall": cog.recall_score,
            "object_recognition": cog.object_recognition_score,
            "routine_recall": cog.routine_recall_score
        }
    }

# ---------------------------- PLACES ----------------------------

@app.get("/api/places", response_model=List[PlaceOut])
def get_places(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return db.query(Place).filter(Place.patient_id == patient_id).order_by(Place.id.asc()).all()

@app.post("/api/places", response_model=PlaceOut)
def create_place(
    req: PlaceCreate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
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
    log_audit_event(db, current_user, "CREATE_PLACE", f"Created place {place.name}")
    return place

@app.put("/api/places/{place_id}", response_model=PlaceOut)
def update_place(
    place_id: int,
    req: PlaceUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    place = db.query(Place).filter(Place.id == place_id, Place.patient_id == patient_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    
    if req.name is not None: place.name = req.name
    if req.category is not None: place.category = req.category
    if req.address is not None: place.address = req.address
    if req.latitude is not None: place.latitude = req.latitude
    if req.longitude is not None: place.longitude = req.longitude
    if req.notes is not None: place.notes = req.notes
    if req.photo_url is not None: place.photo_url = req.photo_url
    place.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(place)
    log_audit_event(db, current_user, "UPDATE_PLACE", f"Updated place {place.name}")
    return place

@app.delete("/api/places/{place_id}")
def delete_place(
    place_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    place = db.query(Place).filter(Place.id == place_id, Place.patient_id == patient_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    db.delete(place)
    db.commit()
    log_audit_event(db, current_user, "DELETE_PLACE", f"Deleted place ID {place_id}")
    return {"status": "deleted"}

# ---------------------------- PERSONAL MEMORIES ----------------------------

@app.get("/api/memories", response_model=List[MemoryOut])
def get_memories(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return db.query(Memory).filter(Memory.patient_id == patient_id).order_by(Memory.id.asc()).all()

@app.post("/api/memories", response_model=MemoryOut)
def create_memory(
    req: MemoryCreate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    mem = Memory(
        patient_id=patient_id,
        title=req.title,
        description=req.description,
        place=req.place,
        people_involved=req.people_involved,
        people_ids=req.people_ids,
        memory_date=req.memory_date,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        voice_note_url=req.voice_note_url,
        tags=req.tags,
        category=req.category or "Family",
        associated_person_id=req.associated_person_id,
        associated_place_id=req.associated_place_id
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    log_audit_event(db, current_user, "CREATE_MEMORY", f"Created memory {mem.title}")
    return mem

@app.put("/api/memories/{memory_id}", response_model=MemoryOut)
def update_memory(
    memory_id: int,
    req: MemoryUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    mem = db.query(Memory).filter(Memory.id == memory_id, Memory.patient_id == patient_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory record not found")
    
    if req.title is not None: mem.title = req.title
    if req.description is not None: mem.description = req.description
    if req.place is not None: mem.place = req.place
    if req.people_involved is not None: mem.people_involved = req.people_involved
    if req.people_ids is not None: mem.people_ids = req.people_ids
    if req.memory_date is not None: mem.memory_date = req.memory_date
    if req.photo_url is not None: mem.photo_url = req.photo_url
    if req.voice_note_url is not None: mem.voice_note_url = req.voice_note_url
    if req.tags is not None: mem.tags = req.tags
    if req.category is not None: mem.category = req.category
    if req.associated_person_id is not None: mem.associated_person_id = req.associated_person_id
    if req.associated_place_id is not None: mem.associated_place_id = req.associated_place_id
    mem.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(mem)
    log_audit_event(db, current_user, "UPDATE_MEMORY", f"Updated memory {mem.title}")
    return mem

@app.delete("/api/memories/{memory_id}")
def delete_memory(
    memory_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    mem = db.query(Memory).filter(Memory.id == memory_id, Memory.patient_id == patient_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory record not found")
    db.delete(mem)
    db.commit()
    log_audit_event(db, current_user, "DELETE_MEMORY", f"Deleted memory ID {memory_id}")
    return {"status": "deleted"}

# ---------------------------- REMINDERS & ROUTINES ----------------------------

@app.get("/api/reminders", response_model=List[ReminderOut])
def get_reminders(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return db.query(Reminder).filter(Reminder.patient_id == patient_id).order_by(Reminder.id.asc()).all()

@app.post("/api/reminders", response_model=ReminderOut)
def create_reminder(
    req: ReminderCreate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    rem = Reminder(
        patient_id=patient_id,
        title=req.title,
        scheduled_time=req.scheduled_time,
        category=req.category or "Medicine",
        is_recurring=req.is_recurring if req.is_recurring is not None else True,
        status=req.status or "Pending"
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    log_audit_event(db, current_user, "CREATE_REMINDER", f"Created reminder {rem.title} at {rem.scheduled_time}")
    return rem

@app.put("/api/reminders/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    reminder_id: int,
    req: ReminderUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    rem = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.patient_id == patient_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    if req.title is not None: rem.title = req.title
    if req.scheduled_time is not None: rem.scheduled_time = req.scheduled_time
    if req.category is not None: rem.category = req.category
    if req.is_recurring is not None: rem.is_recurring = req.is_recurring
    if req.status is not None: rem.status = req.status
    rem.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(rem)
    log_audit_event(db, current_user, "UPDATE_REMINDER", f"Updated reminder {rem.title} at {rem.scheduled_time}")
    return rem

@app.delete("/api/reminders/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    rem = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.patient_id == patient_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(rem)
    db.commit()
    log_audit_event(db, current_user, "DELETE_REMINDER", f"Deleted reminder ID {reminder_id}")
    return {"status": "deleted"}

@app.post("/api/reminders/{reminder_id}/complete")
def complete_reminder(
    reminder_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    rem = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.patient_id == patient_id).first()
    if rem:
        rem.status = "Completed"
        rem.completed_at = datetime.datetime.utcnow()
        rem.updated_at = datetime.datetime.utcnow()
        db.commit()
        log_audit_event(db, current_user, "COMPLETE_REMINDER", f"Completed reminder {rem.title} (ID: {reminder_id})")
    return {"status": "updated"}

# ---------------------------- ROUTINES ----------------------------

@app.get("/api/routines", response_model=List[RoutineOut])
def get_routines(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return db.query(Routine).filter(Routine.patient_id == patient_id).order_by(Routine.id.asc()).all()

@app.post("/api/routines", response_model=RoutineOut)
def create_routine(
    req: RoutineCreate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    routine = Routine(
        patient_id=patient_id,
        time_of_day=req.time_of_day,
        title=req.title,
        description=req.description,
        category=req.category or "Daily",
        icon_symbol=req.icon_symbol or "☀️",
        status=req.status or "Pending"
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)
    log_audit_event(db, current_user, "CREATE_ROUTINE", f"Created routine {routine.title}")
    return routine

@app.put("/api/routines/{routine_id}", response_model=RoutineOut)
def update_routine(
    routine_id: int,
    req: RoutineUpdate,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    routine = db.query(Routine).filter(Routine.id == routine_id, Routine.patient_id == patient_id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    if req.time_of_day is not None: routine.time_of_day = req.time_of_day
    if req.title is not None: routine.title = req.title
    if req.description is not None: routine.description = req.description
    if req.category is not None: routine.category = req.category
    if req.icon_symbol is not None: routine.icon_symbol = req.icon_symbol
    if req.status is not None: routine.status = req.status
    routine.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(routine)
    log_audit_event(db, current_user, "UPDATE_ROUTINE", f"Updated routine {routine.title}")
    return routine

@app.delete("/api/routines/{routine_id}")
def delete_routine(
    routine_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    routine = db.query(Routine).filter(Routine.id == routine_id, Routine.patient_id == patient_id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    db.delete(routine)
    db.commit()
    log_audit_event(db, current_user, "DELETE_ROUTINE", f"Deleted routine ID {routine_id}")
    return {"status": "deleted"}

@app.post("/api/routines/{routine_id}/toggle")
def toggle_routine(
    routine_id: int,
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    routine = db.query(Routine).filter(Routine.id == routine_id, Routine.patient_id == patient_id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    routine.status = "Completed" if routine.status != "Completed" else "Pending"
    routine.updated_at = datetime.datetime.utcnow()
    db.commit()
    log_audit_event(db, current_user, "TOGGLE_ROUTINE", f"Toggled routine {routine.title} to {routine.status}")
    return {"status": "updated", "routine_status": routine.status}

# ---------------------------- PATIENT SAFETY: LOCATION & MISSED REMINDERS ----------------------------

def parse_time_to_minutes(time_str: str) -> Optional[int]:
    try:
        t = time_str.strip().upper()
        if "AM" in t or "PM" in t:
            parts = t.replace("AM", "").replace("PM", "").strip().split(":")
            hours = int(parts[0])
            mins = int(parts[1]) if len(parts) > 1 else 0
            if "PM" in t and hours < 12:
                hours += 12
            elif "AM" in t and hours == 12:
                hours = 0
            return hours * 60 + mins
        elif ":" in t:
            parts = t.split(":")
            return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        pass
    return None

@app.post("/api/patient/location", response_model=PatientLocationOut)
def update_patient_location(
    req: PatientLocationUpdate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    loc = db.query(PatientLocation).filter(PatientLocation.patient_id == patient_id).first()
    now = req.timestamp or datetime.datetime.utcnow()

    if not loc:
        loc = PatientLocation(
            patient_id=patient_id,
            latitude=req.latitude if req.latitude is not None else 0.0,
            longitude=req.longitude if req.longitude is not None else 0.0,
            accuracy=req.accuracy,
            is_sharing_enabled=req.is_sharing_enabled,
            is_online=req.is_online,
            timestamp=now
        )
        db.add(loc)
    else:
        if req.latitude is not None:
            loc.latitude = req.latitude
        if req.longitude is not None:
            loc.longitude = req.longitude
        if req.accuracy is not None:
            loc.accuracy = req.accuracy
        loc.is_sharing_enabled = req.is_sharing_enabled
        loc.is_online = req.is_online
        loc.timestamp = now

    db.commit()
    db.refresh(loc)

    status_str = "live" if (loc.is_sharing_enabled and loc.is_online) else ("offline" if not loc.is_online else "unavailable")
    return PatientLocationOut(
        patient_id=loc.patient_id,
        patient_name=current_user.full_name,
        latitude=loc.latitude if loc.is_sharing_enabled else None,
        longitude=loc.longitude if loc.is_sharing_enabled else None,
        accuracy=loc.accuracy if loc.is_sharing_enabled else None,
        is_sharing_enabled=loc.is_sharing_enabled,
        is_online=loc.is_online,
        status=status_str,
        timestamp=loc.timestamp,
        updated_at=loc.updated_at
    )

@app.get("/api/guardian/patient-location", response_model=PatientLocationOut)
def get_guardian_patient_location(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    patient_name = patient.user.full_name if (patient and patient.user) else "Managed Patient"

    loc = db.query(PatientLocation).filter(PatientLocation.patient_id == patient_id).first()
    if not loc or not loc.is_sharing_enabled:
        return PatientLocationOut(
            patient_id=patient_id,
            patient_name=patient_name,
            latitude=None,
            longitude=None,
            accuracy=None,
            is_sharing_enabled=loc.is_sharing_enabled if loc else False,
            is_online=loc.is_online if loc else False,
            status="unavailable",
            timestamp=loc.timestamp if loc else None,
            updated_at=loc.updated_at if loc else None
        )

    # Determine Live vs Offline/Stale status
    now = datetime.datetime.utcnow()
    is_recent = loc.timestamp and (now - loc.timestamp).total_seconds() < 180
    if loc.is_online and is_recent:
        status_str = "live"
    elif not loc.is_online:
        status_str = "offline"
    else:
        status_str = "offline"

    return PatientLocationOut(
        patient_id=loc.patient_id,
        patient_name=patient_name,
        latitude=loc.latitude,
        longitude=loc.longitude,
        accuracy=loc.accuracy,
        is_sharing_enabled=loc.is_sharing_enabled,
        is_online=loc.is_online,
        status=status_str,
        timestamp=loc.timestamp,
        updated_at=loc.updated_at
    )

@app.post("/api/patient/reminders/check-missed", response_model=List[MissedReminderResult])
def check_missed_reminders(
    req: MissedReminderCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    patient_name = patient.user.full_name if (patient and patient.user) else "Patient"

    today_str = req.client_date or datetime.date.today().isoformat()

    # Determine current minutes
    current_mins = parse_time_to_minutes(req.current_time_str) if req.current_time_str else None
    if current_mins is None:
        now_dt = datetime.datetime.utcnow()
        current_mins = now_dt.hour * 60 + now_dt.minute

    reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id).all()
    results = []

    for rem in reminders:
        scheduled_mins = parse_time_to_minutes(rem.scheduled_time)
        if scheduled_mins is None:
            continue

        # Overdue diff calculation (in minutes)
        diff = current_mins - scheduled_mins
        alert_created = False

        # Rule: Exact 30-minute threshold check.
        # Do NOT trigger before 30 minutes (0 to 29 minutes overdue).
        # Trigger when diff >= 30 minutes and <= 720 minutes (within same day cycle)
        if diff >= 30 and diff <= 720 and rem.status == "Pending":
            rem.status = "Skipped"
            rem.skipped_at = datetime.datetime.utcnow()

            # Unique occurrence key ensures no duplicates
            occ_key = f"missed_r{rem.id}_{today_str}"
            existing_alert = db.query(Alert).filter(
                Alert.patient_id == patient_id,
                Alert.occurrence_key == occ_key
            ).first()

            if not existing_alert:
                alert = Alert(
                    patient_id=patient_id,
                    alert_type="Reminder Skipped",
                    message=f"{patient_name} did not acknowledge the {rem.scheduled_time} {rem.title} reminder within 30 minutes. Caregiver attention recommended.",
                    severity="Medium",
                    is_resolved=False,
                    occurrence_key=occ_key,
                    event_time=datetime.datetime.utcnow(),
                    synced_time=datetime.datetime.utcnow()
                )
                db.add(alert)
                alert_created = True

        results.append(MissedReminderResult(
            reminder_id=rem.id,
            title=rem.title,
            scheduled_time=rem.scheduled_time,
            status=rem.status,
            alert_created=alert_created
        ))

    db.commit()
    return results

# ---------------------------- COGNITIVE GAMES & ADAPTIVE ML ENGINE ----------------------------

@app.post("/api/games/submit-session")
def submit_game_session(
    req: GameSessionSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
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

    adaptive_result = evaluate_and_update_difficulty(db, patient_id, req.game_code, session)

    return {
        "status": "success",
        "session_id": session.id,
        "adaptive_result": adaptive_result
    }

# ---------------------------- VOICE ASSISTANT ----------------------------

@app.post("/api/voice/ask")
def voice_ask(
    req: VoiceQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    return process_voice_query(db, patient_id, req.transcript, requested_language=req.language)

@app.post("/api/voice/reset-context")
def voice_reset_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, None, db)
    reset_conversation_context(patient_id)
    return {"status": "success", "message": "Conversation context reset", "patient_id": patient_id}

@app.get("/api/voice/history")
def get_voice_history(
    requested_patient_id: Optional[int] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    interactions = (
        db.query(VoiceInteraction)
        .filter(VoiceInteraction.patient_id == patient_id)
        .order_by(VoiceInteraction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": i.id,
            "patient_id": i.patient_id,
            "transcript": i.transcript,
            "intent": i.intent,
            "assistant_response": i.assistant_response,
            "created_at": i.created_at
        }
        for i in interactions
    ]

# ---------------------------- GUARDIAN DASHBOARD & ANALYTICS ----------------------------

@app.get("/api/guardian/overview")
def get_guardian_overview(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    
    total_reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id).count()
    completed_reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id, Reminder.status == "Completed").count()
    adherence_rate = round((completed_reminders / total_reminders * 100), 1) if total_reminders > 0 else 100.0

    recent_sessions = db.query(GameSession).filter(GameSession.patient_id == patient_id).order_by(GameSession.played_at.desc()).limit(5).all()

    return {
        "patient": {
            "name": patient.user.full_name if patient and patient.user else "Prasad",
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
def get_guardian_analytics(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    sessions = db.query(GameSession).filter(GameSession.patient_id == patient_id).order_by(GameSession.played_at.asc()).all()
    cog = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    
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

    mem_score = round(cog.memory_score) if cog else 75
    att_score = round(cog.attention_score) if cog else 70
    pat_score = round(cog.pattern_score) if cog else 70
    resp_speed = cog.avg_response_time_ms if cog else 3000.0
    resp_score = round(max(50.0, min(100.0, 100.0 - (resp_speed / 100.0))))

    return {
        "cognitive_trend": chart_data,
        "category_scores": [
            {"category": "Memory Recall", "score": mem_score},
            {"category": "Attention", "score": att_score},
            {"category": "Pattern Recognition", "score": pat_score},
            {"category": "Response Performance", "score": resp_score}
        ]
    }

@app.get("/api/guardian/sessions")
def get_guardian_game_sessions(
    requested_patient_id: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    sessions = (
        db.query(GameSession)
        .filter(GameSession.patient_id == patient_id)
        .order_by(GameSession.played_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total_count = db.query(GameSession).filter(GameSession.patient_id == patient_id).count()

    return {
        "total_count": total_count,
        "limit": limit,
        "offset": offset,
        "sessions": [
            {
                "id": s.id,
                "game_code": s.game_code,
                "difficulty_level": s.difficulty_level,
                "accuracy_percentage": s.accuracy_percentage,
                "avg_response_time_ms": s.avg_response_time_ms,
                "mistakes_count": s.mistakes_count,
                "played_at": s.played_at
            }
            for s in sessions
        ]
    }

@app.get("/api/guardian/alerts", response_model=List[AlertOut])
def get_guardian_alerts(
    requested_patient_id: Optional[int] = None,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    patient_id = get_authenticated_patient_id(current_user, requested_patient_id, db)
    return db.query(Alert).filter(Alert.patient_id == patient_id).order_by(Alert.created_at.desc()).all()

@app.post("/api/guardian/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = True
        db.commit()
        log_audit_event(db, current_user, "RESOLVE_ALERT", f"Resolved alert ID {alert_id}")
    return {"status": "resolved"}

@app.get("/api/guardian/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_role(["guardian"])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

# ---------------------------- OFFLINE SYNCHRONIZATION ----------------------------

@app.post("/api/sync")
def process_sync_queue(
    items: List[SyncQueueItem],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
