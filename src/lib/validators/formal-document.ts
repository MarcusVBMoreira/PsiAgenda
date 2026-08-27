import { z } from "zod";

export const FORMAL_DOCUMENT_TYPES = ["laudo", "atestado", "declaracao", "relatorio", "parecer"] as const;

export const formalDocumentSchema = z.object({
  type: z.enum(FORMAL_DOCUMENT_TYPES),
  title: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  body: z.string().trim().min(1, "Escreva o conteudo do documento."),
});

export type FormalDocumentInput = z.infer<typeof formalDocumentSchema>;
