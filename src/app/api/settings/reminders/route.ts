import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reminderPreferencesSchema } from "@/lib/validators/settings";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reminderPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;
  await pool.query(
    `UPDATE users SET
       reminder_channel_email = ?, reminder_channel_whatsapp = ?,
       reminder_interval_7_dias = ?, reminder_interval_2_dias = ?, reminder_interval_24_horas = ?
     WHERE id = ?`,
    [
      data.channelEmail,
      data.channelWhatsapp,
      data.interval7Dias,
      data.interval2Dias,
      data.interval24Horas,
      user.id,
    ]
  );

  return NextResponse.json({ ok: true });
}
