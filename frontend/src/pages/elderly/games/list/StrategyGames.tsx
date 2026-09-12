import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { ShieldAlert, Compass } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

// ==========================================
// GAME 16: SIMPLIFIED CHESS PUZZLE
// ==========================================
interface SimplifiedChessContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const CHESS_LEVELS = [
  { piece: '♖', pieceName: 'White Rook', targetPiece: '♞', targetName: 'Black Knight', targetSquare: 'e4', startPos: 'a4', hint: 'Rook moves horizontally straight along the open rank.' },
  { piece: '♗', pieceName: 'White Bishop', targetPiece: '♞', targetName: 'Black Knight', targetSquare: 'd4', startPos: 'a1', hint: 'Bishop moves diagonally along the open diagonal.' },
  { piece: '♕', pieceName: 'White Queen', targetPiece: '♞', targetName: 'Black Knight', targetSquare: 'e4', startPos: 'a4', hint: 'Queen moves in any straight line.' }
];

const SimplifiedChessContent: React.FC<SimplifiedChessContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = CHESS_LEVELS[(level - 1) % CHESS_LEVELS.length];
  const [moved, setMoved] = useState(false);

  const handleSquareClick = (square: string) => {
    if (moved) return;

    if (square === current.targetSquare) {
      setMoved(true);
      recordAttempt(true);
      speakText(`Check! ${current.pieceName} captures ${current.targetName} on ${current.targetSquare}.`);
      setTimeout(() => finishGame(100), 1200);
    } else {
      recordAttempt(false);
      speakText(current.hint);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseChessTarget {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(225, 29, 72, 0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 20px rgba(225, 29, 72, 0.7); }
        }
      `}</style>

      <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
        Level {level}: Move {current.pieceName} {current.piece} to capture {current.targetPiece}
      </h3>
      <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
        {current.hint}
      </p>

      {/* Simplified 4x4 Mini Chessboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        maxWidth: '300px',
        margin: '0 auto 1.25rem auto',
        background: '#334155',
        padding: '6px',
        borderRadius: '20px'
      }}>
        {/* Row 4 */}
        <div style={{ height: '64px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
          {moved ? '' : current.piece}
        </div>
        <div style={{ height: '64px', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <div style={{ height: '64px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <button
          onClick={() => handleSquareClick(current.targetSquare)}
          disabled={moved}
          style={{
            height: '64px',
            background: moved ? '#059669' : '#e11d48',
            border: 'none',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            cursor: moved ? 'default' : 'pointer',
            animation: moved ? 'none' : 'pulseChessTarget 1.8s infinite ease-in-out',
            transition: 'all 0.2s ease'
          }}
        >
          {moved ? current.piece : current.targetPiece}
        </button>

        {/* Empty Row 3 */}
        <div style={{ height: '64px', background: '#0f766e' }} />
        <div style={{ height: '64px', background: '#f1f5f9' }} />
        <div style={{ height: '64px', background: '#0f766e' }} />
        <div style={{ height: '64px', background: '#f1f5f9' }} />
      </div>

      <p style={{ color: '#0f766e', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
        {moved ? `✨ Well done! ${current.pieceName} captured ${current.targetPiece}.` : `Tap the red highlighted target square to capture!`}
      </p>
    </div>
  );
};

export const SimplifiedChessGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="simplified_chess"
      title="Simplified Chess Puzzle"
      domainName="Strategic Thinking"
      instructions="Move your chess piece to capture the unprotected opponent piece."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <SimplifiedChessContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 17: BOARD PUZZLE (Path Finding)
// ==========================================
interface BoardPuzzleContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const WAYPOINT_SETS = [
  [{ num: 1, label: 'Start 🚩' }, { num: 2, label: 'Lotus Pond 🌸' }, { num: 3, label: 'Safe Home 🏡' }],
  [{ num: 1, label: 'Start 🚩' }, { num: 2, label: 'Rose Garden 🌹' }, { num: 3, label: 'Tea Stall 🍵' }, { num: 4, label: 'Safe Home 🏡' }],
  [{ num: 1, label: 'Start 🚩' }, { num: 2, label: 'Sunny Lawn 🌿' }, { num: 3, label: 'Shaded Bench 🪑' }, { num: 4, label: 'Lotus Pond 🌸' }, { num: 5, label: 'Safe Home 🏡' }]
];

const BoardPuzzleContent: React.FC<BoardPuzzleContentProps> = ({ level, recordAttempt, finishGame }) => {
  const waypoints = WAYPOINT_SETS[(level - 1) % WAYPOINT_SETS.length];
  const [pathStep, setPathStep] = useState(1);

  const handleStep = (stepNum: number) => {
    if (stepNum === pathStep + 1) {
      recordAttempt(true);
      setPathStep(stepNum);
      if (stepNum === waypoints.length) {
        speakText("Home reached safely! Excellent journey.");
        setTimeout(() => finishGame(100), 1000);
      } else {
        speakText(`Nice step! Now tap ${waypoints[stepNum].label}.`);
      }
    } else if (stepNum <= pathStep) {
      // already completed
    } else {
      recordAttempt(false);
      speakText("Take the next step along the path first.");
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
        Path Step {pathStep} of {waypoints.length} (Level {level})
      </h3>
      <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
        {pathStep < waypoints.length ? `Tap next marker: ${waypoints[pathStep].label}` : '🎉 Safe Home reached!'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {waypoints.map(wp => {
          const isDone = pathStep >= wp.num;
          const isNext = pathStep + 1 === wp.num;

          return (
            <button
              key={wp.num}
              onClick={() => handleStep(wp.num)}
              disabled={isDone || !isNext}
              style={{
                background: isDone ? '#ccfbf1' : '#ffffff',
                border: `3px solid ${isDone ? '#10b981' : (isNext ? '#0f766e' : '#cbd5e1')}`,
                padding: '0.85rem 1rem',
                borderRadius: '18px',
                fontWeight: 800,
                fontSize: '1rem',
                color: isDone ? '#0f766e' : '#0f172a',
                cursor: isNext ? 'pointer' : 'default',
                boxShadow: isNext ? '0 0 12px rgba(15, 118, 110, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {wp.num}. {wp.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const BoardPuzzleGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="board_puzzle"
      title="Path Finding Board Puzzle"
      domainName="Strategic Thinking"
      instructions="Guide your companion avatar from Start to Home by tapping sequential path tiles."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <BoardPuzzleContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
