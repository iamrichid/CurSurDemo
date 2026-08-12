CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  provider TEXT,
  phone TEXT,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_account_created
  ON wallet_transactions(account_id, created_at DESC);
