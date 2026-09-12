import React, { useState, useEffect, useRef } from 'react';
import { ManasBrainCharacter, ManasAssistantState } from './ManasBrainCharacter';
import { ManasAssistantPanel } from './ManasAssistantPanel';
import { speakText, stopSpeech, createSpeechRecognizer } from '../utils/speech';
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
import { processAiQuery } from '../services/aiAssistantService';

export const ManasFloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [state, setState] = useState<ManasAssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const [responseSource, setResponseSource] = useState<'gemini' | 'smart_engine'>('smart_engine');

  const { isOnline } = useOffline();
  const { patientProfile, familyMembers, memories, places, routines } = usePatient();
  const { navigate } = useNavigation();
  const { language } = useAuth();

  const recognizerRef = useRef<any>(null);
  const finishTimeoutRef = useRef<any>(null);

  const patientFirstName = patientProfile?.full_name?.split(' ')[0] || 'Vivek';

  // When the patient changes language while MANAS is speaking or listening:
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
    setActionLabel(null);
  }, [language]);

  // Process User Query with Dual-Engine AI
  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setState('thinking');
    setVoiceNotice(null);
    setActionLabel(null);

    const normLang = normalizeLanguageCode(language);
    const langDetails = getLanguageDetails(normLang);

    try {
      const resData = await processAiQuery(queryText, {
        patientName: patientFirstName,
        patientAge: patientProfile?.age || 74,
        language: normLang,
        familyMembers,
        routines,
        places,
        memories
      });

      const responseText = resData.spoken_response || resData.text_response || '';
      setResponse(responseText);
      setActionLabel(resData.action_label || null);
      setResponseSource(resData.source);

      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
      }

      // Speak response aloud with Web Speech API
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
        const speechDurationMs = Math.max(3000, responseText.length * 85);
        finishTimeoutRef.current = setTimeout(() => {
          setState('idle');
        }, speechDurationMs);
      } else {
        // Fallback notification if TTS unavailable for dialect
        setVoiceNotice(ttsCap.message || `Voice for ${langDetails.name} is currently unavailable on this device. MANAS will continue in ${langDetails.name} text.`);
        setState('idle');
      }

      // Execute Action / Screen Navigation if suggested by AI
      if (resData.suggested_screen) {
        const targetScreen = resData.suggested_screen.replace('/', '');
        setTimeout(() => {
          navigate(targetScreen, {}, 'patient_app');
        }, 2500);
      }
    } catch (err) {
      console.error('[MANAS AI Error]', err);
      const fallbackMsg = `I'm right here with you, ${patientFirstName}. You can ask me to open games, check your schedule, find family members, or just talk with me!`;
      setResponse(fallbackMsg);
      setState('idle');
      speakText(fallbackMsg, normLang);
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
        onSubmitText={(text) => handleProcessQuery(text)}
        isOnline={isOnline}
        language={language}
        voiceNotice={voiceNotice}
        actionLabel={actionLabel}
        source={responseSource}
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
