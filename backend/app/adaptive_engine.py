from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import CognitiveProfile, GameSession

def evaluate_and_update_difficulty(db: Session, patient_id: int, game_code: str, session: GameSession) -> Dict[str, Any]:
    """
    Evaluates recent game session performance and dynamically tunes game difficulty.
    Difficulty range: 1 (Very Easy), 2 (Easy), 3 (Medium), 4 (Hard), 5 (Advanced).
    """
    profile = db.query(CognitiveProfile).filter(CognitiveProfile.patient_id == patient_id).first()
    if not profile:
        profile = CognitiveProfile(
            patient_id=patient_id,
            current_difficulty=1,
            memory_score=75.0,
            attention_score=70.0,
            recall_score=75.0,
            pattern_score=70.0,
            avg_response_time_ms=3000.0,
            recent_trend="Stable"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    current_diff = profile.current_difficulty
    accuracy = session.accuracy_percentage
    avg_speed = session.avg_response_time_ms

    # Update category score weighted moving average
    alpha = 0.3  # Exponential smoothing factor
    if "memory" in game_code or "recall" in game_code:
        profile.memory_score = round((1 - alpha) * profile.memory_score + alpha * accuracy, 1)
        profile.recall_score = round((1 - alpha) * profile.recall_score + alpha * accuracy, 1)
    elif "attention" in game_code:
        profile.attention_score = round((1 - alpha) * profile.attention_score + alpha * accuracy, 1)
    elif "pattern" in game_code:
        profile.pattern_score = round((1 - alpha) * profile.pattern_score + alpha * accuracy, 1)

    profile.avg_response_time_ms = round((1 - alpha) * profile.avg_response_time_ms + alpha * avg_speed, 1)

    # Determine difficulty transition
    new_diff = current_diff
    reason = "Maintained difficulty"

    # Good performance thresholds
    if accuracy >= 85.0 and avg_speed <= 4500:
        if current_diff < 5:
            new_diff = current_diff + 1
            reason = "Great accuracy & speed! Difficulty increased slightly."
        else:
            reason = "Performing excellently at maximum difficulty!"
    # Poor performance thresholds
    elif accuracy < 60.0 or session.mistakes_count >= 3:
        if current_diff > 1:
            new_diff = current_diff - 1
            reason = "Adjusted difficulty to provide a gentler experience."
        else:
            reason = "Kept at initial friendly level."
    else:
        reason = "Steady performance. Maintained optimal difficulty level."

    # Update trend indicator
    overall_avg = (profile.memory_score + profile.attention_score + profile.pattern_score) / 3.0
    if overall_avg >= 80:
        profile.recent_trend = "Consistent High Engagement"
    elif overall_avg < 60:
        profile.recent_trend = "Caregiver Support Recommended"
    else:
        profile.recent_trend = "Stable Activity"

    profile.current_difficulty = new_diff
    db.commit()
    db.refresh(profile)

    return {
        "previous_difficulty": current_diff,
        "new_difficulty": new_diff,
        "reason": reason,
        "cognitive_profile": {
            "current_difficulty": profile.current_difficulty,
            "memory_score": profile.memory_score,
            "attention_score": profile.attention_score,
            "recall_score": profile.recall_score,
            "pattern_score": profile.pattern_score,
            "avg_response_time_ms": profile.avg_response_time_ms,
            "recent_trend": profile.recent_trend
        }
    }
