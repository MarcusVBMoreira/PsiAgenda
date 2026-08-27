import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validators/settings";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;
  await pool.query("UPDATE users SET full_name = ?, crp_number = ?, phone = ? WHERE id = ?", [
    data.fullName,
    data.crpNumber,
    data.phone,
    user.id,
  ]);

  return NextResponse.json({ ok: true });
}
