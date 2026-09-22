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
 * Multilingual transcript normalizer for regional Indian queries
 */
function translateMultilingualTranscript(transcript: string, lang: string = 'en'): string {
  if (!transcript) return '';
  let t = transcript.toLowerCase().trim();
  const l = (lang || 'en').toLowerCase();

  if (l === 'hi' || /[\u0900-\u097F]/.test(t)) {
    t = t.replace(/नमस्ते|प्रणाम|नमस्कार/g, 'hello')
         .replace(/क्या करें|क्या करेंगे/g, 'what should we do')
         .replace(/अस्पताल/g, 'hospital').replace(/दवाई|दवा/g, 'medicine').replace(/तस्वीरें|फोटो/g, 'photos').replace(/खेल/g, 'game')
         .replace(/आज क्या करना है|आज का काम/g, 'what do i have to do today').replace(/यादें/g, 'memories')
         .replace(/शुक्रिया|धन्यवाद/g, 'thank you');
  } else if (l === 'bn' || /[\u0980-\u09FF]/.test(t)) {
    t = t.replace(/নমস্কার|হ্যালো/g, 'hello')
         .replace(/কে/g, 'who is').replace(/কোথায়|কোথা/g, 'where is').replace(/হাসপাতাল/g, 'hospital')
         .replace(/ওষুধ/g, 'medicine').replace(/ছবি/g, 'photos').replace(/খেলা|খেল/g, 'game')
         .replace(/আজকে কি কাজ|কি কাজ আছে|কি কাজ|আজ কি কাজ|আজকে কাজ|কাজ আছে/g, 'what do i have to do today')
         .replace(/ধন্যবাদ/g, 'thank you')
         .replace(/আমরা কি করব|কি করব|কি করা যায়/g, 'what are we gonna do');
  } else if (l === 'as') {
    t = t.replace(/নমস্কাৰ|হেল্ল'/g, 'hello')
         .replace(/ক’ত|কত/g, 'where is').replace(/কোন/g, 'who is')
         .replace(/চিকিৎসালয়|চিকিৎসালয়/g, 'hospital').replace(/দৰৱ/g, 'medicine')
         .replace(/কি কৰিম|কি কৰিব|আজি কি কৰিম|আজি কি/g, 'what are we gonna do')
         .replace(/কি কাম|আজিৰ কাম|কি কাম আছে/g, 'what do i have to do today')
         .replace(/ধন্যবাদ/g, 'thank you').replace(/খেলিম|খেলোঁ/g, 'play game')
         .replace(/স্মৃতি/g, 'memories');
  } else if (l === 'kha') {
    t = t.replace(/khublei/g, 'hello').replace(/shano/g, 'where is').replace(/mano/g, 'who is')
         .replace(/dawai/g, 'medicine').replace(/khublei shibun/g, 'thank you')
         .replace(/kaei ngin leh|ia ngin leh/g, 'what are we gonna do')
         .replace(/ialehkai/g, 'game').replace(/jingkynmaw/g, 'memories');
  } else if (l === 'lus' || l === 'mzo') {
    t = t.replace(/chibai/g, 'hello').replace(/khawiah/g, 'where is').replace(/tu nge/g, 'who is')
         .replace(/damdawi/g, 'medicine').replace(/ka lawm e/g, 'thank you')
         .replace(/eng nge kan tih dawn|eng nge kan tih ang/g, 'what are we gonna do')
         .replace(/infiamna/g, 'game').replace(/hriatreng/g, 'memories');
  } else if (l === 'mni' || l === 'mn') {
    t = t.replace(/খুরুমজরি/g, 'hello').replace(/কদাইদা/g, 'where is').replace(/কানা/g, 'who is')
         .replace(/হাসপাতাল/g, 'hospital').replace(/হিদাক/g, 'medicine')
         .replace(/করিনো তৌগদবা|করি তৌগনি|করি তৌসি/g, 'what are we gonna do')
         .replace(/শানবা|শান্নসি/g, 'play game').replace(/নীংশিংখ্রব/g, 'memories');
  } else if (l === 'trp' || l === 'kok') {
    t = t.replace(/khulumkha/g, 'hello').replace(/boba|baha/g, 'where is').replace(/sabo/g, 'who is')
         .replace(/samano/g, 'medicine').replace(/hambai/g, 'thank you')
         .replace(/khel/g, 'game');
  } else if (l === 'nag') {
    t = t.replace(/kene ase/g, 'how are you').replace(/ki koribo/g, 'what are we gonna do')
         .replace(/dawai/g, 'medicine').replace(/dhanyawad/g, 'thank you')
         .replace(/game/g, 'game').replace(/purana/g, 'memories');
  }

  return t;
}

/**
 * Localizes spoken and text output into the patient's selected language
 */
export function localizeSmartEngineResponse(text: string, lang: string = 'en'): string {
  if (!text) return '';
  const l = (lang || 'en').toLowerCase().trim();
  if (l === 'en') return text;

  let res = text;

  if (l === 'hi') {
    res = res.replace(/Hello!|Hello /g, 'नमस्ते! ')
             .replace(/Good morning/g, 'शुभ प्रभात').replace(/Good afternoon/g, 'शुभ दोपहर').replace(/Good evening/g, 'शुभ संध्या')
             .replace(/Let's play a game/g, 'चलिए एक खेल खेलते हैं')
             .replace(/Brain training games keep your mind active and sharp/g, 'मस्तिष्क प्रशिक्षण खेल आपके दिमाग को सक्रिय और तेज रखते हैं')
             .replace(/I'm opening the Games hub for you right now/g, 'मैं आपके लिए खेल पृष्ठ खोल रहा हूँ')
             .replace(/Opening Games\.\.\./g, 'खेल खोले जा रहे हैं...')
             .replace(/Here is your schedule for today:/g, 'आज की आपकी समय-सारणी यहाँ है:')
             .replace(/Let's open your daily schedule so you can see every detail/g, 'चलिए आज की समय-सारणी खोलते हैं ताकि आप सब देख सकें')
             .replace(/Opening your Today's Schedule\.\.\./g, 'आज की दिनचर्या खोली जा रही है...')
             .replace(/You are all set for today with morning tea and scheduled rest periods\./g, 'आज के लिए सुबह की चाय और विश्राम का समय निर्धारित है।')
             .replace(/Looking back at wonderful times brings such warmth/g, 'पुरानी यादों को देखना मन को बहुत शांति देता है')
             .replace(/I am opening your memory album now\./g, 'मैं आपका स्मृति एल्बम खोल रहा हूँ।')
             .replace(/Opening My Memories\.\.\./g, 'यादों का एल्बम खोला जा रहा है...')
             .replace(/Your medical clinic is/g, 'आपका क्लिनिक है')
             .replace(/located at/g, 'यहाँ स्थित है:')
             .replace(/Let me take you to your Places map\./g, 'मैं आपको सुरक्षित स्थानों के मानचित्र पर ले चलता हूँ।')
             .replace(/Opening Places I Know\.\.\./g, 'स्थान पृष्ठ खोला जा रहा है...')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'मेरे पास अभी यह जानकारी नहीं है। आपके देखभालकर्ता इसे जोड़ सकते हैं।')
             .replace(/is your/g, 'आपके')
             .replace(/Let's look at their photo in People I Know\./g, 'चलिए उनकी तस्वीर देखते हैं।')
             .replace(/Here are some of your loved ones:/g, 'ये आपके प्रियजन हैं:')
             .replace(/Opening your family album now\./g, 'परिवार का एल्बम खोला जा रहा है।')
             .replace(/Opening People I Know\.\.\./g, 'परिचित व्यक्तियों का पृष्ठ खोला जा रहा है...')
             .replace(/Taking you back to your home screen,/g, 'आपको मुख्य पृष्ठ पर वापस ले जाया जा रहा है,')
             .replace(/Navigating to Home\.\.\./g, 'मुख्य पृष्ठ पर जा रहे हैं...')
             .replace(/I am right here beside you/g, 'मैं हमेशा आपके साथ यहीं हूँ')
             .replace(/You are never alone\. Your loved ones care about you deeply\./g, 'आप कभी अकेले नहीं हैं। आपके प्रियजन आपसे बहुत स्नेह करते हैं।')
             .replace(/I'm MANAS, listening and ready to help\./g, 'मैं मानस हूँ, सुन रहा हूँ और आपकी सहायता के लिए तैयार हूँ।')
             .replace(/You are so very welcome/g, 'आपका बहुत-बहुत स्वागत है')
             .replace(/I'm always right here whenever you need a hand\./g, 'जब भी आपको जरूरत हो, मैं हमेशा आपके साथ हूँ।')
             .replace(/I am MANAS, your personal AI companion\./g, 'मैं मानस हूँ, आपका व्यक्तिगत साथी।')
             .replace(/I'm doing wonderful, thank you for asking!/g, 'मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद!');
  } else if (l === 'as') {
    res = res.replace(/Hello!|Hello /g, 'নমস্কাৰ! ')
             .replace(/Good morning/g, 'শুভ প্ৰভাত').replace(/Good afternoon/g, 'শুভ অপৰাহ্ণ').replace(/Good evening/g, 'শুভ সন্ধিয়া')
             .replace(/Let's play a game/g, 'আহক আমি এটা খেল খেলোঁ')
             .replace(/Brain training games keep your mind active and sharp/g, 'মস্তিষ্কৰ খেলবোৰে আপোনাৰ মনটো সক্ৰিয় আৰু সতেজ কৰি ৰাখে')
             .replace(/I'm opening the Games hub for you right now/g, 'মই এতিয়াই আপোনাৰ বাবে খেলৰ পৃষ্ঠাটো খুলিছোঁ')
             .replace(/Opening Games\.\.\./g, 'খেল খোলা হৈছে...')
             .replace(/Here is your schedule for today:/g, 'আজিৰ বাবে আপোনাৰ কাৰ্যসূচী এইয়া:')
             .replace(/Let's open your daily schedule so you can see every detail/g, 'আহক আপোনাৰ দিনটোৰ কাৰ্যসূচীখন খোলি চাওঁ')
             .replace(/Opening your Today's Schedule\.\.\./g, 'আজিৰ কাৰ্যসূচী খোলা হৈছে...')
             .replace(/You are all set for today with morning tea and scheduled rest periods\./g, 'ৰাতিপুৱাৰ চাহ আৰু জিৰণিৰ সৈতে আজিৰ দিনটোৰ বাবে আপুনি সম্পূৰ্ণ প্ৰস্তুত।')
             .replace(/Looking back at wonderful times brings such warmth/g, 'পুৰণি স্মৃতিবোৰ সোঁৱৰিলে মনটো বৰ আনন্দিত হৈ পৰে')
             .replace(/I am opening your memory album now\./g, 'মই আপোনাৰ স্মৃতিৰ এলবামখন খুলি আছোঁ।')
             .replace(/Opening My Memories\.\.\./g, 'মোৰ স্মৃতি খোলা হৈছে...')
             .replace(/Your medical clinic is/g, 'আপোনাৰ চিকিৎসালয় হৈছে')
             .replace(/located at/g, 'অৱস্থিত:')
             .replace(/Let me take you to your Places map\./g, 'মই আপোনাক স্থানৰ মানচিত্ৰখন দেখুৱাই দিওঁ।')
             .replace(/Opening Places I Know\.\.\./g, 'স্থান পৃষ্ঠা খোলা হৈছে...')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'মোৰ হাতত এতিয়া এই তথ্য নাই। আপোনাৰ সহায়কজনে ইয়াক যোগ কৰিব পাৰিব।')
             .replace(/is your/g, 'আপোনাৰ')
             .replace(/Let's look at their photo in People I Know\./g, 'আহক আমি তেওঁলোকৰ ছবিখন চাওঁ।')
             .replace(/Here are some of your loved ones:/g, 'এওঁলোক আপোনাৰ আপোনজন:')
             .replace(/Opening your family album now\./g, 'পৰিয়ালৰ এলবামখন খোলা হৈছে।')
             .replace(/Opening People I Know\.\.\./g, 'মই জনা মানুহৰ পৃষ্ঠা খোলা হৈছে...')
             .replace(/Taking you back to your home screen,/g, 'আপোনাক মূল পৃষ্ঠালৈ লৈ যোৱা হৈছে,')
             .replace(/Navigating to Home\.\.\./g, 'মূল পৃষ্ঠালৈ যোৱা হৈছে...')
             .replace(/I am right here beside you/g, 'মই সদায় আপোনাৰ কাষতেই আছোঁ')
             .replace(/You are never alone\. Your loved ones care about you deeply\./g, 'আপুনি কেতিয়াও অকলশৰীয়া নহয়। আপোনাৰ আপোনজনে আপোনাক বহুত মৰম কৰে।')
             .replace(/I'm MANAS, listening and ready to help\./g, 'মই মানস, শুনি আছোঁ আৰু সহায় কৰিবলৈ সাজু।')
             .replace(/You are so very welcome/g, 'আপোনাক বহুত ধন্যবাদ')
             .replace(/I'm always right here whenever you need a hand\./g, 'যেতিয়াই প্ৰয়োজন হয়, মই সদায় আপোনাৰ কাষতেই আছোঁ।')
             .replace(/I am MANAS, your personal AI companion\./g, 'মই মানস, আপোনাৰ ব্যক্তিগত সহায়কাৰী।')
             .replace(/I'm doing wonderful, thank you for asking!/g, 'মই বহুত ভাল আছোঁ, সোধাৰ বাবে ধন্যবাদ!');
  } else if (l === 'bn') {
    res = res.replace(/Hello!|Hello /g, 'নমস্কার! ')
             .replace(/Good morning/g, 'সুপ্রভাত').replace(/Good afternoon/g, 'শুভ অপরাহ্ন').replace(/Good evening/g, 'শুভ সন্ধ্যা')
             .replace(/Let's play a game/g, 'চলুন একটি খেলা খেলি')
             .replace(/Brain training games keep your mind active and sharp/g, 'ব্রেন গেম আপনার মনকে সক্রিয় ও সতেজ রাখে')
             .replace(/I'm opening the Games hub for you right now/g, 'আমি আপনার জন্য গেমসের পাতা খুলছি')
             .replace(/Opening Games\.\.\./g, 'খেলা খোলা হচ্ছে...')
             .replace(/Here is your schedule for today:/g, 'আজকের জন্য আপনার সময়সূচি:')
             .replace(/Let's open your daily schedule so you can see every detail/g, 'চলুন আজকের কাজের তালিকা দেখি')
             .replace(/Opening your Today's Schedule\.\.\./g, 'আজকের তালিকা খোলা হচ্ছে...')
             .replace(/Looking back at wonderful times brings such warmth/g, 'পুরোনো স্মৃতিগুলো দেখলে মনে প্রশান্তি আসে')
             .replace(/I am opening your memory album now\./g, 'আমি আপনার স্মৃতির অ্যালবাম খুলছি।')
             .replace(/Opening My Memories\.\.\./g, 'আমার স্মৃতি খোলা হচ্ছে...')
             .replace(/Your medical clinic is/g, 'আপনার ক্লিনিক হলো')
             .replace(/located at/g, 'অবস্থিত:')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'আমার কাছে এখনও এই তথ্যটি নেই। আপনার পরিচর্যাকারী এটি যোগ করতে পারেন।')
             .replace(/is your/g, 'আপনার')
             .replace(/Here are some of your loved ones:/g, 'এখানে আপনার প্রিয়জনরা রয়েছেন:')
             .replace(/Opening People I Know\.\.\./g, 'পরিচিত ব্যক্তিদের পাতা খোলা হচ্ছে...')
             .replace(/Taking you back to your home screen,/g, 'আপনাকে মূল পর্দায় ফিরিয়ে নিয়ে যাচ্ছি,')
             .replace(/I am right here beside you/g, 'আমি সবসময় আপনার পাশেই আছি')
             .replace(/You are so very welcome/g, 'আপনাকে অনেক অনেক ধন্যবাদ')
             .replace(/I'm MANAS, listening and ready to help\./g, 'আমি মানস, শুনছি এবং সাহায্য করতে প্রস্তুত।');
  } else if (l === 'ne') {
    res = res.replace(/Hello!|Hello /g, 'नमस्ते! ')
             .replace(/Good morning/g, 'शुभ प्रभात').replace(/Good afternoon/g, 'शुभ दिउँसो').replace(/Good evening/g, 'शुभ सन्ध्या')
             .replace(/Let's play a game/g, 'आउनुहोस् एउटा खेल खेलौँ')
             .replace(/I'm opening the Games hub for you right now/g, 'म अहिले नै खेलहरूको पृष्ठ खोल्दैछु')
             .replace(/Opening Games\.\.\./g, 'खेल खुल्दैछ...')
             .replace(/Here is your schedule for today:/g, 'आजको लागि तपाईंको तालिका:')
             .replace(/I am opening your memory album now\./g, 'म तपाईंको सम्झनाहरूको एल्बम खोल्दैछु।')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'मसँग अहिले यो जानकारी छैन। तपाईंको हेरचाहकर्ताले यो थप्न सक्नुहुन्छ।')
             .replace(/is your/g, 'तपाईंको')
             .replace(/Taking you back to your home screen,/g, 'तपाईंलाई गृहपृष्ठमा लैजाँदै छु,')
             .replace(/I am right here beside you/g, 'म सधैं तपाईंको साथमा छु')
             .replace(/You are so very welcome/g, 'तपाईंलाई धेरै स्वागत छ')
             .replace(/I'm MANAS, listening and ready to help\./g, 'म मानस हुँ, सुन्दै छु र मद्दत गर्न तयार छु।');
  } else if (l === 'kha') {
    res = res.replace(/Hello!|Hello /g, 'Khublei! ')
             .replace(/Good morning/g, 'Khublei mynstep').replace(/Good evening/g, 'Khublei janmiet')
             .replace(/Let's play a game/g, 'Ia ngin ia ialehkai')
             .replace(/Opening Games\.\.\./g, 'Plie ia ki jingialehkai...')
             .replace(/Here is your schedule for today:/g, 'Kine ki long ki kam jong phi mynta:')
             .replace(/I am opening your memory album now\./g, 'Plie ia ki dur kynmaw jong phi.')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'Ngam pat don ia kane ka jingtip. U nongap jong phi un sa thep.')
             .replace(/I am right here beside you/g, 'Nga don hangne lang bad phi')
             .replace(/You are so very welcome/g, 'Khublei shibun')
             .replace(/I'm MANAS, listening and ready to help\./g, 'Nga dei u MANAS, nga sngap bad kloi ban iarap.');
  } else if (l === 'lus' || l === 'mzo') {
    res = res.replace(/Hello!|Hello /g, 'Chibai! ')
             .replace(/Good morning/g, 'Chibai zing tha le').replace(/Good evening/g, 'Chibai tlaizawng')
             .replace(/Let's play a game/g, 'Infiamna i khel ang hmiang')
             .replace(/Opening Games\.\.\./g, 'Infiamna ka hawng e...')
             .replace(/Here is your schedule for today:/g, 'Vawiina i thil tih turte:')
             .replace(/I am opening your memory album now\./g, 'I thlalak hriatrengte ka hawng e.')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'He thu hi ka la nei lo. I enkawltu in a la dah ang.')
             .replace(/I am right here beside you/g, 'I kiangah ka awm reng e')
             .replace(/You are so very welcome/g, 'Ka lawm lutuk e')
             .replace(/I'm MANAS, listening and ready to help\./g, 'MANAS ka ni a, puih che ka inpeih reng e.');
  } else if (l === 'mni' || l === 'mn') {
    res = res.replace(/Hello!|Hello /g, 'খুরুমজরি! ')
             .replace(/Good morning/g, 'অয়ুক্কী খুরুমজরি').replace(/Good evening/g, 'নুমিদাংগী খুরুমজরি')
             .replace(/Let's play a game/g, 'শান্নপোৎ অমা শান্নসি')
             .replace(/Opening Games\.\.\./g, 'শান্নপোৎ হাংদোক্লি...')
             .replace(/Here is your schedule for today:/g, 'ঙসিগী নহাক্কী থবকশিংদা লৈরিবসি:')
             .replace(/I am opening your memory album now\./g, 'নহাক্কী নীংশিংখ্রবশিংগী অ্যালবাম হাংদোক্লি।')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'ঐঙোন্দা থবকসিগী মরমদা খংদ্রে। নহাক্কী মীনা হাপচিনবা য়াগনি।')
             .replace(/I am right here beside you/g, 'ঐ মতম চুপ্পদা নহাক্কী নাকন্দা লৈগনি')
             .replace(/You are so very welcome/g, 'নহাকপু থাগৎচরি')
             .replace(/I'm MANAS, listening and ready to help\./g, 'ঐ মানসনি, নহাকপু মতেং পাংনবা শেম-শাদুনা লৈরি।');
  } else if (l === 'trp' || l === 'kok') {
    res = res.replace(/Hello!|Hello /g, 'Khulumkha! ')
             .replace(/Good morning/g, 'Kahwk sal').replace(/Good evening/g, 'Kaham san')
             .replace(/Let's play a game/g, 'Khorokche khel khwnglai')
             .replace(/Opening Games\.\.\./g, 'Khel khwngmani...')
             .replace(/Here is your schedule for today:/g, 'Tini nini mang song:')
             .replace(/I am opening your memory album now\./g, 'Nini photo album khulise.')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'Abo kok ang rwgwi manliya.')
             .replace(/I am right here beside you/g, 'Ang salbrum nini sepad tongnai')
             .replace(/You are so very welcome/g, 'Baili hamari');
  } else if (l === 'nag') {
    res = res.replace(/Hello!|Hello /g, 'Hello! ')
             .replace(/Good morning/g, 'Khushi laga sokal').replace(/Good evening/g, 'Bhal laga bheli')
             .replace(/Let's play a game/g, 'Ekta game khelibo ahibi')
             .replace(/Opening Games\.\.\./g, 'Game khulise...')
             .replace(/Here is your schedule for today:/g, 'Aji laga schedule:')
             .replace(/I am opening your memory album now\./g, 'Photo album khulise.')
             .replace(/I don't have that information yet\. Your caregiver can add it\./g, 'Etu kotha ami nathake. Guardian ke kobidibo.')
             .replace(/I am right here beside you/g, 'Ami sob homoi apuni logote ase')
             .replace(/You are so very welcome/g, 'Bhal lagise');
  }

  return res;
}

/**
 * Built-in Smart Engine: Handles commands, schedule queries, family info,
 * chitchat, and emotional support without requiring an external backend or API key.
 */
function processWithSmartEngine(queryText: string, context: AiAssistantQueryContext): AiAssistantResponse {
  const normLang = normalizeLanguageCode(context.language);
  const normalizedTranscript = translateMultilingualTranscript(queryText, normLang);
  const q = cleanQuery(normalizedTranscript);
  const rawQ = queryText.trim();
  const pName = context.patientName || 'friend';
  const family = context.familyMembers || [];
  const routines = context.routines || [];
  const places = context.places || [];
  const memories = context.memories || [];

  const finalize = (raw: {
    spoken_response: string;
    text_response: string;
    action?: AiAssistantResponse['action'];
    suggested_screen?: string | null;
    source: 'smart_engine';
    action_label?: string;
  }): AiAssistantResponse => ({
    ...raw,
    spoken_response: localizeSmartEngineResponse(raw.spoken_response, normLang),
    text_response: localizeSmartEngineResponse(raw.text_response, normLang)
  });

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
    return finalize({
      spoken_response: `Let's play a game, ${pName}! Brain training games keep your mind active and sharp. I'm opening the Games hub for you right now.`,
      text_response: `Let's play a game, ${pName}! Brain training games keep your mind active and sharp. Opening Games...`,
      action: 'NAVIGATE_GAMES',
      suggested_screen: 'games',
      source: 'smart_engine',
      action_label: 'Opening Games 🎮'
    });
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
    q.includes('album')
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
    q.includes('where is my home') ||
    q.includes('places') ||
    q.includes('map') ||
    q.includes('directions') ||
    q.includes('where am i') ||
    q.startsWith('where is')
  ) {
    if (q.includes('home') || q.includes('live')) {
      const homePlace = places.find(p => p.category.toLowerCase() === 'home' || p.name.toLowerCase().includes('home'));
      if (homePlace) {
        return {
          spoken_response: `Your home is ${homePlace.name}, located at ${homePlace.address || 'your saved residence'}.`,
          text_response: `Your home is ${homePlace.name}, located at ${homePlace.address || ''}.`,
          action: 'SHOW_PLACES',
          suggested_screen: 'places',
          source: 'smart_engine',
          action_label: 'Opening Places 📍'
        };
      } else {
        return {
          spoken_response: "I don't have that information yet. Your caregiver can add it.",
          text_response: "I don't have that information yet. Your caregiver can add it.",
          action: 'SHOW_PLACES',
          suggested_screen: 'places',
          source: 'smart_engine'
        };
      }
    }

    const hosp = places.find(p => p.name.toLowerCase().includes('hospital') || p.category.toLowerCase().includes('medical') || p.category.toLowerCase().includes('clinic'));
    if (hosp) {
      return {
        spoken_response: `Your medical clinic is ${hosp.name}, located at ${hosp.address || 'your saved location'}. Let me take you to your Places map.`,
        text_response: `Your clinic is ${hosp.name}, located at ${hosp.address || ''}. Opening Places I Know...`,
        action: 'SHOW_PLACES',
        suggested_screen: 'places',
        source: 'smart_engine',
        action_label: 'Opening Places 📍'
      };
    }

    if (q.includes('hospital') || q.includes('clinic') || q.includes('doctor') || q.startsWith('where is')) {
      return {
        spoken_response: "I don't have that information yet. Your caregiver can add it.",
        text_response: "I don't have that information yet. Your caregiver can add it.",
        action: 'SHOW_PLACES',
        suggested_screen: 'places',
        source: 'smart_engine'
      };
    }

    if (places.length > 0) {
      return {
        spoken_response: `You have ${places.length} saved places in your directory. Opening your Places map.`,
        text_response: `Opening your saved places...`,
        action: 'SHOW_PLACES',
        suggested_screen: 'places',
        source: 'smart_engine',
        action_label: 'Opening Places 📍'
      };
    } else {
      return {
        spoken_response: "I don't have that information yet. Your caregiver can add it.",
        text_response: "I don't have that information yet. Your caregiver can add it.",
        action: 'SHOW_PLACES',
        suggested_screen: 'places',
        source: 'smart_engine'
      };
    }
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

  if (q.startsWith('who is') || q.startsWith('who s') || q.includes('who is my')) {
    return {
      spoken_response: "I don't have that information yet. Your caregiver can add it.",
      text_response: "I don't have that information yet. Your caregiver can add it.",
      action: 'SHOW_PEOPLE',
      suggested_screen: 'people',
      source: 'smart_engine'
    };
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
      spoken_response: `I am right here beside you, ${pName}. You are never alone. Your loved ones care about you deeply. Would you like to view some family photos or play a fun game together?`,
      text_response: `I am right here beside you, ${pName}. You are never alone. Your loved ones care about you deeply. Would you like to view some family photos or play a fun game together?`,
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
      spoken_response: `Take it easy, ${pName}. That is completely normal, and there is no rush at all. You are safe. I am MANAS, your companion. Just ask me anything you need, and I'll find it for you.`,
      text_response: `Take it easy, ${pName}. You are safe. I am MANAS, your personal companion. What would you like to check?`,
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

5. ZERO-HALLUCINATION POLICY: You ONLY know the specific family members, routines, and places explicitly listed in the Known Family Members, Today's Scheduled Routines, and Saved Places above. If the user asks about a family member, relative, place, memory, or appointment that is NOT listed, you MUST reply: "I don't have that information yet. Your caregiver can add it." Never hallucinate, guess, or invent any relatives, places, or events.
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
 * Tries Google Gemini API first if configured; attempts Backend Voice AI (/api/voice/ask);
 * seamlessly falls back to client-side Smart Engine.
 */
export async function processAiQuery(
  queryText: string,
  context: AiAssistantQueryContext
): Promise<AiAssistantResponse> {
  const geminiKey = getStoredGeminiKey();

  // 1. Live Google Gemini API (if user provided key)
  if (geminiKey) {
    try {
      const geminiRes = await callGeminiApi(queryText, context, geminiKey);
      return geminiRes;
    } catch (err) {
      console.warn('[MANAS AI] Gemini API call failed, attempting backend/smart engine:', err);
    }
  }

  // 2. Backend Conversational AI Endpoint (/api/voice/ask)
  try {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('manas_access_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/voice/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transcript: queryText,
        language: context.language || 'en'
      })
    });

    if (res.ok) {
      const bData = await res.json();
      const answer = bData.assistant_response || bData.spoken_response;
      if (answer) {
        let actionLabel = undefined;
        if (bData.action === 'NAVIGATE_GAMES') actionLabel = 'Opening Games 🎮';
        else if (bData.action === 'NAVIGATE_TODAY') actionLabel = "Opening Today's Schedule 📅";
        else if (bData.action === 'SHOW_PEOPLE') actionLabel = 'Opening Family Album 👥';
        else if (bData.action === 'SHOW_PLACES') actionLabel = 'Opening Places 📍';
        else if (bData.action === 'NAVIGATE_MEMORIES') actionLabel = 'Opening Memories 📸';
        else if (bData.action === 'SHOW_ASSESSMENT') actionLabel = 'Opening Assessment 📊';
        else if (bData.action === 'NAVIGATE_HOME') actionLabel = 'Going Home 🏠';

        const normLang = normalizeLanguageCode(context.language);
        const localizedAnswer = localizeSmartEngineResponse(answer, normLang);

        return {
          spoken_response: localizedAnswer,
          text_response: localizedAnswer,
          action: bData.action || 'NONE',
          suggested_screen: bData.suggested_screen || null,
          source: 'smart_engine',
          action_label: actionLabel
        };
      }
    }
  } catch (err) {
    // Offline or server unavailable - fallback cleanly to client-side smart engine
  }

  // 3. Client-Side Smart Engine
  const normLang = normalizeLanguageCode(context.language);
  const res = processWithSmartEngine(queryText, context);
  return {
    ...res,
    spoken_response: localizeSmartEngineResponse(res.spoken_response, normLang),
    text_response: localizeSmartEngineResponse(res.text_response, normLang)
  };
}
