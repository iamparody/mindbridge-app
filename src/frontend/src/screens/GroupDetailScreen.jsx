import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

export default function GroupDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get(`/api/groups/${id}`);
        setGroup(data);
      } catch {
        setError('Failed to load group.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleLeave() {
    try {
      await client.post(`/api/groups/${id}/leave`);
      navigate('/groups', { replace: true });
    } catch {
      setError('Could not leave group. Please try again.');
    }
  }

  if (loading) return (
    <div className="screen" style={{ padding: '0 0 var(--space-md)' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/groups')} aria-label="Back">‹</button>
        <h2 className="page-header__title">Group</h2>
      </div>
      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 52, borderRadius: 'var(--radius-pill)' }} />
      </div>
    </div>
  );

  if (!group) {
    return (
      <div className="screen" style={{ padding: 24, textAlign: 'center' }}>
        <p>{error || 'Group not found.'}</p>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/groups')}>Back to groups</button>
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/groups')} aria-label="Back">‹</button>
        <h2 className="page-header__title">{group.name}</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="error-msg">{error}</div>}

        <div className="card">
          {group.category && <span className="pill" style={{ marginBottom: 8, display: 'inline-block', fontSize: '0.8rem' }}>{group.category}</span>}
          {group.description && <p style={{ lineHeight: 1.6 }}>{group.description}</p>}
          <div style={{ marginTop: 12, display: 'flex', gap: 16, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            <span>👥 {group.member_count ?? 0} members</span>
          </div>
        </div>

        {group.is_member ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn--primary" onClick={() => navigate(`/groups/${id}/chat`)}>
              💬 Open Chat
            </button>
            <button className="btn btn--muted" onClick={handleLeave}>Leave Group</button>
          </div>
        ) : (
          <button className="btn btn--primary" onClick={() => navigate(`/groups/${id}/agree`)}>
            Join Group
          </button>
        )}
      </div>
    </div>
  );
}
