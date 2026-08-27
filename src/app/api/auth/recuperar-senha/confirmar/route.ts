import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { verifyAndConsumeCode } from "@/lib/verification-codes";
import { confirmPasswordResetSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = confirmPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const { email, code, newPassword } = parsed.data;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Codigo invalido ou expirado." }, { status: 400 });
  }

  const isValid = await verifyAndConsumeCode(user.id, "recuperacao_senha", code);
  if (!isValid) {
    return NextResponse.json({ error: "Codigo invalido ou expirado." }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, user.id]);

  return NextResponse.json({ ok: true });
}
