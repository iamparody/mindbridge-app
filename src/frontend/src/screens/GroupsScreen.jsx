import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersThree } from '@phosphor-icons/react';
import client from '../api/client';

function GroupsSkeleton() {
  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ width: '60%', height: 16 }} />
            <div className="skeleton" style={{ width: '80%', height: 13 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

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
        setError('We couldn\'t connect. Check your internet and try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="screen" style={{ padding: '0 0 var(--space-md)' }}>
        <div className="page-header">
          <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
          <h2 className="page-header__title">Groups</h2>
        </div>
        <GroupsSkeleton />
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 var(--space-md)' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Groups</h2>
      </div>

      <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
        {error && <div className="error-msg" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        {groups.length === 0 ? (
          <div className="empty-state">
            <UsersThree size={48} weight="duotone" color="var(--color-text-muted)" aria-hidden="true" />
            <div className="empty-state__title">Find your people</div>
            <div className="empty-state__body">Join a group to connect with others who understand.</div>
          </div>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="card card--interactive"
              style={{ marginBottom: 'var(--space-sm)' }}
              onClick={() => navigate(`/groups/${g.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16 }}>{g.name}</h3>
                    {g.is_member && <span className="pill pill--active" style={{ fontSize: 10, padding: '2px 8px' }}>Joined</span>}
                  </div>
                  {g.category && <span className="pill" style={{ fontSize: 10, marginBottom: 6, display: 'inline-block' }}>{g.category}</span>}
                  {g.description && <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>{g.description}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>{g.member_count ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>members</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
