import React, { useState, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Target, Search, Zap, CheckCircle2 } from 'lucide-react';
import { speakText } from '../../../../utils/speech';

// ==========================================
// GAME 6: FIND THE OBJECT
// ==========================================
interface FindTheObjectContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const OBJECT_LEVELS = [
  { targetName: '🍵 Tea Cup', items: [{ label: '🍵 Tea Cup', isTarget: true }, { label: '📙 Book', isTarget: false }, { label: '🔑 Keyring', isTarget: false }, { label: '👓 Glasses', isTarget: false }] },
  { targetName: '🔑 Keyring', items: [{ label: '🔑 Keyring', isTarget: true }, { label: '🍵 Tea Cup', isTarget: false }, { label: '📰 Newspaper', isTarget: false }, { label: '💊 Medicine Box', isTarget: false }] },
  { targetName: '👓 Reading Glasses', items: [{ label: '👓 Reading Glasses', isTarget: true }, { label: '📱 Phone', isTarget: false }, { label: '🍵 Tea Cup', isTarget: false }, { label: '🌿 Houseplant', isTarget: false }] }
];

const FindTheObjectContent: React.FC<FindTheObjectContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = OBJECT_LEVELS[(level - 1) % OBJECT_LEVELS.length];
  const [items] = useState(() => [...current.items].sort(() => Math.random() - 0.5));
  const [tappedItem, setTappedItem] = useState<string | null>(null);

  const handleTap = (item: { label: string; isTarget: boolean }) => {
    if (tappedItem) return;
    setTappedItem(item.label);
    recordAttempt(item.isTarget);

    if (item.isTarget) {
      speakText(`Found the ${current.targetName}! Superb attention.`);
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("That's another item on the table. Keep looking.");
      setTimeout(() => setTappedItem(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseTargetBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); filter: drop-shadow(0 4px 12px rgba(15, 118, 110, 0.3)); }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
        border: '2px solid #0f766e',
        padding: '0.85rem 1.5rem',
        borderRadius: '20px',
        display: 'inline-block',
        marginBottom: '1.5rem',
        animation: 'pulseTargetBadge 2.5s infinite ease-in-out'
      }}>
        <h3 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f766e', margin: 0 }}>
          Find & Tap: {current.targetName}
        </h3>
      </div>

      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>
        Level {level}: Search the items on your tray
      </p>

      {/* Neutral option styling before answering */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {items.map((item, idx) => {
          const isChosen = tappedItem === item.label;
          let border = '#cbd5e1';
          let bg = '#ffffff';
          let color = '#0f172a';

          if (tappedItem !== null) {
            if (isChosen) {
              border = item.isTarget ? '#16a34a' : '#dc2626';
              bg = item.isTarget ? '#dcfce7' : '#fee2e2';
              color = item.isTarget ? '#15803d' : '#b91c1c';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleTap(item)}
              disabled={tappedItem !== null && item.isTarget}
              style={{
                padding: '1.35rem',
                borderRadius: '22px',
                background: bg,
                border: `3px solid ${border}`,
                color: color,
                fontSize: '1.35rem',
                fontWeight: 800,
                cursor: tappedItem ? 'default' : 'pointer',
                minHeight: '64px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const FindTheObjectGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="find_the_object"
      title="Find the Object"
      domainName="Attention"
      instructions="Look at the items on the tray and tap the target item."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <FindTheObjectContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 7: TARGET TAP
// ==========================================
interface TargetTapContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const TargetTapContent: React.FC<TargetTapContentProps> = ({ level, recordAttempt, finishGame }) => {
  // Generate symbols scaled by level
  const [symbols] = useState(() => {
    if (level === 1) {
      return [
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🔺 Triangle', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false }
      ];
    } else if (level === 2) {
      return [
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false },
        { shape: '🔺 Triangle', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '⭐ Star', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🔺 Triangle', isTarget: false }
      ];
    } else {
      return [
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false },
        { shape: '⭐ Star', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🔺 Triangle', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🔷 Diamond', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '🟦 Square', isTarget: false },
        { shape: '🔺 Triangle', isTarget: false },
        { shape: '🔴 Circle', isTarget: true },
        { shape: '⭐ Star', isTarget: false }
      ];
    }
  });

  const [tapped, setTapped] = useState<number[]>([]);

  const handleTap = (idx: number) => {
    if (tapped.includes(idx)) return;
    const isTarget = symbols[idx].isTarget;
    recordAttempt(isTarget);
    const nextTapped = [...tapped, idx];
    setTapped(nextTapped);

    const targetCount = symbols.filter(s => s.isTarget).length;
    const matchedTargetCount = nextTapped.filter(i => symbols[i].isTarget).length;

    if (isTarget) {
      if (matchedTargetCount === targetCount) {
        speakText("All circles tapped! Superb focus.");
        setTimeout(() => finishGame(100), 800);
      }
    } else {
      speakText("That's not a circle. Tap only red circles.");
    }
  };

  const totalTargets = symbols.filter(s => s.isTarget).length;
  const foundTargets = tapped.filter(i => symbols[i].isTarget).length;

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseRedTarget {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.45)); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        padding: '0.6rem 1.25rem',
        background: '#f8fafc',
        borderRadius: '18px',
        border: '2px solid #e2e8f0',
        color: '#0f766e',
        fontWeight: 800
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', animation: 'pulseRedTarget 2s infinite ease-in-out' }}>
          Target: 🔴 Circles
        </span>
        <span style={{ background: '#ccfbf1', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
          Found: {foundTargets} / {totalTargets}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${symbols.length > 9 ? 4 : 3}, 1fr)`,
        gap: '0.75rem'
      }}>
        {symbols.map((s, i) => {
          const isTapped = tapped.includes(i);
          // Only reveal green or red AFTER being tapped!
          const bg = isTapped ? (s.isTarget ? '#ccfbf1' : '#ffe4e6') : '#ffffff';
          const border = isTapped ? (s.isTarget ? '#0f766e' : '#f43f5e') : '#cbd5e1';
          const textColor = isTapped ? (s.isTarget ? '#0f766e' : '#e11d48') : '#0f172a';

          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={isTapped}
              style={{
                height: symbols.length > 9 ? '80px' : '90px',
                borderRadius: '20px',
                background: bg,
                border: `3px solid ${border}`,
                color: textColor,
                fontSize: '1.15rem',
                fontWeight: 800,
                cursor: isTapped ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isTapped ? 'none' : '0 3px 8px rgba(0,0,0,0.04)'
              }}
            >
              {s.shape}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TargetTapGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="target_tap"
      title="Target Tap"
      domainName="Attention"
      instructions="Tap every 🔴 Circle. Do not tap other shapes."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <TargetTapContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 8: SPOT THE DIFFERENT ONE
// ==========================================
interface DifferentOneContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const DIFFERENT_SETS = [
  { common: '🌸', different: '🌺', count: 5, prompt: 'Which flower is different?' },
  { common: '⭐', different: '☀️', count: 6, prompt: 'Which celestial symbol is different?' },
  { common: '🍵', different: '☕', count: 6, prompt: 'Which warm beverage cup is different?' }
];

const DifferentOneContent: React.FC<DifferentOneContentProps> = ({ level, recordAttempt, finishGame }) => {
  const current = DIFFERENT_SETS[(level - 1) % DIFFERENT_SETS.length];
  const [differentIndex] = useState(() => Math.floor(Math.random() * current.count));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const options = Array.from({ length: current.count }, (_, idx) =>
    idx === differentIndex ? current.different : current.common
  );

  const handleSelect = (idx: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);
    const isCorrect = idx === differentIndex;
    recordAttempt(isCorrect);

    if (isCorrect) {
      speakText("Correct! You spotted the different one.");
      setTimeout(() => finishGame(100), 900);
    } else {
      speakText("Look closely at the details and try again.");
      setTimeout(() => setSelectedIndex(null), 1000);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        {current.prompt} (Level {level})
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {options.map((opt, i) => {
          const isChosen = selectedIndex === i;
          let border = '#cbd5e1';
          let bg = '#ffffff';

          if (selectedIndex !== null) {
            if (isChosen) {
              border = i === differentIndex ? '#16a34a' : '#dc2626';
              bg = i === differentIndex ? '#dcfce7' : '#fee2e2';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedIndex !== null && i === differentIndex}
              style={{
                width: '85px',
                height: '85px',
                borderRadius: '22px',
                background: bg,
                border: `3px solid ${border}`,
                fontSize: '2.5rem',
                cursor: selectedIndex !== null && i === differentIndex ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DifferentOneGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="different_one"
      title="Spot the Different One"
      domainName="Attention"
      instructions="Look at the items below and select the one that is different."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <DifferentOneContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};

// ==========================================
// GAME 9: REACTION ACTIVITY (CALM REACTION TAP)
// ==========================================
interface ReactionActivityContentProps {
  level: number;
  recordAttempt: (isCorrect: boolean) => void;
  finishGame: (finalScore?: number) => void;
}

const ReactionActivityContent: React.FC<ReactionActivityContentProps> = ({ level, recordAttempt, finishGame }) => {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [tapped, setTapped] = useState(false);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  useEffect(() => {
    // Dynamic delay based on level
    const baseDelay = level === 1 ? 2500 : (level === 2 ? 2000 : 1500);
    const delay = baseDelay + Math.random() * 1000;
    const timer = setTimeout(() => {
      setActive(true);
      setStartTime(Date.now());
      speakText("Tap now!");
    }, delay);

    return () => clearTimeout(timer);
  }, [level]);

  const handleTap = () => {
    if (!active || !startTime || tapped) return;
    const reaction = Date.now() - startTime;
    setTapped(true);
    setReactionMs(reaction);
    recordAttempt(true);

    const seconds = (reaction / 1000).toFixed(2);
    speakText(`Great reaction speed! ${seconds} seconds.`);
    setTimeout(() => finishGame(100), 1200);
  };

  return (
    <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '28px', border: '3px solid #cbd5e1', textAlign: 'center' }}>
      <style>{`
        @keyframes pulseReactionTarget {
          0%, 100% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.8)); }
        }
      `}</style>

      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        {tapped ? `⚡ Reaction: ${(reactionMs! / 1000).toFixed(2)}s` : (active ? '🟢 TAP NOW!' : '⏳ Get Ready...')}
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={handleTap}
          disabled={!active || tapped}
          style={{
            width: '190px',
            height: '190px',
            borderRadius: '50%',
            background: active
              ? (tapped ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)')
              : '#cbd5e1',
            color: '#ffffff',
            border: active ? '4px solid #34d399' : '4px solid #94a3b8',
            fontSize: '2.2rem',
            fontWeight: 900,
            cursor: active && !tapped ? 'pointer' : 'default',
            boxShadow: active ? '0 15px 35px rgba(16, 185, 129, 0.45)' : 'none',
            animation: active && !tapped ? 'pulseReactionTarget 1.2s infinite ease-in-out' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {tapped ? '✓' : (active ? 'TAP!' : 'WAIT')}
        </button>
      </div>

      <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
        Level {level}: {active ? 'Tap the green circle immediately!' : 'Keep your hand ready over the circle.'}
      </p>
    </div>
  );
};

export const ReactionActivityGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <GameEngine
      gameId="reaction_activity"
      title="Calm Reaction Tap"
      domainName="Attention"
      instructions="Wait for the large circle to turn green, then tap it comfortably."
      onBackOverride={onBack}
    >
      {({ level, recordAttempt, finishGame }) => (
        <ReactionActivityContent level={level} recordAttempt={recordAttempt} finishGame={finishGame} />
      )}
    </GameEngine>
  );
};
