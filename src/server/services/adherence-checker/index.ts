import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { parseISODate } from "@/lib/date";

const FREQUENCY_DAYS: Record<string, number> = {
  semanal: 7,
  quinzenal: 14,
  mensal: 30,
};

// A gap more than 1.5x the expected interval is flagged as a possible drop
// in adherence to the treatment cadence.
const DEVIATION_FACTOR = 1.5;

function daysBetween(newer: string, older: string): number {
  const a = parseISODate(newer.split(" ")[0]);
  const b = parseISODate(older.split(" ")[0]);
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

/**
 * Meant to run periodically via an external cron job (see /api/cron/adherence).
 * For each active patient with a fixed-cadence frequency, compares the gap
 * between their two most recent completed ("finalizada") sessions against
 * what that cadence expects. One pending alert per patient at a time — a new
 * one is only raised after the psychologist reviews the last one.
 */
export async function runAdherenceChecker() {
  const results = { created: 0 };

  const [patients] = await pool.query<RowDataPacket[]>(
    `SELECT id, treatment_frequency FROM patients
     WHERE status = 'ativo' AND treatment_frequency IN ('semanal', 'quinzenal', 'mensal')`
  );

  for (const patient of patients) {
    const expected = FREQUENCY_DAYS[patient.treatment_frequency];

    const [sessions] = await pool.query<RowDataPacket[]>(
      `SELECT scheduled_at FROM sessions
       WHERE patient_id = ? AND status = 'finalizada'
       ORDER BY scheduled_at DESC LIMIT 2`,
      [patient.id]
    );
    if (sessions.length < 2) continue;

    const actualDays = daysBetween(sessions[0].scheduled_at, sessions[1].scheduled_at);
    if (actualDays <= expected * DEVIATION_FACTOR) continue;

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM adherence_alerts WHERE patient_id = ? AND status = 'pendente' LIMIT 1",
      [patient.id]
    );
    if (existing.length > 0) continue;

    await pool.query(
      `INSERT INTO adherence_alerts (id, patient_id, expected_interval_days, actual_interval_days)
       VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), patient.id, expected, actualDays]
    );
    results.created += 1;
  }

  return results;
}
