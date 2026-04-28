-- Migration 010: Notifications table
-- Blueprint section 8.9 — all 12 notification types

CREATE TYPE notification_type AS ENUM (
  'peer_request_broadcast',
  'peer_escalation',
  'session_confirmation',
  'therapist_referral_update',
  'emergency_alert',
  'group_message',
  'group_warning',
  'data_deletion_confirmed',
  'credit_low',
  'credit_purchase_confirmed',
  'check_in_reminder',
  'milestone'
);

CREATE TYPE notification_channel AS ENUM ('push', 'in_app');
CREATE TYPE notification_status  AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TABLE notifications (
  id         UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID                 NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type       notification_type    NOT NULL,
  payload    JSONB                NOT NULL,
  channel    notification_channel NOT NULL,
  status     notification_status  NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP            NOT NULL DEFAULT NOW(),
  sent_at    TIMESTAMP            NULL,
  read_at    TIMESTAMP            NULL
);

CREATE INDEX idx_notifications_user_id   ON notifications (user_id);
CREATE INDEX idx_notifications_status    ON notifications (status);
CREATE INDEX idx_notifications_created   ON notifications (created_at DESC);
CREATE INDEX idx_notifications_unread    ON notifications (user_id, status) WHERE status != 'read';
