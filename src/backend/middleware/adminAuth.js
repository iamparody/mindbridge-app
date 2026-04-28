// Blueprint section 13: admin role verified from DB on every request, not JWT payload alone
const auth = require('./auth');
const { query } = require('../db');

async function adminAuth(req, res, next) {
  await new Promise((resolve, reject) => {
    auth(req, res, (err) => (err ? reject(err) : resolve()));
  }).catch(() => {}); // auth already sent response on failure

  if (!req.user) return; // auth middleware already responded

  const { rows } = await query(
    'SELECT role FROM users WHERE id = $1 AND is_active = true',
    [req.user.id]
  );

  if (!rows.length || rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' });
  }

  next();
}

module.exports = adminAuth;
