import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

// avg_score range: very_low=-2, low=-1, neutral=0, good=1, great=2
const SCORE_COLORS = [
  { min: -2,   max: -1.5, color: 'var(--mood-very-low)' },
  { min: -1.5, max: -0.5, color: 'var(--mood-low)' },
  { min: -0.5, max:  0.5, color: 'var(--mood-neutral)' },
  { min:  0.5, max:  1.5, color: 'var(--mood-good)' },
  { min:  1.5, max:  2,   color: 'var(--mood-great)' },
];

const MOOD_META = {
  very_low: { label: 'Very Low', color: 'var(--mood-very-low)', emoji: '😔' },
  low:      { label: 'Low',      color: 'var(--mood-low)',      emoji: '😕' },
  neutral:  { label: 'Neutral',  color: 'var(--mood-neutral)',  emoji: '😐' },
  good:     { label: 'Good',     color: 'var(--mood-good)',     emoji: '🙂' },
  great:    { label: 'Great',    color: 'var(--mood-great)',    emoji: '😊' },
};

function scoreColor(score) {
  if (score === null) return 'var(--color-border)';
  for (const band of SCORE_COLORS) {
    if (score >= band.min && score <= band.max) return band.color;
  }
  return score < 0 ? 'var(--mood-low)' : 'var(--mood-good)';
}

function BarChart({ data }) {
  if (!data?.length) return null;
  const maxAbs = 2;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
      {data.map((d, i) => {
        const color = scoreColor(d.avg_score);
        const height = d.avg_score !== null ? ((d.avg_score + 2) / 4) * 80 : 4;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', height: Math.max(4, height), background: color, borderRadius: '3px 3px 0 0' }} />
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
  const commonMoodMeta = data?.common_mood ? MOOD_META[data.common_mood] : null;

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Current Streak', value: `${data.current_streak ?? 0}🔥` },
                { label: 'Total Check-ins', value: `${data.total_checkins ?? 0}` },
              ].map((s) => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Most common mood */}
            {commonMoodMeta && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{commonMoodMeta.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Most common mood (30 days)</div>
                  <div style={{ color: commonMoodMeta.color, fontWeight: 600 }}>{commonMoodMeta.label}</div>
                </div>
              </div>
            )}

            {/* 7-day chart */}
            {data.week_trend?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Last 7 days</h3>
                <BarChart data={data.week_trend} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  <span>😔 Very Low</span><span>😊 Great</span>
                </div>
              </div>
            )}

            {/* Top tags */}
            {data.frequent_tags?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Most frequent feelings (30 days)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.frequent_tags.map((t) => (
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
