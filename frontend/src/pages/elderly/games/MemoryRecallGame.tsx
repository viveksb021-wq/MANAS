import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchApi } from '../../../utils/api';
import { speakText } from '../../../utils/speech';

interface MemoryRecallGameProps {
  onBack: () => void;
  onFinish: (resultData: any) => void;
  currentDifficulty: number;
}

// NER cultural objects
const OBJECTS_POOL = [
  { id: 'tea', name: 'Shillong Tea Leaf', emoji: '🍃', color: '#10b981' },
  { id: 'drum', name: 'Bihu Dhol Drum', emoji: '🥁', color: '#f59e0b' },
  { id: 'rhino', name: 'Kaziranga Rhino', emoji: '🦏', color: '#6366f1' },
  { id: 'flower', name: 'Orchid Flower', emoji: '🌺', color: '#ec4899' },
  { id: 'bamboo', name: 'Bamboo Basket', emoji: '🎋', color: '#84cc16' },
  { id: 'sun', name: 'Pine Hill Sun', emoji: '☀️', color: '#eab308' }
];

export const MemoryRecallGame: React.FC<MemoryRecallGameProps> = ({ onBack, onFinish, currentDifficulty }) => {
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [timer, setTimer] = useState<number>(5);
  const [itemsToMemorize, setItemsToMemorize] = useState<typeof OBJECTS_POOL>([]);
  const [missingItem, setMissingItem] = useState<typeof OBJECTS_POOL[0] | null>(null);
  const [options, setOptions] = useState<typeof OBJECTS_POOL>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<typeof OBJECTS_POOL[0] | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Setup game round based on difficulty
  const startNewRound = () => {
    setPhase('memorize');
    setTimer(currentDifficulty >= 3 ? 4 : 6);
    setIsCorrect(null);
    setSelectedOption(null);

    const itemCount = Math.min(3 + Math.floor(currentDifficulty / 2), 5);
    const shuffled = [...OBJECTS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, itemCount);
    setItemsToMemorize(selected);

    // Pick 1 missing item
    const missing = selected[Math.floor(Math.random() * selected.length)];
    setMissingItem(missing);

    // Generate 4 answer choices including the missing item
    const distractors = OBJECTS_POOL.filter(item => item.id !== missing.id);
    const answerChoices = [missing, ...distractors.sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random());
    setOptions(answerChoices);

    speakText("Memorize these objects!");
  };

  useEffect(() => {
    startNewRound();
  }, [currentDifficulty]);

  useEffect(() => {
    if (phase === 'memorize' && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (phase === 'memorize' && timer === 0) {
      setPhase('recall');
      setStartTime(Date.now());
      speakText("Which object disappeared?");
    }
    return undefined;
  }, [phase, timer]);

  const handleSelectAnswer = async (choice: typeof OBJECTS_POOL[0]) => {
    if (phase !== 'recall') return;
    const responseTime = Date.now() - startTime;
    setSelectedOption(choice);

    const correct = choice.id === missingItem?.id;
    setIsCorrect(correct);
    setPhase('result');

    if (correct) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      speakText("Wonderful! That is correct!");
    } else {
      speakText(`Nice try! The missing object was ${missingItem?.name}.`);
    }

    const accuracy = correct ? 100.0 : 0.0;
    const mistakes = correct ? 0 : 1;

    try {
      const apiRes = await fetchApi<any>('/games/submit-session', {
        method: 'POST',
        body: {
          game_code: 'memory_recall',
          difficulty_level: currentDifficulty,
          accuracy_percentage: accuracy,
          avg_response_time_ms: responseTime,
          mistakes_count: mistakes,
          attempts_count: 1
        }
      });
      setTimeout(() => {
        onFinish({
          isCorrect: correct,
          responseTimeMs: responseTime,
          missingItem: missingItem,
          adaptiveResult: apiRes.adaptive_result
        });
      }, 2000);
    } catch (e) {
      setTimeout(() => {
        onFinish({
          isCorrect: correct,
          responseTimeMs: responseTime,
          missingItem: missingItem,
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
        <div style={{ background: '#ccfbf1', color: '#0d9488', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '1rem' }}>
          Difficulty: Level {currentDifficulty}
        </div>
      </div>

      {/* Game Card */}
      <div style={{ background: '#ffffff', borderRadius: '28px', padding: '2rem', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Memory Recall
        </h2>

        {/* Phase 1: MEMORIZE */}
        {phase === 'memorize' && (
          <div>
            <p style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0d9488', marginBottom: '1.5rem' }}>
              Look carefully! Hiding in <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{timer}s</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {itemsToMemorize.map((item, idx) => (
                <div key={idx} style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  background: '#f8fafc',
                  border: `3px solid ${item.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  {item.emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2: RECALL */}
        {phase === 'recall' && (
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
              ❓ Which object DISAPPEARED?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
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
                  <span style={{ fontSize: '3rem' }}>{option.emoji}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: RESULT */}
        {phase === 'result' && (
          <div style={{ padding: '1.5rem 0' }}>
            {isCorrect ? (
              <div>
                <CheckCircle size={72} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981' }}>Correct! Well Done!</h3>
              </div>
            ) : (
              <div>
                <XCircle size={72} color="#f43f5e" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>Good Effort!</h3>
                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569', marginTop: '0.5rem' }}>
                  The missing object was: <strong>{missingItem?.emoji} {missingItem?.name}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
