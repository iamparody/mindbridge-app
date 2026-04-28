const express = require('express');
const { query } = require('../db');
const adminAuth = require('../middleware/adminAuth');

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

module.exports = router;
