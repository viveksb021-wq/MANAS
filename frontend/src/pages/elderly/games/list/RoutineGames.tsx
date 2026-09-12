import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Calendar, Clock, Bell } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

// ==========================================
// GAME 21: WHAT COMES NEXT IN ROUTINE
// ==========================================
interface WhatComesNextContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const ROUTINE_LEVELS = [
  { sequence: '🍵 Morning Tea (7 AM) → 🥣 Breakfast (8 AM) → ?', prompt: 'What is scheduled next in your morning routine?', correct: '💊 Morning Medicine (8:30 AM)', wrong: '🌙 Night Sleep (10:00 PM)', feedback: "That's right! Morning Medicine comes at 8:30 AM." },
  { sequence: '🥣 Lunch (1:00 PM) → 🛋️ Afternoon Rest (2:00 PM) → ?', prompt: 'What comes after afternoon rest?', correct: '☕ Afternoon Tea (4:00 PM)', wrong: '🍳 Early Breakfast (7:00 AM)', feedback: "That's right! Afternoon tea refreshes your afternoon." },
  { sequence: '🌳 Evening Stroll (5:30 PM) → 🍛 Dinner (8:00 PM) → ?', prompt: 'What comes after evening dinner?', correct: '🌙 Night Medicine & Sleep (9:30 PM)', wrong: '🏃 Morning Jog (6:00 AM)', feedback: "Correct! Calm night sleep completes your day." }
];

const WhatComesNextContent: React.FC<WhatComesNextContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = ROUTINE_LEVELS[(level - 1) % ROUTINE_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: current.correct, isCorrect: true },
    { label: current.wrong, isCorrect: false }
  ];

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? current.feedback : "Good try! Think about daily routine flow.");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {current.sequence}
        </h3>
      </div>

      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 600 }}>
        {current.prompt} (Level {level})
      </p>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
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
                border: `3px solid ${border}`,
                background: bg,
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

export const WhatComesNextGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="what_comes_next"
      title="Daily Routine Sequence"
      domainName="Daily Routine Recall"
      instructions="Look at your routine sequence and select what comes next."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <WhatComesNextContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 22: DAILY PLAN RECALL
// ==========================================
interface DailyPlanRecallContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PLAN_LEVELS = [
  { prompt: 'What do you have planned for 5:00 PM today?', correct: '🌳 Evening Stroll at Lotus Park', wrong: '✈️ Flight to Delhi', feedback: "Correct! Evening Stroll at Lotus Park is scheduled at 5 PM." },
  { prompt: 'What is planned for 10:30 AM today?', correct: '🪴 Light Garden Stroll & Water Plants', wrong: '🏊 River Rafting Expedition', feedback: "Correct! Light garden stroll is scheduled for morning." },
  { prompt: 'What is planned for 8:00 PM tonight?', correct: '🍲 Nourishing Dinner with Family', wrong: '⛰️ Mountain Climbing', feedback: "Correct! Peaceful dinner with family." }
];

const DailyPlanRecallContent: React.FC<DailyPlanRecallContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = PLAN_LEVELS[(level - 1) % PLAN_LEVELS.length];
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: current.correct, isCorrect: true },
    { label: current.wrong, isCorrect: false }
  ];

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? current.feedback : "Good try! Look at your daily schedule.");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        {current.prompt} (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
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
                border: `3px solid ${border}`,
                background: bg,
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

export const DailyPlanRecallGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="daily_plan_recall"
      title="Today's Plan Recall"
      domainName="Daily Routine Recall"
      instructions="Which important activity is scheduled on your calendar?"
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <DailyPlanRecallContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
