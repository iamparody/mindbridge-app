import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function RegisterScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alias, setAlias] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirm) { setError('All fields are required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/register', { email, password });
      login(data.token, { id: data.userId, alias: data.alias, role: data.role });
      setAlias(data.alias);
      setTimeout(() => navigate('/onboarding/consent', { replace: true }), 2200);
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg === 'Email already registered'
        ? 'An account with that email already exists.'
        : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (alias) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h1 style={{ marginBottom: 8 }}>Welcome to MindBridge</h1>
        <p style={{ marginBottom: 24 }}>Your anonymous identity has been assigned</p>
        <div style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius)', padding: '16px 32px', fontSize: '1.25rem', fontWeight: 700, letterSpacing: 1 }}>
          {alias}
        </div>
        <p style={{ marginTop: 16, fontSize: '0.875rem' }}>This is the only name anyone will ever see. Keep it private.</p>
      </div>
    );
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
        <h1>Create account</h1>
        <p style={{ marginTop: 4 }}>Anonymous. Private. Yours.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
          <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Used only for account recovery — never shown to anyone.</p>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem' }}>Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></p>
      </div>
    </div>
  );
}
