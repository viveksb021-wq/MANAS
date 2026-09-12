import React, { useState } from 'react';
import { Logo } from '../../components/Logo';
import { Brain, Users, Heart, MapPin, Bell, AlertCircle, CheckCircle, ArrowRight, Stethoscope, Activity, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { PageTransition } from '../../components/PageTransition';
import { useNavigation } from '../../context/NavigationContext';

interface PatientHomeProps {
  onNavigate: (screen: string) => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({ onNavigate }) => {
  const { user, isHighContrast, isReduceMotion } = useAuth();
  const { patientProfile } = usePatient();
  const { navigate } = useNavigation();
  const [isNextStepDone, setIsNextStepDone] = useState(false);
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const [sosStatusMessage, setSosStatusMessage] = useState<{ title: string; subtitle: string; isError?: boolean } | null>(null);

  const patientName = patientProfile.full_name.split(' ')[0] || 'Vivek';

  const handleNav = (screen: string) => {
    navigate(screen);
    if (onNavigate) onNavigate(screen);
  };

  const handleTriggerSos = () => {
    const rawNumber = patientProfile?.emergency_contact;
    const cleanNumber = rawNumber ? rawNumber.replace(/[^\d+]/g, '') : '';

    if (cleanNumber) {
      setSosStatusMessage({
        title: 'Opening Caregiver Dialer...',
        subtitle: `Connecting to ${rawNumber}`,
        isError: false
      });
      setIsSosTriggered(true);

      // Open device/browser dialer without auto-calling
      window.location.href = `tel:${cleanNumber}`;

      setTimeout(() => {
        setIsSosTriggered(false);
        setSosStatusMessage(null);
      }, 6000);
    } else {
      setSosStatusMessage({
        title: 'Caregiver phone number is not available.',
        subtitle: 'Please check with your guardian or update settings.',
        isError: true
      });
      setIsSosTriggered(true);
      setTimeout(() => {
        setIsSosTriggered(false);
        setSosStatusMessage(null);
      }, 6000);
    }
  };

  return (
    <PageTransition>
      <div className="patient-home-view" style={{ minHeight: '100%', padding: '1.25rem 1rem 4.5rem 1rem' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* Hero Mountain Sunrise Greeting Card */}
          <div
            className="good-morning-card"
            style={{
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              border: isHighContrast ? '2px solid #ffff00' : '1.5px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(0, 0, 0, 0.03)',
              marginBottom: '1.75rem',
              backgroundColor: isHighContrast ? '#111111' : '#ffffff',
              minHeight: '220px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* LAYER 1: Exact Mountain Sunrise Image */}
            {!isHighContrast && (
              <div
                aria-hidden="true"
                className="good-morning-bg-img"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: "url('/images/manas/good-morning-background.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  backgroundRepeat: 'no-repeat',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />
            )}

            {/* LAYER 2: Soft Readability Translucent Wash from the Left */}
            {!isHighContrast && (
              <div
                aria-hidden="true"
                className="good-morning-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.85) 38%, rgba(255, 255, 255, 0.48) 68%, rgba(255, 255, 255, 0.08) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            )}

            {/* LAYER 3: Readable Text Content Layer Positioned on Left */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '2.25rem 2.25rem',
                maxWidth: '520px',
                width: '100%'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#0f766e',
                  border: '1px solid rgba(153, 246, 228, 0.8)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                }}
              >
                <Sun size={18} color="#f59e0b" />
                <span>Morning Greeting</span>
              </div>

              <h1
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: isHighContrast ? '#ffff00' : '#0f172a',
                  marginBottom: '0.45rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Good Morning, {patientName} 👋
              </h1>

              <p
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: isHighContrast ? '#ffffff' : '#1e293b',
                  lineHeight: 1.45,
                  marginBottom: '0.35rem'
                }}
              >
                A new day, a new memory.
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: isHighContrast ? '#e2e8f0' : '#0f766e',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>🍃</span> Take small steps. You're doing great!
              </p>
            </div>
          </div>

          {/* SOS Alert Banner */}
          {isSosTriggered && sosStatusMessage && (
            <div style={{
              background: sosStatusMessage.isError ? '#fff1f2' : '#f0fdfa',
              border: `2px solid ${sosStatusMessage.isError ? '#f43f5e' : '#0d9488'}`,
              borderRadius: '24px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              color: sosStatusMessage.isError ? '#be123c' : '#0f766e',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <AlertCircle size={36} color={sosStatusMessage.isError ? '#f43f5e' : '#0d9488'} />
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{sosStatusMessage.title}</h3>
                <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{sosStatusMessage.subtitle}</p>
              </div>
            </div>
          )}

          {/* TODAY'S NEXT STEP Prominent Card */}
          <div
            className="patient-glass-card"
            style={{
              padding: '1.5rem 1.75rem',
              marginBottom: '2rem',
              background: isNextStepDone ? 'rgba(240, 253, 250, 0.88)' : 'rgba(255, 255, 255, 0.84)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '28px',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 15px 35px -8px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              TODAY'S NEXT STEP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ background: '#ffe4e6', color: '#e11d48', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  💊
                </div>
                <div>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Medicine</h3>
                  <p style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
                    {isNextStepDone ? 'Completed at 8:00 PM' : 'Your next reminder is at 8:00 PM'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNextStepDone(!isNextStepDone)}
                style={{
                  background: isNextStepDone ? '#ccfbf1' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: isNextStepDone ? '#0f766e' : '#ffffff',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '0.85rem 1.5rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: isNextStepDone ? 'none' : '0 8px 20px rgba(13, 148, 136, 0.3)'
                }}
              >
                {isNextStepDone ? <CheckCircle size={22} /> : null}
                {isNextStepDone ? 'Done' : 'Mark Done'}
              </button>
            </div>
          </div>

          {/* 2-Column Responsive Feature Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>

            {/* 🌸 MEMORY GARDEN */}
            <button
              onClick={() => handleNav('memories')}
              className="patient-card-btn"
            >
              <div style={{ background: '#f3e8ff', padding: '0.85rem', borderRadius: '20px', color: '#8b5cf6' }}>
                <Heart size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Memory Garden</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Relive your special moments</div>
              </div>
              <ArrowRight size={22} color="#8b5cf6" />
            </button>

            {/* 🧠 COGNITIVE GAMES */}
            <button
              onClick={() => handleNav('games')}
              className="patient-card-btn"
            >
              <div style={{ background: '#d1fae5', padding: '0.85rem', borderRadius: '20px', color: '#059669' }}>
                <Brain size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Cognitive Games</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Keep your mind active</div>
              </div>
              <ArrowRight size={22} color="#059669" />
            </button>

            {/* 📊 COGNITIVE ASSESSMENT */}
            <button
              onClick={() => handleNav('assessment')}
              className="patient-card-btn"
            >
              <div style={{ background: '#e0f2fe', padding: '0.85rem', borderRadius: '20px', color: '#0284c7' }}>
                <Activity size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Cognitive Assessment</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Track activity performance</div>
              </div>
              <ArrowRight size={22} color="#0284c7" />
            </button>

            {/* 👥 PEOPLE I KNOW */}
            <button
              onClick={() => handleNav('people')}
              className="patient-card-btn"
            >
              <div style={{ background: '#e0e7ff', padding: '0.85rem', borderRadius: '20px', color: '#4f46e5' }}>
                <Users size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>People I Know</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>See your loved ones</div>
              </div>
              <ArrowRight size={22} color="#4f46e5" />
            </button>

            {/* 🔔 REMINDERS */}
            <button
              onClick={() => handleNav('today')}
              className="patient-card-btn"
            >
              <div style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '20px', color: '#d97706' }}>
                <Bell size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Reminders</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Medicine, meals and more</div>
              </div>
              <ArrowRight size={22} color="#d97706" />
            </button>

            {/* 📍 SAFE PLACES */}
            <button
              onClick={() => handleNav('places')}
              className="patient-card-btn"
            >
              <div style={{ background: '#ccfbf1', padding: '0.85rem', borderRadius: '20px', color: '#0d9488' }}>
                <MapPin size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Safe Places</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Your important locations</div>
              </div>
              <ArrowRight size={22} color="#0d9488" />
            </button>

            {/* 🩺 FIND DOCTOR */}
            <button
              onClick={() => handleNav('places')}
              className="patient-card-btn"
            >
              <div style={{ background: '#fae8ff', padding: '0.85rem', borderRadius: '20px', color: '#c026d3' }}>
                <Stethoscope size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Find Doctor</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Healthcare support</div>
              </div>
              <ArrowRight size={22} color="#c026d3" />
            </button>

            {/* 🆘 EMERGENCY HELP */}
            <button
              onClick={handleTriggerSos}
              className="patient-card-btn"
              style={{
                background: 'rgba(255, 241, 242, 0.9)',
                borderColor: '#f43f5e'
              }}
            >
              <div style={{ background: '#ffe4e6', padding: '0.85rem', borderRadius: '20px', color: '#e11d48' }}>
                <AlertCircle size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>Emergency Help</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9f1239' }}>Contact guardian</div>
              </div>
              <ArrowRight size={22} color="#e11d48" />
            </button>

          </div>

          {/* Minimal Healthcare Footer */}
          <footer style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.9rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <p style={{ fontWeight: 700, color: '#0f766e', marginBottom: '0.2rem' }}>
              Helping Memories Stay Connected
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Simple • Secure • Offline-First • For a Brighter Tomorrow
            </p>
          </footer>

        </div>
      </div>
    </PageTransition>
  );
};

