import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const MOODS = [
  { value: 'very_low', label: 'Very Low', emoji: '😔', color: 'var(--mood-very-low)' },
  { value: 'low',      label: 'Low',      emoji: '😕', color: 'var(--mood-low)' },
  { value: 'neutral',  label: 'Neutral',  emoji: '😐', color: 'var(--mood-neutral)' },
  { value: 'good',     label: 'Good',     emoji: '🙂', color: 'var(--mood-good)' },
  { value: 'great',    label: 'Great',    emoji: '😊', color: 'var(--mood-great)' },
];

const TAGS = ['Anxious', 'Hopeful', 'Overwhelmed', 'Calm', 'Lonely', 'Grateful', 'Angry', 'Numb'];

export default function MoodCheckinScreen() {
  const navigate = useNavigate();
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLowPrompt, setShowLowPrompt] = useState(false);

  function toggleTag(tag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit() {
    if (!mood) { setError('Please select how you are feeling.'); return; }
    setError('');
    setLoading(true);
    try {
      await client.post('/api/moods', { mood_level: mood, note: note.trim() || undefined, tags: tags.map((t) => t.toLowerCase()) });
      if (mood === 'very_low') {
        setShowLowPrompt(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      setError(status === 409
        ? 'You already checked in today. See you tomorrow!'
        : err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (showLowPrompt) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💙</div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: 8 }}>We noticed you're having a hard day</h1>
          <p>You don't have to go through this alone.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn--primary" onClick={() => navigate('/ai-chat', { replace: true })}>💬 AI Chat</button>
          <button className="btn btn--ghost" onClick={() => navigate('/peer', { replace: true })}>🤝 Peer Help</button>
          <button className="btn btn--danger" onClick={() => navigate('/emergency', { replace: true })}>🆘 Emergency</button>
          <button className="btn btn--muted" onClick={() => navigate('/dashboard', { replace: true })}>Not now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Daily Check-In</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label className="label">How are you feeling right now?</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '12px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${mood === m.value ? m.color : 'var(--color-border)'}`,
                  background: mood === m.value ? `${m.color}20` : 'var(--color-white)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: mood === m.value ? m.color : 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="note">What's on your mind? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
          <textarea
            id="note"
            className="textarea"
            rows={3}
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
          />
          <div className={`char-counter${note.length > 190 ? ' char-counter--over' : ''}`}>{note.length}/200</div>
        </div>

        <div>
          <label className="label">How would you describe this feeling? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`pill${tags.includes(tag) ? ' pill--active' : ''}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={loading || !mood}
        >
          {loading ? 'Saving…' : 'Submit Check-In'}
        </button>
      </div>
    </div>
  );
}
