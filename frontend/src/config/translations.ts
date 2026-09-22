import { LanguageCode, normalizeLanguageCode } from './languages';

export interface TranslationDictionary {
  nav: {
    home: string;
    schedule: string;
    people: string;
    memories: string;
    places: string;
    games: string;
    assessment: string;
    sos: string;
    logout: string;
    accessibility: string;
    language: string;
  };
  home: {
    good_morning: string;
    good_afternoon: string;
    good_evening: string;
    hello: string;
    new_day: string;
    take_small_steps: string;
    todays_next_step: string;
    all_caught_up: string;
    all_caught_up_desc: string;
    mark_done: string;
    done: string;
    relive_moments: string;
    keep_mind_active: string;
    track_performance: string;
    faces_of_loved_ones: string;
    important_places: string;
    routines_reminders: string;
    medical_directory: string;
  };
  assistant: {
    hi: string;
    subtitle: string;
    tap_to_speak: string;
    stop_listening: string;
    listening: string;
    hearing: string;
    thinking: string;
    speaking: string;
    type_placeholder: string;
    talk_to_manas: string;
    prompt_today: string;
    prompt_person: string;
    prompt_hospital: string;
    prompt_memories: string;
    prompt_game: string;
  };
  schedule_page: {
    title: string;
    daily_routines: string;
    reminders_meds: string;
  };
  people_page: {
    title: string;
    enroll_person: string;
    cards_view: string;
    family_tree: string;
  };
  memories_page: {
    title: string;
    add_memory: string;
  };
  places_page: {
    title: string;
    safe_locations: string;
  };
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    nav: {
      home: "Home",
      schedule: "Today's Schedule",
      people: "People I Know",
      memories: "My Memories",
      places: "Safe Places",
      games: "Cognitive Games",
      assessment: "Assessment",
      sos: "Call Caregiver (SOS)",
      logout: "Logout",
      accessibility: "Accessibility",
      language: "Language"
    },
    home: {
      good_morning: "Good Morning",
      good_afternoon: "Good Afternoon",
      good_evening: "Good Evening",
      hello: "Hello",
      new_day: "A new day, a new memory.",
      take_small_steps: "Take small steps. You're doing great!",
      todays_next_step: "TODAY'S NEXT STEP",
      all_caught_up: "All Caught Up",
      all_caught_up_desc: "No pending activities right now. Relax and enjoy your day!",
      mark_done: "Mark Done",
      done: "Done",
      relive_moments: "Relive your special moments",
      keep_mind_active: "Keep your mind active",
      track_performance: "Track activity performance",
      faces_of_loved_ones: "Faces of loved ones",
      important_places: "Important places & addresses",
      routines_reminders: "Routines and reminders",
      medical_directory: "Medical specialist directory"
    },
    assistant: {
      hi: "Hi {name}! 👋",
      subtitle: "I'm MANAS. What can I do for you today?",
      tap_to_speak: "🎙️ Tap to Speak",
      stop_listening: "Stop Listening",
      listening: "Listening... Speak now",
      hearing: "Hearing you in real-time...",
      thinking: "Thinking & processing...",
      speaking: "MANAS is speaking...",
      type_placeholder: "Or type a command or question...",
      talk_to_manas: "Talk to MANAS ✨",
      prompt_today: "What do I have today?",
      prompt_person: "Who is Arun?",
      prompt_hospital: "Where is the hospital?",
      prompt_memories: "Show my memories",
      prompt_game: "Let's play a game"
    },
    schedule_page: {
      title: "TODAY'S SCHEDULE",
      daily_routines: "Daily Routines",
      reminders_meds: "Medicines & Reminders"
    },
    people_page: {
      title: "PEOPLE I KNOW",
      enroll_person: "+ Enroll Person",
      cards_view: "Cards",
      family_tree: "Family Tree"
    },
    memories_page: {
      title: "MY MEMORIES",
      add_memory: "Memory Garden"
    },
    places_page: {
      title: "SAFE PLACES",
      safe_locations: "Important Places & Safe Zones"
    }
  },

  as: {
    nav: {
      home: "গৃহ",
      schedule: "আজিৰ কাৰ্যসূচী",
      people: "মই জনা মানুহ",
      memories: "মোৰ স্মৃতি",
      places: "সুৰক্ষিত স্থানসমূহ",
      games: "মস্তিষ্কৰ খেল",
      assessment: "মূল্যায়ন",
      sos: "সহায়কক কল কৰক (জৰুৰীকালীন)",
      logout: "প্ৰস্থান",
      accessibility: "সুগমতা",
      language: "ভাষা"
    },
    home: {
      good_morning: "শুভ প্ৰভাত",
      good_afternoon: "শুভ অপৰাহ্ণ",
      good_evening: "শুভ সন্ধিয়া",
      hello: "নমস্কাৰ",
      new_day: "এটা নতুন দিন, এটা নতুন স্মৃতি।",
      take_small_steps: "সৰু সৰু পদক্ষেপ লওক। আপুনি বৰ ভাল কৰিছে!",
      todays_next_step: "আজিৰ পৰৱৰ্তী পদক্ষেপ",
      all_caught_up: "সকলো সম্পূৰ্ণ হ'ল",
      all_caught_up_desc: "এতিয়া কোনো বাকী থকা কাম নাই। আৰাম কৰক আৰু দিনটো উপভোগ কৰক!",
      mark_done: "সম্পূৰ্ণ বুলি চিহ্নিত কৰক",
      done: "সম্পূৰ্ণ",
      relive_moments: "আপোনাৰ বিশেষ মুহূৰ্তবোৰ সোঁৱৰক",
      keep_mind_active: "মন সতেজ কৰি ৰাখক",
      track_performance: "কাৰ্যকলাপৰ উন্নতি চাওক",
      faces_of_loved_ones: "আপোনজনৰ চিনাকি মুখবোৰ",
      important_places: "প্ৰয়োজনীয় ঠিকনাবোৰ",
      routines_reminders: "দৈনন্দিন ৰুটিন আৰু সোঁৱৰণী",
      medical_directory: "চিকিৎসক আৰু বিশেষজ্ঞসকল"
    },
    assistant: {
      hi: "নমস্কাৰ {name}! 👋",
      subtitle: "মই মানস। আজি আপোনাৰ বাবে কি কৰিব পাৰোঁ?",
      tap_to_speak: "🎙️ ক'বলৈ স্পৰ্শ কৰক",
      stop_listening: "শুনাটো বন্ধ কৰক",
      listening: "শুনি আছোঁ... কওক",
      hearing: "আপোনাৰ মাত শুনি থকা হৈছে...",
      thinking: "চিন্তা কৰি আছোঁ...",
      speaking: "মানসে কৈ আছে...",
      type_placeholder: "বা এটা প্ৰশ্ন ইয়াত লিখক...",
      talk_to_manas: "মানসৰ লগত কথা পাতক ✨",
      prompt_today: "আজি মোৰ কি কি কাম আছে?",
      prompt_person: "অৰুণ কোন হয়?",
      prompt_hospital: "হাস্পাতালখন ক'ত আছে?",
      prompt_memories: "মোৰ পুৰণি স্মৃতি দেখুৱাওক",
      prompt_game: "আমি এটা খেল খেলোঁ আহক"
    },
    schedule_page: {
      title: "আজিৰ কাৰ্যসূচী",
      daily_routines: "দৈনন্দিন কাম-কাজ",
      reminders_meds: "ঔষধ আৰু সোঁৱৰণী"
    },
    people_page: {
      title: "মই জনা মানুহ",
      enroll_person: "+ নতুন ব্যক্তি যোগ কৰক",
      cards_view: "কাৰ্ডসমূহ",
      family_tree: "পৰিয়াল বৃক্ষ"
    },
    memories_page: {
      title: "মোৰ স্মৃতিবোৰ",
      add_memory: "স্মৃতি উদ্যান"
    },
    places_page: {
      title: "সুৰক্ষিত স্থানসমূহ",
      safe_locations: "গুৰুত্বপূৰ্ণ স্থান আৰু ঠিকনা"
    }
  },

  bn: {
    nav: {
      home: "হোম",
      schedule: "আজকের সূচি",
      people: "আমার পরিচিতজন",
      memories: "আমার স্মৃতি",
      places: "নিরাপদ স্থান",
      games: "মস্তিষ্কের খেলা",
      assessment: "মূল্যায়ন",
      sos: "সাহায্যকারীকে কল করুন (জরুরি)",
      logout: "লগআউট",
      accessibility: "সহজগম্যতা",
      language: "ভাষা"
    },
    home: {
      good_morning: "সুপ্রভাত",
      good_afternoon: "শুভ অপরাহ্ন",
      good_evening: "শুভ সন্ধ্যা",
      hello: "নমস্কার",
      new_day: "একটি নতুন দিন, একটি নতুন স্মৃতি।",
      take_small_steps: "ছোট ছোট পদক্ষেপ নিন। আপনি খুব ভালো করছেন!",
      todays_next_step: "আজকের পরবর্তী পদক্ষেপ",
      all_caught_up: "সব কাজ সমাপ্ত",
      all_caught_up_desc: "আপাতত আর কোনো বাকি কাজ নেই। বিশ্রাম নিন এবং দিনটি উপভোগ করুন!",
      mark_done: "সম্পন্ন হিসেবে চিহ্নিত করুন",
      done: "সম্পন্ন",
      relive_moments: "আপনার বিশেষ মুহূর্তগুলো মনে করুন",
      keep_mind_active: "মন সতেজ রাখুন",
      track_performance: "কার্যকলাপের উন্নতি পর্যবেক্ষণ করুন",
      faces_of_loved_ones: "প্রিয়জনদের চেনা মুখ",
      important_places: "গুরুত্বপূর্ণ স্থান ও ঠিকানা",
      routines_reminders: "নিয়মিত রুটিন ও ওষুধ",
      medical_directory: "চিকিৎসক ও হাসপাতাল তালিকা"
    },
    assistant: {
      hi: "নমস্কার {name}! 👋",
      subtitle: "আমি মানস। আজ আপনার জন্য কি করতে পারি?",
      tap_to_speak: "🎙️ কথা বলতে স্পর্শ করুন",
      stop_listening: "শোনা বন্ধ করুন",
      listening: "শুনছি... বলুন",
      hearing: "আপনার কথা শোনা যাচ্ছে...",
      thinking: "প্রক্রিয়া চলছে...",
      speaking: "মানস বলছে...",
      type_placeholder: "অথবা এখানে একটি প্রশ্ন লিখুন...",
      talk_to_manas: "মানসের সাথে কথা বলুন ✨",
      prompt_today: "আজ আমার কি কি কাজ আছে?",
      prompt_person: "অরুণ কে হয়?",
      prompt_hospital: "হাসপাতাল কোথায় অবস্থিত?",
      prompt_memories: "আমার পুরোনো স্মৃতি দেখাও",
      prompt_game: "চলুন একটা খেলা খেলি"
    },
    schedule_page: {
      title: "আজকের কাজের তালিকা",
      daily_routines: "দৈনিক রুটিন",
      reminders_meds: "ওষুধ ও সতর্কতা"
    },
    people_page: {
      title: "আমার পরিচিতজন",
      enroll_person: "+ নতুন ব্যক্তি যোগ করুন",
      cards_view: "কার্ডসমূহ",
      family_tree: "পরিবার বৃক্ষ"
    },
    memories_page: {
      title: "আমার স্মৃতি",
      add_memory: "স্মৃতি বাগান"
    },
    places_page: {
      title: "নিরাপদ স্থানসমূহ",
      safe_locations: "গুরুত্বপূর্ণ স্থান ও ঠিকানা"
    }
  },

  hi: {
    nav: {
      home: "होम",
      schedule: "आज का शेड्यूल",
      people: "मेरे परिचित",
      memories: "मेरी यादें",
      places: "सुरक्षित स्थान",
      games: "दिमागी खेल",
      assessment: "आकलन",
      sos: "देखभालकर्ता को कॉल करें (आपातकालीन)",
      logout: "लॉग आउट",
      accessibility: "सुलभता",
      language: "भाषा"
    },
    home: {
      good_morning: "शुभ प्रभात",
      good_afternoon: "शुभ दोपहर",
      good_evening: "शुभ संध्या",
      hello: "नमस्ते",
      new_day: "एक नया दिन, एक नई स्मृति।",
      take_small_steps: "छोटे-छोटे कदम उठाएं। आप बहुत अच्छा कर रहे हैं!",
      todays_next_step: "आज का अगला कदम",
      all_caught_up: "सब पूरा हुआ",
      all_caught_up_desc: "अभी कोई कार्य बाकी नहीं है। आराम करें और अपने दिन का आनंद लें!",
      mark_done: "पूर्ण चिह्नित करें",
      done: "पूर्ण",
      relive_moments: "अपने खास पलों को याद करें",
      keep_mind_active: "अपने दिमाग को सक्रिय रखें",
      track_performance: "दैनिक गतिविधियों की प्रगति देखें",
      faces_of_loved_ones: "अपनों के प्यारे चेहरे",
      important_places: "महत्वपूर्ण स्थान और पते",
      routines_reminders: "दैनिक दिनचर्या और दवाइयां",
      medical_directory: "डॉक्टर और चिकित्सा विशेषज्ञ"
    },
    assistant: {
      hi: "नमस्ते {name}! 👋",
      subtitle: "मैं मानस हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
      tap_to_speak: "🎙️ बोलने के लिए टैप करें",
      stop_listening: "सुनना बंद करें",
      listening: "सुन रहा हूँ... बोलिए",
      hearing: "आपकी आवाज आ रही है...",
      thinking: "सोच रहा हूँ...",
      speaking: "मानस बोल रहा है...",
      type_placeholder: "या यहाँ कोई प्रश्न टाइप करें...",
      talk_to_manas: "मानस से बात करें ✨",
      prompt_today: "आज मेरे क्या काम हैं?",
      prompt_person: "अरुण कौन है?",
      prompt_hospital: "अस्पताल कहाँ है?",
      prompt_memories: "मेरी यादें दिखाएं",
      prompt_game: "एक खेल खेलते हैं"
    },
    schedule_page: {
      title: "आज का शेड्यूल",
      daily_routines: "दैनिक दिनचर्या",
      reminders_meds: "दवाइयां और रिमाइंडर"
    },
    people_page: {
      title: "मेरे परिचित",
      enroll_person: "+ नया व्यक्ति जोड़ें",
      cards_view: "कार्ड",
      family_tree: "पारिवारिक वृक्ष"
    },
    memories_page: {
      title: "मेरी यादें",
      add_memory: "स्मृति वाटिका"
    },
    places_page: {
      title: "सुरक्षित स्थान",
      safe_locations: "महत्वपूर्ण सुरक्षित स्थान"
    }
  },

  kha: {
    nav: {
      home: "Iing",
      schedule: "Jingpynkhreh Mynta",
      people: "Ki Briew Ba Nga Ithuh",
      memories: "Ki Jingkynmaw Jong Nga",
      places: "Ki Jaka Ba Shngain",
      games: "Ki Jingialehkai",
      assessment: "Ka Jingthew",
      sos: "Kylli ia u nongsumar (SOS)",
      logout: "Mih noh",
      accessibility: "Jingsuk ban pyndonkam",
      language: "Ktien"
    },
    home: {
      good_morning: "Khublei mynstep",
      good_afternoon: "Khublei sngi",
      good_evening: "Khublei janmiet",
      hello: "Khublei",
      new_day: "Ka sngi ba thymmai, ka jingkynmaw ba thymmai.",
      take_small_steps: "Jam ki kjat kiba rit. Phi leh bha bha!",
      todays_next_step: "KA JINGPYNKHREH BA BUD",
      all_caught_up: "Dep lut baroh",
      all_caught_up_desc: "Ym donkam ban leh eiei mynta. Shongthait bad pynbyrngia!",
      mark_done: "Thoh ba la dep",
      done: "La dep",
      relive_moments: "Kynmaw biang ia ki por kiba khraw",
      keep_mind_active: "Pynim ia ka jingmut jingpyrkhat",
      track_performance: "Bud dien ia ka jinglah",
      faces_of_loved_ones: "Ki dur jong kiba ieit",
      important_places: "Ki jaka bad ki address kiba donkam",
      routines_reminders: "Ki kam man ka sngi bad ki dawai",
      medical_directory: "Ki doctor bad ki hospital"
    },
    assistant: {
      hi: "Khublei {name}! 👋",
      subtitle: "Nga dei u MANAS. Kaei nga lah ban iarap mynta?",
      tap_to_speak: "🎙️ Kren hangne",
      stop_listening: "Sangeh ban sngap",
      listening: "Ngaiphang... Kren mynta",
      hearing: "Sngap ia phi mynta...",
      thinking: "Pynrkhat bad wad...",
      speaking: "MANAS u kren...",
      type_placeholder: "Lane thoh ia ka jingkylli hangne...",
      talk_to_manas: "Kren bad u MANAS ✨",
      prompt_today: "Kaei nga don mynta ka sngi?",
      prompt_person: "Uei u Arun?",
      prompt_hospital: "Hangno ka hospital?",
      prompt_memories: "Pyni ia ki dur kynmaw",
      prompt_game: "Ia ngin ia ialehkai"
    },
    schedule_page: {
      title: "JINGPYNKHREH MYNTA KA SNGI",
      daily_routines: "Ki Kam Man Ka Sngi",
      reminders_meds: "Ki Dawai Bad Jingkynmaw"
    },
    people_page: {
      title: "KI BRIEW BA NGA ITHUH",
      enroll_person: "+ Pyniasoh Briew Thymmai",
      cards_view: "Ki Dur",
      family_tree: "Ka Longing"
    },
    memories_page: {
      title: "KI JINGKYNMAW JONG NGA",
      add_memory: "Kper Jingkynmaw"
    },
    places_page: {
      title: "KI JAKA BA SHNGAIN",
      safe_locations: "Ki Jaka Kiba Donkam"
    }
  },

  ne: {
    nav: {
      home: "गृह",
      schedule: "आजको तालिका",
      people: "मैले चिनेका मानिसहरू",
      memories: "मेरो सम्झनाहरू",
      places: "सुरक्षित स्थानहरू",
      games: "स्मृति खेलहरू",
      assessment: "मूल्याङ्कन",
      sos: "सहयोगीलाई कल गर्नुहोस् (आपतकालीन)",
      logout: "बाहिरिनुहोस्",
      accessibility: "पहुँचयोग्यता",
      language: "भाषा"
    },
    home: {
      good_morning: "शुभ प्रभात",
      good_afternoon: "शुभ दिउँसो",
      good_evening: "शुभ सन्ध्या",
      hello: "नमस्ते",
      new_day: "एउटा नयाँ दिन, एउटा नयाँ सम्झना।",
      take_small_steps: "साना साना पाइलाहरू चाल्नुहोस्। तपाईं धेरै राम्रो गर्दै हुनुहुन्छ!",
      todays_next_step: "आजको अर्को चरण",
      all_caught_up: "सबै काम सम्पन्न भयो",
      all_caught_up_desc: "अहिले कुनै बाँकी काम छैन। आराम गर्नुहोस् र दिनको आनन्द लिनुहोस्!",
      mark_done: "सम्पन्न भयो",
      done: "सम्पन्न",
      relive_moments: "आफ्ना विशेष पलहरू सम्झनुहोस्",
      keep_mind_active: "आफ्नो दिमागलाई सक्रिय राख्नुहोस्",
      track_performance: "गतिविधि प्रदर्शन हेर्नुहोस्",
      faces_of_loved_ones: "प्रियजनहरूका अनुहारहरू",
      important_places: "महत्वपूर्ण स्थानहरू र ठेगानाहरू",
      routines_reminders: "दैनिक कार्य र औषधि तालिका",
      medical_directory: "चिकित्सक तथा अस्पताल निर्देशिका"
    },
    assistant: {
      hi: "नमस्ते {name}! 👋",
      subtitle: "म मानस हुँ। आज म तपाईंलाई के मद्दत गर्न सक्छु?",
      tap_to_speak: "🎙️ बोल्न यहाँ छुनुहोस्",
      stop_listening: "सुन्न बन्द गर्नुहोस्",
      listening: "सुन्दैछु... बोल्नुहोस्",
      hearing: "तपाईंको आवाज सुनिँदैछ...",
      thinking: "सोच्दै छु...",
      speaking: "मानस बोल्दैछ...",
      type_placeholder: "वा यहाँ एउटा प्रश्न लेख्नुहोस्...",
      talk_to_manas: "मानससँग कुरा गर्नुहोस् ✨",
      prompt_today: "आज मेरो के के काम छ?",
      prompt_person: "अरुण को हुन्?",
      prompt_hospital: "अस्पताल कहाँ छ?",
      prompt_memories: "मेरो सम्झनाहरू देखाउनुहोस्",
      prompt_game: "आउनुहोस् एउटा खेल खेलौँ"
    },
    schedule_page: {
      title: "आजको तालिका",
      daily_routines: "दैनिक दिनचर्या",
      reminders_meds: "औषधि तथा रिमाइन्डरहरू"
    },
    people_page: {
      title: "मैले चिनेका मानिसहरू",
      enroll_person: "+ नयाँ व्यक्ति थप्नुहोस्",
      cards_view: "कार्डहरू",
      family_tree: "पारिवारिक वृक्ष"
    },
    memories_page: {
      title: "मेरो सम्झनाहरू",
      add_memory: "स्मृति वाटिका"
    },
    places_page: {
      title: "सुरक्षित स्थानहरू",
      safe_locations: "महत्वपूर्ण सुरक्षित स्थानहरू"
    }
  },

  lus: {
    nav: {
      home: "In",
      schedule: "Vawiin Hun Tih Tur",
      people: "Ka Hmelhriatte",
      memories: "Ka Hriatrengte",
      places: "Hmun Himte",
      games: "Hriatna Tichak Infiamna",
      assessment: "Endikna",
      sos: "Enkawltu Bia Rawh (SOS)",
      logout: "Chhuak rawh",
      accessibility: "Awlsam taka hman theihna",
      language: "Ṭawng"
    },
    home: {
      good_morning: "Chibai zing tha le",
      good_afternoon: "Chibai chhun tha le",
      good_evening: "Chibai tlaizawng",
      hello: "Chibai",
      new_day: "Ni thar, hriatreng thar.",
      take_small_steps: "Zawi zawiin kal rawh. I ti ṭha lutuk e!",
      todays_next_step: "VAWIIN TIH LEH TUR",
      all_caught_up: "I ti zo vek e",
      all_caught_up_desc: "Tunah thil tih tur a awm lo. Chawl hahdam rawh le!",
      mark_done: "Zo angah dah rawh",
      done: "Zo tawh",
      relive_moments: "Hun hluite chhui kir rawh",
      keep_mind_active: "I rilru vawng nung reng rawh",
      track_performance: "I chet velh dante thlithlai rawh",
      faces_of_loved_ones: "I mi duhtakte hmel",
      important_places: "Hmun pawimawh leh awmna te",
      routines_reminders: "Ni tin tih tur leh damdawi ei tur",
      medical_directory: "Doctor leh damdawi in te"
    },
    assistant: {
      hi: "Chibai {name}! 👋",
      subtitle: "MANAS ka ni e. Vawiinah eng nge ka tihsak theih ang che?",
      tap_to_speak: "🎙️ Ṭawng turin hmet rawh",
      stop_listening: "Ngaithla tawh suh",
      listening: "Ka ngaithla e... Ṭawng rawh",
      hearing: "I ṭawng ri ka hre mek e...",
      thinking: "Ka ngaihtuah mek e...",
      speaking: "MANAS a ṭawng mek e...",
      type_placeholder: "A nih loh leh zawhna ziak rawh...",
      talk_to_manas: "MANAS be bia rawh ✨",
      prompt_today: "Vawiinah eng nge ka tih dawn?",
      prompt_person: "Arun-a chu tunge?",
      prompt_hospital: "Damdawi in chu khawiah nge?",
      prompt_memories: "Ka hriatrengte min hmuhtir rawh",
      prompt_game: "Infiamna i khel ang hmiang"
    },
    schedule_page: {
      title: "VAWIIN HUN TIH TUR",
      daily_routines: "Ni Tin Tih Turte",
      reminders_meds: "Damdawi Ei Turte"
    },
    people_page: {
      title: "KA HMELHRIATTE",
      enroll_person: "+ Hmelhriat Thar Dah Rawh",
      cards_view: "Thlalakte",
      family_tree: "Chhungkaw Zung"
    },
    memories_page: {
      title: "KA HRIATRENGTE",
      add_memory: "Hriatrengna Hmun"
    },
    places_page: {
      title: "HMUN HIMTE",
      safe_locations: "Hmun Pawimawhte"
    }
  },

  mni: {
    nav: {
      home: "য়ুম",
      schedule: "ঙসিগী থবক",
      people: "ঐনা খংবা মীওইশিং",
      memories: "ঐগী নীংশিংবা",
      places: "তেন্থোক্তবা মফমশিং",
      games: "ৱাখলগী শান্নপোৎ",
      assessment: "য়েংশিনবা",
      sos: "য়েংশেনবীবাদা কোল তৌবীযু (জরুরি)",
      logout: "থোক্লগা চৎপা",
      accessibility: "সুগমতা",
      language: "লোল"
    },
    home: {
      good_morning: "অয়ুক্কী খুরুমজরি",
      good_afternoon: "নুমিৎখুংগী খুরুমজরি",
      good_evening: "নুমিদাংগী খুরুমজরি",
      hello: "খুরুমজরি",
      new_day: "নুমিৎ অনৌবা অমা, নীংশিংবা অনৌবা অমা।",
      take_small_steps: "তপনা চৎসি। নহাক্না য়াম্না ফনা তৌরি!",
      todays_next_step: "ঙসিগী মথংগী থবক",
      all_caught_up: "লোইনা লোইশিনখ্রে",
      all_caught_up_desc: "হৌজিক ওইনা করিবা থবক লৈত্রে। নুংঙাইনা পোথাবিয়ু!",
      mark_done: "লোইরে হায়না খংদোকউ",
      done: "লোইরে",
      relive_moments: "নহাক্কী অখন্নবা পুংফমশিং নীংশিংলু",
      keep_mind_active: "ৱাখলবু হকচাং চেলহন্নবা",
      track_performance: "থবকশিংগী ফল য়েংবা",
      faces_of_loved_ones: "নুংশিবা মীওইশিংগী মমৈ",
      important_places: "মরুওইবা মফম অমসুং লৈফমশিং",
      routines_reminders: "নোংমগী থবক অমসুং নীংশিংবা",
      medical_directory: "লাইয়েংশঙ অমসুং দোক্তরশিং"
    },
    assistant: {
      hi: "খুরুমজরি {name}! 👋",
      subtitle: "ঐ মানসনি। ঙসি নহাক্কীদমক করি তৌবীগে?",
      tap_to_speak: "🎙️ ঙাংনবগীদমক নম্বিয়ু",
      stop_listening: "তাকপা লেপপু",
      listening: "তাকলি... হৌজিক ঙাংবীয়ু",
      hearing: "নহাক্কী খোঞ্জেল তাকলি...",
      thinking: "ৱাখল খল্লি...",
      speaking: "মানসনা ঙাংলি...",
      type_placeholder: "নত্রগা ৱাহং অমা মফমসিদা ইবিয়ু...",
      talk_to_manas: "মানসকা ৱারী শান্নসি ✨",
      prompt_today: "ঙসি ঐগী করি থবক লৈবগে?",
      prompt_person: "অরুন হায়বসি কনানো?",
      prompt_hospital: "হোসপিতাল কদাইদা লৈবগে?",
      prompt_memories: "ঐগী নীংশিংখ্রবশিং উৎলু",
      prompt_game: "শান্নপোৎ অমা শান্নসি"
    },
    schedule_page: {
      title: "ঙসিগী থবকশিং",
      daily_routines: "নোংমগী থবকশিং",
      reminders_meds: "হিদাক অমসুং নীংশিংবা"
    },
    people_page: {
      title: "ঐনা খংবা মীওইশিং",
      enroll_person: "+ অনৌবা মীওই হাপচিনবা",
      cards_view: "কার্দশিং",
      family_tree: "ইমুংগী চেল"
    },
    memories_page: {
      title: "ঐগী নীংশিংখ্রবশিং",
      add_memory: "নীংশিং লৈকোল"
    },
    places_page: {
      title: "তেন্থোক্তবা মফমশিং",
      safe_locations: "মরুওইবা মফমশিং"
    }
  },

  trp: {
    nav: {
      home: "Nok",
      schedule: "Tini Mang Song",
      people: "Aini Sinimung Borok",
      memories: "Aini Swk Swng",
      places: "Kaham Jagaro",
      games: "Memory Khel",
      assessment: "Naimung",
      sos: "Caregiver no phone khwlai (SOS)",
      logout: "Onghor mani",
      accessibility: "Accessibility",
      language: "Kok"
    },
    home: {
      good_morning: "Kahwk sal",
      good_afternoon: "Kaham sal",
      good_evening: "Kaham san",
      hello: "Khulumkha",
      new_day: "Kotal sal, kotal kok.",
      take_small_steps: "Khamui kaisa kaisa thangdi. Nung kaham khwlaio!",
      todays_next_step: "TINI MAHAMGCHOM",
      all_caught_up: "Kiphil joto paiya",
      all_caught_up_desc: "Mang song khorokche kiphilya. Rest khwlai kahamcha tongdi!",
      mark_done: "Khwlai paiya thoh",
      done: "Paiya",
      relive_moments: "Nini kotor kok song nainai",
      keep_mind_active: "Nini bwkha kotor khwlai",
      track_performance: "Khamani nainai",
      faces_of_loved_ones: "Hammani borok song",
      important_places: "Kaham jagarok",
      routines_reminders: "Salbrum mang song",
      medical_directory: "Doctor tei hospital"
    },
    assistant: {
      hi: "Khulumkha {name}! 👋",
      subtitle: "Ang MANAS. Tini nini bagwi mang khwlai nai?",
      tap_to_speak: "🎙️ Sa na bagwi thikdi",
      stop_listening: "Khwnamung khwlwkdi",
      listening: "Khwnatongo... Sa di",
      hearing: "Nini kok khwna tongo...",
      thinking: "Bwkhani kok nainai...",
      speaking: "MANAS kok sa tongo...",
      type_placeholder: "De khorokche kok swrangui swi manno...",
      talk_to_manas: "MANAS bai kok sa ✨",
      prompt_today: "Tini aini mang song tongo?",
      prompt_person: "Arun khorokche sabo?",
      prompt_hospital: "Hospital baha tongo?",
      prompt_memories: "Aini swk swngno rwgwi phano",
      prompt_game: "Khorokche khel khwnglai"
    },
    schedule_page: {
      title: "TINI MANG SONG",
      daily_routines: "Salbrum Mang Song",
      reminders_meds: "Dawai tei Reminders"
    },
    people_page: {
      title: "AINI SINIMUNG BOROK",
      enroll_person: "+ Kotal Borok Swi",
      cards_view: "Photo song",
      family_tree: "Nukung"
    },
    memories_page: {
      title: "AINI SWK SWNG",
      add_memory: "Swk Swng Bagan"
    },
    places_page: {
      title: "KAHAM JAGAROK",
      safe_locations: "Khamani Jagarok"
    }
  },

  nag: {
    nav: {
      home: "Ghor",
      schedule: "Aji laga Schedule",
      people: "Moi Jana Manu",
      memories: "Ami laga Memories",
      places: "Bhal Jagah",
      games: "Dimag laga Game",
      assessment: "Check Kora",
      sos: "Caregiver ke Call Kori Lobi (SOS)",
      logout: "Bahar Jabi",
      accessibility: "Accessibility",
      language: "Bhasha"
    },
    home: {
      good_morning: "Khushi laga sokal",
      good_afternoon: "Bhal dopor",
      good_evening: "Bhal laga bheli",
      hello: "Hello",
      new_day: "Notun din, notun kotha.",
      take_small_steps: "Aste aste jabi. Apuni bhal kori ase!",
      todays_next_step: "AJI LAGA AGLE KAM",
      all_caught_up: "Sob kam hoise",
      all_caught_up_desc: "Etya kunu kam baki nai. Aram kori din mojate katabi!",
      mark_done: "Khatam hoise",
      done: "Hoise",
      relive_moments: "Apuni laga bhal homoi mone koribi",
      keep_mind_active: "Dimag ta active rakhidi",
      track_performance: "Kam laga report sabo",
      faces_of_loved_ones: "Apna manu khan laga chehra",
      important_places: "Bhal jagah aru thikana",
      routines_reminders: "Roj laga kam aru dowa",
      medical_directory: "Doctor aru hospital"
    },
    assistant: {
      hi: "Hello {name}! 👋",
      subtitle: "Ami MANAS ase. Aji ki modot koribo pare?",
      tap_to_speak: "🎙️ Kotha kobo karne dababi",
      stop_listening: "Rukhibi",
      listening: "Huni ase... Kobi",
      hearing: "Apuni laga kotha huni ase...",
      thinking: "Bhabhi ase...",
      speaking: "MANAS kotha kori ase...",
      type_placeholder: "Nohoile ekta kotha likhibi...",
      talk_to_manas: "MANAS logote kotha koribi ✨",
      prompt_today: "Aji ki ase amikhe?",
      prompt_person: "Arun kun ase?",
      prompt_hospital: "Hospital kote ase?",
      prompt_memories: "Ami laga purana kotha dikhai dibi",
      prompt_game: "Ekta game khelibo ahibi"
    },
    schedule_page: {
      title: "AJI LAGA SCHEDULE",
      daily_routines: "Roj Laga Kam",
      reminders_meds: "Dowa Aru Reminders"
    },
    people_page: {
      title: "MOI JANA MANU",
      enroll_person: "+ Notun Manu Add Kori Lobi",
      cards_view: "Cards",
      family_tree: "Family Tree"
    },
    memories_page: {
      title: "AMI LAGA MEMORIES",
      add_memory: "Memory Garden"
    },
    places_page: {
      title: "BHAL JAGAH KHAN",
      safe_locations: "Important Jagah"
    }
  }
};

export function getTranslations(code: string | null | undefined): TranslationDictionary {
  const norm = normalizeLanguageCode(code);
  return TRANSLATIONS[norm] || TRANSLATIONS['en'];
}
