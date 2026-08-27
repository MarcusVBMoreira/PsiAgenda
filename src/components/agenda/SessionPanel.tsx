"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import DeleteIconButton from "@/components/ui/DeleteIconButton";
import IconLink from "@/components/ui/IconLink";
import { extractTimePart, formatDateLabel, parseISODate, toDatetimeLocalInput } from "@/lib/date";
import {
  CANCELLED_STATUSES,
  EDITABLE_STATUS_LABELS,
  MODALITY_LABELS,
  REQUESTED_BY_LABELS,
  STATUS_LABELS,
} from "./session-meta";

type RescheduleLink = {
  id: string;
  scheduled_at: string;
};

type RescheduleOrigin = RescheduleLink & {
  reason: string;
  requested_by: "paciente" | "profissional";
  charged: 0 | 1;
  original_session_id: string;
};

type SessionDetail = {
  id: string;
  patient_id: string;
  patient_name: string;
  sequential_number: number;
  scheduled_at: string;
  duration_minutes: number;
  modality: "presencial" | "online";
  platform_link: string | null;
  status: string;
  cancellation_reason: string | null;
  has_note: boolean;
  send_confirmation: 0 | 1;
  send_reminders: 0 | 1;
  confirmation_sent_at: string | null;
  patient_reminders_enabled: 0 | 1;
  reminder_lead_7_dias: "padrao" | "sim" | "nao";
  reminder_lead_2_dias: "padrao" | "sim" | "nao";
  reminder_lead_24_horas: "padrao" | "sim" | "nao";
  patient_reminder_lead_7_dias: "padrao" | "sim" | "nao";
  patient_reminder_lead_2_dias: "padrao" | "sim" | "nao";
  patient_reminder_lead_24_horas: "padrao" | "sim" | "nao";
  rescheduled_to: RescheduleLink | null;
  rescheduled_from: RescheduleOrigin | null;
};

const RESCHEDULABLE_STATUSES = ["livre", "pendente", "confirmado"];

function formatDateTimeLabel(datetime: string) {
  const [datePart] = datetime.split(" ");
  return `${formatDateLabel(parseISODate(datePart))} as ${extractTimePart(datetime)}`;
}

export default function SessionPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<"presencial" | "online">("presencial");
  const [platformLink, setPlatformLink] = useState("");
  const [status, setStatus] = useState("pendente");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [reminderLead7Dias, setReminderLead7Dias] = useState<"padrao" | "sim" | "nao">("padrao");
  const [reminderLead2Dias, setReminderLead2Dias] = useState<"padrao" | "sim" | "nao">("padrao");
  const [reminderLead24Horas, setReminderLead24Horas] = useState<"padrao" | "sim" | "nao">("padrao");
  const [isSendingConfirmation, setIsSendingConfirmation] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [requestedBy, setRequestedBy] = useState<"paciente" | "profissional">("paciente");
  const [charged, setCharged] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelCharged, setCancelCharged] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // Loading flag must be set before the fetch starts; this is the
    // standard "fetch on param change" effect pattern, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    setShowReschedule(false);
    setShowCancel(false);

    fetch(`/api/sessions/${sessionId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Nao foi possivel carregar o agendamento.");
        return data.session as SessionDetail;
      })
      .then((data) => {
        setSession(data);
        setScheduledAt(toDatetimeLocalInput(data.scheduled_at));
        setDurationMinutes(data.duration_minutes);
        setModality(data.modality);
        setPlatformLink(data.platform_link ?? "");
        setStatus(data.status);
        setSendConfirmation(Boolean(data.send_confirmation));
        setSendReminders(Boolean(data.send_reminders));
        setReminderLead7Dias(data.reminder_lead_7_dias);
        setReminderLead2Dias(data.reminder_lead_2_dias);
        setReminderLead24Horas(data.reminder_lead_24_horas);
        setSendFeedback(null);
        setNewScheduledAt(toDatetimeLocalInput(data.scheduled_at));
        setCancelReason(data.cancellation_reason ?? "");
        setCancelCharged(data.status === "cancelado_cobrado");
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  function openSession(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("session", id);
    router.push(`/agenda?${params.toString()}`);
  }

  function close() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("session");
    router.push(`/agenda?${params.toString()}`);
  }

  async function handleDelete() {
    if (!session) return;

    const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Nao foi possivel excluir.");

    router.refresh();
    close();
  }

  async function handleSave() {
    if (!session) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          durationMinutes,
          modality,
          platformLink,
          status,
          cancellationReason: cancelReason,
          sendConfirmation,
          sendReminders,
          reminderLead7Dias,
          reminderLead2Dias,
          reminderLead24Horas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel salvar.");

      router.refresh();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    if (!session) return;
    setIsCancelling(true);
    setError(null);

    const cancelledStatus = cancelCharged ? "cancelado_cobrado" : "cancelado_sem_cobranca";

    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          durationMinutes,
          modality,
          platformLink,
          status: cancelledStatus,
          cancellationReason: cancelReason,
          sendConfirmation,
          sendReminders,
          reminderLead7Dias,
          reminderLead2Dias,
          reminderLead24Horas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel cancelar.");

      setStatus(cancelledStatus);
      setShowCancel(false);
      router.refresh();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleReschedule() {
    if (!session) return;
    setIsRescheduling(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${session.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newScheduledAt, reason, requestedBy, charged }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel reagendar.");

      router.refresh();
      openSession(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsRescheduling(false);
    }
  }

  async function handleSendConfirmation() {
    if (!session) return;
    setIsSendingConfirmation(true);
    setSendFeedback(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/send-confirmation`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel enviar a confirmacao.");
      setSendFeedback("Confirmacao enviada.");
      router.refresh();
    } catch (err) {
      setSendFeedback(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsSendingConfirmation(false);
    }
  }

  async function handleSendReminder() {
    if (!session) return;
    setIsSendingReminder(true);
    setSendFeedback(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/send-reminder`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel enviar o lembrete.");
      setSendFeedback("Lembrete enviado.");
      router.refresh();
    } catch (err) {
      setSendFeedback(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsSendingReminder(false);
    }
  }

  if (!sessionId) return null;

  const canWriteNote = session && (session.status === "confirmado" || session.has_note);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={close}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
      />
      <div className="animate-fade-in-up relative flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-white p-6 shadow-xl dark:bg-slate-900">
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {session && !isLoading && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Atendimento {session.sequential_number}
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{session.patient_name}</h2>
              </div>
              <IconLink
                href={`/pacientes/${session.patient_id}/visualizar`}
                icon={Eye}
                label="Ver perfil do paciente"
              />
            </div>

            {session.rescheduled_to && (
              <button
                type="button"
                onClick={() => openSession(session.rescheduled_to!.id)}
                className="rounded-md border border-blue-200 bg-blue-50 p-3 text-left text-sm text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/60"
              >
                Reagendado para {formatDateTimeLabel(session.rescheduled_to.scheduled_at)} →
              </button>
            )}
            {session.rescheduled_from && (
              <button
                type="button"
                onClick={() => openSession(session.rescheduled_from!.original_session_id)}
                className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span>
                  ← Reagendado de {formatDateTimeLabel(session.rescheduled_from.scheduled_at)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Motivo: {session.rescheduled_from.reason} · Solicitado por{" "}
                  {REQUESTED_BY_LABELS[session.rescheduled_from.requested_by]} ·{" "}
                  {session.rescheduled_from.charged ? "Com cobranca" : "Sem cobranca"}
                </span>
              </button>
            )}

            <div className="flex flex-col gap-4">
              <Field
                label="Data e horario"
                id="panel-scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <Field
                label="Duracao (minutos)"
                id="panel-duration"
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
              <Select
                label="Modalidade"
                id="panel-modality"
                value={modality}
                onChange={(e) => setModality(e.target.value as "presencial" | "online")}
              >
                {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {modality === "online" && (
                <Field
                  label="Link da plataforma"
                  id="panel-platformLink"
                  placeholder="https://meet.google.com/..."
                  value={platformLink}
                  onChange={(e) => setPlatformLink(e.target.value)}
                />
              )}
              <Select label="Status" id="panel-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(EDITABLE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
                {!(status in EDITABLE_STATUS_LABELS) && (
                  <option value={status}>{STATUS_LABELS[status] ?? status}</option>
                )}
              </Select>
            </div>

            <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Confirmacao e lembretes
              </p>
              {!session.patient_reminders_enabled && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Este paciente esta com envios automaticos desativados nas configuracoes do paciente,
                  mesmo que as opcoes abaixo estejam marcadas.
                </p>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={sendConfirmation}
                  onChange={(e) => setSendConfirmation(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Enviar confirmacao automatica quando confirmada
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={sendReminders}
                  onChange={(e) => setSendReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Enviar lembretes automaticos
              </label>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Antecedencia dos lembretes so para esta sessao
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  &quot;Usar padrao&quot; segue a antecedencia do paciente (
                  {session.patient_reminder_lead_7_dias === "padrao" &&
                  session.patient_reminder_lead_2_dias === "padrao" &&
                  session.patient_reminder_lead_24_horas === "padrao"
                    ? "que hoje segue o padrao do profissional"
                    : "que este paciente ja personalizou"}
                  ).
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Select
                    label="7 dias antes"
                    id="panel-reminderLead7Dias"
                    value={reminderLead7Dias}
                    onChange={(e) => setReminderLead7Dias(e.target.value as "padrao" | "sim" | "nao")}
                  >
                    <option value="padrao">Usar padrao</option>
                    <option value="sim">Sempre enviar</option>
                    <option value="nao">Nunca enviar</option>
                  </Select>
                  <Select
                    label="2 dias antes"
                    id="panel-reminderLead2Dias"
                    value={reminderLead2Dias}
                    onChange={(e) => setReminderLead2Dias(e.target.value as "padrao" | "sim" | "nao")}
                  >
                    <option value="padrao">Usar padrao</option>
                    <option value="sim">Sempre enviar</option>
                    <option value="nao">Nunca enviar</option>
                  </Select>
                  <Select
                    label="24 horas antes"
                    id="panel-reminderLead24Horas"
                    value={reminderLead24Horas}
                    onChange={(e) => setReminderLead24Horas(e.target.value as "padrao" | "sim" | "nao")}
                  >
                    <option value="padrao">Usar padrao</option>
                    <option value="sim">Sempre enviar</option>
                    <option value="nao">Nunca enviar</option>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                {session.confirmation_sent_at
                  ? `Confirmacao enviada em ${formatDateTimeLabel(session.confirmation_sent_at)}.`
                  : "Confirmacao ainda nao enviada."}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendConfirmation}
                  isLoading={isSendingConfirmation}
                  className="px-3 py-1.5 text-xs"
                >
                  Enviar confirmacao agora
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendReminder}
                  isLoading={isSendingReminder}
                  className="px-3 py-1.5 text-xs"
                >
                  Enviar lembrete agora
                </Button>
              </div>
              {sendFeedback && (
                <p className="text-xs text-slate-600 dark:text-slate-300">{sendFeedback}</p>
              )}
            </div>

            {canWriteNote && (
              <Link
                href={`/agenda/${session.id}/registro`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Registro de sessao
              </Link>
            )}

            {RESCHEDULABLE_STATUSES.includes(session.status) && (
              <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                {showReschedule ? (
                  <>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Reagendar sessao</p>
                    <Field
                      label="Nova data e horario"
                      id="reschedule-newScheduledAt"
                      type="datetime-local"
                      value={newScheduledAt}
                      onChange={(e) => setNewScheduledAt(e.target.value)}
                    />
                    <TextArea
                      label="Motivo"
                      id="reschedule-reason"
                      rows={2}
                      placeholder="Ex.: Paciente com imprevisto de trabalho"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <Select
                      label="Solicitado por"
                      id="reschedule-requestedBy"
                      value={requestedBy}
                      onChange={(e) => setRequestedBy(e.target.value as "paciente" | "profissional")}
                    >
                      {Object.entries(REQUESTED_BY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={charged}
                        onChange={(e) => setCharged(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                      />
                      Houve cobranca pelo reagendamento
                    </label>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={handleReschedule}
                        isLoading={isRescheduling}
                        className="px-4 py-1.5 text-xs"
                      >
                        Confirmar reagendamento
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowReschedule(false)}
                        className="px-4 py-1.5 text-xs"
                      >
                        Fechar
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReschedule(true)}
                    className="self-start text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Reagendar sessao
                  </button>
                )}
              </div>
            )}

            {session.status !== "reagendado" && (
              <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                {showCancel ? (
                  <>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Cancelar sessao</p>
                    <TextArea
                      label="Motivo do cancelamento"
                      id="cancel-reason"
                      rows={2}
                      placeholder="Ex.: Paciente informou que nao podera comparecer"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={cancelCharged}
                        onChange={(e) => setCancelCharged(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                      />
                      Houve cobranca pelo cancelamento
                    </label>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={handleCancel}
                        isLoading={isCancelling}
                        className="px-4 py-1.5 text-xs"
                      >
                        Confirmar cancelamento
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowCancel(false)}
                        className="px-4 py-1.5 text-xs"
                      >
                        Fechar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {CANCELLED_STATUSES.includes(session.status as "cancelado_cobrado" | "cancelado_sem_cobranca") &&
                      session.cancellation_reason && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Motivo do cancelamento: {session.cancellation_reason}
                        </p>
                      )}
                    <button
                      type="button"
                      onClick={() => setShowCancel(true)}
                      className="self-start text-sm font-medium text-red-600 transition-colors hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
                    >
                      {CANCELLED_STATUSES.includes(session.status as "cancelado_cobrado" | "cancelado_sem_cobranca")
                        ? "Editar cancelamento"
                        : "Cancelar sessao"}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving} className="px-6">
                  Salvar alteracoes
                </Button>
                <Button type="button" variant="secondary" onClick={close}>
                  Fechar
                </Button>
              </div>

              <DeleteIconButton
                label="Excluir agendamento"
                title="Excluir este agendamento?"
                description="Tambem remove o registro de sessao vinculado a ele, se houver. Esta acao nao pode ser desfeita."
                onConfirm={handleDelete}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
