import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendReminderNow } from "@/lib/session-messaging";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { sessionId } = await params;
  const result = await sendReminderNow(sessionId, user.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  if (!result.email && !result.whatsapp) {
    return NextResponse.json(
      { error: "Nenhum canal disponivel: confira os canais habilitados nas Configuracoes e os dados de contato do paciente." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, email: result.email, whatsapp: result.whatsapp });
}
