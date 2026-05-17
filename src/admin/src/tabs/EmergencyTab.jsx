import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import MessageModal from '../components/MessageModal';

function elapsed(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function EmergencyTab({ onCountChange }) {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [msgTarget, setMsgTarget]   = useState(null);
  const [acting, setActing]         = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/emergency-queue');
      const queue = data.queue ?? [];
      setItems(queue);
      onCountChange?.(queue.length);
    } catch { setError('Failed to load emergency queue.'); }
    finally { setLoading(false); }
  }, [onCountChange]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  async function act(id, action) {
    setActing((a) => ({ ...a, [id]: action }));
    try {
      await client.patch(`/api/admin/emergency/${id}/${action}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}.`);
    } finally {
      setActing((a) => { const n = { ...a }; delete n[id]; return n; });
    }
  }

  const statusBadge = (s) => {
    const map = { open: 'badge--open', acknowledged: 'badge--ack', resolved: 'badge--resolved' };
    return <span className={`badge ${map[s] ?? ''}`}>{s}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Emergency Queue</h1>
        <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✅</div>
              No active emergencies
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <td><span className="alias">{e.alias}</span></td>
                    <td>{e.trigger_type}</td>
                    <td>{statusBadge(e.status)}</td>
                    <td><span className="elapsed">{elapsed(e.triggered_at)}</span></td>
                    <td>
                      <div className="btn-group">
                        {e.status === 'open' && (
                          <button
                            className="btn btn--warning btn--sm"
                            onClick={() => act(e.id, 'acknowledge')}
                            disabled={!!acting[e.id]}
                          >
                            {acting[e.id] === 'acknowledge' ? '…' : 'Acknowledge'}
                          </button>
                        )}
                        {e.status !== 'resolved' && (
                          <button
                            className="btn btn--success btn--sm"
                            onClick={() => act(e.id, 'resolve')}
                            disabled={!!acting[e.id]}
                          >
                            {acting[e.id] === 'resolve' ? '…' : 'Resolve'}
                          </button>
                        )}
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setMsgTarget(e.alias)}
                        >
                          Message
                        </button>
                      </div>
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
