import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAccess } from "@/lib/access-log";
import BackLink from "@/components/ui/BackLink";
import IconLink from "@/components/ui/IconLink";
import InfoField from "@/components/pacientes/InfoField";
import ProfileTabs, { type ProfileTab } from "@/components/pacientes/ProfileTabs";
import PatientSessionHistory, {
  type PatientSessionRow,
} from "@/components/pacientes/PatientSessionHistory";
import { FREQUENCY_LABELS, STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/components/pacientes/patient-meta";
import { DOCUMENT_TYPE_LABELS } from "@/components/pacientes/document-meta";
import GeneratePdfButton from "@/components/pacientes/GeneratePdfButton";
import DeleteDocumentButton from "@/components/pacientes/DeleteDocumentButton";
import { formatDateLabel, parseISODate } from "@/lib/date";

const VALID_TABS: ProfileTab[] = ["dados-gerais", "historico-medico", "sessoes", "documentos"];

export default async function VisualizarPacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  const { patientId } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: ProfileTab = VALID_TABS.includes(rawTab as ProfileTab) ? (rawTab as ProfileTab) : "dados-gerais";

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1",
    [patientId, user!.id]
  );
  const patient = rows[0];
  if (!patient) {
    notFound();
  }

  await logAccess({
    userId: user!.id,
    patientId: patient.id,
    recordType: "patient",
    recordId: patient.id,
    action: "visualizou",
  });

  let sessionRows: RowDataPacket[] = [];
  if (tab === "sessoes") {
    [sessionRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, sequential_number, scheduled_at, status
       FROM sessions
       WHERE patient_id = ? AND user_id = ?
       ORDER BY scheduled_at DESC`,
      [patientId, user!.id]
    );
  }

  let documentRows: RowDataPacket[] = [];
  if (tab === "documentos") {
    [documentRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, type, file_url, patient_readable_version, generated_at
       FROM documents
       WHERE patient_id = ?
       ORDER BY generated_at DESC`,
      [patientId]
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href="/pacientes" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {patient.full_name}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Visualizacao somente leitura do paciente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[patient.status] ?? "bg-slate-100 text-slate-600"}`}
            >
              {STATUS_LABELS[patient.status] ?? patient.status}
            </span>
            <IconLink href={`/pacientes/${patient.id}`} icon={Pencil} label="Editar paciente" variant="primary" />
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up flex flex-col gap-6">
        <ProfileTabs patientId={patient.id} active={tab} />

        {tab === "dados-gerais" && (
          <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dados gerais
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Nome completo" value={patient.full_name} />
                <InfoField
                  label="Data de nascimento"
                  value={patient.birth_date ? formatDateLabel(parseISODate(patient.birth_date)) : ""}
                />
                <InfoField label="Telefone" value={patient.phone ?? ""} />
                <InfoField label="E-mail" value={patient.email ?? ""} />
                <InfoField
                  label="Frequencia de tratamento"
                  value={FREQUENCY_LABELS[patient.treatment_frequency] ?? patient.treatment_frequency}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Contato de emergencia
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Nome" value={patient.emergency_contact_name ?? ""} />
                <InfoField label="Telefone" value={patient.emergency_contact_phone ?? ""} />
              </div>
            </div>
          </div>
        )}

        {tab === "historico-medico" && (
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <p className="text-xs text-slate-400 dark:text-slate-500">Visivel apenas para voce.</p>
            <div className="grid grid-cols-1 gap-4">
              <InfoField label="Historico medico" value={patient.medical_history ?? ""} fullWidth />
              <InfoField label="Medicacoes em uso" value={patient.medications ?? ""} fullWidth />
            </div>
          </div>
        )}

        {tab === "sessoes" && <PatientSessionHistory sessions={sessionRows as PatientSessionRow[]} />}

        {tab === "documentos" && (
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Documentos
                </h2>
                <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
                  {documentRows.length} {documentRows.length === 1 ? "documento gerado" : "documentos gerados"}
                </p>
              </div>
              <Link
                href={`/pacientes/${patient.id}/documentos/novo`}
                className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                + Gerar documento formal
              </Link>
            </div>

            {documentRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum documento gerado para este paciente ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {documentRows.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
                        {Boolean(doc.patient_readable_version) && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Versao para o paciente
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateLabel(parseISODate(doc.generated_at.split(" ")[0]))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        title="Baixar"
                        aria-label="Baixar"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Download className="h-4 w-4" strokeWidth={2} />
                      </a>
                      <DeleteDocumentButton documentId={doc.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <GeneratePdfButton
              label="Gerar PDF geral do paciente"
              endpoint={`/api/patients/${patient.id}/documents`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
