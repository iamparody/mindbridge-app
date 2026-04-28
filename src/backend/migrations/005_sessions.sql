-- Migration 005: Sessions table (without peer_request_id FK — circular dep resolved in 007)
-- Blueprint section 8.4

CREATE TYPE session_type    AS ENUM ('peer', 'ai', 'therapist');
CREATE TYPE session_channel AS ENUM ('text', 'voice');
CREATE TYPE session_status  AS ENUM ('active', 'completed', 'abandoned');

CREATE TABLE sessions (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  type            session_type   NOT NULL,
  channel         session_channel NULL,
  status          session_status NOT NULL DEFAULT 'active',
  credit_cost     INTEGER        NOT NULL DEFAULT 0,
  peer_request_id UUID           NULL,     -- FK added in migration 007
  started_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMP      NULL
);

CREATE INDEX idx_sessions_user_id   ON sessions (user_id);
CREATE INDEX idx_sessions_status    ON sessions (status);
CREATE INDEX idx_sessions_started   ON sessions (started_at DESC);
