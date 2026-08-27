import { z } from "zod";

export const REQUESTED_BY_OPTIONS = ["paciente", "profissional"] as const;

export const rescheduleSchema = z.object({
  newScheduledAt: z.string().trim().min(1, "Informe a nova data e horario."),
  reason: z.string().trim().min(1, "Informe o motivo do reagendamento."),
  requestedBy: z.enum(REQUESTED_BY_OPTIONS),
  charged: z.boolean(),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
