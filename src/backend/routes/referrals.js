const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');

const router = express.Router();

const VALID_PREFERRED_TIMES = ['morning', 'afternoon', 'evening'];
const VALID_CONTACT_METHODS = ['in_app', 'phone'];

// ─── POST /referrals ──────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { struggles, preferred_time, contact_method, contact_detail, specific_needs } = req.body;

  if (!struggles || typeof struggles !== 'string' || struggles.trim().length === 0) {
    return res.status(400).json({ error: 'struggles is required', code: 'MISSING_STRUGGLES' });
  }
  if (!VALID_PREFERRED_TIMES.includes(preferred_time)) {
    return res.status(400).json({ error: `preferred_time must be one of: ${VALID_PREFERRED_TIMES.join(', ')}`, code: 'INVALID_PREFERRED_TIME' });
  }
  if (!VALID_CONTACT_METHODS.includes(contact_method)) {
    return res.status(400).json({ error: `contact_method must be one of: ${VALID_CONTACT_METHODS.join(', ')}`, code: 'INVALID_CONTACT_METHOD' });
  }

  // Encrypt phone number if provided
  const encryptedDetail = contact_method === 'phone' && contact_detail
    ? encrypt(contact_detail)
    : null;

  const { rows } = await query(
    `INSERT INTO therapist_referrals
       (user_id, struggles, preferred_time, contact_method, contact_detail, specific_needs)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [req.user.id, struggles.trim(), preferred_time, contact_method, encryptedDetail, specific_needs || null]
  );

  // Notify all admins
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel)
     SELECT id, 'therapist_referral_update', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
    [JSON.stringify({ referral_id: rows[0].id, status: 'pending' })]
  );

  return res.status(201).json({ referral_id: rows[0].id });
});

// ─── GET /referrals/my ────────────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT id, struggles, preferred_time, contact_method, status, admin_notes, created_at, updated_at
     FROM therapist_referrals WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  return res.status(200).json({ referrals: rows });
});

module.exports = router;
