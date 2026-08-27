import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { sendSessionReminderEmail } from "@/lib/mailer";
import { sendSessionReminderWhatsApp } from "@/lib/whatsapp";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";

const INTERVALS: {
  type: "7_dias" | "2_dias" | "24_horas";
  days: number;
  preferenceColumn: "reminder_interval_7_dias" | "reminder_interval_2_dias" | "reminder_interval_24_horas";
  leadColumn: "reminder_lead_7_dias" | "reminder_lead_2_dias" | "reminder_lead_24_horas";
}[] = [
  { type: "7_dias", days: 7, preferenceColumn: "reminder_interval_7_dias", leadColumn: "reminder_lead_7_dias" },
  { type: "2_dias", days: 2, preferenceColumn: "reminder_interval_2_dias", leadColumn: "reminder_lead_2_dias" },
  { type: "24_horas", days: 1, preferenceColumn: "reminder_interval_24_horas", leadColumn: "reminder_lead_24_horas" },
];

const CHANNELS: {
  type: "email" | "whatsapp";
  preferenceColumn: "reminder_channel_email" | "reminder_channel_whatsapp";
  destinationColumn: "patient_email" | "patient_phone";
  send: (
    to: string,
    params: { patientName: string; professionalName: string; dateLabel: string; timeLabel: string }
  ) => Promise<void>;
}[] = [
  {
    type: "email",
    preferenceColumn: "reminder_channel_email",
    destinationColumn: "patient_email",
    send: sendSessionReminderEmail,
  },
  {
    type: "whatsapp",
    preferenceColumn: "reminder_channel_whatsapp",
    destinationColumn: "patient_phone",
    send: sendSessionReminderWhatsApp,
  },
];

/**
 * Meant to run once a day via an external cron job (see /api/cron/reminders).
 * For each lead time, finds confirmed sessions landing exactly on that day,
 * then resolves whether that lead time actually fires via a 3-level cascade
 * (session override > patient override > the owning professional's global
 * default in Configuracoes > Preferencias de lembretes), and — when it does
 * — sends through whichever channels the professional has enabled, skipping
 * any (session, interval, channel) combo already created.
 * E-mail actually goes out (via SMTP); WhatsApp is wired the same way but
 * stays a no-op log until WHATSAPP_API_URL/WHATSAPP_API_TOKEN are set (see
 * src/lib/whatsapp.ts) — no code changes needed here when that happens.
 */
export async function runReminderScheduler() {
  const results = { created: 0, sent: 0, failed: 0 };

  for (const interval of INTERVALS) {
    const [sessions] = await pool.query<RowDataPacket[]>(
      `SELECT s.id AS session_id, s.patient_id, s.scheduled_at,
              p.full_name AS patient_name, p.email AS patient_email, p.phone AS patient_phone,
              u.full_name AS professional_name,
              CASE
                WHEN s.${interval.leadColumn} <> 'padrao' THEN (s.${interval.leadColumn} = 'sim')
                WHEN p.${interval.leadColumn} <> 'padrao' THEN (p.${interval.leadColumn} = 'sim')
                ELSE u.${interval.preferenceColumn}
              END AS interval_enabled,
              u.reminder_channel_email, u.reminder_channel_whatsapp
       FROM sessions s
       JOIN patients p ON p.id = s.patient_id
       JOIN users u ON u.id = s.user_id
       WHERE s.status = 'confirmado'
         AND s.send_reminders = TRUE
         AND p.reminders_enabled = TRUE
         AND DATE(s.scheduled_at) = DATE(DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [interval.days]
    );

    for (const session of sessions) {
      if (!session.interval_enabled) continue;

      for (const channel of CHANNELS) {
        if (!session[channel.preferenceColumn]) continue;

        const [existing] = await pool.query<RowDataPacket[]>(
          `SELECT id FROM reminders WHERE session_id = ? AND interval_type = ? AND channel = ? LIMIT 1`,
          [session.session_id, interval.type, channel.type]
        );
        if (existing.length > 0) continue;

        const destination = session[channel.destinationColumn];
        let status: "enviado" | "falhou" = "enviado";

        if (!destination) {
          status = "falhou";
        } else {
          try {
            const [datePart] = session.scheduled_at.split(" ");
            await channel.send(destination, {
              patientName: session.patient_name,
              professionalName: session.professional_name,
              dateLabel: formatDateLabel(parseISODate(datePart)),
              timeLabel: extractTimePart(session.scheduled_at),
            });
          } catch (err) {
            console.error(`[reminder-scheduler] falha ao enviar lembrete via ${channel.type}`, err);
            status = "falhou";
          }
        }

        await pool.query(
          `INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            crypto.randomUUID(),
            session.session_id,
            session.patient_id,
            interval.type,
            channel.type,
            status,
            status === "enviado" ? new Date() : null,
          ]
        );

        results.created += 1;
        if (status === "enviado") results.sent += 1;
        else results.failed += 1;
      }
    }
  }

  return results;
}
