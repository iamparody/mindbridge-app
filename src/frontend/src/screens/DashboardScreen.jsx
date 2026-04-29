import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Handshake, Robot, Stethoscope, Notebook, UsersThree, Siren, Bell, Coin } from '@phosphor-icons/react';
import client from '../api/client';

const TILES = [
  { label: 'Peer Help',  Icon: Handshake,   to: '/peer',      desc: 'Talk to someone now' },
  { label: 'AI Chat',    Icon: Robot,        to: '/ai-chat',   desc: 'Your companion is here' },
  { label: 'Therapist',  Icon: Stethoscope,  to: '/referral',  desc: 'Professional referral' },
  { label: 'Journal',    Icon: Notebook,     to: '/journal',   desc: 'Write freely' },
  { label: 'Groups',     Icon: UsersThree,   to: '/groups',    desc: 'Peer communities' },
  { label: 'Emergency',  Icon: Siren,        to: '/emergency', desc: 'Get help right now', emergency: true },
];

function DashboardSkeleton() {
  return (
    <div style={{ padding: 'var(--space-md)' }}>
      {/* Top bar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', height: 'var(--top-bar-height)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ width: 140, height: 16 }} />
          <div className="skeleton" style={{ width: 80, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
      </div>
      {/* Streak bar */}
      <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }} />
      {/* Mood banner */}
      <div className="skeleton" style={{ width: '100%', height: 72, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }} />
      {/* Tiles grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    </div>
  );
}

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
      setError('We couldn\'t connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const alias = user?.alias ?? '';
  const balanceLow = balance !== null && balance <= 2;

  if (loading) {
    return (
      <div className="screen">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 var(--space-md)' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--top-bar-height)',
          padding: '0 var(--space-md)',
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>Signed in as</div>
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-text-secondary)' }}>{alias}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span className={`credit-badge${balanceLow ? ' credit-badge--low' : ''}`} aria-label={`${balance} credits`}>
            <Coin size={16} weight="duotone" aria-hidden="true" />
            {balance !== null ? balance : '—'}
          </span>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              width: 'var(--touch-target-min)',
              height: 'var(--touch-target-min)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Bell size={24} weight="duotone" aria-hidden="true" />
            {unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: 'var(--color-danger)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-msg" style={{ margin: 'var(--space-md)' }}>
          {error}{' '}
          <button
            onClick={load}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Streak bar */}
      <div
        style={{
          margin: 'var(--space-md) var(--space-md) 0',
          background: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
        }}
      >
        <span style={{ fontSize: 20 }} aria-hidden="true">🔥</span>
        <span style={{ fontWeight: 600, fontSize: 20, color: 'var(--color-warning)' }}>{streak}</span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>day streak</span>
        {balanceLow && balance !== null && (
          <Link
            to="/profile"
            style={{
              marginLeft: 'auto',
              marginRight: 'var(--space-md)',
              fontSize: 12,
              color: 'var(--color-danger)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Low credits
          </Link>
        )}
      </div>

      {/* Mood prompt banner */}
      {!moodDone && !moodDismissed && (
        <div
          style={{
            margin: 'var(--space-sm) var(--space-md)',
            background: 'var(--color-warning-bg)',
            borderLeft: '3px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-sm)',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-warning)' }}>How are you feeling today?</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Daily check-in</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/mood')}
              className="btn btn--primary btn--sm"
              style={{ width: 'auto' }}
            >
              Check In
            </button>
            <button
              onClick={() => setMoodDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                width: 'var(--touch-target-min)',
                height: 'var(--touch-target-min)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Action tiles 2×3 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm) var(--space-md) 0',
        }}
      >
        {TILES.map(({ label, Icon, to, desc, emergency }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '20px 12px',
              background: emergency ? 'var(--color-danger-bg)' : 'var(--color-surface-card)',
              border: `1px solid ${emergency ? 'rgba(179,92,92,0.40)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              textDecoration: 'none',
              color: emergency ? 'var(--color-danger)' : 'var(--color-text-primary)',
              transition: 'transform var(--duration-fast), box-shadow var(--duration-fast)',
              minHeight: 96,
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.985)'}
            onMouseUp={(e) => e.currentTarget.style.transform = ''}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.985)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = ''}
          >
            <Icon
              size={32}
              weight="duotone"
              aria-hidden="true"
              color={emergency ? 'var(--color-danger)' : 'var(--color-accent)'}
            />
            <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
            <span style={{ fontSize: 11, color: emergency ? 'rgba(179,92,92,0.80)' : 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{desc}</span>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', padding: 'var(--space-md) var(--space-md) 0', flexWrap: 'wrap' }}>
        <Link to="/analytics" className="pill" style={{ cursor: 'pointer' }}>My insights</Link>
        <Link to="/safety-plan" className="pill" style={{ cursor: 'pointer' }}>Safety plan</Link>
        <Link to="/breathing" className="pill" style={{ cursor: 'pointer' }}>Breathing</Link>
      </div>
    </div>
  );
}
