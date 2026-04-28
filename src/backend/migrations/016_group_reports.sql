-- Migration 016: GroupReports table
-- Blueprint section 8.15

CREATE TYPE report_reason AS ENUM ('harmful_content', 'abuse', 'spam', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');
CREATE TYPE report_admin_action AS ENUM ('warn', 'ban', 'dismiss');

CREATE TABLE group_reports (
  id               UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID                NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  reported_user_id UUID                NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reported_by      UUID                NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message_id       UUID                NULL REFERENCES group_messages (id) ON DELETE SET NULL,
  reason           report_reason       NOT NULL,
  details          TEXT                NULL,
  status           report_status       NOT NULL DEFAULT 'pending',
  admin_action     report_admin_action NULL,
  admin_notes      TEXT                NULL,
  created_at       TIMESTAMP           NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMP           NULL
);

CREATE INDEX idx_group_reports_status   ON group_reports (status);
CREATE INDEX idx_group_reports_group    ON group_reports (group_id);
CREATE INDEX idx_group_reports_created  ON group_reports (created_at DESC);
