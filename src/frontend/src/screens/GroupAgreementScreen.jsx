import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const RULES = [
  'Treat all members with respect',
  'No harmful, abusive, or triggering content',
  'No sharing personal identifying information',
  'No unsolicited advice or medical recommendations',
  'Violations result in removal from the group',
];

export default function GroupAgreementScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    if (!agreed) { setError('You must agree to the community rules to join.'); return; }
    setError('');
    setLoading(true);
    try {
      await client.post(`/api/groups/${id}/join`, { agreed: true });
      navigate(`/groups/${id}/chat`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not join group. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Community Agreement</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Community Rules</h3>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RULES.map((rule, i) => (
              <li key={i} style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5 }}>{rule}</li>
            ))}
          </ul>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: '0.9rem' }}>I agree to the community rules and understand that violations may result in removal</span>
        </label>

        {error && <div className="error-msg">{error}</div>}

        <button className="btn btn--primary" onClick={handleJoin} disabled={loading || !agreed}>
          {loading ? 'Joining…' : 'I Agree and Join'}
        </button>

        <button className="btn btn--muted" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}
