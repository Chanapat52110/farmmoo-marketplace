import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches any unhandled render/lifecycle error below this component.
 * Without this, a single component crash turns the whole SPA into a blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <RouterProvider router={router} />
 *   </ErrorBoundary>
 *
 * Pass a custom `fallback` prop to override the default error screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, forward to your error tracking service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const isDev = import.meta.env.DEV;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF8F0',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Sarabun, sans-serif',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>😵</div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#1C1917',
            marginBottom: 8,
          }}
        >
          เกิดข้อผิดพลาดที่ไม่คาดคิด
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#78716C',
            marginBottom: 24,
            maxWidth: 320,
            lineHeight: 1.6,
          }}
        >
          ขออภัยในความไม่สะดวก กรุณาลองโหลดหน้าใหม่อีกครั้ง
        </p>

        {/* Show stack trace in development only — never expose internals to production users */}
        {isDev && this.state.error && (
          <pre
            style={{
              background: '#1C1917',
              color: '#FCA5A5',
              padding: '16px',
              borderRadius: 12,
              fontSize: 11,
              textAlign: 'left',
              overflowX: 'auto',
              maxWidth: '90vw',
              marginBottom: 24,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Try recovering without a full page reload first */}
          <button
            onClick={this.handleReset}
            style={{
              background: 'white',
              color: '#F97316',
              border: '2px solid #F97316',
              borderRadius: 16,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Sarabun, sans-serif',
            }}
          >
            ลองใหม่
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#F97316',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Sarabun, sans-serif',
            }}
          >
            โหลดหน้าใหม่
          </button>
        </div>
      </div>
    );
  }
}
