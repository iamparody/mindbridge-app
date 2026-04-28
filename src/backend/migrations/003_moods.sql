-- Migration 003: Moods table
-- Blueprint section 8.3

CREATE TYPE mood_level AS ENUM ('very_low', 'low', 'neutral', 'good', 'great');

CREATE TABLE moods (
  id         UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  mood_level mood_level NOT NULL,
  tags       TEXT[]     NULL,
  note       VARCHAR(200) NULL,
  created_at TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moods_user_id    ON moods (user_id);
CREATE INDEX idx_moods_created_at ON moods (created_at);
CREATE INDEX idx_moods_user_date  ON moods (user_id, created_at DESC);
