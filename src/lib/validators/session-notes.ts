import { z } from "zod";

export const sessionNoteSchema = z.object({
  keywordSummary: z
    .string()
    .trim()
    .min(1, "Informe um resumo curto para lembrar da sessao.")
    .max(280, "Maximo de 280 caracteres."),
  fullReport: z.string().trim().min(1, "Escreva o relatorio completo da sessao."),
  theoreticalReferences: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type SessionNoteInput = z.infer<typeof sessionNoteSchema>;
