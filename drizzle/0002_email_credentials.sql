CREATE TABLE IF NOT EXISTS credentials (
  account_id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  iterations INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_attempts (
  attempt_key TEXT NOT NULL,
  at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_attempts_key_at ON auth_attempts (attempt_key, at);
