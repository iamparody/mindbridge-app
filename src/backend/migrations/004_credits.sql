-- Migration 004: Credits table
-- Blueprint section 8.7 — one-to-one with users

CREATE TABLE credits (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  balance    INTEGER   NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
