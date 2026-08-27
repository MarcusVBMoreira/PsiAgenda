import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { alertId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.id, a.patient_id
     FROM adherence_alerts a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.id = ? AND p.user_id = ?
     LIMIT 1`,
    [alertId, user.id]
  );
  const alert = rows[0];
  if (!alert) {
    return NextResponse.json({ error: "Alerta nao encontrado." }, { status: 404 });
  }

  await pool.query("UPDATE adherence_alerts SET status = 'revisado' WHERE id = ?", [alertId]);

  await logAccess({
    userId: user.id,
    patientId: alert.patient_id,
    recordType: "adherence_alert",
    recordId: alertId,
    action: "editou",
  });

  return NextResponse.json({ ok: true });
}
