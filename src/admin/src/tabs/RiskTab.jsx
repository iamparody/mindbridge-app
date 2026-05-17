import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import MessageModal from '../components/MessageModal';

export default function RiskTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [msgTarget, setMsgTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/risk-flags');
      setItems(data.flagged_users ?? []);
    } catch { setError('Failed to load risk flags.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Risk Flags</h1>
        <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        Users with risk level <strong>high</strong> or <strong>critical</strong>. Updated nightly by the risk score job.
      </p>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty"><div className="empty-icon">🟢</div>No high-risk users currently flagged</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Risk Level</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.alias}>
                    <td><span className="alias">{u.alias}</span></td>
                    <td>
                      <span className={`badge badge--${u.risk_level}`}>
                        {u.risk_level === 'critical' ? '🔴 critical' : '🟠 high'}
                      </span>
                    </td>
                    <td><span className="elapsed">{new Date(u.updated_at).toLocaleString()}</span></td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => setMsgTarget(u.alias)}>
                        Send Care Message
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
