const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const { classify } = require('../utils/riskClassifier');
const { stripHtml } = require('../utils/sanitizer');

const MAX_CONTENT_LEN = 10000;

const router = express.Router();

const VALID_MOOD_LEVELS = ['very_low', 'low', 'neutral', 'good', 'great'];
const VALID_TAGS = ['anxious','hopeful','overwhelmed','calm','lonely','grateful','angry','numb'];

// ─── POST /journals ───────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { content, mood_level, tags, mood_id } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' });
  }
  const cleanContent = stripHtml(content);
  if (cleanContent.length === 0) {
    return res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' });
  }
  if (cleanContent.length > MAX_CONTENT_LEN) {
    return res.status(400).json({ error: `content must be ${MAX_CONTENT_LEN} characters or fewer`, code: 'CONTENT_TOO_LONG' });
  }
  if (mood_level && !VALID_MOOD_LEVELS.includes(mood_level)) {
    return res.status(400).json({ error: 'Invalid mood_level', code: 'INVALID_MOOD_LEVEL' });
  }
  if (tags && (!Array.isArray(tags) || tags.some((t) => !VALID_TAGS.includes(t)))) {
    return res.status(400).json({ error: 'Invalid tags', code: 'INVALID_TAGS' });
  }

  // Verify mood_id belongs to this user if provided
  if (mood_id) {
    const { rows } = await query('SELECT 1 FROM moods WHERE id = $1 AND user_id = $2', [mood_id, req.user.id]);
    if (!rows.length) return res.status(400).json({ error: 'mood_id not found', code: 'INVALID_MOOD_ID' });
  }

  const riskResult = classify(content);
  const risk_flagged = riskResult ? ['critical', 'high'].includes(riskResult.severity) : false;

  const { rows } = await query(
    `INSERT INTO journals (user_id, mood_id, mood_level, tags, content, risk_flagged)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [req.user.id, mood_id || null, mood_level || null, tags || null, cleanContent, risk_flagged]
  );

  // Passive admin alert — no interruption to user (blueprint section 7.6)
  if (risk_flagged) {
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       SELECT id, 'emergency_alert', $1, 'in_app'
       FROM users WHERE role = 'admin' AND is_active = true`,
      [JSON.stringify({ source: 'journal_flag', category: riskResult.category, keyword: riskResult.keyword })]
    );
  }

  return res.status(201).json({ journal_id: rows[0].id });
});

// ─── GET /journals ────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const conditions = ['user_id = $1'];
  const params = [req.user.id];
  let idx = 2;

  if (req.query.mood_level) {
    conditions.push(`mood_level = $${idx++}`);
    params.push(req.query.mood_level);
  }
  if (req.query.tag) {
    conditions.push(`$${idx++} = ANY(tags)`);
    params.push(req.query.tag);
  }
  if (req.query.from_date) {
    conditions.push(`created_at >= $${idx++}`);
    params.push(req.query.from_date);
  }
  if (req.query.to_date) {
    conditions.push(`created_at <= $${idx++}`);
    params.push(req.query.to_date);
  }
  if (req.query.search) {
    conditions.push(`to_tsvector('english', content) @@ plainto_tsquery('english', $${idx++})`);
    params.push(req.query.search);
  }

  const where = conditions.join(' AND ');

  const { rows } = await query(
    `SELECT id, mood_level, tags, LEFT(content, 100) AS content_preview, created_at
     FROM journals WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(`SELECT COUNT(*) FROM journals WHERE ${where}`, params.slice(0, idx - 2));

  const total = parseInt(countRows[0].count);
  return res.status(200).json({ entries: rows, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /journals/:id ────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM journals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Journal entry not found', code: 'NOT_FOUND' });
  return res.status(200).json(rows[0]);
});

// ─── PATCH /journals/:id ──────────────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  const { rows: existing } = await query(
    'SELECT id FROM journals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!existing.length) return res.status(404).json({ error: 'Journal entry not found', code: 'NOT_FOUND' });

  const { content, mood_level, tags, mood_id } = req.body;

  let risk_flagged = undefined;
  if (content) {
    const riskResult = classify(content);
    risk_flagged = riskResult ? ['critical', 'high'].includes(riskResult.severity) : false;
  }

  const setClauses = ['updated_at = NOW()'];
  const params = [];
  let idx = 1;

  if (content !== undefined)    { setClauses.push(`content = $${idx++}`);     params.push(content.trim()); }
  if (mood_level !== undefined) { setClauses.push(`mood_level = $${idx++}`);  params.push(mood_level); }
  if (tags !== undefined)       { setClauses.push(`tags = $${idx++}`);        params.push(tags); }
  if (mood_id !== undefined)    { setClauses.push(`mood_id = $${idx++}`);     params.push(mood_id); }
  if (risk_flagged !== undefined){ setClauses.push(`risk_flagged = $${idx++}`); params.push(risk_flagged); }

  params.push(req.params.id, req.user.id);
  const { rows } = await query(
    `UPDATE journals SET ${setClauses.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING updated_at`,
    params
  );

  return res.status(200).json({ updated_at: rows[0].updated_at });
});

// ─── DELETE /journals/:id ─────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  const { rowCount } = await query(
    'DELETE FROM journals WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Journal entry not found', code: 'NOT_FOUND' });
  return res.status(204).send();
});

// ─── DELETE /journals (all) ───────────────────────────────────────────────────
router.delete('/', auth, async (req, res) => {
  const { rowCount } = await query('DELETE FROM journals WHERE user_id = $1', [req.user.id]);
  return res.status(200).json({ deleted_count: rowCount });
});

module.exports = router;
