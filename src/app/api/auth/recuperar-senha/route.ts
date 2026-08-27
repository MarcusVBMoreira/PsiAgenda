import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { createVerificationCode } from "@/lib/verification-codes";
import { sendPasswordResetCodeEmail } from "@/lib/mailer";
import { requestPasswordResetSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const { email } = parsed.data;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const user = rows[0];

  if (user) {
    const code = await createVerificationCode(user.id, "recuperacao_senha");
    await sendPasswordResetCodeEmail(email, code);
  }

  // Resposta identica exista ou nao o e-mail, para nao expor quais contas existem.
  return NextResponse.json({ ok: true });
}
