ALTER TABLE profiles ADD COLUMN daily_goal INTEGER NOT NULL DEFAULT 10;
--> statement-breakpoint
ALTER TABLE profiles ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;
