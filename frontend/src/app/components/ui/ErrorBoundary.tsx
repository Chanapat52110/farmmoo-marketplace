import React from 'react';
import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary: Catches React component errors and displays a user-friendly fallback UI.
 * Prevents white screen of death and provides recovery options.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md text-center border-2 border-stone-100 shadow-md">
              <div className="flex justify-center mb-4">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h1 className="text-stone-900 font-bold mb-2" style={{ fontSize: 18 }}>
                เกิดข้อผิดพลาด
              </h1>
              <p className="text-stone-600 mb-6" style={{ fontSize: 14 }}>
                ขออภัยค่ะ เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่
              </p>
              <button
                onClick={this.handleReset}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 active:scale-95 transition-all"
                style={{ fontSize: 14 }}
              >
                โหลดใหม่
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
