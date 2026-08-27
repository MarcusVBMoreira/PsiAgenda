import Link from "next/link";
import { addDays, addMonths, formatISODate } from "@/lib/date";

type ViewType = "dia" | "semana" | "mes";

function shift(view: ViewType, date: Date, direction: 1 | -1): Date {
  if (view === "dia") return addDays(date, direction);
  if (view === "semana") return addDays(date, 7 * direction);
  return addMonths(date, direction);
}

export default function ViewSwitcher({ view, date }: { view: ViewType; date: Date }) {
  const today = formatISODate(new Date());
  const prevDate = formatISODate(shift(view, date, -1));
  const nextDate = formatISODate(shift(view, date, 1));

  const tabs: { key: ViewType; label: string }[] = [
    { key: "dia", label: "Dia" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mes" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link
          href={`/agenda?view=${view}&date=${prevDate}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Anterior"
        >
          ‹
        </Link>
        <Link
          href={`/agenda?view=${view}&date=${today}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Hoje
        </Link>
        <Link
          href={`/agenda?view=${view}&date=${nextDate}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Proximo"
        >
          ›
        </Link>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/agenda?view=${tab.key}&date=${formatISODate(date)}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
              view === tab.key
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Link
        href={`/agenda/novo?date=${formatISODate(date)}`}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        + Novo agendamento
      </Link>
    </div>
  );
}
