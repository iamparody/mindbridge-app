const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const cache = require('../services/cache');

const router = express.Router();

const VALID_MOOD_LEVELS = ['very_low', 'low', 'neutral', 'good', 'great'];
const VALID_TAGS = ['anxious','hopeful','overwhelmed','calm','lonely','grateful','angry','numb'];
const MILESTONE_DAYS = [3, 7, 30];

// ─── POST /moods ──────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { mood_level, tags, note } = req.body;

  if (!VALID_MOOD_LEVELS.includes(mood_level)) {
    return res.status(400).json({ error: `mood_level must be one of: ${VALID_MOOD_LEVELS.join(', ')}`, code: 'INVALID_MOOD_LEVEL' });
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array', code: 'INVALID_TAGS' });
  }
  if (tags) {
    const invalid = tags.filter((t) => !VALID_TAGS.includes(t));
    if (invalid.length) {
      return res.status(400).json({ error: `Invalid tag(s): ${invalid.join(', ')}`, code: 'INVALID_TAG' });
    }
  }
  if (note && note.length > 200) {
    return res.status(400).json({ error: 'note must be 200 characters or fewer', code: 'NOTE_TOO_LONG' });
  }

  const { rows: moodRows } = await query(
    'INSERT INTO moods (user_id, mood_level, tags, note) VALUES ($1, $2, $3, $4) RETURNING id',
    [req.user.id, mood_level, tags || null, note || null]
  );
  const moodId = moodRows[0].id;

  // ── Streak logic ──────────────────────────────────────────────────────────
  const { rows: userRows } = await query(
    'SELECT streak_count, last_checkin_at, signup_bonus_credited FROM users WHERE id = $1',
    [req.user.id]
  );
  const user = userRows[0];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let newStreak = user.streak_count;
  let bonusCredited = false;

  const lastCheckin = user.last_checkin_at ? new Date(user.last_checkin_at) : null;
  const alreadyCheckedInToday = lastCheckin && lastCheckin >= todayStart;

  if (!alreadyCheckedInToday) {
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);
    const streakContinues = lastCheckin && lastCheckin >= yesterday;
    newStreak = streakContinues ? user.streak_count + 1 : 1;

    await query(
      'UPDATE users SET streak_count = $1, last_checkin_at = NOW(), updated_at = NOW() WHERE id = $2',
      [newStreak, req.user.id]
    );

    // Milestone notifications
    if (MILESTONE_DAYS.includes(newStreak)) {
      await query(
        `INSERT INTO notifications (user_id, type, payload, channel)
         VALUES ($1, 'milestone', $2, 'in_app')`,
        [req.user.id, JSON.stringify({ streak: newStreak })]
      );
    }
  }

  // ── Signup bonus (first mood entry only) ─────────────────────────────────
  if (!user.signup_bonus_credited) {
    await query('UPDATE credits SET balance = balance + 2, updated_at = NOW() WHERE user_id = $1', [req.user.id]);
    await query(
      `INSERT INTO credit_transactions (user_id, type, amount_credits, payment_method, channel, status)
       VALUES ($1, 'bonus', 2, 'bonus', 'purchase', 'confirmed')`,
      [req.user.id]
    );
    await query(
      'UPDATE users SET signup_bonus_credited = true, updated_at = NOW() WHERE id = $1',
      [req.user.id]
    );
    bonusCredited = true;
  }

  await cache.del(`analytics:${req.user.id}`);
  return res.status(201).json({ mood_id: moodId, streak_count: newStreak, bonus_credited: bonusCredited });
});

// ─── GET /moods/today ─────────────────────────────────────────────────────────
router.get('/today', auth, async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { rows } = await query(
    'SELECT * FROM moods WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1',
    [req.user.id, todayStart]
  );

  return res.status(200).json({ entry: rows[0] || null });
});

// ─── GET /moods/analytics ─────────────────────────────────────────────────────
router.get('/analytics', auth, async (req, res) => {
  const cacheKey = `analytics:${req.user.id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.status(200).json(cached);

  const LEVEL_SCORE = { very_low: -2, low: -1, neutral: 0, good: 1, great: 2 };

  // 7-day and 30-day entries
  const { rows: entries30 } = await query(
    `SELECT mood_level, tags, created_at
     FROM moods WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
     ORDER BY created_at ASC`,
    [req.user.id]
  );

  const entries7 = entries30.filter(
    (e) => new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  // 7-day trend (group by date)
  const week_trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayEntries = entries7.filter((e) => e.created_at.toISOString().slice(0, 10) === dateStr);
    const avg = dayEntries.length
      ? dayEntries.reduce((s, e) => s + LEVEL_SCORE[e.mood_level], 0) / dayEntries.length
      : null;
    week_trend.push({ date: dateStr, avg_score: avg, count: dayEntries.length });
  }

  // Most common mood (30d)
  const moodCounts = {};
  for (const e of entries30) {
    moodCounts[e.mood_level] = (moodCounts[e.mood_level] || 0) + 1;
  }
  const common_mood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || null;

  // Most frequent tags (30d)
  const tagCounts = {};
  for (const e of entries30) {
    if (e.tags) for (const tag of e.tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
  const frequent_tags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  // Total check-ins and current streak
  const { rows: userRows } = await query('SELECT streak_count FROM users WHERE id = $1', [req.user.id]);
  const { rows: totalRows } = await query('SELECT COUNT(*) FROM moods WHERE user_id = $1', [req.user.id]);

  const result = {
    week_trend,
    common_mood,
    frequent_tags,
    current_streak: userRows[0]?.streak_count || 0,
    total_checkins: parseInt(totalRows[0].count),
  };
  await cache.set(cacheKey, result, 300);
  return res.status(200).json(result);
});

// ─── GET /moods/history ───────────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const { rows } = await query(
    'SELECT * FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [req.user.id, limit, offset]
  );
  const { rows: countRows } = await query('SELECT COUNT(*) FROM moods WHERE user_id = $1', [req.user.id]);
  const total = parseInt(countRows[0].count);

  return res.status(200).json({ entries: rows, total, page, pages: Math.ceil(total / limit) });
});

module.exports = router;
