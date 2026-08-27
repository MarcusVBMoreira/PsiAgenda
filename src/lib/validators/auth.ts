import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail invalido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const cadastroSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo."),
  crpNumber: z.string().trim().min(3, "Informe seu numero de CRP."),
  email: z.string().trim().email("E-mail invalido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "O codigo deve ter 6 digitos."),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("E-mail invalido."),
});

export const confirmPasswordResetSchema = z.object({
  email: z.string().trim().email("E-mail invalido."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "O codigo deve ter 6 digitos."),
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CadastroInput = z.infer<typeof cadastroSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
