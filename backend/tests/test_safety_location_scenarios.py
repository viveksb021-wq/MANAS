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

def test_scenario_1_live_location_when_online_and_shared(auth_tokens):
    p_token = auth_tokens["patient_token"]
    g_token = auth_tokens["guardian_token"]
    p_id = auth_tokens["patient_id"]

    now = datetime.datetime.utcnow().isoformat()
    res = client.post(
        "/api/patient/location",
        json={
            "latitude": 25.5788,
            "longitude": 91.8933,
            "accuracy": 8.5,
            "is_sharing_enabled": True,
            "is_online": True,
            "timestamp": now
        },
        headers={"Authorization": f"Bearer {p_token}"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "live"
    assert res.json()["is_sharing_enabled"] is True

    # Caregiver fetches location
    res_g = client.get(
        f"/api/guardian/patient-location?requested_patient_id={p_id}",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res_g.status_code == 200
    data = res_g.json()
    assert data["status"] == "live"
    assert data["latitude"] == 25.5788
    assert data["longitude"] == 91.8933
    assert data["accuracy"] == 8.5
    assert data["is_online"] is True

def test_scenario_2_location_sharing_turned_off(auth_tokens):
    p_token = auth_tokens["patient_token"]
    g_token = auth_tokens["guardian_token"]
    p_id = auth_tokens["patient_id"]

    # Patient toggles sharing OFF
    res = client.post(
        "/api/patient/location",
        json={
            "is_sharing_enabled": False,
            "is_online": True
        },
        headers={"Authorization": f"Bearer {p_token}"}
    )
    assert res.status_code == 200
    assert res.json()["is_sharing_enabled"] is False

    # Guardian fetches location -> coordinates hidden
    res_g = client.get(
        f"/api/guardian/patient-location?requested_patient_id={p_id}",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res_g.status_code == 200
    data = res_g.json()
    assert data["is_sharing_enabled"] is False
    assert data["latitude"] is None
    assert data["longitude"] is None

def test_scenario_3_offline_patient_shows_last_known(auth_tokens):
    p_token = auth_tokens["patient_token"]
    g_token = auth_tokens["guardian_token"]
    p_id = auth_tokens["patient_id"]

    # Re-enable sharing with known coordinates
    past_time = (datetime.datetime.utcnow() - datetime.timedelta(minutes=10)).isoformat()
    client.post(
        "/api/patient/location",
        json={
            "latitude": 25.5711,
            "longitude": 91.8890,
            "accuracy": 15.0,
            "is_sharing_enabled": True,
            "is_online": False,
            "timestamp": past_time
        },
        headers={"Authorization": f"Bearer {p_token}"}
    )

    # Caregiver fetches -> must NOT claim "live", must show offline with preserved last known coordinates
    res_g = client.get(
        f"/api/guardian/patient-location?requested_patient_id={p_id}",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res_g.status_code == 200
    data = res_g.json()
    assert data["status"] == "offline"
    assert data["is_online"] is False
    assert data["latitude"] == 25.5711
    assert data["longitude"] == 91.8890
    assert data["accuracy"] == 15.0

def test_scenario_4_unauthorized_guardian_forbidden(auth_tokens):
    g_token = auth_tokens["guardian_token"]
    res = client.get(
        "/api/guardian/patient-location?requested_patient_id=99999",
        headers={"Authorization": f"Bearer {g_token}"}
    )
    assert res.status_code == 403

def test_scenario_5_missed_reminder_calm_alert_and_deduplication(auth_tokens):
    p_token = auth_tokens["patient_token"]
    g_token = auth_tokens["guardian_token"]
    p_id = auth_tokens["patient_id"]

    db = SessionLocal()
    try:
        # Create a test reminder scheduled at 08:00 AM
        rem = Reminder(
            patient_id=p_id,
            title="Heart Wellness Tablet",
            category="Medicine",
            scheduled_time="08:00 AM",
            status="Pending"
        )
        db.add(rem)
        db.commit()
        db.refresh(rem)
        r_id = rem.id

        # At 08:10 AM (10 mins overdue) -> diff < 30 -> NO alert
        res_early = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:10 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        assert res_early.status_code == 200
        early_match = next((x for x in res_early.json() if x["reminder_id"] == r_id), None)
        assert early_match["status"] == "Pending"
        assert early_match["alert_created"] is False

        # At 08:31 AM (31 mins overdue) -> diff >= 30 -> marks Skipped, creates calm alert
        res_missed = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:31 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        assert res_missed.status_code == 200
        missed_match = next((x for x in res_missed.json() if x["reminder_id"] == r_id), None)
        assert missed_match["status"] == "Skipped"
        assert missed_match["alert_created"] is True

        # Caregiver checks Alert Center -> receives calm alert
        res_alerts = client.get(
            f"/api/guardian/alerts?requested_patient_id={p_id}",
            headers={"Authorization": f"Bearer {g_token}"}
        )
        assert res_alerts.status_code == 200
        alerts_list = res_alerts.json()
        calm_alert = next((a for a in alerts_list if "Heart Wellness Tablet" in a["message"]), None)
        assert calm_alert is not None
        assert calm_alert["alert_type"] == "Reminder Skipped"
        assert "Caregiver attention recommended" in calm_alert["message"]
        assert "critical emergency" not in calm_alert["message"].lower()

        # Check again at 08:45 AM -> NO duplicate alert
        res_dup = client.post(
            "/api/patient/reminders/check-missed",
            json={"current_time_str": "08:45 AM", "client_date": "2026-09-11"},
            headers={"Authorization": f"Bearer {p_token}"}
        )
        dup_match = next((x for x in res_dup.json() if x["reminder_id"] == r_id), None)
        assert dup_match["alert_created"] is False

        # Cleanup
        to_del = db.query(Reminder).filter(Reminder.id == r_id).first()
        if to_del:
            db.delete(to_del)
        db.query(Alert).filter(Alert.occurrence_key.like(f"missed_r{r_id}_%")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()
