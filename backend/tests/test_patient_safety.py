import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import User, PatientProfile, Guardian, Reminder, Alert, PatientLocation
from app.auth import hash_password, create_access_token
import datetime

client = TestClient(app)

@pytest.fixture
def auth_tokens():
    db = SessionLocal()
    try:
        p_user = db.query(User).filter(User.email == "vivek@manas.org").first()
        g_user = db.query(User).filter(User.email == "ravi@manas.org").first()

        patient_token = create_access_token({"sub": str(p_user.id), "role": "patient"})
        guardian_token = create_access_token({"sub": str(g_user.id), "role": "guardian"})

        return {
            "patient_token": patient_token,
            "guardian_token": guardian_token,
            "patient_id": p_user.patient_profile.id,
            "guardian_id": g_user.guardian_profile.id
        }
    finally:
        db.close()

def test_patient_location_update_and_guardian_fetch(auth_tokens):
    p_token = auth_tokens["patient_token"]
    g_token = auth_tokens["guardian_token"]
    p_id = auth_tokens["patient_id"]

    # 1. Patient updates location with sharing enabled
    loc_payload = {
        "latitude": 25.5788,
        "longitude": 91.8933,
        "accuracy": 12.5,
        "is_sharing_enabled": True,
        "is_online": True,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    res = client.post(
        "/api/patient/location",
        json=loc_payload,
        headers={"Authorization": f"Bearer {p_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["latitude"] == 25.5788
    assert data["is_sharing_enabled"] is True
    assert data["status"] == "live"

    # 2. Guardian fetches patient location
    res_g = client.get(
        f"/api/guardian/patient-location?requested_patient_id={p_id}",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res_g.status_code == 200
    g_data = res_g.json()
    assert g_data["patient_id"] == p_id
    assert g_data["status"] == "live"
    assert g_data["latitude"] == 25.5788
    assert g_data["accuracy"] == 12.5

    # 3. Patient turns sharing off
    res_off = client.post(
        "/api/patient/location",
        json={**loc_payload, "is_sharing_enabled": False},
        headers={"Authorization": f"Bearer {p_token}"}
    )
    assert res_off.status_code == 200
    assert res_off.json()["status"] == "unavailable"

    # 4. Guardian now sees unavailable status
    res_g_off = client.get(
        f"/api/guardian/patient-location?requested_patient_id={p_id}",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res_g_off.status_code == 200
    assert res_g_off.json()["status"] == "unavailable"
    assert res_g_off.json()["latitude"] is None

def test_guardian_unauthorized_patient_access_forbidden(auth_tokens):
    g_token = auth_tokens["guardian_token"]
    # Attempt to access non-existent or unauthorized patient ID 9999
    res = client.get(
        "/api/guardian/patient-location?requested_patient_id=9999",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res.status_code == 403

def test_missed_reminder_30_minute_rule_and_deduplication(auth_tokens):
    p_token = auth_tokens["patient_token"]
    p_id = auth_tokens["patient_id"]

    db = SessionLocal()
    try:
        # Clean up any leftover test alerts
        db.query(Alert).filter(Alert.occurrence_key.like("missed_%")).delete(synchronize_session=False)
        db.commit()

        # Create a test reminder scheduled at 08:00 AM
        test_rem = Reminder(
            patient_id=p_id,
            title="Blood Pressure Tablet",
            category="Medicine",
            scheduled_time="08:00 AM",
            status="Pending"
        )
        db.add(test_rem)
        db.commit()
        db.refresh(test_rem)
        rem_id = test_rem.id

        # 1. Check at 08:15 AM (15 minutes overdue) -> Should NOT mark skipped, no alert
        res_15 = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:15 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        assert res_15.status_code == 200
        items = res_15.json()
        rem_15 = next((x for x in items if x["reminder_id"] == rem_id), None)
        assert rem_15 is not None
        assert rem_15["status"] == "Pending"
        assert rem_15["alert_created"] is False

        # 2. Check at 08:35 AM (35 minutes overdue) -> Meets >= 30 min rule! Marks Skipped, creates ONE alert
        res_35 = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:35 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        assert res_35.status_code == 200
        items_35 = res_35.json()
        rem_35 = next((x for x in items_35 if x["reminder_id"] == rem_id), None)
        assert rem_35 is not None
        assert rem_35["status"] == "Skipped"
        assert rem_35["alert_created"] is True

        # 3. Check again at 08:45 AM (45 minutes overdue) -> Should NOT create duplicate alert
        res_45 = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:45 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        assert res_45.status_code == 200
        items_45 = res_45.json()
        rem_45 = next((x for x in items_45 if x["reminder_id"] == rem_id), None)
        assert rem_45 is not None
        assert rem_45["alert_created"] is False

        # Clean up test reminder and associated alerts
        to_del = db.query(Reminder).filter(Reminder.id == rem_id).first()
        if to_del:
            db.delete(to_del)
        db.query(Alert).filter(Alert.occurrence_key.like(f"missed_r{rem_id}_%")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

