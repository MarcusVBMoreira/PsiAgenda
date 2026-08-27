import { PdfWriter } from "./pdf-writer";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";
import { FREQUENCY_LABELS } from "@/components/pacientes/patient-meta";
import { STATUS_LABELS as SESSION_STATUS_LABELS } from "@/components/agenda/session-meta";

export type PatientPdfInput = {
  professional: { fullName: string; crpNumber: string };
  patient: {
    fullName: string;
    birthDate: string | null;
    phone: string | null;
    email: string | null;
    treatmentFrequency: string;
    medicalHistory: string | null;
    medications: string | null;
  };
  sessions: {
    sequentialNumber: number;
    scheduledAt: string;
    status: string;
    keywordSummary: string | null;
  }[];
  accessible: boolean;
};

export async function generatePatientPdf(input: PatientPdfInput): Promise<Buffer> {
  const { professional, patient, sessions, accessible } = input;
  const writer = await PdfWriter.create();

  writer.title(
    accessible ? `Resumo do acompanhamento — ${patient.fullName}` : `Prontuario geral — ${patient.fullName}`
  );
  writer.meta(
    `${professional.fullName}${professional.crpNumber ? ` · CRP ${professional.crpNumber}` : ""} · Documento gerado em ${formatDateLabel(new Date())}`
  );
  writer.spacer(6);

  writer.sectionHeading("Dados gerais");
  writer.labelValue("Nome completo", patient.fullName);
  if (!accessible) {
    writer.labelValue(
      "Data de nascimento",
      patient.birthDate ? formatDateLabel(parseISODate(patient.birthDate)) : "-"
    );
    writer.labelValue("Telefone", patient.phone ?? "-");
    writer.labelValue("E-mail", patient.email ?? "-");
  }
  writer.labelValue(
    "Frequencia de tratamento",
    FREQUENCY_LABELS[patient.treatmentFrequency] ?? patient.treatmentFrequency
  );

  if (!accessible && (patient.medicalHistory || patient.medications)) {
    writer.sectionHeading("Informacoes clinicas");
    if (patient.medicalHistory) writer.labelValue("Historico medico", patient.medicalHistory);
    if (patient.medications) writer.labelValue("Medicacoes em uso", patient.medications);
  }

  writer.sectionHeading(accessible ? "Suas sessoes" : "Linha do tempo de sessoes");
  if (sessions.length === 0) {
    writer.paragraph("Nenhuma sessao registrada.");
  } else {
    for (const session of sessions) {
      const [datePart] = session.scheduledAt.split(" ");
      const dateLabel = `${formatDateLabel(parseISODate(datePart))} as ${extractTimePart(session.scheduledAt)}`;
      const statusLabel = SESSION_STATUS_LABELS[session.status] ?? session.status;

      writer.labelValue(
        `Atendimento ${session.sequentialNumber}`,
        accessible
          ? `${dateLabel} · ${statusLabel}`
          : `${dateLabel} · ${statusLabel}${session.keywordSummary ? ` · ${session.keywordSummary}` : ""}`
      );
    }
  }

  if (accessible) {
    writer.spacer(16);
    writer.meta(
      "Este e um resumo em linguagem acessivel do seu acompanhamento, preparado para voce. O prontuario tecnico completo fica arquivado com seu psicologo."
    );
  }

  return writer.finish();
}
