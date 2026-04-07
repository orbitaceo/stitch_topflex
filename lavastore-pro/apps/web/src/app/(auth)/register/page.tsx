'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';

const schema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').trim(),
    lastName:  z.string().min(2, 'Sobrenome deve ter ao menos 2 caracteres').trim(),
    email:     z.string().email('E-mail inválido').toLowerCase().trim(),
    phone:     z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Telefone inválido (ex: 11999999999)')
      .optional()
      .or(z.literal('')),
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

// Indicador de força da senha
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12+ caracteres', ok: password.length >= 12 },
    { label: 'Maiúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Minúscula',      ok: /[a-z]/.test(password) },
    { label: 'Número',         ok: /[0-9]/.test(password) },
    { label: 'Especial',       ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;

  const barColor =
    score <= 1 ? 'bg-error' :
    score <= 3 ? 'bg-tertiary' :
    'bg-primary';

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

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });
      router.push('/login?registered=1');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.';
      setServerError(msg);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Criar sua conta</h1>
      <p className="text-on-surface-variant mb-8">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Entrar
        </Link>
      </p>

      {serverError && (
        <div className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
          <span className="text-sm font-medium">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Nome / Sobrenome */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-firstName" className="block text-sm font-semibold text-on-surface mb-2">Nome</label>
            <input
              id="reg-firstName"
              type="text"
              autoComplete="given-name"
              placeholder="João"
              {...register('firstName')}
              className={`input-filled ${errors.firstName ? 'ring-2 ring-error' : ''}`}
            />
            {errors.firstName && <p className="text-error text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="reg-lastName" className="block text-sm font-semibold text-on-surface mb-2">Sobrenome</label>
            <input
              id="reg-lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Silva"
              {...register('lastName')}
              className={`input-filled ${errors.lastName ? 'ring-2 ring-error' : ''}`}
            />
            {errors.lastName && <p className="text-error text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-semibold text-on-surface mb-2">E-mail</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">email</span>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              {...register('email')}
              className={`input-filled pl-12 ${errors.email ? 'ring-2 ring-error' : ''}`}
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-semibold text-on-surface mb-2">
            Telefone <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">phone</span>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="11999999999"
              {...register('phone')}
              className={`input-filled pl-12 ${errors.phone ? 'ring-2 ring-error' : ''}`}
            />
          </div>
          {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-semibold text-on-surface mb-2">Senha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
            <input
              id="reg-password"
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
          <label htmlFor="reg-confirm" className="block text-sm font-semibold text-on-surface mb-2">Confirmar senha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
            <input
              id="reg-confirm"
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
          id="register-submit"
          disabled={isSubmitting}
          className="btn-cta w-full text-base min-h-[52px] mt-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Criando conta...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">person_add</span>
              Criar Conta Grátis
            </>
          )}
        </button>
      </form>
    </div>
  );
}
