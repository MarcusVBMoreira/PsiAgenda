"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { EDITABLE_STATUS_LABELS, MODALITY_LABELS } from "./session-meta";

export default function NewSessionForm({
  patients,
  defaultDate,
  defaultPatientId,
}: {
  patients: { id: string; full_name: string }[];
  defaultDate?: string;
  defaultPatientId?: string;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(defaultPatientId ?? patients[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState(defaultDate ? `${defaultDate}T09:00` : "");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<"presencial" | "online">("presencial");
  const [platformLink, setPlatformLink] = useState("");
  const [status, setStatus] = useState("pendente");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [reminderLead7Dias, setReminderLead7Dias] = useState<"padrao" | "sim" | "nao">("padrao");
  const [reminderLead2Dias, setReminderLead2Dias] = useState<"padrao" | "sim" | "nao">("padrao");
  const [reminderLead24Horas, setReminderLead24Horas] = useState<"padrao" | "sim" | "nao">("padrao");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!patientId) {
      setError("Cadastre um paciente antes de criar um agendamento.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          scheduledAt,
          durationMinutes,
          modality,
          platformLink,
          status,
          sendConfirmation,
          sendReminders,
          reminderLead7Dias,
          reminderLead2Dias,
          reminderLead24Horas,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel criar o agendamento.");
        return;
      }

      router.push("/agenda");
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (patients.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Voce ainda nao tem pacientes cadastrados.{" "}
        <Link href="/pacientes/novo" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
          Cadastre um paciente
        </Link>{" "}
        para poder agendar sessoes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Paciente" id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.full_name}
          </option>
        ))}
      </Select>

      <Field
        label="Data e horario"
        id="scheduledAt"
        type="datetime-local"
        required
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />

      <Field
        label="Duracao (minutos)"
        id="durationMinutes"
        type="number"
        min={5}
        max={480}
        required
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(Number(e.target.value))}
      />

      <Select
        label="Modalidade"
        id="modality"
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
          id="platformLink"
          placeholder="https://meet.google.com/..."
          value={platformLink}
          onChange={(e) => setPlatformLink(e.target.value)}
        />
      )}

      <Select label="Status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {Object.entries(EDITABLE_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={sendConfirmation}
            onChange={(e) => setSendConfirmation(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
          Enviar confirmacao automatica quando a sessao for confirmada
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={sendReminders}
            onChange={(e) => setSendReminders(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
          Enviar lembretes automaticos para esta sessao
        </label>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Depende tambem do paciente estar habilitado para lembretes nas configuracoes do paciente.
        </p>

        <div className="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Antecedencia dos lembretes para esta sessao
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Por padrao usa a antecedencia do paciente (ou do profissional, se o paciente tambem estiver
            no padrao). Ajuste aqui so para esta sessao.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="7 dias antes"
              id="new-session-reminderLead7Dias"
              value={reminderLead7Dias}
              onChange={(e) => setReminderLead7Dias(e.target.value as "padrao" | "sim" | "nao")}
            >
              <option value="padrao">Usar padrao</option>
              <option value="sim">Sempre enviar</option>
              <option value="nao">Nunca enviar</option>
            </Select>
            <Select
              label="2 dias antes"
              id="new-session-reminderLead2Dias"
              value={reminderLead2Dias}
              onChange={(e) => setReminderLead2Dias(e.target.value as "padrao" | "sim" | "nao")}
            >
              <option value="padrao">Usar padrao</option>
              <option value="sim">Sempre enviar</option>
              <option value="nao">Nunca enviar</option>
            </Select>
            <Select
              label="24 horas antes"
              id="new-session-reminderLead24Horas"
              value={reminderLead24Horas}
              onChange={(e) => setReminderLead24Horas(e.target.value as "padrao" | "sim" | "nao")}
            >
              <option value="padrao">Usar padrao</option>
              <option value="sim">Sempre enviar</option>
              <option value="nao">Nunca enviar</option>
            </Select>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <Button type="submit" isLoading={isLoading} className="px-6">
          Cadastrar agendamento
        </Button>
        <Link
          href="/agenda"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
