import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function AIChatScreen() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [personaName, setPersonaName] = useState('Your companion');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [startError, setStartError] = useState('');
  const [sendError, setSendError] = useState('');
  const [showEnd, setShowEnd] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ending, setEnding] = useState(false);
  const [emergencyPushed, setEmergencyPushed] = useState(false);
  const bottomRef = useRef(null);

  const startSession = useCallback(async () => {
    setStarting(true);
    setStartError('');
    try {
      const { data } = await client.post('/api/ai/session/start');
      setSessionId(data.session_id);
      setPersonaName(data.persona_name || 'Your companion');
      setMessages([{ role: 'assistant', content: data.greeting || `Hello. I'm ${data.persona_name || 'your companion'}. How are you feeling today?` }]);
    } catch (err) {
      setStartError(err.response?.data?.error || 'Could not start session. Please try again.');
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => { startSession(); }, [startSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading || !sessionId) return;
    const text = input.trim();
    setInput('');
    setSendError('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await client.post(`/api/ai/session/${sessionId}/message`, { input_text: text });
      if (data.action === 'emergency') {
        setEmergencyPushed(true);
        navigate('/emergency', { replace: true });
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response_text }]);
    } catch (err) {
      setSendError(err.response?.data?.error || 'Message failed. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    if (!sessionId || ending) return;
    setEnding(true);
    try {
      await client.post(`/api/ai/session/${sessionId}/end`, { rating: rating || undefined, feedback: feedback.trim() || undefined });
    } catch { /* non-fatal */ }
    navigate('/dashboard', { replace: true });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (starting) {
    return (
      <div className="loading-full">
        <div className="spinner" />
      </div>
    );
  }

  if (startError) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>{startError}</p>
        <button className="btn btn--primary" onClick={startSession}>Try Again</button>
        <button className="btn btn--muted" style={{ marginTop: 8 }} onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    );
  }

  if (showEnd && !emergencyPushed) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💙</div>
          <h2>How did that feel?</h2>
          <p style={{ marginTop: 4 }}>Your feedback helps improve your experience</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', opacity: s <= rating ? 1 : 0.3 }}
            >
              ⭐
            </button>
          ))}
        </div>
        <textarea
          className="textarea"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Anything you'd like to share? (optional)"
          style={{ marginBottom: 16 }}
        />
        <button className="btn btn--primary" onClick={handleEnd} disabled={ending}>
          {ending ? 'Ending…' : 'Done'}
        </button>
        <button className="btn btn--muted" style={{ marginTop: 8 }} onClick={handleEnd} disabled={ending}>
          Skip
        </button>
      </div>
    );
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Talking with {personaName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>AI companion · Free · Always available</div>
          </div>
        </div>
        <button
          onClick={() => setShowEnd(true)}
          style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
        >
          End Chat
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-white)',
              color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px',
              boxShadow: 'var(--shadow)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--color-white)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Thinking…</span>
          </div>
        )}
        {sendError && <div className="error-msg">{sendError}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <textarea
          className="textarea"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={loading}
          style={{ resize: 'none', flex: 1 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="btn btn--primary"
          style={{ width: 'auto', padding: '0 16px', flexShrink: 0 }}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
