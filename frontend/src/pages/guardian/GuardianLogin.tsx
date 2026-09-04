import React, { useState } from 'react';
import { Logo } from '../../components/Logo';
import { ShieldCheck, ArrowLeft, Lock, Mail, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GuardianLoginProps {
  onBack: () => void;
  onSuccessLogin: () => void;
}

export const GuardianLogin: React.FC<GuardianLoginProps> = ({ onBack, onSuccessLogin }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('ravi@manas.org');
  const [password, setPassword] = useState('ravi123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('guardian');
    onSuccessLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '28px',
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
        position: 'relative'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            background: '#334155',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.5rem 0.85rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
          <Logo size="medium" lightText={true} />
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '1rem', color: '#ffffff' }}>
            Caregiver Portal Login
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>
            Sign in to manage patient activities & analytics
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Email or Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ravi@manas.org"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Password / PIN
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '1rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
              marginTop: '0.5rem'
            }}
          >
            Login to Guardian Dashboard
          </button>

          <button
            type="button"
            onClick={() => alert("Registration demo: Account creation active for new caregivers.")}
            style={{
              background: 'transparent',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '0.75rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <UserPlus size={18} /> Create Guardian Account
          </button>
        </form>
      </div>
    </div>
  );
};
