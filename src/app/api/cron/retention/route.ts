import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { runRetentionChecker } from "@/server/services/retention-checker";

async function handle(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const results = await runRetentionChecker();
  return NextResponse.json({ ok: true, ...results });
}

export const GET = handle;
export const POST = handle;
