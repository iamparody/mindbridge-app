-- Migration 035: Add trauma and relationships article categories; add stories support
-- Extends article_category enum with two categories that have groups but no articles.
-- Adds content_type + author fields so personal stories can be stored alongside articles.

ALTER TYPE article_category ADD VALUE IF NOT EXISTS 'trauma';
ALTER TYPE article_category ADD VALUE IF NOT EXISTS 'relationships';

ALTER TABLE psychoeducation_articles
  ADD COLUMN content_type VARCHAR(10)  NOT NULL DEFAULT 'article',
  ADD COLUMN author_name  VARCHAR(100) NULL,
  ADD COLUMN author_bio   TEXT         NULL,
  ADD COLUMN source_url   VARCHAR(500) NULL;

ALTER TABLE psychoeducation_articles
  ADD CONSTRAINT check_content_type CHECK (content_type IN ('article', 'story'));

CREATE INDEX idx_articles_content_type ON psychoeducation_articles (content_type);
