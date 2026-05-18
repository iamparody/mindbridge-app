import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const CATEGORIES = ['anxiety','depression','ocd','adhd','grief','loneliness','stress','general_wellness','crisis_support'];
const STATUSES   = ['', 'published', 'draft', 'archived'];

export default function ContentTab() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('');
  const [panel,    setPanel]    = useState(null); // null | { article } | { isNew: true }

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/resources');
      setArticles(data.articles ?? []);
    } catch { setError('Failed to load articles.'); }
    finally   { setLoading(false); }
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Library</h1>
          <p className="page-subtitle">Manage educational articles and resources</p>
        </div>
        <div className="filter-row">
          <select style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <button className="btn btn--primary btn--sm" onClick={() => setPanel({ isNew: true })}>
            + New Article
          </button>
          <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📚</div>
              <p className="empty-text">No articles found</p>
            </div>
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
                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </td>
                    <td>{a.category.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge badge--${a.status}`}>{a.status}</span>
                    </td>
                    <td>{a.estimated_read_minutes} min</td>
                    <td><span className="elapsed">{new Date(a.updated_at).toLocaleDateString()}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn--ghost btn--sm" onClick={() => setPanel({ article: a })}>Edit</button>
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

      {panel && (
        <ArticlePanel
          article={panel.article ?? null}
          onClose={() => setPanel(null)}
          onSaved={() => { setPanel(null); load(); }}
        />
      )}
    </div>
  );
}

function ArticlePanel({ article, onClose, onSaved }) {
  const isNew = !article;
  const [title,    setTitle]    = useState(article?.title ?? '');
  const [category, setCategory] = useState(article?.category ?? CATEGORIES[0]);
  const [content,  setContent]  = useState(article?.content ?? '');
  const [readMins, setReadMins] = useState(article?.estimated_read_minutes ?? 5);
  const [tags,     setTags]     = useState(article?.tags ? article.tags.join(', ') : '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  async function handleSave() {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true);
    setError('');
    const body = {
      title:                  title.trim(),
      category,
      content:                content.trim(),
      estimated_read_minutes: parseInt(readMins) || 5,
      tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
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
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="slide-panel">
        <div className="slide-panel__header">
          <span className="slide-panel__title">{isNew ? 'New Article' : 'Edit Article'}</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
        </div>

        <div className="slide-panel__body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title…"
              autoFocus
            />
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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Article body…"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated, optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="anxiety, breathing, tips"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="slide-panel__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
