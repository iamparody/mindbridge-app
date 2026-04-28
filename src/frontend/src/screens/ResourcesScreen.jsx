import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'OCD', 'ADHD', 'Grief', 'Loneliness', 'Stress', 'General Wellness', 'Crisis Support'];

export default function ResourcesScreen() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const { data } = await client.get('/api/resources', { params });
      setArticles(data.articles ?? data ?? []);
    } catch {
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Resources</h2>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <input
          type="search"
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles…"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`pill${category === cat ? ' pill--active' : ''}`}
              style={{ cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
            <p>No articles found.</p>
          </div>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate(`/resources/${a.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: 4, lineHeight: 1.4 }}>{a.title}</h3>
                  {a.category && <span className="pill" style={{ fontSize: '0.7rem', marginBottom: 6, display: 'inline-block' }}>{a.category}</span>}
                  {a.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {a.tags.slice(0, 3).map((t) => <span key={t} className="pill" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{t}</span>)}
                    </div>
                  )}
                </div>
                {a.read_time && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{a.read_time} min read</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
