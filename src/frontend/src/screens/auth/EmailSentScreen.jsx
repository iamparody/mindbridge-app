import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import client from '../../api/client';

const COOLDOWN_SECONDS = 60;

export default function EmailSentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || resendStatus === 'sending') return;
    setResendStatus('sending');
    try {
      await client.post('/api/auth/resend-verification');
      setResendStatus('sent');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      if (err.response?.data?.code === 'ALREADY_VERIFIED') {
        navigate('/dashboard', { replace: true });
        return;
      }
      setResendStatus('error');
    }
  }

  return (
    <div
      className="screen screen--no-nav"
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', textAlign: 'center',
        padding: 'var(--space-xl) var(--space-lg)', minHeight: '100dvh',
        background: 'var(--color-bg-deep)',
      }}
    >
      {/* Envelope */}
      <svg
        width="64" height="64" viewBox="0 0 256 256"
        style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-accent)' }}
        aria-hidden="true"
      >
        <rect width="200" height="152" x="28" y="52" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
        <path d="M28 76l100 72 100-72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
      </svg>

      <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: 'var(--space-sm)' }}>Check your email</h1>

      <p style={{
        fontSize: 'var(--text-body)', color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-2xl)', maxWidth: 300, lineHeight: 1.6,
      }}>
        We sent a link to{' '}
        {email
          ? <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
          : 'your email address'
        }.
        {' '}Click it to activate your account.
      </p>

      <button
        className="btn btn--secondary"
        style={{ width: 'auto', padding: '0 var(--space-xl)', marginBottom: 'var(--space-sm)' }}
        onClick={handleResend}
        disabled={cooldown > 0 || resendStatus === 'sending'}
      >
        {resendStatus === 'sending' ? 'Sending…'
          : resendStatus === 'sent' ? 'Email sent!'
          : cooldown > 0 ? `Resend in ${cooldown}s`
          : 'Resend email'}
      </button>

      {resendStatus === 'error' && (
        <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
          Something went wrong. Please try again.
        </p>
      )}

      <Link
        to="/emergency-public"
        style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', marginTop: 'var(--space-lg)' }}
      >
        Need help right now?
      </Link>
    </div>
  );
}
