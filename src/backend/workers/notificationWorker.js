const { Worker } = require('bullmq');
const { createQueueClient } = require('../config/redis');
const { sendPushNotification } = require('../utils/fcm');

function startNotificationWorker() {
  const connection = createQueueClient();
  if (!connection) {
    console.warn('[notificationWorker] Redis unavailable — worker not started');
    return null;
  }

  const worker = new Worker('notification', async (job) => {
    const { fcm_token, title, body, data } = job.data;
    await sendPushNotification(fcm_token, title, body, data);
  }, { connection });

  worker.on('failed', (job, err) => {
    console.error(`[notificationWorker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  return worker;
}

module.exports = { startNotificationWorker };
