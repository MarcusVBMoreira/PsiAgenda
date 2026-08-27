import { Eye } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";
import ReviewAdherenceButton from "@/components/alertas/ReviewAdherenceButton";
import IconLink from "@/components/ui/IconLink";

const INTERVAL_LABELS: Record<string, string> = {
  "7_dias": "7 dias antes",
  "2_dias": "2 dias antes",
  "24_horas": "24 horas antes",
};

const REMINDER_STATUS_BADGE: Record<string, string> = {
  enviado: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  falhou: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  agendado: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

function dateLabelFromSql(value: string) {
  return formatDateLabel(parseISODate(value.split(" ")[0]));
}

export default async function AlertasPage() {
  const user = await getCurrentUser();

  const [reminders] = await pool.query<RowDataPacket[]>(
    `SELECT r.id, r.interval_type, r.channel, r.status, r.sent_at,
            p.id AS patient_id, p.full_name AS patient_name, s.scheduled_at
     FROM reminders r
     JOIN patients p ON p.id = r.patient_id
     JOIN sessions s ON s.id = r.session_id
     WHERE p.user_id = ?
     ORDER BY r.sent_at DESC, r.id DESC
     LIMIT 20`,
    [user!.id]
  );

  const [adherenceAlerts] = await pool.query<RowDataPacket[]>(
    `SELECT a.id, a.expected_interval_days, a.actual_interval_days, a.detected_at,
            p.id AS patient_id, p.full_name AS patient_name
     FROM adherence_alerts a
     JOIN patients p ON p.id = a.patient_id
     WHERE p.user_id = ? AND a.status = 'pendente'
     ORDER BY a.detected_at DESC`,
    [user!.id]
  );

  const [retentionAlerts] = await pool.query<RowDataPacket[]>(
    `SELECT ra.id, ra.record_reference_date, ra.retention_deadline, ra.alert_sent,
            p.id AS patient_id, p.full_name AS patient_name
     FROM retention_alerts ra
     JOIN patients p ON p.id = ra.patient_id
     WHERE p.user_id = ?
     ORDER BY ra.retention_deadline ASC`,
    [user!.id]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Central de alertas</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lembretes, aderencia ao tratamento e prazos de guarda documental.
        </p>
      </div>

      <div className="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Alertas de aderencia ao tratamento
          </h2>
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
            {adherenceAlerts.length} {adherenceAlerts.length === 1 ? "pendente" : "pendentes"}
          </p>
        </div>

        {adherenceAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum alerta de aderencia pendente.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {adherenceAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/40"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{alert.patient_name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Intervalo esperado de {alert.expected_interval_days} dias, ultimo intervalo real de{" "}
                    {alert.actual_interval_days} dias · detectado em {dateLabelFromSql(alert.detected_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <IconLink
                    href={`/pacientes/${alert.patient_id}/visualizar`}
                    icon={Eye}
                    label="Ver perfil do paciente"
                  />
                  <ReviewAdherenceButton alertId={alert.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Alertas de guarda documental
          </h2>
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
            {retentionAlerts.length} {retentionAlerts.length === 1 ? "registro" : "registros"}
          </p>
        </div>

        {retentionAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum prazo de guarda documental proximo do vencimento.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {retentionAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{alert.patient_name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ultimo registro em {formatDateLabel(parseISODate(alert.record_reference_date))} · guarda
                    ate {formatDateLabel(parseISODate(alert.retention_deadline))}
                  </p>
                </div>
                <IconLink
                  href={`/pacientes/${alert.patient_id}/visualizar`}
                  icon={Eye}
                  label="Ver perfil do paciente"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Lembretes enviados
          </h2>
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">Ultimos 20 lembretes processados.</p>
        </div>

        {reminders.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum lembrete processado ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{reminder.patient_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sessao em {dateLabelFromSql(reminder.scheduled_at)} as{" "}
                    {extractTimePart(reminder.scheduled_at)} · {INTERVAL_LABELS[reminder.interval_type]} ·{" "}
                    {reminder.channel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <IconLink
                    href={`/pacientes/${reminder.patient_id}/visualizar`}
                    icon={Eye}
                    label="Ver perfil do paciente"
                  />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${REMINDER_STATUS_BADGE[reminder.status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {reminder.status}
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
