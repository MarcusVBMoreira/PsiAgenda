-- MySQL/MariaDB's legacy "explicit_defaults_for_timestamp=0" behavior makes
-- the first NOT NULL TIMESTAMP column in a table auto-update to NOW() on
-- ANY UPDATE to that row, even one that never touches the column, unless it
-- has its own explicit DEFAULT. sessions.scheduled_at and
-- verification_codes.expires_at were both declared "TIMESTAMP NOT NULL"
-- with no default and were silently inheriting this behavior — e.g.
-- rescheduleSession()'s "UPDATE sessions SET status = 'reagendado'" was
-- overwriting scheduled_at with the current time. Giving each column its
-- own explicit DEFAULT (without ON UPDATE) removes the auto-update magic.
ALTER TABLE sessions
  MODIFY COLUMN scheduled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE verification_codes
  MODIFY COLUMN expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
