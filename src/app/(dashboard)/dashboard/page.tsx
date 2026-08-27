import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { CalendarPlus, UserPlus, Bell, ArrowRight, Eye } from "lucide-react";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { extractTimePart, formatDateLabel, formatISODate } from "@/lib/date";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, MODALITY_LABELS } from "@/components/agenda/session-meta";
import IconLink from "@/components/ui/IconLink";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const today = formatISODate(new Date());

  const [todaySessions] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.scheduled_at, s.duration_minutes, s.modality, s.status,
            p.id AS patient_id, p.full_name AS patient_name
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.user_id = ? AND DATE(s.scheduled_at) = ?
     ORDER BY s.scheduled_at ASC`,
    [user!.id, today]
  );

  const [[adherenceCount]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM adherence_alerts a
     JOIN patients p ON p.id = a.patient_id
     WHERE p.user_id = ? AND a.status = 'pendente'`,
    [user!.id]
  );

  const [[retentionCount]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM retention_alerts r
     JOIN patients p ON p.id = r.patient_id
     WHERE p.user_id = ?`,
    [user!.id]
  );

  const totalAlerts = Number(adherenceCount.total) + Number(retentionCount.total);
  const confirmedToday = todaySessions.filter((s) => s.status === "confirmado" || s.status === "finalizada").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Ola, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formatDateLabel(new Date())}
        </p>
      </div>

      <div className="animate-fade-in-up grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/agenda/novo"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-transform duration-150 group-hover:scale-105 dark:bg-slate-100 dark:text-slate-900">
            <CalendarPlus className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Novo agendamento</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Marcar uma sessao</p>
          </div>
        </Link>

        <Link
          href="/pacientes/novo"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-transform duration-150 group-hover:scale-105 dark:bg-slate-100 dark:text-slate-900">
            <UserPlus className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Novo paciente</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cadastrar paciente</p>
          </div>
        </Link>

        <Link
          href="/alertas"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-150 group-hover:scale-105 ${
              totalAlerts > 0 ? "bg-amber-500" : "bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            }`}
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {totalAlerts} {totalAlerts === 1 ? "alerta ativo" : "alertas ativos"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ver central de alertas</p>
          </div>
        </Link>
      </div>

      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sessoes de hoje
            </h2>
            <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
              {todaySessions.length === 0
                ? "Nenhuma sessao hoje"
                : `${confirmedToday} de ${todaySessions.length} confirmadas ou finalizadas`}
            </p>
          </div>
          <Link
            href={`/agenda?view=dia&date=${today}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Ver na agenda
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        {todaySessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Nenhuma sessao agendada para hoje.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              >
                <Link
                  href={`/agenda?view=dia&date=${today}&session=${session.id}`}
                  className="absolute inset-0"
                  aria-label={`Abrir sessao de ${session.patient_name}`}
                />
                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-medium text-slate-700 dark:text-slate-200">
                    {extractTimePart(session.scheduled_at)}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{session.patient_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {MODALITY_LABELS[session.modality] ?? session.modality} · {session.duration_minutes} min
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex shrink-0 items-center gap-2">
                  <IconLink
                    href={`/pacientes/${session.patient_id}/visualizar`}
                    icon={Eye}
                    label="Ver perfil do paciente"
                  />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[session.status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {STATUS_LABELS[session.status] ?? session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
