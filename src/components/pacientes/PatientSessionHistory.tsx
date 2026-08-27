import Link from "next/link";
import { formatDateLabel, extractTimePart, parseISODate } from "@/lib/date";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/components/agenda/session-meta";

export type PatientSessionRow = {
  id: string;
  sequential_number: number;
  scheduled_at: string;
  status: string;
};

export default function PatientSessionHistory({ sessions }: { sessions: PatientSessionRow[] }) {
  return (
    <div className="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Historico de sessoes
        </h2>
        <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
          {sessions.length} {sessions.length === 1 ? "sessao registrada" : "sessoes registradas"}
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma sessao agendada para este paciente ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => {
            const datePart = s.scheduled_at.split(" ")[0];
            const isFinalizada = s.status === "finalizada";
            const href = isFinalizada
              ? `/agenda/${s.id}/registro`
              : `/agenda?view=dia&date=${datePart}&session=${s.id}`;

            return (
              <Link
                key={s.id}
                href={href}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Atendimento {s.sequential_number}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateLabel(parseISODate(datePart))} as {extractTimePart(s.scheduled_at)}
                    {isFinalizada && " · ver registro"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[s.status] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
