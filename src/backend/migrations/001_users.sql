-- Migration 001: Users table
-- Blueprint section 8.1

CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias                 VARCHAR(50)  UNIQUE NOT NULL,
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         VARCHAR      NOT NULL,
  role                  user_role    NOT NULL DEFAULT 'member',
  is_active             BOOLEAN      NOT NULL DEFAULT true,
  risk_level            risk_level   NOT NULL DEFAULT 'low',
  streak_count          INTEGER      NOT NULL DEFAULT 0,
  last_checkin_at       TIMESTAMP    NULL,
  signup_bonus_credited BOOLEAN      NOT NULL DEFAULT false,
  -- consent fields nullable at registration — populated in onboarding step 4
  consent_version       VARCHAR(10)  NULL,
  consented_at          TIMESTAMP    NULL,
  persona_created       BOOLEAN      NOT NULL DEFAULT false,
  scheduled_deletion_at TIMESTAMP    NULL,
  -- notification preferences (blueprint section 7.9)
  notif_peer_broadcast  BOOLEAN      NOT NULL DEFAULT true,
  notif_checkin_reminder BOOLEAN     NOT NULL DEFAULT true,
  notif_group_messages  BOOLEAN      NOT NULL DEFAULT true,
  notif_credit_low      BOOLEAN      NOT NULL DEFAULT true,
  -- fcm token for push notifications
  fcm_token             VARCHAR(512) NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_alias      ON users (alias);
CREATE INDEX idx_users_risk_level ON users (risk_level);
CREATE INDEX idx_users_is_active  ON users (is_active);
