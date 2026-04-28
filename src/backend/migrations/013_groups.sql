-- Migration 013: Groups table
-- Blueprint section 8.12
-- condition_category enum: 8 values (different from psychoeducation which has 9 including general_wellness + crisis_support)

CREATE TYPE group_category AS ENUM (
  'anxiety',
  'depression',
  'ocd',
  'adhd',
  'grief',
  'loneliness',
  'stress',
  'general_support'
);

CREATE TABLE groups (
  id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(100)   NOT NULL,
  condition_category group_category NOT NULL,
  description        TEXT           NULL,
  created_by         UUID           NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  is_active          BOOLEAN        NOT NULL DEFAULT true,
  created_at         TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_is_active ON groups (is_active);
CREATE INDEX idx_groups_category  ON groups (condition_category);
