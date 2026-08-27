import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { deletePdf } from "@/lib/document-storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { documentId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.id, d.patient_id, d.file_url
     FROM documents d
     JOIN patients p ON p.id = d.patient_id
     WHERE d.id = ? AND p.user_id = ?
     LIMIT 1`,
    [documentId, user.id]
  );
  const document = rows[0];
  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  await pool.query("DELETE FROM documents WHERE id = ?", [documentId]);
  await deletePdf(document.file_url);

  await logAccess({
    userId: user.id,
    patientId: document.patient_id,
    recordType: "document",
    recordId: documentId,
    action: "excluiu",
  });

  return NextResponse.json({ ok: true });
}
