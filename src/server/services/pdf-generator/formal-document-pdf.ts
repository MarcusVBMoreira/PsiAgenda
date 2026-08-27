import { PdfWriter } from "./pdf-writer";
import { formatDateLabel } from "@/lib/date";

const TYPE_TITLES: Record<string, string> = {
  laudo: "Laudo Psicologico",
  atestado: "Atestado Psicologico",
  declaracao: "Declaracao",
  relatorio: "Relatorio Psicologico",
  parecer: "Parecer Psicologico",
};

export type FormalDocumentPdfInput = {
  professional: { fullName: string; crpNumber: string };
  patient: { fullName: string };
  type: string;
  title: string | null;
  body: string;
};

export async function generateFormalDocumentPdf(input: FormalDocumentPdfInput): Promise<Buffer> {
  const { professional, patient, type, title, body } = input;
  const writer = await PdfWriter.create();

  writer.title(TYPE_TITLES[type] ?? type);
  if (title) {
    writer.meta(title);
  }
  writer.spacer(6);

  writer.labelValue("Paciente", patient.fullName);
  writer.spacer(4);

  writer.paragraph(body);

  writer.spacer(28);
  writer.paragraph(`${formatDateLabel(new Date())}.`);
  writer.spacer(24);
  writer.paragraph("_______________________________________________");
  writer.paragraph(`${professional.fullName}`);
  writer.paragraph(`CRP ${professional.crpNumber}`);

  return writer.finish();
}
