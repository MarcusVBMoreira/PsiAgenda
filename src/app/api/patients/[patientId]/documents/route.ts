import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { savePdf } from "@/lib/document-storage";
import { generatePatientPdf } from "@/server/services/pdf-generator/patient-pdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { patientId } = await params;
  const body = await request.json().catch(() => ({}));
  const includeAccessible = Boolean(body?.includeAccessible);

  const [patientRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, user.id]
  );
  const patient = patientRows[0];
  if (!patient) {
    return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
  }

  const [sessionRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.sequential_number, s.scheduled_at, s.status, n.keyword_summary
     FROM sessions s
     LEFT JOIN session_notes n ON n.session_id = s.id
     WHERE s.patient_id = ? AND s.user_id = ?
     ORDER BY s.scheduled_at ASC`,
    [patientId, user.id]
  );

  const baseInput = {
    professional: { fullName: user.fullName, crpNumber: user.crpNumber },
    patient: {
      fullName: patient.full_name,
      birthDate: patient.birth_date,
      phone: patient.phone,
      email: patient.email,
      treatmentFrequency: patient.treatment_frequency,
      medicalHistory: patient.medical_history,
      medications: patient.medications,
    },
    sessions: sessionRows.map((s) => ({
      sequentialNumber: s.sequential_number,
      scheduledAt: s.scheduled_at,
      status: s.status,
      keywordSummary: s.keyword_summary,
    })),
  };

  const created: { id: string; type: string; patientReadableVersion: boolean }[] = [];

  for (const accessible of includeAccessible ? [false, true] : [false]) {
    const buffer = await generatePatientPdf({ ...baseInput, accessible });
    const documentId = crypto.randomUUID();
    const filename = `${documentId}.pdf`;
    await savePdf(filename, buffer);

    await pool.query(
      `INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version)
       VALUES (?, ?, NULL, 'pdf_geral', ?, ?)`,
      [documentId, patientId, filename, accessible]
    );

    await logAccess({
      userId: user.id,
      patientId,
      recordType: "document",
      recordId: documentId,
      action: "criou",
    });

    created.push({ id: documentId, type: "pdf_geral", patientReadableVersion: accessible });
  }

  return NextResponse.json({ documents: created }, { status: 201 });
}
