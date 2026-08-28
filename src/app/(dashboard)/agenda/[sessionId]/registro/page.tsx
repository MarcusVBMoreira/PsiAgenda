import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import BackLink from "@/components/ui/BackLink";
import IconLink from "@/components/ui/IconLink";
import SessionNoteForm from "@/components/agenda/SessionNoteForm";
import GeneratePdfButton from "@/components/pacientes/GeneratePdfButton";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";
import { MODALITY_LABELS, STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/components/agenda/session-meta";

export default async function SessionRegistroPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  const { sessionId } = await params;

  const [sessionRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*, p.full_name AS patient_name
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.id = ? AND s.user_id = ?
     LIMIT 1`,
    [sessionId, user!.id]
  );
  const session = sessionRows[0];
  if (!session) {
    notFound();
  }

  const [noteRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM session_notes WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
  const note = noteRows[0] ?? null;

  await logAccess({
    userId: user!.id,
    patientId: session.patient_id,
    recordType: "session",
    recordId: session.id,
    action: "visualizou",
  });

  const scheduledDate = parseISODate(session.scheduled_at.split(" ")[0]);
  const backHref = `/agenda?view=dia&date=${session.scheduled_at.split(" ")[0]}`;
  const canWriteNote = note || session.status === "confirmado";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href={backHref} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Atendimento {session.sequential_number}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{session.patient_name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatDateLabel(scheduledDate)} as {extractTimePart(session.scheduled_at)} ·{" "}
              {MODALITY_LABELS[session.modality] ?? session.modality} · {session.duration_minutes} min
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[session.status] ?? "bg-slate-100 text-slate-600"}`}
            >
              {STATUS_LABELS[session.status] ?? session.status}
            </span>
            <IconLink
              href={`/pacientes/${session.patient_id}/visualizar`}
              icon={Eye}
              label="Ver perfil do paciente"
            />
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {canWriteNote ? (
          <SessionNoteForm
            sessionId={session.id}
            backHref={backHref}
            initialValues={{
              keywordSummary: note?.keyword_summary ?? "",
              fullReport: note?.full_report ?? "",
              theoreticalReferences: note?.theoretical_references ?? "",
            }}
          />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            O registro de sessao so pode ser preenchido apos a sessao ser confirmada. Altere o status
            do agendamento para &ldquo;Confirmado&rdquo; para liberar o registro.
          </p>
        )}
      </div>

      {note && (
        <GeneratePdfButton
          label="Exportar PDF desta sessao"
          endpoint={`/api/sessions/${session.id}/documents`}
          redirectTo={`/pacientes/${session.patient_id}/visualizar?tab=documentos`}
        />
      )}
    </div>
  );
}
