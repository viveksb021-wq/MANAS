import pytest
from app.database import SessionLocal
from app.models import User, PatientProfile
from app.voice_service import (
    process_voice_query,
    translate_multilingual_transcript,
    localize_response,
    get_conversation_context,
    reset_conversation_context
)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_all_nine_languages_supported_and_localized():
    """Verify that all 9 North-East Indian languages translate greetings and actions properly."""
    languages = ["en", "as", "bn", "kha", "ne", "lus", "mni", "trp", "nag"]
    sample_phrase = "Hello! What would you like to do?"

    for lang in languages:
        localized = localize_response(sample_phrase, lang)
        assert localized is not None and len(localized) > 0
        if lang == "en":
            assert "Hello!" in localized
        elif lang == "as":
            assert "নমস্কাৰ" in localized or "আপুনি কি কৰিব বিচাৰে" in localized
        elif lang == "bn":
            assert "নমস্কার" in localized or "আপনি কি করতে চান" in localized
        elif lang == "ne":
            assert "नमस्ते" in localized or "तपाईं के गर्न चाहनुहुन्छ" in localized
        elif lang == "kha":
            assert "Khublei" in localized or "Kaei phi kwah ban leh" in localized
        elif lang == "lus":
            assert "Chibai" in localized or "Eng nge i tih duh le" in localized
        elif lang == "mni":
            assert "খুরুমজরি" in localized or "করি তৌনিংবগে" in localized
        elif lang == "trp":
            assert "Khulumkha" in localized or "Nung mang khwlai nai" in localized
        elif lang == "nag":
            assert "Ki koribo mon ase" in localized or "Hello" in localized

def test_multiturn_conversation_language_persistence(db_session):
    """Verify language persists across multi-turn exchanges and does not revert to English."""
    user = db_session.query(User).filter(User.email == "vivek@manas.org").first()
    patient = db_session.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    patient_id = patient.id if patient else user.id

    reset_conversation_context(patient_id)

    # Turn 1: Patient asks in Assamese
    turn1 = process_voice_query(db_session, patient_id, "আজি কি কৰিম", requested_language="as")
    assert turn1["language"] == "as"
    assert turn1["spoken_response"] == turn1["text_response"]
    assert "স্মৃতি" in turn1["spoken_response"] or "খেল" in turn1["spoken_response"] or "পৰিকল্পনা" in turn1["spoken_response"]

    # Turn 2: Follow-up without explicit requested_language in payload -> must remain in Assamese
    turn2 = process_voice_query(db_session, patient_id, "yes")
    assert turn2["language"] == "as"
    assert turn2["spoken_response"] == turn2["text_response"]

    # Reset
    reset_conversation_context(patient_id)

def test_immediate_switch_to_bengali(db_session):
    """Verify switching from Assamese to Bengali immediately reflects in next query."""
    user = db_session.query(User).filter(User.email == "vivek@manas.org").first()
    patient = db_session.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    patient_id = patient.id if patient else user.id

    # Switch to Bengali
    res = process_voice_query(db_session, patient_id, "আজকে কি কাজ আছে", requested_language="bn")
    assert res["language"] == "bn"
    assert res["spoken_response"] == res["text_response"]
    assert "মেমোরি" in res["spoken_response"] or "পরিকল্পনা" in res["spoken_response"] or "ছবি" in res["spoken_response"]
