import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BackLink from "@/components/ui/BackLink";
import IconLink from "@/components/ui/IconLink";
import FormalDocumentForm from "@/components/pacientes/FormalDocumentForm";

export default async function NovoDocumentoFormalPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const user = await getCurrentUser();
  const { patientId } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, full_name FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, user!.id]
  );
  const patient = rows[0];
  if (!patient) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href={`/pacientes/${patient.id}/visualizar?tab=documentos`} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo documento formal</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patient.full_name}</p>
          </div>
          <IconLink href={`/pacientes/${patient.id}/visualizar`} icon={Eye} label="Ver perfil do paciente" />
        </div>
      </div>
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <FormalDocumentForm patientId={patient.id} patientName={patient.full_name} />
      </div>
    </div>
  );
}
