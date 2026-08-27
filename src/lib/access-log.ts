import pool from "@/lib/db";

type AccessAction = "visualizou" | "criou" | "editou" | "excluiu";

export async function logAccess(params: {
  userId: string;
  patientId?: string | null;
  recordType: string;
  recordId: string;
  action: AccessAction;
}) {
  await pool.query(
    `INSERT INTO access_logs (id, user_id, patient_id, record_type, record_id, action)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      params.userId,
      params.patientId ?? null,
      params.recordType,
      params.recordId,
      params.action,
    ]
  );
}
