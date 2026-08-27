import { Suspense } from "react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { addDays, formatISODate, parseISODate, startOfMonth, startOfWeek } from "@/lib/date";
import ViewSwitcher from "@/components/agenda/ViewSwitcher";
import DayView from "@/components/agenda/DayView";
import WeekView from "@/components/agenda/WeekView";
import MonthView from "@/components/agenda/MonthView";
import SessionPanel from "@/components/agenda/SessionPanel";
import type { SessionRow } from "@/components/agenda/SessionListItem";

type View = "dia" | "semana" | "mes";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const user = await getCurrentUser();
  const { view: rawView, date: rawDate } = await searchParams;

  const view: View = rawView === "dia" || rawView === "semana" || rawView === "mes" ? rawView : "semana";
  const referenceDate = rawDate ? parseISODate(rawDate) : new Date();

  let rangeStart: Date;
  let rangeEnd: Date;

  if (view === "dia") {
    rangeStart = referenceDate;
    rangeEnd = referenceDate;
  } else if (view === "semana") {
    rangeStart = startOfWeek(referenceDate);
    rangeEnd = addDays(rangeStart, 6);
  } else {
    const monthStart = startOfMonth(referenceDate);
    rangeStart = startOfWeek(monthStart);
    rangeEnd = addDays(rangeStart, 41);
  }

  const [sessions] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.patient_id, p.full_name AS patient_name, s.scheduled_at,
            s.duration_minutes, s.modality, s.status
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.user_id = ? AND s.scheduled_at BETWEEN ? AND ?
     ORDER BY s.scheduled_at ASC`,
    [user!.id, `${formatISODate(rangeStart)} 00:00:00`, `${formatISODate(rangeEnd)} 23:59:59`]
  );

  const sessionRows = sessions as SessionRow[];

  return (
    <>
      {/* animate-fade-in-up leaves a non-"none" transform on the element (fill-mode
          "both"), which creates a containing block for position:fixed descendants.
          SessionPanel is fixed/full-screen, so it must render outside this div —
          otherwise it gets clipped to the page content's height instead of the
          viewport. */}
      <div className="flex flex-col gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Agenda</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sessoes agendadas, confirmadas e canceladas.
          </p>
        </div>

        <ViewSwitcher view={view} date={referenceDate} />

        {view === "dia" && <DayView date={referenceDate} sessions={sessionRows} />}
        {view === "semana" && <WeekView weekStart={rangeStart} sessions={sessionRows} />}
        {view === "mes" && (
          <MonthView gridStart={rangeStart} monthReference={referenceDate} sessions={sessionRows} />
        )}
      </div>

      <Suspense fallback={null}>
        <SessionPanel />
      </Suspense>
    </>
  );
}
