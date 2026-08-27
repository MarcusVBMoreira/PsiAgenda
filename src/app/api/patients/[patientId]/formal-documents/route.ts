import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { savePdf } from "@/lib/document-storage";
import { generateFormalDocumentPdf } from "@/server/services/pdf-generator/formal-document-pdf";
import { formalDocumentSchema } from "@/lib/validators/formal-document";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { patientId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = formalDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const [patientRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, full_name FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, user.id]
  );
  const patient = patientRows[0];
  if (!patient) {
    return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
  }

  const data = parsed.data;
  const buffer = await generateFormalDocumentPdf({
    professional: { fullName: user.fullName, crpNumber: user.crpNumber },
    patient: { fullName: patient.full_name },
    type: data.type,
    title: data.title,
    body: data.body,
  });

  const documentId = crypto.randomUUID();
  await savePdf(`${documentId}.pdf`, buffer);

  await pool.query(
    `INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version)
     VALUES (?, ?, NULL, ?, ?, FALSE)`,
    [documentId, patientId, data.type, `${documentId}.pdf`]
  );

  await logAccess({
    userId: user.id,
    patientId,
    recordType: "document",
    recordId: documentId,
    action: "criou",
  });

  return NextResponse.json({ id: documentId }, { status: 201 });
}
