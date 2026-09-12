import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Person, FaceRecognitionProfile

def compare_embeddings(embedding_a: List[float], embedding_b: List[float]) -> float:
    """Calculates Cosine Similarity between two feature embedding vectors."""
    if not embedding_a or not embedding_b:
        return 0.0
    
    min_len = min(len(embedding_a), len(embedding_b))
    vec_a = embedding_a[:min_len]
    vec_b = embedding_b[:min_len]

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

def recognize_face_from_embedding(
    db: Session,
    patient_id: int,
    target_embedding: List[float],
    target_samples: Optional[List[List[float]]] = None
) -> Dict[str, Any]:
    """
    Compares query embedding (and optional multi-frame samples) with enrolled face profiles for the given patient.
    Evaluates highest cosine similarity across multi-pose stored sample embeddings per person.
    
    Anti-Spoofing & Liveness Security Note:
    - Production deployments require checking micro-variations across multi-frame video feeds to guard against static photos.
    - Biometric FaceRecognitionProfile database records are protected by patient & guardian ownership authorization.
    """
    people = db.query(Person).filter(Person.patient_id == patient_id).all()
    
    best_match_person: Optional[Person] = None
    highest_score = 0.0

    query_vectors = [target_embedding]
    if target_samples:
        query_vectors.extend([s for s in target_samples if s])

    for person in people:
        profile = person.face_profile
        if not profile:
            continue

        enrolled_vectors: List[List[float]] = []
        if profile.embedding_data:
            enrolled_vectors.append(profile.embedding_data)
        if profile.sample_embeddings:
            for s in profile.sample_embeddings:
                if s and isinstance(s, list):
                    enrolled_vectors.append(s)

        person_max_score = 0.0
        for q_vec in query_vectors:
            for e_vec in enrolled_vectors:
                score = compare_embeddings(q_vec, e_vec)
                if score > person_max_score:
                    person_max_score = score

        if person_max_score > highest_score:
            highest_score = person_max_score
            best_match_person = person

    # Recalibrated confidence thresholds for real feature embeddings
    HIGH_CONFIDENCE = 0.82
    LOW_CONFIDENCE = 0.65

    if not best_match_person or highest_score < LOW_CONFIDENCE:
        return {
            "recognized": False,
            "confidence": round(highest_score, 2),
            "message": "I don't recognize this person yet.",
            "sub_text": "Ask your guardian to enroll new family members in 'People I Know'.",
            "person": None
        }
    elif highest_score < HIGH_CONFIDENCE:
        return {
            "recognized": False,
            "confidence": round(highest_score, 2),
            "message": "I'm not sure who this is.",
            "sub_text": f"This looks somewhat like {best_match_person.name} ({best_match_person.relationship}). Please move closer to the camera and ensure good lighting.",
            "person": None
        }
    else:
        return {
            "recognized": True,
            "confidence": round(highest_score, 2),
            "message": f"This is {best_match_person.name}.",
            "sub_text": f"Your {best_match_person.relationship}.",
            "person": {
                "id": best_match_person.id,
                "name": best_match_person.name,
                "relationship": best_match_person.relationship,
                "photo_url": best_match_person.photo_url,
                "notes": best_match_person.notes
            }
        }
