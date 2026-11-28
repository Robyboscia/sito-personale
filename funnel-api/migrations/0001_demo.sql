-- NO-PAYMENT demo only. No names, emails, addresses, payment or health data.
CREATE TABLE IF NOT EXISTS demo_orders (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  funnel TEXT NOT NULL CHECK (funnel IN ('mental','libro','formazione')),
  stage TEXT NOT NULL CHECK (stage IN ('upsell1','upsell2','downsell','done')),
  total_cents INTEGER CHECK (total_cents IS NULL OR total_cents >= 0),
  version INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_demo_orders_expires ON demo_orders(expires_at);
CREATE TABLE IF NOT EXISTS demo_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES demo_orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted','declined')),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_demo_events_order ON demo_events(order_id,created_at);
