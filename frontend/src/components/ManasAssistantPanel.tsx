import React from 'react';
import { Mic, X, Volume2, ArrowRight, Sparkles, AlertCircle, Globe, Info } from 'lucide-react';
import { ManasAssistantState } from './ManasBrainCharacter';
import {
  LanguageCode,
  getLanguageDetails,
  normalizeLanguageCode,
  LOCALIZED_AI_STRINGS,
  checkTTSCapability
} from '../config/languages';

interface ManasAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: ManasAssistantState;
  transcript: string;
  response: string | null;
  patientName: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onSelectPrompt: (promptText: string) => void;
  isOnline: boolean;
  language?: LanguageCode;
  voiceNotice?: string | null;
}

export const ManasAssistantPanel: React.FC<ManasAssistantPanelProps> = ({
  isOpen,
  onClose,
  state,
  transcript,
  response,
  patientName,
  onStartListening,
  onStopListening,
  onSelectPrompt,
  isOnline,
  language = 'en',
  voiceNotice
}) => {
  if (!isOpen) return null;

  const normLang = normalizeLanguageCode(language);
  const langDetails = getLanguageDetails(normLang);
  const ttsCapability = checkTTSCapability(normLang);

  const quickPrompts = [
    LOCALIZED_AI_STRINGS.quick_prompt_today[normLang] || "What do I have today?",
    LOCALIZED_AI_STRINGS.quick_prompt_person[normLang] || "Who is Arun?",
    LOCALIZED_AI_STRINGS.quick_prompt_hospital[normLang] || "Where is the hospital?",
    LOCALIZED_AI_STRINGS.quick_prompt_memories[normLang] || "Show my memories",
    LOCALIZED_AI_STRINGS.quick_prompt_game[normLang] || "Let's play a game"
  ];

  return (
    <div
      role="dialog"
      aria-label="MANAS AI Conversation"
      className="manas-speech-bubble-panel animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '130px',
        right: '12px',
        width: '390px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'rgba(255, 255, 255, 0.93)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px 30px 6px 30px',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.16), 0 0 25px rgba(0, 242, 254, 0.2), 0 0 50px rgba(139, 92, 246, 0.12)',
        padding: '1.35rem 1.4rem',
        zIndex: 2100,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* Speech Bubble Connection Tail Pointing to Brain Character */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-14px',
          right: '42px',
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '16px solid rgba(255, 255, 255, 0.93)',
          filter: 'drop-shadow(0 4px 4px rgba(15, 23, 42, 0.08))',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              padding: '0.4rem 0.7rem',
              borderRadius: '14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)'
            }}
          >
            <Sparkles size={16} /> MANAS AI
          </div>

          {/* Single Authoritative Language Indicator */}
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0f766e',
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              padding: '3px 8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Globe size={12} /> {langDetails.native}
          </span>

          {!isOnline && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#e11d48',
                background: '#ffe4e6',
                padding: '2px 8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertCircle size={12} /> Offline
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close assistant panel"
          style={{
            background: 'rgba(241, 245, 249, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'background 0.2s ease'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Honest Device Capability Indicator if Voice is Unavailable */}
      {(!ttsCapability.available || voiceNotice) && (
        <div
          style={{
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '14px',
            padding: '0.55rem 0.8rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: '#0f766e',
            lineHeight: 1.35
          }}
        >
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{voiceNotice || ttsCapability.message}</span>
        </div>
      )}

      {/* Warm Conversational Heading */}
      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
          Hi {patientName || 'there'}! 👋
        </h3>
        <p style={{ fontSize: '1.05rem', color: '#0f766e', fontWeight: 600 }}>
          I'm MANAS. How can I help you today?
        </p>
      </div>

      {/* Voice Interaction & Waveform Box */}
      <div
        style={{
          background: state === 'listening' ? 'rgba(240, 253, 250, 0.95)' : (state === 'speaking' ? 'rgba(240, 253, 250, 0.95)' : 'rgba(248, 250, 252, 0.85)'),
          border: `1.5px solid ${state === 'listening' ? '#0d9488' : (state === 'speaking' ? '#14b8a6' : '#e2e8f0')}`,
          borderRadius: '22px',
          padding: '1.1rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        {/* State Indicators */}
        {state === 'listening' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d9488' }}>
              🎙️ Listening to you...
            </span>
            {/* Animated Equalizer Waveform Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '28px' }}>
              <div className="waveform-bar-1" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-2" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-3" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-4" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-5" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
            </div>
          </div>
        )}

        {state === 'thinking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontWeight: 700 }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span> Processing your thought...
          </div>
        )}

        {state === 'speaking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontWeight: 700 }}>
            <span style={{ fontSize: '1.25rem' }}>🗣️</span> Speaking in {langDetails.name}...
          </div>
        )}

        {state === 'idle' && (
          <p style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
            Speak naturally or tap a question below:
          </p>
        )}

        {/* User Spoken Transcript */}
        {transcript && (
          <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#1e293b', background: 'rgba(255, 255, 255, 0.85)', padding: '0.45rem 0.85rem', borderRadius: '12px', width: '100%' }}>
            "{transcript}"
          </p>
        )}

        {/* Primary Mic Button */}
        <button
          onClick={state === 'listening' ? onStopListening : onStartListening}
          className={state === 'listening' ? 'animate-pulse-mic touch-target' : 'touch-target'}
          style={{
            background: state === 'listening' ? '#e11d48' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '18px',
            padding: '0.8rem 1.5rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <Mic size={22} />
          {state === 'listening' ? 'Stop Listening' : '🎙️ Tap to Speak'}
        </button>
      </div>

      {/* Response Display Box */}
      {response && (
        <div
          style={{
            background: 'rgba(240, 253, 250, 0.95)',
            borderLeft: '5px solid #0d9488',
            borderRadius: '16px',
            padding: '0.9rem 1.1rem',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            <Volume2 size={16} /> MANAS says ({langDetails.native}):
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.45 }}>
            {response}
          </p>
        </div>
      )}

      {/* Quick Prompt Chips in Selected Language */}
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          Quick Questions ({langDetails.name})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '170px', overflowY: 'auto' }}>
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(promptText)}
              className="touch-target"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '14px',
                padding: '0.65rem 0.9rem',
                textAlign: 'left',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>💬 "{promptText}"</span>
              <ArrowRight size={16} color="#0d9488" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
