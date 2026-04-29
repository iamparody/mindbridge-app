import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const VOICE_CREDIT_INTERVAL = 5 * 60 * 1000; // 1 credit per 5 min

export default function PeerVoiceCallScreen() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [callState, setCallState] = useState('connecting'); // connecting | active | ended
  const [muted, setMuted] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const creditTimerRef = useRef(null);
  const isInitiator = useRef(false);

  const deductCredit = useCallback(async () => {
    try {
      const { data } = await client.post('/api/credits/deduct', { session_id: sessionId, channel: 'voice' });
      setBalance(data.balance);
      if (data.blocked) {
        setError('Out of credits. Call ended.');
        endCall();
      }
    } catch { /* non-fatal */ }
  }, [sessionId]);

  const requestIdRef = useRef(null);

  const endCall = useCallback(async () => {
    clearInterval(creditTimerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    wsRef.current?.close();
    const reqId = requestIdRef.current;
    if (reqId) {
      try { await client.patch(`/api/peer/request/${reqId}/close`); } catch { /* best-effort */ }
    }
    navigate('/peer', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let pc;
    async function init() {
      try {
        const { data } = await client.get(`/api/peer/session/${sessionId}`);
        requestIdRef.current = data.session?.request_id ?? null;
        setBalance(data.credit_balance ?? null);
        const iceServers = data.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = e.streams[0];
            remoteAudioRef.current.play().catch(() => {});
          }
          setCallState('active');
          creditTimerRef.current = setInterval(deductCredit, VOICE_CREDIT_INTERVAL);
        };

        const ws = new WebSocket(`${WS_URL}/ws/signal?session=${sessionId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join', session_id: sessionId }));
        };

        ws.onmessage = async (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === 'peer_joined') {
            isInitiator.current = true;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', sdp: offer, session_id: sessionId }));
          } else if (msg.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer, session_id: sessionId }));
          } else if (msg.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          } else if (msg.type === 'ice') {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
          } else if (msg.type === 'peer_left') {
            setCallState('ended');
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ice', candidate: e.candidate, session_id: sessionId }));
          }
        };

      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission is required for voice calls.');
        } else {
          setError('Could not establish voice call. Please try again.');
        }
      }
    }

    init();
    return () => {
      clearInterval(creditTimerRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pc?.close();
      wsRef.current?.close();
    };
  }, [sessionId, deductCredit]);

  function toggleMute() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted((m) => !m);
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
    <div className="screen screen--no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1A1A2E', minHeight: '100dvh', padding: 32 }}>
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

      <div style={{ textAlign: 'center', color: '#fff', marginBottom: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎙️</div>
        <h2 style={{ color: '#fff', marginBottom: 8 }}>
          {callState === 'connecting' ? 'Connecting…' : callState === 'active' ? 'Voice Call' : 'Call Ended'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          {callState === 'active' ? 'Anonymous · Peer' : callState === 'connecting' ? 'Establishing connection…' : 'Your peer has left the call'}
        </p>
        {balance !== null && (
          <div style={{ marginTop: 12, color: balance < 2 ? '#E74C3C' : 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>
            {balance} credit{balance !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <button
          onClick={toggleMute}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: '#fff', fontSize: 28, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🎙️'}
        </button>

        <button
          onClick={endCall}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-emergency)',
            border: 'none', color: '#fff', fontSize: 28,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(231,76,60,0.5)',
          }}
          aria-label="End call"
        >
          📵
        </button>
      </div>

      {callState === 'ended' && (
        <button className="btn btn--ghost" style={{ marginTop: 32, color: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/peer')}>
          Back
        </button>
      )}
    </div>
  );
}
