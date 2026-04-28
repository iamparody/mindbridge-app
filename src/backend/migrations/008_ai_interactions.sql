-- Migration 008: AI_Interactions table
-- Blueprint section 8.6
-- user_id is nullable: when user deletes data, user_id is nulled (anonymized) but record kept if flagged

CREATE TABLE ai_interactions (
  id                   UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID      NULL REFERENCES users (id) ON DELETE SET NULL,
  session_id           UUID      NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  input_text           TEXT      NOT NULL,
  output_text          TEXT      NOT NULL,
  context_snapshot     JSONB     NULL,
  flagged              BOOLEAN   NOT NULL DEFAULT false,
  flag_reason          VARCHAR(100) NULL,
  retention_flag       BOOLEAN   NOT NULL DEFAULT true,
  scheduled_deletion_at TIMESTAMP NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user_id   ON ai_interactions (user_id);
CREATE INDEX idx_ai_interactions_session   ON ai_interactions (session_id);
CREATE INDEX idx_ai_interactions_flagged   ON ai_interactions (flagged) WHERE flagged = true;
CREATE INDEX idx_ai_interactions_created   ON ai_interactions (created_at DESC);
