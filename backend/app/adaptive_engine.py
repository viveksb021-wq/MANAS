from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import CognitiveProfile, GameSession, Alert

def evaluate_and_update_difficulty(db: Session, patient_id: int, game_code: str, session: GameSession) -> Dict[str, Any]:
    """
    Evaluates game session performance relative to patient's own baseline response speed and
    applies hysteresis (2-of-3 recent session agreement) before updating game difficulty.
    Difficulty range: 1 (Very Easy) to 5 (Advanced).
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
            avg_response_time_ms=3200.0,
            recent_trend="Stable Activity"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    current_diff = profile.current_difficulty
    accuracy = session.accuracy_percentage
    avg_speed = session.avg_response_time_ms

    # 1. Update category score weighted exponential moving average
    alpha = 0.3
    if "memory" in game_code or "recall" in game_code or "orientation" in game_code:
        profile.memory_score = round((1 - alpha) * profile.memory_score + alpha * accuracy, 1)
        profile.recall_score = round((1 - alpha) * profile.recall_score + alpha * accuracy, 1)
    elif "attention" in game_code:
        profile.attention_score = round((1 - alpha) * profile.attention_score + alpha * accuracy, 1)
    elif "pattern" in game_code:
        profile.pattern_score = round((1 - alpha) * profile.pattern_score + alpha * accuracy, 1)

    profile.avg_response_time_ms = round((1 - alpha) * profile.avg_response_time_ms + alpha * avg_speed, 1)

    # 2. Retrieve last 3 sessions to evaluate hysteresis direction voting
    recent_sessions = (
        db.query(GameSession)
        .filter(GameSession.patient_id == patient_id)
        .order_by(GameSession.played_at.desc())
        .limit(3)
        .all()
    )

    baseline_speed = profile.avg_response_time_ms
    directions: List[int] = []

    for s in recent_sessions:
        # Patient-relative fast threshold: response time within 115% of patient's own baseline
        if s.accuracy_percentage >= 85.0 and s.avg_response_time_ms <= (baseline_speed * 1.15) and s.mistakes_count == 0:
            directions.append(1)  # Want level up
        elif s.accuracy_percentage < 60.0 or s.mistakes_count >= 3 or s.avg_response_time_ms > (baseline_speed * 1.6):
            directions.append(-1)  # Want level down
        else:
            directions.append(0)  # Maintain

    # 3. Apply 2-of-3 agreement hysteresis rule
    up_votes = directions.count(1)
    down_votes = directions.count(-1)

    new_diff = current_diff
    reason = "Maintained optimal difficulty level."

    if up_votes >= 2:
        if current_diff < 5:
            new_diff = current_diff + 1
            reason = "Consistent high accuracy & speed across recent sessions! Difficulty increased slightly."
        else:
            reason = "Performing consistently at maximum difficulty level!"
    elif down_votes >= 2:
        if current_diff > 1:
            new_diff = current_diff - 1
            reason = "Adjusted difficulty to provide a gentler, more comfortable experience."
        else:
            reason = "Kept at initial friendly baseline level."

    # 4. Update trend indicator & trigger caregiver alert on declining trend
    overall_avg = (profile.memory_score + profile.attention_score + profile.pattern_score) / 3.0
    if overall_avg >= 80.0:
        profile.recent_trend = "Consistent High Engagement"
    elif overall_avg < 60.0:
        profile.recent_trend = "Caregiver Support Recommended"

        # Check if an unresolved Pattern Changed alert already exists to prevent duplicate spam
        existing_alert = (
            db.query(Alert)
            .filter(Alert.patient_id == patient_id, Alert.alert_type == "Pattern Changed", Alert.is_resolved == False)
            .first()
        )
        if not existing_alert:
            new_alert = Alert(
                patient_id=patient_id,
                alert_type="Pattern Changed",
                message=f"Cognitive performance alert: Patient's overall score dropped below threshold (Index: {round(overall_avg, 1)}). Caregiver support recommended.",
                severity="Medium",
                is_resolved=False
            )
            db.add(new_alert)
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
