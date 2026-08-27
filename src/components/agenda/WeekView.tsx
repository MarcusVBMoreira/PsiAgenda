import { addDays, extractDatePart, formatISODate, isSameDate, WEEKDAY_LABELS } from "@/lib/date";
import SessionListItem, { type SessionRow } from "./SessionListItem";

export default function WeekView({
  weekStart,
  sessions,
}: {
  weekStart: Date;
  sessions: SessionRow[];
}) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
      {days.map((day, i) => {
        const iso = formatISODate(day);
        const daySessions = sessions.filter((s) => extractDatePart(s.scheduled_at) === iso);
        const baseHref = `/agenda?view=semana&date=${formatISODate(day)}`;

        return (
          <div
            key={iso}
            className={`flex min-w-0 flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-900 ${
              isSameDate(day, today) ? "border-slate-400 dark:border-slate-500" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                {WEEKDAY_LABELS[i]}
              </span>
              <span
                className={`text-sm font-semibold ${isSameDate(day, today) ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}
              >
                {day.getDate()}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              {daySessions.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400 dark:text-slate-600">—</p>
              ) : (
                daySessions.map((session) => (
                  <SessionListItem key={session.id} session={session} baseHref={baseHref} compact />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
