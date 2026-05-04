const { query } = require('../db');
const cache = require('../services/cache');

// Deducts 1 credit for the given session channel.
// Returns: { blocked, grace, balance }
//   blocked: true if no credits available (session must end)
//   grace:   true if this was the last credit on a voice channel (2-min grace period begins)
//   balance: new balance after deduction
async function deductCredit(user_id, session_id, channel) {
  const { rows } = await query(
    'SELECT balance FROM credits WHERE user_id = $1',
    [user_id]
  );
  const balance = rows[0]?.balance ?? 0;

  if (balance < 1) {
    return { blocked: true, grace: false, balance: 0 };
  }

  // Atomic decrement — guards against concurrent deductions
  const { rowCount } = await query(
    'UPDATE credits SET balance = balance - 1, updated_at = NOW() WHERE user_id = $1 AND balance >= 1',
    [user_id]
  );

  if (!rowCount) {
    // Race condition: concurrent call took the last credit first
    return { blocked: true, grace: false, balance: 0 };
  }

  const newBalance = balance - 1;

  // Blueprint 6.4: voice gets a 2-min grace when the last credit is consumed
  const grace = newBalance === 0 && channel === 'voice';

  await query(
    `INSERT INTO credit_transactions
       (user_id, type, amount_credits, payment_method, session_id, channel, status)
     VALUES ($1, 'debit', 1, 'bonus', $2, $3, 'confirmed')`,
    [user_id, session_id, channel]
  );
  await cache.del(`credits:${user_id}`);

  // Blueprint 6.4: notify when balance drops below 2
  if (newBalance < 2) {
    await query(
      `INSERT INTO notifications (user_id, type, payload, channel)
       VALUES ($1, 'credit_low', $2, 'in_app')`,
      [user_id, JSON.stringify({ balance: newBalance })]
    );
  }

  return { blocked: false, grace, balance: newBalance };
}

module.exports = { deductCredit };
