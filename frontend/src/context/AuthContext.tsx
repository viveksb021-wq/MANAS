import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, setAuthTokens, clearAuthTokens, getAccessToken } from '../utils/api';

export type UserRole = 'patient' | 'guardian' | null;
import { LanguageCode, DEFAULT_LANGUAGE, normalizeLanguageCode } from '../config/languages';
import { stopSpeech } from '../utils/speech';
export type { LanguageCode };
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface UserSession {
  authenticated: boolean;
  id: number;
  name: string;
  role: UserRole;
  patientId?: number;
  guardianId?: number;
  authMethod?: string;
  authenticatedAt?: string;
  sessionId?: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  language: LanguageCode;
  isHighContrast: boolean;
  textSizeScale: number;
  isReduceMotion: boolean;
  isVoiceEnabled: boolean;
  voiceSpeed: VoiceSpeed;
  isSoundEnabled: boolean;
  isTouchFeedbackEnabled: boolean;
  login: (role: 'patient' | 'guardian', patientId?: number, authMethod?: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerUser: (details: {
    email: string;
    password: string;
    full_name: string;
    role: 'patient' | 'guardian';
    phone_number?: string;
    age?: number;
    guardian_email?: string;
  }) => Promise<void>;
  loginWithFaceToken: (token: string, patientId: number, fullName: string) => void;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleHighContrast: () => void;
  setTextSizeScale: (scale: number) => void;
  toggleReduceMotion: () => void;
  toggleVoiceEnabled: () => void;
  setVoiceSpeed: (speed: VoiceSpeed) => void;
  toggleSoundEnabled: () => void;
  toggleTouchFeedbackEnabled: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const savedUser = localStorage.getItem('manas_user_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const savedUser = localStorage.getItem('manas_user_session');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const pidKey = parsedUser?.patientId || parsedUser?.id || 'default';
      const savedLang = localStorage.getItem(`manas_language_${pidKey}`) || localStorage.getItem('manas_language');
      return normalizeLanguageCode(savedLang || DEFAULT_LANGUAGE);
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  const setLanguage = (lang: LanguageCode) => {
    // 1. Immediately cancel any speech in progress
    stopSpeech();

    const normalized = normalizeLanguageCode(lang);
    setLanguageState(normalized);
    try {
      const pidKey = user?.patientId || user?.id || 'default';
      localStorage.setItem(`manas_language_${pidKey}`, normalized);
      localStorage.setItem('manas_language', normalized);
      // Also update session if active
      if (user?.patientId) {
        fetchApi('/patient/profile', {
          method: 'PUT',
          body: { preferred_language: normalized }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Could not persist language preference:', e);
    }
  };

  // Sync language when user switches or logs in
  useEffect(() => {
    if (user) {
      const pidKey = user.patientId || user.id || 'default';
      const userLang = localStorage.getItem(`manas_language_${pidKey}`);
      if (userLang) {
        setLanguageState(normalizeLanguageCode(userLang));
      }
    }
  }, [user?.patientId, user?.id]);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [textSizeScale, setTextSizeScaleState] = useState<number>(() => {
    try {
      const savedScale = localStorage.getItem('manas_text_size_scale');
      return savedScale ? parseFloat(savedScale) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [isReduceMotion, setIsReduceMotion] = useState<boolean>(() => {
    try { return localStorage.getItem('manas_reduce_motion') === 'true'; } catch { return false; }
  });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('manas_voice_enabled') !== 'false'; } catch { return true; }
  });
  const [voiceSpeed, setVoiceSpeedState] = useState<VoiceSpeed>(() => {
    try { return (localStorage.getItem('manas_voice_speed') as VoiceSpeed) || 'normal'; } catch { return 'normal'; }
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('manas_sound_enabled') !== 'false'; } catch { return true; }
  });
  const [isTouchFeedbackEnabled, setIsTouchFeedbackEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('manas_touch_feedback') !== 'false'; } catch { return true; }
  });

  const setTextSizeScale = (scale: number) => {
    setTextSizeScaleState(scale);
    try { localStorage.setItem('manas_text_size_scale', scale.toString()); } catch (e) {}
  };

  const toggleReduceMotion = () => {
    setIsReduceMotion(prev => {
      const next = !prev;
      try { localStorage.setItem('manas_reduce_motion', String(next)); } catch (e) {}
      return next;
    });
  };

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('manas_voice_enabled', String(next)); } catch (e) {}
      return next;
    });
  };

  const setVoiceSpeed = (speed: VoiceSpeed) => {
    setVoiceSpeedState(speed);
    try { localStorage.setItem('manas_voice_speed', speed); } catch (e) {}
  };

  const toggleSoundEnabled = () => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('manas_sound_enabled', String(next)); } catch (e) {}
      return next;
    });
  };

  const toggleTouchFeedbackEnabled = () => {
    setIsTouchFeedbackEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('manas_touch_feedback', String(next)); } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSizeScale * 100}%`;
  }, [textSizeScale]);

  useEffect(() => {
    if (isReduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [isReduceMotion]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('manas_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('manas_user_session');
    }
  }, [user]);

  const loginWithCredentials = async (email: string, password: string) => {
    const data = await fetchApi<any>('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    setAuthTokens(data.access_token, data.refresh_token);

    const timestamp = new Date().toISOString();
    const sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUserSession: UserSession = {
      authenticated: true,
      id: data.user_id,
      name: data.full_name,
      role: data.role as UserRole,
      patientId: data.patient_id || undefined,
      guardianId: data.guardian_id || undefined,
      authMethod: 'credentials',
      authenticatedAt: timestamp,
      sessionId: sessId
    };

    setUser(newUserSession);
  };

  const registerUser = async (details: {
    email: string;
    password: string;
    full_name: string;
    role: 'patient' | 'guardian';
    phone_number?: string;
    age?: number;
    guardian_email?: string;
  }) => {
    const data = await fetchApi<any>('/auth/register', {
      method: 'POST',
      body: details
    });

    setAuthTokens(data.access_token, data.refresh_token);

    const timestamp = new Date().toISOString();
    const sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUserSession: UserSession = {
      authenticated: true,
      id: data.user_id,
      name: data.full_name,
      role: data.role as UserRole,
      patientId: data.patient_id || undefined,
      guardianId: data.guardian_id || undefined,
      authMethod: 'registration',
      authenticatedAt: timestamp,
      sessionId: sessId
    };

    setUser(newUserSession);
  };

  const loginWithFaceToken = (token: string, patientId: number, fullName: string) => {
    setAuthTokens(token, null);
    const timestamp = new Date().toISOString();
    const sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setUser({
      authenticated: true,
      id: patientId,
      name: fullName,
      role: 'patient',
      patientId: patientId,
      authMethod: 'face',
      authenticatedAt: timestamp,
      sessionId: sessId
    });
  };

  const login = (role: 'patient' | 'guardian', patientId: number = 1, authMethod: string = 'pin') => {
    const timestamp = new Date().toISOString();
    const sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const demoToken = `demo_token_user_${role === 'patient' ? 2 : 1}`;
    setAuthTokens(demoToken, null);

    if (role === 'patient') {
      const patientName = patientId === 2 ? 'Biren Das' : 'Prasad';
      setUser({
        authenticated: true,
        id: patientId,
        name: patientName,
        role: 'patient',
        patientId: patientId,
        authMethod,
        authenticatedAt: timestamp,
        sessionId: sessId
      });
    } else {
      setUser({
        authenticated: true,
        id: 1,
        name: 'Ravi',
        role: 'guardian',
        guardianId: 1,
        patientId: patientId,
        authMethod,
        authenticatedAt: timestamp,
        sessionId: sessId
      });
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthTokens();
    try {
      sessionStorage.removeItem('manas_active_auth_state');
      localStorage.removeItem('manas_user_session');
      sessionStorage.removeItem('manas_conversation_context');
      fetchApi('/voice/reset-context', { method: 'POST' }).catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user && user.authenticated ? user.role : null,
        isAuthenticated: !!(user && user.authenticated),
        language,
        isHighContrast,
        textSizeScale,
        isReduceMotion,
        isVoiceEnabled,
        voiceSpeed,
        isSoundEnabled,
        isTouchFeedbackEnabled,
        login,
        loginWithCredentials,
        registerUser,
        loginWithFaceToken,
        logout,
        setLanguage,
        toggleHighContrast,
        setTextSizeScale,
        toggleReduceMotion,
        toggleVoiceEnabled,
        setVoiceSpeed,
        toggleSoundEnabled,
        toggleTouchFeedbackEnabled
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
