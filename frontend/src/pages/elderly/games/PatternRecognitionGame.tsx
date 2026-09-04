import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchApi } from '../../../utils/api';
import { speakText } from '../../../utils/speech';

interface PatternGameProps {
  onBack: () => void;
  onFinish: (resultData: any) => void;
  currentDifficulty: number;
}

const ITEMS_POOL = [
  { id: 'tea', emoji: '🍃', name: 'Tea Leaf' },
  { id: 'sun', emoji: '☀️', name: 'Sun' },
  { id: 'drum', emoji: '🥁', name: 'Dhol Drum' },
  { id: 'flower', emoji: '🌺', name: 'Orchid' },
  { id: 'rhino', emoji: '🦏', name: 'Rhino' }
];

export const PatternRecognitionGame: React.FC<PatternGameProps> = ({ onBack, onFinish, currentDifficulty }) => {
  const [sequence, setSequence] = useState<typeof ITEMS_POOL>([]);
  const [correctNextItem, setCorrectNextItem] = useState<typeof ITEMS_POOL[0]>(ITEMS_POOL[0]);
  const [options, setOptions] = useState<typeof ITEMS_POOL>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startNewPattern = () => {
    setIsFinished(false);
    setIsCorrect(null);

    // Create pattern: e.g. A, B, A, B, ?
    const a = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
    const distractorsA = ITEMS_POOL.filter(i => i.id !== a.id);
    const b = distractorsA[Math.floor(Math.random() * distractorsA.length)];

    let seq: typeof ITEMS_POOL = [];
    let nextItem: typeof ITEMS_POOL[0];

    if (currentDifficulty <= 2) {
      // Simple alternating A B A B -> next is A
      seq = [a, b, a, b];
      nextItem = a;
    } else {
      // Progressive pattern A B B A B -> next is B or A B C A B -> next is C
      const c = ITEMS_POOL.filter(i => i.id !== a.id && i.id !== b.id)[0] || a;
      seq = [a, b, c, a, b];
      nextItem = c;
    }

    setSequence(seq);
    setCorrectNextItem(nextItem);

    const wrongOptions = ITEMS_POOL.filter(i => i.id !== nextItem.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    setOptions([nextItem, ...wrongOptions].sort(() => 0.5 - Math.random()));
    setStartTime(Date.now());

    speakText("What comes next in the pattern?");
  };

  useEffect(() => {
    startNewPattern();
  }, [currentDifficulty]);

  const handleSelectAnswer = async (choice: typeof ITEMS_POOL[0]) => {
    if (isFinished) return;
    const responseTime = Date.now() - startTime;
    const correct = choice.id === correctNextItem.id;
    setIsCorrect(correct);
    setIsFinished(true);

    if (correct) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      speakText("Brilliant pattern recognition!");
    } else {
      speakText(`Nice attempt! The next pattern item was ${correctNextItem.name}.`);
    }

    try {
      const apiRes = await fetchApi<any>('/games/submit-session', {
        method: 'POST',
        body: {
          game_code: 'pattern_rec',
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
          adaptiveResult: apiRes.adaptive_result
        });
      }, 2000);
    } catch (e) {
      setTimeout(() => {
        onFinish({
          isCorrect: correct,
          responseTimeMs: responseTime,
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
        <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '1rem' }}>
          Pattern Recognition • Level {currentDifficulty}
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Pattern Recognition
        </h2>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569', marginBottom: '1.75rem' }}>
          Which object completes the sequence?
        </p>

        {/* Visual Sequence Display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {sequence.map((item, idx) => (
            <div key={idx} style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#f8fafc',
              border: '2px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem'
            }}>
              {item.emoji}
            </div>
          ))}
          {/* Missing Item Box */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: '#ccfbf1',
            border: '3px dashed #0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0d9488'
          }}>
            ❓
          </div>
        </div>

        {/* Multiple Choice Answers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(option)}
              style={{
                background: '#ffffff',
                border: '3px solid #cbd5e1',
                borderRadius: '24px',
                padding: '1.25rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '2.5rem'
              }}
            >
              <span>{option.emoji}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{option.name}</span>
            </button>
          ))}
        </div>

        {isFinished && (
          <div style={{ marginTop: '1.5rem' }}>
            {isCorrect ? (
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                <CheckCircle size={36} /> Sequence Complete!
              </div>
            ) : (
              <div style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                <XCircle size={36} /> Good Try!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
