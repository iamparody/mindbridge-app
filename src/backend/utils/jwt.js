const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SECRET = process.env.JWT_SECRET;
const EXPIRY = '7d';

function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    alias: user.alias,
    role: user.role,
    jti: uuidv4(),
  };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateAccessToken, verifyToken };
