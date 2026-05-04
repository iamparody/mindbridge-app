const { verifyToken } = require('../utils/jwt');
const { query } = require('../db');

// Routes where email verification is not required
const VERIFY_EXEMPT = ['/api/auth/'];

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

  // Fetch session-control fields (single indexed lookup by PK)
  const { rows: userData } = await query(
    'SELECT jwt_issued_before, email_verified FROM users WHERE id = $1',
    [decoded.sub]
  );
  if (!userData.length) {
    return res.status(401).json({ error: 'Account not found', code: 'UNAUTHORIZED' });
  }

  const { jwt_issued_before, email_verified } = userData[0];

  // Reject tokens invalidated by a password reset
  if (jwt_issued_before) {
    const issuedBeforeTs = Math.floor(new Date(jwt_issued_before).getTime() / 1000);
    if (decoded.iat < issuedBeforeTs) {
      return res.status(401).json({
        error: 'Session expired — please log in again',
        code: 'SESSION_EXPIRED',
      });
    }
  }

  req.user = { id: decoded.sub, alias: decoded.alias, role: decoded.role, jti: decoded.jti };

  // Email verification gate — exempt auth routes, emergency trigger, and resource reads
  const url = req.originalUrl;
  const isExempt =
    VERIFY_EXEMPT.some((p) => url.startsWith(p)) ||
    (req.method === 'POST' && url.startsWith('/api/emergency')) ||
    (req.method === 'GET' && url.startsWith('/api/resources'));

  if (!isExempt && !email_verified) {
    return res.status(403).json({
      error: 'Please verify your email to continue',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
}

module.exports = auth;
