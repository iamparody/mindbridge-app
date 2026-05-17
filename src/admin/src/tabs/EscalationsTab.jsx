import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import MessageModal from '../components/MessageModal';

function elapsed(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

export default function EscalationsTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [msgTarget, setMsgTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/escalations');
      setItems(data.escalations ?? []);
    } catch { setError('Failed to load escalations.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Peer Escalations</h1>
        <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        Peer requests not accepted within 90 seconds.
      </p>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👥</div>
              No escalated peer requests
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Channel</th>
                  <th>Requested</th>
                  <th>Escalated</th>
                  <th>Waiting</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <td><span className="alias">{e.alias}</span></td>
                    <td>
                      <span className={`badge badge--${e.channel_preference}`}>
                        {e.channel_preference}
                      </span>
                    </td>
                    <td><span className="elapsed">{new Date(e.created_at).toLocaleTimeString()}</span></td>
                    <td><span className="elapsed">{new Date(e.escalated_at).toLocaleTimeString()}</span></td>
                    <td><span className="elapsed" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{elapsed(e.escalated_at)}</span></td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => setMsgTarget(e.alias)}>
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {msgTarget && <MessageModal alias={msgTarget} onClose={() => setMsgTarget(null)} />}
    </div>
  );
}
