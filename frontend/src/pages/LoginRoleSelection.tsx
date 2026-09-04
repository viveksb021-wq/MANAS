import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, Heart, Brain, Sparkles } from 'lucide-react';

interface LoginRoleSelectionProps {
  onSelectRole: (role: 'patient' | 'guardian') => void;
}

export const LoginRoleSelection: React.FC<LoginRoleSelectionProps> = ({ onSelectRole }) => {
  const { login } = useAuth();

  const handleChooseRole = (selectedRole: 'patient' | 'guardian') => {
    login(selectedRole);
    onSelectRole(selectedRole);
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '32px',
        maxWidth: '560px',
        width: '100%',
        padding: '3rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(13, 148, 136, 0.15)',
        border: '3px solid #ccfbf1',
        textAlign: 'center',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        {/* App Logo & Title */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 15px 30px rgba(13, 148, 136, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <Brain size={56} />
        </div>

        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}>
          MANAS
        </h1>

        <p style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: '#0d9488',
          margin: '0.5rem 0 0.25rem 0'
        }}>
          Memory Assistance & Neural Adaptive System
        </p>

        <p style={{
          fontSize: '1.4rem',
          fontWeight: 600,
          color: '#475569',
          marginBottom: '2.5rem'
        }}>
          "Your personal memory companion"
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <button
            onClick={() => handleChooseRole('patient')}
            className="patient-card-btn"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: '#ffffff',
              border: 'none',
              justifyContent: 'center',
              fontSize: '1.65rem',
              boxShadow: '0 12px 25px rgba(13, 148, 136, 0.35)'
            }}
          >
            <UserCheck size={36} />
            Patient Login
          </button>

          <button
            onClick={() => handleChooseRole('guardian')}
            className="patient-card-btn"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              border: '3px solid #cbd5e1',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}
          >
            <ShieldCheck size={32} color="#6366f1" />
            Guardian Login
          </button>
        </div>


      </div>
    </div>
  );
};
