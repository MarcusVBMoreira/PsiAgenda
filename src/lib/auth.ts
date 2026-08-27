import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const SESSION_COOKIE = "psiagenda_session";
const PENDING_2FA_COOKIE = "psiagenda_pending_2fa";
const SALT_ROUNDS = 12;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET nao definido nas variaveis de ambiente.");
}

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  crpNumber: string;
  twoFactorEnabled: boolean;
  themePreference: "light" | "dark" | "system";
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(userId: string): string {
  return jwt.sign({ sub: userId, typ: "session" }, JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });
}

export function signPending2FAToken(userId: string): string {
  return jwt.sign({ sub: userId, typ: "pending_2fa" }, JWT_SECRET as string, {
    expiresIn: "10m",
  });
}

function verifyToken(token: string, expectedType: "session" | "pending_2fa"): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload;
    if (payload.typ !== expectedType || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function createPending2FA(userId: string) {
  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, signPending2FAToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function consumePending2FAUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token, "pending_2fa");
}

export async function clearPending2FA() {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = verifyToken(token, "session");
  if (!userId) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, full_name, email, crp_number, two_factor_enabled, theme_preference FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    crpNumber: row.crp_number,
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    themePreference: row.theme_preference,
  };
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Nao autenticado.");
  }
  return user;
}
