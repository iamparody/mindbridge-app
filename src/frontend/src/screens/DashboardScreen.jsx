import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const TILES = [
  { label: 'Peer Help',   emoji: '🤝', to: '/peer',        desc: 'Talk to someone now' },
  { label: 'AI Chat',     emoji: '💬', to: '/ai-chat',     desc: 'Your companion is here' },
  { label: 'Therapist',   emoji: '🏥', to: '/referral',    desc: 'Professional referral' },
  { label: 'Journal',     emoji: '📓', to: '/journal',     desc: 'Write freely' },
  { label: 'Groups',      emoji: '👥', to: '/groups',      desc: 'Peer communities' },
  { label: 'Emergency',   emoji: '🆘', to: '/emergency',   desc: 'Get help right now', emergency: true },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [streak, setStreak] = useState(0);
  const [unread, setUnread] = useState(0);
  const [moodDone, setMoodDone] = useState(true);
  const [moodDismissed, setMoodDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [profileRes, balanceRes, notifsRes, moodRes] = await Promise.all([
        client.get('/api/profile'),
        client.get('/api/credits/balance'),
        client.get('/api/notifications'),
        client.get('/api/moods/today').catch(() => ({ data: null })),
      ]);
      setStreak(profileRes.data.streak_count ?? 0);
      setBalance(balanceRes.data.balance ?? 0);
      const notifs = notifsRes.data.notifications ?? notifsRes.data ?? [];
      setUnread(notifs.filter((n) => !n.read_at).length);
      setMoodDone(!!moodRes.data);
    } catch {
      setError('Failed to load dashboard. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const alias = user?.alias ?? '';
  const balanceLow = balance !== null && balance < 2;

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Signed in as</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{alias}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Credits</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: balanceLow ? 'var(--color-emergency)' : 'var(--color-text)' }}>
              {balance !== null ? balance : '—'}
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', position: 'relative' }}
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-emergency)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-msg" style={{ margin: '12px 16px' }}>
          {error} <button onClick={load} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Retry</button>
        </div>
      )}

      {/* Mood prompt banner */}
      {!moodDone && !moodDismissed && (
        <div style={{ margin: '12px 16px', background: '#EBF4FF', border: '1px solid #C7D8F5', borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}>Daily check-in</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>How are you feeling today?</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => navigate('/mood')} className="btn btn--primary btn--sm" style={{ width: 'auto' }}>Check In</button>
            <button onClick={() => setMoodDismissed(true)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--color-text-muted)' }}>×</button>
          </div>
        </div>
      )}

      {/* Streak */}
      <div style={{ margin: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{streak}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}> day streak</span>
        </div>
        {balanceLow && balance !== null && (
          <Link to="/profile" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-emergency)', fontWeight: 600, textDecoration: 'none' }}>
            Low credits — top up
          </Link>
        )}
      </div>

      {/* Action tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '20px 12px',
              background: tile.emergency ? 'var(--color-emergency)' : 'var(--color-white)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              textDecoration: 'none',
              color: tile.emergency ? '#fff' : 'var(--color-text)',
              transition: 'transform 0.1s',
            }}
          >
            <span style={{ fontSize: 32 }}>{tile.emoji}</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tile.label}</span>
            <span style={{ fontSize: '0.75rem', color: tile.emergency ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)', textAlign: 'center' }}>{tile.desc}</span>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', flexWrap: 'wrap' }}>
        <Link to="/analytics" className="pill">📊 My insights</Link>
        <Link to="/safety-plan" className="pill">🛡️ Safety plan</Link>
        <Link to="/breathing" className="pill">🌬️ Breathing</Link>
      </div>
    </div>
  );
}
