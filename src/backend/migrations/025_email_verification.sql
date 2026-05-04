-- Migration 025: Email verification and JWT session invalidation

ALTER TABLE users
  ADD COLUMN email_verified          BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN email_verify_token_hash VARCHAR(64) NULL,
  ADD COLUMN email_verify_expires    TIMESTAMP   NULL,
  ADD COLUMN jwt_issued_before       TIMESTAMP   NULL;

CREATE INDEX idx_users_email_verify_token ON users (email_verify_token_hash)
  WHERE email_verify_token_hash IS NOT NULL;
