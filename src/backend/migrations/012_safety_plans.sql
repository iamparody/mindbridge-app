-- Migration 012: SafetyPlans table
-- Blueprint section 8.11 — one per user, contacts encrypted app-side before storage

CREATE TABLE safety_plans (
  id                  UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID      UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  warning_signs       TEXT      NULL,
  helpful_things      TEXT      NULL,
  things_to_avoid     TEXT      NULL,
  contacts            JSONB     NULL,
  emergency_resources TEXT      NULL DEFAULT 'Befrienders Kenya: 0800 723 253 (free, 24/7)',
  reason_to_continue  TEXT      NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
