import React, { useState } from 'react';
import { Mic, X, Volume2, ArrowRight, Sparkles, AlertCircle, Globe, Info, Send, Key, Check } from 'lucide-react';
import { ManasAssistantState } from './ManasBrainCharacter';
import {
  LanguageCode,
  getLanguageDetails,
  normalizeLanguageCode,
  LOCALIZED_AI_STRINGS,
  checkTTSCapability
} from '../config/languages';
import { getTranslations } from '../config/translations';
import { getStoredGeminiKey, setStoredGeminiKey, hasActiveGeminiKey } from '../services/aiAssistantService';

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
  onSubmitText: (text: string) => void;
  isOnline: boolean;
  language?: LanguageCode;
  voiceNotice?: string | null;
  actionLabel?: string | null;
  source?: 'gemini' | 'smart_engine';
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
  onSubmitText,
  isOnline,
  language = 'en',
  voiceNotice,
  actionLabel,
  source
}) => {
  const [inputText, setInputText] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(getStoredGeminiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  if (!isOpen) return null;

  const hasGemini = hasActiveGeminiKey();

  const normLang = normalizeLanguageCode(language);
  const langDetails = getLanguageDetails(normLang);
  const ttsCapability = checkTTSCapability(normLang);
  const t = getTranslations(normLang);

  const quickPrompts = [
    t.assistant.prompt_today,
    t.assistant.prompt_person,
    t.assistant.prompt_hospital,
    t.assistant.prompt_memories,
    t.assistant.prompt_game
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              padding: '0.35rem 0.65rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)'
            }}
          >
            <Sparkles size={14} /> MANAS AI
          </div>

          {/* AI Mode Indicator Badge */}
          <span
            title={hasGemini ? "Powered by Google Gemini Live AI" : "Powered by MANAS Smart Conversational Engine"}
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: hasGemini ? '#6b21a8' : '#0369a1',
              background: hasGemini ? '#f3e8ff' : '#e0f2fe',
              border: `1px solid ${hasGemini ? '#d8b4fe' : '#bae6fd'}`,
              padding: '2px 7px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {hasGemini ? '✨ Gemini Live' : '🧠 Smart AI'}
          </span>

          {/* Language Indicator */}
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#0f766e',
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              padding: '2px 7px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Globe size={11} /> {langDetails.native}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Key Settings Button */}
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            title="Configure Gemini API Key"
            aria-label="Configure Gemini API Key"
            style={{
              background: hasGemini ? '#f3e8ff' : 'rgba(241, 245, 249, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: hasGemini ? '#7c3aed' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            <Key size={15} />
          </button>

          <button
            onClick={onClose}
            aria-label="Close assistant panel"
            style={{
              background: 'rgba(241, 245, 249, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Optional Gemini API Key Configuration Drawer / Modal */}
      {showKeyModal && (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #d8b4fe',
            borderRadius: '16px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6b21a8' }}>
              🔑 Google Gemini API Key (Optional)
            </span>
            <button
              onClick={() => setShowKeyModal(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>
            Enter a free Google Gemini key to enable infinite generative AI on Vercel. Otherwise, MANAS uses its high-capability Smart Engine.
          </p>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Paste AIzaSy... key"
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem'
              }}
            />
            <button
              onClick={() => {
                setStoredGeminiKey(tempApiKey);
                setKeySavedMessage(true);
                setTimeout(() => {
                  setKeySavedMessage(false);
                  setShowKeyModal(false);
                }, 1200);
              }}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {keySavedMessage ? <Check size={14} /> : 'Save'}
            </button>
          </div>
          {tempApiKey && (
            <button
              onClick={() => {
                setStoredGeminiKey('');
                setTempApiKey('');
                setShowKeyModal(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0
              }}
            >
              Clear saved key (use Smart Engine)
            </button>
          )}
        </div>
      )}

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
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
          {t.assistant.hi.replace('{name}', patientName || 'there')}
        </h3>
        <p style={{ fontSize: '0.98rem', color: '#0f766e', fontWeight: 600 }}>
          {t.assistant.subtitle}
        </p>
      </div>

      {/* Voice & Text Interaction Box */}
      <div
        style={{
          background: state === 'listening' ? 'rgba(240, 253, 250, 0.95)' : (state === 'speaking' ? 'rgba(240, 253, 250, 0.95)' : 'rgba(248, 250, 252, 0.85)'),
          border: `1.5px solid ${state === 'listening' ? '#0d9488' : (state === 'speaking' ? '#14b8a6' : '#e2e8f0')}`,
          borderRadius: '22px',
          padding: '1rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        {/* State Indicators */}
        {state === 'listening' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48' }} />
              {t.assistant.listening}
            </span>
            {/* Animated Equalizer Waveform Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '22px' }}>
              <div className="waveform-bar-1" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-2" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-3" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-4" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
              <div className="waveform-bar-5" style={{ width: '4px', background: '#0d9488', borderRadius: '2px' }} />
            </div>
            {transcript ? (
              <div style={{ width: '100%', marginTop: '0.25rem' }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, background: '#ffffff', border: '1.5px solid #99f6e4', padding: '0.5rem 0.8rem', borderRadius: '12px', margin: 0, boxShadow: '0 2px 8px rgba(13,148,136,0.1)' }}>
                  "{transcript}"
                </p>
                <span style={{ fontSize: '0.75rem', color: '#0f766e', marginTop: '0.2rem', display: 'block' }}>{t.assistant.hearing}</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {t.assistant.prompt_today} • {t.assistant.prompt_game}
              </span>
            )}
          </div>
        )}

        {state === 'thinking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontWeight: 700 }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span> {t.assistant.thinking}
          </div>
        )}

        {state === 'speaking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontWeight: 700 }}>
            <span style={{ fontSize: '1.25rem' }}>🗣️</span> {t.assistant.speaking}
          </div>
        )}

        {state === 'idle' && (
          <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
            {t.assistant.subtitle}
          </p>
        )}

        {/* User Transcript Display when not listening */}
        {state !== 'listening' && transcript && (
          <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: '#1e293b', background: 'rgba(255, 255, 255, 0.85)', padding: '0.4rem 0.8rem', borderRadius: '12px', width: '100%', margin: 0 }}>
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
            borderRadius: '16px',
            padding: '0.7rem 1.4rem',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 6px 18px rgba(13, 148, 136, 0.25)',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <Mic size={20} />
          {state === 'listening' ? t.assistant.stop_listening : t.assistant.tap_to_speak}
        </button>

        {/* Text Input Form for Typing Commands */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim()) {
              onSubmitText(inputText.trim());
              setInputText('');
            }
          }}
          style={{ display: 'flex', gap: '0.4rem', width: '100%' }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.assistant.type_placeholder}
            style={{
              flex: 1,
              padding: '0.65rem 0.9rem',
              borderRadius: '14px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || state === 'thinking'}
            aria-label="Send command"
            style={{
              background: inputText.trim() ? '#0d9488' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'background 0.15s ease',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Response Display Box with Action Pill */}
      {response && (
        <div
          style={{
            background: 'rgba(240, 253, 250, 0.95)',
            borderLeft: '5px solid #0d9488',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 700, fontSize: '0.82rem' }}>
              <Volume2 size={16} /> MANAS says:
            </div>
            {actionLabel && (
              <span
                style={{
                  background: '#ccfbf1',
                  color: '#0f766e',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '8px'
                }}
              >
                {actionLabel}
              </span>
            )}
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.45, margin: 0 }}>
            {response}
          </p>
        </div>
      )}

      {/* Quick Prompt Chips in Selected Language */}
      <div>
        <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
          Quick Questions ({langDetails.name})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(promptText)}
              className="touch-target"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '12px',
                padding: '0.55rem 0.8rem',
                textAlign: 'left',
                fontSize: '0.88rem',
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
              <ArrowRight size={15} color="#0d9488" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
