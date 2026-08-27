import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { savePdf } from "@/lib/document-storage";
import { generateSessionPdf } from "@/server/services/pdf-generator/session-pdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await request.json().catch(() => ({}));
  const includeAccessible = Boolean(body?.includeAccessible);

  const [sessionRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*, p.full_name AS patient_name
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.id = ? AND s.user_id = ?
     LIMIT 1`,
    [sessionId, user.id]
  );
  const session = sessionRows[0];
  if (!session) {
    return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
  }

  const [noteRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM session_notes WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
  const note = noteRows[0];
  if (!note) {
    return NextResponse.json(
      { error: "Esta sessao ainda nao tem um registro de sessao para exportar." },
      { status: 400 }
    );
  }

  const baseInput = {
    professional: { fullName: user.fullName, crpNumber: user.crpNumber },
    patient: { fullName: session.patient_name },
    session: {
      sequentialNumber: session.sequential_number,
      scheduledAt: session.scheduled_at,
      durationMinutes: session.duration_minutes,
      modality: session.modality,
    },
    note: {
      keywordSummary: note.keyword_summary,
      fullReport: note.full_report,
      theoreticalReferences: note.theoretical_references,
    },
  };

  const created: { id: string; type: string; patientReadableVersion: boolean }[] = [];

  for (const accessible of includeAccessible ? [false, true] : [false]) {
    const buffer = await generateSessionPdf({ ...baseInput, accessible });
    const documentId = crypto.randomUUID();
    const filename = `${documentId}.pdf`;
    await savePdf(filename, buffer);

    await pool.query(
      `INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version)
       VALUES (?, ?, ?, 'pdf_sessao', ?, ?)`,
      [documentId, session.patient_id, sessionId, filename, accessible]
    );

    await logAccess({
      userId: user.id,
      patientId: session.patient_id,
      recordType: "document",
      recordId: documentId,
      action: "criou",
    });

    created.push({ id: documentId, type: "pdf_sessao", patientReadableVersion: accessible });
  }

  return NextResponse.json({ documents: created }, { status: 201 });
}
