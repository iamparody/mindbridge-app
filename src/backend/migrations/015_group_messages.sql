-- Migration 015: GroupMessages table
-- Blueprint section 8.14
-- deleted_by is a separate FK to users (admin who deleted — different from user_id/poster)

CREATE TABLE group_messages (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID      NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  user_id    UUID      NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  content    TEXT      NOT NULL,
  is_deleted BOOLEAN   NOT NULL DEFAULT false,
  deleted_by UUID      NULL REFERENCES users (id) ON DELETE SET NULL,
  is_pinned  BOOLEAN   NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_group_messages_group    ON group_messages (group_id);
CREATE INDEX idx_group_messages_created  ON group_messages (group_id, created_at DESC);
CREATE INDEX idx_group_messages_pinned   ON group_messages (group_id, is_pinned) WHERE is_pinned = true;
