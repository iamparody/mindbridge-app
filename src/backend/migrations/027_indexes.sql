-- Migration 027: Performance indexes
-- Uses IF NOT EXISTS throughout — safe to re-run.
-- idx_users_risk_level already exists (non-partial, from migration 001).
-- New partial version uses a distinct name to avoid collision.

-- ── Moods ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_moods_user_created
  ON moods(user_id, created_at DESC);

-- ── Journals ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_journals_user_created
  ON journals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_risk_flagged
  ON journals(risk_flagged) WHERE risk_flagged = true;

-- ── AI Interactions ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session
  ON ai_interactions(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_flagged
  ON ai_interactions(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user
  ON ai_interactions(user_id, created_at DESC);

-- ── Sessions ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user_type
  ON sessions(user_id, type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_active
  ON sessions(status) WHERE status = 'active';

-- ── Peer Requests ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_peer_requests_open
  ON peer_requests(status, created_at)
  WHERE status IN ('open', 'escalated');

-- ── Group Messages ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created
  ON group_messages(group_id, created_at DESC);

-- ── Group Memberships ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_memberships_user
  ON group_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group
  ON group_memberships(group_id, status);

-- ── Group Reports ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_reports_pending
  ON group_reports(status) WHERE status = 'pending';

-- ── Notifications ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_status
  ON notifications(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id) WHERE status = 'pending';

-- ── Credit Transactions ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user
  ON credit_transactions(user_id, created_at DESC);

-- ── Users (additional partial indexes — non-partial idx_users_risk_level exists already) ──
CREATE INDEX IF NOT EXISTS idx_users_active_risk
  ON users(risk_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_unverified
  ON users(email_verified) WHERE email_verified = false;
CREATE INDEX IF NOT EXISTS idx_users_pending_deletion
  ON users(scheduled_deletion_at)
  WHERE scheduled_deletion_at IS NOT NULL;

-- ── Emergency Logs ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_emergency_logs_open
  ON emergency_logs(status, triggered_at) WHERE status = 'open';

-- ── Therapist Referrals ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_referrals_active
  ON therapist_referrals(status, created_at)
  WHERE status IN ('pending', 'in_review');

-- ── Psychoeducation Articles ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_articles_category_status
  ON psychoeducation_articles(category, status) WHERE status = 'published';
