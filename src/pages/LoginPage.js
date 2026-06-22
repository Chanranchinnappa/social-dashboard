import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { BarChart2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <BarChart2 size={40} />
        </div>
        <h1 className="login-title">Social Intelligence Hub</h1>
        <p className="login-subtitle">Sign in with your email to get started</p>

        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {sent ? (
          <div className="login-success">
            <Alert variant="success">
              Magic link sent! Check your email and click the link to sign in.
            </Alert>
            <Button
              variant="ghost"
              onClick={() => { setSent(false); setEmail(''); }}
              style={{ marginTop: 'var(--space-3)' }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
            >
              Send Magic Link
            </Button>
          </form>
        )}

        <p className="login-footer">
          No password needed. We'll email you a secure sign-in link.
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: var(--color-bg-primary);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          text-align: center;
        }
        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-xl);
          margin-bottom: var(--space-4);
        }
        .login-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 var(--space-2);
        }
        .login-subtitle {
          color: var(--color-text-secondary);
          margin: 0 0 var(--space-6);
        }
        .login-form {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .form-label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .form-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: var(--font-size-base);
          outline: none;
          transition: border-color var(--transition-fast);
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: var(--space-6);
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }
        .login-success {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
