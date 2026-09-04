from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    patient_id: Optional[int] = None
    guardian_id: Optional[int] = None

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

# Person Schemas
class PersonBase(BaseModel):
    name: str
    relationship: str
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class PersonCreate(PersonBase):
    embedding_data: Optional[List[float]] = None

class PersonOut(PersonBase):
    id: int
    frequently_seen: bool
    created_at: datetime
    class Config:
        from_attributes = True

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
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

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
    id: int
    title: str
    category: str
    scheduled_time: str
    status: str
    class Config:
        from_attributes = True

class RoutineOut(BaseModel):
    id: int
    time_of_day: str
    title: str
    icon_symbol: str
    status: str
    class Config:
        from_attributes = True

# Alert Schema
class AlertOut(BaseModel):
    id: int
    alert_type: str
    message: str
    severity: str
    is_resolved: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Voice Request
class VoiceQueryRequest(BaseModel):
    transcript: str

# Face Login & Recognition Request
class FaceLoginRequest(BaseModel):
    embedding: List[float]

class FaceRecognizeRequest(BaseModel):
    embedding: List[float]

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
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Sync Item Schema
class SyncQueueItem(BaseModel):
    client_tx_id: str
    entity_type: str
    payload: dict
