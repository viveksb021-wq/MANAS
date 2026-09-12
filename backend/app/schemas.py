from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # "patient" or "guardian"
    phone_number: Optional[str] = None
    age: Optional[int] = 72
    guardian_email: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    patient_id: Optional[int] = None
    guardian_id: Optional[int] = None
    expires_in: Optional[int] = 86400

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_role: str
    action: str
    details: Optional[str] = None
    timestamp: datetime

# Patient Profile Schemas
class PatientProfileSchema(BaseModel):
    id: int
    full_name: str
    age: int
    preferred_language: str
    voice_preference: str
    emergency_contact: Optional[str] = None
    onboarding_completed: bool

class PatientOnboardingRequest(BaseModel):
    full_name: str
    age: int
    preferred_language: str
    voice_preference: str
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None

class CaregiverOnboardingWizardRequest(BaseModel):
    full_name: str
    age: int
    gender: Optional[str] = "Not specified"
    preferred_language: str = "en"
    communication_preference: str = "Voice & Visual Cards"
    caregiver_clinical_notes: Optional[str] = None
    hobbies: List[str] = []
    relationships: List[dict] = []
    routines: List[dict] = []
    medications: List[dict] = []
    memories: List[dict] = []
    auth_passphrase: Optional[str] = "MANAS CONNECT"

class VoiceAuthRequest(BaseModel):
    spoken_phrase: str

class MemoryActivitySubmit(BaseModel):
    memory_id: Optional[int] = None
    target_person_id: Optional[int] = None
    is_correct: bool = True
    time_taken_ms: float = 2000.0
    attempts_count: int = 1

class CognitiveAssessmentSubmit(BaseModel):
    domain: Optional[str] = "Overall"
    score: float = 85.0
    time_taken_ms: float = 2000.0
    difficulty_level: int = 1

# Person Schemas
class PersonBase(BaseModel):
    name: str
    relationship: str
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class PersonCreate(PersonBase):
    embedding_data: Optional[List[float]] = None
    sample_embeddings: Optional[List[List[float]]] = None

class PersonOut(PersonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    frequently_seen: bool
    created_at: datetime

# Memory Schemas
class MemoryBase(BaseModel):
    title: str
    description: str
    place: Optional[str] = None
    people_involved: Optional[str] = None
    memory_date: Optional[str] = None
    photo_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    tags: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class MemoryOut(MemoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

# Game Session Schemas
class GameSessionSubmit(BaseModel):
    game_code: str
    difficulty_level: int
    accuracy_percentage: float
    avg_response_time_ms: float
    mistakes_count: int
    attempts_count: int

# Reminder & Routine Schemas
class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    scheduled_time: str
    status: str

class RoutineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    time_of_day: str
    title: str
    icon_symbol: str
    status: str

# Alert Schema
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_type: str
    message: str
    severity: str
    is_resolved: bool
    occurrence_key: Optional[str] = None
    event_time: Optional[datetime] = None
    synced_time: Optional[datetime] = None
    created_at: datetime

# Location Schemas
class PatientLocationUpdate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    is_sharing_enabled: bool = True
    is_online: bool = True
    timestamp: Optional[datetime] = None

class PatientLocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    patient_id: int
    patient_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    is_sharing_enabled: bool
    is_online: bool
    status: str  # "live", "offline", "unavailable"
    timestamp: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Missed Reminder Schemas
class MissedReminderCheckRequest(BaseModel):
    current_time_str: Optional[str] = None  # e.g. "08:35 PM"
    client_date: Optional[str] = None       # e.g. "2026-09-11"

class MissedReminderResult(BaseModel):
    reminder_id: int
    title: str
    scheduled_time: str
    status: str
    alert_created: bool

# Voice Request
class VoiceQueryRequest(BaseModel):
    transcript: str
    language: Optional[str] = None

# Face Login & Recognition Request
class FaceLoginRequest(BaseModel):
    embedding: List[float]

class FaceRecognizeRequest(BaseModel):
    embedding: List[float]
    sample_embeddings: Optional[List[List[float]]] = None

# Place Schemas
class PlaceBase(BaseModel):
    name: str
    category: str
    address: str
    latitude: float
    longitude: float
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class PlaceCreate(PlaceBase):
    pass

class PlaceOut(PlaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

# Sync Item Schema
class SyncQueueItem(BaseModel):
    client_tx_id: str
    entity_type: str
    payload: dict
