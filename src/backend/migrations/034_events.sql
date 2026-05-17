-- Migration 034: Event tracking table for basic analytics funnel
CREATE TABLE events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NULL REFERENCES users (id) ON DELETE SET NULL,
  event_name  VARCHAR(64) NOT NULL,
  properties  JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_name       ON events (event_name);
CREATE INDEX idx_events_user_id    ON events (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_created_at ON events (created_at DESC);
