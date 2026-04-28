const admin = require('firebase-admin');

let initialized = false;

function initFCM() {
  if (initialized || !process.env.FCM_SERVICE_ACCOUNT_JSON) return;
  try {
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
  } catch (err) {
    console.error('FCM init failed:', err.message);
  }
}

// Send a push notification to a single FCM token.
// title/body are display strings; data is an optional key-value string map.
async function sendPushNotification(fcm_token, title, body, data = {}) {
  initFCM();
  if (!initialized || !fcm_token) return;
  try {
    await admin.messaging().send({
      token: fcm_token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
  } catch (err) {
    // Non-fatal — in-app notification still stored in DB
    console.warn('FCM send failed:', err.message);
  }
}

module.exports = { sendPushNotification };
