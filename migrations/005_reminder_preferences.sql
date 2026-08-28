-- Per-professional reminder preferences: which channels to send through and
-- which of the three lead times to use. Configured on the Configuracoes
-- screen; read by the reminder-scheduler cron job instead of the previous
-- hardcoded "all three intervals, e-mail only" default.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reminder_channel_email BOOLEAN NOT NULL DEFAULT TRUE AFTER no_show_charge_policy,
  ADD COLUMN IF NOT EXISTS reminder_channel_whatsapp BOOLEAN NOT NULL DEFAULT FALSE AFTER reminder_channel_email,
  ADD COLUMN IF NOT EXISTS reminder_interval_7_dias BOOLEAN NOT NULL DEFAULT TRUE AFTER reminder_channel_whatsapp,
  ADD COLUMN IF NOT EXISTS reminder_interval_2_dias BOOLEAN NOT NULL DEFAULT TRUE AFTER reminder_interval_7_dias,
  ADD COLUMN IF NOT EXISTS reminder_interval_24_horas BOOLEAN NOT NULL DEFAULT TRUE AFTER reminder_interval_2_dias;
