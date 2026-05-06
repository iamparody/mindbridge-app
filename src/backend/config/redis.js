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
// retryStrategy gives up after 1 attempt so blocked networks log once and stop.
// On local dev with port 6380 blocked: comment out UPSTASH_REDIS_URL in .env —
// this sets queue client to null, all email/push goes direct, zero TCP noise.
function createQueueClient() {
  if (!process.env.UPSTASH_REDIS_URL) return null;
  let _warned = false;
  try {
    const conn = new IoRedis(process.env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 4000,
      family: 4,
      retryStrategy: (times) => {
        if (times >= 1) {
          if (!_warned) {
            _warned = true;
            console.warn('[redis:queue] TCP port 6380 unreachable — BullMQ disabled, using direct delivery');
          }
          return null;
        }
        return 1000;
      },
    });
    conn.on('error', (err) => {
      // ETIMEDOUT/ECONNREFUSED are expected when port 6380 is blocked — log once via retryStrategy
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message === 'Connection is closed.') return;
      console.warn('[redis:queue] TCP error:', err.code || err.message);
    });
    return conn;
  } catch (err) {
    console.warn('[redis:queue] Failed to initialise TCP client:', err.message);
    return null;
  }
}

module.exports = { getRestClient, createQueueClient };
