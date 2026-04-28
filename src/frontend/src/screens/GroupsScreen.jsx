import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function GroupsScreen() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/api/groups');
        setGroups(data.groups ?? data ?? []);
      } catch {
        setError('Failed to load groups. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Groups</h2>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            <p>No groups available yet.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="card"
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => navigate(`/groups/${g.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1rem' }}>{g.name}</h3>
                    {g.is_member && <span className="pill pill--active" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Joined</span>}
                  </div>
                  {g.category && <span className="pill" style={{ fontSize: '0.7rem', marginBottom: 6, display: 'inline-block' }}>{g.category}</span>}
                  {g.description && <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginTop: 4 }}>{g.description}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.member_count ?? 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>members</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
