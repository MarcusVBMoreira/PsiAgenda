import Link from "next/link";
import {
  addDays,
  extractDatePart,
  extractTimePart,
  formatISODate,
  isSameDate,
  isSameMonth,
  WEEKDAY_LABELS,
} from "@/lib/date";
import { STATUS_DOT_CLASSES } from "./session-meta";
import type { SessionRow } from "./SessionListItem";

const MAX_VISIBLE_PER_DAY = 3;

export default function MonthView({
  gridStart,
  monthReference,
  sessions,
}: {
  gridStart: Date;
  monthReference: Date;
  sessions: SessionRow[];
}) {
  const today = new Date();
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = formatISODate(day);
          const daySessions = sessions
            .filter((s) => extractDatePart(s.scheduled_at) === iso)
            .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
          const inMonth = isSameMonth(day, monthReference);
          const visible = daySessions.slice(0, MAX_VISIBLE_PER_DAY);
          const overflow = daySessions.length - visible.length;

          return (
            <div
              key={iso}
              className={`flex min-h-[92px] min-w-0 flex-col gap-1 border-b border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800 ${
                inMonth ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-950/40"
              }`}
            >
              <Link
                href={`/agenda?view=dia&date=${iso}`}
                className={`self-end rounded-full px-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  isSameDate(day, today)
                    ? "bg-slate-800 px-2 py-0.5 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    : inMonth
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-300 dark:text-slate-700"
                }`}
              >
                {day.getDate()}
              </Link>
              <div className="flex flex-col gap-0.5">
                {visible.map((session) => (
                  <Link
                    key={session.id}
                    href={`/agenda?view=mes&date=${formatISODate(gridStart)}&session=${session.id}`}
                    className="flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    title={session.patient_name}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASSES[session.status] ?? "bg-slate-300"}`} />
                    <span className="shrink-0 text-slate-400 dark:text-slate-500">
                      {extractTimePart(session.scheduled_at)}
                    </span>
                    <span className="truncate">{session.patient_name}</span>
                  </Link>
                ))}
                {overflow > 0 && (
                  <Link
                    href={`/agenda?view=dia&date=${iso}`}
                    className="px-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    +{overflow} mais
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
