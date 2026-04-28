import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const MOODS = [
  { value: 1, emoji: '😔', color: 'var(--mood-very-low)', label: 'Very Low' },
  { value: 2, emoji: '😕', color: 'var(--mood-low)',      label: 'Low' },
  { value: 3, emoji: '😐', color: 'var(--mood-neutral)',  label: 'Neutral' },
  { value: 4, emoji: '🙂', color: 'var(--mood-good)',     label: 'Good' },
  { value: 5, emoji: '😊', color: 'var(--mood-great)',    label: 'Great' },
];
const TAGS = ['Anxious', 'Hopeful', 'Overwhelmed', 'Calm', 'Lonely', 'Grateful', 'Angry', 'Numb'];

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOODS.find((m) => m.value === entry.mood_level);
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mood && <span style={{ fontSize: 20, color: mood.color }}>{mood.emoji}</span>}
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {new Date(entry.created_at).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
          aria-label="Delete entry"
        >
          🗑
        </button>
      </div>
      {entry.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {entry.tags.map((t) => <span key={t} className="pill" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{t}</span>)}
        </div>
      )}
      {entry.content && (
        <p
          style={{ fontSize: '0.9rem', color: 'var(--color-text)', cursor: 'pointer', lineHeight: 1.5 }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? entry.content : entry.content.slice(0, 100) + (entry.content.length > 100 ? '…' : '')}
        </p>
      )}
      {entry.content?.length > 100 && (
        <button onClick={() => setExpanded((v) => !v)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', marginTop: 4, padding: 0 }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function JournalScreen() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMood, setFormMood] = useState(null);
  const [formTags, setFormTags] = useState([]);
  const [formContent, setFormContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (moodFilter) params.mood_level = moodFilter;
      const { data } = await client.get('/api/journals', { params });
      setEntries(data.entries ?? data ?? []);
    } catch {
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, moodFilter]);

  useEffect(() => { load(); }, [load]);

  function toggleFormTag(tag) {
    setFormTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSave() {
    setSaveError('');
    if (!formContent.trim() && !formMood) { setSaveError('Add at least a mood or some text.'); return; }
    setSaving(true);
    try {
      await client.post('/api/journals', {
        content: formContent.trim() || undefined,
        mood_level: formMood || undefined,
        tags: formTags.length ? formTags : undefined,
      });
      setShowForm(false);
      setFormMood(null);
      setFormTags([]);
      setFormContent('');
      load();
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await client.delete(`/api/journals/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError('Failed to delete entry.');
    }
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Journal</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
        >
          + New
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ margin: '0 16px 16px' }}>
          <h3 style={{ marginBottom: 12 }}>New entry</h3>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Mood (optional)</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {MOODS.map((m) => (
                <button key={m.value} type="button" onClick={() => setFormMood(formMood === m.value ? null : m.value)}
                  style={{ fontSize: 24, background: 'none', border: `2px solid ${formMood === m.value ? m.color : 'var(--color-border)'}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Tags (optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {TAGS.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleFormTag(tag)}
                  className={`pill${formTags.includes(tag) ? ' pill--active' : ''}`} style={{ cursor: 'pointer', border: 'none', fontSize: '0.75rem' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label" htmlFor="content">Write freely…</label>
            <textarea id="content" className="textarea" rows={5} value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Write freely…" />
          </div>
          {saveError && <div className="error-msg" style={{ marginBottom: 8 }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--muted btn--sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="search"
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          style={{ flex: 1 }}
        />
        <select className="select" style={{ width: 'auto' }} value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)}>
          <option value="">All moods</option>
          {MOODS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
        </select>
      </div>

      <div style={{ padding: '0 16px' }}>
        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📓</div>
            <p>No entries yet. Start writing.</p>
          </div>
        ) : (
          entries.map((e) => <EntryCard key={e.id} entry={e} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}
