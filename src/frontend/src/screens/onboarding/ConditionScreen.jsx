import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

const CONDITIONS = [
  { value: 'anxiety',         label: 'Anxiety',         emoji: '😰' },
  { value: 'depression',      label: 'Depression',      emoji: '🌧️' },
  { value: 'ocd',             label: 'OCD',             emoji: '🔄' },
  { value: 'adhd',            label: 'ADHD',            emoji: '⚡' },
  { value: 'grief',           label: 'Grief & Loss',    emoji: '🕊️' },
  { value: 'loneliness',      label: 'Loneliness',      emoji: '🌿' },
  { value: 'stress',          label: 'Stress',          emoji: '🌊' },
  { value: 'general_support', label: 'General Support', emoji: '💙' },
];

export default function ConditionScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      await client.post('/api/onboarding/condition', { condition_category: selected });
      navigate('/onboarding/first-mood', { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="screen screen--no-nav"
      style={{
        display: 'flex', flexDirection: 'column',
        padding: 'var(--space-xl) var(--space-lg) var(--space-lg)',
        gap: 'var(--space-lg)',
      }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--font-editorial)', fontSize: 26, fontWeight: 400, marginBottom: 'var(--space-xs)' }}>
          What brings you here?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          We'll connect you with people who understand. You can always explore other groups later.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CONDITIONS.map((c) => {
          const isSelected = selected === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setSelected(c.value)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '16px 8px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: isSelected ? 'rgba(200,148,58,0.12)' : 'var(--color-surface-card)',
                cursor: 'pointer',
                transition: 'border-color 150ms, background 150ms',
              }}
            >
              <span style={{ fontSize: 28 }}>{c.emoji}</span>
              <span style={{
                fontSize: 13, fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                textAlign: 'center',
              }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p style={{ fontSize: 13, color: 'var(--color-danger)', textAlign: 'center' }}>{error}</p>}

      <button
        className="btn btn--primary"
        onClick={handleSubmit}
        disabled={!selected || submitting}
        style={{ marginTop: 'auto' }}
      >
        {submitting ? 'Joining your group…' : 'Continue'}
      </button>
    </div>
  );
}
