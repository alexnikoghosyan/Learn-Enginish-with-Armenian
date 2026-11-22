CREATE TABLE profiles (
  account_id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 4),
  source TEXT NOT NULL,
  age_band TEXT NOT NULL,
  reasons TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'bear',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ADD COLUMN daily_goal INTEGER NOT NULL DEFAULT 10;

ALTER TABLE profiles ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;

-- Email + password accounts (account_id = email:<uuid>), rate limiting
CREATE TABLE IF NOT EXISTS credentials (
  account_id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  iterations INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS auth_attempts (
  attempt_key TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_attempts_key_at ON auth_attempts (attempt_key, at);

-- Avatar builder configuration (JSON)
ALTER TABLE profiles ADD COLUMN avatar_config TEXT;
