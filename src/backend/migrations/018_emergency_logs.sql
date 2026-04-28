-- Migration 018: Emergency_Logs table
-- Blueprint section 8.17

CREATE TYPE emergency_trigger_type AS ENUM ('user_initiated', 'ai_escalation', 'peer_timeout');
CREATE TYPE emergency_status       AS ENUM ('open', 'acknowledged', 'resolved');

CREATE TABLE emergency_logs (
  id              UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                   NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  trigger_type    emergency_trigger_type NOT NULL,
  status          emergency_status       NOT NULL DEFAULT 'open',
  handled_by      UUID                   NULL REFERENCES users (id) ON DELETE SET NULL,
  triggered_at    TIMESTAMP              NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMP              NULL,
  resolved_at     TIMESTAMP              NULL,
  notes           TEXT                   NULL
);

CREATE INDEX idx_emergency_logs_status      ON emergency_logs (status);
CREATE INDEX idx_emergency_logs_triggered   ON emergency_logs (triggered_at DESC);
CREATE INDEX idx_emergency_logs_user        ON emergency_logs (user_id);
