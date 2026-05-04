-- Migration 030: RLS and deny-anon policies for remaining tables
-- Fixes three Supabase advisor warnings left after 026 + 029:
--   1. migrations_log  — RLS not enabled, no policies
--   2. token_blacklist — RLS not enabled, no policies (table exists in DB)
--   3. ai_usage        — RLS enabled but no deny-anon policies

-- migrations_log
ALTER TABLE migrations_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY deny_anon_read  ON migrations_log FOR SELECT TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY deny_anon_write ON migrations_log FOR ALL    TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- token_blacklist
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY deny_anon_read  ON token_blacklist FOR SELECT TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY deny_anon_write ON token_blacklist FOR ALL    TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ai_usage (RLS already enabled by 029; policies missing)
DO $$ BEGIN
  CREATE POLICY deny_anon_read  ON ai_usage FOR SELECT TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY deny_anon_write ON ai_usage FOR ALL    TO anon USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
