import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { runAdherenceChecker } from "@/server/services/adherence-checker";

async function handle(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const results = await runAdherenceChecker();
  return NextResponse.json({ ok: true, ...results });
}

export const GET = handle;
export const POST = handle;
