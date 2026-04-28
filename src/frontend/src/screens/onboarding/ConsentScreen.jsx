import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const CONSENT_VERSION = '1.0';

export default function ConsentScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAgree() {
    if (!agreed) { setError('You must read and agree to the terms to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      await client.post('/api/onboarding/consent', { version: CONSENT_VERSION });
      navigate('/onboarding/persona', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
        <h1 style={{ fontSize: '1.5rem' }}>Data & Privacy Agreement</h1>
        {user?.alias && <p style={{ marginTop: 4 }}>Welcome, <strong>{user.alias}</strong></p>}
      </div>

      <div className="card" style={{ marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>What we collect</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Mood entries — dates, levels, and optional tags</li>
          <li>Journal entries — private text you write</li>
          <li>AI conversation content — exchanges with your companion</li>
          <li>Session metadata — timing and type of peer sessions</li>
        </ul>

        <div className="divider" />

        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>How it's used</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Solely to improve your own experience on MindBridge</li>
          <li>No commercial use, no advertising, no third-party sharing</li>
          <li>Mood data powers your personal analytics and check-in reminders</li>
        </ul>

        <div className="divider" />

        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>Your rights</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>You can delete all your data at any time from Profile</li>
          <li>Deletion is permanent and begins within 24 hours of your request</li>
        </ul>

        <div className="divider" />

        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>Safety exception</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          AI conversations that trigger a safety flag are anonymised (your user ID is removed) but retained for safety pattern analysis only. This is disclosed here and cannot be opted out of — it is how we keep the community safe.
        </p>

        <div className="divider" />

        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>Community standards</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>No harassment, hate speech, or abuse in group spaces</li>
          <li>No sharing of personal identifying information</li>
          <li>Peer support is mutual — be the support you'd want to receive</li>
        </ul>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2, accentColor: 'var(--color-primary)' }}
        />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
          I have read and agree to the data and privacy terms above (v{CONSENT_VERSION})
        </span>
      </label>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <button className="btn btn--primary" onClick={handleAgree} disabled={loading || !agreed}>
        {loading ? 'Saving…' : 'I Agree — Continue'}
      </button>
    </div>
  );
}
