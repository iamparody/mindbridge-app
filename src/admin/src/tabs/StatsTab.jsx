import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const STAT_META = [
  { key: 'daily_active_users',     label: 'Daily Active Users',   icon: '👤' },
  { key: 'checkins_today',         label: 'Check-ins Today',      icon: '📝' },
  { key: 'peer_sessions_today',    label: 'Peer Sessions',        icon: '👥' },
  { key: 'ai_sessions_today',      label: 'AI Sessions',          icon: '🤖' },
  { key: 'credits_purchased_today',label: 'Credits Purchased',    icon: '💳' },
];

export default function StatsTab() {
  const [stats,    setStats]    = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    try {
      const [sr, fr] = await Promise.all([
        client.get('/api/admin/stats'),
        client.get('/api/admin/feedback'),
      ]);
      setStats(sr.data);
      setFeedback(fr.data);
    } catch { setError('Failed to load stats.'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error)   return <p className="error-text">{error}</p>;

  const dateLabel = stats?.date
    ? new Date(stats.date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Stats</h1>
          {dateLabel && <p className="page-subtitle">{dateLabel}</p>}
        </div>
        <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>

      {/* Daily stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        {STAT_META.map(({ key, label, icon }) => (
          <div key={key} className="stat-card">
            <div className="stat-card__label">{icon} {label}</div>
            <div className="stat-card__value" style={{ fontSize: 28 }}>
              {stats?.[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Session ratings */}
      {feedback && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>
            Session Ratings
          </h2>

          {feedback.averages?.length > 0 ? (
            <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
              {feedback.averages.map((row) => (
                <div key={row.type} className="card" style={{ padding: '18px 22px', minWidth: 160 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    {row.type}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    ⭐ {parseFloat(row.avg_rating).toFixed(1)}
                  </div>
                  <RatingBar value={parseFloat(row.avg_rating)} />
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                    {row.count} response{row.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>No ratings yet.</p>
          )}

          {feedback.recent_comments?.length > 0 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                Recent Comments
              </h2>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.recent_comments.map((c, i) => (
                        <tr key={i}>
                          <td>{c.type}</td>
                          <td>{'⭐'.repeat(c.rating ?? 0)}</td>
                          <td style={{ maxWidth: 340 }}>{c.comment}</td>
                          <td><span className="elapsed">{new Date(c.created_at).toLocaleDateString()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function RatingBar({ value }) {
  const pct = Math.min(100, (value / 5) * 100);
  const color = value >= 4 ? 'var(--color-status-resolved)' : value >= 3 ? 'var(--color-status-pending)' : 'var(--color-status-open)';
  return (
    <div style={{ height: 5, background: 'var(--color-main-bg)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  );
}
