import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { createSessionSchema } from "@/lib/validators/sessions";
import { createSessionWithSequentialNumber } from "@/lib/sessions";
import { maybeAutoSendConfirmation } from "@/lib/session-messaging";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  try {
    const id = await createSessionWithSequentialNumber(user.id, parsed.data);

    await logAccess({
      userId: user.id,
      patientId: parsed.data.patientId,
      recordType: "session",
      recordId: id,
      action: "criou",
    });

    await maybeAutoSendConfirmation(id, user.id, "", parsed.data.status);

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PATIENT_NOT_FOUND") {
      return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
    }
    throw err;
  }
}
