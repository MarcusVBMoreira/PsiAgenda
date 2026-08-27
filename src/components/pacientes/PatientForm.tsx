"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { formatBrazilianPhone } from "@/lib/format";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-slate-100 pt-6 first:border-t-0 first:pt-0 dark:border-slate-800">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export type PatientFormValues = {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  medications: string;
  treatmentFrequency: "semanal" | "quinzenal" | "mensal" | "outro";
  status: "ativo" | "inativo" | "encerrado";
  remindersEnabled: boolean;
  reminderLead7Dias: "padrao" | "sim" | "nao";
  reminderLead2Dias: "padrao" | "sim" | "nao";
  reminderLead24Horas: "padrao" | "sim" | "nao";
};

const EMPTY_VALUES: PatientFormValues = {
  fullName: "",
  birthDate: "",
  phone: "",
  email: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  medicalHistory: "",
  medications: "",
  treatmentFrequency: "semanal",
  status: "ativo",
  remindersEnabled: true,
  reminderLead7Dias: "padrao",
  reminderLead2Dias: "padrao",
  reminderLead24Horas: "padrao",
};

const LEAD_OVERRIDE_LABELS: Record<"padrao" | "sim" | "nao", string> = {
  padrao: "Usar padrao do profissional",
  sim: "Sempre enviar",
  nao: "Nunca enviar",
};

export default function PatientForm({
  patientId,
  initialValues,
}: {
  patientId?: string;
  initialValues?: Partial<PatientFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PatientFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function update<K extends keyof PatientFormValues>(key: K, value: PatientFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isEditing = Boolean(patientId);
      const res = await fetch(isEditing ? `/api/patients/${patientId}` : "/api/patients", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel salvar o paciente.");
        return;
      }

      router.push("/pacientes");
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormSection title="Dados gerais">
        <Field
          label="Nome completo"
          id="fullName"
          placeholder="Ex.: Maria da Silva"
          required
          value={values.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
        <Field
          label="Data de nascimento"
          id="birthDate"
          type="date"
          placeholder="dd/mm/aaaa"
          value={values.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
        />
        <Field
          label="Telefone"
          id="phone"
          type="tel"
          placeholder="(11) 91234-5678"
          maxLength={15}
          value={values.phone}
          onChange={(e) => update("phone", formatBrazilianPhone(e.target.value))}
        />
        <Field
          label="E-mail"
          id="email"
          type="email"
          placeholder="Ex.: maria@email.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Select
          label="Frequencia de tratamento"
          id="treatmentFrequency"
          value={values.treatmentFrequency}
          onChange={(e) => update("treatmentFrequency", e.target.value as PatientFormValues["treatmentFrequency"])}
        >
          <option value="semanal">Semanal</option>
          <option value="quinzenal">Quinzenal</option>
          <option value="mensal">Mensal</option>
          <option value="outro">Outro</option>
        </Select>
        <Select
          label="Status"
          id="status"
          value={values.status}
          onChange={(e) => update("status", e.target.value as PatientFormValues["status"])}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="encerrado">Encerrado</option>
        </Select>
      </FormSection>

      <FormSection title="Contato de emergencia">
        <Field
          label="Nome"
          id="emergencyContactName"
          placeholder="Ex.: Joao da Silva"
          value={values.emergencyContactName}
          onChange={(e) => update("emergencyContactName", e.target.value)}
        />
        <Field
          label="Telefone"
          id="emergencyContactPhone"
          type="tel"
          placeholder="(11) 91234-5678"
          maxLength={15}
          value={values.emergencyContactPhone}
          onChange={(e) => update("emergencyContactPhone", formatBrazilianPhone(e.target.value))}
        />
      </FormSection>

      <FormSection title="Informacoes clinicas" description="Visivel apenas para voce.">
        <div className="sm:col-span-2">
          <TextArea
            label="Historico medico"
            id="medicalHistory"
            placeholder="Ex.: Ansiedade generalizada, diagnosticada em 2022..."
            value={values.medicalHistory}
            onChange={(e) => update("medicalHistory", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            label="Medicacoes em uso"
            id="medications"
            placeholder="Ex.: Sertralina 50mg — 1x ao dia"
            value={values.medications}
            onChange={(e) => update("medications", e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        title="Comunicacao com o paciente"
        description="Controla os lembretes e confirmacoes automaticos deste paciente."
      >
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.remindersEnabled}
              onChange={(e) => update("remindersEnabled", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            Enviar lembretes e confirmacoes automaticos para este paciente
          </label>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Desmarcar aqui bloqueia envios automaticos para todas as sessoes deste paciente, mesmo
            que a sessao individual permita. Voce ainda pode enviar manualmente pelo painel da sessao.
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Antecedencia dos lembretes para este paciente
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Substitui, so para este paciente, o padrao definido em Configuracoes &gt; Preferencias de
            lembretes. Pode ser ajustado de novo por sessao individual no painel da agenda.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="7 dias antes"
              id="reminderLead7Dias"
              value={values.reminderLead7Dias}
              onChange={(e) => update("reminderLead7Dias", e.target.value as PatientFormValues["reminderLead7Dias"])}
            >
              {Object.entries(LEAD_OVERRIDE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="2 dias antes"
              id="reminderLead2Dias"
              value={values.reminderLead2Dias}
              onChange={(e) => update("reminderLead2Dias", e.target.value as PatientFormValues["reminderLead2Dias"])}
            >
              {Object.entries(LEAD_OVERRIDE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="24 horas antes"
              id="reminderLead24Horas"
              value={values.reminderLead24Horas}
              onChange={(e) =>
                update("reminderLead24Horas", e.target.value as PatientFormValues["reminderLead24Horas"])
              }
            >
              {Object.entries(LEAD_OVERRIDE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </FormSection>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <Button type="submit" isLoading={isLoading} className="px-6">
          {patientId ? "Salvar alteracoes" : "Cadastrar paciente"}
        </Button>
        <Link
          href="/pacientes"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
