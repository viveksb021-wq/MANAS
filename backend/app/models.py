import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship as rel
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "patient" or "guardian"
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient_profile = rel("PatientProfile", back_populates="user", uselist=False)
    guardian_profile = rel("Guardian", back_populates="user", uselist=False)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    guardian_id = Column(Integer, ForeignKey("guardians.id"), nullable=True)
    age = Column(Integer, default=72)
    gender = Column(String, default="Not specified")
    preferred_language = Column(String, default="en")  # "en", "as", "bn", "mn", "hi"
    voice_preference = Column(String, default="gentle_female")
    communication_preference = Column(String, default="Voice & Visual Cards")
    hobbies = Column(Text, nullable=True)  # Comma-separated or JSON list of hobbies
    caregiver_clinical_notes = Column(Text, nullable=True)  # Caregiver/clinical info
    emergency_contact = Column(String, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = rel("User", back_populates="patient_profile")
    guardian = rel("Guardian", back_populates="patients")
    cognitive_profile = rel("CognitiveProfile", back_populates="patient", uselist=False)
    memories = rel("Memory", back_populates="patient")
    people = rel("Person", back_populates="patient")
    reminders = rel("Reminder", back_populates="patient")
    routines = rel("Routine", back_populates="patient")
    game_sessions = rel("GameSession", back_populates="patient")
    alerts = rel("Alert", back_populates="patient")
    places = rel("Place", back_populates="patient")
    voice_profile = rel("VoiceProfile", back_populates="patient", uselist=False)
    location = rel("PatientLocation", back_populates="patient", uselist=False)

class Guardian(Base):
    __tablename__ = "guardians"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    phone_number = Column(String, nullable=True)
    relationship_to_patient = Column(String, default="Son")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = rel("User", back_populates="guardian_profile")
    patients = rel("PatientProfile", back_populates="guardian")

class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), unique=True)
    passphrase = Column(String, default="MANAS CONNECT")
    sample_phrase = Column(String, default="My name is Vivek")
    is_enrolled = Column(Boolean, default=True)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="voice_profile")

class CognitiveProfile(Base):
    __tablename__ = "cognitive_profiles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), unique=True)
    current_difficulty = Column(Integer, default=1)  # 1: Very Easy, 2: Easy, 3: Medium, 4: Hard, 5: Advanced
    memory_score = Column(Float, default=75.0)
    attention_score = Column(Float, default=70.0)
    recall_score = Column(Float, default=80.0)
    pattern_score = Column(Float, default=72.0)
    object_recognition_score = Column(Float, default=78.0)
    routine_recall_score = Column(Float, default=82.0)
    avg_response_time_ms = Column(Float, default=3200.0)
    recent_trend = Column(String, default="Stable")  # "Improving", "Stable", "Needs Attention"
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="cognitive_profile")

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)  # e.g., "Grandson", "Daughter", "Doctor"
    photo_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    frequently_seen = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="people")
    face_profile = rel("FaceRecognitionProfile", back_populates="person", uselist=False)

class FaceRecognitionProfile(Base):
    __tablename__ = "face_recognition_profiles"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), unique=True)
    embedding_data = Column(JSON, nullable=True)  # Primary / averaged vector embedding array
    sample_embeddings = Column(JSON, nullable=True)  # Array of 3-5 sample embeddings captured during enrollment
    confidence_threshold = Column(Float, default=0.80)
    sample_images_count = Column(Integer, default=3)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    person = rel("Person", back_populates="face_profile")

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    name = Column(String, nullable=False)
    category = Column(String, default="Hospital")  # "Hospital", "Home", "Family", "Shop", "Worship", "Bank", "Clinic"
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="places")

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    place = Column(String, nullable=True)
    people_involved = Column(String, nullable=True)
    memory_date = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    voice_note_url = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # e.g., "Shillong, Family, Bihu"
    category = Column(String, default="Family")  # "People", "Family", "Places", "Events", "Objects", "Important Moments", "Routines"
    associated_person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    associated_place_id = Column(Integer, ForeignKey("places.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="memories")

class MemoryActivityResult(Base):
    __tablename__ = "memory_activity_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    memory_id = Column(Integer, ForeignKey("memories.id"), nullable=True)
    target_person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    is_correct = Column(Boolean, nullable=False)
    time_taken_ms = Column(Float, nullable=False)
    attempts_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # "memory_recall", "attention_challenge", "pattern_rec"
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "Memory", "Attention", "Pattern Recognition"
    description = Column(Text, nullable=True)
    icon_name = Column(String, default="Brain")

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    game_code = Column(String, nullable=False)
    difficulty_level = Column(Integer, default=1)
    accuracy_percentage = Column(Float, nullable=False)
    avg_response_time_ms = Column(Float, nullable=False)
    mistakes_count = Column(Integer, default=0)
    attempts_count = Column(Integer, default=1)
    completed = Column(Boolean, default=True)
    played_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="game_sessions")
    results = rel("GameResult", back_populates="session")

class GameResult(Base):
    __tablename__ = "game_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"))
    question_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_ms = Column(Float, nullable=False)
    user_answer = Column(String, nullable=True)
    correct_answer = Column(String, nullable=True)

    session = rel("GameSession", back_populates="results")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    title = Column(String, nullable=False)
    category = Column(String, default="Medicine")  # "Medicine", "Hydration", "Appointment", "Activity"
    scheduled_time = Column(String, nullable=False)  # e.g., "08:00 AM"
    is_recurring = Column(Boolean, default=True)
    status = Column(String, default="Pending")  # "Completed", "Pending", "Missed", "Skipped"
    completed_at = Column(DateTime, nullable=True)
    skipped_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="reminders")

class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    time_of_day = Column(String, nullable=False)  # e.g., "07:30 AM"
    title = Column(String, nullable=False)
    icon_symbol = Column(String, default="☀️")
    status = Column(String, default="Pending")  # "Completed", "Pending", "Skipped"

    patient = rel("PatientProfile", back_populates="routines")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    activity_type = Column(String, nullable=False)  # "Game", "Memory View", "Voice Chat", "Reminder Confirm"
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    alert_type = Column(String, nullable=False)  # "Reminder Missed", "Reminder Skipped", "Low Activity", "SOS Help", "Pattern Changed"
    message = Column(Text, nullable=False)
    severity = Column(String, default="Medium")  # "Low", "Medium", "High"
    is_resolved = Column(Boolean, default=False)
    occurrence_key = Column(String, nullable=True, index=True)  # Deduplication key e.g. p1_r1_2026-09-11
    event_time = Column(DateTime, nullable=True)
    synced_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="alerts")

class PatientLocation(Base):
    __tablename__ = "patient_locations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    is_sharing_enabled = Column(Boolean, default=False)
    is_online = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = rel("PatientProfile", back_populates="location")

class VoiceInteraction(Base):
    __tablename__ = "voice_interactions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    transcript = Column(Text, nullable=False)
    intent = Column(String, nullable=True)
    assistant_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LanguagePreference(Base):
    __tablename__ = "language_preferences"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), unique=True)
    language_code = Column(String, default="en")  # "en", "as", "bn", "mn", "hi"
    font_size_scale = Column(Float, default=1.2)  # Large font scale

class SyncQueue(Base):
    __tablename__ = "sync_queue"

    id = Column(Integer, primary_key=True, index=True)
    client_tx_id = Column(String, unique=True, index=True)
    entity_type = Column(String, nullable=False)  # "GameSession", "Reminder", "Memory"
    payload = Column(JSON, nullable=False)
    status = Column(String, default="Pending")  # "Pending", "Synced", "Failed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    synced_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = rel("User")
