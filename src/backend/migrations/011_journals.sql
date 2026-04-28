-- Migration 011: Journals table
-- Blueprint section 8.10

CREATE TABLE journals (
  id                   UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  mood_id              UUID       NULL REFERENCES moods (id) ON DELETE SET NULL,
  mood_level           mood_level NULL,
  tags                 TEXT[]     NULL,
  content              TEXT       NOT NULL,
  risk_flagged         BOOLEAN    NOT NULL DEFAULT false,
  scheduled_deletion_at TIMESTAMP NULL,
  created_at           TIMESTAMP  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journals_user_id    ON journals (user_id);
CREATE INDEX idx_journals_created    ON journals (created_at DESC);
CREATE INDEX idx_journals_risk       ON journals (risk_flagged) WHERE risk_flagged = true;
-- Full-text search index for keyword search
CREATE INDEX idx_journals_content_fts ON journals USING gin(to_tsvector('english', content));
