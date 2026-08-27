import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  crpNumber: z.string().trim().min(1, "Informe o numero do CRP."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export const billingPolicySchema = z.object({
  noShowChargePolicy: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export const reminderPreferencesSchema = z
  .object({
    channelEmail: z.boolean(),
    channelWhatsapp: z.boolean(),
    interval7Dias: z.boolean(),
    interval2Dias: z.boolean(),
    interval24Horas: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.channelEmail && !data.channelWhatsapp) {
      ctx.addIssue({
        code: "custom",
        path: ["channelEmail"],
        message: "Selecione pelo menos um canal.",
      });
    }
    if (!data.interval7Dias && !data.interval2Dias && !data.interval24Horas) {
      ctx.addIssue({
        code: "custom",
        path: ["interval7Dias"],
        message: "Selecione pelo menos um intervalo.",
      });
    }
  });

export const securitySchema = z.object({
  twoFactorEnabled: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas nao coincidem.",
    path: ["confirmPassword"],
  });

export const appearanceSchema = z.object({
  themePreference: z.enum(["light", "dark", "system"]),
});
