import { NextRequest } from "next/server";

/**
 * Cron endpoints are hit by an external scheduler (Hostinger hPanel Cron
 * Jobs), not by a logged-in user — there's no session cookie to check.
 * Instead they require a shared-secret token, passed either as
 * ?token=... (simplest for a plain `curl` cron command) or as a Bearer
 * Authorization header.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const tokenFromQuery = request.nextUrl.searchParams.get("token");
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const provided = tokenFromQuery ?? tokenFromHeader;
  return provided === secret;
}
