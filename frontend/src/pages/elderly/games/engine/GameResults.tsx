import React, { useEffect } from 'react';
import { Award, CheckCircle, RotateCcw, ArrowRight, WifiOff, Sparkles, Trophy, Star } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

interface GameResultsProps {
  title: string;
  score: number;
  accuracy: number;
  timeSpentSec: number;
  adaptiveReason?: string;
  newDifficulty?: number;
  level?: number;
  hasPassed?: boolean;
  isOffline?: boolean;
  onRetry: () => void;
  onNextLevel?: () => void;
  onFinish: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({
  title,
  score,
  accuracy,
  timeSpentSec,
  adaptiveReason = 'Difficulty auto-tuned based on speed and accuracy.',
  newDifficulty = 2,
  level = 1,
  hasPassed = true,
  isOffline = false,
  onRetry,
  onNextLevel,
  onFinish
}) => {
  useEffect(() => {
    if (hasPassed) {
      speakText(`Magnificent job! You passed Level ${level} with ${accuracy} percent accuracy. Ready for Level ${level + 1}?`);
    } else {
      speakText(`Good effort! You scored ${score} points. Let's try Level ${level} again.`);
    }
  }, [score, accuracy, level, hasPassed]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '32px',
      padding: '2rem 1.75rem',
      border: '3px solid #0f766e',
      boxShadow: '0 25px 50px rgba(15, 118, 110, 0.2)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-12px) rotate(-3deg) scale(1.05); }
          50% { transform: translateY(0px) rotate(0deg) scale(1); }
          75% { transform: translateY(-8px) rotate(3deg) scale(1.03); }
        }
        @keyframes starGlow {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.2) rotate(15deg); opacity: 1; }
        }
        @keyframes confettiFloat {
          0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          50% { transform: translateY(-10px) rotate(10deg); opacity: 0.8; }
          100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
        }
      `}</style>

      {/* Floating Confetti Embellishments */}
      {hasPassed && (
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'space-around', pointerEvents: 'none', animation: 'confettiFloat 3s infinite ease-in-out' }}>
          <span style={{ fontSize: '1.75rem' }}>🎉</span>
          <span style={{ fontSize: '1.5rem', animation: 'starGlow 2s infinite' }}>⭐</span>
          <span style={{ fontSize: '1.75rem' }}>✨</span>
          <span style={{ fontSize: '1.5rem', animation: 'starGlow 2.5s infinite' }}>🌟</span>
          <span style={{ fontSize: '1.75rem' }}>🎊</span>
        </div>
      )}

      {/* 3D MANAS Brain Mascot Character Celebration */}
      <div style={{ marginTop: '0.75rem', marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          borderRadius: '50%',
          background: hasPassed
            ? 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(245, 158, 11, 0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
          filter: 'blur(14px)',
          zIndex: 0
        }} />

        <img
          src="/images/manas_brain_mascot.png"
          alt="MANAS Brain Mascot Celebrating"
          style={{
            width: '130px',
            height: '130px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            animation: hasPassed ? 'mascotBounce 2.5s infinite ease-in-out' : 'none',
            filter: 'drop-shadow(0 12px 18px rgba(15, 118, 110, 0.35))'
          }}
        />

        {/* Mascot Speech Bubble */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.95rem',
          padding: '0.45rem 1rem',
          borderRadius: '16px',
          marginTop: '0.5rem',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
          display: 'inline-block'
        }}>
          {hasPassed ? `🏆 "Spectacular! Level ${level} Passed!"` : `"You're doing great! Let's practice!"`}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{
          background: hasPassed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
          color: hasPassed ? '#ffffff' : '#334155',
          fontSize: '0.9rem',
          fontWeight: 800,
          padding: '0.35rem 0.85rem',
          borderRadius: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: hasPassed ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none'
        }}>
          <Sparkles size={14} /> LEVEL {level} {hasPassed ? 'COMPLETED' : 'REVIEW'}
        </span>

        {isOffline ? (
          <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b', fontSize: '0.85rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <WifiOff size={14} /> Offline Cache
          </span>
        ) : (
          <span style={{ background: '#ccfbf1', color: '#0f766e', border: '1px solid #0f766e', fontSize: '0.85rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={14} /> Synced
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
        {hasPassed ? 'Level Cleared! 🎉' : 'Practice Completed'}
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#0f766e', fontWeight: 700, marginBottom: '1.25rem' }}>
        {title}
      </p>

      {/* Metrics Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#f0fdfa', border: '2px solid #ccfbf1', borderRadius: '20px', padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>Level Score</div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a' }}>{score}</div>
        </div>

        <div style={{ background: '#e0e7ff', border: '2px solid #c7d2fe', borderRadius: '20px', padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>Accuracy</div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a' }}>{accuracy}%</div>
        </div>
      </div>

      {/* Adaptive Progress Feedback */}
      <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '1rem 1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f766e', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
          <Trophy size={18} /> Cognitive Progression Feedback
        </div>
        <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600, margin: 0 }}>
          {adaptiveReason}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Continue to Next Level Primary Button */}
        {hasPassed && onNextLevel && (
          <button
            onClick={onNextLevel}
            style={{
              width: '100%',
              padding: '1.15rem 1.5rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.3rem',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            Continue to Level {level + 1} <ArrowRight size={24} />
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              padding: '0.9rem',
              borderRadius: '18px',
              background: '#ffffff',
              border: '3px solid #cbd5e1',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={18} /> Replay Level {level}
          </button>

          <button
            onClick={onFinish}
            style={{
              flex: 1,
              padding: '0.9rem',
              borderRadius: '18px',
              background: '#f1f5f9',
              color: '#334155',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: '2px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            Done (Hub)
          </button>
        </div>
      </div>
    </div>
  );
};
