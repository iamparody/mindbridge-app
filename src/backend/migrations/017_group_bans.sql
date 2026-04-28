-- Migration 017: GroupBans table
-- Blueprint section 8.16 — expires_at null = permanent ban

CREATE TABLE group_bans (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID      NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  user_id    UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason     TEXT      NOT NULL,
  banned_by  UUID      NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NULL
);

CREATE INDEX idx_group_bans_group_user ON group_bans (group_id, user_id);
