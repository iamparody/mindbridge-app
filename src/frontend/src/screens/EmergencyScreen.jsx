import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function EmergencyScreen() {
  const navigate = useNavigate();
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTalkNow() {
    setLoading(true);
    setError('');
    try {
      await client.post('/api/emergency/trigger');
      setTriggered(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send alert. Please call the crisis line directly.');
      setTriggered(true); // still show resources even on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', padding: '32px 24px', minHeight: '100dvh' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🆘</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>You are not alone</h1>
        <p>Whatever you're feeling right now — we're here.</p>
      </div>

      {/* Crisis line — always visible, always first */}
      <div style={{ background: '#FFF8E1', border: '2px solid #FFE082', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Befrienders Kenya</div>
        <a
          href="tel:0800723253"
          style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
        >
          0800 723 253
        </a>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Free · 24/7 · Confidential</div>
      </div>

      {triggered ? (
        <div>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="card" style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ color: '#2E7D32', fontWeight: 600 }}>Help is on the way</p>
            <p style={{ color: '#388E3C', fontSize: '0.9rem', marginTop: 4 }}>An admin has been alerted. While you wait, try a breathing exercise below.</p>
          </div>

          <button className="btn btn--primary" style={{ marginBottom: 10 }} onClick={() => navigate('/breathing')}>
            🌬️ Try Breathing Exercises
          </button>
          <button className="btn btn--muted" onClick={() => navigate('/dashboard')}>Back to home</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ textAlign: 'center', marginBottom: 8, fontSize: '0.95rem', color: 'var(--color-text)' }}>
            What would help right now?
          </p>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="btn btn--danger"
            onClick={handleTalkNow}
            disabled={loading}
            style={{ fontSize: '1rem' }}
          >
            {loading ? 'Alerting…' : '🆘 I need to talk to someone now'}
          </button>

          <button
            className="btn btn--primary"
            onClick={() => navigate('/breathing')}
          >
            🌬️ Breathing exercises first
          </button>

          <button className="btn btn--muted" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
