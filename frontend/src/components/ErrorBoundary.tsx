import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MANAS UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#ffffff',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#1e293b',
              borderRadius: '28px',
              padding: '2.5rem',
              border: '3px solid #3b82f6',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '1.25rem',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={48} />
            </div>

            <div>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                }}
              >
                Something Went Wrong
              </h1>
              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                }}
              >
                Don't worry! Your progress is safe. Tap the button below to return cleanly to the main home screen.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="touch-target"
              aria-label="Return to Safety Home Page"
              style={{
                minHeight: '48px',
                minWidth: '220px',
                padding: '0.85rem 1.75rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Home size={22} /> Return Safely Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
