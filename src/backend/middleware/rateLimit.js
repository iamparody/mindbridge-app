const rateLimit = require('express-rate-limit');

// Blueprint section 13: 5 auth attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again in 15 minutes', code: 'RATE_LIMITED' },
});

// General API limiter — generous ceiling to catch abuse only
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMITED' },
});

module.exports = { authLimiter, apiLimiter };
