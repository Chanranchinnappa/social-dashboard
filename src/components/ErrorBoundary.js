import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, onRetry, className = '' } = this.props;

    if (hasError) {
      if (React.isValidElement(fallback)) {
        return React.cloneElement(fallback, {
          onRetry: onRetry || this.handleRetry,
          error,
          errorInfo,
        });
      }

      return (
        <div className={['error-boundary', className].filter(Boolean).join(' ')}>
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertTriangle size={32} aria-hidden="true" />
            </div>
            <h3 className="error-boundary-title">Something went wrong</h3>
            <p className="error-boundary-message">
              {error ? error.message : 'An unexpected error occurred.'}
            </p>
            {errorInfo && (
              <details className="error-boundary-details">
                <summary className="error-boundary-summary">Error details</summary>
                <pre className="error-boundary-stack">{errorInfo.componentStack}</pre>
              </details>
            )}
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={onRetry || this.handleRetry}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}
