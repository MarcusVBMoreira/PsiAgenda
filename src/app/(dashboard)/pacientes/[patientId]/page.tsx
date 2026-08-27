import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import PatientForm from "@/components/pacientes/PatientForm";
import PatientSessionHistory, {
  type PatientSessionRow,
} from "@/components/pacientes/PatientSessionHistory";
import BackLink from "@/components/ui/BackLink";
import IconLink from "@/components/ui/IconLink";

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const user = await getCurrentUser();
  const { patientId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, user!.id]
  );
  const patient = rows[0];
  if (!patient) {
    notFound();
  }

  await logAccess({
    userId: user!.id,
    patientId: patient.id,
    recordType: "patient",
    recordId: patient.id,
    action: "visualizou",
  });

  const [sessionRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, sequential_number, scheduled_at, status
     FROM sessions
     WHERE patient_id = ? AND user_id = ?
     ORDER BY scheduled_at DESC`,
    [patientId, user!.id]
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href="/pacientes" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{patient.full_name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edite os dados do paciente abaixo.</p>
          </div>
          <IconLink href={`/pacientes/${patient.id}/visualizar`} icon={Eye} label="Ver perfil do paciente" />
        </div>
      </div>
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <PatientForm
          patientId={patient.id}
          initialValues={{
            fullName: patient.full_name,
            birthDate: patient.birth_date ?? "",
            phone: patient.phone ?? "",
            email: patient.email ?? "",
            emergencyContactName: patient.emergency_contact_name ?? "",
            emergencyContactPhone: patient.emergency_contact_phone ?? "",
            medicalHistory: patient.medical_history ?? "",
            medications: patient.medications ?? "",
            treatmentFrequency: patient.treatment_frequency,
            status: patient.status,
            remindersEnabled: Boolean(patient.reminders_enabled),
            reminderLead7Dias: patient.reminder_lead_7_dias,
            reminderLead2Dias: patient.reminder_lead_2_dias,
            reminderLead24Horas: patient.reminder_lead_24_horas,
          }}
        />
      </div>

      <PatientSessionHistory sessions={sessionRows as PatientSessionRow[]} />
    </div>
  );
}
