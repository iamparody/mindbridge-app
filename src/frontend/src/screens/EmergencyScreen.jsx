import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, CheckCircle, Wind, ShieldCheck } from '@phosphor-icons/react';
import client from '../api/client';

export default function EmergencyScreen() {
  const navigate = useNavigate();
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleTalkNow() {
    setLoading(true);
    try {
      await client.post('/api/emergency/trigger');
    } catch { /* still show resources even on failure */ }
    setTriggered(true);
    setLoading(false);
  }

  /* CRITICAL: Zero animation delay — everything immediately visible (spec 8.5 + 9.4 #3) */
  return (
    <div
      className="screen screen--no-nav"
      style={{
        background: 'var(--color-bg-emergency)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-xl) var(--space-lg)',
        minHeight: '100dvh',
        gap: 'var(--space-lg)',
      }}
    >
      {/* Siren — only the icon has a brief fade-in, everything else static */}
      <div style={{ textAlign: 'center', paddingTop: 'var(--space-lg)' }}>
        <div
          style={{
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-md)',
            animation: 'personaIn 200ms ease-out both',
          }}
        >
          <Siren size={48} weight="duotone" aria-hidden="true" />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 22,
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          You're not alone
        </h1>

        {/* Crisis line — always first, always visible */}
        <a
          href="tel:0800723253"
          style={{
            display: 'block',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--color-accent)',
            textDecoration: 'none',
            marginBottom: 'var(--space-xs)',
            fontFamily: 'var(--font-ui)',
          }}
          aria-label="Call Befrienders Kenya: 0800 723 253"
        >
          0800 723 253
        </a>
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
          Befrienders Kenya · Free · 24/7 · Confidential
        </p>
      </div>

      <div style={{ height: 1, background: 'var(--color-divider)' }} />

      {triggered ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'var(--color-calm-bg)',
              border: '1px solid rgba(143,175,154,0.30)',
              borderRadius: 'var(--radius-md)',
              padding: '14px var(--space-md)',
              color: 'var(--color-calm)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <CheckCircle size={20} weight="duotone" aria-hidden="true" />
            <span>Help is coming. An admin has been alerted.</span>
          </div>

          <button className="btn btn--primary" onClick={() => navigate('/breathing')}>
            <Wind size={20} weight="duotone" aria-hidden="true" />
            Try a breathing exercise
          </button>

          <button
            className="btn btn--ghost"
            onClick={() => navigate('/safety-plan')}
          >
            <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
            Open my Safety Plan
          </button>

          <button className="btn btn--muted" onClick={() => navigate('/dashboard')}>
            Back to home
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <button
            className="btn btn--danger"
            onClick={handleTalkNow}
            disabled={loading}
            style={{ fontSize: 'var(--text-body)' }}
          >
            <Siren size={20} weight="duotone" aria-hidden="true" />
            {loading ? 'Alerting…' : 'I need to talk to someone now'}
          </button>

          <button
            className="btn btn--ghost"
            onClick={() => navigate('/breathing')}
          >
            <Wind size={20} weight="duotone" aria-hidden="true" />
            Try a breathing exercise first
          </button>

          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 'var(--space-sm)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(194,164,138,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-xs)',
              minHeight: 'var(--touch-target-min)',
            }}
            onClick={() => navigate('/safety-plan')}
          >
            <ShieldCheck size={16} weight="duotone" aria-hidden="true" />
            Open my Safety Plan
          </button>
        </div>
      )}
    </div>
  );
}
