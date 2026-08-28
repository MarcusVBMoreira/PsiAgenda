-- Per-patient opt-out, per-session opt-out (confirmation and reminders are
-- independent), and a record of when the confirmation message went out.
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER status;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS send_confirmation BOOLEAN NOT NULL DEFAULT TRUE AFTER status,
  ADD COLUMN IF NOT EXISTS send_reminders BOOLEAN NOT NULL DEFAULT TRUE AFTER send_confirmation,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP NULL DEFAULT NULL AFTER send_reminders;

-- "manual" represents an on-demand send (the "enviar agora" buttons), as
-- opposed to the three automatic lead-time intervals.
ALTER TABLE reminders
  MODIFY COLUMN interval_type ENUM('7_dias', '2_dias', '24_horas', 'manual') NOT NULL;
