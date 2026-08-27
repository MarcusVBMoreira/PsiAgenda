import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { patientSchema } from "@/lib/validators/patients";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";

  const conditions = ["user_id = ?"];
  const values: (string | number)[] = [user.id];

  if (search) {
    conditions.push("full_name LIKE ?");
    values.push(`%${search}%`);
  }

  if (status && ["ativo", "inativo", "encerrado"].includes(status)) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, treatment_frequency, status, created_at
     FROM patients
     WHERE ${conditions.join(" AND ")}
     ORDER BY full_name ASC`,
    values
  );

  return NextResponse.json({ patients: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;
  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO patients (
       id, user_id, full_name, birth_date, phone, email,
       emergency_contact_name, emergency_contact_phone,
       medical_history, medications, treatment_frequency, status, reminders_enabled,
       reminder_lead_7_dias, reminder_lead_2_dias, reminder_lead_24_horas
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.id,
      data.fullName,
      data.birthDate,
      data.phone,
      data.email,
      data.emergencyContactName,
      data.emergencyContactPhone,
      data.medicalHistory,
      data.medications,
      data.treatmentFrequency,
      data.status,
      data.remindersEnabled,
      data.reminderLead7Dias,
      data.reminderLead2Dias,
      data.reminderLead24Horas,
    ]
  );

  await logAccess({
    userId: user.id,
    patientId: id,
    recordType: "patient",
    recordId: id,
    action: "criou",
  });

  return NextResponse.json({ id }, { status: 201 });
}
