import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { sessionNoteSchema } from "@/lib/validators/session-notes";

async function findOwnedSession(sessionId: string, userId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, patient_id, status FROM sessions WHERE id = ? AND user_id = ? LIMIT 1",
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
  const session = await findOwnedSession(sessionId, user.id);
  if (!session) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM session_notes WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
  const note = rows[0] ?? null;

  if (note) {
    await logAccess({
      userId: user.id,
      patientId: session.patient_id,
      recordType: "session_note",
      recordId: note.id,
      action: "visualizou",
    });
  }

  return NextResponse.json({ note });
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
  const session = await findOwnedSession(sessionId, user.id);
  if (!session) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sessionNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;

  const [existingRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM session_notes WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
  const existing = existingRows[0] ?? null;
  const noteId = existing?.id ?? crypto.randomUUID();

  if (!existing && session.status !== "confirmado") {
    return NextResponse.json(
      { error: "O registro de sessao so pode ser criado apos a sessao ser confirmada." },
      { status: 400 }
    );
  }

  if (existing) {
    await pool.query(
      `UPDATE session_notes SET keyword_summary = ?, full_report = ?, theoretical_references = ?
       WHERE id = ?`,
      [data.keywordSummary, data.fullReport, data.theoreticalReferences, noteId]
    );
  } else {
    await pool.query(
      `INSERT INTO session_notes (id, session_id, keyword_summary, full_report, theoretical_references)
       VALUES (?, ?, ?, ?, ?)`,
      [noteId, sessionId, data.keywordSummary, data.fullReport, data.theoreticalReferences]
    );
  }

  // Only flip confirmado -> finalizada. A session that was since cancelled
  // or rescheduled keeps that status even if its note is edited afterwards
  // (e.g. fixing a typo) — those are more definitive than "documented".
  await pool.query("UPDATE sessions SET status = 'finalizada' WHERE id = ? AND status = 'confirmado'", [
    sessionId,
  ]);

  await logAccess({
    userId: user.id,
    patientId: session.patient_id,
    recordType: "session_note",
    recordId: noteId,
    action: existing ? "editou" : "criou",
  });

  return NextResponse.json({ id: noteId });
}
