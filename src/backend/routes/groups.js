const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const cache = require('../services/cache');

const router = express.Router();

const VALID_REASONS = ['harmful_content', 'abuse', 'spam', 'other'];
const MAX_MSG_LEN = 1000;
const { stripHtml } = require('../utils/sanitizer');

// Helper: verify active membership for a user in a group
async function getActiveMembership(group_id, user_id) {
  const { rows } = await query(
    `SELECT id FROM group_memberships
     WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
    [group_id, user_id]
  );
  return rows[0] || null;
}

// ─── GET /groups ──────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const cached = await cache.get('groups:list');
  if (cached) return res.status(200).json(cached);

  const { rows } = await query(
    `SELECT g.id, g.name, g.condition_category, g.description, g.is_active,
            COUNT(gm.id) FILTER (WHERE gm.status = 'active') AS member_count
     FROM groups g
     LEFT JOIN group_memberships gm ON gm.group_id = g.id
     WHERE g.is_active = true
     GROUP BY g.id
     ORDER BY g.name ASC`
  );
  const result = { groups: rows };
  await cache.set('groups:list', result, 300);
  return res.status(200).json(result);
});

// ─── GET /groups/:id ──────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  const { rows: groupRows } = await query(
    `SELECT g.id, g.name, g.condition_category, g.description, g.is_active,
            COUNT(gm.id) FILTER (WHERE gm.status = 'active') AS member_count
     FROM groups g
     LEFT JOIN group_memberships gm ON gm.group_id = g.id
     WHERE g.id = $1 AND g.is_active = true
     GROUP BY g.id`,
    [req.params.id]
  );
  if (!groupRows.length) return res.status(404).json({ error: 'Group not found', code: 'NOT_FOUND' });

  const { rows: memberRows } = await query(
    'SELECT status FROM group_memberships WHERE group_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  const membership = memberRows[0] || null;

  return res.status(200).json({
    group: groupRows[0],
    is_member: membership?.status === 'active',
    membership_status: membership?.status || null,
  });
});

// ─── POST /groups/:id/join ────────────────────────────────────────────────────
router.post('/:id/join', auth, async (req, res) => {
  if (!req.body.agreement_confirmed) {
    return res.status(400).json({ error: 'agreement_confirmed must be true', code: 'AGREEMENT_REQUIRED' });
  }

  const { rows: groupRows } = await query('SELECT id FROM groups WHERE id = $1 AND is_active = true', [req.params.id]);
  if (!groupRows.length) return res.status(404).json({ error: 'Group not found', code: 'NOT_FOUND' });

  // Check for existing ban
  const { rows: banRows } = await query(
    `SELECT id FROM group_bans
     WHERE group_id = $1 AND user_id = $2 AND (expires_at IS NULL OR expires_at > NOW())`,
    [req.params.id, req.user.id]
  );
  if (banRows.length) return res.status(403).json({ error: 'You are banned from this group', code: 'BANNED' });

  // Check existing membership
  const { rows: existing } = await query(
    'SELECT id, status FROM group_memberships WHERE group_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (existing.length && existing[0].status === 'active') {
    return res.status(409).json({ error: 'Already a member', code: 'ALREADY_MEMBER' });
  }

  // UPSERT — re-join if previously left
  const { rows } = await query(
    `INSERT INTO group_memberships (group_id, user_id, status, agreed_at)
     VALUES ($1, $2, 'active', NOW())
     ON CONFLICT (group_id, user_id) DO UPDATE
       SET status = 'active', agreed_at = NOW()
     RETURNING id`,
    [req.params.id, req.user.id]
  );
  return res.status(201).json({ membership_id: rows[0].id });
});

// ─── POST /groups/:id/leave ───────────────────────────────────────────────────
router.post('/:id/leave', auth, async (req, res) => {
  const { rowCount } = await query(
    `UPDATE group_memberships SET status = 'left'
     WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
    [req.params.id, req.user.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Active membership not found', code: 'NOT_MEMBER' });
  return res.status(200).json({ left: true });
});

// ─── GET /groups/:id/messages ─────────────────────────────────────────────────
router.get('/:id/messages', auth, async (req, res) => {
  if (!(await getActiveMembership(req.params.id, req.user.id))) {
    return res.status(403).json({ error: 'Not a member of this group', code: 'NOT_MEMBER' });
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
  const offset = (page - 1) * limit;

  // Pinned messages — all of them, shown fixed at top
  const { rows: pinned } = await query(
    `SELECT gm.id, u.alias,
            CASE WHEN gm.is_deleted THEN '[deleted]' ELSE gm.content END AS content,
            gm.is_pinned, gm.is_deleted, gm.created_at
     FROM group_messages gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1 AND gm.is_pinned = true
     ORDER BY gm.created_at DESC`,
    [req.params.id]
  );

  // Non-pinned paginated messages
  const { rows: messages } = await query(
    `SELECT gm.id, u.alias,
            CASE WHEN gm.is_deleted THEN '[deleted]' ELSE gm.content END AS content,
            gm.is_pinned, gm.is_deleted, gm.created_at
     FROM group_messages gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1 AND gm.is_pinned = false
     ORDER BY gm.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.params.id, limit, offset]
  );
  const { rows: countRows } = await query(
    'SELECT COUNT(*) FROM group_messages WHERE group_id = $1 AND is_pinned = false',
    [req.params.id]
  );
  const total = parseInt(countRows[0].count);

  return res.status(200).json({ messages, pinned, total, page, pages: Math.ceil(total / limit) });
});

// ─── POST /groups/:id/messages ────────────────────────────────────────────────
router.post('/:id/messages', auth, async (req, res) => {
  if (!(await getActiveMembership(req.params.id, req.user.id))) {
    return res.status(403).json({ error: 'Not a member of this group', code: 'NOT_MEMBER' });
  }

  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' });
  }
  const cleanContent = stripHtml(content);
  if (cleanContent.length === 0) {
    return res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' });
  }
  if (cleanContent.length > MAX_MSG_LEN) {
    return res.status(400).json({ error: `Message must be ${MAX_MSG_LEN} characters or fewer`, code: 'CONTENT_TOO_LONG' });
  }

  const { rows } = await query(
    'INSERT INTO group_messages (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
    [req.params.id, req.user.id, cleanContent]
  );
  const messageId = rows[0].id;

  // Notify all active members with notif_group_messages=true except poster
  const payload = JSON.stringify({ group_id: req.params.id, message_id: messageId });
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT u.id, 'group_message', $1, 'in_app'
       FROM group_memberships gm
       JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = $2
        AND gm.status = 'active'
        AND gm.user_id != $3
        AND u.notif_group_messages = true`,
    [payload, req.params.id, req.user.id]
  );

  return res.status(201).json({ message_id: messageId });
});

// ─── POST /groups/:id/messages/:msgId/report ──────────────────────────────────
router.post('/:id/messages/:msgId/report', auth, async (req, res) => {
  const { reason, details } = req.body;
  if (!VALID_REASONS.includes(reason)) {
    return res.status(400).json({
      error: `reason must be one of: ${VALID_REASONS.join(', ')}`,
      code: 'INVALID_REASON',
    });
  }

  // Confirm message belongs to this group
  const { rows: msgRows } = await query(
    'SELECT user_id FROM group_messages WHERE id = $1 AND group_id = $2',
    [req.params.msgId, req.params.id]
  );
  if (!msgRows.length) return res.status(404).json({ error: 'Message not found', code: 'NOT_FOUND' });

  const reportedUserId = msgRows[0].user_id;

  const { rows } = await query(
    `INSERT INTO group_reports
       (group_id, reported_user_id, reported_by, message_id, reason, details)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [req.params.id, reportedUserId, req.user.id, req.params.msgId, reason, details || null]
  );

  // Alert admins — in-app
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'emergency_alert', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
    [JSON.stringify({ source: 'group_report', report_id: rows[0].id, group_id: req.params.id })]
  );

  return res.status(201).json({ report_id: rows[0].id });
});

module.exports = router;
