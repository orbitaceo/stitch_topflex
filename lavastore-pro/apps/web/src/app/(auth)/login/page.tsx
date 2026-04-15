'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const result = await authApi.login(data);
      setAuth(result.user, result.accessToken);
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    } catch (_err) {
      const err = _err as any;
      const msg = err?.response?.data?.message ?? 'Erro ao fazer login. Tente novamente.';
      setServerError(msg);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Bem-vindo de volta</h1>
      <p className="text-on-surface-variant mb-8">
        Não tem conta?{' '}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Criar conta grátis
        </Link>
      </p>

      {isExpired && (
        <div className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
          <span className="text-sm font-medium">Sua sessão expirou. Faça login novamente.</span>
        </div>
      )}

      {serverError && (
        <div className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
          <span className="text-sm font-medium">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-on-surface mb-2">
            E-mail
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              email
            </span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              {...register('email')}
              className={`input-filled pl-12 ${errors.email ? 'ring-2 ring-error' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-error text-xs mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="login-password" className="text-sm font-semibold text-on-surface">
              Senha
            </label>
            <Link href="/forgot-password" className="text-sm text-primary font-semibold hover:underline">
              Esqueci a senha
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              lock
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Sua senha"
              {...register('password')}
              className={`input-filled pl-12 pr-12 ${errors.password ? 'ring-2 ring-error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-error text-xs mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={isSubmitting}
          className="btn-cta w-full text-base min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Entrando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">login</span>
              Entrar
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-surface-container-highest" />
        <span className="text-on-surface-variant text-sm font-medium">ou continue com</span>
        <div className="flex-1 h-px bg-surface-container-highest" />
      </div>

      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'}?text=Olá! Gostaria de criar uma conta no LavaJá.`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full text-base min-h-[52px]"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        Falar via WhatsApp
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-surface-container rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  );
}
