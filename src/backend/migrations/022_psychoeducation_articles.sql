-- Migration 022: PsychoeducationArticles table
-- Blueprint section 8.21
-- NOTE: category enum has 9 values — includes 'general_wellness' and 'crisis_support'
-- This differs from group_category (8 values, has 'general_support' instead)

CREATE TYPE article_category AS ENUM (
  'anxiety',
  'depression',
  'ocd',
  'adhd',
  'grief',
  'loneliness',
  'stress',
  'general_wellness',
  'crisis_support'
);

CREATE TYPE article_status AS ENUM ('published', 'draft', 'archived');

CREATE TABLE psychoeducation_articles (
  id                     UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  VARCHAR(200)     NOT NULL,
  category               article_category NOT NULL,
  content                TEXT             NOT NULL,
  estimated_read_minutes SMALLINT         NOT NULL,
  tags                   TEXT[]           NULL,
  status                 article_status   NOT NULL DEFAULT 'draft',
  created_by             UUID             NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  published_at           TIMESTAMP        NULL,
  created_at             TIMESTAMP        NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_status   ON psychoeducation_articles (status);
CREATE INDEX idx_articles_category ON psychoeducation_articles (category);
CREATE INDEX idx_articles_created  ON psychoeducation_articles (created_at DESC);
-- Full-text search index
CREATE INDEX idx_articles_fts ON psychoeducation_articles USING gin(to_tsvector('english', title || ' ' || content));
