-- Adds "finalizada" to the session status enum: set automatically whenever
-- a session note (session_notes) is saved for a session, so the patient's
-- timeline can distinguish "confirmed but not yet documented" from "done".
ALTER TABLE sessions
  MODIFY COLUMN status ENUM(
    'livre', 'pendente', 'confirmado', 'finalizada', 'reagendado',
    'cancelado_cobrado', 'cancelado_sem_cobranca'
  ) NOT NULL DEFAULT 'pendente';
