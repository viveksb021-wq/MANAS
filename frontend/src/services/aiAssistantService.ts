/**
 * MANAS AI Assistant Conversational Service
 * 
 * Provides dual-engine intelligence:
 * 1. Live Google Gemini AI (via VITE_GEMINI_API_KEY or in-app custom key)
 * 2. High-Capability Built-in Smart Engine (zero key required, works offline & on Vercel)
 * 
 * Capable of executing commands (navigating to screens, fetching schedules,
 * answering family and place queries) and holding real-world compassionate conversations.
 */

import { getLanguageDetails, normalizeLanguageCode } from '../config/languages';

export interface AiAssistantQueryContext {
  patientName: string;
  patientAge?: number;
  language?: string;
  familyMembers?: Array<{ id?: string; name: string; relationship: string; notes?: string }>;
  routines?: Array<{ id?: number; time: string; title: string; completed: boolean; description?: string }>;
  places?: Array<{ id?: number; name: string; category: string; address?: string; notes?: string }>;
  memories?: Array<{ id?: number; title: string; description: string; place?: string; memory_date?: string }>;
}

export interface AiAssistantResponse {
  spoken_response: string;
  text_response: string;
  action?: 'NAVIGATE_GAMES' | 'NAVIGATE_TODAY' | 'SHOW_PEOPLE' | 'SHOW_PLACES' | 'NAVIGATE_MEMORIES' | 'SHOW_ASSESSMENT' | 'NAVIGATE_HOME' | 'NONE';
  suggested_screen?: string | null;
  source: 'gemini' | 'smart_engine';
  action_label?: string;
}

const STORAGE_KEY_GEMINI = 'manas_gemini_api_key';

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  const local = localStorage.getItem(STORAGE_KEY_GEMINI);
  if (local && local.trim()) return local.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key || !key.trim()) {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
  } else {
    localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  }
}

export function hasActiveGeminiKey(): boolean {
  return Boolean(getStoredGeminiKey());
}

/**
 * Clean and normalize text for regex matching
 */
function cleanQuery(query: string): string {
  return query.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Pick a random item from array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const JOKES = [
  "Why did the scarecrow win an award? Because he was outstanding in his field! 😄",
  "Why do birds fly south for winter? Because walking would take way too long! 😄",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why don't scientists trust atoms? Because they make up everything! ⚛️",
  "What is orange and sounds like a parrot? A carrot! 🥕",
  "Why did the bicycle collapse? Because it was two-tired! 🚲"
];

const STORIES = [
  "Once, an old gardener planted a mango sapling. His neighbor asked, 'You are old, will you ever eat its fruit?' The gardener smiled and said, 'All my life I ate mangoes from trees planted by others. Today I plant for those who come tomorrow.' A life shared with love is never forgotten.",
  "In the quiet hills of Shillong, morning mist danced among the tall pine trees. The birds began their chorus just as the first sunbeam warmed the dewdrops on the leaves. Nature reminds us every single morning that each day is a brand new, beautiful beginning."
];

/**
 * Built-in Smart Engine: Handles commands, schedule queries, family info,
 * chitchat, and emotional support without requiring an external backend or API key.
 */
function processWithSmartEngine(queryText: string, context: AiAssistantQueryContext): AiAssistantResponse {
  const q = cleanQuery(queryText);
  const rawQ = queryText.trim();
  const pName = context.patientName || 'friend';
  const family = context.familyMembers || [];
  const routines = context.routines || [];
  const places = context.places || [];
  const memories = context.memories || [];

  // 1. COMMAND: PLAY GAMES / BRAIN TRAINING
  if (
    q.includes('game') ||
    q.includes('play') ||
    q.includes('puzzle') ||
    q.includes('brain train') ||
    q.includes('memory match') ||
    q.includes('word recall') ||
    q.includes('have fun') ||
    q.includes('something to do') ||
    q.includes('bored') ||
    q.includes('play and train')
  ) {
    return {
      spoken_response: `Let's play a game, ${pName}! Brain training games keep your mind active and sharp. I'm opening the Games hub for you right now.`,
      text_response: `Let's play a game, ${pName}! Brain training games keep your mind active and sharp. Opening Games...`,
      action: 'NAVIGATE_GAMES',
      suggested_screen: 'games',
      source: 'smart_engine',
      action_label: 'Opening Games 🎮'
    };
  }

  // 2. COMMAND: TODAY'S SCHEDULE / ROUTINE / MEDICINE
  if (
    q.includes('today') ||
    q.includes('schedule') ||
    q.includes('routine') ||
    q.includes('medicine') ||
    q.includes('tablet') ||
    q.includes('pill') ||
    q.includes('bp') ||
    q.includes('what do i have') ||
    q.includes('plan for today') ||
    q.includes('tasks') ||
    q.includes('what to do')
  ) {
    let routineSummary = '';
    if (routines.length > 0) {
      const itemsText = routines.slice(0, 3).map(r => `${r.time}: ${r.title}${r.completed ? ' (completed)' : ''}`).join(', ');
      routineSummary = `Here is your schedule for today: ${itemsText}.`;
    } else {
      routineSummary = "You are all set for today with morning tea and scheduled rest periods.";
    }

    return {
      spoken_response: `${routineSummary} Let's open your daily schedule so you can see every detail.`,
      text_response: `${routineSummary} Opening your Today's Schedule...`,
      action: 'NAVIGATE_TODAY',
      suggested_screen: 'today',
      source: 'smart_engine',
      action_label: "Opening Today's Schedule 📅"
    };
  }

  // 3. COMMAND: MEMORIES & PHOTOS
  if (
    q.includes('memory') ||
    q.includes('memories') ||
    q.includes('photo') ||
    q.includes('picture') ||
    q.includes('trip') ||
    q.includes('vacation') ||
    q.includes('album') ||
    q.includes('shillong peak') ||
    q.includes('bihu')
  ) {
    let memDetail = '';
    if (memories.length > 0) {
      const firstMem = memories[0];
      memDetail = `You have cherished memories saved, like '${firstMem.title}'.`;
    }
    return {
      spoken_response: `Looking back at wonderful times brings such warmth. ${memDetail} I am opening your memory album now.`,
      text_response: `Looking back at wonderful times brings such warmth. ${memDetail} Opening My Memories...`,
      action: 'NAVIGATE_MEMORIES',
      suggested_screen: 'memories',
      source: 'smart_engine',
      action_label: 'Opening Memories 📸'
    };
  }

  // 4. COMMAND: PLACES & HOSPITAL
  if (
    q.includes('hospital') ||
    q.includes('clinic') ||
    q.includes('doctor') ||
    q.includes('where is my hospital') ||
    q.includes('where do i live') ||
    q.includes('home address') ||
    q.includes('places') ||
    q.includes('map') ||
    q.includes('directions') ||
    q.includes('where am i')
  ) {
    const hosp = places.find(p => p.name.toLowerCase().includes('hospital') || p.category.toLowerCase().includes('medical')) || {
      name: 'Shillong Medical Centre',
      address: 'Laitumkhrah, Shillong'
    };
    return {
      spoken_response: `Your designated medical hospital is ${hosp.name}, located at ${hosp.address}. Let me take you to your Places map.`,
      text_response: `Your hospital is ${hosp.name}, located at ${hosp.address}. Opening Places I Know...`,
      action: 'SHOW_PLACES',
      suggested_screen: 'places',
      source: 'smart_engine',
      action_label: 'Opening Places 📍'
    };
  }

  // 5. COMMAND: FAMILY & PEOPLE
  // Check if asking about a specific person
  for (const member of family) {
    const memName = member.name.toLowerCase();
    const rel = member.relationship.toLowerCase();
    const firstWord = memName.split(' ')[0];

    if (q.includes(memName) || (firstWord.length > 2 && q.includes(firstWord)) || q.includes(rel)) {
      return {
        spoken_response: `${member.name} is your ${member.relationship}. ${member.notes || ''} Let's look at their photo in People I Know.`,
        text_response: `${member.name} is your ${member.relationship}. ${member.notes || ''}`,
        action: 'SHOW_PEOPLE',
        suggested_screen: 'people',
        source: 'smart_engine',
        action_label: `Viewing ${member.name} 👥`
      };
    }
  }

  if (q.includes('family') || q.includes('people') || q.includes('who is in my family') || q.includes('contacts')) {
    const names = family.slice(0, 4).map(m => `${m.name} (${m.relationship})`).join(', ');
    return {
      spoken_response: `Here are some of your loved ones: ${names}. Opening your family album now.`,
      text_response: `Here are some of your loved ones: ${names}. Opening People I Know...`,
      action: 'SHOW_PEOPLE',
      suggested_screen: 'people',
      source: 'smart_engine',
      action_label: 'Opening People 👥'
    };
  }

  // 6. COMMAND: COGNITIVE ASSESSMENT
  if (q.includes('assessment') || q.includes('score') || q.includes('test') || q.includes('check memory')) {
    return {
      spoken_response: "Opening your Cognitive Assessment dashboard where you can check your memory and daily engagement scores.",
      text_response: "Opening Cognitive Assessment...",
      action: 'SHOW_ASSESSMENT',
      suggested_screen: 'assessment',
      source: 'smart_engine',
      action_label: 'Opening Assessment 📊'
    };
  }

  // 7. COMMAND: GO HOME
  if (q.includes('go home') || q.includes('main screen') || q.includes('home page') || q.includes('back home')) {
    return {
      spoken_response: `Taking you back to your home screen, ${pName}.`,
      text_response: `Navigating to Home...`,
      action: 'NAVIGATE_HOME',
      suggested_screen: 'home',
      source: 'smart_engine',
      action_label: 'Going Home 🏠'
    };
  }

  // 8. ENTERTAINMENT: JOKES
  if (q.includes('joke') || q.includes('funny') || q.includes('laugh') || q.includes('make me smile')) {
    const joke = randomChoice(JOKES);
    return {
      spoken_response: `Here is one for you: ${joke}`,
      text_response: joke,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  // 9. ENTERTAINMENT: STORIES
  if (q.includes('story') || q.includes('tell me something') || q.includes('poem')) {
    const story = randomChoice(STORIES);
    return {
      spoken_response: story,
      text_response: story,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  // 10. TIME AND DATE
  if (q.includes('time') || q.includes('what time') || q.includes('clock')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      spoken_response: `It is currently ${timeStr}, ${pName}.`,
      text_response: `The current time is ${timeStr}.`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('date') || q.includes('what day') || q.includes('today date') || q.includes('day is it')) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return {
      spoken_response: `Today is ${dateStr}.`,
      text_response: `Today is ${dateStr}.`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  // 11. EMOTIONAL & EMPATHETIC SUPPORT
  if (q.includes('lonely') || q.includes('alone') || q.includes('nobody') || q.includes('miss my')) {
    return {
      spoken_response: `I am right here beside you, ${pName}. You are never alone. Your family loves you so much, and Ravi calls every day. Would you like to view some family photos or play a fun game together?`,
      text_response: `I am right here beside you, ${pName}. You are never alone. Your family loves you dearly. Would you like to view some family photos or play a fun game together?`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('sad') || q.includes('unhappy') || q.includes('crying') || q.includes('depressed') || q.includes('down')) {
    return {
      spoken_response: `I hear you, ${pName}. It's okay to feel sad sometimes. Take a gentle, slow breath. You are completely safe, and I'm right here with you. Can I tell you a lighthearted joke or show your favorite memories?`,
      text_response: `I hear you, ${pName}. Take a gentle, slow breath. You are safe, and I am right here with you.`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('confused') || q.includes('forgot') || q.includes('lost') || q.includes('dont know') || q.includes('scared')) {
    return {
      spoken_response: `Take it easy, ${pName}. That is completely normal, and there is no rush at all. You are safe at home in Shillong. I am MANAS, your companion. Just ask me anything you need, and I'll find it for you.`,
      text_response: `Take it easy, ${pName}. You are safe at home. I am MANAS, your personal companion. What would you like to check?`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('happy') || q.includes('good') || q.includes('great') || q.includes('wonderful') || q.includes('fine')) {
    return {
      spoken_response: `Hearing that makes my day so bright, ${pName}! It is wonderful to spend time with you when your spirits are high. What shall we explore together next?`,
      text_response: `Hearing that makes my day so bright, ${pName}! It's wonderful to spend time with you.`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  // 12. GREETINGS & CHITCHAT
  if (q.includes('hello') || q.includes('hi manas') || q.startsWith('hi ') || q === 'hi' || q.includes('hey')) {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    return {
      spoken_response: `${timeGreeting}, ${pName}! I'm MANAS, listening and ready to help. You can tell me to open games, check your schedule, find family, or just chat with me.`,
      text_response: `${timeGreeting}, ${pName}! I'm listening. Ask me about your schedule, memories, games, or ask me any question!`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('thank you') || q.includes('thanks') || q.includes('dhanyawad') || q.includes('khublei')) {
    return {
      spoken_response: `You are so very welcome, ${pName}! I'm always right here whenever you need a hand.`,
      text_response: `You're very welcome, ${pName}! Always happy to help.`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('who are you') || q.includes('what are you') || q.includes('what can you do')) {
    return {
      spoken_response: `I am MANAS, your personal AI companion. I can speak with you, remind you of your daily routine and medicines, tell you about your family, show your cherished photos, and play memory games!`,
      text_response: `I am MANAS, your personal AI companion. I can help with routines, family, memories, games, or everyday conversation!`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  if (q.includes('how are you') || q.includes('how do you do')) {
    return {
      spoken_response: `I'm doing wonderful, thank you for asking! I'm delighted to be here with you today, ${pName}. How is your day going?`,
      text_response: `I'm doing wonderful, thank you for asking! How is your day going, ${pName}?`,
      action: 'NONE',
      source: 'smart_engine'
    };
  }

  // 13. DYNAMIC GENERAL CONVERSATION FALLBACK
  // Rather than repeating the exact same greeting, acknowledge their thought and offer proactive dialogue
  const conversationalLead = [
    `I hear you! Regarding "${rawQ}", I'm right here with you. Would you like me to open your daily plan, check your family album, or would you like to play a game?`,
    `That's an interesting thought, ${pName}. As your companion, I'm always happy to talk about it, or we can check what's next on your daily routine.`,
    `I understand you're asking about "${rawQ}". We can explore this together, check your schedule, or play a cognitive memory puzzle if you'd like!`
  ];

  return {
    spoken_response: randomChoice(conversationalLead),
    text_response: `Regarding "${rawQ}": I'm here to help with your activities, schedule, family, memories, or everyday conversation.`,
    action: 'NONE',
    source: 'smart_engine'
  };
}

/**
 * Live Google Gemini AI Call
 */
async function callGeminiApi(
  queryText: string,
  context: AiAssistantQueryContext,
  apiKey: string
): Promise<AiAssistantResponse> {
  const pName = context.patientName || 'friend';
  const normLang = normalizeLanguageCode(context.language);
  const langDetails = getLanguageDetails(normLang);

  const familyList = (context.familyMembers || []).map(m => `${m.name} (${m.relationship}): ${m.notes || ''}`).join('; ');
  const routineList = (context.routines || []).map(r => `${r.time} - ${r.title} [${r.completed ? 'Done' : 'Pending'}]`).join('; ');
  const placeList = (context.places || []).map(p => `${p.name} (${p.category}): ${p.address || ''}`).join('; ');

  const systemInstruction = `
You are MANAS, an empathetic, warm, and highly supportive AI voice companion for elderly patients in India living with mild cognitive impairment or dementia.
Patient Name: ${pName}
Patient Age: ${context.patientAge || 74}
Preferred Language: ${langDetails.name} (${langDetails.native})
Known Family Members: ${familyList || 'None listed'}
Today's Scheduled Routines: ${routineList || 'None listed'}
Saved Places & Hospitals: ${placeList || 'None listed'}

Rules:
1. Speak in a respectful, warm, reassuring, and dignified tone (like a devoted, caring nurse or family member).
2. Keep responses brief (1 to 3 sentences maximum) so they sound natural when read out loud by text-to-speech.
3. Be clear and direct. Never make the patient feel confused or embarrassed about memory lapses.
4. If the user commands or asks to do an in-app action, include an action tag at the very end of your reply in brackets like: [ACTION: {"action": "<ACTION_NAME>", "screen": "<SCREEN_NAME>"}]
Valid actions:
- NAVIGATE_GAMES (screen: "games") -> for games, puzzles, play
- NAVIGATE_TODAY (screen: "today") -> for schedule, routine, medicines
- SHOW_PEOPLE (screen: "people") -> for family members, contacts
- SHOW_PLACES (screen: "places") -> for hospital, address, places, directions
- NAVIGATE_MEMORIES (screen: "memories") -> for memories, photos, past trips
- SHOW_ASSESSMENT (screen: "assessment") -> for memory tests, assessments
- NAVIGATE_HOME (screen: "home") -> for home, main screen
If no action is needed, omit the [ACTION: ...] tag.
`.trim();

  // Call Gemini REST API directly from browser
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemInstruction}\n\nUser said: "${queryText}"`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawText.trim()) {
    throw new Error('Empty response from Gemini');
  }

  // Parse [ACTION: {...}] tag if present
  let cleanText = rawText;
  let action: AiAssistantResponse['action'] = 'NONE';
  let suggestedScreen: string | null = null;
  let actionLabel: string | undefined = undefined;

  const actionMatch = rawText.match(/\[ACTION:\s*(\{.*?\})\s*\]/i);
  if (actionMatch && actionMatch[1]) {
    try {
      const parsedAction = JSON.parse(actionMatch[1]);
      action = parsedAction.action;
      suggestedScreen = parsedAction.screen;
      cleanText = rawText.replace(actionMatch[0], '').trim();

      if (action === 'NAVIGATE_GAMES') actionLabel = 'Opening Games 🎮';
      else if (action === 'NAVIGATE_TODAY') actionLabel = "Opening Today's Schedule 📅";
      else if (action === 'SHOW_PEOPLE') actionLabel = 'Opening Family Album 👥';
      else if (action === 'SHOW_PLACES') actionLabel = 'Opening Places 📍';
      else if (action === 'NAVIGATE_MEMORIES') actionLabel = 'Opening Memories 📸';
      else if (action === 'SHOW_ASSESSMENT') actionLabel = 'Opening Assessment 📊';
      else if (action === 'NAVIGATE_HOME') actionLabel = 'Going Home 🏠';
    } catch (e) {
      cleanText = rawText.replace(/\[ACTION:.*?\]/gi, '').trim();
    }
  }

  return {
    spoken_response: cleanText,
    text_response: cleanText,
    action,
    suggested_screen: suggestedScreen,
    source: 'gemini',
    action_label: actionLabel
  };
}

/**
 * Main Query Processing Gateway
 * Tries Google Gemini API first if configured; seamlessly falls back to Smart Engine.
 */
export async function processAiQuery(
  queryText: string,
  context: AiAssistantQueryContext
): Promise<AiAssistantResponse> {
  const geminiKey = getStoredGeminiKey();

  if (geminiKey) {
    try {
      const geminiRes = await callGeminiApi(queryText, context, geminiKey);
      return geminiRes;
    } catch (err) {
      console.warn('[MANAS AI] Gemini API call failed, falling back to Smart Engine:', err);
    }
  }

  // Seamless fallback to Smart Engine
  return processWithSmartEngine(queryText, context);
}
