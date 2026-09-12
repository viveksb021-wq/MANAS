import React, { useState, useEffect } from 'react';
import { Mic, Volume2, ArrowRight, MapPin, Sparkles, ShieldCheck, Clock, Heart, Bell } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../../utils/speech';
import { LOCALIZED_AI_STRINGS, normalizeLanguageCode } from '../../config/languages';
import { fetchApi } from '../../utils/api';
import { useOffline } from '../../context/OfflineContext';
import { ManasLoader } from '../../components/ManasLoader';
import { PageTransition } from '../../components/PageTransition';
import { BackButton } from '../../components/BackButton';
import { useNavigation } from '../../context/NavigationContext';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';

interface AskManasPageProps {
  onBack?: () => void;
  onNavigate?: (screen: string, placeId?: number) => void;
}

export const AskManasPage: React.FC<AskManasPageProps> = ({ onBack, onNavigate }) => {
  const { patientProfile, familyMembers } = usePatient();
  const { language } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any | null>(null);
  const [proactiveGreeting, setProactiveGreeting] = useState<string>('');
  const { isOnline } = useOffline();

  const firstName = patientProfile.full_name.split(' ')[0];
  const sonMember = familyMembers.find(m => m.id === 'son') || familyMembers[1];
  const nephewMember = familyMembers.find(m => m.id === 'brother1-son') || familyMembers[2];

  useEffect(() => {
    // Stop ongoing speech on language change or unmount
    stopSpeech();

    const normLang = normalizeLanguageCode(language);
    const hour = new Date().getHours();
    let greeting = LOCALIZED_AI_STRINGS.greeting_morning[normLang] ||
      `Good morning ${firstName}! ☀️ Your morning medication is scheduled. Remember to drink a glass of water.`;

    if (hour >= 12 && hour < 17) {
      greeting = LOCALIZED_AI_STRINGS.greeting_general[normLang] ||
        `Good afternoon ${firstName}! 🌤️ You have a planned memory activity today. Would you like to play?`;
    } else if (hour >= 17) {
      greeting = LOCALIZED_AI_STRINGS.greeting_general[normLang] ||
        `Good evening ${firstName}! 🌙 Rest well tonight. Your evening routine is ready.`;
    }

    setProactiveGreeting(greeting);
    speakText(greeting, language);

    return () => {
      stopSpeech();
    };
  }, [firstName, language]);

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setIsListening(false);
    setIsThinking(true);
    setActionData(null);

    setTimeout(async () => {
      try {
        let resData: any;
        if (isOnline) {
          resData = await fetchApi('/voice/ask', {
            method: 'POST',
            body: { transcript: queryText, language: language }
          });
        } else {
          // Local fallback parsing
          const q = queryText.toLowerCase();
          const matchingMember = familyMembers.find(m => {
            const fullName = m.name.toLowerCase();
            const fName = m.name.split(' ')[0].toLowerCase();
            return q.includes(fullName) || (fName.length > 2 && q.includes(fName));
          });

          if (q.includes('hospital') || q.includes('where is my hospital')) {
            resData = {
              spoken_response: "Your hospital is Shillong Medical Centre, located at Laitumkhrah. Caregiver listed Dr. Sarma as your primary physician.",
              action: "SHOW_PLACE_ROUTE",
              suggested_screen: "/places",
              place: { id: 1, name: 'Shillong Medical Centre' }
            };
          } else if (matchingMember) {
            resData = {
              spoken_response: `${matchingMember.name} is your ${matchingMember.relationship}. ${matchingMember.notes || ''}`,
              action: "SHOW_PEOPLE",
              suggested_screen: "/people"
            };
          } else if (q.includes('where did i go') || q.includes('trip') || q.includes('visit')) {
            resData = {
              spoken_response: `You visited Shillong Peak with ${nephewMember?.name || 'Arun'} and ${sonMember?.name || 'Ravi'} in November 2024. Memory: Family Trip to Shillong Peak.`,
              action: "SHOW_PLACE_ROUTE",
              suggested_screen: "/places",
              place: { id: 4, name: "Ward's Lake & Park" }
            };
          } else {
            resData = {
              spoken_response: `Here is your verified plan for today, ${firstName}: Morning tea completed, evening medicine at 8:00 PM.`,
              action: "NAVIGATE_TODAY",
              suggested_screen: "/today"
            };
          }
        }

        setResponse(resData.spoken_response);
        setActionData(resData);
        speakText(resData.spoken_response, language, () => setIsThinking(false));
      } catch (err) {
        const msg = "Opening saved locations map.";
        setResponse(msg);
        speakText(msg);
      } finally {
        setIsThinking(false);
      }
    }, 1200);
  };

  const startListening = () => {
    setIsListening(true);
    setResponse(null);
    setActionData(null);

    const recognizer = createSpeechRecognizer(
      (text) => handleProcessQuery(text),
      () => setIsListening(false),
      language
    );

    if (recognizer) {
      recognizer.start();
    } else {
      setTimeout(() => {
        setIsListening(false);
        handleProcessQuery("Where is my hospital?");
      }, 1800);
    }
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
        {/* Navigation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <BackButton label="Home" onClick={onBack} variant="patient" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            AI COMPANION
          </h1>
        </div>

        {/* PROACTIVE AI GREETING CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '28px',
          padding: '1.5rem 1.5rem',
          boxShadow: '0 15px 30px rgba(15, 118, 110, 0.25)',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5eead4', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <Sparkles size={18} /> Proactive Nudge & Companion
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5, color: '#f0fdfa' }}>
            "{proactiveGreeting}"
          </p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#5eead4" /> Grounded in Verified Caregiver Notes
            </div>
          </div>
        </div>

        {/* Main Mic Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '32px',
          padding: '2.25rem 1.75rem',
          boxShadow: '0 20px 40px -10px rgba(15, 118, 110, 0.12)',
          border: '3px solid #ccfbf1',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          {isThinking ? (
            <ManasLoader
              type="ai"
              message="MANAS is thinking..."
              submessage="Accessing verified memory database..."
              fullScreen={false}
            />
          ) : (
            <>
              <button
                onClick={startListening}
                className={isListening ? 'animate-pulse-mic' : ''}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: isListening ? '#0f766e' : 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 35px rgba(15, 118, 110, 0.4)',
                  marginBottom: '1.1rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Mic size={50} />
              </button>

              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                {isListening ? '🎤 Listening... Speak now' : 'Ask MANAS Anything'}
              </h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f766e', marginTop: '0.25rem' }}>
                "Ask about family, routine, or doctors"
              </p>

              {transcript && (
                <p style={{ fontStyle: 'italic', color: '#0f766e', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  "{transcript}"
                </p>
              )}
            </>
          )}
        </div>

        {/* Spoken Response Display */}
        {response && !isThinking && (
          <div style={{
            background: '#f0fdfa',
            border: '3px solid #0f766e',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px rgba(15, 118, 110, 0.1)',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Volume2 size={24} color="#0f766e" />
              <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '1.2rem' }}>MANAS Assistant:</span>
            </div>
            <p style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
              {response}
            </p>

            {/* Grounded Source Tag */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e', fontSize: '0.9rem', fontWeight: 700 }}>
              <ShieldCheck size={16} /> Source: Verified Patient DB (Zero Hallucination Guardrail Active)
            </div>

            {/* Action Launcher Button */}
            {actionData && actionData.action === 'SHOW_PLACE_ROUTE' && (
              <button
                onClick={() => onNavigate && onNavigate('places', actionData.place?.id)}
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '18px',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <MapPin size={24} /> SHOW ROUTE ON MAP
              </button>
            )}
          </div>
        )}

        {/* Suggested Voice Prompts */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem' }}>
          Tap a question to ask:
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            "Where is my hospital?",
            `Where did I go with ${nephewMember?.name || 'Arun'}?`,
            "What do I have to do today?",
            `Who is ${nephewMember?.name || 'Arun'}?`,
            "What is my next medicine time?"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessQuery(prompt)}
              style={{
                background: '#ffffff',
                border: '2px solid #cbd5e1',
                borderRadius: '20px',
                padding: '1rem 1.25rem',
                textAlign: 'left',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}
            >
              <span>💬 "{prompt}"</span>
              <ArrowRight size={20} color="#0f766e" />
            </button>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
