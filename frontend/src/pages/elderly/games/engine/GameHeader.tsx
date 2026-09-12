import React from 'react';
import { BackButton } from '../../../../components/BackButton';
import { Volume2, VolumeX, Award, Sparkles } from 'lucide-react';
import { speakText, stopSpeech } from '../../../../utils/speech';

interface GameHeaderProps {
  title: string;
  domainName: string;
  difficultyLevel: number;
  level?: number;
  onBack?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  domainName,
  difficultyLevel,
  level = 1,
  onBack
}) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeech();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakText(`${title}. ${domainName}. Level ${level}`);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.5rem' }}>
      <BackButton label="Back" onClick={onBack} variant="patient" />

      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#ffffff',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
          }}>
            <Sparkles size={13} /> LEVEL {level}
          </span>
          <span style={{
            background: '#f1f5f9',
            color: '#475569',
            padding: '0.25rem 0.65rem',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {domainName}
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
          {title}
        </h1>
      </div>

      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
        style={{
          background: '#ffffff',
          border: '2px solid #cbd5e1',
          borderRadius: '16px',
          padding: '0.65rem',
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isMuted ? '#94a3b8' : '#0f766e',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
        }}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};
