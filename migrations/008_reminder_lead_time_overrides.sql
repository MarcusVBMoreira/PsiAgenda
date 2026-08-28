-- Per-patient and per-session overrides for which reminder lead times fire,
-- on top of the professional's global default (users.reminder_interval_*,
-- see 005_reminder_preferences.sql). Each column is 'padrao' (inherit),
-- 'sim' (force on) or 'nao' (force off). Resolution order per interval:
-- session override -> patient override -> professional's global default.
-- Read by src/server/services/reminder-scheduler/index.ts.

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS reminder_lead_7_dias ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER reminders_enabled,
  ADD COLUMN IF NOT EXISTS reminder_lead_2_dias ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER reminder_lead_7_dias,
  ADD COLUMN IF NOT EXISTS reminder_lead_24_horas ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER reminder_lead_2_dias;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS reminder_lead_7_dias ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER send_reminders,
  ADD COLUMN IF NOT EXISTS reminder_lead_2_dias ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER reminder_lead_7_dias,
  ADD COLUMN IF NOT EXISTS reminder_lead_24_horas ENUM('padrao', 'sim', 'nao') NOT NULL DEFAULT 'padrao' AFTER reminder_lead_2_dias;
