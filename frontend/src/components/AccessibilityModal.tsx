import React, { useState } from 'react';
import { X, Sun, Moon, Volume2, Globe, Eye, Zap } from 'lucide-react';
import { useAuth, LanguageCode } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../config/languages';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { isHighContrast, toggleHighContrast, language, setLanguage, textSizeScale, setTextSizeScale } = useAuth();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '32px',
        maxWidth: '540px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#ccfbf1', padding: '0.75rem', borderRadius: '16px', color: '#0d9488' }}>
              <Eye size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Accessibility Settings</h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Customize your visual & voice experience</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
            <X size={24} color="#64748b" />
          </button>
        </div>

        {/* Setting 1: High Contrast */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isHighContrast ? <Sun size={24} color="#eab308" /> : <Moon size={24} color="#64748b" />}
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>High Contrast Mode</div>
              <div style={{ fontSize: '0.95rem', color: '#64748b' }}>High legibility yellow-on-dark contrast</div>
            </div>
          </div>
          <button
            onClick={toggleHighContrast}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              background: isHighContrast ? '#ffff00' : '#0d9488',
              color: isHighContrast ? '#000000' : '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isHighContrast ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {/* Setting 2: Text Size Scale */}
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Text Size Scale</div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { label: 'Normal (1.0x)', val: 1.0 },
              { label: 'Large (1.25x)', val: 1.25 },
              { label: 'Extra Large (1.5x)', val: 1.5 }
            ].map(scale => (
              <button
                key={scale.val}
                onClick={() => setTextSizeScale(scale.val)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  background: textSizeScale === scale.val ? '#0d9488' : '#ffffff',
                  color: textSizeScale === scale.val ? '#ffffff' : '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={24} color="#0d9488" />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Language</div>
              <div style={{ fontSize: '0.95rem', color: '#64748b' }}>Select preferred language</div>
            </div>
          </div>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as LanguageCode)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '14px',
              border: '2px solid #cbd5e1',
              fontWeight: 800,
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '18px',
            background: '#0d9488',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.2rem',
            border: 'none'
          }}
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
