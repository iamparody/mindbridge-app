const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { query } = require('../db');
const { generateAccessToken } = require('../utils/jwt');
const { generateAlias } = require('../utils/aliasGenerator');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required', code: 'INVALID_EMAIL' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters', code: 'INVALID_PASSWORD' });
  }

  const emailLower = email.toLowerCase().trim();

  const { rows: existing } = await query('SELECT 1 FROM users WHERE email = $1', [emailLower]);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_TAKEN' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const alias = await generateAlias();

  const { rows } = await query(
    `INSERT INTO users (alias, email, password_hash, role)
     VALUES ($1, $2, $3, 'member')
     RETURNING id, alias, role`,
    [alias, emailLower, password_hash]
  );
  const user = rows[0];

  // Create credit record — balance starts at 0; signup bonus given after first mood entry
  await query('INSERT INTO credits (user_id, balance) VALUES ($1, 0)', [user.id]);

  const token = generateAccessToken(user);

  return res.status(201).json({ token, alias: user.alias, userId: user.id });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required', code: 'MISSING_FIELDS' });
  }

  const { rows } = await query(
    'SELECT id, alias, role, password_hash, is_active FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (!rows.length || !rows[0].is_active) {
    return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
  }

  // Update FCM token if provided (for push notifications)
  if (req.body.fcm_token) {
    await query('UPDATE users SET fcm_token = $1 WHERE id = $2', [req.body.fcm_token, user.id]);
  }

  const token = generateAccessToken({ id: user.id, alias: user.alias, role: user.role });

  return res.status(200).json({ token, alias: user.alias, userId: user.id, role: user.role });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post('/logout', auth, async (req, res) => {
  // Blacklist this token's JTI until natural expiry (7 days from now)
  await query(
    `INSERT INTO token_blacklist (jti, expires_at)
     VALUES ($1, NOW() + INTERVAL '7 days')
     ON CONFLICT (jti) DO NOTHING`,
    [req.user.jti]
  );
  return res.status(200).json({ message: 'Logged out successfully' });
});

// ─── POST /auth/recover ───────────────────────────────────────────────────────
router.post('/recover', authLimiter, async (req, res) => {
  const { email } = req.body;

  // Always return 200 to prevent email enumeration
  if (!email) return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });

  const { rows } = await query(
    'SELECT id FROM users WHERE email = $1 AND is_active = true',
    [email.toLowerCase().trim()]
  );

  if (rows.length > 0) {
    const userId = rows[0].id;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await query(
      `UPDATE users SET reset_token_hash = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetHash, userId]
    );

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: `MindBridge <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Reset your MindBridge password',
          text: `Your password reset token (valid for 1 hour):\n\n${resetToken}\n\nIf you did not request this, ignore this email.`,
        });
      } catch (err) {
        console.error('Recovery email failed:', err.message);
      }
    } else {
      // Development: log token to console
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
    }
  }

  return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
});

module.exports = router;
