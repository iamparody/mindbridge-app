const { query } = require('../db');
const { sendPushNotification } = require('./fcm');

// Write a notification record and optionally send a push.
// channel: 'in_app' | 'push'
async function writeNotification(user_id, type, payload, channel) {
  await query(
    `INSERT INTO notifications (user_id, type, payload, channel) VALUES ($1, $2, $3, $4)`,
    [user_id, type, JSON.stringify(payload), channel]
  );

  if (channel === 'push') {
    const { rows } = await query('SELECT fcm_token FROM users WHERE id = $1', [user_id]);
    const fcm_token = rows[0]?.fcm_token;
    if (fcm_token) {
      await sendPushNotification(fcm_token, type, '', payload);
    }
  }
}

module.exports = { writeNotification };
