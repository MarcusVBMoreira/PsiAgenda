-- Adds a cancellation reason field to sessions, captured whenever a session
-- is cancelled (with or without charge) via the dedicated cancel flow.
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER status;
