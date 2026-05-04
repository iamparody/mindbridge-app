-- Migration 024: Add welcome_seen flag to users
-- Tracks whether the user has completed the animated Welcome Screen.
-- false (default) = first visit, show full welcome with no skip button.
-- true = returning user, skip button is immediately available.

ALTER TABLE users
  ADD COLUMN welcome_seen BOOLEAN NOT NULL DEFAULT false;
