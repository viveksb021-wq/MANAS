import React, { useState, useEffect, useRef } from 'react';
import { ManasBrainCharacter, ManasAssistantState } from './ManasBrainCharacter';
import { ManasAssistantPanel } from './ManasAssistantPanel';
import { speakText, stopSpeech, createSpeechRecognizer } from '../utils/speech';
import { fetchApi } from '../utils/api';
import { useOffline } from '../context/OfflineContext';
import { usePatient } from '../context/PatientContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import {
  checkTTSCapability,
  LOCALIZED_AI_STRINGS,
  normalizeLanguageCode,
  getLanguageDetails
} from '../config/languages';

export const ManasFloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [state, setState] = useState<ManasAssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const { isOnline } = useOffline();
  const { patientProfile, familyMembers } = usePatient();
  const { navigate } = useNavigation();
  const { language } = useAuth();

  const recognizerRef = useRef<any>(null);
  const finishTimeoutRef = useRef<any>(null);

  const patientFirstName = patientProfile.full_name.split(' ')[0] || 'Vivek';

  // Rule 6: When the patient changes language while MANAS is speaking or listening:
  // 1. Stop/cancel the current speech immediately.
  // 2. Clear timeouts and active recognizers.
  // 3. Reset assistant state to idle.
  // 4. Update voice availability notice.
  useEffect(() => {
    stopSpeech();
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    if (recognizerRef.current && recognizerRef.current.stop) {
      recognizerRef.current.stop();
    }
    setState('idle');
    setResponse(null);
    setTranscript('');
    setVoiceNotice(null);
  }, [language]);

  // Process User Query
  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setState('thinking');
    setVoiceNotice(null);

    const normLang = normalizeLanguageCode(language);
    const langDetails = getLanguageDetails(normLang);

    try {
      let resData: any;
      if (isOnline) {
        resData = await fetchApi('/voice/ask', {
          method: 'POST',
          body: {
            transcript: queryText,
            language: normLang
          }
        });
      } else {
        // Empathetic, warm local conversational processing when offline in selected language
        const q = queryText.toLowerCase().trim();
        const cleanQ = q.replace(/[^\w\s]/g, ' ').trim();

        if (
          cleanQ.includes('what are we gonna do') ||
          cleanQ.includes('what to do') ||
          cleanQ.includes('what should we do') ||
          cleanQ.includes('কি কৰিম') ||
          cleanQ.includes('কি করব') ||
          cleanQ.includes('के गर्ने')
        ) {
          resData = {
            spoken_response: LOCALIZED_AI_STRINGS.what_to_do_response[normLang] ||
              `Hello ${patientFirstName}! We could play a memory game, look through some family memories, or check what you have planned for today. What would you like to do?`,
            action: 'OFFER_CHOICES',
            suggested_screen: '/games'
          };
        } else if (cleanQ.includes('thank you') || cleanQ.includes('thanks') || cleanQ.includes('ধন্যবাদ') || cleanQ.includes('khublei')) {
          resData = {
            spoken_response: LOCALIZED_AI_STRINGS.gratitude_response[normLang] ||
              `You're very welcome, ${patientFirstName}. I'm always happy to help you anytime.`,
            action: 'NONE',
            suggested_screen: null
          };
        } else if (cleanQ.includes('arun')) {
          resData = {
            spoken_response: "Arun is your Grandson. 14 years old. Loves playing acoustic guitar.",
            action: 'SHOW_PERSON',
            suggested_screen: '/people'
          };
        } else if (cleanQ.includes('hospital') || cleanQ.includes('হাস্পাতাল') || cleanQ.includes('হাসপাতাল')) {
          resData = {
            spoken_response: "Your hospital is Shillong Medical Centre, located at Laitumkhrah, Shillong, Meghalaya 793003.",
            action: 'SHOW_PLACE_ROUTE',
            suggested_screen: '/places'
          };
        } else {
          resData = {
            spoken_response: LOCALIZED_AI_STRINGS.greeting_general[normLang] ||
              `Hello ${patientFirstName}! It's nice to hear from you. How are you feeling today?`,
            action: 'NONE',
            suggested_screen: null
          };
        }
      }

      const responseText = resData.spoken_response || resData.text_response || '';
      setResponse(responseText);

      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
      }

      // Check honest TTS capability for target language
      const ttsCap = checkTTSCapability(normLang);

      if (ttsCap.available && ttsCap.voice) {
        setState('speaking');
        speakText(responseText, normLang, {
          onStart: () => setState('speaking'),
          onEnd: () => setState('idle'),
          onUnavailable: (notice) => {
            setVoiceNotice(notice);
            setState('idle');
          }
        });

        // Safety fallback timer if onend fails to trigger
        const speechDurationMs = Math.max(3200, responseText.length * 85);
        finishTimeoutRef.current = setTimeout(() => {
          setState('idle');
        }, speechDurationMs);
      } else {
        // Honest fallback: never fake pronunciation or speak English for regional text
        setVoiceNotice(ttsCap.message || `Voice for ${langDetails.name} is currently unavailable on this device. MANAS will continue in ${langDetails.name} text.`);
        setState('idle');
      }

      // Handle Navigation redirect if suggested
      if (resData.suggested_screen) {
        const targetScreen = resData.suggested_screen.replace('/', '');
        setTimeout(() => {
          navigate(targetScreen, {}, 'patient_app');
        }, 3200);
      }
    } catch (err) {
      const fallbackMsg = LOCALIZED_AI_STRINGS.greeting_general[normLang] ||
        "I'm here to support you. You can ask me about today's activities, your reminders, your memories, or we can play a game.";
      setResponse(fallbackMsg);
      setState('idle');
    }
  };

  const startListening = () => {
    setState('listening');
    setResponse(null);
    setTranscript('');
    setVoiceNotice(null);

    const normLang = normalizeLanguageCode(language);
    const langDetails = getLanguageDetails(normLang);

    const recognizer = createSpeechRecognizer(
      (text) => handleProcessQuery(text),
      () => {
        if (state === 'listening') setState('idle');
      },
      normLang,
      (notice) => {
        setVoiceNotice(notice);
        setState('idle');
      }
    );

    recognizerRef.current = recognizer;

    if (recognizer) {
      recognizer.start();
    } else {
      setVoiceNotice(`Voice input for ${langDetails.name} is unavailable on this browser.`);
      setState('idle');
    }
  };

  const stopListening = () => {
    stopSpeech();
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
    }
    if (recognizerRef.current && recognizerRef.current.stop) {
      recognizerRef.current.stop();
    }
    setState('idle');
  };

  const handleBrainClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setState('listening');
      startListening();
    } else {
      setIsOpen(false);
      stopListening();
    }
  };

  return (
    <div
      className="manas-floating-brain-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {/* Floating Hover Tooltip */}
      {isHovered && !isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '-38px',
            right: '12px',
            background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 16px rgba(15, 118, 110, 0.35)',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          Talk to MANAS ✨
        </div>
      )}

      {/* Expanded Assistant Panel Attached Above Brain */}
      <ManasAssistantPanel
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          stopListening();
        }}
        state={state}
        transcript={transcript}
        response={response}
        patientName={patientFirstName}
        onStartListening={startListening}
        onStopListening={stopListening}
        onSelectPrompt={(prompt) => handleProcessQuery(prompt)}
        isOnline={isOnline}
        language={language}
        voiceNotice={voiceNotice}
      />

      {/* 3D Brain Mascot Floating Interactive Character */}
      <ManasBrainCharacter
        state={state}
        isHovered={isHovered}
        onClick={handleBrainClick}
      />
    </div>
  );
};
