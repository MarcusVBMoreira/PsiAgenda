import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BackLink from "@/components/ui/BackLink";
import NewSessionForm from "@/components/agenda/NewSessionForm";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; patientId?: string }>;
}) {
  const user = await getCurrentUser();
  const { date, patientId } = await searchParams;

  const [patients] = await pool.query<RowDataPacket[]>(
    "SELECT id, full_name FROM patients WHERE user_id = ? ORDER BY full_name ASC",
    [user!.id]
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href="/agenda" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo agendamento</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Marque uma nova sessao para um paciente.
          </p>
        </div>
      </div>
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <NewSessionForm
          patients={patients as { id: string; full_name: string }[]}
          defaultDate={date}
          defaultPatientId={patientId}
        />
      </div>
    </div>
  );
}
