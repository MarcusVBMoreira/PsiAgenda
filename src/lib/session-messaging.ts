import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { sendSessionConfirmationEmail, sendSessionReminderEmail } from "@/lib/mailer";
import { sendSessionConfirmationWhatsApp, sendSessionReminderWhatsApp } from "@/lib/whatsapp";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";

type SessionMessagingRow = RowDataPacket & {
  id: string;
  patient_id: string;
  user_id: string;
  scheduled_at: string;
  status: string;
  send_confirmation: number;
  send_reminders: number;
  confirmation_sent_at: string | null;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  patient_reminders_enabled: number;
  professional_name: string;
  reminder_channel_email: number;
  reminder_channel_whatsapp: number;
};

async function findSessionContext(sessionId: string, userId: string): Promise<SessionMessagingRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.patient_id, s.user_id, s.scheduled_at, s.status,
            s.send_confirmation, s.send_reminders, s.confirmation_sent_at,
            p.full_name AS patient_name, p.email AS patient_email, p.phone AS patient_phone,
            p.reminders_enabled AS patient_reminders_enabled,
            u.full_name AS professional_name,
            u.reminder_channel_email, u.reminder_channel_whatsapp
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.user_id = ?
     LIMIT 1`,
    [sessionId, userId]
  );
  return (rows[0] as SessionMessagingRow) ?? null;
}

function dateTimeLabels(scheduledAt: string) {
  const [datePart] = scheduledAt.split(" ");
  return {
    dateLabel: formatDateLabel(parseISODate(datePart)),
    timeLabel: extractTimePart(scheduledAt),
  };
}

async function sendViaEnabledChannels(
  session: SessionMessagingRow,
  kind: "confirmation" | "reminder"
): Promise<{ email: boolean; whatsapp: boolean }> {
  const { dateLabel, timeLabel } = dateTimeLabels(session.scheduled_at);
  const params = {
    patientName: session.patient_name,
    professionalName: session.professional_name,
    dateLabel,
    timeLabel,
  };
  const sendEmail = kind === "confirmation" ? sendSessionConfirmationEmail : sendSessionReminderEmail;
  const sendWhatsApp =
    kind === "confirmation" ? sendSessionConfirmationWhatsApp : sendSessionReminderWhatsApp;

  let email = false;
  let whatsapp = false;

  if (session.reminder_channel_email && session.patient_email) {
    await sendEmail(session.patient_email, params);
    email = true;
  }
  if (session.reminder_channel_whatsapp && session.patient_phone) {
    await sendWhatsApp(session.patient_phone, params);
    whatsapp = true;
  }

  return { email, whatsapp };
}

/**
 * Sends the "sua sessao foi confirmada" message right now, regardless of the
 * session's send_confirmation flag or whether it was already sent — used by
 * both the automatic on-confirm trigger (which checks those itself first)
 * and the manual "reenviar confirmacao" button.
 */
export async function sendConfirmationNow(
  sessionId: string,
  userId: string
): Promise<{ ok: true; email: boolean; whatsapp: boolean } | { ok: false; error: string }> {
  const session = await findSessionContext(sessionId, userId);
  if (!session) return { ok: false, error: "Agendamento nao encontrado." };

  const { email, whatsapp } = await sendViaEnabledChannels(session, "confirmation");
  await pool.query("UPDATE sessions SET confirmation_sent_at = NOW() WHERE id = ?", [sessionId]);

  return { ok: true, email, whatsapp };
}

/**
 * Sends a reminder right now (the "enviar lembrete agora" button) — logged
 * in `reminders` with interval_type='manual' so it shows up in Central de
 * Alertas alongside the automatic ones.
 */
export async function sendReminderNow(
  sessionId: string,
  userId: string
): Promise<{ ok: true; email: boolean; whatsapp: boolean } | { ok: false; error: string }> {
  const session = await findSessionContext(sessionId, userId);
  if (!session) return { ok: false, error: "Agendamento nao encontrado." };

  const { email, whatsapp } = await sendViaEnabledChannels(session, "reminder");

  if (email) {
    await pool.query(
      `INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at)
       VALUES (?, ?, ?, 'manual', 'email', 'enviado', NOW())`,
      [crypto.randomUUID(), sessionId, session.patient_id]
    );
  }
  if (whatsapp) {
    await pool.query(
      `INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at)
       VALUES (?, ?, ?, 'manual', 'whatsapp', 'enviado', NOW())`,
      [crypto.randomUUID(), sessionId, session.patient_id]
    );
  }

  return { ok: true, email, whatsapp };
}

/**
 * Called right after a session's status is updated — if it just became
 * "confirmado" (and wasn't already), the session allows confirmations, the
 * patient hasn't opted out, and none was sent yet, sends one automatically.
 * No-ops silently otherwise (this is a side effect of a save, not a
 * user-facing action — errors here shouldn't fail the save itself).
 */
export async function maybeAutoSendConfirmation(
  sessionId: string,
  userId: string,
  previousStatus: string,
  newStatus: string
): Promise<void> {
  if (newStatus !== "confirmado" || previousStatus === "confirmado") return;

  try {
    const session = await findSessionContext(sessionId, userId);
    if (!session) return;
    if (!session.send_confirmation) return;
    if (!session.patient_reminders_enabled) return;
    if (session.confirmation_sent_at) return;

    await sendConfirmationNow(sessionId, userId);
  } catch (err) {
    console.error("[session-messaging] falha ao enviar confirmacao automatica", err);
  }
}
