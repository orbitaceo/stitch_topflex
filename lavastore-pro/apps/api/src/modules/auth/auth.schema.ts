import { z } from 'zod';

// ── Schemas de validação de Auth ────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z.string().min(12, 'Senha deve ter no mínimo 12 caracteres'),
  firstName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').trim(),
  lastName: z.string().min(2, 'Sobrenome deve ter ao menos 2 caracteres').trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Telefone inválido')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter ao menos um caractere especial'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

export type RegisterInput     = z.infer<typeof registerSchema>;
export type LoginInput        = z.infer<typeof loginSchema>;
export type RefreshInput      = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput  = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput    = z.infer<typeof verifyEmailSchema>;
