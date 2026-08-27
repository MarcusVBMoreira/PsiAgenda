import { z } from "zod";

export const SESSION_STATUSES = [
  "livre",
  "pendente",
  "confirmado",
  "reagendado",
  "cancelado_cobrado",
  "cancelado_sem_cobranca",
] as const;

const CANCELLED_STATUSES = ["cancelado_cobrado", "cancelado_sem_cobranca"];

export const MODALITIES = ["presencial", "online"] as const;

const REMINDER_LEAD_OVERRIDE = ["padrao", "sim", "nao"] as const;
const reminderLeadFields = {
  reminderLead7Dias: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
  reminderLead2Dias: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
  reminderLead24Horas: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
};

const durationMinutes = z.coerce
  .number()
  .int()
  .min(5, "Duracao minima de 5 minutos.")
  .max(480, "Duracao maxima de 480 minutos.");

const platformLink = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

const cancellationReason = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

export const createSessionSchema = z.object({
  patientId: z.string().trim().min(1, "Selecione um paciente."),
  scheduledAt: z.string().trim().min(1, "Informe a data e horario."),
  durationMinutes,
  modality: z.enum(MODALITIES),
  platformLink,
  status: z.enum(SESSION_STATUSES),
  sendConfirmation: z.boolean().default(true),
  sendReminders: z.boolean().default(true),
  ...reminderLeadFields,
});

export const updateSessionSchema = z
  .object({
    scheduledAt: z.string().trim().min(1, "Informe a data e horario."),
    durationMinutes,
    modality: z.enum(MODALITIES),
    platformLink,
    status: z.enum(SESSION_STATUSES),
    cancellationReason,
    sendConfirmation: z.boolean().default(true),
    sendReminders: z.boolean().default(true),
    ...reminderLeadFields,
  })
  .superRefine((data, ctx) => {
    if (CANCELLED_STATUSES.includes(data.status) && !data.cancellationReason) {
      ctx.addIssue({
        code: "custom",
        path: ["cancellationReason"],
        message: "Informe o motivo do cancelamento.",
      });
    }
  });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
