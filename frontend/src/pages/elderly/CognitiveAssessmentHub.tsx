import React, { useState } from 'react';
import { Brain, CheckCircle, Award, Volume2, ShieldCheck, Activity, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { speakText } from '../../utils/speech';
import { PageTransition } from '../../components/PageTransition';
import { BackButton } from '../../components/BackButton';
import { usePatient } from '../../context/PatientContext';

interface CognitiveAssessmentHubProps {
  onBack?: () => void;
}

export interface DomainScore {
  domain: string;
  name: string;
  score: number; // 0 - 100
  status: 'Strong' | 'Normal' | 'Needs Practice';
}

export const ASSESSMENT_DOMAINS = [
  { id: 'orientation', name: 'Orientation (Time & Place)', desc: 'Knowledge of date, season, and location' },
  { id: 'memory', name: 'Memory Recall', desc: 'Short-term and delayed word recall' },
  { id: 'attention', name: 'Attention & Calculation', desc: 'Focus and serial pattern counting' },
  { id: 'language', name: 'Language & Naming', desc: 'Vocabulary and object identification' },
  { id: 'executive', name: 'Executive Function', desc: 'Planning and category sorting' },
  { id: 'visuospatial', name: 'Visuospatial Ability', desc: 'Spatial awareness and geometry' },
  { id: 'judgment', name: 'Judgment & Problem Solving', desc: 'Practical scenario decision making' }
];

export const CognitiveAssessmentHub: React.FC<CognitiveAssessmentHubProps> = ({ onBack }) => {
  const { currentPatientId } = usePatient();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [overallScore, setOverallScore] = useState<number>(85);

  const questions = [
    {
      domain: 'orientation',
      question: 'What season and year is it currently in Guwahati/Shillong?',
      options: [
        { label: 'Correct Season & Year', score: 100 },
        { label: 'Unsure of Season', score: 50 },
        { label: 'Incorrect', score: 20 }
      ]
    },
    {
      domain: 'memory',
      question: 'Recall the 3 items shown earlier: (Pine Tree, Silver Coin, Lotus Lake)',
      options: [
        { label: 'Recalled all 3 items', score: 100 },
        { label: 'Recalled 2 items', score: 70 },
        { label: 'Recalled 1 item', score: 40 }
      ]
    },
    {
      domain: 'attention',
      question: 'Count backwards from 30 by 3s: (30, 27, 24, 21...)',
      options: [
        { label: 'Flawless calculation', score: 100 },
        { label: '1 minor error', score: 75 },
        { label: 'Multiple errors', score: 30 }
      ]
    },
    {
      domain: 'language',
      question: 'Name the medical tool used by Dr. Haren Barua to listen to heartbeat',
      options: [
        { label: 'Stethoscope', score: 100 },
        { label: 'Medical device', score: 60 },
        { label: 'Unsure', score: 20 }
      ]
    },
    {
      domain: 'executive',
      question: 'Order the morning routine: (Wake up → Medicine → Breakfast)',
      options: [
        { label: 'Correct Logical Order', score: 100 },
        { label: 'Partial Order', score: 60 },
        { label: 'Confused Sequence', score: 20 }
      ]
    },
    {
      domain: 'visuospatial',
      question: 'Identify the symmetrical geometric pattern',
      options: [
        { label: 'Correct Pattern Matching', score: 100 },
        { label: 'Slow Matching', score: 70 },
        { label: 'Incorrect', score: 30 }
      ]
    },
    {
      domain: 'judgment',
      question: 'What should you do if you feel dizzy during an evening walk?',
      options: [
        { label: 'Sit down & press MANAS SOS button', score: 100 },
        { label: 'Continue walking slowly', score: 40 },
        { label: 'Ignore it', score: 10 }
      ]
    }
  ];

  const handleSelectOption = (score: number) => {
    const q = questions[currentStep];
    const newAnswers = { ...answers, [q.domain]: score };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = async (finalAnswers: Record<string, number>) => {
    setIsSubmitting(true);

    const computedScores: DomainScore[] = ASSESSMENT_DOMAINS.map(d => {
      const score = finalAnswers[d.id] ?? 80;
      let status: 'Strong' | 'Normal' | 'Needs Practice' = 'Needs Practice';
      if (score >= 85) status = 'Strong';
      else if (score >= 65) status = 'Normal';
      return {
        domain: d.id,
        name: d.name,
        score,
        status
      };
    });

    const total = Math.round(computedScores.reduce((acc, curr) => acc + curr.score, 0) / computedScores.length);
    setDomainScores(computedScores);
    setOverallScore(total);
    setIsFinished(true);
    setIsSubmitting(false);

    speakText(`Assessment completed! Your cognitive wellness index is ${total} percent.`);

    try {
      await fetchApi('/assessment/submit', {
        method: 'POST',
        body: {
          patient_id: currentPatientId,
          overall_score: total,
          domain_scores: computedScores.reduce((acc: any, item) => {
            acc[item.domain] = item.score;
            return acc;
          }, {})
        }
      });
    } catch (e) {
      console.warn('Assessment submit fallback', e);
    }
  };

  const currentQ = questions[currentStep];

  return (
    <PageTransition>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <BackButton label="Home" onClick={onBack} variant="patient" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            COGNITIVE HUB
          </h1>
        </div>

        {/* Assessment Progress Header */}
        {!isFinished && (
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#ffffff',
            borderRadius: '28px',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 15px 30px rgba(15, 118, 110, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ccfbf1' }}>
                7-Domain Cognitive Checkup
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Question {currentStep + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                  height: '100%',
                  background: '#5eead4',
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </div>
          </div>
        )}

        {/* ACTIVE QUESTION STEP */}
        {!isFinished && currentQ && (
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '2rem 1.75rem',
            border: '3px solid #cbd5e1',
            boxShadow: '0 15px 35px -5px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Domain: {ASSESSMENT_DOMAINS.find(d => d.id === currentQ.domain)?.name}
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              {currentQ.question}
            </h2>

            <button
              onClick={() => speakText(currentQ.question)}
              style={{
                background: '#f0fdfa',
                border: '2px solid #ccfbf1',
                borderRadius: '16px',
                padding: '0.65rem 1rem',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#0f766e',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={18} /> Listen to Question
            </button>

            {/* Option Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {currentQ.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(opt.score)}
                  style={{
                    background: '#ffffff',
                    border: '3px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '1.15rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                  }}
                >
                  <span>{opt.label}</span>
                  <ChevronRight size={22} color="#0f766e" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS SUMMARY SCREEN */}
        {isFinished && (
          <div>
            {/* Overall Score Card */}
            <div style={{
              background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
              color: '#ffffff',
              borderRadius: '28px',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(15, 118, 110, 0.25)',
              marginBottom: '1.75rem'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Award size={48} color="#5eead4" />
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                {overallScore}% Wellness Index
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#ccfbf1', fontWeight: 600, marginTop: '0.25rem' }}>
                Cognitive Performance Check Complete
              </p>
            </div>

            {/* 7 Domain Scores Breakdown */}
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Domain Breakdown:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {domainScores.map(ds => (
                <div
                  key={ds.domain}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {ds.name}
                    </span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: ds.score >= 80 ? '#0f766e' : (ds.score >= 60 ? '#d97706' : '#e11d48'),
                      background: ds.score >= 80 ? '#ccfbf1' : (ds.score >= 60 ? '#fef3c7' : '#ffe4e6'),
                      padding: '0.3rem 0.75rem',
                      borderRadius: '12px'
                    }}>
                      {ds.score}% • {ds.status}
                    </span>
                  </div>

                  <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${ds.score}%`, height: '100%', background: ds.score >= 80 ? '#0f766e' : (ds.score >= 60 ? '#f59e0b' : '#f43f5e') }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div style={{
              background: '#f8fafc',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              padding: '1.25rem',
              color: '#475569',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <ShieldCheck size={28} color="#0f766e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Notice for Caregivers & Users:</strong> This assessment tracks self-reported engagement and memory performance for cognitive wellness support. It is not a clinical diagnostic instrument.
              </div>
            </div>

            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentStep(0);
                setAnswers({});
              }}
              style={{
                width: '100%',
                padding: '1.1rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
              }}
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
