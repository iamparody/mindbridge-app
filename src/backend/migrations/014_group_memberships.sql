-- Migration 014: GroupMemberships table
-- Blueprint section 8.13 — UNIQUE(group_id, user_id) enforces one membership per user per group

CREATE TYPE membership_status AS ENUM ('active', 'banned', 'left');

CREATE TABLE group_memberships (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID              NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  user_id    UUID              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status     membership_status NOT NULL DEFAULT 'active',
  agreed_at  TIMESTAMP         NOT NULL,
  created_at TIMESTAMP         NOT NULL DEFAULT NOW(),

  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_memberships_group  ON group_memberships (group_id);
CREATE INDEX idx_group_memberships_user   ON group_memberships (user_id);
CREATE INDEX idx_group_memberships_status ON group_memberships (group_id, status);
