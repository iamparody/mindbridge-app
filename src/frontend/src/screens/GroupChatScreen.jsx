import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const REPORT_REASONS = [
  { value: 'harmful_content', label: 'Harmful content' },
  { value: 'abuse', label: 'Abuse' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];

export default function GroupChatScreen() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [pinned, setPinned] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const bottomRef = useRef(null);
  const longPressTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const [groupRes, msgRes] = await Promise.all([
        client.get(`/api/groups/${groupId}`),
        client.get(`/api/groups/${groupId}/messages`),
      ]);
      setGroup(groupRes.data);
      setPinned(msgRes.data.pinned ?? []);
      setMessages(msgRes.data.messages ?? msgRes.data ?? []);
    } catch {
      setError('Failed to load chat.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await client.post(`/api/groups/${groupId}/messages`, { content: text });
      const { data: msgData } = await client.get(`/api/groups/${groupId}/messages`);
      setMessages(msgData.messages ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send.');
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function startLongPress(msg) {
    longPressTimer.current = setTimeout(() => setReportTarget(msg), 500);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer.current);
  }

  async function handleReport() {
    if (!reportTarget || !reportReason) return;
    setReporting(true);
    try {
      await client.post(`/api/groups/${groupId}/messages/${reportTarget.id}/report`, { reason: reportReason });
      setReportSuccess(true);
      setTimeout(() => { setReportTarget(null); setReportSuccess(false); setReportReason(''); }, 1800);
    } catch {
      setError('Failed to submit report.');
      setReportTarget(null);
    } finally {
      setReporting(false);
    }
  }

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <button className="page-header__back" onClick={() => navigate(`/groups/${groupId}`)} aria-label="Back">‹</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{group?.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Alias only · Hold message to report</div>
        </div>
      </div>

      {/* Pinned messages */}
      {pinned.length > 0 && (
        <div style={{ background: '#EBF4FF', borderBottom: '1px solid #C7D8F5', padding: '8px 16px' }}>
          {pinned.map((p) => (
            <div key={p.id} style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
              📌 <strong>{p.alias}</strong>: {p.content}
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-msg" style={{ margin: '8px 16px' }}>{error}</div>}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            onMouseDown={() => startLongPress(msg)}
            onMouseUp={cancelLongPress}
            onTouchStart={() => startLongPress(msg)}
            onTouchEnd={cancelLongPress}
            style={{ cursor: 'default' }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>
              {msg.alias} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{
              display: 'inline-block',
              background: msg.is_deleted ? 'var(--color-surface)' : 'var(--color-white)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              boxShadow: 'var(--shadow)',
              fontSize: '0.9rem',
              fontStyle: msg.is_deleted ? 'italic' : 'normal',
              color: msg.is_deleted ? 'var(--color-text-muted)' : 'var(--color-text)',
              maxWidth: '80%',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          type="text"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message group…"
          disabled={sending}
          style={{ flex: 1 }}
        />
        <button onClick={handleSend} disabled={!input.trim() || sending} className="btn btn--primary" style={{ width: 'auto', padding: '0 16px', flexShrink: 0 }}>➤</button>
      </div>

      {/* Report sheet */}
      {reportTarget && (
        <div className="overlay" onClick={() => setReportTarget(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <p>Your report has been submitted. Thank you.</p>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: 16 }}>Report message</h3>
                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                  "{reportTarget.content?.slice(0, 100)}"
                </div>
                <label className="label">Reason</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginBottom: 16 }}>
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" name="reason" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} style={{ accentColor: 'var(--color-primary)' }} />
                      {r.label}
                    </label>
                  ))}
                </div>
                <button className="btn btn--danger" onClick={handleReport} disabled={!reportReason || reporting}>
                  {reporting ? 'Submitting…' : 'Submit Report'}
                </button>
                <button className="btn btn--muted" style={{ marginTop: 8 }} onClick={() => setReportTarget(null)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
