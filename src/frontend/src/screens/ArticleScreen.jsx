import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

export default function ArticleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get(`/api/resources/${id}`);
        setArticle(data);
      } catch {
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  if (error || !article) {
    return (
      <div className="screen" style={{ padding: 24, textAlign: 'center' }}>
        <p>{error || 'Article not found.'}</p>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/resources')}>Back</button>
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Article</h2>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {article.category && <span className="pill" style={{ fontSize: '0.8rem', marginBottom: 10, display: 'inline-block' }}>{article.category}</span>}
        <h1 style={{ fontSize: '1.375rem', marginBottom: 8, lineHeight: 1.3 }}>{article.title}</h1>
        {article.read_time && <p style={{ fontSize: '0.8rem', marginBottom: 20 }}>{article.read_time} min read</p>}

        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {article.tags.map((t) => <span key={t} className="pill" style={{ fontSize: '0.75rem' }}>{t}</span>)}
          </div>
        )}

        <div style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
          {article.content}
        </div>

        {/* Crisis line always visible on resource articles */}
        <div style={{ marginTop: 32, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Need immediate support?</p>
          <a href="tel:0800723253" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
            Befrienders Kenya: 0800 723 253
          </a>
          <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Free · 24/7</p>
        </div>
      </div>
    </div>
  );
}
