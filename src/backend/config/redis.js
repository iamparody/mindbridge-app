const { Redis: UpstashRedis } = require('@upstash/redis');
const IoRedis = require('ioredis');

// ── REST client (cache + rate limiting) ──────────────────────────────────────
// Uses HTTPS port 443 — works on all networks including local dev.
let _restClient = null;

function getRestClient() {
  if (_restClient) return _restClient;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  _restClient = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    automaticDeserialization: false,
  });
  return _restClient;
}

// ── TCP client (BullMQ queues only) ──────────────────────────────────────────
// Uses rediss:// port 6380 — may be blocked on some local networks.
// Falls back gracefully: queues become null → jobs delivered synchronously.
// family:4 forces IPv4 to avoid Node v24 AggregateError from dual-stack probes.
// retryStrategy gives up after 3 attempts so blocked local networks stop logging.
function createQueueClient() {
  if (!process.env.UPSTASH_REDIS_URL) return null;
  try {
    const conn = new IoRedis(process.env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      family: 4,
      retryStrategy: (times) => {
        if (times >= 3) {
          console.warn('[redis:queue] TCP unavailable after 3 attempts — BullMQ falling back to sync delivery');
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    });
    conn.on('error', (err) => {
      console.warn('[redis:queue] TCP error (BullMQ fallback to sync):', err.code || err.message);
    });
    return conn;
  } catch (err) {
    console.warn('[redis:queue] Failed to initialise TCP client:', err.message);
    return null;
  }
}

module.exports = { getRestClient, createQueueClient };
