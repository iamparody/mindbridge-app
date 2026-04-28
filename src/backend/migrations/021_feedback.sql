-- Migration 021: Feedback table
-- Blueprint section 8.20
-- IMPORTANT: No user_id column — fully anonymous by design. Disclosed in consent agreement.

CREATE TYPE feedback_type AS ENUM ('peer_session', 'ai_chat', 'bug', 'general');

CREATE TABLE feedback (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  type       feedback_type NOT NULL,
  rating     SMALLINT      NULL CHECK (rating >= 1 AND rating <= 5),
  comment    VARCHAR(300)  NULL,
  session_id UUID          NULL REFERENCES sessions (id) ON DELETE SET NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_type    ON feedback (type);
CREATE INDEX idx_feedback_created ON feedback (created_at DESC);
