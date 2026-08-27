import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators/settings";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
    [user.id]
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, row.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);

  return NextResponse.json({ ok: true });
}
