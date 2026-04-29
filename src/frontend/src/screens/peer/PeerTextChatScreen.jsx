import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const TEXT_CREDIT_INTERVAL = 15 * 60 * 1000; // 1 credit per 15 min

export default function PeerTextChatScreen() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [peerLeft, setPeerLeft] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const creditTimerRef = useRef(null);

  const deductCredit = useCallback(async () => {
    try {
      const { data } = await client.post('/api/credits/deduct', { session_id: sessionId, channel: 'text' });
      setBalance(data.balance);
      if (data.blocked) {
        setError('Out of credits. Session ended.');
        handleEndSession();
      }
    } catch { /* non-fatal */ }
  }, [sessionId]);

  const requestIdRef = useRef(null);

  const handleEndSession = useCallback(async () => {
    clearInterval(creditTimerRef.current);
    wsRef.current?.close();
    const reqId = requestIdRef.current;
    if (reqId) {
      try { await client.patch(`/api/peer/request/${reqId}/close`); } catch { /* best-effort */ }
    }
    navigate('/peer', { replace: true });
  }, [navigate]);

  useEffect(() => {
    async function init() {
      try {
        const { data } = await client.get(`/api/peer/session/${sessionId}`);
        requestIdRef.current = data.session?.request_id ?? null;
        setBalance(data.credit_balance ?? null);
        const ws = new WebSocket(`${WS_URL}/ws/signal?session=${sessionId}`);
        wsRef.current = ws;
        ws.onopen = () => {
          setConnected(true);
          ws.send(JSON.stringify({ type: 'join', session_id: sessionId }));
        };
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === 'chat') {
            setMessages((prev) => [...prev, { from: 'peer', text: msg.text, ts: msg.ts || Date.now() }]);
          } else if (msg.type === 'peer_left') {
            setPeerLeft(true);
          }
        };
        ws.onclose = () => setConnected(false);
        creditTimerRef.current = setInterval(deductCredit, TEXT_CREDIT_INTERVAL);
      } catch {
        setError('Could not connect to session.');
      }
    }
    init();
    return () => {
      clearInterval(creditTimerRef.current);
      wsRef.current?.close();
    };
  }, [sessionId, deductCredit]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const text = input.trim();
    wsRef.current.send(JSON.stringify({ type: 'chat', text, session_id: sessionId }));
    setMessages((prev) => [...prev, { from: 'me', text, ts: Date.now() }]);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (error) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>{error}</p>
        <button className="btn btn--primary" onClick={() => navigate('/peer')}>Back</button>
      </div>
    );
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-surface-card)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>💬 Peer Chat</div>
          <div style={{ fontSize: '0.7rem', color: connected ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {peerLeft ? 'Peer has left' : connected ? 'Connected' : 'Connecting…'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {balance !== null && (
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: balance < 2 ? 'var(--color-emergency)' : 'var(--color-text)' }}>
              {balance} cr
            </span>
          )}
          <button onClick={handleEndSession} style={{ background: 'var(--color-danger)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            End
          </button>
        </div>
      </div>

      {peerLeft && (
        <div className="info-banner info-banner--warning" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', textAlign: 'center', fontSize: '0.85rem' }}>
          Your peer has left the session.
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && !peerLeft && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 24, fontSize: '0.9rem' }}>
            You are connected. Neither party can see the other's identity.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.from === 'me' ? 'bubble--user' : 'bubble--peer'}`}>
            {msg.text}
            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>
              {msg.from === 'me' ? 'You' : 'Peer'} · {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'var(--color-surface-card)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <textarea
          className="textarea"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={peerLeft || !connected}
          style={{ resize: 'none', flex: 1 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !connected || peerLeft}
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
