import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

export default function StatsTab() {
  const [stats, setStats]         = useState(null);
  const [feedback, setFeedback]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    try {
      const [statsRes, feedbackRes] = await Promise.all([
        client.get('/api/admin/stats'),
        client.get('/api/admin/feedback'),
      ]);
      setStats(statsRes.data);
      setFeedback(feedbackRes.data);
    } catch { setError('Failed to load stats.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error)   return <p className="error-text">{error}</p>;

  const statItems = stats ? [
    { label: 'Daily Active Users',   value: stats.daily_active_users,     icon: '👤' },
    { label: 'Check-ins Today',      value: stats.checkins_today,          icon: '📝' },
    { label: 'Peer Sessions Today',  value: stats.peer_sessions_today,     icon: '👥' },
    { label: 'AI Sessions Today',    value: stats.ai_sessions_today,       icon: '🤖' },
    { label: 'Credits Purchased',    value: stats.credits_purchased_today, icon: '💳' },
  ] : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>System Stats</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {stats?.date ? new Date(stats.date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </span>
          <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>

      <div className="stats-grid">
        {statItems.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__label">{s.icon} {s.label}</div>
            <div className="stat-card__value">{s.value ?? 0}</div>
          </div>
        ))}
      </div>

      {feedback && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Session Ratings</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {feedback.averages?.map((row) => (
              <div key={row.type} className="stat-card" style={{ minWidth: 140 }}>
                <div className="stat-card__label">{row.type}</div>
                <div className="stat-card__value" style={{ fontSize: 22 }}>
                  ⭐ {parseFloat(row.avg_rating).toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{row.count} responses</div>
              </div>
            ))}
            {(!feedback.averages || feedback.averages.length === 0) && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No ratings yet.</p>
            )}
          </div>

          {feedback.recent_comments?.length > 0 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Comments</h2>
              <div className="card">
                <div className="card-body table-wrap">
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
                          <td style={{ maxWidth: 320 }}>{c.comment}</td>
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
