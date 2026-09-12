import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Calculator, Lightbulb } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

// ==========================================
// GAME 13: SIMPLE SUDOKU (4x4 Beginner)
// ==========================================
interface SimpleSudokuContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const SimpleSudokuContent: React.FC<SimpleSudokuContentProps> = ({ level, recordAttempt, finishGame }) => {
  // 4x4 Mini Sudoku Board with missing cell
  const [board, setBoard] = useState<(number | null)[][]>(() => {
    return [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 3, 4, 1],
      [4, 1, null, 3]
    ];
  });
  const [showHint, setShowHint] = useState(false);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const handleNumberSelect = (num: number) => {
    if (selectedNum === 2) return;
    setSelectedNum(num);

    if (num === 2) {
      recordAttempt(true);
      setBoard(prev => {
        const copy = prev.map(row => [...row]);
        copy[3][2] = 2;
        return copy;
      });
      speakText("Correct! Number 2 completes the Sudoku row and column.");
      setTimeout(() => finishGame(100), 1000);
    } else {
      recordAttempt(false);
      speakText("Number already exists in that row. Try another number.");
      setTimeout(() => setSelectedNum(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseEmptyCell {
          0%, 100% { transform: scale(1); border-color: #e11d48; }
          50% { transform: scale(1.05); border-color: #f43f5e; box-shadow: 0 0 10px rgba(225, 29, 72, 0.4); }
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        maxWidth: '300px',
        margin: '0 auto 1.25rem auto',
        background: '#0f766e',
        padding: '8px',
        borderRadius: '20px'
      }}>
        {board.flatMap((row, rIdx) =>
          row.map((val, cIdx) => {
            const isTarget = rIdx === 3 && cIdx === 2;
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                style={{
                  height: '62px',
                  borderRadius: '12px',
                  border: isTarget ? '3px dashed #e11d48' : 'none',
                  background: isTarget ? '#fff1f2' : '#ffffff',
                  color: isTarget ? '#e11d48' : '#0f172a',
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  animation: isTarget && val === null ? 'pulseEmptyCell 2s infinite ease-in-out' : 'none'
                }}
              >
                {val !== null ? val : '?'}
              </div>
            );
          })
        )}
      </div>

      {showHint && (
        <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', padding: '0.75rem', borderRadius: '16px', color: '#92400e', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          💡 Hint: Look at bottom row. The numbers present are 4, 1, ?, 3.
        </div>
      )}

      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
        Select missing number for highlighted cell (Level {level}):
      </p>

      {/* NEUTRAL BUTTONS: Neutral before selection */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[1, 2, 3, 4].map(n => {
          const isChosen = selectedNum === n;
          let border = '#cbd5e1';
          let bg = '#ffffff';
          let color = '#0f172a';

          if (selectedNum !== null) {
            if (isChosen) {
              border = n === 2 ? '#16a34a' : '#dc2626';
              bg = n === 2 ? '#dcfce7' : '#fee2e2';
              color = n === 2 ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={n}
              onClick={() => handleNumberSelect(n)}
              disabled={selectedNum === 2}
              style={{
                width: '66px',
                height: '66px',
                borderRadius: '18px',
                background: bg,
                border: `3px solid ${border}`,
                fontSize: '1.6rem',
                fontWeight: 800,
                color: color,
                cursor: selectedNum === 2 ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 3px 8px rgba(0,0,0,0.05)'
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {!showHint && selectedNum !== 2 && (
        <button
          onClick={() => setShowHint(true)}
          style={{ background: '#fffbe8', border: '2px solid #f59e0b', color: '#b45309', padding: '0.65rem 1.25rem', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Lightbulb size={18} /> Need a Hint?
        </button>
      )}
    </div>
  );
};

export const SimpleSudokuGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="simple_sudoku"
      title="Beginner 4x4 Sudoku"
      domainName="Reasoning"
      instructions="Fill the missing cell so every row and column contains numbers 1, 2, 3, and 4."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <SimpleSudokuContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 14: NUMBER PATTERN
// ==========================================
interface NumberPatternContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const NUMBER_LEVELS = [
  { sequence: '2 → 4 → 6 →', target: 8, options: [7, 8, 9, 10], explanation: 'Counting by twos (+2)' },
  { sequence: '5 → 10 → 15 →', target: 20, options: [18, 20, 22, 25], explanation: 'Counting by fives (+5)' },
  { sequence: '10 → 20 → 30 →', target: 40, options: [35, 40, 45, 50], explanation: 'Counting by tens (+10)' }
];

const NumberPatternContent: React.FC<NumberPatternContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = NUMBER_LEVELS[(level - 1) % NUMBER_LEVELS.length];
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const handleChoice = (num: number) => {
    if (selectedNum !== null) return;
    setSelectedNum(num);
    const isCorrect = num === current.target;
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText(`Correct! ${current.explanation}: next is ${current.target}.`);
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Notice the mathematical step and try again.");
      setTimeout(() => setSelectedNum(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseNumberTarget {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(225, 29, 72, 0.5)); }
        }
      `}</style>

      <div style={{
        fontSize: '2.5rem',
        fontWeight: 900,
        color: '#0f766e',
        marginBottom: '1.5rem',
        letterSpacing: '0.15em',
        background: '#f8fafc',
        padding: '1.25rem',
        borderRadius: '20px',
        border: '2px solid #e2e8f0'
      }}>
        {current.sequence} <span style={{ color: '#e11d48', display: 'inline-block', animation: 'pulseNumberTarget 1.5s infinite ease-in-out' }}>?</span>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        What number comes next in Level {level}?
      </p>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
        {current.options.map(n => {
          const isChosen = selectedNum === n;
          const isTarget = n === current.target;

          let border = '#cbd5e1';
          let bg = '#ffffff';
          let color = '#0f172a';

          if (selectedNum !== null) {
            if (isChosen) {
              border = isTarget ? '#16a34a' : '#dc2626';
              bg = isTarget ? '#dcfce7' : '#fee2e2';
              color = isTarget ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={n}
              onClick={() => handleChoice(n)}
              disabled={selectedNum !== null && isTarget}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '20px',
                background: bg,
                border: `3px solid ${border}`,
                fontSize: '1.8rem',
                fontWeight: 800,
                color: color,
                cursor: selectedNum ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const NumberPatternGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="number_pattern"
      title="Number Pattern"
      domainName="Reasoning"
      instructions="Look at the sequence and select what number comes next."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <NumberPatternContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 15: LOGICAL FIT PUZZLE
// ==========================================
interface SimplePuzzlesContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PUZZLE_LEVELS = [
  { prompt: '🌧️ Rain + ☂️ Umbrella + ?', correct: '🧥 Waterproof Raincoat', wrong: '🕶️ Sunglasses', explanation: 'Raincoat pairs with rain and umbrella.' },
  { prompt: '❄️ Cold Evening + 🔥 Fireplace + ?', correct: '🧣 Warm Woolen Shawl', wrong: '🍦 Ice Cream', explanation: 'Warm shawl pairs with winter warmth.' },
  { prompt: '🌅 Morning Sun + 📰 Newspaper + ?', correct: '🍵 Warm Morning Tea', wrong: '🔦 Night Torch', explanation: 'Morning tea pairs with your morning routine.' }
];

const SimplePuzzlesContent: React.FC<SimplePuzzlesContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = PUZZLE_LEVELS[(level - 1) % PUZZLE_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: current.correct, isCorrect: true },
    { label: current.wrong, isCorrect: false }
  ];

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);

    if (opt.isCorrect) {
      speakText(`Correct! ${current.explanation}`);
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Consider what logically pairs best with this scenario.");
      setTimeout(() => setSelected(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {current.prompt}
        </h3>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        Which item logically fits this situation in Level {level}?
      </p>

      {/* NEUTRAL BUTTONS: Absolutely no green tint or green borders beforehand! */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
              onClick={() => handleChoice(opt)}
              disabled={selected !== null && opt.isCorrect}
              style={{
                padding: '1.15rem',
                borderRadius: '20px',
                background: bg,
                border: `3px solid ${border}`,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: color,
                cursor: selected ? 'default' : 'pointer',
                minHeight: '56px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
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

export const SimplePuzzlesGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="simple_puzzles"
      title="Logical Fit Puzzle"
      domainName="Reasoning"
      instructions="Which item logically belongs in the scenario?"
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <SimplePuzzlesContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
