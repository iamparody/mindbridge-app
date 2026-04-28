-- Migration 023: Add password reset token columns to users
-- Also adds token blacklist table for logout

ALTER TABLE users
  ADD COLUMN reset_token_hash VARCHAR(64)  NULL,
  ADD COLUMN reset_token_expires TIMESTAMP NULL;

-- Stores logged-out JWT IDs until they expire naturally.
-- Rows older than 7 days are safe to purge.
CREATE TABLE token_blacklist (
  jti        VARCHAR(36)  PRIMARY KEY,
  expires_at TIMESTAMP    NOT NULL
);

CREATE INDEX idx_token_blacklist_expires ON token_blacklist (expires_at);
