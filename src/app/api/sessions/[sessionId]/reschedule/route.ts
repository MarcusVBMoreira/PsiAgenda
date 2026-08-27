import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { rescheduleSchema } from "@/lib/validators/reschedule";
import { rescheduleSession } from "@/lib/reschedule";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  try {
    const newSessionId = await rescheduleSession(user.id, sessionId, parsed.data);

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT patient_id FROM sessions WHERE id = ?",
      [newSessionId]
    );
    const patientId = rows[0]?.patient_id ?? null;

    await logAccess({
      userId: user.id,
      patientId,
      recordType: "session",
      recordId: sessionId,
      action: "editou",
    });
    await logAccess({
      userId: user.id,
      patientId,
      recordType: "reschedule",
      recordId: newSessionId,
      action: "criou",
    });

    return NextResponse.json({ id: newSessionId }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_NOT_FOUND") {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }
    throw err;
  }
}
