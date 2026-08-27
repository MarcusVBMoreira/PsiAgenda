-- PsiAgenda — migration inicial
-- MySQL 8+. IDs sao CHAR(36) contendo UUID gerado pela aplicacao (crypto.randomUUID()).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  crp_number VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NULL,
  no_show_charge_policy TEXT NULL,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  type ENUM('dois_fatores', 'recuperacao_senha') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_verification_codes_user (user_id),
  KEY idx_verification_codes_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. patients
CREATE TABLE IF NOT EXISTS patients (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(255) NULL,
  emergency_contact_name VARCHAR(255) NULL,
  emergency_contact_phone VARCHAR(30) NULL,
  medical_history TEXT NULL,
  medications TEXT NULL,
  treatment_frequency ENUM('semanal', 'quinzenal', 'mensal', 'outro') NOT NULL DEFAULT 'semanal',
  status ENUM('ativo', 'inativo', 'encerrado') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_patients_user (user_id),
  KEY idx_patients_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  sequential_number INT NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  modality ENUM('presencial', 'online') NOT NULL DEFAULT 'presencial',
  platform_link VARCHAR(500) NULL,
  status ENUM('livre', 'pendente', 'confirmado', 'reagendado', 'cancelado_cobrado', 'cancelado_sem_cobranca') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_sessions_patient_sequential (patient_id, sequential_number),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_scheduled_at (scheduled_at),
  KEY idx_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. session_notes (1:1 com sessions)
CREATE TABLE IF NOT EXISTS session_notes (
  id CHAR(36) NOT NULL PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  keyword_summary VARCHAR(280) NOT NULL,
  full_report TEXT NOT NULL,
  theoretical_references TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_notes_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_session_notes_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. reschedules — sempre referencia a sessao original
CREATE TABLE IF NOT EXISTS reschedules (
  id CHAR(36) NOT NULL PRIMARY KEY,
  original_session_id CHAR(36) NOT NULL,
  new_session_id CHAR(36) NOT NULL,
  reason TEXT NULL,
  requested_by ENUM('paciente', 'profissional') NOT NULL,
  charged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reschedules_original FOREIGN KEY (original_session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_reschedules_new FOREIGN KEY (new_session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  KEY idx_reschedules_original (original_session_id),
  KEY idx_reschedules_new (new_session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. documents
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  session_id CHAR(36) NULL,
  type ENUM('laudo', 'atestado', 'declaracao', 'relatorio', 'parecer', 'pdf_sessao', 'pdf_geral') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  patient_readable_version BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
  KEY idx_documents_patient (patient_id),
  KEY idx_documents_session (session_id),
  KEY idx_documents_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. reminders
CREATE TABLE IF NOT EXISTS reminders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,
  interval_type ENUM('7_dias', '2_dias', '24_horas') NOT NULL,
  channel ENUM('email', 'whatsapp') NOT NULL DEFAULT 'email',
  status ENUM('agendado', 'enviado', 'falhou') NOT NULL DEFAULT 'agendado',
  sent_at TIMESTAMP NULL,
  CONSTRAINT fk_reminders_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  KEY idx_reminders_session (session_id),
  KEY idx_reminders_patient (patient_id),
  KEY idx_reminders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. adherence_alerts
CREATE TABLE IF NOT EXISTS adherence_alerts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  expected_interval_days INT NOT NULL,
  actual_interval_days INT NOT NULL,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pendente', 'revisado') NOT NULL DEFAULT 'pendente',
  CONSTRAINT fk_adherence_alerts_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  KEY idx_adherence_alerts_patient (patient_id),
  KEY idx_adherence_alerts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. retention_alerts
CREATE TABLE IF NOT EXISTS retention_alerts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  record_reference_date DATE NOT NULL,
  retention_deadline DATE NOT NULL,
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_retention_alerts_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  KEY idx_retention_alerts_patient (patient_id),
  KEY idx_retention_alerts_deadline (retention_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. access_logs
CREATE TABLE IF NOT EXISTS access_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NULL,
  record_type VARCHAR(50) NOT NULL,
  record_id CHAR(36) NOT NULL,
  action ENUM('visualizou', 'criou', 'editou', 'excluiu') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_access_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_access_logs_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  KEY idx_access_logs_user (user_id),
  KEY idx_access_logs_patient (patient_id),
  KEY idx_access_logs_record (record_type, record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
