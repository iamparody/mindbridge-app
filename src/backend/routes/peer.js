const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const { escalatePeerRequest } = require('../jobs/peerEscalation');
const { ICE_SERVERS } = require('../ws/signaling');

const router = express.Router();

// In-process escalation timers: { [request_id]: Timeout }
const escalationTimers = new Map();

const VALID_CHANNELS = ['text', 'voice'];

// ─── POST /peer/request ───────────────────────────────────────────────────────
router.post('/request', auth, async (req, res) => {
  const { channel_preference } = req.body;

  if (!VALID_CHANNELS.includes(channel_preference)) {
    return res.status(400).json({
      error: `channel_preference must be one of: ${VALID_CHANNELS.join(', ')}`,
      code: 'INVALID_CHANNEL',
    });
  }

  // Credit gate — blueprint 6.4
  const { rows: creditRows } = await query(
    'SELECT balance FROM credits WHERE user_id = $1',
    [req.user.id]
  );
  if (!creditRows.length || creditRows[0].balance < 1) {
    return res.status(402).json({ error: 'Insufficient credits — top up to request peer support', code: 'INSUFFICIENT_CREDITS' });
  }

  const { rows: reqRows } = await query(
    `INSERT INTO peer_requests (user_id, channel_preference)
     VALUES ($1, $2) RETURNING id`,
    [req.user.id, channel_preference]
  );
  const requestId = reqRows[0].id;

  // Broadcast to all active members except requester — push + in-app
  const notifPayload = JSON.stringify({ request_id: requestId, channel_preference });
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'peer_request_broadcast', $1, 'push'
       FROM users WHERE id != $2 AND is_active = true AND role = 'member'`,
    [notifPayload, req.user.id]
  );
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'peer_request_broadcast', $1, 'in_app'
       FROM users WHERE id != $2 AND is_active = true AND role = 'member'`,
    [notifPayload, req.user.id]
  );

  // 90s escalation timer
  const timer = setTimeout(async () => {
    escalationTimers.delete(requestId);
    try { await escalatePeerRequest(requestId); } catch (e) { console.error('Escalation error:', e); }
  }, 90000);
  escalationTimers.set(requestId, timer);

  // Store request_id as the job identifier so the DB record is auditable
  await query(
    'UPDATE peer_requests SET escalation_job_id = $1, updated_at = NOW() WHERE id = $2',
    [requestId, requestId]
  );

  return res.status(201).json({ request_id: requestId });
});

// ─── GET /peer/requests/open ──────────────────────────────────────────────────
router.get('/requests/open', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT id, channel_preference, created_at
     FROM peer_requests
     WHERE status = 'open' AND user_id != $1
     ORDER BY created_at ASC`,
    [req.user.id]
  );
  return res.status(200).json({ requests: rows });
});

// ─── PATCH /peer/request/:id/accept ──────────────────────────────────────────
router.patch('/request/:id/accept', auth, async (req, res) => {
  // Atomic lock — only succeeds if status is still 'open'
  const { rows: locked, rowCount } = await query(
    `UPDATE peer_requests
        SET status = 'locked', accepted_by = $1, updated_at = NOW()
      WHERE id = $2 AND status = 'open'
      RETURNING id, channel_preference, user_id`,
    [req.user.id, req.params.id]
  );

  if (!rowCount) {
    // Either not found or already accepted/escalated
    const { rows: check } = await query('SELECT status, user_id FROM peer_requests WHERE id = $1', [req.params.id]);
    if (!check.length) return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    if (check[0].user_id === req.user.id) return res.status(403).json({ error: 'Cannot accept your own request', code: 'FORBIDDEN' });
    return res.status(409).json({ error: 'Request is no longer open', code: 'REQUEST_UNAVAILABLE' });
  }

  const { id: requestId, channel_preference, user_id: requesterId } = locked[0];

  // Own-request guard (belt-and-suspenders — the lock query doesn't catch this)
  if (requesterId === req.user.id) {
    await query(`UPDATE peer_requests SET status = 'open', accepted_by = NULL WHERE id = $1`, [requestId]);
    return res.status(403).json({ error: 'Cannot accept your own request', code: 'FORBIDDEN' });
  }

  // Cancel the 90s escalation timer
  const timer = escalationTimers.get(requestId);
  if (timer) { clearTimeout(timer); escalationTimers.delete(requestId); }

  // Create the session (user_id = requester)
  const { rows: sessionRows } = await query(
    `INSERT INTO sessions (user_id, type, channel, status, peer_request_id)
     VALUES ($1, 'peer', $2, 'active', $3) RETURNING id`,
    [requesterId, channel_preference, requestId]
  );
  const sessionId = sessionRows[0].id;

  // Activate the peer request with the session
  await query(
    `UPDATE peer_requests SET session_id = $1, status = 'active', updated_at = NOW() WHERE id = $2`,
    [sessionId, requestId]
  );

  // Notify requester — in-app only (blueprint: session_confirmation)
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     VALUES ($1, 'session_confirmation', $2, 'in_app')`,
    [requesterId, JSON.stringify({ session_id: sessionId, channel: channel_preference })]
  );

  return res.status(200).json({ session_id: sessionId });
});

// ─── PATCH /peer/request/:id/close ───────────────────────────────────────────
router.patch('/request/:id/close', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT pr.id, pr.session_id, pr.user_id, pr.accepted_by
     FROM peer_requests pr WHERE pr.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });

  const { session_id, user_id: requesterId, accepted_by: responderId } = rows[0];

  if (req.user.id !== requesterId && req.user.id !== responderId) {
    return res.status(403).json({ error: 'Not a participant in this session', code: 'FORBIDDEN' });
  }

  const { rows: sessionRows } = await query(
    `UPDATE sessions SET status = 'completed', ended_at = NOW()
     WHERE id = $1 RETURNING ended_at`,
    [session_id]
  );

  await query(
    `UPDATE peer_requests SET status = 'closed', updated_at = NOW() WHERE id = $1`,
    [req.params.id]
  );

  return res.status(200).json({ ended_at: sessionRows[0]?.ended_at });
});

// ─── GET /peer/session/:id ────────────────────────────────────────────────────
router.get('/session/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.type, s.channel, s.status, s.credit_cost, s.started_at, s.ended_at,
            pr.channel_preference, pr.user_id AS requester_id, pr.accepted_by AS responder_id
     FROM sessions s
     JOIN peer_requests pr ON pr.session_id = s.id
     WHERE s.id = $1 AND s.type = 'peer'
       AND (s.user_id = $2 OR pr.accepted_by = $2)`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });

  const session = rows[0];
  return res.status(200).json({ session, ice_servers: ICE_SERVERS });
});

module.exports = router;
