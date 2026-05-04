import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from '@phosphor-icons/react';
import client from '../api/client';

const CATEGORIES = [
  { label: 'All',             value: '' },
  { label: 'Anxiety',         value: 'anxiety' },
  { label: 'Depression',      value: 'depression' },
  { label: 'OCD',             value: 'ocd' },
  { label: 'ADHD',            value: 'adhd' },
  { label: 'Grief',           value: 'grief' },
  { label: 'Loneliness',      value: 'loneliness' },
  { label: 'Stress',          value: 'stress' },
  { label: 'General Wellness',value: 'general_wellness' },
  { label: 'Crisis Support',  value: 'crisis_support' },
];

function ResourcesSkeleton() {
  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton" style={{ width: '100%', height: 80, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}

export default function ResourcesScreen() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category.value) params.category = category.value;
      const { data } = await client.get('/api/resources', { params });
      setArticles(data.articles ?? data ?? []);
    } catch {
      setError('We couldn\'t connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="screen">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Resources</h2>
      </div>

      <div style={{ padding: '0 var(--space-md) var(--space-sm)' }}>
        <input
          type="search"
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles…"
          style={{ marginBottom: 'var(--space-sm)' }}
          aria-label="Search articles"
        />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat)}
              className={`pill${category.value === cat.value ? ' pill--active' : ''}`}
              style={{ cursor: 'pointer', flexShrink: 0 }}
              aria-pressed={category.value === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 var(--space-md)' }}>
        {error && <div className="error-msg" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        {loading ? (
          <ResourcesSkeleton />
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} weight="duotone" color="var(--color-text-muted)" aria-hidden="true" />
            <div className="empty-state__title">No articles found</div>
            <div className="empty-state__body">Try a different search term or category.</div>
          </div>
        ) : (
          articles.map((a) => (
            <div
              key={a.id}
              className="card card--interactive"
              style={{ marginBottom: 'var(--space-sm)' }}
              onClick={() => navigate(`/resources/${a.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 4, lineHeight: 1.4 }}>{a.title}</h3>
                  {a.category && <span className="pill" style={{ fontSize: 10, marginBottom: 6, display: 'inline-block' }}>{a.category}</span>}
                  {a.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {a.tags.slice(0, 3).map((t) => <span key={t} className="pill" style={{ fontSize: 10, padding: '1px 6px' }}>{t}</span>)}
                    </div>
                  )}
                </div>
                {a.estimated_read_minutes && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }}>{a.estimated_read_minutes} min</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
