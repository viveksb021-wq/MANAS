import React, { useEffect } from 'react';
import { Play, Volume2, Sparkles, Brain } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

interface GameInstructionsProps {
  title: string;
  instructionsText: string;
  domainName: string;
  estimatedDuration?: string;
  onStart: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  title,
  instructionsText,
  domainName,
  estimatedDuration = '3-5 min',
  onStart
}) => {
  useEffect(() => {
    speakText(`Activity: ${title}. ${instructionsText}`);
  }, [title, instructionsText]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '28px',
      padding: '2.25rem 2rem',
      border: '3px solid #ccfbf1',
      boxShadow: '0 20px 40px rgba(15, 118, 110, 0.12)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        background: '#ccfbf1',
        color: '#0f766e',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <Brain size={44} />
      </div>

      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
        {domainName} Activity
      </div>

      <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
        {title}
      </h2>

      <div style={{
        background: '#f0fdfa',
        border: '2px solid #ccfbf1',
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f766e', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} /> How to Play:
        </div>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>
          {instructionsText}
        </p>
      </div>

      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: '1.75rem' }}>
        ⏱️ Estimated Duration: <strong>{estimatedDuration}</strong> • Calm, Stress-Free Pace
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '1.15rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.35rem',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          cursor: 'pointer',
          boxShadow: '0 12px 25px rgba(15, 118, 110, 0.35)'
        }}
      >
        <Play size={26} /> Start Activity
      </button>
    </div>
  );
};
