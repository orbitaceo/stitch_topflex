'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';

const schema = z
  .object({
    password: z
      .string()
      .min(12, 'Mínimo de 12 caracteres')
      .regex(/[A-Z]/, 'Uma letra maiúscula')
      .regex(/[a-z]/, 'Uma letra minúscula')
      .regex(/[0-9]/, 'Um número')
      .regex(/[^a-zA-Z0-9]/, 'Um caractere especial'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12+ caracteres', ok: password.length >= 12 },
    { label: 'Maiúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Minúscula',      ok: /[a-z]/.test(password) },
    { label: 'Número',         ok: /[0-9]/.test(password) },
    { label: 'Especial',       ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;

  const barColor = score <= 1 ? 'bg-error' : score <= 3 ? 'bg-tertiary' : 'bg-primary';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i <= score ? barColor : 'bg-surface-container-highest'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              c.ok ? 'text-primary' : 'text-on-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {c.ok ? 'check_circle' : 'circle'}
            </span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setServerError('Token inválido ou ausente da URL.');
      return;
    }
    setServerError(null);
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
    } catch (_err) {
      const err = _err as any;
      const msg = err?.response?.data?.message ?? 'Erro ao redefinir senha. O link pode ter expirado.';
      setServerError(msg);
    }
  };

  if (!token && process.env.NODE_ENV !== 'development') { // Allow preview in dev without token if needed, but normally show error
    return (
      <div className="animate-fade-in text-center">
        <h1 className="text-3xl font-extrabold text-error tracking-tight mb-4">Link Inválido</h1>
        <p className="text-on-surface-variant mb-6">Não foi possível encontrar o token de recuperação na URL.</p>
        <Link href="/forgot-password" className="btn-primary inline-flex">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-4">
          Senha Redefinida!
        </h1>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Sua senha foi alterada com sucesso. Você já pode acessar sua conta.
        </p>
        <Link href="/login" className="btn-primary inline-flex">
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Criar nova senha</h1>
      <p className="text-on-surface-variant mb-8 leading-relaxed">
        Digite e confirme a nova senha para a sua conta.
      </p>

      {serverError && (
        <div className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="text-sm font-medium">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Nova Senha */}
        <div>
          <label htmlFor="reset-password" className="block text-sm font-semibold text-on-surface mb-2">Nova Senha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
            <input
              id="reset-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 12 caracteres"
              {...register('password')}
              className={`input-filled pl-12 pr-12 ${errors.password ? 'ring-2 ring-error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          {passwordValue && <PasswordStrength password={passwordValue} />}
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirmar senha */}
        <div>
          <label htmlFor="reset-confirm" className="block text-sm font-semibold text-on-surface mb-2">Confirmar nova senha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
            <input
              id="reset-confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repita a senha"
              {...register('confirmPassword')}
              className={`input-filled pl-12 ${errors.confirmPassword ? 'ring-2 ring-error' : ''}`}
            />
          </div>
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-cta w-full min-h-[52px] mt-4 disabled:opacity-60"
        >
          {isSubmitting ? (
            <><span className="material-symbols-outlined animate-spin">progress_activity</span>Salvando...</>
          ) : (
            <><span className="material-symbols-outlined">save</span>Salvar nova senha</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-surface-container rounded-2xl"></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
