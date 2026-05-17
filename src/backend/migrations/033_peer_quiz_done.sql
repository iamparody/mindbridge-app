-- Migration 033: Track peer readiness quiz completion
ALTER TABLE users ADD COLUMN peer_quiz_done BOOLEAN NOT NULL DEFAULT false;
