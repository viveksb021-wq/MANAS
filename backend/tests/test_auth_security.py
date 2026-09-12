import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import create_access_token, create_refresh_token, hash_password
from app.database import get_db, Base, engine, SessionLocal
from app.models import User, PatientProfile, Guardian, AuditLog

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={
        "email": "ravi@manas.org",
        "password": "ravi123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["role"] == "guardian"
    assert data["user_id"] is not None

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "ravi@manas.org",
        "password": "wrongpassword"
    })
    assert response.status_code == 400
    assert "Invalid email or password" in response.json()["detail"]

def test_unauthenticated_protected_endpoint():
    response = client.get("/api/patient/profile")
    assert response.status_code == 401
    assert "Authentication token missing" in response.json()["detail"]

def test_patient_authenticated_profile_derivation():
    # Login as patient vivek@manas.org
    login_res = client.post("/api/auth/login", json={
        "email": "vivek@manas.org",
        "password": "vivek123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Request patient profile with Bearer token
    res = client.get(
        "/api/patient/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    profile = res.json()
    assert profile["full_name"] == "Prasad"

def test_guardian_ownership_check_access():
    # Login as guardian ravi@manas.org
    login_res = client.post("/api/auth/login", json={
        "email": "ravi@manas.org",
        "password": "ravi123"
    })
    token = login_res.json()["access_token"]

    # Ravi is linked to Patient 1 (Prasad) -> should succeed
    res = client.get(
        "/api/guardian/overview?requested_patient_id=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["patient"]["name"] == "Prasad"

    # Attempting to access an unlinked patient ID 9999 -> should return 404 or 403
    res_unlinked = client.get(
        "/api/guardian/overview?requested_patient_id=9999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_unlinked.status_code in [403, 404]

def test_refresh_token_flow():
    login_res = client.post("/api/auth/login", json={
        "email": "ravi@manas.org",
        "password": "ravi123"
    })
    refresh_tok = login_res.json()["refresh_token"]

    ref_res = client.post("/api/auth/refresh", json={
        "refresh_token": refresh_tok
    })
    assert ref_res.status_code == 200
    new_data = ref_res.json()
    assert "access_token" in new_data
    assert new_data["role"] == "guardian"

def test_register_new_guardian():
    import uuid
    email = f"new_guardian_{uuid.uuid4().hex[:6]}@manas.org"
    res = client.post("/api/auth/register", json={
        "email": email,
        "password": "securepass123",
        "full_name": "Test Guardian",
        "role": "guardian",
        "phone_number": "+91 99999 88888"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "guardian"
    assert "access_token" in data

def test_audit_logs_recorded():
    # Login as guardian to fetch audit logs
    login_res = client.post("/api/auth/login", json={
        "email": "ravi@manas.org",
        "password": "ravi123"
    })
    token = login_res.json()["access_token"]

    res = client.get(
        "/api/guardian/audit-logs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
