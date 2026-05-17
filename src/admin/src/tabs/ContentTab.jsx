import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const CATEGORIES = ['anxiety','depression','ocd','adhd','grief','loneliness','stress','general_wellness','crisis_support'];
const STATUSES   = ['', 'published', 'draft', 'archived'];

export default function ContentTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/resources');
      setArticles(data.articles ?? []);
    } catch { setError('Failed to load articles.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter ? articles.filter((a) => a.status === filter) : articles;

  async function handlePublish(id) {
    try { await client.patch(`/api/admin/resources/${id}/publish`); load(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to publish.'); }
  }

  async function handleArchive(id) {
    try { await client.patch(`/api/admin/resources/${id}/archive`); load(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to archive.'); }
  }

  const statusBadge = (s) => <span className={`badge badge--${s}`}>{s}</span>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Content Library</h1>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <button className="btn btn--primary btn--sm" onClick={() => setCreating(true)}>+ New Article</button>
          <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">📚</div>No articles found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Read time</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</td>
                    <td>{a.category}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td>{a.estimated_read_minutes} min</td>
                    <td><span className="elapsed">{new Date(a.updated_at).toLocaleDateString()}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn--ghost btn--sm" onClick={() => setEditing(a)}>Edit</button>
                        {a.status !== 'published' && (
                          <button className="btn btn--success btn--sm" onClick={() => handlePublish(a.id)}>Publish</button>
                        )}
                        {a.status !== 'archived' && (
                          <button className="btn btn--ghost btn--sm" onClick={() => handleArchive(a.id)}>Archive</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(editing || creating) && (
        <ArticleModal
          article={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function ArticleModal({ article, onClose, onSaved }) {
  const isNew = !article;
  const [title, setTitle]     = useState(article?.title ?? '');
  const [category, setCategory] = useState(article?.category ?? CATEGORIES[0]);
  const [content, setContent] = useState(article?.content ?? '');
  const [readMins, setReadMins] = useState(article?.estimated_read_minutes ?? 5);
  const [tags, setTags]       = useState(article?.tags ? article.tags.join(', ') : '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  async function handleSave() {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true);
    setError('');
    const body = {
      title:                  title.trim(),
      category,
      content:                content.trim(),
      estimated_read_minutes: parseInt(readMins) || 5,
      tags:                   tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
    };
    try {
      if (isNew) {
        await client.post('/api/admin/resources', body);
      } else {
        await client.patch(`/api/admin/resources/${article.id}`, body);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'New Article' : 'Edit Article'}</h3>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title…" autoFocus />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Read time (min)</label>
            <input type="number" value={readMins} onChange={(e) => setReadMins(e.target.value)} min={1} max={60} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Article body…" />
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma-separated, optional)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="anxiety, breathing, tips" />
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
