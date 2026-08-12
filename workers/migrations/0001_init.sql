CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  org_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  wallet_balance REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Default',
  revoked_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS quote_logs (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  api_key_id TEXT,
  vehicle TEXT NOT NULL,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  dest_lat REAL NOT NULL,
  dest_lng REAL NOT NULL,
  distance_km REAL NOT NULL,
  duration_mins INTEGER NOT NULL,
  price_ghs REAL NOT NULL,
  latency_ms INTEGER NOT NULL,
  success INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS rate_configs (
  account_id TEXT PRIMARY KEY,
  rates_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_quote_logs_account_created
  ON quote_logs(account_id, created_at);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
