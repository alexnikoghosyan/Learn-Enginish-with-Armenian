-- Լիգաներ. շաբաթական XP, խմբեր, մասնակիցների կարգավիճակ (տե՛ս worker/leaderboard.mjs)
ALTER TABLE profiles ADD COLUMN xp_total INTEGER;
--> statement-breakpoint
ALTER TABLE profiles ADD COLUMN lb_status INTEGER;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS league_members (
  account_id TEXT PRIMARY KEY NOT NULL,
  league INTEGER NOT NULL DEFAULT 0,
  group_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  seen_at INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS league_members_group ON league_members (group_id, week);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS league_members_week ON league_members (week, league);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS league_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value INTEGER NOT NULL
);
