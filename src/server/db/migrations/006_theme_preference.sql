-- Per-user light/dark/system appearance preference, set on Configuracoes.
-- Used only as the initial default for a fresh browser/device — the actual
-- live toggling and no-flash behaviour is handled client-side by
-- next-themes (backed by localStorage) once the app has loaded.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme_preference ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system' AFTER two_factor_enabled;
