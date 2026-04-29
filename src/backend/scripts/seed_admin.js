// Usage: node src/backend/scripts/seed_admin.js <email> <password>
// Creates an admin account. Run once before launch.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const { query } = require('../db');
const { generateAlias } = require('../utils/aliasGenerator');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node seed_admin.js <email> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const emailLower = email.toLowerCase().trim();
  const { rows: existing } = await query('SELECT 1 FROM users WHERE email = $1', [emailLower]);
  if (existing.length) {
    console.error('Email already registered');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const alias = await generateAlias();

  const { rows } = await query(
    `INSERT INTO users (email, password_hash, alias, role, is_active)
     VALUES ($1, $2, $3, 'admin', true)
     RETURNING id, alias`,
    [emailLower, hash, alias]
  );

  await query('INSERT INTO credits (user_id, balance) VALUES ($1, 0)', [rows[0].id]);

  console.log(`Admin created — alias: ${rows[0].alias}, id: ${rows[0].id}`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
