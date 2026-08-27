import { NextRequest, NextResponse } from "next/server";
import { consumePending2FAUserId, clearPending2FA, createSession } from "@/lib/auth";
import { verifyAndConsumeCode } from "@/lib/verification-codes";
import { verifyCodeSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const userId = await consumePending2FAUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Sessao de verificacao expirada. Faca login novamente." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Codigo invalido." }, { status: 400 });
  }

  const isValid = await verifyAndConsumeCode(userId, "dois_fatores", parsed.data.code);
  if (!isValid) {
    return NextResponse.json({ error: "Codigo invalido ou expirado." }, { status: 400 });
  }

  await clearPending2FA();
  await createSession(userId);

  return NextResponse.json({ ok: true });
}
