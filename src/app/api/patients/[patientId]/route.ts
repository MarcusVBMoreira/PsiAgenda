import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import { patientSchema } from "@/lib/validators/patients";

async function findPatient(patientId: string, userId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, userId]
  );
  return rows[0] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { patientId } = await params;
  const patient = await findPatient(patientId, user.id);
  if (!patient) {
    return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
  }

  await logAccess({
    userId: user.id,
    patientId: patient.id,
    recordType: "patient",
    recordId: patient.id,
    action: "visualizou",
  });

  return NextResponse.json({ patient });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { patientId } = await params;
  const existing = await findPatient(patientId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const data = parsed.data;

  await pool.query(
    `UPDATE patients SET
       full_name = ?, birth_date = ?, phone = ?, email = ?,
       emergency_contact_name = ?, emergency_contact_phone = ?,
       medical_history = ?, medications = ?, treatment_frequency = ?, status = ?,
       reminders_enabled = ?, reminder_lead_7_dias = ?, reminder_lead_2_dias = ?, reminder_lead_24_horas = ?
     WHERE id = ? AND user_id = ?`,
    [
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
      patientId,
      user.id,
    ]
  );

  await logAccess({
    userId: user.id,
    patientId,
    recordType: "patient",
    recordId: patientId,
    action: "editou",
  });

  return NextResponse.json({ ok: true });
}
