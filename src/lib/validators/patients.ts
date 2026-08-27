import { z } from "zod";

const TREATMENT_FREQUENCIES = ["semanal", "quinzenal", "mensal", "outro"] as const;
const PATIENT_STATUSES = ["ativo", "inativo", "encerrado"] as const;

function optionalTrimmed(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null));
}

const REMINDER_LEAD_OVERRIDE = ["padrao", "sim", "nao"] as const;

export const patientSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo do paciente."),
  birthDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  phone: optionalTrimmed(30),
  email: z
    .string()
    .trim()
    .email("E-mail invalido.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  emergencyContactName: optionalTrimmed(255),
  emergencyContactPhone: optionalTrimmed(30),
  medicalHistory: optionalTrimmed(10000),
  medications: optionalTrimmed(10000),
  treatmentFrequency: z.enum(TREATMENT_FREQUENCIES),
  status: z.enum(PATIENT_STATUSES),
  remindersEnabled: z.boolean(),
  reminderLead7Dias: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
  reminderLead2Dias: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
  reminderLead24Horas: z.enum(REMINDER_LEAD_OVERRIDE).default("padrao"),
});

export type PatientInput = z.infer<typeof patientSchema>;

export { TREATMENT_FREQUENCIES, PATIENT_STATUSES, REMINDER_LEAD_OVERRIDE };
