-- Migration 009: CreditTransactions table
-- Blueprint section 8.8

CREATE TYPE credit_tx_type       AS ENUM ('purchase', 'debit', 'bonus');
CREATE TYPE credit_payment_method AS ENUM ('mpesa', 'card', 'bonus');
CREATE TYPE credit_tx_channel    AS ENUM ('text', 'voice', 'purchase');
CREATE TYPE credit_tx_status     AS ENUM ('pending', 'confirmed', 'failed');

CREATE TABLE credit_transactions (
  id               UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID                 NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type             credit_tx_type       NOT NULL,
  amount_credits   INTEGER              NOT NULL,
  amount_currency  DECIMAL(10, 2)       NULL,
  currency_code    VARCHAR(3)           NOT NULL DEFAULT 'KES',
  payment_method   credit_payment_method NOT NULL,
  payment_reference VARCHAR(100)        NULL,
  session_id       UUID                 NULL REFERENCES sessions (id) ON DELETE SET NULL,
  channel          credit_tx_channel    NOT NULL,
  status           credit_tx_status     NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user_id   ON credit_transactions (user_id);
CREATE INDEX idx_credit_tx_status    ON credit_transactions (status);
CREATE INDEX idx_credit_tx_reference ON credit_transactions (payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX idx_credit_tx_created   ON credit_transactions (created_at DESC);
