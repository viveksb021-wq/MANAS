import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, PatientProfile, CognitiveProfile, GameSession, Alert
from app.adaptive_engine import evaluate_and_update_difficulty
from app.auth import create_access_token

client = TestClient(app)

def test_patient_relative_speed_baseline_and_hysteresis():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        assert user is not None

        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        patient_id = patient_profile.id if patient_profile else user.id

        # Clean up existing test sessions for a clean hysteresis test environment
        db.query(GameSession).filter(GameSession.patient_id == patient_id).delete()
        db.commit()

        profile = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
        if not profile:
            profile = CognitiveProfile(patient_id=patient_id, current_difficulty=2, avg_response_time_ms=6000.0)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        else:
            profile.avg_response_time_ms = 6000.0
            profile.current_difficulty = 2
            db.commit()

        # Session 1: High accuracy (90%), response speed 5500ms (slower than 4500ms fixed default, but fast relative to 6000ms baseline * 1.15)
        s1 = GameSession(
            patient_id=patient_id,
            game_code="memory_match",
            accuracy_percentage=90.0,
            avg_response_time_ms=5500.0,
            mistakes_count=0,
            difficulty_level=2
        )
        db.add(s1)
        db.commit()

        res1 = evaluate_and_update_difficulty(db, patient_id, "memory_match", s1)
        # Session 1 alone (1 up vote) shouldn't change difficulty (need 2 of 3)
        assert profile.current_difficulty == 2

        # Session 2: High accuracy again
        s2 = GameSession(
            patient_id=patient_id,
            game_code="memory_match",
            accuracy_percentage=92.0,
            avg_response_time_ms=5200.0,
            mistakes_count=0,
            difficulty_level=2
        )
        db.add(s2)
        db.commit()

        res2 = evaluate_and_update_difficulty(db, patient_id, "memory_match", s2)
        # 2 of 3 now agree on level up, difficulty should increase from 2 to 3
        assert res2["new_difficulty"] == 3
        assert profile.current_difficulty == 3

    finally:
        db.close()

def test_automated_pattern_changed_alert_creation():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        patient_id = patient_profile.id if patient_profile else user.id

        profile = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
        if not profile:
            profile = CognitiveProfile(patient_id=patient_id, current_difficulty=2)
            db.add(profile)
            db.commit()

        # Set profile category scores low (< 60.0)
        profile.memory_score = 45.0
        profile.attention_score = 50.0
        profile.pattern_score = 40.0
        db.commit()

        s_poor = GameSession(
            patient_id=patient_id,
            game_code="attention_tap",
            accuracy_percentage=40.0,
            avg_response_time_ms=8000.0,
            mistakes_count=4,
            difficulty_level=2
        )
        db.add(s_poor)
        db.commit()

        res = evaluate_and_update_difficulty(db, patient_id, "attention_tap", s_poor)
        assert res["cognitive_profile"]["recent_trend"] == "Caregiver Support Recommended"
        
        # Check that an Alert was created in DB
        alert = db.query(Alert).filter(
            Alert.patient_id == patient_id,
            Alert.alert_type == "Pattern Changed"
        ).order_by(Alert.id.desc()).first()

        assert alert is not None
        assert "Caregiver Support Recommended" in alert.message or "overall score" in alert.message.lower()
        assert alert.is_resolved is False

    finally:
        db.close()

def test_guardian_analytics_api_real_aggregates():
    db = SessionLocal()
    try:
        guardian_user = db.query(User).filter(User.email == "ravi@manas.org").first()
        token = create_access_token({"sub": str(guardian_user.id), "role": "guardian"})
    finally:
        db.close()

    res = client.get(
        "/api/guardian/analytics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "cognitive_trend" in data
    assert "category_scores" in data
    assert len(data["category_scores"]) == 4
    categories = [cat["category"] for cat in data["category_scores"]]
    assert "Memory Recall" in categories
    assert "Attention" in categories
    assert "Pattern Recognition" in categories

def test_guardian_sessions_pagination_api():
    db = SessionLocal()
    try:
        guardian_user = db.query(User).filter(User.email == "ravi@manas.org").first()
        token = create_access_token({"sub": str(guardian_user.id), "role": "guardian"})
    finally:
        db.close()

    res = client.get(
        "/api/guardian/sessions?limit=3&offset=0",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "sessions" in data
    assert "total_count" in data
    assert "limit" in data
    assert "offset" in data
    assert data["limit"] == 3
    assert len(data["sessions"]) <= 3
