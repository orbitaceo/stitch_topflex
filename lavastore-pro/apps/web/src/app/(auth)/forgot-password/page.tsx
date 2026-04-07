'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch {
      setServerError('Erro ao processar solicitação. Tente novamente.');
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            mark_email_read
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-4">
          Verifique seu e-mail
        </h1>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Se houver uma conta com esse endereço, você receberá um link para redefinir a senha nos próximos minutos.
          Verifique também a caixa de spam.
        </p>
        <Link href="/login" className="btn-primary inline-flex">
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link href="/login" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        <span className="text-sm font-semibold">Voltar ao login</span>
      </Link>

      <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Esqueceu a senha?</h1>
      <p className="text-on-surface-variant mb-8 leading-relaxed">
        Digite seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      {serverError && (
        <div className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="text-sm font-medium">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-semibold text-on-surface mb-2">
            E-mail cadastrado
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">email</span>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              {...register('email')}
              className={`input-filled pl-12 ${errors.email ? 'ring-2 ring-error' : ''}`}
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          id="forgot-submit"
          disabled={isSubmitting}
          className="btn-cta w-full min-h-[52px] disabled:opacity-60"
        >
          {isSubmitting ? (
            <><span className="material-symbols-outlined animate-spin">progress_activity</span>Enviando...</>
          ) : (
            <><span className="material-symbols-outlined">send</span>Enviar link de recuperação</>
          )}
        </button>
      </form>
    </div>
  );
}
