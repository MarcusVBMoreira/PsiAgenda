import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { cadastroSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = cadastroSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const { fullName, crpNumber, email, password } = parsed.data;

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: "Ja existe uma conta com este e-mail." }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, crp_number, two_factor_enabled)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    [id, fullName, email, passwordHash, crpNumber]
  );

  await createSession(id);

  return NextResponse.json({ ok: true });
}
