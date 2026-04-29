import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartLine } from '@phosphor-icons/react';
import client from '../api/client';

const SCORE_COLORS = [
  { min: -2,   max: -1.5, color: 'var(--color-danger)' },
  { min: -1.5, max: -0.5, color: 'var(--color-warning)' },
  { min: -0.5, max:  0.5, color: 'var(--color-accent)' },
  { min:  0.5, max:  1.5, color: 'var(--color-calm)' },
  { min:  1.5, max:  2,   color: '#6BAF7A' },
];

const MOOD_META = {
  very_low: { label: 'Very Low', color: 'var(--color-danger)',  emoji: '😔' },
  low:      { label: 'Low',      color: 'var(--color-warning)', emoji: '😕' },
  neutral:  { label: 'Neutral',  color: 'var(--color-accent)',  emoji: '😐' },
  good:     { label: 'Good',     color: 'var(--color-calm)',    emoji: '🙂' },
  great:    { label: 'Great',    color: '#6BAF7A',              emoji: '😊' },
};

function scoreColor(score) {
  if (score === null) return 'var(--color-border)';
  for (const band of SCORE_COLORS) {
    if (score >= band.min && score <= band.max) return band.color;
  }
  return score < 0 ? 'var(--color-warning)' : 'var(--color-calm)';
}

function AnalyticsSkeleton() {
  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
      </div>
      <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
        {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: h, borderRadius: '3px 3px 0 0' }} />
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  if (!data?.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
      {data.map((d, i) => {
        const color = scoreColor(d.avg_score);
        const height = d.avg_score !== null ? ((d.avg_score + 2) / 4) * 80 : 4;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', height: Math.max(4, height), background: color, borderRadius: '3px 3px 0 0', transition: 'height 300ms ease' }} />
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1 }}>
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
        setError('We couldn\'t connect. Check your internet and try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tooFewEntries = !data || (data.total_checkins ?? 0) < 3;
  const commonMoodMeta = data?.common_mood ? MOOD_META[data.common_mood] : null;

  return (
    <div className="screen" style={{ padding: '0 0 var(--space-md)' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">My Insights</h2>
      </div>

      <div style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <AnalyticsSkeleton />
        ) : tooFewEntries ? (
          <div className="empty-state">
            <ChartLine size={48} weight="duotone" color="var(--color-text-muted)" aria-hidden="true" />
            <div className="empty-state__title">Keep checking in</div>
            <div className="empty-state__body">Your mood insights appear after a few days of check-ins.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              {[
                { label: 'Current Streak', value: `${data.current_streak ?? 0}🔥` },
                { label: 'Total Check-ins', value: `${data.total_checkins ?? 0}` },
              ].map((s) => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                  <div style={{ fontWeight: 600, fontSize: 24, color: 'var(--color-text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {commonMoodMeta && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: 36 }} aria-hidden="true">{commonMoodMeta.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>Most common mood (30 days)</div>
                  <div style={{ color: commonMoodMeta.color, fontWeight: 600, marginTop: 2 }}>{commonMoodMeta.label}</div>
                </div>
              </div>
            )}

            {data.week_trend?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 16 }}>Last 7 days</h3>
                <BarChart data={data.week_trend} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <span>😔 Very Low</span><span>😊 Great</span>
                </div>
              </div>
            )}

            {data.frequent_tags?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 16 }}>Most frequent feelings (30 days)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  {data.frequent_tags.map((t) => (
                    <span key={t.tag} className="pill" style={{ fontSize: 13 }}>
                      {t.tag} <strong style={{ color: 'var(--color-accent)', marginLeft: 4 }}>{t.count}</strong>
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
