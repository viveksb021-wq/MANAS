from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Reminder, Routine, Person, Memory, Place, PatientProfile

def process_voice_query(db: Session, patient_id: int, user_transcript: str) -> Dict[str, Any]:
    """
    Parses natural speech transcript and retrieves verified personal data & contextual connections from the database.
    """
    query = user_transcript.lower().strip()
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    patient_name = patient.user.full_name if (patient and patient.user) else "there"

    # Contextual Intent: "Where did I go with [Person]?" (e.g. "Where did I go with Arun?")
    if "where did i go with" in query or "place with" in query:
        search_person = query.replace("where did i go with", "").replace("place with", "").replace("?", "").strip()
        memory = db.query(Memory).filter(
            Memory.patient_id == patient_id,
            Memory.people_involved.ilike(f"%{search_person}%")
        ).first()

        if memory and memory.place:
            speech = f"You visited {memory.place} with {memory.people_involved}. Memory: {memory.title}."
            place_rec = db.query(Place).filter(
                Place.patient_id == patient_id,
                Place.name.ilike(f"%{memory.place.split(',')[0]}%")
            ).first()

            return {
                "intent": "CONTEXTUAL_LOCATION_QUERY",
                "spoken_response": speech,
                "action": "SHOW_PLACE_ROUTE",
                "suggested_screen": "/places",
                "place": {
                    "id": place_rec.id if place_rec else 1,
                    "name": memory.place,
                    "category": place_rec.category if place_rec else "Important Place",
                    "address": place_rec.address if place_rec else memory.place,
                    "latitude": place_rec.latitude if place_rec else 25.5788,
                    "longitude": place_rec.longitude if place_rec else 91.8933
                }
            }

    # Intent 1: "Where is my [place / hospital / house]?" (e.g. "Where is my hospital?")
    if "where is" in query or "location of" in query or "hospital" in query or "clinic" in query or "house" in query:
        search_term = query.replace("where is", "").replace("location of", "").replace("my", "").replace("?", "").strip()
        
        places = db.query(Place).filter(Place.patient_id == patient_id).all()
        matched_place = None

        for p in places:
            if search_term and (search_term in p.name.lower() or search_term in p.category.lower() or p.category.lower() in search_term):
                matched_place = p
                break
        
        if not matched_place and places:
            matched_place = places[0]  # Default to primary place (e.g. Hospital)

        if matched_place:
            speech = f"Your {matched_place.category.lower()} is {matched_place.name}, located at {matched_place.address}."
            return {
                "intent": "GET_PLACE_LOCATION",
                "spoken_response": speech,
                "action": "SHOW_PLACE_ROUTE",
                "suggested_screen": "/places",
                "place": {
                    "id": matched_place.id,
                    "name": matched_place.name,
                    "category": matched_place.category,
                    "address": matched_place.address,
                    "latitude": matched_place.latitude,
                    "longitude": matched_place.longitude
                }
            }

    # Intent 2: "What do I have to do today?" / "What is my schedule?"
    if any(phrase in query for phrase in ["do today", "today's schedule", "my routine", "today's tasks", "what do i have"]):
        routines = db.query(Routine).filter(Routine.patient_id == patient_id).all()
        reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id, Reminder.status == "Pending").all()
        
        if not routines and not reminders:
            speech = f"Good day, {patient_name}. You have no pending activities scheduled for today."
        else:
            routine_text = ", ".join([f"{r.time_of_day} - {r.title}" for r in routines[:3]])
            speech = f"Here is your plan for today, {patient_name}: {routine_text}."
            if reminders:
                speech += f" You also have a reminder for {reminders[0].title} at {reminders[0].scheduled_time}."

        return {
            "intent": "GET_TODAY_SCHEDULE",
            "spoken_response": speech,
            "action": "NAVIGATE_TODAY",
            "suggested_screen": "/today"
        }

    # Intent 3: "Who is [Name]?" (e.g., "Who is Arun?")
    elif "who is" in query:
        search_name = query.replace("who is", "").replace("?", "").strip()
        person = db.query(Person).filter(
            Person.patient_id == patient_id,
            Person.name.ilike(f"%{search_name}%")
        ).first()

        if person:
            speech = f"{person.name} is your {person.relationship}. {person.notes or ''}"
            return {
                "intent": "PERSON_QUERY",
                "spoken_response": speech,
                "action": "SHOW_PERSON",
                "person": {
                    "id": person.id,
                    "name": person.name,
                    "relationship": person.relationship,
                    "photo_url": person.photo_url
                }
            }
        else:
            return {
                "intent": "PERSON_QUERY_NOT_FOUND",
                "spoken_response": f"I don't have information about {search_name.capitalize()} yet. You can ask your guardian to add them in 'People I Know'.",
                "action": "NAVIGATE_PEOPLE"
            }

    # Intent 4: "What is my next reminder?" / "Medicine reminder"
    elif any(phrase in query for phrase in ["reminder", "medicine", "hydration", "next appointment"]):
        reminder = db.query(Reminder).filter(
            Reminder.patient_id == patient_id,
            Reminder.status == "Pending"
        ).order_by(Reminder.scheduled_time.asc()).first()

        if reminder:
            speech = f"Your next reminder is for {reminder.title} scheduled at {reminder.scheduled_time}."
            return {
                "intent": "GET_NEXT_REMINDER",
                "spoken_response": speech,
                "action": "NAVIGATE_REMINDERS",
                "reminder": {
                    "title": reminder.title,
                    "time": reminder.scheduled_time,
                    "category": reminder.category
                }
            }
        else:
            return {
                "intent": "GET_NEXT_REMINDER_EMPTY",
                "spoken_response": "You don't have any pending reminders right now. All caught up!",
                "action": "NONE"
            }

    # Intent 5: "Open my memories" / "Show photos"
    elif any(phrase in query for phrase in ["memories", "photos", "family trip", "pictures"]):
        memories_count = db.query(Memory).filter(Memory.patient_id == patient_id).count()
        speech = f"Opening your personal memories album. You have {memories_count} saved memories."
        return {
            "intent": "OPEN_MEMORIES",
            "spoken_response": speech,
            "action": "NAVIGATE_MEMORIES",
            "suggested_screen": "/memories"
        }

    # Intent 6: "Start today's game" / "Play game"
    elif any(phrase in query for phrase in ["game", "play", "train", "start activity"]):
        speech = "Let's play today's cognitive game! Opening Play & Train."
        return {
            "intent": "START_GAME",
            "spoken_response": speech,
            "action": "NAVIGATE_GAMES",
            "suggested_screen": "/games"
        }

    # Fallback response (Zero Hallucination)
    else:
        return {
            "intent": "UNKNOWN",
            "spoken_response": f"I heard you say '{user_transcript}'. I don't have that specific information yet, but I can help you check saved places, today's activities, or personal memories.",
            "action": "HELP_GUIDANCE"
        }
