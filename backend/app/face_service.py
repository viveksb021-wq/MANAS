import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Person, FaceRecognitionProfile

def compare_embeddings(embedding_a: List[float], embedding_b: List[float]) -> float:
    """Calculates Cosine Similarity between two feature embedding vectors."""
    if not embedding_a or not embedding_b or len(embedding_a) != len(embedding_b):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(embedding_a, embedding_b))
    norm_a = math.sqrt(sum(a * a for a in embedding_a))
    norm_b = math.sqrt(sum(b * b for b in embedding_b))
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

def recognize_face_from_embedding(db: Session, patient_id: int, target_embedding: List[float]) -> Dict[str, Any]:
    """
    Compares query embedding with enrolled face profiles for the given patient.
    Returns match details or friendly fallback message.
    """
    people = db.query(Person).filter(Person.patient_id == patient_id).all()
    
    best_match_person: Optional[Person] = None
    highest_score = 0.0

    for person in people:
        if person.face_profile and person.face_profile.embedding_data:
            enrolled_emb = person.face_profile.embedding_data
            score = compare_embeddings(target_embedding, enrolled_emb)
            if score > highest_score:
                highest_score = score
                best_match_person = person

    HIGH_CONFIDENCE = 0.75
    LOW_CONFIDENCE = 0.50

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
            "sub_text": f"This looks somewhat like {best_match_person.name} ({best_match_person.relationship}). Please move closer to the camera.",
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
