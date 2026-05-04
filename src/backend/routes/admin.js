const express = require('express');
const { query } = require('../db');
const adminAuth = require('../middleware/adminAuth');
const cache = require('../services/cache');

const router = express.Router();

// All routes in this file require admin role verified from DB.
router.use(adminAuth);

// ─── GET /admin/reports ───────────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  const { rows } = await query(
    `SELECT gr.id, gr.reason, gr.details, gr.status, gr.created_at,
            g.name AS group_name,
            ru.alias AS reported_alias,
            rb.alias AS reporter_alias,
            gm.content AS message_preview
     FROM group_reports gr
     JOIN groups g ON g.id = gr.group_id
     JOIN users ru ON ru.id = gr.reported_user_id
     JOIN users rb ON rb.id = gr.reported_by
     LEFT JOIN group_messages gm ON gm.id = gr.message_id
     WHERE gr.status = 'pending'
     ORDER BY gr.created_at ASC`
  );
  return res.status(200).json({ reports: rows });
});

// ─── PATCH /admin/emergency/:id/acknowledge ───────────────────────────────────
router.patch('/emergency/:id/acknowledge', async (req, res) => {
  const { rows } = await query(
    `UPDATE emergency_logs
        SET status = 'acknowledged', acknowledged_at = NOW(), handled_by = $1
      WHERE id = $2 AND status = 'open'
      RETURNING acknowledged_at`,
    [req.user.id, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Log not found or already acknowledged', code: 'NOT_FOUND' });
  return res.status(200).json({ acknowledged_at: rows[0].acknowledged_at });
});

// ─── PATCH /admin/emergency/:id/resolve ──────────────────────────────────────
router.patch('/emergency/:id/resolve', async (req, res) => {
  const { rows } = await query(
    `UPDATE emergency_logs
        SET status = 'resolved', resolved_at = NOW()
      WHERE id = $1 AND status IN ('open', 'acknowledged')
      RETURNING resolved_at`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Log not found or already resolved', code: 'NOT_FOUND' });
  return res.status(200).json({ resolved_at: rows[0].resolved_at });
});

// ─── PATCH /admin/reports/:id/action ─────────────────────────────────────────
router.patch('/reports/:id/action', async (req, res) => {
  const { action, admin_notes } = req.body;
  if (!['warn', 'ban', 'dismiss'].includes(action)) {
    return res.status(400).json({ error: 'action must be one of: warn, ban, dismiss', code: 'INVALID_ACTION' });
  }

  const { rows: reportRows } = await query(
    `SELECT gr.id, gr.group_id, gr.reported_user_id, gr.status
     FROM group_reports gr WHERE gr.id = $1`,
    [req.params.id]
  );
  if (!reportRows.length) return res.status(404).json({ error: 'Report not found', code: 'NOT_FOUND' });
  if (reportRows[0].status !== 'pending') {
    return res.status(409).json({ error: 'Report already actioned', code: 'ALREADY_REVIEWED' });
  }

  const { group_id, reported_user_id } = reportRows[0];

  if (action === 'warn') {
    await query(
      `UPDATE group_reports
          SET status = 'actioned', admin_action = 'warn', admin_notes = $1, reviewed_at = NOW()
        WHERE id = $2`,
      [admin_notes || null, req.params.id]
    );
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       VALUES ($1, 'group_warning', $2, 'in_app')`,
      [reported_user_id, JSON.stringify({ group_id, admin_notes })]
    );
  } else if (action === 'ban') {
    const banReason = admin_notes || 'Community guidelines violation';
    // Write ban record
    await query(
      `INSERT INTO group_bans (group_id, user_id, reason, banned_by)
       VALUES ($1, $2, $3, $4)`,
      [group_id, reported_user_id, banReason, req.user.id]
    );
    // Revoke membership
    await query(
      `UPDATE group_memberships SET status = 'banned'
       WHERE group_id = $1 AND user_id = $2`,
      [group_id, reported_user_id]
    );
    // Action the report
    await query(
      `UPDATE group_reports
          SET status = 'actioned', admin_action = 'ban', admin_notes = $1, reviewed_at = NOW()
        WHERE id = $2`,
      [admin_notes || null, req.params.id]
    );
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       VALUES ($1, 'group_warning', $2, 'in_app')`,
      [reported_user_id, JSON.stringify({ group_id, admin_notes: banReason, action: 'ban' })]
    );
  } else {
    // dismiss
    await query(
      `UPDATE group_reports
          SET status = 'dismissed', admin_action = 'dismiss', admin_notes = $1, reviewed_at = NOW()
        WHERE id = $2`,
      [admin_notes || null, req.params.id]
    );
  }

  return res.status(200).json({ action_taken: action });
});

// ─── GET /admin/emergency-queue ───────────────────────────────────────────────
router.get('/emergency-queue', async (req, res) => {
  const { rows } = await query(
    `SELECT el.id, el.status, el.trigger_type, el.triggered_at, el.acknowledged_at,
            u.alias
     FROM emergency_logs el
     JOIN users u ON u.id = el.user_id
     WHERE el.status IN ('open', 'acknowledged')
     ORDER BY el.triggered_at ASC`
  );
  return res.status(200).json({ queue: rows });
});

// ─── GET /admin/escalations ───────────────────────────────────────────────────
router.get('/escalations', async (req, res) => {
  const { rows } = await query(
    `SELECT pr.id, pr.channel_preference, pr.escalated_at, pr.created_at,
            u.alias
     FROM peer_requests pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.status = 'escalated'
     ORDER BY pr.escalated_at ASC`
  );
  return res.status(200).json({ escalations: rows });
});

// ─── GET /admin/referrals ─────────────────────────────────────────────────────
router.get('/referrals', async (req, res) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (req.query.status) {
    conditions.push(`tr.status = $${idx++}`);
    params.push(req.query.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT tr.id, tr.struggles, tr.preferred_time, tr.contact_method,
            tr.status, tr.admin_notes, tr.created_at, tr.updated_at,
            u.alias
     FROM therapist_referrals tr
     JOIN users u ON u.id = tr.user_id
     ${where}
     ORDER BY tr.created_at ASC`,
    params
  );
  return res.status(200).json({ referrals: rows });
});

// ─── PATCH /admin/referrals/:id ───────────────────────────────────────────────
const VALID_REFERRAL_STATUSES = ['pending', 'in_review', 'arranged', 'escalated', 'closed'];
router.patch('/referrals/:id', async (req, res) => {
  const { status, admin_notes } = req.body;

  if (status !== undefined && !VALID_REFERRAL_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_REFERRAL_STATUSES.join(', ')}`, code: 'INVALID_STATUS' });
  }

  const { rows: refRows } = await query(
    'SELECT user_id FROM therapist_referrals WHERE id = $1',
    [req.params.id]
  );
  if (!refRows.length) return res.status(404).json({ error: 'Referral not found', code: 'NOT_FOUND' });

  const setClauses = ['updated_at = NOW()'];
  const params = [];
  let idx = 1;

  if (status !== undefined)      { setClauses.push(`status = $${idx++}`);      params.push(status); }
  if (admin_notes !== undefined) { setClauses.push(`admin_notes = $${idx++}`); params.push(admin_notes); }

  params.push(req.params.id);
  await query(
    `UPDATE therapist_referrals SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );

  // Notify user of status update
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     VALUES ($1, 'therapist_referral_update', $2, 'in_app')`,
    [refRows[0].user_id, JSON.stringify({ referral_id: req.params.id, status, admin_notes })]
  );

  return res.status(200).json({ updated: true });
});

// ─── GET /admin/risk-flags ────────────────────────────────────────────────────
router.get('/risk-flags', async (req, res) => {
  const { rows } = await query(
    `SELECT alias, risk_level, updated_at
     FROM users WHERE risk_level IN ('high', 'critical') AND is_active = true
     ORDER BY risk_level DESC, updated_at DESC`
  );
  return res.status(200).json({ flagged_users: rows });
});

// ─── POST /admin/users/:alias/message ────────────────────────────────────────
router.post('/users/:alias/message', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required', code: 'MISSING_MESSAGE' });
  }

  const { rows } = await query('SELECT id FROM users WHERE alias = $1', [req.params.alias]);
  if (!rows.length) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });

  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     VALUES ($1, 'emergency_alert', $2, 'in_app')`,
    [rows[0].id, JSON.stringify({ admin_message: message.trim() })]
  );
  return res.status(200).json({ sent: true });
});

// ─── GET /admin/resources ─────────────────────────────────────────────────────
router.get('/resources', async (req, res) => {
  const { rows } = await query(
    `SELECT id, title, category, estimated_read_minutes, tags, status, published_at, created_at, updated_at
     FROM psychoeducation_articles
     ORDER BY updated_at DESC`
  );
  return res.status(200).json({ articles: rows });
});

// ─── POST /admin/resources ────────────────────────────────────────────────────
router.post('/resources', async (req, res) => {
  const { title, category, content, estimated_read_minutes, tags } = req.body;
  if (!title || !category || !content || !estimated_read_minutes) {
    return res.status(400).json({ error: 'title, category, content, and estimated_read_minutes are required', code: 'MISSING_FIELDS' });
  }

  const { rows } = await query(
    `INSERT INTO psychoeducation_articles
       (title, category, content, estimated_read_minutes, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [title, category, content, estimated_read_minutes, tags || null, req.user.id]
  );
  return res.status(201).json({ article_id: rows[0].id });
});

// ─── PATCH /admin/resources/:id ───────────────────────────────────────────────
router.patch('/resources/:id', async (req, res) => {
  const { title, category, content, estimated_read_minutes, tags } = req.body;
  const setClauses = ['updated_at = NOW()'];
  const params = [];
  let idx = 1;

  if (title                  !== undefined) { setClauses.push(`title = $${idx++}`);                  params.push(title); }
  if (category               !== undefined) { setClauses.push(`category = $${idx++}`);               params.push(category); }
  if (content                !== undefined) { setClauses.push(`content = $${idx++}`);                params.push(content); }
  if (estimated_read_minutes !== undefined) { setClauses.push(`estimated_read_minutes = $${idx++}`); params.push(estimated_read_minutes); }
  if (tags                   !== undefined) { setClauses.push(`tags = $${idx++}`);                   params.push(tags); }

  if (params.length === 0) {
    return res.status(400).json({ error: 'No fields to update', code: 'MISSING_FIELDS' });
  }

  params.push(req.params.id);
  const { rowCount } = await query(
    `UPDATE psychoeducation_articles SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );
  if (!rowCount) return res.status(404).json({ error: 'Article not found', code: 'NOT_FOUND' });
  await cache.delPattern('resources:');
  return res.status(200).json({ updated: true });
});

// ─── PATCH /admin/resources/:id/publish ──────────────────────────────────────
router.patch('/resources/:id/publish', async (req, res) => {
  const { rowCount } = await query(
    `UPDATE psychoeducation_articles
        SET status = 'published', published_at = NOW(), updated_at = NOW()
      WHERE id = $1`,
    [req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Article not found', code: 'NOT_FOUND' });
  await cache.delPattern('resources:');
  return res.status(200).json({ published: true });
});

// ─── PATCH /admin/resources/:id/archive ──────────────────────────────────────
router.patch('/resources/:id/archive', async (req, res) => {
  const { rowCount } = await query(
    `UPDATE psychoeducation_articles SET status = 'archived', updated_at = NOW() WHERE id = $1`,
    [req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Article not found', code: 'NOT_FOUND' });
  await cache.delPattern('resources:');
  return res.status(200).json({ archived: true });
});

// ─── GET /admin/feedback ─────────────────────────────────────────────────────
router.get('/feedback', async (req, res) => {
  const { rows: avgRows } = await query(
    `SELECT type, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS count
     FROM feedback WHERE rating IS NOT NULL
     GROUP BY type ORDER BY type`
  );
  const { rows: comments } = await query(
    `SELECT type, rating, comment, created_at
     FROM feedback WHERE comment IS NOT NULL
     ORDER BY created_at DESC LIMIT 20`
  );
  return res.status(200).json({ averages: avgRows, recent_comments: comments });
});

// ─── GET /admin/stats ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [dau, checkins, peerSessions, aiSessions, creditsPurchased] = await Promise.all([
    query(`SELECT COUNT(DISTINCT user_id) AS count FROM moods WHERE created_at::date = $1`, [today]),
    query(`SELECT COUNT(*) AS count FROM moods WHERE created_at::date = $1`, [today]),
    query(`SELECT COUNT(*) AS count FROM sessions WHERE type = 'peer' AND started_at::date = $1`, [today]),
    query(`SELECT COUNT(*) AS count FROM sessions WHERE type = 'ai' AND started_at::date = $1`, [today]),
    query(`SELECT COALESCE(SUM(amount_credits), 0) AS total FROM credit_transactions WHERE type = 'purchase' AND status = 'confirmed' AND created_at::date = $1`, [today]),
  ]);

  return res.status(200).json({
    date: today,
    daily_active_users: parseInt(dau.rows[0].count),
    checkins_today: parseInt(checkins.rows[0].count),
    peer_sessions_today: parseInt(peerSessions.rows[0].count),
    ai_sessions_today: parseInt(aiSessions.rows[0].count),
    credits_purchased_today: parseInt(creditsPurchased.rows[0].total),
  });
});

module.exports = router;
