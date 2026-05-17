-- Migration 032: Add condition_category to users for onboarding condition selection step
-- Uses existing group_category enum from migration 013

ALTER TABLE users ADD COLUMN condition_category group_category NULL;

CREATE INDEX idx_users_condition ON users (condition_category) WHERE condition_category IS NOT NULL;
