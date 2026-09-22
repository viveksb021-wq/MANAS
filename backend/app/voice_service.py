"""
MANAS Conversational AI & Neural Voice Engine
Smart India Hackathon (SIH 2026)
Empathetic, Context-Aware Cognitive Support Assistant with Multi-turn Dialogue,
Strict Patient Scoping, Zero-Hallucination Retrieval, and Multilingual Synthesis.
"""

import re
import datetime
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.orm import Session
from app.models import Person, Place, Memory, Routine, Reminder, PatientProfile, VoiceInteraction

# In-memory short-term multi-turn conversation context per patient
# Structure: { patient_id: { "last_intent": str, "pending_action": Optional[str], "last_query": str, "updated_at": datetime } }
CONVERSATION_SESSIONS: Dict[int, Dict[str, Any]] = {}

def get_conversation_context(patient_id: int) -> Dict[str, Any]:
    ctx = CONVERSATION_SESSIONS.get(patient_id)
    if ctx:
        # Expire session if older than 10 minutes
        if datetime.datetime.now() - ctx.get("updated_at", datetime.datetime.min) > datetime.timedelta(minutes=10):
            CONVERSATION_SESSIONS.pop(patient_id, None)
            return {}
        return ctx
    return {}

def update_conversation_context(patient_id: int, intent: str, pending_action: Optional[str], last_query: str, language: Optional[str] = None):
    prev = CONVERSATION_SESSIONS.get(patient_id, {})
    CONVERSATION_SESSIONS[patient_id] = {
        "last_intent": intent,
        "pending_action": pending_action,
        "last_query": last_query,
        "language": language or prev.get("language", "en"),
        "updated_at": datetime.datetime.now()
    }

def reset_conversation_context(patient_id: int):
    CONVERSATION_SESSIONS.pop(patient_id, None)


def translate_multilingual_transcript(transcript: str, lang: str = "en") -> str:
    """
    Multilingual Normalization Layer:
    Translates keywords from regional Northeast and Indian languages into English query tokens.
    Supports Assamese, Bengali, Manipuri, Hindi, Nepali, Khasi, Mizo, Kokborok, Nagamese.
    """
    if not transcript:
        return ""

    t = transcript.lower().strip()
    l = (lang or "en").lower()

    # Hindi Mappings
    if l == "hi" or any(c in t for c in ["क्या", "कहाँ", "कौन", "नमस्ते", "दवाई", "यादें", "खेल"]):
        t = t.replace("नमस्ते", "hello").replace("प्रणाम", "hello")
        t = t.replace("क्या करें", "what should we do").replace("क्या करेंगे", "what are we gonna do")
        t = t.replace("अस्पताल", "hospital").replace("दवाई", "medicine").replace("तस्वीरें", "photos").replace("खेल", "game")
        t = t.replace("आज क्या करना है", "what do i have to do today").replace("यादें", "memories")
        t = t.replace("शुक्रिया", "thank you").replace("धन्यवाद", "thank you")

    # Bengali Mappings
    elif l == "bn" or any(c in t for c in ["কোথায়", "কে", "নমস্কার", "ওষুধ", "ছবি", "খেলা", "ধন্যবাদ", "কাজ"]):
        t = t.replace("নমস্কার", "hello").replace("হ্যালো", "hello")
        t = t.replace("কে", "who is").replace("কোথায়", "where is").replace("হাসপাতাল", "hospital")
        t = t.replace("ওষুধ", "medicine").replace("ছবি", "photos").replace("খেলা", "game")
        if any(w in t for w in ["আজকে কি কাজ", "কি কাজ আছে", "কি কাজ", "আজ কি কাজ", "আজকে কাজ", "কাজ আছে"]):
            t = "what do i have to do today"
        t = t.replace("ধন্যবাদ", "thank you")
        if any(w in t for w in ["আমরা কি করব", "কি করব", "কি করা যায়"]):
            t = "what are we gonna do"

    # Assamese Mappings
    elif l == "as" or any(c in t for c in ["নমস্কাৰ", "ক’ত", "কোন", "চিকিৎসালয়", "দৰৱ", "কি কৰিম", "ধন্যবাদ", "কাম"]):
        t = t.replace("নমস্কাৰ", "hello").replace("হেল্ল'", "hello")
        t = t.replace("ক’ত", "where is").replace("কত", "where is").replace("কোন", "who is")
        t = t.replace("চিকিৎসালয়", "hospital").replace("চিকিৎসালয়", "hospital").replace("দৰৱ", "medicine")
        if any(w in t for w in ["কি কৰিম", "কি কৰিব", "আজি কি কৰিম", "আজি কি"]):
            t = "what are we gonna do"
        if any(w in t for w in ["কি কাম", "আজিৰ কাম", "কি কাম আছে"]):
            t = "what do i have to do today"
        t = t.replace("ধন্যবাদ", "thank you").replace("খেলিম", "play game")

    # Manipuri (Meitei) Mappings
    elif l in ["mn", "mni"] or any(c in t for c in ["খুরুমজরি", "কদাইদা", "কানা", "হিদাক", "হাসপাতাল"]):
        t = t.replace("খুরুমজরি", "hello")
        t = t.replace("কদাইদা", "where is").replace("কানা", "who is")
        t = t.replace("হাসপাতাল", "hospital").replace("হিদাক", "medicine")
        if any(w in t for w in ["করিনো তৌগদবা", "করি তৌগনি", "করি তৌসি"]):
            t = "what are we gonna do"
        t = t.replace("শানবা", "play game")

    # Nepali Mappings
    elif l == "ne" or any(c in t for c in ["नमस्ते", "कहाँ", "को हो", "औषधी", "धन्यवाद", "गर्ने", "काम"]):
        t = t.replace("नमस्ते", "hello").replace("कहाँ", "where is").replace("को हो", "who is")
        t = t.replace("औषधी", "medicine").replace("धन्यवाद", "thank you")
        if any(w in t for w in ["के गर्ने", "के गरौँ", "आज के"]):
            t = "what are we gonna do"
        if any(w in t for w in ["के काम", "आजको काम", "काम के छ"]):
            t = "what do i have to do today"

    # Khasi Mappings
    elif l == "kha":
        t = t.replace("khublei", "hello").replace("shano", "where is").replace("mano", "who is")
        t = t.replace("dawai", "medicine").replace("khublei shibun", "thank you")
        if any(w in t for w in ["kaei ngin leh", "ia ngin leh"]):
            t = "what are we gonna do"

    # Mizo Mappings
    elif l in ["lus", "mzo"]:
        t = t.replace("chibai", "hello").replace("khawiah", "where is").replace("tu nge", "who is")
        t = t.replace("damdawi", "medicine").replace("ka lawm e", "thank you")
        if any(w in t for w in ["eng nge kan tih dawn", "eng nge kan tih ang"]):
            t = "what are we gonna do"

    # Kokborok Mappings
    elif l in ["trp", "kok"]:
        t = t.replace("khulumkha", "hello").replace("boba", "where is").replace("sabo", "who is")
        t = t.replace("samano", "medicine").replace("hambai", "thank you")
        if any(w in t for w in ["nung mang khwlai nai", "tini mang"]):
            t = "what are we gonna do"

    # Nagamese Mappings
    elif l == "nag":
        t = t.replace("kene ase", "how are you").replace("ki koribo", "what are we gonna do")
        t = t.replace("dawai", "medicine").replace("dhanyawad", "thank you")
        if any(w in t for w in ["ki koribo mon", "aji ki koribo"]):
            t = "what are we gonna do"

    return t


def extract_intent_and_slots(query: str, db: Session, patient_id: int) -> Tuple[str, Dict[str, Any]]:
    """
    Intelligent Conversational NLU Layer:
    Classifies user intent into conversational, informational, retrieval, or action-based categories.
    Inspects multi-turn conversational context for contextual resolution.
    """
    q = query.lower().strip()
    q_clean = re.sub(r"[^\w\s]", " ", q)
    q_words = q_clean.split()
    ctx = get_conversation_context(patient_id)
    last_intent = ctx.get("last_intent")

    # 1. Multi-turn Follow-up Resolution (Yes / No / Choice / Continue)
    clean_q = q_clean.strip()
    if clean_q in ["yes", "yeah", "sure", "ok", "okay", "yep", "let's do it", "let's do that", "please do", "continue"]:
        if ctx.get("pending_action"):
            return "AFFIRM_PENDING_ACTION", {"action": ctx.get("pending_action")}
        if last_intent in ["CHOOSE_GAME_MEMORY", "CHOOSE_GAME_ATTENTION", "CHOOSE_GAME_PATTERN", "START_GAME", "OFFER_GAME_CHOICE", "GAME_STARTED", "CASUAL_WHAT_TO_DO", "CASUAL_BORED"]:
            return "AFFIRM_PENDING_ACTION", {"action": "NAVIGATE_GAMES"}
        return "AFFIRMATION", {}

    if clean_q in ["no", "not now", "nope", "maybe later", "cancel"]:
        return "DECLINE_PENDING_ACTION", {}

    if last_intent in ["OFFER_GAME_CHOICE", "START_GAME", "CASUAL_WHAT_TO_DO", "CASUAL_BORED"]:
        if any(w in q for w in ["memory", "memories", "match", "card", "cards"]):
            return "CHOOSE_GAME_MEMORY", {}
        if any(w in q for w in ["attention", "focus", "challenge", "quick"]):
            return "CHOOSE_GAME_ATTENTION", {}
        if any(w in q for w in ["pattern", "puzzle", "sequence"]):
            return "CHOOSE_GAME_PATTERN", {}
        if any(w in q for w in ["today", "schedule", "routine", "reminder", "reminders"]):
            return "GET_TODAY_SCHEDULE", {}
        if any(w in q for w in ["photo", "photos", "album", "family"]):
            return "OPEN_MEMORIES", {}

    # 2. Contextual Location Query: "Where did I go with [Person]?"
    if any(p in q for p in ["where did i go with", "place with", "visited with", "trip with"]):
        person_slot = q.replace("where did i go with", "").replace("place with", "").replace("visited with", "").replace("trip with", "").replace("?", "").strip()
        return "CONTEXTUAL_LOCATION_QUERY", {"person_name": person_slot}

    # 3. Person Query: "Who is [Name]?", "Tell me about [Name]", "Do you know [Name]?"
    person_patterns = [
        r"who (is|was) (that )?([a-z\s]+)",
        r"tell me about ([a-z\s]+)",
        r"do you know ([a-z\s]+)",
        r"information on ([a-z\s]+)",
        r"is ([a-z\s]+) my"
    ]
    for pattern in person_patterns:
        match = re.search(pattern, q)
        if match:
            extracted_name = match.group(match.lastindex or 1).strip()
            extracted_name = re.sub(r"\b(fellow|person|guy|relative|member|picture|photo|he|she)\b", "", extracted_name).strip()
            if extracted_name and extracted_name not in ["manas", "you", "i", "we", "this", "that"]:
                return "PERSON_QUERY", {"person_name": extracted_name}

    # Direct name match against patient's enrolled People
    people = db.query(Person).filter(Person.patient_id == patient_id).all()
    for person in people:
        first_name = person.name.split()[0].lower()
        if len(first_name) >= 3 and re.search(rf"\b{re.escape(first_name)}\b", q):
            # Only if not a general verb like "will", "may", etc.
            if first_name not in ["will", "may", "can", "good"]:
                return "PERSON_QUERY", {"person_name": first_name}

    # 4. Location / Place Query: "Where is [Place]?", "Location of [Place]"
    if any(p in q for p in ["where is", "location of", "how to reach", "navigate to", "find my", "where's my", "hospital", "clinic", "pharmacy", "park", "church", "cathedral"]):
        place_slot = q.replace("where is", "").replace("location of", "").replace("how to reach", "").replace("navigate to", "").replace("find my", "").replace("where's", "").replace("my", "").replace("?", "").strip()
        return "GET_PLACE_LOCATION", {"place_term": place_slot}

    # 5. Casual Conversation & "What are we gonna do?"
    what_to_do_phrases = [
        "what are we gonna do", "what are we going to do", "what can we do",
        "what should we do", "what shall we do", "what do we do",
        "what are we doing", "what next", "what's next", "what should i do"
    ]
    if any(p in q for p in what_to_do_phrases):
        return "CASUAL_WHAT_TO_DO", {}

    if any(p in q for p in ["i'm bored", "im bored", "bored", "feeling bored", "nothing to do", "want to do something", "let's do something fun", "let's do something"]):
        return "CASUAL_BORED", {}

    # 6. Greetings & Well-Wishes
    if any(q.startswith(g) or q == g for g in ["hello manas", "hi manas", "hey manas", "hello", "hi", "hey"]):
        # Check if they also asked what to do in same greeting (e.g. "Hello MANAS, what are we gonna do?")
        if any(p in q for p in what_to_do_phrases):
            return "CASUAL_WHAT_TO_DO", {}
        return "GREETING", {}

    if any(g in q for g in ["good morning", "morning"]):
        return "GREETING_MORNING", {}

    if any(g in q for g in ["good afternoon", "good evening"]):
        return "GREETING_EVENING", {}

    if any(g in q for g in ["good night", "sweet dreams", "going to sleep", "sleep time"]):
        return "GOOD_NIGHT", {}

    if any(p in q for p in ["how are you", "how are you doing", "how do you feel", "are you doing well"]):
        return "CASUAL_HOW_ARE_YOU", {}

    if any(p in q for p in ["tell me something", "say something", "tell me a story", "tell me a fact", "tell me something nice", "tell me something pleasant", "tell me something good", "say something nice"]):
        return "CASUAL_NICE_THOUGHT", {}

    if any(p in q for p in ["thank you", "thanks", "thank you so much", "that's nice", "thats nice", "wonderful"]):
        return "GRATITUDE", {}

    # 7. Emotional Support
    if any(p in q for p in ["i'm feeling tired", "im feeling tired", "i feel tired", "feeling exhausted", "i'm tired"]):
        return "EMOTIONAL_TIRED", {}

    if any(p in q for p in ["i feel lonely", "im feeling lonely", "feeling sad", "i am sad", "i feel alone", "i feel down"]):
        return "EMOTIONAL_SUPPORT", {}

    # 8. Help / Capabilities
    if any(p in q for p in ["can you help me", "help me", "what can you do", "who are you", "what is manas", "help"]):
        return "HELP_ASSISTANCE", {}

    # 9. Game / Cognitive Training Requests
    if any(phrase in q for phrase in [
        "let's play a game", "play a game", "play game", "i want to play a game",
        "start a game", "let's play something", "play something", "cognitive game",
        "brain game", "memory game", "attention game", "puzzle"
    ]):
        if "memory" in q:
            return "CHOOSE_GAME_MEMORY", {}
        if "attention" in q:
            return "CHOOSE_GAME_ATTENTION", {}
        return "START_GAME", {}

    # 10. Memories & Photo Album
    if any(phrase in q for phrase in ["memories", "photos", "photo", "family trip", "pictures", "picture", "album", "show photos", "open memories", "my memories", "see memories"]):
        return "OPEN_MEMORIES", {}

    # 11. Family / People I Know
    if any(phrase in q for phrase in ["family", "relatives", "people i know", "who are my family", "show my family", "my relatives"]):
        return "SHOW_PEOPLE", {}

    # 12. Schedule / Routine Query
    if any(phrase in q for phrase in ["do today", "today's schedule", "my routine", "today's tasks", "what tasks", "tasks", "task", "schedule", "what do i have", "today plan", "plan for today"]):
        return "GET_TODAY_SCHEDULE", {}

    # 13. Specific Appointment Query
    if "appointment" in q:
        for r in ["brother", "sister", "son", "daughter", "mother", "father", "friend", "doctor", "physician", "dentist"]:
            if r in q:
                return "APPOINTMENT_QUERY", {"subject": r}
        return "APPOINTMENT_QUERY", {"subject": None}

    # 14. Reminder / Medicine Query
    if any(phrase in q for phrase in ["reminder", "medicine", "hydration", "pill", "pills", "next reminder", "when is my medicine", "what medicine do i have", "medication"]):
        return "GET_NEXT_REMINDER", {}

    # 14. Progress / Assessment
    if any(phrase in q for phrase in ["progress", "assessment", "score", "how am i doing", "brain score", "report"]):
        return "SHOW_PROGRESS", {}

    return "UNKNOWN", {}


def get_warm_time_greeting() -> str:
    hour = datetime.datetime.now().hour
    if hour < 12:
        return "Good morning!"
    elif hour < 17:
        return "Good afternoon!"
    else:
        return "Good evening!"


def localize_response(english_response: str, lang: str) -> str:
    """
    Multilingual response synthesizer for all 9 North-East Indian languages (+ Hindi):
    en (English), as (Assamese), bn (Bengali), kha (Khasi), ne (Nepali),
    lus (Mizo), mni (Meitei/Manipuri), trp (Kokborok), nag (Nagamese), hi (Hindi).
    Returns synchronized localized companion text.
    """
    if not english_response:
        return ""

    l = (lang or "en").lower().strip()
    if l == "en":
        return english_response

    res = english_response

    # 1. Hindi
    if l == "hi":
        res = res.replace("Hello!", "नमस्ते!").replace("Hello ", "नमस्ते ")
        res = res.replace("Good morning!", "शुभ प्रभात!").replace("Good afternoon!", "शुभ दोपहर!").replace("Good evening!", "शुभ संध्या!")
        res = res.replace("Good night!", "शुभ रात्रि!").replace("Good night", "शुभ रात्रि")
        res = res.replace("I'm happy to spend some time with you", "मुझे आपके साथ समय बिताकर बहुत खुशी हो रही है")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "हम एक स्मृति खेल खेल सकते हैं, पारिवारिक यादें देख सकते हैं, या आज की योजना देख सकते हैं")
        res = res.replace("We could play a memory game", "हम एक मेमोरी गेम खेल सकते हैं")
        res = res.replace("look through some family memories", "पारिवारिक यादें देख सकते हैं")
        res = res.replace("check what you have planned for today", "आज की योजना देख सकते हैं")
        res = res.replace("check your schedule", "अपनी दिनचर्या देख सकते हैं")
        res = res.replace("What would you like to do?", "आप क्या करना चाहेंगे?")
        res = res.replace("Let's do something enjoyable together", "चलिए साथ में कुछ अच्छा करते हैं")
        res = res.replace("Which sounds better to you?", "आपको कौन सा बेहतर लगता है?")
        res = res.replace("Great choice! Let's start a memory match game", "बहुत बढ़िया पसंद! चलिए स्मृति खेल शुरू करते हैं")
        res = res.replace("Opening your personal memories album", "आपकी व्यक्तिगत यादों का एल्बम खोल रहे हैं")
        res = res.replace("Here is your plan for today", "आज के लिए आपकी योजना यहाँ है")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "आपका बहुत स्वागत है! मैं हमेशा आपकी मदद के लिए यहाँ हूँ।")
        res = res.replace("You're very welcome", "आपका बहुत स्वागत है")
        res = res.replace("I'm not quite sure what you mean", "मुझे ठीक से समझ नहीं आया")
        res = res.replace("is your", "आपके")
        res = res.replace("located at", "स्थित है")

    # 2. Assamese (as)
    elif l == "as":
        res = res.replace("Hello!", "নমস্কাৰ!").replace("Hello ", "নমস্কাৰ ")
        res = res.replace("Good morning!", "শুভ প্ৰভাত!").replace("Good afternoon!", "শুভ অপৰাহ্ণ!").replace("Good evening!", "শুভ সন্ধিয়া!")
        res = res.replace("Good night!", "শুভ ৰাত্ৰি!").replace("Good night", "শুভ ৰাত্ৰি")
        res = res.replace("I'm happy to spend some time with you", "আপোনাৰ সৈতে সময় কটাই মই বৰ আনন্দিত হৈছোঁ")
        res = res.replace("We could also play a memory game", "আমি এটা স্মৃতি খেলো খেলিব পাৰোঁ")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "আমি এটা স্মৃতি খেল খেলিব পাৰোঁ, পৰিয়ালৰ স্মৃতিবোৰ চাব পাৰোঁ, বা আজিৰ পৰিকল্পনা চাব পাৰোঁ")
        res = res.replace("We could play a memory game", "আমি এটা স্মৃতি খেল খেলিব পাৰোঁ")
        res = res.replace("look through some family memories", "পৰিয়ালৰ পুৰণি ফটো চাব পাৰোঁ")
        res = res.replace("check what you have planned for today", "আজিৰ পৰিকল্পনা চাব পাৰোঁ")
        res = res.replace("check your schedule", "আজিৰ কাৰ্যসূচী চাব পাৰোঁ")
        res = res.replace("What would you like to do?", "আপুনি কি কৰিব বিচাৰে?")
        res = res.replace("Let's do something enjoyable together", "আহক আমি একেলগে কিবা এটা আনন্দদায়ক কাম কৰোঁ")
        res = res.replace("Which sounds better to you?", "আপোনাৰ কোনটো বেছি ভাল লাগিব?")
        res = res.replace("Great choice! Let's start a memory match game", "বৰ ভাল পচন্দ! আহক স্মৃতি খেলখন আৰম্ভ কৰোঁ")
        res = res.replace("Opening your personal memories album", "আপোনাৰ ব্যক্তিগত স্মৃতিৰ এলবামখন খুলি আছোঁ")
        res = res.replace("Here is your plan for today", "আজিৰ বাবে আপোনাৰ কাৰ্যসূচী এইয়া")
        res = res.replace("You have your", "আপোনাৰ")
        res = res.replace("later at", "সময়ত আছে")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "আপোনাক বহুত ধন্যবাদ! মই সদায় আপোনাৰ কাষতেই আছোঁ।")
        res = res.replace("You're very welcome", "আপোনাক বহুত ধন্যবাদ")
        res = res.replace("I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game.", "মই ঠিক বুজিব পৰা নাই। আপুনি আজিৰ কাম, স্মৃতি বা খেলৰ বিষয়ে সুধিব পাৰে।")
        res = res.replace("I'm not quite sure what you mean", "মই ঠিক বুজিব পৰা নাই")
        res = res.replace("is your", "আপোনাৰ")
        res = res.replace("located at", "অৱস্থিত")

    # 3. Bengali (bn)
    elif l == "bn":
        res = res.replace("Hello!", "নমস্কার!").replace("Hello ", "নমস্কার ")
        res = res.replace("Good morning!", "সুপ্রভাত!").replace("Good afternoon!", "শুভ অপরাহ্ন!").replace("Good evening!", "শুভ সন্ধ্যা!")
        res = res.replace("Good night!", "শুভ রাত্রি!").replace("Good night", "শুভ রাত্রি")
        res = res.replace("I'm happy to spend some time with you", "আপনার সাথে সময় কাটাতে পেরে আমার খুব ভালো লাগছে")
        res = res.replace("We could also play a memory game", "আমরা একটি মেমোরি গেমও খেলতে পারি")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "আমরা একটি মেমোরি গেম খেলতে পারি, পরিবারের পুরোনো ছবি দেখতে পারি, বা আজকের সময়সূচি দেখতে পারি")
        res = res.replace("We could play a memory game", "আমরা একটি মেমোরি গেম খেলতে পারি")
        res = res.replace("look through some family memories", "পারিবারিক পুরোনো ছবি দেখতে পারি")
        res = res.replace("check what you have planned for today", "আজকের সময়সূচি দেখতে পারি")
        res = res.replace("check your schedule", "আজকের কাজের তালিকা দেখতে পারি")
        res = res.replace("What would you like to do?", "আপনি কি করতে চান?")
        res = res.replace("Let's do something enjoyable together", "চলুন একসাথে ভালো কিছু একটা করি")
        res = res.replace("Which sounds better to you?", "আপনার কোনটি বেশি ভালো লাগছে?")
        res = res.replace("Great choice! Let's start a memory match game", "দারুণ পছন্দ! চলুন মেমোরি খেলা শুরু করি")
        res = res.replace("Opening your personal memories album", "আপনার ব্যক্তিগত স্মৃতির অ্যালবাম খোলা হচ্ছে")
        res = res.replace("Here is your plan for today", "আজকের জন্য আপনার পরিকল্পনা এখানে রয়েছে")
        res = res.replace("You have your", "আপনার")
        res = res.replace("later at", "সময়ে রয়েছে")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "আপনাকে অনেক ধন্যবাদ! আমি সব সময় আপনার পাশে আছি।")
        res = res.replace("You're very welcome", "আপনাকে অনেক ধন্যবাদ")
        res = res.replace("I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game.", "আমি ঠিক বুঝতে পারছি না। আপনি আজকের কাজের তালিকা, স্মৃতি বা খেলার বিষয়ে জিজ্ঞাসা করতে পারেন।")
        res = res.replace("I'm not quite sure what you mean", "আমি ঠিক বুঝতে পারছি না")
        res = res.replace("is your", "আপনার")
        res = res.replace("located at", "অবস্থিত")

    # 4. Nepali (ne)
    elif l == "ne":
        res = res.replace("Hello!", "नमस्ते!").replace("Hello ", "नमस्ते ")
        res = res.replace("Good morning!", "शुभ प्रभात!").replace("Good afternoon!", "शुभ दिउँसो!").replace("Good evening!", "शुभ सन्ध्या!")
        res = res.replace("Good night!", "शुभ रात्री!").replace("Good night", "शुभ रात्री")
        res = res.replace("I'm happy to spend some time with you", "तपाईंसँग समय बिताउन पाउँदा मलाई खुसी लाग्यो")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "हामी एउटा स्मृति खेल खेल्न सक्छौँ, पारिवारिक सम्झनाहरू हेर्न सक्छौँ, वा आजको तालिका हेर्न सक्छौँ")
        res = res.replace("We could play a memory game", "हामी एउटा मेमोरी खेल खेल्न सक्छौँ")
        res = res.replace("look through some family memories", "पारिवारिक सम्झनाहरू हेर्न सक्छौँ")
        res = res.replace("check what you have planned for today", "आजको तालिका हेर्न सक्छौँ")
        res = res.replace("What would you like to do?", "तपाईं के गर्न चाहनुहुन्छ?")
        res = res.replace("Let's do something enjoyable together", "आउनुहोस् सँगै केही रमाइलो गरौँ")
        res = res.replace("Which sounds better to you?", "तपाईंलाई कुन राम्रो लाग्छ?")
        res = res.replace("Great choice! Let's start a memory match game", "उत्कृष्ट छनौट! आउनुहोस् स्मृति खेल सुरु गरौँ")
        res = res.replace("Opening your personal memories album", "तपाईंको व्यक्तिगत सम्झनाहरूको एल्बम खोल्दै छु")
        res = res.replace("Here is your plan for today", "आजको लागि तपाईंको तालिका यहाँ छ")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "तपाईंलाई धेरै स्वागत छ! म सधैं तपाईंको साथमा छु।")
        res = res.replace("You're very welcome", "तपाईंलाई धेरै स्वागत छ")
        res = res.replace("I'm not quite sure what you mean", "मैले राम्ररी बुझ्न सकिनँ। तपाईं मलाई आजका कामहरू वा खेलबारे सोध्न सक्नुहुन्छ")
        res = res.replace("is your", "तपाईंको")
        res = res.replace("located at", "मा अवस्थित छ")

    # 5. Khasi (kha)
    elif l == "kha":
        res = res.replace("Hello!", "Khublei!").replace("Hello ", "Khublei ")
        res = res.replace("Good morning!", "Khublei mynstep!").replace("Good evening!", "Khublei janmiet!").replace("Good night!", "Khublei miet suk!")
        res = res.replace("I'm happy to spend some time with you", "Sngewbha ban don lang bad phi")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "Ngi lah ban ialehkai jingkynmaw, peit dur kynmaw ka longing, lane peit ia ka jingpynkhreh mynta")
        res = res.replace("What would you like to do?", "Kaei phi kwah ban leh?")
        res = res.replace("Let's do something enjoyable together", "Ia ngin leh kano kano ka jingiasngewbha lang")
        res = res.replace("Opening your personal memories album", "Plie ia ki dur kynmaw jong phi")
        res = res.replace("Here is your plan for today", "Kine ki long ki jingthmu jong phi mynta ka sngi")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "Khublei shibun! Nga don hangne bad phi ha kano kano ka por.")
        res = res.replace("You're very welcome", "Khublei shibun")
        res = res.replace("I'm not quite sure what you mean", "Ngam sngewthuh bha. Phi lah ban kylli shaphang ki kam mynta lane ka longing.")

    # 6. Mizo (lus / mzo)
    elif l in ["lus", "mzo"]:
        res = res.replace("Hello!", "Chibai!").replace("Hello ", "Chibai ")
        res = res.replace("Good morning!", "Chibai zing tha le!").replace("Good evening!", "Chibai tlaizawng!").replace("Good night!", "Mangtha le!")
        res = res.replace("I'm happy to spend some time with you", "I bula awm chu a nuam hle mai")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "Hriatna tichak infiamna kan khel thei a, chhungkaw thlalak kan en thei a, vawiin thil tih tur kan en thei bawk")
        res = res.replace("What would you like to do?", "Eng nge i tih duh le?")
        res = res.replace("Let's do something enjoyable together", "Thil nuam tak i ti dun ang hmiang")
        res = res.replace("Opening your personal memories album", "I thlalak hriatrengte ka hawng e")
        res = res.replace("Here is your plan for today", "Vawiina i thil tih tur chu hengte hi an ni")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "Ka lawm lutuk e! I kiangah ka awm reng e.")
        res = res.replace("You're very welcome", "Ka lawm lutuk e")
        res = res.replace("I'm not quite sure what you mean", "Ka hrethiam chiah lo mai. Vawiin thil tih tur te min zawt thei ang.")

    # 7. Meitei / Manipuri (mni / mn)
    elif l in ["mni", "mn"]:
        res = res.replace("Hello!", "খুরুমজরি!").replace("Hello ", "খুরুমজরি ")
        res = res.replace("Good morning!", "অয়ুক্কী খুরুমজরি!").replace("Good evening!", "নুমিদাংগী খুরুমজরি!").replace("Good night!", "নুমিদাং নুংঙাইনা তুম্মু!")
        res = res.replace("I'm happy to spend some time with you", "নহাক্কা লোয়ননা লৈবসি য়াম্না নুংঙাই")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "ঐখোয় মেমোরী শান্নপোৎ শান্নবা য়াই, ইমুংগী নীংশিংখ্রবশিং য়েংবা য়াই, নত্রগা ঙসিগী থবকশিং য়েংবা য়াই")
        res = res.replace("What would you like to do?", "করি তৌনিংবগে?")
        res = res.replace("Let's do something enjoyable together", "নুংঙাইবা থবক অমা লোয়ননা তৌসি")
        res = res.replace("Opening your personal memories album", "নহাক্কী নীংশিংখ্রবশিংগী অ্যালবাম হাংদোক্লি")
        res = res.replace("Here is your plan for today", "ঙসিগী নহাক্কী থবকশিংদা লৈরিবসি")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "নহাকপু থাগৎচরি! ঐ মতম চুপ্পদা নহাক্কী নাকন্দা লৈগনি।")
        res = res.replace("You're very welcome", "নহাকপু থাগৎচরি")
        res = res.replace("I'm not quite sure what you mean", "ঐ তোপ তোপ্না খংদ্রে। ঙসিগী থবকশিং নত্রগা ইমুংগী মরমদা হংবা য়াগনি।")

    # 8. Kokborok (trp / kok)
    elif l in ["trp", "kok"]:
        res = res.replace("Hello!", "Khulumkha!").replace("Hello ", "Khulumkha ")
        res = res.replace("Good morning!", "Kaham sal!").replace("Good evening!", "Kaham san!").replace("Good night!", "Kaham hor!")
        res = res.replace("I'm happy to spend some time with you", "Nini bisingo tongui kaham lagikha")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "Chini memory khel khwngui manno, nukungni photo naiui manno, de aji mang song naiui manno")
        res = res.replace("What would you like to do?", "Nung mang khwlai nai?")
        res = res.replace("Let's do something enjoyable together", "Kaham samung khorokche khwlai nai")
        res = res.replace("Opening your personal memories album", "Nini swk swngno rwgwi photo khwlai tongo")
        res = res.replace("Here is your plan for today", "Tini nini mang song kiphilmani o")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "Baili hamari! Nini nangmung khe ang salbrum nini sepad tongnai.")
        res = res.replace("You're very welcome", "Baili hamari")
        res = res.replace("I'm not quite sure what you mean", "Ang bujiliya. Tini no mang song, photo, nukung kok swngui manno.")

    # 9. Nagamese (nag)
    elif l == "nag":
        res = res.replace("Hello!", "Hello!").replace("Hello ", "Hello ")
        res = res.replace("Good morning!", "Khushi laga sokal!").replace("Good evening!", "Bhal laga bheli!").replace("Good night!", "Bhal se ghumabi!")
        res = res.replace("I'm happy to spend some time with you", "Apuni logote thakibo mon lagise")
        res = res.replace("We could play a memory game, look through some family memories, or check what you have planned for today", "Ami khan ekta memory game khelibo pare, ghor laga photo sabo pare, nohoile aji ki ase sabo pare")
        res = res.replace("What would you like to do?", "Ki koribo mon ase?")
        res = res.replace("Let's do something enjoyable together", "Ami khan ekloge bhal kam ekta koribo")
        res = res.replace("Opening your personal memories album", "Apuni laga purana photo album khulise")
        res = res.replace("Here is your plan for today", "Aji laga plan kineka ase sabo")
        res = res.replace("You're very welcome! I'm always happy to help you anytime.", "Bhal lagise! Ami sob homoi apuni logote ase.")
        res = res.replace("You're very welcome", "Bhal lagise")
        res = res.replace("I'm not quite sure what you mean", "Ami bujha nai. Aji laga kam, photo, nohoile ghor laga manu kotha kobo pare.")

    return res


def process_voice_query(
    db: Session,
    patient_id: int,
    user_transcript: str,
    requested_language: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main MANAS Conversational & Cognitive Support Pipeline:
    1. Multilingual Normalization
    2. Intent Classification with Multi-Turn Context
    3. Patient-Scoped Database Retrieval
    4. Empathetic Conversational Response Synthesis in Target Language
    5. Action Resolution & Audit Logging
    """
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    session_ctx = get_conversation_context(patient_id)
    
    # Priority: explicit requested_language > active conversation session language > patient profile setting > default "en"
    raw_lang = requested_language or session_ctx.get("language") or (patient.preferred_language if patient and patient.preferred_language else "en")
    lang = (raw_lang or "en").lower().strip()

    # If patient changed language, sync to patient profile
    if requested_language and patient and patient.preferred_language != requested_language:
        patient.preferred_language = requested_language
        try:
            db.commit()
        except Exception:
            db.rollback()

    patient_full_name = patient.user.full_name if (patient and patient.user) else "there"
    first_name = patient_full_name.split()[0] if patient_full_name else "there"

    # Step 1: Normalize & translate transcript
    normalized_query = translate_multilingual_transcript(user_transcript, lang)

    # Step 2: Extract Intent and Slots
    intent, slots = extract_intent_and_slots(normalized_query, db, patient_id)

    res_data: Dict[str, Any] = {}

    # Query patient's active reminders and routines for context synthesis
    today_routines = db.query(Routine).filter(Routine.patient_id == patient_id).all()
    pending_reminders = db.query(Reminder).filter(Reminder.patient_id == patient_id, Reminder.status == "Pending").order_by(Reminder.scheduled_time.asc()).all()
    memories_count = db.query(Memory).filter(Memory.patient_id == patient_id).count()

    # --- 1. CASUAL CONVERSATION: "What are we gonna do?" / "What can we do today?" ---
    if intent == "CASUAL_WHAT_TO_DO":
        options = ["play a memory game", "look through some family memories", "check what you have planned for today"]
        if pending_reminders:
            context_note = f"You have your {pending_reminders[0].title} later at {pending_reminders[0].scheduled_time}."
            speech = f"Hello {first_name}! I'm happy to spend some time with you. {context_note} We could also play a memory game, look through some family memories, or check your schedule. What would you like to do?"
        else:
            speech = f"Hello {first_name}! I'm happy to spend some time with you. We could play a memory game, look through some family memories, or check what you have planned for today. What would you like to do?"

        update_conversation_context(patient_id, "CASUAL_WHAT_TO_DO", "START_GAME", user_transcript, language=lang)
        res_data = {
            "intent": "CASUAL_WHAT_TO_DO",
            "spoken_response": localize_response(speech, lang),
            "action": "OFFER_CHOICES",
            "suggested_screen": "/games"
        }

    # --- 2. BOREDOM: "I'm bored" ---
    elif intent == "CASUAL_BORED":
        speech = f"Let's do something enjoyable together, {first_name}. We could play a quick memory game, or look at your family memories. Which sounds better to you?"
        update_conversation_context(patient_id, "CASUAL_BORED", "START_GAME", user_transcript)
        res_data = {
            "intent": "CASUAL_BORED",
            "spoken_response": localize_response(speech, lang),
            "action": "OFFER_CHOICES",
            "suggested_screen": "/games"
        }

    # --- 3. GREETINGS: "Hello MANAS", "Hi", etc. ---
    elif intent == "GREETING":
        speech = f"Hello {first_name}! It's nice to hear from you. How are you feeling today?"
        update_conversation_context(patient_id, "GREETING", None, user_transcript)
        res_data = {
            "intent": "GREETING",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE",
            "suggested_screen": None
        }

    elif intent == "GREETING_MORNING":
        speech = f"Good morning {first_name}! I hope you're having a peaceful start to the day. Would you like to see what's planned for today?"
        update_conversation_context(patient_id, "GREETING_MORNING", "NAVIGATE_TODAY", user_transcript)
        res_data = {
            "intent": "GREETING_MORNING",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_TODAY",
            "suggested_screen": "/today"
        }

    elif intent == "GREETING_EVENING":
        speech = f"{get_warm_time_greeting()} {first_name}! I hope you've had a gentle day. Would you like to relax with some family memories or check your evening routine?"
        update_conversation_context(patient_id, "GREETING_EVENING", "NAVIGATE_MEMORIES", user_transcript)
        res_data = {
            "intent": "GREETING_EVENING",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE",
            "suggested_screen": None
        }

    elif intent == "GOOD_NIGHT":
        speech = f"Good night {first_name}! Sleep peacefully and rest well. I'll be right here whenever you need me."
        update_conversation_context(patient_id, "GOOD_NIGHT", None, user_transcript)
        res_data = {
            "intent": "GOOD_NIGHT",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE",
            "suggested_screen": None
        }

    elif intent == "CASUAL_HOW_ARE_YOU":
        speech = f"I'm doing very well, thank you for asking! I'm happy to be here supporting you today. How is your day going?"
        update_conversation_context(patient_id, "CASUAL_HOW_ARE_YOU", None, user_transcript)
        res_data = {
            "intent": "CASUAL_HOW_ARE_YOU",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    elif intent == "CASUAL_NICE_THOUGHT":
        speech = f"Here is a pleasant thought: each day brings small moments of comfort. The birds outside and gentle sunshine are with us. Take a slow, calm breath, {first_name}."
        res_data = {
            "intent": "CASUAL_NICE_THOUGHT",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    elif intent == "GRATITUDE":
        speech = f"You're very welcome, {first_name}. I'm always happy to help you anytime."
        update_conversation_context(patient_id, "GRATITUDE", None, user_transcript)
        res_data = {
            "intent": "GRATITUDE",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    # --- 4. EMOTIONAL SUPPORT ---
    elif intent == "EMOTIONAL_TIRED":
        speech = f"Take a comfortable rest, {first_name}. It's important to be gentle with yourself. Would you like to take a short pause and listen to soothing music, or rest your eyes?"
        res_data = {
            "intent": "EMOTIONAL_TIRED",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    elif intent == "EMOTIONAL_SUPPORT":
        speech = f"I'm right here with you, {first_name}. You are safe, and your family cares about you deeply. We can look at some joyful photos of your family whenever you'd like."
        update_conversation_context(patient_id, "EMOTIONAL_SUPPORT", "NAVIGATE_MEMORIES", user_transcript)
        res_data = {
            "intent": "EMOTIONAL_SUPPORT",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_MEMORIES",
            "suggested_screen": "/memories"
        }

    # --- 5. MULTI-TURN RESOLUTION & AFFIRMATIONS ---
    elif intent == "AFFIRM_PENDING_ACTION":
        pending_act = slots.get("action") or "START_GAME"
        if pending_act == "NAVIGATE_TODAY":
            speech = f"Opening your daily plan for today, {first_name}."
            screen = "/today"
        elif pending_act == "NAVIGATE_MEMORIES":
            speech = f"Opening your personal memories album, {first_name}."
            screen = "/memories"
        else:
            speech = f"Great! Let's start the activity right away."
            screen = "/games"

        update_conversation_context(patient_id, "AFFIRMED", None, user_transcript)
        res_data = {
            "intent": "AFFIRM_PENDING_ACTION",
            "spoken_response": localize_response(speech, lang),
            "action": pending_act,
            "suggested_screen": screen
        }

    elif intent == "DECLINE_PENDING_ACTION":
        speech = f"No problem at all, {first_name}. Let me know whenever you'd like to do something else."
        update_conversation_context(patient_id, "DECLINED", None, user_transcript)
        res_data = {
            "intent": "DECLINE_PENDING_ACTION",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    elif intent == "AFFIRMATION":
        speech = f"Wonderful, {first_name}. I'm right here with you."
        res_data = {
            "intent": "AFFIRMATION",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    elif intent == "CHOOSE_GAME_MEMORY":
        speech = "Great choice! Let's start a memory match game to keep our neural pathways sharp."
        update_conversation_context(patient_id, "CHOOSE_GAME_MEMORY", "NAVIGATE_GAMES", user_transcript)
        res_data = {
            "intent": "CHOOSE_GAME_MEMORY",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_GAMES",
            "suggested_screen": "/games"
        }

    elif intent == "CHOOSE_GAME_ATTENTION":
        speech = "Excellent! Let's do a quick attention challenge together."
        update_conversation_context(patient_id, "GAME_STARTED", None, user_transcript)
        res_data = {
            "intent": "CHOOSE_GAME_ATTENTION",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_GAMES",
            "suggested_screen": "/games"
        }

    elif intent == "CHOOSE_GAME_PATTERN":
        speech = "Great! Opening pattern recognition puzzles for you."
        update_conversation_context(patient_id, "GAME_STARTED", None, user_transcript)
        res_data = {
            "intent": "CHOOSE_GAME_PATTERN",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_GAMES",
            "suggested_screen": "/games"
        }

    # --- 6. START GAME REQUEST ---
    elif intent == "START_GAME":
        speech = "Sure! Would you like to try a memory game or an attention game?"
        update_conversation_context(patient_id, "OFFER_GAME_CHOICE", "START_GAME", user_transcript)
        res_data = {
            "intent": "START_GAME",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_GAMES",
            "suggested_screen": "/games"
        }

    # --- 7. OPEN MEMORIES ---
    elif intent == "OPEN_MEMORIES":
        speech = f"Opening your personal memories album. You have {memories_count} saved memories."
        update_conversation_context(patient_id, "OPEN_MEMORIES", None, user_transcript)
        res_data = {
            "intent": "OPEN_MEMORIES",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_MEMORIES",
            "suggested_screen": "/memories"
        }

    # --- 8. SHOW PEOPLE ---
    elif intent == "SHOW_PEOPLE":
        speech = "Opening 'People I Know' so you can see your family members and loved ones."
        update_conversation_context(patient_id, "SHOW_PEOPLE", None, user_transcript)
        res_data = {
            "intent": "SHOW_PEOPLE",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_PEOPLE",
            "suggested_screen": "/people"
        }

    # --- 9. GET TODAY SCHEDULE ---
    elif intent == "GET_TODAY_SCHEDULE":
        if not today_routines and not pending_reminders:
            speech = f"Good day, {first_name}. You have no pending activities scheduled for today."
        else:
            routine_parts = [f"{r.time_of_day} {r.title}" for r in today_routines[:3]]
            routine_text = ", ".join(routine_parts) if routine_parts else "Rest & leisure"
            speech = f"Here is your plan for today, {first_name}: {routine_text}."
            if pending_reminders:
                speech += f" You also have a reminder for {pending_reminders[0].title} scheduled at {pending_reminders[0].scheduled_time}."

        update_conversation_context(patient_id, "GET_TODAY_SCHEDULE", None, user_transcript)
        res_data = {
            "intent": "GET_TODAY_SCHEDULE",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_TODAY",
            "suggested_screen": "/today"
        }

    # --- 9.5. SPECIFIC APPOINTMENT QUERY ---
    elif intent == "APPOINTMENT_QUERY":
        subject = slots.get("subject")
        if subject:
            speech = f"I don't have an appointment time for your {subject}."
        else:
            speech = "I don't have that information yet. Your caregiver can add it."
        res_data = {
            "intent": "APPOINTMENT_QUERY",
            "spoken_response": localize_response(speech, lang),
            "action": "NONE"
        }

    # --- 10. GET NEXT REMINDER ---
    elif intent == "GET_NEXT_REMINDER":
        reminder = pending_reminders[0] if pending_reminders else None
        if reminder:
            speech = f"Your next reminder is for {reminder.title} scheduled at {reminder.scheduled_time}."
            res_data = {
                "intent": "GET_NEXT_REMINDER",
                "spoken_response": localize_response(speech, lang),
                "action": "NAVIGATE_REMINDERS",
                "reminder": {
                    "title": reminder.title,
                    "time": reminder.scheduled_time,
                    "category": reminder.category
                }
            }
        else:
            speech = "You don't have any pending reminders right now. All caught up!"
            res_data = {
                "intent": "GET_NEXT_REMINDER_EMPTY",
                "spoken_response": localize_response(speech, lang),
                "action": "NONE"
            }

    # --- 11. PERSON QUERY (Strict Patient Scoping & Zero-Hallucination) ---
    elif intent == "PERSON_QUERY":
        search_name = slots.get("person_name", "").strip()
        person = db.query(Person).filter(
            Person.patient_id == patient_id,
            Person.is_active != False,
            Person.name.ilike(f"%{search_name}%")
        ).first()

        if person:
            note_part = f" {person.notes}" if person.notes else ""
            speech = f"{person.name} is your {person.relationship}.{note_part}"
            res_data = {
                "intent": "PERSON_QUERY",
                "spoken_response": localize_response(speech, lang),
                "action": "SHOW_PERSON",
                "person": {
                    "id": person.id,
                    "name": person.name,
                    "relationship": person.relationship,
                    "photo_url": person.photo_url
                }
            }
        else:
            speech = f"I don't have information about {search_name.capitalize()}. Your caregiver can add it." if search_name else "I don't have that information yet. Your caregiver can add it."
            res_data = {
                "intent": "PERSON_QUERY_NOT_FOUND",
                "spoken_response": localize_response(speech, lang),
                "action": "NAVIGATE_PEOPLE"
            }

    # --- 12. GET PLACE LOCATION ---
    elif intent == "GET_PLACE_LOCATION":
        search_term = slots.get("place_term", "").strip().lower()
        places = db.query(Place).filter(Place.patient_id == patient_id).all()
        matched_place = None

        for p in places:
            if search_term and (search_term in p.name.lower() or search_term in p.category.lower() or p.category.lower() in search_term):
                matched_place = p
                break

        # Fallback to hospital or first place if searching for hospital/clinic
        if not matched_place and any(h in search_term for h in ["hospital", "clinic", "doctor"]):
            for p in places:
                if any(h in p.name.lower() or h in p.category.lower() for h in ["hospital", "clinic", "health", "medical"]):
                    matched_place = p
                    break

        if not matched_place and places and not search_term:
            matched_place = places[0]

        if matched_place:
            speech = f"Your {matched_place.category.lower()} is {matched_place.name}, located at {matched_place.address}."
            res_data = {
                "intent": "GET_PLACE_LOCATION",
                "spoken_response": localize_response(speech, lang),
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
        else:
            speech = "I don't have that information yet. Your caregiver can add it."
            res_data = {
                "intent": "GET_PLACE_LOCATION_NOT_FOUND",
                "spoken_response": localize_response(speech, lang),
                "action": "NAVIGATE_PLACES"
            }

    # --- 13. CONTEXTUAL LOCATION QUERY ---
    elif intent == "CONTEXTUAL_LOCATION_QUERY":
        search_person = slots.get("person_name", "")
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

            res_data = {
                "intent": "CONTEXTUAL_LOCATION_QUERY",
                "spoken_response": localize_response(speech, lang),
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
        else:
            speech = "I don't have that information yet. Your caregiver can add it."
            res_data = {
                "intent": "CONTEXTUAL_LOCATION_NOT_FOUND",
                "spoken_response": localize_response(speech, lang),
                "action": "NAVIGATE_MEMORIES"
            }

    # --- 14. SHOW PROGRESS ---
    elif intent == "SHOW_PROGRESS":
        speech = f"Opening your cognitive training progress and wellness assessment, {first_name}."
        res_data = {
            "intent": "SHOW_PROGRESS",
            "spoken_response": localize_response(speech, lang),
            "action": "NAVIGATE_ASSESSMENT",
            "suggested_screen": "/assessment"
        }

    # --- 15. HELP / CAPABILITIES ---
    elif intent == "HELP_ASSISTANCE":
        speech = f"I'm MANAS, your cognitive memory companion. I can help you check today's reminders, view family memories, find saved places, or play brain training games."
        res_data = {
            "intent": "HELP_ASSISTANCE",
            "spoken_response": localize_response(speech, lang),
            "action": "HELP_GUIDANCE"
        }

    # --- 16. GENUINE UNKNOWN FALLBACK (Never "I don't have specific information about it") ---
    else:
        speech = "I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game."
        res_data = {
            "intent": "UNKNOWN",
            "spoken_response": localize_response(speech, lang),
            "action": "HELP_GUIDANCE"
        }

    # Step 5: Persist VoiceInteraction Log to Database
    try:
        interaction = VoiceInteraction(
            patient_id=patient_id,
            transcript=user_transcript,
            intent=res_data.get("intent", "UNKNOWN"),
            assistant_response=res_data.get("spoken_response", "")
        )
        db.add(interaction)
        db.commit()
    except Exception as e:
        db.rollback()
    res_data["text_response"] = res_data.get("spoken_response", "")
    res_data["language"] = lang

    return res_data
