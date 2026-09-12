import React, { useState, useEffect, useRef } from 'react';
import { GameHeader } from './GameHeader';
import { GameInstructions } from './GameInstructions';
import { GameResults } from './GameResults';
import { ExitConfirmationModal } from './ExitConfirmationModal';
import { useNavigation } from '../../../../context/NavigationContext';
import { fetchApi } from '../../../../utils/api';
import { useOffline } from '../../../../context/OfflineContext';
import { speakText } from '../../../../utils/speech';

export interface GameEngineProps {
  gameId: string;
  title: string;
  domainName: string;
  instructions: string;
  estimatedDuration?: string;
  initialDifficulty?: number;
  initialLevel?: number;
  onFinish?: (results: any) => void;
  onBackOverride?: () => void;
  children: (props: {
    difficulty: number;
    step: number;
    level: number;
    recordAttempt: (isCorrect: boolean, details?: any) => void;
    finishGame: (finalScore?: number, finalAccuracy?: number) => void;
  }) => React.ReactNode;
}

export const GameEngine: React.FC<GameEngineProps> = ({
  gameId,
  title,
  domainName,
  instructions,
  estimatedDuration = '3-5 min',
  initialDifficulty = 2,
  initialLevel = 1,
  onFinish,
  onBackOverride,
  children
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'completed'>('instructions');
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [level, setLevel] = useState(initialLevel);
  const [step, setStep] = useState(1);
  const [attempts, setAttempts] = useState<{ isCorrect: boolean; timestamp: number }[]>([]);
  const attemptsRef = useRef<{ isCorrect: boolean; timestamp: number }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<any | null>(null);
  const { registerExitGuard, goBack } = useNavigation();
  const { isOnline } = useOffline();

  // Register exit guard while playing
  useEffect(() => {
    if (gameState === 'playing') {
      registerExitGuard(() => true);
    } else {
      registerExitGuard(null);
    }
    return () => registerExitGuard(null);
  }, [gameState, registerExitGuard]);

  const handleStartGame = () => {
    attemptsRef.current = [];
    setGameState('playing');
    setStartTime(Date.now());
    setAttempts([]);
    setStep(1);
  };

  const recordAttempt = (isCorrect: boolean) => {
    attemptsRef.current.push({ isCorrect, timestamp: Date.now() });
    setAttempts([...attemptsRef.current]);
    setStep(prev => prev + 1);
  };

  const finishGame = async (overrideScore?: number, overrideAccuracy?: number) => {
    const endTime = Date.now();
    const durationSec = startTime ? Math.round((endTime - startTime) / 1000) : 10;
    const currentAttempts = attemptsRef.current;

    let calculatedAccuracy: number;
    if (overrideAccuracy !== undefined) {
      calculatedAccuracy = overrideAccuracy;
    } else if (currentAttempts.length > 0) {
      const correctCount = currentAttempts.filter(a => a.isCorrect).length;
      calculatedAccuracy = Math.round((correctCount / currentAttempts.length) * 100);
    } else if (overrideScore !== undefined) {
      calculatedAccuracy = Math.min(100, Math.max(0, overrideScore));
    } else {
      calculatedAccuracy = 100;
    }

    const calculatedScore = overrideScore !== undefined ? overrideScore : Math.round((calculatedAccuracy * 0.8) + 20);

    const adaptiveReason = calculatedAccuracy >= 80
      ? `Outstanding accuracy in Level ${level}! Adaptive engine is scaling complexity.`
      : (calculatedAccuracy >= 50 ? `Consistent performance in Level ${level}! Ready to advance.` : 'Gentle supportive mode enabled to ensure comfortable engagement.');

    const newDiff = calculatedAccuracy >= 85 ? Math.min(5, difficulty + 1) : (calculatedAccuracy < 50 ? Math.max(1, difficulty - 1) : difficulty);

    const hasPassed = calculatedScore >= 50 || calculatedAccuracy >= 50;

    const resultPayload = {
      game_id: gameId,
      title,
      domain: domainName,
      score: calculatedScore,
      accuracy: calculatedAccuracy,
      time_spent_sec: durationSec,
      difficulty,
      level,
      hasPassed,
      new_difficulty: newDiff,
      adaptive_reason: adaptiveReason,
      is_offline: !isOnline
    };

    setFinalResult(resultPayload);
    setGameState('completed');

    // Submit or cache
    try {
      if (isOnline) {
        await fetchApi('/assessment/submit', {
          method: 'POST',
          body: {
            domain: domainName,
            score: calculatedScore,
            time_taken_ms: durationSec * 1000,
            difficulty_level: difficulty
          }
        });
      } else {
        const cached = JSON.parse(localStorage.getItem('manas_offline_game_results') || '[]');
        cached.push(resultPayload);
        localStorage.setItem('manas_offline_game_results', JSON.stringify(cached));
      }
    } catch (e) {
      console.warn('Game result submit fallback active', e);
    }
  };

  const handleRetry = () => {
    attemptsRef.current = [];
    setAttempts([]);
    setGameState('playing');
    setStartTime(Date.now());
    setStep(1);
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setDifficulty(prev => Math.min(5, prev + 1));
    attemptsRef.current = [];
    setAttempts([]);
    setFinalResult(null);
    setGameState('playing');
    setStartTime(Date.now());
    setStep(1);
    speakText(`Advancing to Level ${nextLvl}!`);
  };

  const handleDone = () => {
    if (onFinish) {
      onFinish(finalResult);
    } else if (onBackOverride) {
      onBackOverride();
    } else {
      goBack();
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
      <GameHeader
        title={title}
        domainName={domainName}
        difficultyLevel={difficulty}
        level={level}
        onBack={onBackOverride}
      />

      {gameState === 'instructions' && (
        <GameInstructions
          title={title}
          instructionsText={instructions}
          domainName={domainName}
          estimatedDuration={estimatedDuration}
          onStart={handleStartGame}
        />
      )}

      {gameState === 'playing' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {children({
            difficulty,
            step,
            level,
            recordAttempt,
            finishGame
          })}
        </div>
      )}

      {gameState === 'completed' && finalResult && (
        <GameResults
          title={title}
          score={finalResult.score}
          accuracy={finalResult.accuracy}
          timeSpentSec={finalResult.time_spent_sec}
          adaptiveReason={finalResult.adaptive_reason}
          newDifficulty={finalResult.new_difficulty}
          level={level}
          hasPassed={finalResult.hasPassed}
          isOffline={finalResult.is_offline}
          onRetry={handleRetry}
          onNextLevel={handleNextLevel}
          onFinish={handleDone}
        />
      )}

      <ExitConfirmationModal />
    </div>
  );
};
