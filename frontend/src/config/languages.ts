/**
 * MANAS Authoritative Language Configuration
 * Single source of truth for all supported regional and national languages.
 * Covers 9 North-East Indian languages with honest capability tracking.
 */

export type LanguageCode =
  | 'en'   // English
  | 'as'   // Assamese
  | 'bn'   // Bengali
  | 'kha'  // Khasi
  | 'ne'   // Nepali
  | 'lus'  // Mizo (ISO 639-2 lus / mzo)
  | 'mni'  // Meitei / Manipuri (ISO 639-3 mni / mn)
  | 'trp'  // Kokborok (ISO 639-3 trp / kok)
  | 'nag'  // Nagamese
  // Backwards-compatible aliases
  | 'mzo'
  | 'mn'
  | 'kok'
  | 'hi';

export interface SupportedLanguage {
  id: LanguageCode;
  code: LanguageCode; // Alias for backward compatibility
  name: string;
  label: string;      // Alias for backward compatibility
  native: string;
  locale: string;
  speechLocale: string;
  fallbackLocale?: string;
}

export interface LanguageCapabilities {
  textSupported: boolean;
  sttSupported: boolean;
  ttsSupported: boolean;
  matchedVoiceName?: string;
  notice?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: 'en',
    code: 'en',
    name: 'English',
    label: 'English',
    native: 'English',
    locale: 'en-IN',
    speechLocale: 'en-IN',
    fallbackLocale: 'en-US'
  },
  {
    id: 'as',
    code: 'as',
    name: 'Assamese',
    label: 'Assamese',
    native: 'অসমীয়া',
    locale: 'as-IN',
    speechLocale: 'as-IN',
    fallbackLocale: 'as-IN'
  },
  {
    id: 'bn',
    code: 'bn',
    name: 'Bengali',
    label: 'Bengali',
    native: 'বাংলা',
    locale: 'bn-IN',
    speechLocale: 'bn-IN',
    fallbackLocale: 'bn-IN'
  },
  {
    id: 'kha',
    code: 'kha',
    name: 'Khasi',
    label: 'Khasi',
    native: 'Ka Ktien Khasi',
    locale: 'kha',
    speechLocale: 'kha',
    fallbackLocale: 'kha'
  },
  {
    id: 'ne',
    code: 'ne',
    name: 'Nepali',
    label: 'Nepali',
    native: 'नेपाली',
    locale: 'ne-NP',
    speechLocale: 'ne-NP',
    fallbackLocale: 'ne-NP'
  },
  {
    id: 'lus',
    code: 'lus',
    name: 'Mizo',
    label: 'Mizo',
    native: 'Mizo ṭawng',
    locale: 'lus',
    speechLocale: 'lus',
    fallbackLocale: 'lus'
  },
  {
    id: 'mni',
    code: 'mni',
    name: 'Meitei / Manipuri',
    label: 'Meitei / Manipuri',
    native: 'মৈতৈ / ꯃꯤꯇꯩ',
    locale: 'mni',
    speechLocale: 'mni',
    fallbackLocale: 'mni-IN'
  },
  {
    id: 'trp',
    code: 'trp',
    name: 'Kokborok',
    label: 'Kokborok',
    native: 'ককবরক',
    locale: 'trp',
    speechLocale: 'trp',
    fallbackLocale: 'trp'
  },
  {
    id: 'nag',
    code: 'nag',
    name: 'Nagamese',
    label: 'Nagamese',
    native: 'Nagamese',
    locale: 'nag',
    speechLocale: 'nag',
    fallbackLocale: 'nag'
  }
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Normalizes alias codes (e.g. 'mzo' -> 'lus', 'mn' -> 'mni', 'kok' -> 'trp')
 */
export function normalizeLanguageCode(code: string | null | undefined): LanguageCode {
  if (!code) return DEFAULT_LANGUAGE;
  const lower = code.toLowerCase().trim();
  if (lower === 'mzo') return 'lus';
  if (lower === 'mn') return 'mni';
  if (lower === 'kok') return 'trp';

  const match = SUPPORTED_LANGUAGES.find(l => l.id === lower || l.code === lower);
  return match ? match.id : DEFAULT_LANGUAGE;
}

/**
 * Retrieves full language metadata by code
 */
export function getLanguageDetails(code: string | null | undefined): SupportedLanguage {
  const norm = normalizeLanguageCode(code);
  return SUPPORTED_LANGUAGES.find(l => l.id === norm) || SUPPORTED_LANGUAGES[0];
}

/**
 * Returns the best BCP-47 speech recognition/synthesis locale for a given language code
 */
export function getSpeechLocaleForLanguage(code: string | null | undefined): string {
  const details = getLanguageDetails(code);
  return details.speechLocale || 'en-IN';
}

/**
 * Checks honest device TTS capability for the target language.
 * Never fakes support or maps unrelated voices to regional languages.
 */
export function checkTTSCapability(langCode: string | null | undefined): {
  available: boolean;
  voice: SpeechSynthesisVoice | null;
  message?: string;
} {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return {
      available: false,
      voice: null,
      message: 'Speech synthesis is not supported on this browser.'
    };
  }

  const details = getLanguageDetails(langCode);
  const targetPrefix = details.id.toLowerCase();
  const targetLocale = (details.speechLocale || '').toLowerCase();
  const fallbackLocale = (details.fallbackLocale || '').toLowerCase();

  let voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    // Retry once if voices haven't populated yet
    return {
      available: false,
      voice: null,
      message: `Voice for ${details.name} is currently loading or unavailable on this device.`
    };
  }

  // Find genuine voice matching target locale or prefix (e.g. "as-IN", "as", "bn-IN", "bn", "ne-NP", "ne", "en-IN", "en-US")
  let matchedVoice = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const vName = (v.name || '').toLowerCase();
    
    // Direct locale match
    if (vLang === targetLocale || (fallbackLocale && vLang === fallbackLocale)) return true;

    // ISO prefix match e.g. "bn" matches "bn-BD", "bn-IN"
    const vPrefix = vLang.split(/[-_]/)[0];
    if (vPrefix === targetPrefix) return true;

    // Direct name match e.g. "Bengali", "Assamese", "Nepali"
    if (vName.includes(details.name.toLowerCase())) return true;

    return false;
  }) || null;

  // For English, if no exact regional voice matched, accept any English voice or default voice
  if (!matchedVoice && targetPrefix === 'en') {
    matchedVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
  }

  if (matchedVoice) {
    return {
      available: true,
      voice: matchedVoice
    };
  }

  return {
    available: false,
    voice: null,
    message: `Voice for ${details.name} is currently unavailable on this device. MANAS will continue in ${details.name} text.`
  };
}

/**
 * Centralized Prompt and Interaction Localization Dictionary for all 9 NER languages.
 * Provides instant synchronization for companion prompts, greetings, and offline responses.
 */
export const LOCALIZED_AI_STRINGS: Record<string, Record<string, string>> = {
  quick_prompt_today: {
    en: "What do I have today?",
    as: "আজি মোৰ কি কি কাম আছে?",
    bn: "আজ আমার কি কি কাজ আছে?",
    kha: "Kaei nga don mynta ka sngi?",
    ne: "आज मेरो के के काम छ?",
    lus: "Vawiinah eng nge ka tih dawn?",
    mni: "ঙসি ঐগী করি থবক লৈবগে?",
    trp: "Tini aini mang song tongo?",
    nag: "Aji ki ase amikhe?"
  },
  quick_prompt_person: {
    en: "Who is Arun?",
    as: "অৰুণ কোন হয়?",
    bn: "অরুণ কে হয়?",
    kha: "Uei u Arun?",
    ne: "अरुण को हुन्?",
    lus: "Arun-a chu tunge?",
    mni: "অরুন হায়বসি কনানো?",
    trp: "Arun khorokche sabo?",
    nag: "Arun kun ase?"
  },
  quick_prompt_hospital: {
    en: "Where is the hospital?",
    as: "হাস্পাতালখন ক'ত আছে?",
    bn: "হাসপাতাল কোথায় অবস্থিত?",
    kha: "Hangno ka hospital?",
    ne: "अस्पताल कहाँ छ?",
    lus: "Damdawi in chu khawiah nge?",
    mni: "হোসপিতাল কদাইদা লৈবগে?",
    trp: "Hospital baha tongo?",
    nag: "Hospital kote ase?"
  },
  quick_prompt_memories: {
    en: "Show my memories",
    as: "মোৰ পুৰণি স্মৃতি দেখুৱাওক",
    bn: "আমার পুরোনো স্মৃতি দেখাও",
    kha: "Pyni ia ki jingkynmaw jong nga",
    ne: "मेरो पुराना सम्झनाहरू देखाउनुहोस्",
    lus: "Ka hriatrengte min hmuhtir rawh",
    mni: "ঐগী নীংশিংখ্রবশিং উৎলু",
    trp: "Aini swk swngno rwgwi phano",
    nag: "Ami laga purana kotha dikhai dibi"
  },
  quick_prompt_game: {
    en: "Let's play a game",
    as: "আমি এটা খেল খেলোঁ আহক",
    bn: "চলুন একটা খেলা খেলি",
    kha: "Ia ngin ia ialehkai",
    ne: "आउनुहोस् एउटा खेल खेलौँ",
    lus: "Infiamna i khel ang hmiang",
    mni: "শান্নপোৎ অমা শান্নসি",
    trp: "Khorokche khel khwnglai",
    nag: "Ekta game khelibo ahibi"
  },
  greeting_morning: {
    en: "Good morning! I hope you had a peaceful night. Would you like to check what's planned for today?",
    as: "শুভ প্ৰভাত! আশা কৰোঁ আপোনাৰ ৰাতিটো শান্তিপূৰ্ণ আছিল। আজিৰ কাৰ্যসূচী চাব বিচাৰিব নেকি?",
    bn: "সুপ্রভাত! আশা করি আপনার রাতটি শান্তির ছিল। আজকের কাজের তালিকা দেখতে চান কি?",
    kha: "Khublei mynstep! Nga kyrmen ba phi thiah suk. Phi kwah ban peit ia ka jingthmu mynta ka sngi?",
    ne: "शुभ प्रभात! आशा छ तपाईंको रात शान्त रह्यो। आजको योजना हेर्न चाहनुहुन्छ?",
    lus: "Chibai zing tha le! I mu tui em? Vawiin thil tih tur kan en dawn em ni?",
    mni: "অয়ুক্কী খুরুমজরি! নুমিৎসি নুংঙাইনা হৌদোরকপরা? ঙসিগী থবকশিং য়েংশিল্লসিরা?",
    trp: "Kahwk sal! Nung kahamcha tongma? Tini no mang song nainai de?",
    nag: "Khushi laga sokal! Rat bhal ghumase na? Aji laga kam sob sabo mon ase?"
  },
  greeting_general: {
    en: "Hello! It's nice to spend time with you. How are you feeling right now?",
    as: "নমস্কাৰ! আপোনাৰ সৈতে সময় কটাই বৰ আনন্দ পাইছোঁ। আপোনাৰ এতিয়া কেনে লাগিছে?",
    bn: "নমস্কার! আপনার সাথে সময় কাটাতে পেরে খুব ভালো লাগছে। এখন আপনার কেমন লাগছে?",
    kha: "Khublei! Sngewbha ban don bad phi. Kumno phi sngew mynta?",
    ne: "नमस्ते! तपाईंसँग समय बिताउन पाउँदा खुसी लाग्यो। अहिले कस्तो महसुस हुँदैछ?",
    lus: "Chibai! I bula awm chu a nuam hle mai. Tunah engtin nge i awm?",
    mni: "খুরুমজরি! নহাক্কা লোয়ননা লৈবসি য়াম্না নুংঙাই। হৌজিক কমদৌরিগে?",
    trp: "Kaham! Nini bisingo tongui kaham lagikha. Tini da nung buhai tongo?",
    nag: "Hello! Apuni logote thakibo mon lagise. Etya kileka lagise?"
  },
  what_to_do_response: {
    en: "We could play a memory game, look through some family memories, or check what you have planned for today. What would you like to do?",
    as: "আমি এটা স্মৃতি খেল খেলিব পাৰোঁ, পৰিয়ালৰ স্মৃতিবোৰ চাব পাৰোঁ, বা আজিৰ পৰিকল্পনা চাব পাৰোঁ। আপুনি কি কৰিব বিচাৰে?",
    bn: "আমরা একটি মেমোরি গেম খেলতে পারি, পরিবারের স্মৃতি দেখতে পারি, অথবা আজকের সময়সূচি দেখতে পারি। আপনি কি করতে চান?",
    kha: "Ngi lah ban ialehkai jingkynmaw, peit ia ki dur kynmaw jong ka longing, lane peit ia ka jingpynkhreh mynta. Kaei phi kwah ban leh?",
    ne: "हामी स्मृति खेल खेल्न सक्छौँ, पारिवारिक सम्झनाहरू हेर्न सक्छौँ, वा आजको तालिका हेर्न सक्छौँ। तपाईं के गर्न चाहनुहुन्छ?",
    lus: "Hriatna tichak tur infiamna kan khel thei a, chhungkaw thlalak kan en thei a, vawiin thil tih tur kan en thei bawk. Eng nge i duh zawk?",
    mni: "ঐখোয় মেমোরী শান্নপোৎ শান্নবা য়াই, ইমুংগী নীংশিংখ্রবশিং য়েংবা য়াই, নত্রগা ঙসিগী থবকশিং য়েংবা য়াই। করি তৌনিংবগে?",
    trp: "Chini memory khel khwngui manno, nukungni photo naiui manno, de aji mang song naiui manno. Nung mang khwlai nai?",
    nag: "Ami khan ekta memory game khelibo pare, ghor laga photo sabo pare, nohoile aji ki ase sabo pare. Ki koribo mon ase?"
  },
  gratitude_response: {
    en: "You're very welcome! I'm always here right beside you whenever you need me.",
    as: "আপোনাক বহুত ধন্যবাদ! যেতিয়াই প্ৰয়োজন হয়, মই সদায় আপোনাৰ কাষতেই আছোঁ।",
    bn: "আপনাকে অনেক ধন্যবাদ! যখনই দরকার হবে, আমি সবসময় আপনার পাশেই আছি।",
    kha: "Khublei shibun! Nga don hangne bad phi ha kano kano ka por ba phi donkam.",
    ne: "तपाईंलाई धेरै स्वागत छ! जब पनि तपाईंलाई खाँचो पर्छ, म सधैं यहाँ छु।",
    lus: "Ka lawm lutuk e! I mamawh hun apiangah i kiangah ka awm reng e.",
    mni: "নহাকপু থাগৎচরি! নহাক্না পাম্বা মতমদা ঐ মতম চুপ্পদা নহাক্কী নাকন্দা লৈগনি।",
    trp: "Baili hamari! Nini nangmung khe ang salbrum nini sepad tongnai.",
    nag: "Bhal lagise! Apuni laga kotha sunibo kosto nai, ami aji kali sob homoi apuni logote ase."
  },
  voice_unavailable_notice: {
    en: "Voice playback for this language is currently unavailable on this device. MANAS will continue in text.",
    as: "এই ডিভাইচত অসমীয়া ভাষাৰ মাত উপলব্ধ নহয়। মানসে লিখিতভাৱে সহায় আগবঢ়াব।",
    bn: "এই ডিভাইসে বাংলা কণ্ঠস্বর বর্তমানে উপলব্ধ নেই। মানস লিখিতভাবে উত্তর দেবে।",
    kha: "Ka jingsawa na ka bynta ka ktien Khasi kam pat don ha kane ka kor. MANAS un thoh beit ha ka thoh.",
    ne: "यस यन्त्रमा नेपाली आवाज उपलब्ध छैन। मानसले पाठमा निरन्तरता दिनेछ।",
    lus: "He khawl ah hian Mizo aw a la awm lo. MANAS hian thu ziakin a chhang zel ang che.",
    mni: "ডিভাইসসিদা মৈতৈলোনগী খোঞ্জেল ফংদ্রে। মানসনা ইবা থোংদা মখা চত্থগনি।",
    trp: "Abo device-o Kokborok kok rwgwi manliya. MANAS kok swrangui pai nai.",
    nag: "Etu device te Nagamese laga awaz nai. MANAS likhi kene bhal kori kotha koribo."
  }
};

/**
 * Helper to fetch localized text with English fallback
 */
export function getLocalizedAssistantText(key: string, langCode: string | null | undefined): string {
  const norm = normalizeLanguageCode(langCode);
  const dict = LOCALIZED_AI_STRINGS[key];
  if (!dict) return '';
  return dict[norm] || dict['en'] || '';
}