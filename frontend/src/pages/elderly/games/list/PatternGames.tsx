import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Sparkles, Check, X } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

// ==========================================
// GAME 10: COMPLETE THE PATTERN
// ==========================================
interface CompletePatternContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PATTERN_LEVELS = [
  { sequence: '● ▲ ● ▲', target: '●', options: ['●', '▲', '■'], hint: 'Alternating circle and triangle' },
  { sequence: '■ ■ ● ■ ■ ●', target: '■', options: ['■', '●', '▲'], hint: 'Two squares, then one circle' },
  { sequence: '▲ ■ ● ▲ ■ ●', target: '▲', options: ['▲', '■', '●'], hint: 'Repeating three-symbol cycle' },
  { sequence: '● ● ▲ ▲ ● ●', target: '▲', options: ['▲', '●', '■'], hint: 'Pairs of circles and triangles' }
];

const CompletePatternContent: React.FC<CompletePatternContentProps> = ({ level, recordAttempt, finishGame }) => {
  const currentPattern = PATTERN_LEVELS[(level - 1) % PATTERN_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const handleChoice = (symbol: string) => {
    if (selected !== null) return;
    setSelected(symbol);
    const isCorrect = symbol === currentPattern.target;
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText("Correct! That completes the pattern.");
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Try another symbol to fit the sequence.");
      setTimeout(() => setSelected(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes floatShape {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes pulseTargetQuestion {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(225, 29, 72, 0.6)); }
        }
      `}</style>

      {/* Animated Pattern Display */}
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 900,
        color: '#0f766e',
        marginBottom: '1.5rem',
        letterSpacing: '0.25em',
        background: '#f8fafc',
        padding: '1.25rem',
        borderRadius: '20px',
        border: '2px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {currentPattern.sequence.split(' ').map((item, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              animation: `floatShape 3s infinite ease-in-out ${idx * 0.2}s`
            }}
          >
            {item}
          </span>
        ))}
        <span style={{
          color: '#e11d48',
          display: 'inline-block',
          animation: 'pulseTargetQuestion 1.5s infinite ease-in-out'
        }}>
          ?
        </span>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        Which symbol comes next in Level {level}?
      </p>

      {/* Options Buttons: Neutral styling before answering! */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
        {currentPattern.options.map((s, i) => {
          const isChosen = selected === s;
          const isTarget = s === currentPattern.target;

          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selected !== null) {
            if (isChosen) {
              bg = isTarget ? '#dcfce7' : '#fee2e2';
              border = isTarget ? '#16a34a' : '#dc2626';
              color = isTarget ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(s)}
              disabled={selected !== null && isTarget}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                background: bg,
                border: `3px solid ${border}`,
                color: color,
                fontSize: '2.4rem',
                cursor: selected ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const CompletePatternGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="complete_pattern"
      title="Complete the Pattern"
      domainName="Pattern Recognition"
      instructions="Look at the symbol sequence and tap the symbol that correctly continues the pattern."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <CompletePatternContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 11: COLOR SEQUENCE
// ==========================================
interface ColorSequenceContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const COLOR_LEVELS = [
  { sequence: ['🔴 Red', '🔵 Blue', '🔴 Red', '🔵 Blue'], target: 'Red', label: '🔴 Red', options: ['Red', 'Blue'] },
  { sequence: ['🔵 Blue', '🔵 Blue', '🔴 Red', '🔵 Blue', '🔵 Blue'], target: 'Red', label: '🔴 Red', options: ['Blue', 'Red'] },
  { sequence: ['🔴 Red', '🟡 Yellow', '🔵 Blue', '🔴 Red', '🟡 Yellow'], target: 'Blue', label: '🔵 Blue', options: ['Yellow', 'Blue'] }
];

const ColorSequenceContent: React.FC<ColorSequenceContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = COLOR_LEVELS[(level - 1) % COLOR_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const handleChoice = (color: string) => {
    if (selected !== null) return;
    setSelected(color);
    const isCorrect = color === current.target;
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText(`That's right! ${current.label} comes next.`);
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Notice the color sequence. Try the next color.");
      setTimeout(() => setSelected(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseColorDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 6px rgba(13, 148, 136, 0.4)); }
        }
      `}</style>

      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {current.sequence.map((c, i) => (
            <span key={i} style={{ animation: 'pulseColorDot 2s infinite ease-in-out', display: 'inline-block' }}>
              {c} →
            </span>
          ))}
          <span style={{ color: '#0f766e', fontWeight: 900, fontSize: '1.6rem' }}>?</span>
        </div>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        Select the next color in Level {level}:
      </p>

      {/* Neutral start until answered! */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
        {current.options.map(colorName => {
          const isChosen = selected === colorName;
          const isTarget = colorName === current.target;

          let bg = '#ffffff';
          let border = '#cbd5e1';
          let textColor = '#0f172a';

          if (selected !== null) {
            if (isChosen) {
              bg = isTarget ? '#dcfce7' : '#fee2e2';
              border = isTarget ? '#16a34a' : '#dc2626';
              textColor = isTarget ? '#15803d' : '#b91c1c';
            }
          }

          const displayLabel = colorName === 'Red' ? '🔴 Red' : (colorName === 'Blue' ? '🔵 Blue' : '🟡 Yellow');

          return (
            <button
              key={colorName}
              onClick={() => handleChoice(colorName)}
              disabled={selected !== null && isTarget}
              style={{
                padding: '1.1rem 2.25rem',
                borderRadius: '20px',
                background: bg,
                color: textColor,
                fontWeight: 800,
                fontSize: '1.3rem',
                border: `3px solid ${border}`,
                cursor: selected ? 'default' : 'pointer',
                minHeight: '60px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ColorSequenceGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="color_sequence"
      title="Color Sequence"
      domainName="Pattern Recognition"
      instructions="Predict the next color in the sequence."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <ColorSequenceContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 12: SHAPE SEQUENCE
// ==========================================
interface ShapeSequenceContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const SHAPE_LEVELS = [
  { sequence: ['🟦 Square', '🔺 Triangle', '🟦 Square', '🔺 Triangle'], target: 'Square', correctLabel: '🟦 Square', wrongLabel: '⭐ Star' },
  { sequence: ['🔴 Circle', '⭐ Star', '🔴 Circle', '⭐ Star'], target: 'Circle', correctLabel: '🔴 Circle', wrongLabel: '🔺 Triangle' },
  { sequence: ['🔷 Diamond', '🟦 Square', '🔷 Diamond', '🟦 Square'], target: 'Diamond', correctLabel: '🔷 Diamond', wrongLabel: '🔴 Circle' }
];

const ShapeSequenceContent: React.FC<ShapeSequenceContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = SHAPE_LEVELS[(level - 1) % SHAPE_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const handleChoice = (label: string, isCorrect: boolean) => {
    if (selected !== null) return;
    setSelected(label);
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText(`Correct! ${current.correctLabel} completes the sequence.`);
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Try the other geometric shape.");
      setTimeout(() => setSelected(null), 1000);
    }
  };

  const options = [
    { label: current.correctLabel, isCorrect: true },
    { label: current.wrongLabel, isCorrect: false }
  ];

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes floatGeometric {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(6deg); }
        }
      `}</style>

      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {current.sequence.map((s, i) => (
            <span key={i} style={{ animation: `floatGeometric 3s infinite ease-in-out ${i * 0.25}s`, display: 'inline-block' }}>
              {s} →
            </span>
          ))}
          <span style={{ color: '#0f766e', fontWeight: 900, fontSize: '1.6rem' }}>?</span>
        </div>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        What shape comes next in Level {level}?
      </p>

      {/* NEUTRAL BUTTONS: No pre-answer green background or green border! */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
        {options.map((opt, i) => {
          const isChosen = selected === opt.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selected !== null) {
            if (isChosen) {
              bg = opt.isCorrect ? '#dcfce7' : '#fee2e2';
              border = opt.isCorrect ? '#16a34a' : '#dc2626';
              color = opt.isCorrect ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(opt.label, opt.isCorrect)}
              disabled={selected !== null && opt.isCorrect}
              style={{
                padding: '1.1rem 2.25rem',
                borderRadius: '20px',
                background: bg,
                border: `3px solid ${border}`,
                fontSize: '1.35rem',
                fontWeight: 800,
                color: color,
                cursor: selected ? 'default' : 'pointer',
                minHeight: '60px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ShapeSequenceGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="shape_sequence"
      title="Shape Sequence"
      domainName="Pattern Recognition"
      instructions="Complete the geometric shape progression series."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <ShapeSequenceContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
