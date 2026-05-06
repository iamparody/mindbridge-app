import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Robot, Handshake, MicrophoneStage, ChatText } from '@phosphor-icons/react';
import client from '../api/client';

const STATUS_LABEL = { active: 'In progress', completed: 'Completed', abandoned: 'Ended early' };

function duration(start, end) {
  if (!end) return null;
  const s = Math.round((new Date(end.includes('Z') ? end : end + 'Z') - new Date(start.includes('Z') ? start : start + 'Z')) / 60000);
  if (s < 1) return '< 1 min';
  return `${s} min`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr.includes('Z') ? dateStr : dateStr + 'Z');
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function SessionCard({ session, type }) {
  const isAI = type === 'ai';
  const isVoice = session.channel === 'voice';
  const dur = duration(session.created_at, session.ended_at);

  return (
    <div className="card" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: isAI ? 'rgba(114,99,189,0.12)' : 'rgba(91,163,155,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isAI
          ? <Robot size={20} weight="duotone" color="var(--color-accent)" />
          : isVoice
            ? <MicrophoneStage size={20} weight="duotone" color="var(--color-calm)" />
            : <ChatText size={20} weight="duotone" color="var(--color-calm)" />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
            {isAI ? 'AI Companion' : `Peer ${isVoice ? 'Voice' : 'Text'}`}
          </span>
          {dur && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{dur}</span>
          )}
        </div>

        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {formatDate(session.created_at)}
        </div>

        {session.preview && (
          <div style={{
            marginTop: 6, fontSize: 12, color: 'var(--color-text-secondary)',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {session.preview}
          </div>
        )}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}

export default function SessionHistoryScreen() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [aiRes, peerRes] = await Promise.all([
          client.get('/api/ai/sessions?limit=20'),
          client.get('/api/peer/history?limit=20'),
        ]);
        const ai = (aiRes.data.sessions ?? []).map((s) => ({ ...s, type: 'ai' }));
        const peer = (peerRes.data.sessions ?? []).map((s) => ({ ...s, type: 'peer' }));
        const combined = [...ai, ...peer].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSessions(combined);
      } catch {
        setError('We couldn\'t load your session history. Try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="screen">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Session History</h2>
      </div>

      <div style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <HistorySkeleton />
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <Handshake size={48} weight="duotone" color="var(--color-text-muted)" aria-hidden="true" />
            <div className="empty-state__title">No sessions yet</div>
            <div className="empty-state__body">Your AI and peer sessions will appear here.</div>
          </div>
        ) : (
          sessions.map((s) => (
            <SessionCard key={s.id} session={s} type={s.type} />
          ))
        )}
      </div>
    </div>
  );
}
