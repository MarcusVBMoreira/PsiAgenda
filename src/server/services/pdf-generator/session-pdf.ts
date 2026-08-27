import { PdfWriter } from "./pdf-writer";
import { extractTimePart, formatDateLabel, parseISODate } from "@/lib/date";
import { MODALITY_LABELS } from "@/components/agenda/session-meta";

export type SessionPdfInput = {
  professional: { fullName: string; crpNumber: string };
  patient: { fullName: string };
  session: {
    sequentialNumber: number;
    scheduledAt: string;
    durationMinutes: number;
    modality: string;
  };
  note: {
    keywordSummary: string;
    fullReport: string;
    theoreticalReferences: string | null;
  };
  accessible: boolean;
};

export async function generateSessionPdf(input: SessionPdfInput): Promise<Buffer> {
  const { professional, patient, session, note, accessible } = input;
  const [datePart] = session.scheduledAt.split(" ");
  const dateLabel = formatDateLabel(parseISODate(datePart));
  const timeLabel = extractTimePart(session.scheduledAt);

  const writer = await PdfWriter.create();

  writer.title(
    accessible ? `Resumo da sessao — ${patient.fullName}` : `Registro de sessao — ${patient.fullName}`
  );
  writer.meta(
    `${professional.fullName}${professional.crpNumber ? ` · CRP ${professional.crpNumber}` : ""} · Documento gerado em ${formatDateLabel(new Date())}`
  );
  writer.spacer(6);

  writer.sectionHeading(accessible ? "Sobre esta sessao" : "Dados do atendimento");
  writer.labelValue("Paciente", patient.fullName);
  writer.labelValue("Atendimento numero", String(session.sequentialNumber));
  writer.labelValue("Data e horario", `${dateLabel} as ${timeLabel}`);
  if (!accessible) {
    writer.labelValue("Duracao", `${session.durationMinutes} minutos`);
    writer.labelValue("Modalidade", MODALITY_LABELS[session.modality] ?? session.modality);
  }

  if (accessible) {
    writer.sectionHeading("O que conversamos");
    writer.paragraph(note.fullReport);
  } else {
    writer.sectionHeading("Resumo");
    writer.paragraph(note.keywordSummary);

    writer.sectionHeading("Relatorio completo");
    writer.paragraph(note.fullReport);

    if (note.theoreticalReferences) {
      writer.sectionHeading("Referencias teoricas");
      writer.paragraph(note.theoreticalReferences);
    }
  }

  if (accessible) {
    writer.spacer(16);
    writer.meta(
      "Este e um resumo em linguagem acessivel, preparado para voce. O registro tecnico completo desta sessao fica arquivado com seu psicologo."
    );
  }

  return writer.finish();
}
