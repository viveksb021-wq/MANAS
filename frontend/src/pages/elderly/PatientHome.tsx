import React, { useState } from 'react';
import { Logo } from '../../components/Logo';
import { Brain, Users, Heart, MapPin, Bell, Mic, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../../components/PageTransition';

interface PatientHomeProps {
  onNavigate: (screen: string) => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isNextStepDone, setIsNextStepDone] = useState(false);
  const [isSosTriggered, setIsSosTriggered] = useState(false);

  const patientName = user?.name ? user.name.split(' ')[0] : 'Vivek';

  const handleTriggerSos = () => {
    setIsSosTriggered(true);
    setTimeout(() => setIsSosTriggered(false), 4000);
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
        {/* Top Header Branding & Greeting */}
        <div style={{
          background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '32px',
          padding: '2rem 1.75rem',
          boxShadow: '0 20px 35px -10px rgba(15, 118, 110, 0.35)',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <Logo size="medium" lightText={true} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Good Morning, {patientName} 👋
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.95, fontWeight: 500, color: '#ccfbf1' }}>
              "Let's make today a little easier."
            </p>
          </div>
        </div>

        {/* SOS Alert Banner */}
        {isSosTriggered && (
          <div style={{
            background: '#fff1f2',
            border: '3px solid #f43f5e',
            borderRadius: '24px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            color: '#be123c',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertCircle size={36} color="#f43f5e" />
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Guardian Alerted</h3>
              <p style={{ fontSize: '1.1rem' }}>Ravi has been notified. Help is on the way!</p>
            </div>
          </div>
        )}

        {/* TODAY'S NEXT STEP Prominent Card */}
        <div style={{
          background: isNextStepDone ? '#f0fdfa' : '#ffffff',
          border: `3px solid ${isNextStepDone ? '#0f766e' : '#14b8a6'}`,
          borderRadius: '28px',
          padding: '1.5rem',
          boxShadow: '0 15px 30px rgba(15, 118, 110, 0.12)',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            TODAY'S NEXT STEP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#ffe4e6', color: '#e11d48', padding: '1rem', borderRadius: '20px', fontSize: '2.5rem' }}>
                💊
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Medicine</h3>
                <p style={{ fontSize: '1.15rem', color: '#475569', fontWeight: 600 }}>
                  {isNextStepDone ? 'Completed at 8:00 PM' : 'Your next reminder is at 8:00 PM'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNextStepDone(!isNextStepDone)}
              style={{
                background: isNextStepDone ? '#ccfbf1' : '#0f766e',
                color: isNextStepDone ? '#0f766e' : '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '0.85rem 1.4rem',
                fontWeight: 800,
                fontSize: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {isNextStepDone ? <CheckCircle size={22} /> : null}
              {isNextStepDone ? 'Done' : 'Mark Done'}
            </button>
          </div>
        </div>

        {/* Main Action Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 🧠 PLAY & TRAIN */}
          <button
            onClick={() => onNavigate('games')}
            className="patient-card-btn"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <div style={{ background: '#ccfbf1', padding: '0.85rem', borderRadius: '20px', color: '#0f766e' }}>
              <Brain size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>PLAY & TRAIN</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>Personalized cognitive activities</div>
            </div>
          </button>

          {/* 👤 PEOPLE I KNOW */}
          <button
            onClick={() => onNavigate('people')}
            className="patient-card-btn"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <div style={{ background: '#e0e7ff', padding: '0.85rem', borderRadius: '20px', color: '#4f46e5' }}>
              <Users size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>PEOPLE I KNOW</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>Recognize familiar people</div>
            </div>
          </button>

          {/* ❤️ MY MEMORIES */}
          <button
            onClick={() => onNavigate('memories')}
            className="patient-card-btn"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <div style={{ background: '#ffe4e6', padding: '0.85rem', borderRadius: '20px', color: '#e11d48' }}>
              <Heart size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>MY MEMORIES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>Photos and important memories</div>
            </div>
          </button>

          {/* 📍 PLACES I KNOW */}
          <button
            onClick={() => onNavigate('places')}
            className="patient-card-btn"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <div style={{ background: '#e0f2fe', padding: '0.85rem', borderRadius: '20px', color: '#0284c7' }}>
              <MapPin size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>PLACES I KNOW</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>Saved important places & route map</div>
            </div>
          </button>

          {/* 🔔 TODAY */}
          <button
            onClick={() => onNavigate('today')}
            className="patient-card-btn"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <div style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '20px', color: '#d97706' }}>
              <Bell size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>TODAY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>Routine and reminders</div>
            </div>
          </button>

          {/* 🎤 ASK MANAS */}
          <button
            onClick={() => onNavigate('ask')}
            className="patient-card-btn"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 12px 25px rgba(15, 118, 110, 0.3)'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.85rem', borderRadius: '20px', color: '#ffffff' }}>
              <Mic size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>ASK MANAS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#ccfbf1' }}>Speak to your assistant</div>
            </div>
          </button>

          {/* 🆘 HELP */}
          <button
            onClick={handleTriggerSos}
            className="patient-card-btn"
            style={{
              background: '#fff1f2',
              borderColor: '#f43f5e',
              color: '#be123c'
            }}
          >
            <div style={{ background: '#ffe4e6', padding: '0.85rem', borderRadius: '20px', color: '#e11d48' }}>
              <AlertCircle size={38} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#be123c' }}>HELP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#9f1239' }}>Contact guardian</div>
            </div>
          </button>
        </div>
      </div>
    </PageTransition>
  );
};
