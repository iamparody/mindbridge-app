const { WebSocketServer, WebSocket } = require('ws');

// In-process room map: session_id → WebSocket[]
// Rooms have at most 2 peers (requester + responder).
const rooms = new Map();

function createSignalingServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/signal' });

  wss.on('connection', (ws) => {
    let sessionId = null;

    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data); } catch { return; }

      // First message must be a join with session_id — no user identity transmitted
      if (!sessionId) {
        if (msg.type !== 'join' || !msg.session_id) { ws.close(); return; }
        sessionId = msg.session_id;

        if (!rooms.has(sessionId)) rooms.set(sessionId, []);
        const peers = rooms.get(sessionId);

        if (peers.length >= 2) { ws.close(); return; }
        peers.push(ws);

        ws.on('close', () => {
          const current = rooms.get(sessionId);
          if (!current) return;
          const remaining = current.filter((c) => c !== ws);
          if (remaining.length === 0) rooms.delete(sessionId);
          else rooms.set(sessionId, remaining);
        });

        ws.send(JSON.stringify({ type: 'joined', peer_count: peers.length }));
        return;
      }

      // Relay offer / answer / ICE candidates to the other peer — no identity forwarded
      const peers = rooms.get(sessionId) || [];
      for (const peer of peers) {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
          peer.send(JSON.stringify(msg));
        }
      }
    });
  });

  return wss;
}

// STUN configuration to expose to clients via the session endpoint
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  // TURN server configured via env: TURN_URL, TURN_USERNAME, TURN_CREDENTIAL
  ...(process.env.TURN_URL
    ? [{ urls: process.env.TURN_URL, username: process.env.TURN_USERNAME, credential: process.env.TURN_CREDENTIAL }]
    : []),
];

module.exports = { createSignalingServer, ICE_SERVERS };
