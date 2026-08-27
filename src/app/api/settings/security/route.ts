import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { securitySchema } from "@/lib/validators/settings";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = securitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  await pool.query("UPDATE users SET two_factor_enabled = ? WHERE id = ?", [
    parsed.data.twoFactorEnabled,
    user.id,
  ]);

  return NextResponse.json({ ok: true });
}
