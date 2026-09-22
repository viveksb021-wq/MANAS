import React, { useState, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Heart, Check, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { speakText } from '../../../../utils/speech';
import { usePatient, FamilyMember, DEFAULT_FAMILY_MEMBERS_P1 } from '../../../../context/PatientContext';
import { FamilyImage } from '../../../../components/FamilyImage';

// ==========================================
// GAME 1: FAMILY MEMORY MATCH
// ==========================================
interface FamilyMemoryMatchContentProps {
  difficulty: number;
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const FamilyMemoryMatchContent: React.FC<FamilyMemoryMatchContentProps> = ({
  difficulty,
  level,
  recordAttempt,
  finishGame
}) => {
  const { activeFamilyMembers } = usePatient();
  // Patient is the player — exclude patient from memory matching game
  const members: FamilyMember[] = activeFamilyMembers.filter((m: FamilyMember) => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');

  if (members.length < 2) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <Sparkles size={48} color="#6366f1" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          More Family Needed
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver needs to add at least 2 family members in People I Know to generate your personalized memory match cards.
        </p>
      </div>
    );
  }

  // Pairs scaled by Level: Level 1 -> 2 pairs, Level 2 -> 3 pairs, Level 3 -> 4 pairs, Level 4 -> 5 pairs
  const pairsCount = Math.min(Math.max(2, level + 1), Math.min(6, members.length));

  const [cards, setCards] = useState<any[]>(() => {
    const selected = members.slice(0, pairsCount);
    return [...selected, ...selected].map((item, index) => ({
      uniqueId: index,
      ...item
    })).sort(() => Math.random() - 0.5);
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleCardClick = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];
      if (card1.id === card2.id) {
        recordAttempt(true);
        setMatched(prev => {
          const nextMatched = [...prev, newFlipped[0], newFlipped[1]];
          if (nextMatched.length === cards.length) {
            setTimeout(() => finishGame(100), 600);
          }
          return nextMatched;
        });
        setFlipped([]);
        speakText(`Matched ${card1.name}!`);
      } else {
        recordAttempt(false);
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div>
      <style>{`
        @keyframes cardGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.6rem 1.25rem',
        background: '#f8fafc',
        borderRadius: '18px',
        border: '2px solid #e2e8f0',
        color: '#0f766e',
        fontWeight: 800
      }}>
        <span>Level {level} ({pairsCount} Pairs)</span>
        <span>Matched: {matched.length / 2} / {cards.length / 2}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${pairsCount > 2 ? 3 : 2}, 1fr)`,
        gap: '0.85rem'
      }}>
        {cards.map((card, idx) => {
          const isFaceUp = flipped.includes(idx) || matched.includes(idx);
          const isMatched = matched.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched}
              style={{
                height: pairsCount > 3 ? '110px' : (pairsCount > 2 ? '125px' : '140px'),
                borderRadius: '20px',
                border: isMatched ? '3px solid #10b981' : (isFaceUp ? '3px solid #0f766e' : '3px solid #cbd5e1'),
                background: isMatched ? '#ecfdf5' : (isFaceUp ? '#ffffff' : 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'),
                color: '#ffffff',
                fontSize: '2.5rem',
                fontWeight: 800,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isMatched ? 'default' : 'pointer',
                overflow: 'hidden',
                boxShadow: isFaceUp ? '0 6px 15px rgba(0,0,0,0.08)' : '0 4px 10px rgba(15,118,110,0.2)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {isFaceUp ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.35rem' }}>
                  <div style={{ width: pairsCount > 3 ? '52px' : '64px', height: pairsCount > 3 ? '52px' : '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <FamilyImage
                      src={card.imagePath}
                      alt={card.name}
                      name={card.name}
                      relationship={card.relationship}
                      size="100%"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 20%',
                        border: '2px solid #0f766e'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                    {card.name}
                  </span>
                  {isMatched && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#10b981', borderRadius: '50%', padding: '2px' }}>
                      <Check size={14} color="#ffffff" />
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '2rem' }}>🌸</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const FamilyMemoryMatchGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="family_memory_match"
      title="Family Memory Match"
      domainName="Memory"
      instructions="Tap cards to flip them face up and match pairs of familiar photos from your Family Memory."
      onBackOverride={onBack}
    >
      {({ difficulty, level, recordAttempt, finishGame }) => (
        <FamilyMemoryMatchContent
          difficulty={difficulty}
          level={level}
          recordAttempt={recordAttempt}
          finishGame={finishGame}
        />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 2: WHO IS THIS?
// ==========================================
interface WhoIsThisContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const WhoIsThisContent: React.FC<WhoIsThisContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { activeFamilyMembers } = usePatient();
  // Patient is the player — exclude patient from Who is this?
  const members: FamilyMember[] = activeFamilyMembers.filter((m: FamilyMember) => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');

  if (members.length < 2) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <Eye size={48} color="#6366f1" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          More Family Needed
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver needs to add at least 2 family members in People I Know to play Who Is This.
        </p>
      </div>
    );
  }

  const [target] = useState<FamilyMember>(() => members[Math.floor(Math.random() * members.length)]);
  const [options] = useState<{ label: string; isCorrect: boolean }[]>(() => {
    const distractors = members.filter(m => m.id !== target.id);
    const distractor = distractors[Math.floor(Math.random() * distractors.length)];

    return [
      { label: `${target.name} (${target.relationship})`, isCorrect: true },
      { label: `${distractor.name} (${distractor.relationship})`, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  });

  const [selectedOpt, setSelectedOpt] = useState<{ label: string; isCorrect: boolean } | null>(null);

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    recordAttempt(opt.isCorrect);

    if (opt.isCorrect) {
      speakText(`That's right! This is ${target.name}, your ${target.relationship}.`);
    } else {
      speakText(`That's okay. This is ${target.name}, your ${target.relationship}.`);
    }
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 65), 1200);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '28px', padding: '1.75rem', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          width: '220px',
          height: '220px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(15, 118, 110, 0.15)',
          border: '4px solid #0f766e',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FamilyImage
            src={target.imagePath}
            alt={target.name}
            name={target.name}
            relationship={target.relationship}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              borderRadius: '20px',
              border: 'none'
            }}
          />
        </div>
      </div>
      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
        Who is this? (Level {level})
      </h3>

      {/* NEUTRAL BUTTONS BEFORE ANSWERING */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {options.map((opt, i) => {
          const isChosen = selectedOpt?.label === opt.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selectedOpt !== null) {
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
              disabled={selectedOpt !== null}
              style={{
                padding: '1.1rem',
                borderRadius: '20px',
                background: bg,
                border: `3px solid ${border}`,
                color: color,
                fontWeight: 800,
                fontSize: '1.15rem',
                cursor: selectedOpt ? 'default' : 'pointer',
                minHeight: '56px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}
            >
              👤 {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const WhoIsThisGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="who_is_this"
      title="Who Is This?"
      domainName="Memory"
      instructions="Look at the familiar photo and select the correct person from your family."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <WhoIsThisContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 3: PHOTO RECALL
// ==========================================
interface PhotoRecallContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const PhotoRecallContent: React.FC<PhotoRecallContentProps> = ({ level, recordAttempt, finishGame }) => {
  const { activeFamilyMembers } = usePatient();
  // Patient is the player — exclude patient from photo recall game
  const members: FamilyMember[] = activeFamilyMembers.filter((m: FamilyMember) => m.id !== 'patient' && m.relationship.toLowerCase() !== 'patient');

  if (members.length < 2) {
    return (
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
        <Heart size={48} color="#6366f1" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          More Family Needed
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5 }}>
          Your caregiver needs to add at least 2 family members in People I Know to play Photo Recall.
        </p>
      </div>
    );
  }

  const [target] = useState<FamilyMember>(() => members[Math.floor(Math.random() * members.length)]);
  const [phase, setPhase] = useState<'showing' | 'question'>('showing');
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [choices] = useState<{ label: string; isCorrect: boolean }[]>(() => {
    const distractors = members.filter(m => m.id !== target.id);
    const distractorRel = distractors[0].relationship;
    return [
      { label: target.relationship, isCorrect: true },
      { label: distractorRel, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  });
  const [selectedChoice, setSelectedChoice] = useState<{ label: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    if (phase !== 'showing') return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('question');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleAnswer = (choice: { label: string; isCorrect: boolean }) => {
    if (selectedChoice) return;
    setSelectedChoice(choice);
    recordAttempt(choice.isCorrect);
    speakText(choice.isCorrect ? "Wonderful recall!" : "Good effort!");
    setTimeout(() => finishGame(choice.isCorrect ? 100 : 70), 1000);
  };

  if (phase === 'showing') {
    return (
      <div style={{ textAlign: 'center', background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #0f766e' }}>
        <div style={{ color: '#0f766e', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
          Memorize this photo of {target.name} ({secondsLeft}s)...
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{
            width: `${(secondsLeft / 5) * 100}%`,
            height: '100%',
            background: '#0f766e',
            transition: 'width 1s linear'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: '220px',
            height: '220px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(15, 118, 110, 0.15)',
            border: '4px solid #0f766e',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FamilyImage
              src={target.imagePath}
              alt={target.name}
              name={target.name}
              relationship={target.relationship}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                borderRadius: '20px',
                border: 'none'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        What is {target.name}'s relationship to you?
      </h3>
      {/* NEUTRAL BUTTONS: No pre-highlight before user taps! */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {choices.map((c, idx) => {
          const isChosen = selectedChoice?.label === c.label;
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#0f172a';

          if (selectedChoice !== null) {
            if (isChosen) {
              bg = c.isCorrect ? '#dcfce7' : '#fee2e2';
              border = c.isCorrect ? '#16a34a' : '#dc2626';
              color = c.isCorrect ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(c)}
              disabled={selectedChoice !== null}
              style={{
                padding: '1.1rem',
                borderRadius: '20px',
                border: `3px solid ${border}`,
                background: bg,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: color,
                cursor: selectedChoice ? 'default' : 'pointer',
                minHeight: '56px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}
            >
              👤 {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PhotoRecallGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="photo_recall"
      title="Photo Recall"
      domainName="Memory"
      instructions="Memorize the photo details during 5 seconds, then answer simple questions."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <PhotoRecallContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 4: SEQUENCE MEMORY
// ==========================================
interface SequenceMemoryContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const SEQUENCE_LEVELS = [
  ['🌸 Flower', '🍵 Tea Cup', '📙 Book'],
  ['🌸 Flower', '🍵 Tea Cup', '📙 Book', '🌿 Leaf'],
  ['🌸 Flower', '🍵 Tea Cup', '📙 Book', '🌿 Leaf', '🍎 Apple']
];

const SequenceMemoryContent: React.FC<SequenceMemoryContentProps> = ({ level, recordAttempt, finishGame }) => {
  const items = SEQUENCE_LEVELS[(level - 1) % SEQUENCE_LEVELS.length];
  const [userSeq, setUserSeq] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleTapItem = (item: string) => {
    if (completed || userSeq.length >= items.length) return;
    const next = [...userSeq, item];
    setUserSeq(next);

    if (next.length === items.length) {
      setCompleted(true);
      const isCorrect = next.join(',') === items.join(',');
      recordAttempt(isCorrect);
      speakText(isCorrect ? "Perfect sequence!" : "Good practice!");
      setTimeout(() => finishGame(isCorrect ? 100 : 65), 1000);
    }
  };

  const handleReset = () => {
    if (completed) return;
    setUserSeq([]);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
        Target Order (Level {level}):
      </h3>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f766e', marginBottom: '1.25rem', background: '#f0fdfa', padding: '0.6rem 1rem', borderRadius: '16px' }}>
        {items.join(' → ')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', minHeight: '52px', flexWrap: 'wrap' }}>
        {userSeq.length === 0 ? (
          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.05rem' }}>Tap buttons below in sequence</span>
        ) : (
          userSeq.map((s, i) => (
            <span key={i} style={{ background: '#ccfbf1', color: '#0f766e', padding: '0.5rem 0.85rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem' }}>
              {i + 1}. {s}
            </span>
          ))
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length > 3 ? 2 : 3}, 1fr)`, gap: '0.85rem', marginBottom: '1rem' }}>
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleTapItem(item)}
            disabled={completed}
            style={{
              padding: '1.1rem',
              borderRadius: '20px',
              background: '#ffffff',
              border: '3px solid #0f766e',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f172a',
              cursor: completed ? 'default' : 'pointer',
              minHeight: '56px',
              transition: 'transform 0.1s'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {userSeq.length > 0 && !completed && (
        <button
          onClick={handleReset}
          style={{
            background: 'transparent',
            border: '2px solid #94a3b8',
            color: '#64748b',
            borderRadius: '14px',
            padding: '0.5rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <RefreshCw size={16} /> Reset Sequence
        </button>
      )}
    </div>
  );
};

export const SequenceMemoryGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="sequence_memory"
      title="Sequence Memory"
      domainName="Memory"
      instructions="Remember the order of items shown in sequence."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <SequenceMemoryContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 5: OBJECT RECALL
// ==========================================
interface ObjectRecallContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const ObjectRecallContent: React.FC<ObjectRecallContentProps> = ({ level, recordAttempt, finishGame }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: '👓 Reading Spectacles', isCorrect: true },
    { label: '⚽ Football', isCorrect: false }
  ];

  const handleChoice = (opt: { label: string; isCorrect: boolean }) => {
    if (selected !== null) return;
    setSelected(opt.label);
    recordAttempt(opt.isCorrect);
    speakText(opt.isCorrect ? "Correct! The Spectacles were missing." : "Good try!");
    setTimeout(() => finishGame(opt.isCorrect ? 100 : 70), 1000);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '20px', border: '2px dashed #94a3b8', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
          Items on Morning Table (Level {level}):
        </div>
        <div style={{ fontSize: '1.3rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span>🍵 Morning Tea</span>
          <span>📰 Daily Newspaper</span>
          <span>💊 Medicine Box</span>
          <span style={{ color: '#ef4444', fontWeight: 800 }}>❓ [Missing]</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
        Which essential item is missing from your morning table?
      </h3>

      {/* NEUTRAL BUTTONS: No pre-answer green background! */}
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
                color: color,
                fontSize: '1.25rem',
                fontWeight: 800,
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

export const ObjectRecallGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="object_recall"
      title="Object Recall"
      domainName="Memory"
      instructions="Look at the morning items and select which essential item is missing."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <ObjectRecallContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
