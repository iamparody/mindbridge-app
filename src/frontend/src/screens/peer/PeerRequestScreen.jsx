import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

const COST_INFO = {
  text: { rate: '1 credit per 15 min', label: 'Text Chat' },
  voice: { rate: '1 credit per 5 min', label: 'Voice Call' },
};

export default function PeerRequestScreen() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [openRequests, setOpenRequests] = useState([]);
  const [channel, setChannel] = useState('text');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [balRes, reqRes] = await Promise.all([
          client.get('/api/credits/balance'),
          client.get('/api/peer/requests/open'),
        ]);
        setBalance(balRes.data.balance ?? 0);
        setOpenRequests(reqRes.data.requests ?? reqRes.data ?? []);
      } catch {
        setError('Failed to load. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRequest() {
    if (balance < 1) { setError('You need at least 1 credit to request peer support.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await client.post('/api/peer/request', { channel });
      navigate(`/peer/waiting/${data.request_id}`, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      setError(status === 402
        ? 'Insufficient credits.'
        : err.response?.data?.error || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(requestId) {
    setError('');
    try {
      const { data } = await client.patch(`/api/peer/request/${requestId}/accept`);
      const channel = data.channel || 'text';
      const sessionId = data.session_id;
      navigate(`/peer/session/${sessionId}/${channel}`, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      setError(status === 409
        ? 'This request was already accepted by someone else.'
        : err.response?.data?.error || 'Could not accept request. Please try again.');
    }
  }

  if (loading) return (
    <div className="screen">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Peer Support</h2>
      </div>
      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 52, borderRadius: 'var(--radius-pill)' }} />
      </div>
    </div>
  );

  const balanceLow = balance !== null && balance < 2;

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Peer Support</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Credit balance */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Your credits</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: balanceLow ? 'var(--color-emergency)' : 'var(--color-text)' }}>{balance ?? '—'}</div>
          </div>
          {balanceLow && (
            <button onClick={() => navigate('/profile')} className="btn btn--ghost btn--sm" style={{ width: 'auto' }}>Top Up</button>
          )}
        </div>

        {/* Request help section */}
        <div>
          <h3 style={{ marginBottom: 12 }}>Need support?</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {Object.entries(COST_INFO).map(([val, info]) => (
              <button
                key={val}
                type="button"
                onClick={() => setChannel(val)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${channel === val ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: channel === val ? 'rgba(194,164,138,0.15)' : 'var(--color-surface-card)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{val === 'text' ? '💬' : '🎙️'} {info.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{info.rate}</div>
              </button>
            ))}
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

          <button
            className="btn btn--primary"
            onClick={handleRequest}
            disabled={submitting || balance < 1}
          >
            {submitting ? 'Requesting…' : 'Request Help'}
          </button>
          {balance < 1 && <p style={{ marginTop: 8, fontSize: '0.8rem', textAlign: 'center' }}>Not enough credits</p>}
        </div>

        {/* Open requests to accept */}
        {openRequests.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 12 }}>Someone needs support now</h3>
            {openRequests.map((req) => (
              <div key={req.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.channel_preference === 'voice' ? '🎙️ Voice' : '💬 Text'} session</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(req.created_at).toLocaleTimeString()}</div>
                </div>
                <button onClick={() => handleAccept(req.id)} className="btn btn--success btn--sm" style={{ width: 'auto' }}>
                  I'm here
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
