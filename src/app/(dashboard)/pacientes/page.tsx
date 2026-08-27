import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import IconLink from "@/components/ui/IconLink";
import { FREQUENCY_LABELS, STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/components/pacientes/patient-meta";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  const { search = "", status = "" } = await searchParams;

  const conditions = ["user_id = ?"];
  const values: (string | number)[] = [user!.id];

  if (search) {
    conditions.push("full_name LIKE ?");
    values.push(`%${search}%`);
  }
  if (["ativo", "inativo", "encerrado"].includes(status)) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [patients] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, treatment_frequency, status
     FROM patients
     WHERE ${conditions.join(" AND ")}
     ORDER BY full_name ASC`,
    values
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
          </p>
        </div>
        <Link
          href="/pacientes/novo"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          + Novo paciente
        </Link>
      </div>

      <form method="get" className="flex flex-wrap gap-3 animate-fade-in-up">
        <input
          type="text"
          name="search"
          placeholder="Buscar por nome"
          defaultValue={search}
          className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="encerrado">Encerrado</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Filtrar
        </button>
      </form>

      <div className="animate-fade-in-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Contato</th>
                <th className="px-4 py-2 font-medium">Frequencia</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {patient.full_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                    {patient.email || patient.phone || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                    {FREQUENCY_LABELS[patient.treatment_frequency] ?? patient.treatment_frequency}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[patient.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {STATUS_LABELS[patient.status] ?? patient.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <IconLink
                        href={`/pacientes/${patient.id}/visualizar`}
                        icon={Eye}
                        label="Visualizar paciente"
                      />
                      <IconLink
                        href={`/pacientes/${patient.id}`}
                        icon={Pencil}
                        label="Editar paciente"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
