const { Worker } = require('bullmq');
const { createQueueClient } = require('../config/redis');
const { deliverEmail } = require('../services/emailService');

function startEmailWorker() {
  const connection = createQueueClient();
  if (!connection) {
    console.warn('[emailWorker] Redis unavailable — worker not started');
    return null;
  }

  const worker = new Worker('email', async (job) => {
    const { to, subject, html } = job.data;
    await deliverEmail(to, subject, html);
  }, { connection });

  worker.on('completed', (job) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[emailWorker] Job ${job.id} completed`);
    }
  });

  worker.on('failed', (job, err) => {
    console.error(`[emailWorker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  return worker;
}

module.exports = { startEmailWorker };
