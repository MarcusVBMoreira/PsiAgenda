import Link from "next/link";
import { Eye } from "lucide-react";
import { extractTimePart } from "@/lib/date";
import IconLink from "@/components/ui/IconLink";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, MODALITY_LABELS } from "./session-meta";

export type SessionRow = {
  id: string;
  patient_id: string;
  patient_name: string;
  scheduled_at: string;
  duration_minutes: number;
  modality: string;
  status: string;
};

function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span
      className={`min-w-0 truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_CLASSES[status] ?? "bg-slate-100 text-slate-600"} ${className}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function SessionListItem({
  session,
  baseHref,
  compact = false,
}: {
  session: SessionRow;
  baseHref: string;
  compact?: boolean;
}) {
  const href = `${baseHref}${baseHref.includes("?") ? "&" : "?"}session=${session.id}`;

  if (compact) {
    return (
      <div className="group relative flex min-w-0 flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 text-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">
        <Link href={href} className="absolute inset-0" aria-label={`Abrir sessao de ${session.patient_name}`} />
        <div className="flex min-w-0 items-center justify-between gap-1">
          <span className="shrink-0 font-medium text-slate-700 dark:text-slate-200">
            {extractTimePart(session.scheduled_at)}
          </span>
          <StatusBadge status={session.status} />
        </div>
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{session.patient_name}</p>
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-slate-500 dark:text-slate-400">
            {MODALITY_LABELS[session.modality] ?? session.modality} · {session.duration_minutes} min
          </p>
          <Link
            href={`/pacientes/${session.patient_id}/visualizar`}
            title="Ver perfil do paciente"
            aria-label="Ver perfil do paciente"
            className="relative z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex min-w-0 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">
      <Link href={href} className="absolute inset-0" aria-label={`Abrir sessao de ${session.patient_name}`} />
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-12 shrink-0 font-medium text-slate-700 dark:text-slate-200">
          {extractTimePart(session.scheduled_at)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 dark:text-slate-100">{session.patient_name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {MODALITY_LABELS[session.modality] ?? session.modality} · {session.duration_minutes} min
          </p>
        </div>
      </div>
      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <IconLink href={`/pacientes/${session.patient_id}/visualizar`} icon={Eye} label="Ver perfil do paciente" />
        <StatusBadge status={session.status} className="px-2.5 py-0.5 text-xs" />
      </div>
    </div>
  );
}
