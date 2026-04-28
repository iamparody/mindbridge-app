import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

const TIMEOUT_SECONDS = 90;

export default function PeerWaitingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(TIMEOUT_SECONDS);
  const [escalated, setEscalated] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    // Countdown timer
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setEscalated(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Poll for session acceptance
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await client.get(`/api/peer/session/${id}`).catch(() => ({ data: null }));
        if (data?.status === 'locked' && data?.session_id) {
          clearInterval(pollRef.current);
          clearInterval(intervalRef.current);
          navigate(`/peer/session/${data.session_id}/${data.channel || 'text'}`, { replace: true });
        }
        if (data?.status === 'escalated') {
          clearInterval(pollRef.current);
          clearInterval(intervalRef.current);
          setEscalated(true);
        }
      } catch { /* non-fatal polling failure */ }
    }, 3000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(pollRef.current);
    };
  }, [id, navigate]);

  async function handleCancel() {
    try {
      await client.patch(`/api/peer/request/${id}/close`);
    } catch { /* best-effort */ }
    navigate('/peer', { replace: true });
  }

  const pct = (seconds / TIMEOUT_SECONDS) * 100;
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  if (error) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>{error}</p>
        <button className="btn btn--primary" onClick={() => navigate('/peer')}>Back</button>
      </div>
    );
  }

  if (escalated) {
    return (
      <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>We're finding someone</h2>
        <p>No one responded in time. An admin has been notified and will follow up with you shortly.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
          <button className="btn btn--primary" onClick={() => navigate('/ai-chat')}>Talk to AI instead</button>
          <button className="btn btn--danger" onClick={() => navigate('/emergency')}>Emergency help</button>
          <button className="btn btn--muted" onClick={() => navigate('/dashboard')}>Go home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 32 }}>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-border)" strokeWidth={6} />
          <circle
            cx={50} cy={50} r={r} fill="none"
            stroke="var(--color-primary)" strokeWidth={6}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
          <text x={50} y={56} textAnchor="middle" fontSize={22} fontWeight={700} fill="var(--color-text)">{seconds}</text>
        </svg>
      </div>

      <h2 style={{ marginBottom: 8 }}>Looking for someone…</h2>
      <p>Hold tight. A peer is being matched to you right now.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 32 }}>
        <button className="btn btn--ghost" onClick={() => navigate('/ai-chat')}>Chat with AI instead</button>
        <button className="btn btn--muted" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}
