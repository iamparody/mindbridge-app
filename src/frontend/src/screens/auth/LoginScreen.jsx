import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/login', { email, password });
      login(data.token, { id: data.userId, alias: data.alias, role: data.role });
      // Check onboarding status to determine redirect
      const { data: status } = await client.get('/api/onboarding/status');
      if (!status.consent) navigate('/onboarding/consent', { replace: true });
      else if (!status.persona) navigate('/onboarding/persona', { replace: true });
      else if (!status.first_mood) navigate('/onboarding/first-mood', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg === 'Invalid credentials' || err.response?.status === 401
        ? 'Incorrect email or password.'
        : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
        <h1>Welcome back</h1>
        <p style={{ marginTop: 4 }}>Sign in to MindBridge</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link to="/recover" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot your password?</Link>
        <p style={{ fontSize: '0.9rem' }}>Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link></p>
      </div>
    </div>
  );
}
