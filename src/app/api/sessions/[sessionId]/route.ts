import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { updateSessionSchema } from "@/lib/validators/sessions";
import { toMySQLDatetime } from "@/lib/date";
import { maybeAutoSendConfirmation } from "@/lib/session-messaging";

async function findSession(sessionId: string, userId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*, p.full_name AS patient_name, p.reminders_enabled AS patient_reminders_enabled,
            p.reminder_lead_7_dias AS patient_reminder_lead_7_dias,
            p.reminder_lead_2_dias AS patient_reminder_lead_2_dias,
            p.reminder_lead_24_horas AS patient_reminder_lead_24_horas
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.id = ? AND s.user_id = ?
     LIMIT 1`,
    [sessionId, userId]
  );
  return rows[0] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = await findSession(sessionId, user.id);
  if (!session) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  const [noteRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM session_notes WHERE session_id = ? LIMIT 1",
    [sessionId]
  );

  const [rescheduledToRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.scheduled_at
     FROM reschedules r
     JOIN sessions s ON s.id = r.new_session_id
     WHERE r.original_session_id = ?
     LIMIT 1`,
    [sessionId]
  );

  const [rescheduledFromRows] = await pool.query<RowDataPacket[]>(
    `SELECT r.reason, r.requested_by, r.charged, s.id AS original_session_id, s.scheduled_at
     FROM reschedules r
     JOIN sessions s ON s.id = r.original_session_id
     WHERE r.new_session_id = ?
     LIMIT 1`,
    [sessionId]
  );

  await logAccess({
    userId: user.id,
    patientId: session.patient_id,
    recordType: "session",
    recordId: session.id,
    action: "visualizou",
  });

  return NextResponse.json({
    session: {
      ...session,
      has_note: noteRows.length > 0,
      rescheduled_to: rescheduledToRows[0] ?? null,
      rescheduled_from: rescheduledFromRows[0] ?? null,
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;
  const existing = await findSession(sessionId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;

  await pool.query(
    `UPDATE sessions SET
       scheduled_at = ?, duration_minutes = ?, modality = ?, platform_link = ?, status = ?,
       cancellation_reason = ?, send_confirmation = ?, send_reminders = ?,
       reminder_lead_7_dias = ?, reminder_lead_2_dias = ?, reminder_lead_24_horas = ?
     WHERE id = ? AND user_id = ?`,
    [
      toMySQLDatetime(data.scheduledAt),
      data.durationMinutes,
      data.modality,
      data.platformLink,
      data.status,
      data.cancellationReason,
      data.sendConfirmation,
      data.sendReminders,
      data.reminderLead7Dias,
      data.reminderLead2Dias,
      data.reminderLead24Horas,
      sessionId,
      user.id,
    ]
  );

  await logAccess({
    userId: user.id,
    patientId: existing.patient_id,
    recordType: "session",
    recordId: sessionId,
    action: "editou",
  });

  await maybeAutoSendConfirmation(sessionId, user.id, existing.status, data.status);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;
  const existing = await findSession(sessionId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  await pool.query("DELETE FROM sessions WHERE id = ? AND user_id = ?", [sessionId, user.id]);

  await logAccess({
    userId: user.id,
    patientId: existing.patient_id,
    recordType: "session",
    recordId: sessionId,
    action: "excluiu",
  });

  return NextResponse.json({ ok: true });
}
