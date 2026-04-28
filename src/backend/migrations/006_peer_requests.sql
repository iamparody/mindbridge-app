-- Migration 006: PeerRequests table
-- Blueprint section 8.5

CREATE TYPE peer_request_status AS ENUM ('open', 'locked', 'active', 'escalated', 'closed');
CREATE TYPE channel_preference  AS ENUM ('text', 'voice');

CREATE TABLE peer_requests (
  id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID                NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  channel_preference  channel_preference  NOT NULL,
  status              peer_request_status NOT NULL DEFAULT 'open',
  accepted_by         UUID                NULL REFERENCES users (id) ON DELETE SET NULL,
  session_id          UUID                NULL REFERENCES sessions (id) ON DELETE SET NULL,
  escalation_job_id   VARCHAR(100)        NULL,
  escalated_at        TIMESTAMP           NULL,
  created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_peer_requests_status     ON peer_requests (status);
CREATE INDEX idx_peer_requests_user_id    ON peer_requests (user_id);
CREATE INDEX idx_peer_requests_created_at ON peer_requests (created_at DESC);
