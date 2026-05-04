const Redis = require('ioredis');

let _cacheClient = null;

// Singleton for cache, rate limiting, and token tracking.
function getCacheClient() {
  if (_cacheClient) return _cacheClient;
  if (!process.env.UPSTASH_REDIS_URL) return null;
  _cacheClient = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  _cacheClient.on('error', (err) => console.warn('[redis] Error:', err.message));
  return _cacheClient;
}

// BullMQ requires maxRetriesPerRequest: null — create a fresh connection each time.
function createQueueClient() {
  if (!process.env.UPSTASH_REDIS_URL) return null;
  const conn = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  conn.on('error', (err) => console.warn('[redis:queue] Error:', err.message));
  return conn;
}

module.exports = { getCacheClient, createQueueClient };
