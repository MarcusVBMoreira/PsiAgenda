import { formatDateLabel, formatISODate } from "@/lib/date";
import SessionListItem, { type SessionRow } from "./SessionListItem";

export default function DayView({ date, sessions }: { date: Date; sessions: SessionRow[] }) {
  const baseHref = `/agenda?view=dia&date=${formatISODate(date)}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold capitalize text-slate-900 dark:text-slate-100">
        {formatDateLabel(date)}
      </h2>
      {sessions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Nenhum agendamento para este dia.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionListItem key={session.id} session={session} baseHref={baseHref} />
          ))}
        </div>
      )}
    </div>
  );
}
