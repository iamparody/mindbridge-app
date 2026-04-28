const { verifyToken } = require('../utils/jwt');
const { query } = require('../db');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' });
  }

  const token = header.slice(7);

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired', code: 'TOKEN_INVALID' });
  }

  // Check token blacklist (logout)
  const { rows: blacklisted } = await query(
    'SELECT 1 FROM token_blacklist WHERE jti = $1',
    [decoded.jti]
  );
  if (blacklisted.length > 0) {
    return res.status(401).json({ error: 'Token has been revoked', code: 'TOKEN_REVOKED' });
  }

  req.user = { id: decoded.sub, alias: decoded.alias, role: decoded.role, jti: decoded.jti };
  next();
}

module.exports = auth;
