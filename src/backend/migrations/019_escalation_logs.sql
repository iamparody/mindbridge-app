-- Migration 019: Escalation_Logs table
-- Blueprint section 8.18 — AI-triggered escalations, separate from user-initiated emergencies

CREATE TYPE escalation_trigger_type AS ENUM ('keyword', 'risk_score', 'repeated_flag');
CREATE TYPE escalation_destination  AS ENUM ('admin', 'emergency');
CREATE TYPE escalation_status       AS ENUM ('open', 'acknowledged', 'resolved');

CREATE TABLE escalation_logs (
  id             UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID                     NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  session_id     UUID                     NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  trigger_type   escalation_trigger_type  NOT NULL,
  trigger_detail VARCHAR(200)             NULL,
  escalated_to   escalation_destination   NOT NULL,
  status         escalation_status        NOT NULL DEFAULT 'open',
  created_at     TIMESTAMP                NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escalation_logs_user    ON escalation_logs (user_id);
CREATE INDEX idx_escalation_logs_session ON escalation_logs (session_id);
CREATE INDEX idx_escalation_logs_status  ON escalation_logs (status);
