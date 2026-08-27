import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { toMySQLDatetime } from "@/lib/date";
import type { CreateSessionInput } from "@/lib/validators/sessions";

export async function createSessionWithSequentialNumber(
  userId: string,
  input: CreateSessionInput
): Promise<string> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Lock the patient row (which always exists) rather than the MAX(...)
    // aggregate over sessions (which locks nothing when the patient has no
    // sessions yet), so concurrent requests for the same patient serialize
    // instead of deadlocking or racing to the same sequential_number.
    const [ownerRows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM patients WHERE id = ? AND user_id = ? LIMIT 1 FOR UPDATE",
      [input.patientId, userId]
    );
    if (ownerRows.length === 0) {
      throw new Error("PATIENT_NOT_FOUND");
    }

    const [numberRows] = await conn.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sequential_number), 0) + 1 AS next_number FROM sessions WHERE patient_id = ?",
      [input.patientId]
    );
    const sequentialNumber = numberRows[0].next_number as number;

    const id = crypto.randomUUID();
    await conn.query(
      `INSERT INTO sessions (
         id, patient_id, user_id, sequential_number, scheduled_at,
         duration_minutes, modality, platform_link, status,
         send_confirmation, send_reminders,
         reminder_lead_7_dias, reminder_lead_2_dias, reminder_lead_24_horas
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.patientId,
        userId,
        sequentialNumber,
        toMySQLDatetime(input.scheduledAt),
        input.durationMinutes,
        input.modality,
        input.platformLink,
        input.status,
        input.sendConfirmation,
        input.sendReminders,
        input.reminderLead7Dias,
        input.reminderLead2Dias,
        input.reminderLead24Horas,
      ]
    );

    await conn.commit();
    return id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
