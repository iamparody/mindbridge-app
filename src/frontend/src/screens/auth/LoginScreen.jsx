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
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/login', { email, password });
      login(data.token, { id: data.userId, alias: data.alias, role: data.role });
      const { data: status } = await client.get('/api/onboarding/status');
      if (!status.consent) navigate('/onboarding/consent', { replace: true });
      else if (!status.persona) navigate('/onboarding/persona', { replace: true });
      else if (!status.first_mood) navigate('/onboarding/first-mood', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error;
      if (err.response?.status === 429) {
        setError("You've reached your limit for now. Come back a little later.");
      } else {
        setError(msg === 'Invalid credentials' || err.response?.status === 401
          ? 'Incorrect email or password.'
          : 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <div className="wordmark" style={{ fontSize: 28, marginBottom: 'var(--space-sm)' }}>MindBridge</div>
        <h1 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-xs)' }}>Welcome back</h1>
        <p style={{ fontSize: 14 }}>Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn--primary" disabled={loading || !email || !password}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <Link to="/recover" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 14 }}>
          Forgot your password?
        </Link>
        <p style={{ fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
