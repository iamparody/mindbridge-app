-- Migration 026: Row Level Security
-- Enables RLS on all user-facing tables and denies all direct anon-role access.
-- The backend uses service_role (bypasses RLS by design) — policies only block
-- anyone who tries to query Supabase directly with the public anon key.

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'ai_personas', 'moods', 'sessions', 'peer_requests',
    'ai_interactions', 'credits', 'credit_transactions', 'notifications',
    'journals', 'safety_plans', 'groups', 'group_memberships', 'group_messages',
    'group_reports', 'group_bans', 'emergency_logs', 'escalation_logs',
    'therapist_referrals', 'feedback', 'psychoeducation_articles'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    BEGIN
      EXECUTE format(
        'CREATE POLICY deny_anon_read ON %I FOR SELECT TO anon USING (false)', tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      EXECUTE format(
        'CREATE POLICY deny_anon_write ON %I FOR ALL TO anon USING (false)', tbl
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;
