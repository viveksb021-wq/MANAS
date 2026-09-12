import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import create_access_token
from app.face_service import compare_embeddings, recognize_face_from_embedding
from app.database import SessionLocal
from app.models import User, Person, FaceRecognitionProfile

client = TestClient(app)

def test_cosine_similarity_identical_vectors():
    vec_a = [0.1 * i for i in range(64)]
    score = compare_embeddings(vec_a, vec_a)
    assert pytest.approx(score, 0.001) == 1.0

def test_cosine_similarity_orthogonal_vectors():
    vec_a = [1.0 if i < 32 else 0.0 for i in range(64)]
    vec_b = [0.0 if i < 32 else 1.0 for i in range(64)]
    score = compare_embeddings(vec_a, vec_b)
    assert pytest.approx(score, 0.001) == 0.0

def test_multi_sample_person_enrollment_api():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "ravi@manas.org").first()
        token = create_access_token({"sub": str(user.id), "role": "guardian"})
    finally:
        db.close()

    sample1 = [0.1 * (i % 5) for i in range(64)]
    sample2 = [0.15 * (i % 5) for i in range(64)]
    sample3 = [0.2 * (i % 5) for i in range(64)]

    res = client.post(
        "/api/people",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Biren Das",
            "relationship": "Uncle",
            "notes": "Loves tea gardens",
            "embedding_data": sample1,
            "sample_embeddings": [sample1, sample2, sample3]
        }
    )
    assert res.status_code == 200
    person_data = res.json()
    assert person_data["name"] == "Biren Das"

    # Verify DB stored multi-sample embeddings
    db = SessionLocal()
    try:
        person = db.query(Person).filter(Person.id == person_data["id"]).first()
        assert person is not None
        assert person.face_profile is not None
        assert person.face_profile.sample_embeddings is not None
        assert len(person.face_profile.sample_embeddings) == 3
    finally:
        db.close()

def test_face_recognition_recalibrated_thresholds():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        token = create_access_token({"sub": str(user.id), "role": "patient"})
    finally:
        db.close()

    # Query matching enrolled sample vector -> High confidence match (>=0.82)
    sample_matching = [0.15, 0.22, -0.31, 0.70, 0.45, -0.05, 0.62, 0.21, -0.11, 0.50, 0.40, -0.15, 0.38, 0.20, -0.05, 0.65] + [0.0]*48
    rec_res = client.post(
        "/api/people/recognize-face",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "embedding": sample_matching,
            "sample_embeddings": [sample_matching]
        }
    )
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert data["recognized"] is True
    assert data["confidence"] >= 0.82

def test_face_recognition_unknown_person():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vivek@manas.org").first()
        token = create_access_token({"sub": str(user.id), "role": "patient"})
    finally:
        db.close()

    random_query = [-0.9 if i % 2 == 0 else 0.9 for i in range(64)]
    rec_res = client.post(
        "/api/people/recognize-face",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "embedding": random_query
        }
    )
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert data["recognized"] is False
    assert "don't recognize" in data["message"].lower()
