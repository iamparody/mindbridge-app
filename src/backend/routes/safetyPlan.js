const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();

function decryptContacts(contacts) {
  if (!contacts) return null;
  return contacts.map((c) => ({
    ...c,
    contact_detail: c.contact_detail ? decrypt(c.contact_detail) : null,
  }));
}

function encryptContacts(contacts) {
  if (!contacts) return null;
  return contacts.map((c) => ({
    ...c,
    contact_detail: c.contact_detail ? encrypt(c.contact_detail) : null,
  }));
}

// ─── GET /safety-plan ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM safety_plans WHERE user_id = $1', [req.user.id]);
  if (!rows.length) return res.status(200).json({ plan: null });
  const plan = { ...rows[0], contacts: decryptContacts(rows[0].contacts) };
  return res.status(200).json({ plan });
});

// ─── PUT /safety-plan ─────────────────────────────────────────────────────────
router.put('/', auth, async (req, res) => {
  const { warning_signs, helpful_things, things_to_avoid, contacts, emergency_resources, reason_to_continue } = req.body;

  if (contacts !== undefined) {
    if (!Array.isArray(contacts) || contacts.length > 3) {
      return res.status(400).json({ error: 'contacts must be an array of up to 3 items', code: 'INVALID_CONTACTS' });
    }
  }

  const encryptedContacts = contacts !== undefined ? encryptContacts(contacts) : undefined;

  // $1 always = user_id; additional params are the field values
  const params = [req.user.id];
  const setClauses = ['updated_at = NOW()'];
  let idx = 2;

  if (warning_signs       !== undefined) { setClauses.push(`warning_signs = $${idx++}`);       params.push(warning_signs); }
  if (helpful_things      !== undefined) { setClauses.push(`helpful_things = $${idx++}`);      params.push(helpful_things); }
  if (things_to_avoid     !== undefined) { setClauses.push(`things_to_avoid = $${idx++}`);     params.push(things_to_avoid); }
  if (encryptedContacts   !== undefined) { setClauses.push(`contacts = $${idx++}`);            params.push(JSON.stringify(encryptedContacts)); }
  if (emergency_resources !== undefined) { setClauses.push(`emergency_resources = $${idx++}`); params.push(emergency_resources); }
  if (reason_to_continue  !== undefined) { setClauses.push(`reason_to_continue = $${idx++}`);  params.push(reason_to_continue); }

  // INSERT user_id only; ON CONFLICT updates the provided fields
  const { rows } = await query(
    `INSERT INTO safety_plans (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET ${setClauses.join(', ')}
     RETURNING updated_at`,
    params
  );

  return res.status(200).json({ updated_at: rows[0].updated_at });
});

module.exports = router;
