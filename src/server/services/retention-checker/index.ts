import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { formatISODate, parseISODate } from "@/lib/date";

// Brazilian psychology records don't have a single statutorily fixed
// retention period in the CFP code of ethics; 5 years after the case is
// closed is a commonly used, conservative rule of thumb. Adjust here if the
// professional's own policy differs.
const RETENTION_YEARS = 5;

// Surface the alert this many days before the deadline actually hits, so
// there's time to act instead of finding out the day it's due.
const ALERT_LEAD_DAYS = 90;

/**
 * Meant to run periodically via an external cron job (see /api/cron/retention).
 * For each closed ("encerrado") patient, projects a document-retention
 * deadline from their most recent session (or, absent any, from when the
 * record was last updated) and raises one alert per patient once that
 * deadline is within the lead window.
 */
export async function runRetentionChecker() {
  const results = { created: 0 };

  const [patients] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.updated_at,
            (SELECT MAX(s.scheduled_at) FROM sessions s WHERE s.patient_id = p.id) AS last_session_at
     FROM patients p
     WHERE p.status = 'encerrado'`
  );

  for (const patient of patients) {
    const referenceRaw = patient.last_session_at ?? patient.updated_at;
    const referenceDate = parseISODate(String(referenceRaw).split(" ")[0]);
    const deadline = new Date(referenceDate);
    deadline.setFullYear(deadline.getFullYear() + RETENTION_YEARS);

    const daysUntilDeadline = Math.round((deadline.getTime() - Date.now()) / 86_400_000);
    if (daysUntilDeadline > ALERT_LEAD_DAYS) continue;

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM retention_alerts WHERE patient_id = ? LIMIT 1",
      [patient.id]
    );
    if (existing.length > 0) continue;

    await pool.query(
      `INSERT INTO retention_alerts (id, patient_id, record_reference_date, retention_deadline, alert_sent)
       VALUES (?, ?, ?, ?, FALSE)`,
      [crypto.randomUUID(), patient.id, formatISODate(referenceDate), formatISODate(deadline)]
    );
    results.created += 1;
  }

  return results;
}
