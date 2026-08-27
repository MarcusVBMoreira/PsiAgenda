import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { toMySQLDatetime } from "@/lib/date";
import type { RescheduleInput } from "@/lib/validators/reschedule";

export async function rescheduleSession(
  userId: string,
  originalSessionId: string,
  input: RescheduleInput
): Promise<string> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [originalRows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM sessions WHERE id = ? AND user_id = ? LIMIT 1 FOR UPDATE",
      [originalSessionId, userId]
    );
    const original = originalRows[0];
    if (!original) {
      throw new Error("SESSION_NOT_FOUND");
    }

    // Lock the patient row too so a concurrent "novo agendamento" for the
    // same patient can't grab the same sequential_number (see sessions.ts).
    await conn.query("SELECT id FROM patients WHERE id = ? FOR UPDATE", [original.patient_id]);

    const [numberRows] = await conn.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sequential_number), 0) + 1 AS next_number FROM sessions WHERE patient_id = ?",
      [original.patient_id]
    );
    const sequentialNumber = numberRows[0].next_number as number;

    const newSessionId = crypto.randomUUID();
    await conn.query(
      `INSERT INTO sessions (
         id, patient_id, user_id, sequential_number, scheduled_at,
         duration_minutes, modality, platform_link, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [
        newSessionId,
        original.patient_id,
        userId,
        sequentialNumber,
        toMySQLDatetime(input.newScheduledAt),
        original.duration_minutes,
        original.modality,
        original.platform_link,
      ]
    );

    await conn.query("UPDATE sessions SET status = 'reagendado' WHERE id = ?", [originalSessionId]);

    await conn.query(
      `INSERT INTO reschedules (id, original_session_id, new_session_id, reason, requested_by, charged)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), originalSessionId, newSessionId, input.reason, input.requestedBy, input.charged]
    );

    await conn.commit();
    return newSessionId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
