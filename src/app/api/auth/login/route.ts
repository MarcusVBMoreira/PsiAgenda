import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { verifyPassword, createSession, createPending2FA } from "@/lib/auth";
import { createVerificationCode } from "@/lib/verification-codes";
import { sendTwoFactorCodeEmail } from "@/lib/mailer";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, password_hash, two_factor_enabled FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  if (user.two_factor_enabled) {
    const code = await createVerificationCode(user.id, "dois_fatores");
    await sendTwoFactorCodeEmail(email, code);
    await createPending2FA(user.id);
    return NextResponse.json({ requires2FA: true });
  }

  await createSession(user.id);
  return NextResponse.json({ requires2FA: false });
}
