import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 mb-6">
                We're sorry, but something unexpected happened. Please try
                refreshing the page or return to the home page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    Error Details:
                  </p>
                  <p className="text-sm text-red-600 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-500 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-slate-600 mt-2 overflow-auto max-h-48 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={this.handleReset}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
