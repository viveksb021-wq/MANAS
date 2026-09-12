import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, PatientProfile, Person, VoiceInteraction
from app.auth import create_access_token
from app.voice_service import process_voice_query, translate_multilingual_transcript, extract_intent_and_slots

client = TestClient(app)

def test_multilingual_transcript_translation():
    hindi_trans = translate_multilingual_transcript("अस्पताल कहां है", "hi")
    assert "hospital" in hindi_trans.lower() or "where is" in hindi_trans.lower()

    bengali_trans = translate_multilingual_transcript("অরুণ কে", "bn")
    assert "who is" in bengali_trans.lower() or "arun" in bengali_trans.lower()

def test_paraphrased_intent_and_slot_extraction():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        patient_id = patient_profile.id if patient_profile else user.id

        # Paraphrased query 1: "tell me about Arun"
        intent1, slots1 = extract_intent_and_slots("tell me about Arun", db, patient_id)
        assert intent1 == "PERSON_QUERY"
        assert slots1.get("person_name") == "arun"

        # Paraphrased query 2: "where is my clinic located"
        intent2, slots2 = extract_intent_and_slots("where is my clinic located", db, patient_id)
        assert intent2 == "GET_PLACE_LOCATION"

        # Paraphrased query 3: "what tasks do I have later"
        intent3, _ = extract_intent_and_slots("what tasks do I have later", db, patient_id)
        assert intent3 == "GET_TODAY_SCHEDULE"

    finally:
        db.close()

def test_zero_hallucination_person_query_and_logging():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        patient_id = patient_profile.id if patient_profile else user.id

        # Query existing person Arun
        res_arun = process_voice_query(db, patient_id, "tell me about Arun")
        assert res_arun["intent"] == "PERSON_QUERY"
        assert "arun" in res_arun["spoken_response"].lower()

        # Query non-existent person -> Zero hallucination check
        res_unknown = process_voice_query(db, patient_id, "who is NonExistentFriend999")
        assert res_unknown["intent"] == "PERSON_QUERY_NOT_FOUND"
        assert "don't have information" in res_unknown["spoken_response"].lower()
        assert "nonexistentfriend999" not in res_unknown["spoken_response"].lower() or "add them" in res_unknown["spoken_response"].lower()

        # Verify VoiceInteraction was logged in DB
        logs = db.query(VoiceInteraction).filter(VoiceInteraction.patient_id == patient_id).all()
        assert len(logs) >= 2

    finally:
        db.close()

def test_voice_history_api_endpoint():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        token = create_access_token({"sub": str(user.id), "role": "patient"})
    finally:
        db.close()

    res = client.get(
        "/api/voice/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert "transcript" in history[0]
    assert "intent" in history[0]
    assert "assistant_response" in history[0]
