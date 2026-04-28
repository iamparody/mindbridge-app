import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

const TONES = [
  { value: 'warm', label: 'Warm', desc: 'Compassionate and nurturing' },
  { value: 'motivational', label: 'Motivational', desc: 'Energetic and encouraging' },
  { value: 'clinical', label: 'Clinical', desc: 'Structured and objective' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed and conversational' },
];

const STYLES = [
  { value: 'brief', label: 'Brief', desc: 'Short, focused replies' },
  { value: 'elaborate', label: 'Elaborate', desc: 'Detailed, thorough responses' },
];

const FORMALITIES = [
  { value: 'formal', label: 'Formal' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'informal', label: 'Informal' },
];

function previewSnippet(name, tone, style, usesAlias, alias) {
  const addressee = usesAlias && alias ? alias : 'you';
  const greetings = {
    warm: `Hello${usesAlias && alias ? `, ${addressee}` : ''}. I'm ${name || 'your companion'}. I'm here to listen — what's on your heart today?`,
    motivational: `Hey${usesAlias && alias ? ` ${addressee}` : ''}! I'm ${name || 'your companion'}. Ready to take on the day together? What's going on?`,
    clinical: `Hello. I'm ${name || 'your companion'}. Let's begin. How are you feeling at this moment?`,
    casual: `Hey${usesAlias && alias ? ` ${addressee}` : ''}! I'm ${name || 'your companion'}. What's up?`,
  };
  const elaboration = style === 'elaborate' ? " I'm fully present and there's no rush — take all the time you need to share." : '';
  return (greetings[tone] || greetings.warm) + elaboration;
}

export default function PersonaScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tone, setTone] = useState('warm');
  const [style, setStyle] = useState('brief');
  const [formality, setFormality] = useState('neutral');
  const [usesAlias, setUsesAlias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('mb_user') || '{}'); } catch { return {}; } })();
  const alias = storedUser.alias || '';

  const preview = previewSnippet(name, tone, style, usesAlias, alias);

  async function handleSubmit() {
    if (!name.trim()) { setError('Give your companion a name.'); return; }
    if (!confirmed) { setError('Please confirm that you understand the persona is permanent.'); return; }
    setError('');
    setLoading(true);
    try {
      await client.post('/api/onboarding/persona', {
        persona_name: name.trim(),
        tone,
        response_style: style,
        formality,
        uses_alias: usesAlias,
      });
      navigate('/onboarding/first-mood', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      setError(status === 403
        ? 'Your persona has already been created.'
        : err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen screen--no-nav" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
        <h1 style={{ fontSize: '1.5rem' }}>Create your AI companion</h1>
        <p style={{ marginTop: 4 }}>This is permanent — choose thoughtfully</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label" htmlFor="pname">Companion name <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(max 20 chars)</span></label>
          <input
            id="pname"
            type="text"
            className="input"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sage, Aria, Nova…"
          />
          <div className="char-counter">{name.length}/20</div>
        </div>

        <div>
          <label className="label">Tone</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${tone === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: tone === t.value ? '#EBF4FF' : 'var(--color-white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{t.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Response style</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${style === s.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: style === s.value ? '#EBF4FF' : 'var(--color-white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Formality</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {FORMALITIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormality(f.value)}
                className={`pill${formality === f.value ? ' pill--active' : ''}`}
                style={{ cursor: 'pointer', border: 'none', padding: '8px 16px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={usesAlias}
            onChange={(e) => setUsesAlias(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: '0.9rem' }}>Address me by my alias ({alias || 'your alias'})</span>
        </label>

        <div className="card" style={{ background: '#F0F4FF', border: '1px solid #C7D8F5' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Preview — how {name || 'your companion'} will greet you:</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontStyle: 'italic', lineHeight: 1.6 }}>"{preview}"</p>
        </div>

        <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <p style={{ fontSize: '0.875rem', color: '#7B6200', fontWeight: 600, marginBottom: 4 }}>⚠️ This cannot be changed</p>
          <p style={{ fontSize: '0.875rem', color: '#7B6200' }}>Once set, your AI companion's identity is permanent. Take your time.</p>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: '0.875rem' }}>I understand this persona is permanent and cannot be changed later</span>
        </label>

        {error && <div className="error-msg">{error}</div>}

        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !confirmed}
        >
          {loading ? 'Creating…' : 'Create My Companion'}
        </button>
      </div>
    </div>
  );
}
