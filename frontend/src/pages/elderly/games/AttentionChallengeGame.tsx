import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchApi } from '../../../utils/api';
import { speakText } from '../../../utils/speech';

interface AttentionGameProps {
  onBack: () => void;
  onFinish: (resultData: any) => void;
  currentDifficulty: number;
}

const ITEMS_POOL = [
  { id: 'rhino', name: 'Rhino', emoji: '🦏' },
  { id: 'tea', name: 'Tea Leaf', emoji: '🍃' },
  { id: 'flower', name: 'Orchid', emoji: '🌺' },
  { id: 'sun', name: 'Sun', emoji: '☀️' },
  { id: 'boat', name: 'Majuli Boat', emoji: '🛶' },
  { id: 'bird', name: 'Hornbill Bird', emoji: '🦅' }
];

export const AttentionChallengeGame: React.FC<AttentionGameProps> = ({ onBack, onFinish, currentDifficulty }) => {
  const [targetItem, setTargetItem] = useState<typeof ITEMS_POOL[0]>(ITEMS_POOL[0]);
  const [gridItems, setGridItems] = useState<typeof ITEMS_POOL>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startNewChallenge = () => {
    setIsFinished(false);
    setIsCorrect(null);

    const target = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
    setTargetItem(target);

    const count = 4 + (currentDifficulty - 1);
    const distractors = ITEMS_POOL.filter(i => i.id !== target.id);
    const selectedDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, count - 1);

    const shuffledGrid = [target, ...selectedDistractors].sort(() => 0.5 - Math.random());
    setGridItems(shuffledGrid);
    setStartTime(Date.now());

    speakText(`Tap the matching ${target.name}!`);
  };

  useEffect(() => {
    startNewChallenge();
  }, [currentDifficulty]);

  const handleSelect = async (selected: typeof ITEMS_POOL[0]) => {
    if (isFinished) return;
    const responseTime = Date.now() - startTime;
    const correct = selected.id === targetItem.id;
    setIsCorrect(correct);
    setIsFinished(true);

    if (correct) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      speakText("Correct! Great attention to detail!");
    } else {
      speakText(`That was ${selected.name}. The target was ${targetItem.name}.`);
    }

    try {
      const apiRes = await fetchApi<any>('/games/submit-session', {
        method: 'POST',
        body: {
          game_code: 'attention_challenge',
          difficulty_level: currentDifficulty,
          accuracy_percentage: correct ? 100.0 : 0.0,
          avg_response_time_ms: responseTime,
          mistakes_count: correct ? 0 : 1,
          attempts_count: 1
        }
      });

      setTimeout(() => {
        onFinish({
          isCorrect: correct,
          responseTimeMs: responseTime,
          targetItem: targetItem,
          adaptiveResult: apiRes.adaptive_result
        });
      }, 2000);
    } catch (e) {
      setTimeout(() => {
        onFinish({
          isCorrect: correct,
          responseTimeMs: responseTime,
          targetItem: targetItem,
          adaptiveResult: {
            previous_difficulty: currentDifficulty,
            new_difficulty: currentDifficulty,
            reason: "Session recorded locally."
          }
        });
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#f1f5f9', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '16px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '1rem' }}>
          Attention Challenge • Level {currentDifficulty}
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Attention Challenge
        </h2>

        {/* Prompt */}
        <div style={{ background: '#f0fdfa', border: '2px solid #ccfbf1', borderRadius: '20px', padding: '1rem', marginBottom: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{targetItem.emoji}</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>Find the matching {targetItem.name}!</span>
        </div>

        {/* Selection Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: gridItems.length > 4 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1.25rem' }}>
          {gridItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              style={{
                background: '#ffffff',
                border: '3px solid #cbd5e1',
                borderRadius: '24px',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 20px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '3.25rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Result Message */}
        {isFinished && (
          <div style={{ marginTop: '1.5rem' }}>
            {isCorrect ? (
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                <CheckCircle size={36} /> Correct Match!
              </div>
            ) : (
              <div style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                <XCircle size={36} /> Try Again Next Round!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
