import { useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft } from '@phosphor-icons/react';

export default function PublicEmergencyScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="screen screen--no-nav"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-xl) var(--space-lg)',
        minHeight: '100dvh',
        background: 'var(--color-bg-emergency)',
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5EDE4', fontSize: 26, lineHeight: 1, padding: 0 }}
          aria-label="Back to login"
        >
          ‹
        </button>
        <span style={{ color: '#F5EDE4', fontSize: 16, fontWeight: 600, marginLeft: 'var(--space-sm)' }}>
          You are safe
        </span>
      </div>

      {/* Breathing circle — pure CSS, no API */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(194,164,138,0.15)',
            border: '2px solid rgba(194,164,138,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            animation: 'breatheGuide 8s ease-in-out infinite',
          }}
        >
          <div style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: 'rgba(194,164,138,0.30)',
            animation: 'breatheGuide 8s ease-in-out infinite reverse',
          }} />
        </div>
        <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13 }}>
          Breathe in slowly… and out
        </p>
      </div>

      {/* Crisis line */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)', width: '100%' }}>
        <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13, marginBottom: 12 }}>
          Free. 24/7. Confidential.
        </p>
        <a
          href="tel:0800723253"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(194,164,138,0.12)',
            border: '1.5px solid rgba(194,164,138,0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md) var(--space-lg)',
            color: '#F5EDE4',
            textDecoration: 'none',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          <Phone size={24} weight="fill" />
          0800 723 253
        </a>
        <p style={{ color: 'rgba(245,237,228,0.45)', fontSize: 12, marginTop: 8 }}>
          Befrienders Kenya
        </p>
      </div>

      {/* Back to login */}
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'none',
          border: '1px solid rgba(245,237,228,0.22)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-sm) var(--space-lg)',
          color: '#F5EDE4',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ArrowLeft size={16} />
        Keep trying to log in
      </button>
    </div>
  );
}
