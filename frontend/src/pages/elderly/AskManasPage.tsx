import React, { useState } from 'react';
import { ArrowLeft, Mic, Volume2, ArrowRight, MapPin } from 'lucide-react';
import { speakText, createSpeechRecognizer } from '../../utils/speech';
import { fetchApi } from '../../utils/api';
import { useOffline } from '../../context/OfflineContext';
import { ManasLoader } from '../../components/ManasLoader';
import { PageTransition } from '../../components/PageTransition';

interface AskManasPageProps {
  onBack: () => void;
  onNavigate: (screen: string, placeId?: number) => void;
}

export const AskManasPage: React.FC<AskManasPageProps> = ({ onBack, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any | null>(null);
  const { isOnline } = useOffline();

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
            body: { transcript: queryText }
          });
        } else {
          // Local fallback parsing
          const q = queryText.toLowerCase();
          if (q.includes('hospital') || q.includes('where is')) {
            resData = {
              spoken_response: "Your hospital is Shillong Medical Centre, located at Laitumkhrah.",
              action: "SHOW_PLACE_ROUTE",
              suggested_screen: "/places",
              place: { id: 1, name: 'Shillong Medical Centre' }
            };
          } else if (q.includes('arun') && (q.includes('where') || q.includes('go'))) {
            resData = {
              spoken_response: "You visited Shillong Peak with Arun and Ravi. Memory: Family Trip to Shillong Peak.",
              action: "SHOW_PLACE_ROUTE",
              suggested_screen: "/places",
              place: { id: 4, name: "Ward's Lake & Park" }
            };
          } else {
            resData = {
              spoken_response: "Here is your plan for today, Vivek: Morning tea completed, Medicine at 8:00 PM.",
              action: "NAVIGATE_TODAY",
              suggested_screen: "/today"
            };
          }
        }

        setResponse(resData.spoken_response);
        setActionData(resData);
        speakText(resData.spoken_response);
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
      () => setIsListening(false)
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
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
        {/* Navigation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button onClick={onBack} style={{ background: '#ffffff', border: '2px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
            <ArrowLeft size={22} /> Home
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            ASK MANAS
          </h1>
        </div>

        {/* Main Card (OR Thinking Loader) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '32px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 40px -10px rgba(15, 118, 110, 0.12)',
          border: '3px solid #ccfbf1',
          textAlign: 'center',
          marginBottom: '1.75rem'
        }}>
          {isThinking ? (
            <ManasLoader
              type="ai"
              message="MANAS is thinking..."
              submessage="Searching stored memories, people, and routines..."
              fullScreen={false}
            />
          ) : (
            <>
              <button
                onClick={startListening}
                className={isListening ? 'animate-pulse-mic' : ''}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: isListening ? '#0f766e' : 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 35px rgba(15, 118, 110, 0.4)',
                  marginBottom: '1.25rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Mic size={54} />
              </button>

              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a' }}>
                {isListening ? '🎤 Listening... Speak now' : 'Ask MANAS'}
              </h2>
              <p style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0f766e', marginTop: '0.25rem' }}>
                "How can I help you today?"
              </p>

              {transcript && (
                <p style={{ fontStyle: 'italic', color: '#0f766e', marginTop: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
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
            marginBottom: '1.75rem',
            boxShadow: '0 10px 25px rgba(15, 118, 110, 0.1)',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Volume2 size={24} color="#0f766e" />
              <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '1.2rem' }}>MANAS Assistant:</span>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
              {response}
            </p>

            {/* Action Launcher Button */}
            {actionData && actionData.action === 'SHOW_PLACE_ROUTE' && (
              <button
                onClick={() => onNavigate('places', actionData.place?.id)}
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '18px',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <MapPin size={24} /> SHOW ROUTE ON MAP
              </button>
            )}
          </div>
        )}

        {/* Suggested Voice Prompts */}
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#475569', marginBottom: '0.85rem' }}>
          Tap a question to ask:
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            "Where is my hospital?",
            "Where did I go with Arun?",
            "What do I have to do today?",
            "Who is Arun?",
            "What is my next reminder?",
            "Open my memories."
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessQuery(prompt)}
              style={{
                background: '#ffffff',
                border: '2px solid #cbd5e1',
                borderRadius: '20px',
                padding: '1.1rem 1.5rem',
                textAlign: 'left',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
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
