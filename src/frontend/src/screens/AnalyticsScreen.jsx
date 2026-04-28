import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const MOOD_META = [
  { value: 1, label: 'Very Low', color: 'var(--mood-very-low)', emoji: '😔' },
  { value: 2, label: 'Low',      color: 'var(--mood-low)',      emoji: '😕' },
  { value: 3, label: 'Neutral',  color: 'var(--mood-neutral)',  emoji: '😐' },
  { value: 4, label: 'Good',     color: 'var(--mood-good)',     emoji: '🙂' },
  { value: 5, label: 'Great',    color: 'var(--mood-great)',    emoji: '😊' },
];

function getMoodMeta(value) {
  return MOOD_META.find((m) => m.value === value) || MOOD_META[2];
}

function BarChart({ data, days }) {
  if (!data?.length) return null;
  const max = 5;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((d, i) => {
        const meta = getMoodMeta(Math.round(d.avg_mood));
        const height = ((d.avg_mood || 0) / max) * 80;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', height, background: meta.color, borderRadius: '3px 3px 0 0', minHeight: 2 }} />
            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1 }}>
              {new Date(d.date).toLocaleDateString('en-KE', { weekday: 'narrow' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data: res } = await client.get('/api/moods/analytics');
        setData(res);
      } catch {
        setError('Failed to load analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  const tooFewEntries = !data || (data.total_checkins ?? 0) < 3;

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">My Insights</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="error-msg">{error}</div>}

        {tooFewEntries ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <h3 style={{ marginBottom: 8 }}>Keep checking in</h3>
            <p>Your insights will appear here after a few days of check-ins.</p>
            <button className="btn btn--primary" style={{ marginTop: 24 }} onClick={() => navigate('/mood')}>Check In Now</button>
          </div>
        ) : (
          <>
            {/* Streak stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Current Streak', value: `${data.streak_count ?? 0}🔥`, sub: 'days' },
                { label: 'Longest Streak', value: `${data.longest_streak ?? 0}`, sub: 'days ever' },
                { label: 'Total Check-ins', value: `${data.total_checkins ?? 0}`, sub: 'entries' },
              ].map((s) => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Most common mood */}
            {data.most_common_mood && (() => {
              const meta = getMoodMeta(data.most_common_mood);
              return (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>{meta.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Most common mood (30 days)</div>
                    <div style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</div>
                  </div>
                </div>
              );
            })()}

            {/* 7-day chart */}
            {data.seven_day?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Last 7 days</h3>
                <BarChart data={data.seven_day} days={7} />
              </div>
            )}

            {/* 30-day chart */}
            {data.thirty_day?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Last 30 days</h3>
                <BarChart data={data.thirty_day} days={30} />
              </div>
            )}

            {/* Top tags */}
            {data.top_tags?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Most frequent feelings (30 days)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.top_tags.map((t) => (
                    <span key={t.tag} className="pill" style={{ fontSize: '0.85rem' }}>
                      {t.tag} <strong style={{ color: 'var(--color-primary)' }}>{t.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
