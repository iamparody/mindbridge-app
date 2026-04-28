const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── POST /emergency/trigger ──────────────────────────────────────────────────
router.post('/trigger', auth, async (req, res) => {
  const { rows } = await query(
    `INSERT INTO emergency_logs (user_id, trigger_type)
     VALUES ($1, 'user_initiated') RETURNING id, triggered_at`,
    [req.user.id]
  );
  const { id: logId, triggered_at } = rows[0];

  // Immediate priority alert to all admins — push + in-app
  const payload = JSON.stringify({ log_id: logId, alias: req.user.alias, trigger_type: 'user_initiated' });
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'emergency_alert', $1, 'push'
       FROM users WHERE role = 'admin' AND is_active = true`,
    [payload]
  );
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'emergency_alert', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
    [payload]
  );

  return res.status(201).json({ log_id: logId, triggered_at });
});

module.exports = router;
