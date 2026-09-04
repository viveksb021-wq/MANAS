import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Send, ArrowRight } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../utils/speech';
import { fetchApi } from '../utils/api';
import { useOffline } from '../context/OfflineContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isOnline } = useOffline();

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsListening(false);
      setResponse(null);
      setTranscript('');
    }
  }, [isOpen]);

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setIsListening(false);

    try {
      let resData: any;
      if (isOnline) {
        resData = await fetchApi('/voice/ask', {
          method: 'POST',
          body: { transcript: queryText }
        });
      } else {
        // Fallback local intent processing when offline
        const q = queryText.toLowerCase();
        if (q.includes('today') || q.includes('do')) {
          resData = {
            spoken_response: "Here is your plan for today, Vivek: 07:30 AM Tea & Breathing, 08:00 AM Blood Pressure Medicine, 10:00 AM Cognitive Training Activity.",
            action: "NAVIGATE_TODAY",
            suggested_screen: "/today"
          };
        } else if (q.includes('arun') || q.includes('who')) {
          resData = {
            spoken_response: "Arun is your 14-year-old grandson. He plays guitar and loves visiting Shillong.",
            action: "NAVIGATE_PEOPLE"
          };
        } else if (q.includes('game') || q.includes('play')) {
          resData = {
            spoken_response: "Opening today's cognitive game!",
            suggested_screen: "/games"
          };
        } else {
          resData = {
            spoken_response: `I heard '${queryText}'. I'm currently running in offline mode. You can view your memories, games, and daily reminders directly!`,
            action: "NONE"
          };
        }
      }

      setResponse(resData.spoken_response);
      setIsSpeaking(true);
      speakText(resData.spoken_response);

      if (resData.suggested_screen && onNavigate) {
        setTimeout(() => {
          onClose();
          onNavigate(resData.suggested_screen);
        }, 3000);
      }
    } catch (err) {
      const fallbackMsg = "I'm having trouble processing that right now. Let me show you today's schedule.";
      setResponse(fallbackMsg);
      speakText(fallbackMsg);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setResponse(null);
    const recognizer = createSpeechRecognizer(
      (text) => handleProcessQuery(text),
      () => setIsListening(false)
    );

    if (recognizer) {
      recognizer.start();
    } else {
      // Browser fallback demo simulation
      setTimeout(() => {
        setIsListening(false);
        handleProcessQuery("What do I have to do today?");
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: '16px', color: '#0d9488' }}>
              <Mic size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Ask MANAS</h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Speak or select a question</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
            <X size={24} color="#64748b" />
          </button>
        </div>

        {/* Listening / Microphone Box */}
        <div style={{
          background: isListening ? '#f0fdfa' : '#f8fafc',
          border: isListening ? '3px solid #0d9488' : '2px dashed #cbd5e1',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={startListening}
            className={isListening ? 'animate-pulse-mic' : ''}
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: isListening ? '#0d9488' : '#14b8a6',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(13, 148, 136, 0.3)',
              marginBottom: '1rem'
            }}
          >
            {isListening ? <Mic size={44} /> : <Mic size={44} />}
          </button>
          
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: isListening ? '#0d9488' : '#334155' }}>
            {isListening ? '🎤 Listening... Speak now' : 'Tap Microphone to Speak'}
          </h3>
          {transcript && (
            <p style={{ fontStyle: 'italic', color: '#475569', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              "{transcript}"
            </p>
          )}
        </div>

        {/* Assistant Spoken Response Display */}
        {response && (
          <div style={{
            background: '#f0fdfa',
            borderLeft: '6px solid #0d9488',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Volume2 size={20} color="#0d9488" />
              <span style={{ fontWeight: 700, color: '#0d9488', fontSize: '1.1rem' }}>MANAS says:</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
              {response}
            </p>
          </div>
        )}

        {/* Quick Sample Voice Intent Prompts */}
        <div>
          <p style={{ fontWeight: 700, color: '#475569', marginBottom: '0.75rem', fontSize: '1rem' }}>Or tap a quick question:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              "What do I have to do today?",
              "Who is Arun?",
              "What is my next reminder?",
              "Open my memories.",
              "Start today's game."
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleProcessQuery(prompt)}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '0.85rem 1.25rem',
                  textAlign: 'left',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>💬 "{prompt}"</span>
                <ArrowRight size={18} color="#0d9488" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
