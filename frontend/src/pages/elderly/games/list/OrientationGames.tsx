import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Calendar, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

interface Question {
  id: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

const LEVEL_QUESTIONS: Record<number, Question[]> = {
  1: [
    {
      id: 1,
      prompt: "What meal is traditionally eaten first in the morning?",
      options: ["Dinner", "Breakfast", "Midnight Snack", "Afternoon Tea"],
      correctAnswer: "Breakfast",
      hint: "It helps start your day after morning tea."
    },
    {
      id: 2,
      prompt: "Which season brings warm sunny days and lush tea garden blooms?",
      options: ["Winter", "Summer", "Monsoon", "Spring"],
      correctAnswer: "Spring",
      hint: "It comes right after winter when flowers bloom."
    }
  ],
  2: [
    {
      id: 3,
      prompt: "When the sun reaches high directly overhead, what time of day is it?",
      options: ["Early Morning", "Noon / Midday", "Night", "Twilight"],
      correctAnswer: "Noon / Midday",
      hint: "It is 12:00 PM lunch time."
    },
    {
      id: 4,
      prompt: "How many days are in a single week?",
      options: ["5 Days", "7 Days", "10 Days", "12 Days"],
      correctAnswer: "7 Days",
      hint: "Monday through Sunday."
    }
  ],
  3: [
    {
      id: 5,
      prompt: "Which period of the day is best suited for a restful evening stroll?",
      options: ["Late Sunset (5 PM)", "Midnight (1 AM)", "Midday Heat (12 PM)", "Dawn (4 AM)"],
      correctAnswer: "Late Sunset (5 PM)",
      hint: "When the evening air becomes calm and cool."
    },
    {
      id: 6,
      prompt: "How many months are there in a standard year?",
      options: ["10 Months", "12 Months", "14 Months", "16 Months"],
      correctAnswer: "12 Months",
      hint: "From January to December."
    }
  ]
};

interface OrientationRecallContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const OrientationRecallContent: React.FC<OrientationRecallContentProps> = ({ level, recordAttempt, finishGame }) => {
  const levelKey = ((level - 1) % 3) + 1;
  const questions = LEVEL_QUESTIONS[levelKey] || LEVEL_QUESTIONS[1];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Safe fallback guard to prevent any out-of-bounds error
  const safeIdx = Math.min(currentIdx, questions.length - 1);
  const q = questions[safeIdx];

  const handleAnswerClick = (opt: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(opt);

    const isCorrect = opt === q.correctAnswer;
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText(`Correct! ${opt} is the right answer.`);
    } else {
      speakText(`Not quite. The correct answer is ${q.correctAnswer}.`);
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setShowHint(false);
      } else {
        finishGame(100);
      }
    }, 1300);
  };

  return (
    <div style={{ background: '#ffffff', padding: '2rem 1.5rem', borderRadius: '28px', border: '3px solid #cbd5e1', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#e0e7ff', color: '#3730a3', padding: '0.5rem 1rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.25rem', width: 'fit-content', margin: '0 auto 1.25rem auto' }}>
        <Calendar size={18} /> Level {level} • Question {safeIdx + 1} of {questions.length}
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.3 }}>
        {q.prompt}
      </h3>

      {showHint && (
        <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', padding: '0.75rem 1rem', borderRadius: '16px', color: '#92400e', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          💡 Hint: {q.hint}
        </div>
      )}

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {q.options.map(opt => {
          const isChosen = selectedAnswer === opt;
          const isRight = opt === q.correctAnswer;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let text = '#0f172a';

          if (selectedAnswer !== null) {
            if (isRight) {
              bg = '#dcfce7';
              border = '#16a34a';
              text = '#14532d';
            } else if (isChosen) {
              bg = '#fee2e2';
              border = '#dc2626';
              text = '#7f1d1d';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswerClick(opt)}
              disabled={selectedAnswer !== null}
              style={{
                background: bg,
                border: `3px solid ${border}`,
                color: text,
                padding: '1rem 1.25rem',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '1.15rem',
                cursor: selectedAnswer !== null ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}
            >
              <span>{opt}</span>
              {selectedAnswer !== null && isRight && <CheckCircle2 size={24} color="#16a34a" />}
            </button>
          );
        })}
      </div>

      {!showHint && selectedAnswer === null && (
        <button
          onClick={() => setShowHint(true)}
          style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <HelpCircle size={18} /> Need a gentle hint?
        </button>
      )}
    </div>
  );
};

export const OrientationRecallGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="orientation_daily_recall"
      title="Daily Orientation & Recall"
      domainName="Memory & Orientation"
      instructions="Answer friendly questions about daily time, seasons, and routines to keep your temporal orientation sharp."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <OrientationRecallContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
