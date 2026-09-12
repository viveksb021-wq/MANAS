import React, { useState } from 'react';
import { Logo } from '../../components/Logo';
import { CulturalPattern } from '../../components/CulturalPattern';
import { CulturalLayer } from '../../components/CulturalLayer';
import { BackButton } from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, ShieldCheck, ArrowRight
} from 'lucide-react';

interface CaregiverSignupProps {
  onBack?: () => void;
  onSwitchToLogin: () => void;
  onSuccessSignup: (destination?: string) => void;
}

export const CaregiverSignup: React.FC<CaregiverSignupProps> = ({
  onBack,
  onSwitchToLogin,
  onSuccessSignup
}) => {
  const { registerUser } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field Touched / Validation States
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation Rules
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const getErrors = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (password.length < 6) {
      errors.password = 'Password must contain at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match.";
    }

    return errors;
  };

  const errors = getErrors();
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email: email.trim().toLowerCase(),
        password: password,
        full_name: fullName.trim(),
        role: 'guardian',
        phone_number: phone.trim() || undefined
      });

      setIsSuccess(true);

      // Smooth transition into existing caregiver onboarding flow
      setTimeout(() => {
        onSuccessSignup('onboarding');
      }, 900);
    } catch (err: any) {
      const detail = err.message || '';
      if (detail.toLowerCase().includes('already registered') || detail.toLowerCase().includes('exists')) {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else {
        setErrorMessage('Unable to create your account right now. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fdfbf7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Regional Subtle Pattern & Watermark Background */}
      <CulturalPattern opacity={0.04} color="#0f766e" />
      <CulturalLayer region="assam" language="as" />

      <div style={{
        maxWidth: '520px',
        width: '100%',
        margin: '0 auto',
        zIndex: 2,
        animation: 'fadeIn 0.35s ease-out'
      }}>
        {/* Top Header Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          padding: '0 0.5rem'
        }}>
          {onBack ? (
            <BackButton label="Back" onClick={onBack} variant="patient" />
          ) : (
            <button
              onClick={onSwitchToLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                border: '1px solid #ccfbf1',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f766e',
                boxShadow: '0 2px 6px rgba(15, 118, 110, 0.08)',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          )}

          <Logo size="medium" />
        </div>

        {/* Page Identity & Purpose */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', padding: '0 1rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f0fdfa',
            border: '1px solid #ccfbf1',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#0d9488',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={16} />
            <span>Caregiver & Family Portal</span>
          </div>

          <h1 style={{
            fontSize: '2.35rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '0.5rem'
          }}>
            Caregiver Account
          </h1>

          <p style={{
            fontSize: '1.05rem',
            fontWeight: 500,
            color: '#475569',
            lineHeight: 1.5,
            maxWidth: '440px',
            margin: '0 auto'
          }}>
            Create your caregiver account to support and stay connected with your loved one.
          </p>
        </div>

        {/* Form Card Surface */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          padding: '2.5rem 2rem',
          border: '2px solid #ccfbf1',
          boxShadow: '0 20px 45px -12px rgba(15, 118, 110, 0.12), 0 8px 16px -6px rgba(0, 0, 0, 0.03)'
        }}>
          {isSuccess ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={42} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Account Created!
              </h3>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.5, maxWidth: '340px', margin: '0 auto' }}>
                Welcome to MANAS. Taking you to caregiver onboarding to set up your loved one\'s care profile...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Error Alert Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    color: '#9f1239',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    lineHeight: 1.45,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Full Name */}
              <div>
                <label
                  htmlFor="caregiver-full-name"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.4rem'
                  }}
                >
                  <User size={16} color="#0d9488" />
                  <span>Full Name</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="caregiver-full-name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. Dr. Ravi"
                    autoComplete="name"
                    style={{
                      width: '100%',
                      minHeight: '52px',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      border: `2px solid ${touched.fullName && errors.fullName ? '#f43f5e' : '#e2e8f0'}`,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => {
                      if (!(touched.fullName && errors.fullName)) {
                        e.currentTarget.style.borderColor = '#0d9488';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)';
                      }
                    }}
                    onBlurCapture={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      if (!(touched.fullName && errors.fullName)) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  />
                </div>
                {touched.fullName && errors.fullName && (
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e11d48', marginTop: '0.3rem' }}>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label
                  htmlFor="caregiver-email"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.4rem'
                  }}
                >
                  <Mail size={16} color="#0d9488" />
                  <span>Email Address</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="caregiver-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="ravi@example.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      minHeight: '52px',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      border: `2px solid ${touched.email && errors.email ? '#f43f5e' : '#e2e8f0'}`,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => {
                      if (!(touched.email && errors.email)) {
                        e.currentTarget.style.borderColor = '#0d9488';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)';
                      }
                    }}
                    onBlurCapture={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      if (!(touched.email && errors.email)) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  />
                </div>
                {touched.email && errors.email && (
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e11d48', marginTop: '0.3rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Mobile Number (Optional) */}
              <div>
                <label
                  htmlFor="caregiver-phone"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.4rem'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={16} color="#0d9488" />
                    <span>Mobile / Phone Number</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Optional</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="caregiver-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98640 12345"
                    autoComplete="tel"
                    style={{
                      width: '100%',
                      minHeight: '52px',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      border: '2px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Field 4: Password */}
              <div>
                <label
                  htmlFor="caregiver-password"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.4rem'
                  }}
                >
                  <Lock size={16} color="#0d9488" />
                  <span>Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="caregiver-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      minHeight: '52px',
                      padding: '0.85rem 3.2rem 0.85rem 1rem',
                      borderRadius: '16px',
                      border: `2px solid ${touched.password && errors.password ? '#f43f5e' : '#e2e8f0'}`,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => {
                      if (!(touched.password && errors.password)) {
                        e.currentTarget.style.borderColor = '#0d9488';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)';
                      }
                    }}
                    onBlurCapture={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      if (!(touched.password && errors.password)) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.6rem',
                      color: '#64748b',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      minWidth: '44px',
                      minHeight: '44px'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e11d48', marginTop: '0.3rem' }}>
                    {errors.password}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Password must contain at least 6 characters.
                  </p>
                )}
              </div>

              {/* Field 5: Confirm Password */}
              <div>
                <label
                  htmlFor="caregiver-confirm-password"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.4rem'
                  }}
                >
                  <Lock size={16} color="#0d9488" />
                  <span>Confirm Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="caregiver-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      minHeight: '52px',
                      padding: '0.85rem 3.2rem 0.85rem 1rem',
                      borderRadius: '16px',
                      border: `2px solid ${touched.confirmPassword && errors.confirmPassword ? '#f43f5e' : '#e2e8f0'}`,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1rem',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => {
                      if (!(touched.confirmPassword && errors.confirmPassword)) {
                        e.currentTarget.style.borderColor = '#0d9488';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)';
                      }
                    }}
                    onBlurCapture={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      if (!(touched.confirmPassword && errors.confirmPassword)) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.6rem',
                      color: '#64748b',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      minWidth: '44px',
                      minHeight: '44px'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e11d48', marginTop: '0.3rem' }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 12px 25px rgba(13, 148, 136, 0.3)',
                  marginTop: '0.5rem',
                  opacity: loading ? 0.75 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create Caregiver Account</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Sign In */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>
              Already registered?{' '}
            </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0d9488',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0.25rem 0.5rem'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
