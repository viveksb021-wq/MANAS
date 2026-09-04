import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'patient' | 'guardian' | null;
export type LanguageCode = 'en' | 'as' | 'bn' | 'mn' | 'hi';

interface UserProfile {
  id: number;
  name: string;
  role: UserRole;
  patientId?: number;
  guardianId?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  language: LanguageCode;
  isHighContrast: boolean;
  login: (role: 'patient' | 'guardian') => void;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleHighContrast: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Elderly Patient Vivek for friendly hackathon demo start
  const [user, setUser] = useState<UserProfile | null>({
    id: 1,
    name: 'Vivek Sharma',
    role: 'patient',
    patientId: 1
  });
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const login = (role: 'patient' | 'guardian') => {
    if (role === 'patient') {
      setUser({ id: 1, name: 'Vivek Sharma', role: 'patient', patientId: 1 });
    } else {
      setUser({ id: 2, name: 'Ravi Sharma', role: 'guardian', guardianId: 1 });
    }
  };

  const logout = () => {
    setUser(null);
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
        role: user ? user.role : null,
        language,
        isHighContrast,
        login,
        logout,
        setLanguage,
        toggleHighContrast
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
