const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const VALID_TONES = ['warm', 'motivational', 'clinical', 'casual'];
const VALID_STYLES = ['brief', 'elaborate'];
const VALID_FORMALITY = ['formal', 'neutral', 'informal'];

const CURRENT_CONSENT_VERSION = '1.0';

// ─── POST /onboarding/consent ─────────────────────────────────────────────────
router.post('/consent', auth, async (req, res) => {
  const { consent_version } = req.body;

  if (consent_version !== CURRENT_CONSENT_VERSION) {
    return res.status(400).json({ error: `consent_version must be "${CURRENT_CONSENT_VERSION}"`, code: 'INVALID_CONSENT_VERSION' });
  }

  const { rows } = await query(
    `UPDATE users
     SET consent_version = $1, consented_at = NOW(), updated_at = NOW()
     WHERE id = $2
     RETURNING consented_at`,
    [CURRENT_CONSENT_VERSION, req.user.id]
  );

  return res.status(200).json({ consented_at: rows[0].consented_at });
});

// ─── POST /onboarding/persona ─────────────────────────────────────────────────
router.post('/persona', auth, async (req, res) => {
  const { rows: userRows } = await query(
    'SELECT persona_created FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!userRows.length) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
  if (userRows[0].persona_created) {
    return res.status(403).json({ error: 'Persona already created — it cannot be changed', code: 'PERSONA_IMMUTABLE' });
  }

  const { persona_name, tone, response_style, formality, uses_alias = true } = req.body;

  if (!persona_name || typeof persona_name !== 'string' || persona_name.trim().length === 0) {
    return res.status(400).json({ error: 'persona_name is required', code: 'MISSING_FIELD' });
  }
  if (persona_name.trim().length > 20) {
    return res.status(400).json({ error: 'persona_name must be 20 characters or fewer', code: 'PERSONA_NAME_TOO_LONG' });
  }
  if (!VALID_TONES.includes(tone)) {
    return res.status(400).json({ error: `tone must be one of: ${VALID_TONES.join(', ')}`, code: 'INVALID_TONE' });
  }
  if (!VALID_STYLES.includes(response_style)) {
    return res.status(400).json({ error: `response_style must be one of: ${VALID_STYLES.join(', ')}`, code: 'INVALID_RESPONSE_STYLE' });
  }
  if (!VALID_FORMALITY.includes(formality)) {
    return res.status(400).json({ error: `formality must be one of: ${VALID_FORMALITY.join(', ')}`, code: 'INVALID_FORMALITY' });
  }

  const { rows: personaRows } = await query(
    `INSERT INTO ai_personas (user_id, persona_name, tone, response_style, formality, uses_alias)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [req.user.id, persona_name.trim(), tone, response_style, formality, Boolean(uses_alias)]
  );

  await query(
    'UPDATE users SET persona_created = true, updated_at = NOW() WHERE id = $1',
    [req.user.id]
  );

  return res.status(201).json({ persona_id: personaRows[0].id });
});

// ─── GET /onboarding/status ───────────────────────────────────────────────────
router.get('/status', auth, async (req, res) => {
  const { rows: userRows } = await query(
    'SELECT consent_version, persona_created, signup_bonus_credited FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!userRows.length) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });

  const user = userRows[0];

  const { rows: moodRows } = await query(
    'SELECT 1 FROM moods WHERE user_id = $1 LIMIT 1',
    [req.user.id]
  );

  return res.status(200).json({
    consent: Boolean(user.consent_version),
    persona: user.persona_created,
    first_mood: moodRows.length > 0,
    signup_bonus: user.signup_bonus_credited,
  });
});

module.exports = router;
