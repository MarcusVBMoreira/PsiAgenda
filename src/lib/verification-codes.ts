import bcrypt from "bcrypt";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export type VerificationCodeType = "dois_fatores" | "recuperacao_senha";

const CODE_TTL_MINUTES = 10;
const CODE_SALT_ROUNDS = 10;

function generateNumericCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createVerificationCode(
  userId: string,
  type: VerificationCodeType
): Promise<string> {
  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, CODE_SALT_ROUNDS);
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO verification_codes (id, user_id, code_hash, type, expires_at, used)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    [id, userId, codeHash, type, expiresAt]
  );

  return code;
}

export async function verifyAndConsumeCode(
  userId: string,
  type: VerificationCodeType,
  code: string
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, code_hash, expires_at, used FROM verification_codes
     WHERE user_id = ? AND type = ? AND used = FALSE
     ORDER BY created_at DESC LIMIT 5`,
    [userId, type]
  );

  for (const row of rows) {
    if (new Date(row.expires_at).getTime() < Date.now()) continue;
    const matches = await bcrypt.compare(code, row.code_hash);
    if (matches) {
      await pool.query("UPDATE verification_codes SET used = TRUE WHERE id = ?", [row.id]);
      return true;
    }
  }

  return false;
}
