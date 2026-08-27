import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { readPdf } from "@/lib/document-storage";
import { DOCUMENT_TYPE_LABELS } from "@/components/pacientes/document-meta";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics left over from NFD normalization
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { documentId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.*, p.full_name AS patient_name
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

  const buffer = await readPdf(document.file_url);

  await logAccess({
    userId: user.id,
    patientId: document.patient_id,
    recordType: "document",
    recordId: document.id,
    action: "visualizou",
  });

  const typeLabel = DOCUMENT_TYPE_LABELS[document.type] ?? document.type;
  const filename = `${slugify(typeLabel)}-${slugify(document.patient_name)}.pdf`;

  return new NextResponse(new Blob([new Uint8Array(buffer)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
