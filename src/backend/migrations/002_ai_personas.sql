-- Migration 002: AI_Personas table
-- Blueprint section 8.2 — one record per user, written once at onboarding, read-only thereafter

CREATE TYPE persona_tone          AS ENUM ('warm', 'motivational', 'clinical', 'casual');
CREATE TYPE persona_response_style AS ENUM ('brief', 'elaborate');
CREATE TYPE persona_formality     AS ENUM ('formal', 'neutral', 'informal');

CREATE TABLE ai_personas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID                   UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  persona_name   VARCHAR(20)            NOT NULL,
  tone           persona_tone           NOT NULL,
  response_style persona_response_style NOT NULL,
  formality      persona_formality      NOT NULL,
  uses_alias     BOOLEAN                NOT NULL DEFAULT true,
  created_at     TIMESTAMP              NOT NULL DEFAULT NOW()
);
