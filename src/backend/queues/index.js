const { Queue } = require('bullmq');
const { createQueueClient } = require('../config/redis');

const connection = createQueueClient();

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

const emailQueue = connection
  ? new Queue('email', { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS })
  : null;

const notificationQueue = connection
  ? new Queue('notification', { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS })
  : null;

if (!connection) {
  console.warn('[queues] Redis unavailable — email and notification queues disabled, falling back to direct send');
}

module.exports = { emailQueue, notificationQueue };
