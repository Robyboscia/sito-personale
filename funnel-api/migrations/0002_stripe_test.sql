-- Stripe TEST transactions only. Never store live customer, health or card details.
-- No payments can run unless STRIPE_TEST_ENABLED=true and a sk_test_ key exists.
CREATE TABLE IF NOT EXISTS stripe_test_orders (
  id TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  funnel TEXT NOT NULL CHECK (funnel IN ('mental','libro','formazione')),
  stage TEXT NOT NULL CHECK (stage IN ('primary_pending','upsell1','upsell2','downsell','done')),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS stripe_test_orders_exp ON stripe_test_orders(expires_at);
CREATE TABLE IF NOT EXISTS stripe_test_sessions (
  order_id TEXT NOT NULL REFERENCES stripe_test_orders(id) ON DELETE CASCADE,
  offer_stage TEXT NOT NULL CHECK (offer_stage IN ('primary','upsell1','upsell2','downsell')),
  stripe_session_id TEXT UNIQUE,
  checkout_url TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  state TEXT NOT NULL CHECK (state IN ('reserved','open','paid')),
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  PRIMARY KEY (order_id,offer_stage)
);
CREATE TABLE IF NOT EXISTS stripe_test_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  received_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS stripe_test_sessions_order ON stripe_test_sessions(order_id);
