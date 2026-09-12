import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NavLocation {
  flow: 'landing' | 'patient_login' | 'guardian_login' | 'patient_app' | 'guardian_app';
  screen: string;
  params?: Record<string, any>;
}

interface NavigationContextType {
  currentLocation: NavLocation;
  navigate: (screen: string, params?: Record<string, any>, flow?: NavLocation['flow']) => void;
  goBack: () => void;
  canGoBack: boolean;
  activeExitGuard: (() => boolean) | null;
  registerExitGuard: (guard: (() => boolean) | null) => void;
  pendingBackAction: (() => void) | null;
  triggerPendingBack: () => void;
  cancelPendingBack: () => void;
  isExitModalOpen: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const DEFAULT_LOCATION: NavLocation = { flow: 'landing', screen: 'landing' };

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavLocation[]>([DEFAULT_LOCATION]);
  const [activeExitGuard, setActiveExitGuard] = useState<(() => boolean) | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [pendingBackAction, setPendingBackAction] = useState<(() => void) | null>(null);

  const currentLocation = history[history.length - 1] || DEFAULT_LOCATION;
  const canGoBack = history.length > 1;

  // Sync with browser URL hash & popstate
  useEffect(() => {
    const handlePopState = () => {
      if (activeExitGuard && activeExitGuard()) {
        // Intercept browser back if active exit guard (e.g. playing game) is active
        window.history.pushState(null, '', window.location.href);
        setIsExitModalOpen(true);
        setPendingBackAction(() => () => performBack());
        return;
      }
      performBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history, activeExitGuard]);

  const performBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    } else {
      // Fallback to portal root if stack is empty
      if (currentLocation.flow === 'patient_app') {
        setHistory([{ flow: 'patient_app', screen: 'home' }]);
      } else if (currentLocation.flow === 'guardian_app') {
        setHistory([{ flow: 'guardian_app', screen: 'overview' }]);
      } else {
        setHistory([DEFAULT_LOCATION]);
      }
    }
  };

  const navigate = (screen: string, params?: Record<string, any>, flow?: NavLocation['flow']) => {
    const targetFlow = flow || currentLocation.flow;
    const newLoc: NavLocation = { flow: targetFlow, screen, params };

    // Update browser URL hash quietly
    try {
      const hashStr = `#${targetFlow}/${screen}`;
      window.history.pushState({ screen, flow: targetFlow }, '', hashStr);
    } catch (e) {}

    setHistory(prev => {
      // Avoid duplicate consecutive entries
      const last = prev[prev.length - 1];
      if (last && last.flow === targetFlow && last.screen === screen) {
        return prev;
      }
      return [...prev, newLoc];
    });
  };

  const goBack = () => {
    if (activeExitGuard && activeExitGuard()) {
      setIsExitModalOpen(true);
      setPendingBackAction(() => () => performBack());
      return;
    }
    performBack();
  };

  const registerExitGuard = (guard: (() => boolean) | null) => {
    setActiveExitGuard(() => guard);
  };

  const triggerPendingBack = () => {
    setIsExitModalOpen(false);
    setActiveExitGuard(null);
    if (pendingBackAction) {
      pendingBackAction();
      setPendingBackAction(null);
    } else {
      performBack();
    }
  };

  const cancelPendingBack = () => {
    setIsExitModalOpen(false);
    setPendingBackAction(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentLocation,
        navigate,
        goBack,
        canGoBack,
        activeExitGuard,
        registerExitGuard,
        pendingBackAction,
        triggerPendingBack,
        cancelPendingBack,
        isExitModalOpen
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
