const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const cache = require('../services/cache');

const router = express.Router();

// ─── GET /resources ───────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const cacheKey = `resources:${req.query.category || 'all'}:${req.query.search || ''}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.status(200).json(cached);

  const conditions = [`status = 'published'`];
  const params = [];
  let idx = 1;

  if (req.query.category) {
    conditions.push(`category = $${idx++}`);
    params.push(req.query.category);
  }
  if (req.query.search) {
    conditions.push(`to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $${idx++})`);
    params.push(req.query.search);
  }

  const where = conditions.join(' AND ');
  const { rows } = await query(
    `SELECT id, title, category, estimated_read_minutes, tags, published_at
     FROM psychoeducation_articles WHERE ${where}
     ORDER BY published_at DESC`,
    params
  );

  const result = { articles: rows };
  await cache.set(cacheKey, result, 3600); // 1 hour
  return res.status(200).json(result);
});

// ─── GET /resources/:id ───────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM psychoeducation_articles WHERE id = $1 AND status = 'published'`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Article not found', code: 'NOT_FOUND' });
  return res.status(200).json({ article: rows[0] });
});

module.exports = router;
