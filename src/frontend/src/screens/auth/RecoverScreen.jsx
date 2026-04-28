import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await client.post('/api/auth/recover', { email });
    } catch {
      // Swallow all errors — never reveal whether email exists
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
        <h1>Recover account</h1>
        <p style={{ marginTop: 4 }}>We'll send a reset link to your email</p>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h2 style={{ marginBottom: 8 }}>Check your inbox</h2>
          <p>If that email is registered, you'll receive a password reset link shortly.</p>
          <Link to="/login" style={{ display: 'block', marginTop: 24, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>Back to sign in</Link>
          </div>
        </>
      )}
    </div>
  );
}
