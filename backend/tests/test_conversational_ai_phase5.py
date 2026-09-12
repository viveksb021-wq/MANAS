"""
MANAS Conversational AI & Cognitive Support Validation Suite (Phase 5)
Verifies:
1. All 12 specified test prompts (Section 36)
2. Multi-turn dialog with follow-up affirmation (Section 37)
3. Zero-hallucination patient-scoped retrieval (Section 38)
4. Patient isolation & context switching (Section 39)
5. Session context reset & security (Section 40)
6. Multilingual synthesis and graceful fallback (Section 24 & 35)
"""

import pytest
from app.database import SessionLocal
from app.voice_service import (
    process_voice_query,
    reset_conversation_context,
    get_conversation_context,
    update_conversation_context
)
from app.models import PatientProfile, Person, Reminder, Memory, Routine


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_12_specified_prompts(db_session):
    """Verifies all 12 specified prompts from Section 36 of user requirements."""
    # 1. "Hello MANAS" -> Natural greeting
    res1 = process_voice_query(db_session, 1, "Hello MANAS", "en")
    assert res1["intent"] == "GREETING"
    assert "Hello" in res1["spoken_response"]

    # 2. "Hello MANAS, what are we gonna do?" -> Conversational response with useful options
    res2 = process_voice_query(db_session, 1, "Hello MANAS, what are we gonna do?", "en")
    assert res2["intent"] == "CASUAL_WHAT_TO_DO"
    assert "happy to spend some time with you" in res2["spoken_response"]
    assert res2["action"] == "OFFER_CHOICES"

    # 3. "What can we do today?" -> Use today's context and suggest available activities
    res3 = process_voice_query(db_session, 1, "What can we do today?", "en")
    assert res3["intent"] == "GET_TODAY_SCHEDULE"
    assert "Here is your plan for today" in res3["spoken_response"]
    assert res3["action"] == "NAVIGATE_TODAY"

    # 4. "I'm bored." -> Offer appropriate activities
    res4 = process_voice_query(db_session, 1, "I'm bored.", "en")
    assert res4["intent"] == "CASUAL_BORED"
    assert "enjoyable together" in res4["spoken_response"]
    assert res4["action"] == "OFFER_CHOICES"

    # 5. "Let's play a game." -> Offer/start a cognitive game
    res5 = process_voice_query(db_session, 1, "Let's play a game.", "en")
    assert res5["intent"] == "START_GAME"
    assert "memory game or an attention game" in res5["spoken_response"]
    assert res5["action"] == "NAVIGATE_GAMES"

    # 6. "Who is Arun?" -> Retrieve actual People data
    res6 = process_voice_query(db_session, 1, "Who is Arun?", "en")
    assert res6["intent"] == "PERSON_QUERY"
    assert "Arun" in res6["spoken_response"]
    assert "Grandson" in res6["spoken_response"] or "grandson" in res6["spoken_response"].lower()
    assert res6["action"] == "SHOW_PERSON"

    # 7. "Where is my hospital?" -> Retrieve actual saved place
    res7 = process_voice_query(db_session, 1, "Where is my hospital?", "en")
    assert res7["intent"] == "GET_PLACE_LOCATION"
    assert "Shillong Medical Centre" in res7["spoken_response"]
    assert res7["action"] == "SHOW_PLACE_ROUTE"

    # 8. "What reminders do I have today?" -> Retrieve actual reminders
    res8 = process_voice_query(db_session, 1, "What reminders do I have today?", "en")
    assert res8["intent"] == "GET_TODAY_SCHEDULE"
    assert "reminder" in res8["spoken_response"].lower() or "today" in res8["spoken_response"].lower()
    assert res8["action"] == "NAVIGATE_TODAY"

    # 9. "Show my memories." -> Open Memory Garden
    res9 = process_voice_query(db_session, 1, "Show my memories.", "en")
    assert res9["intent"] == "OPEN_MEMORIES"
    assert "memories" in res9["spoken_response"].lower()
    assert res9["action"] == "NAVIGATE_MEMORIES"

    # 10. "Thank you." -> Natural conversational response
    res10 = process_voice_query(db_session, 1, "Thank you.", "en")
    assert res10["intent"] == "GRATITUDE"
    assert "welcome" in res10["spoken_response"].lower()
    assert res10["action"] == "NONE"

    # 11. "Good night." -> Natural farewell
    res11 = process_voice_query(db_session, 1, "Good night.", "en")
    assert res11["intent"] == "GOOD_NIGHT"
    assert "good night" in res11["spoken_response"].lower()
    assert res11["action"] == "NONE"

    # 12. "Tell me something." -> Natural helpful conversation rather than database error
    res12 = process_voice_query(db_session, 1, "Tell me something.", "en")
    assert res12["intent"] == "CASUAL_NICE_THOUGHT"
    assert "comfort" in res12["spoken_response"].lower() or "pleasant" in res12["spoken_response"].lower()


def test_multi_turn_dialogue_flow(db_session):
    """Verifies Section 37: Multi-turn AI Test sequence."""
    reset_conversation_context(1)

    # 1. USER: "Hello MANAS."
    t1 = process_voice_query(db_session, 1, "Hello MANAS.", "en")
    assert t1["intent"] == "GREETING"

    # 2. USER: "What should we do?"
    t2 = process_voice_query(db_session, 1, "What should we do?", "en")
    assert t2["intent"] == "CASUAL_WHAT_TO_DO"
    assert t2["action"] == "OFFER_CHOICES"

    # 3. USER: "Memory game."
    t3 = process_voice_query(db_session, 1, "Memory game.", "en")
    assert t3["intent"] == "CHOOSE_GAME_MEMORY"
    assert t3["action"] == "NAVIGATE_GAMES"

    # 4. USER: "Yes." (Understands that "yes" confirms the pending action)
    t4 = process_voice_query(db_session, 1, "Yes.", "en")
    assert t4["intent"] == "AFFIRM_PENDING_ACTION"
    assert t4["action"] == "NAVIGATE_GAMES"
    assert t4["suggested_screen"] == "/games"


def test_zero_hallucination_and_patient_scoping(db_session):
    """Verifies Section 38 & 39: Strict patient-scoped data retrieval without cross-talk."""
    reset_conversation_context(1)
    reset_conversation_context(2)

    # Patient 1 has Arun
    p1_res = process_voice_query(db_session, 1, "Who is Arun?", "en")
    assert p1_res["intent"] == "PERSON_QUERY"
    assert "Arun" in p1_res["spoken_response"]
    assert "Grandson" in p1_res["spoken_response"] or "grandson" in p1_res["spoken_response"].lower()

    # Patient 2 does NOT have Arun
    p2_res = process_voice_query(db_session, 2, "Who is Arun?", "en")
    assert p2_res["intent"] == "PERSON_QUERY_NOT_FOUND"
    assert "I don't have information about Arun" in p2_res["spoken_response"]

    # Unknown appointment check (Section 21)
    appt_res = process_voice_query(db_session, 1, "What is my brother's appointment time?", "en")
    assert appt_res["intent"] == "APPOINTMENT_QUERY"
    assert "I don't have an appointment time for your brother." == appt_res["spoken_response"]

    # Unknown generic fallback (Section 22)
    unknown_res = process_voice_query(db_session, 1, "abracadabra qwerty xyz 987", "en")
    assert unknown_res["intent"] == "UNKNOWN"
    assert "I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game." in unknown_res["spoken_response"]


def test_reset_context(db_session):
    """Verifies Section 40: Context clearing on logout / patient switch."""
    update_conversation_context(1, "OFFER_GAME_CHOICE", "START_GAME", "play game")
    assert get_conversation_context(1).get("last_intent") == "OFFER_GAME_CHOICE"

    reset_conversation_context(1)
    assert get_conversation_context(1) == {}


def test_multilingual_speech_synthesis(db_session):
    """Verifies regional language responses for configured Northeast/Indian languages."""
    # Assamese
    as_res = process_voice_query(db_session, 1, "Hello MANAS", "as")
    assert "নমস্কাৰ" in as_res["spoken_response"]

    # Bengali
    bn_res = process_voice_query(db_session, 1, "Hello MANAS", "bn")
    assert "নমস্কার" in bn_res["spoken_response"]

    # Khasi
    kha_res = process_voice_query(db_session, 1, "Hello MANAS", "kha")
    assert "Khublei" in kha_res["spoken_response"]

    # Nepali
    ne_res = process_voice_query(db_session, 1, "Hello MANAS", "ne")
    assert "नमस्ते" in ne_res["spoken_response"]

    # Mizo
    mzo_res = process_voice_query(db_session, 1, "Hello MANAS", "lus")
    assert "Chibai" in mzo_res["spoken_response"]

    # Manipuri (Meitei)
    mni_res = process_voice_query(db_session, 1, "Hello MANAS", "mni")
    assert "খুরুমজরি" in mni_res["spoken_response"]
