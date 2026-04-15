'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { api } from '@/lib/api';

const addressSchema = z.object({
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Endereço inválido'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().length(2, 'UF deve ter 2 letras'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { items, totalPrice, clearCart: _clearCart } = useCartStore();

  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    setMounted(true);
    if (mounted && items.length === 0) {
      router.push('/products');
    }
  }, [mounted, items.length, router]);

  const onSubmit = async (data: AddressFormData) => {
    if (!user) {
      // Idealmente redirecioná-lo pro login, passando ?redirect=/checkout
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      const payload = {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: data,
      };

      const res = await api.post('/v1/orders/checkout', payload);
      const { checkoutUrl } = res.data;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Link de pagamento não retornado.');
      }

    } catch (_err) {
      const err = _err as any;
      setServerError(err.response?.data?.message || 'Erro ao processar o checkout. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-20 bg-background">
        <div className="animate-pulse w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Coluna Esquerda: Dados de Entrega e Checkout */}
        <div className="flex-1 space-y-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">Finalizar Compra</h1>
            {!user ? (
              <p className="text-on-surface-variant font-medium bg-secondary-container text-on-secondary-container px-4 py-3 rounded-xl border border-secondary/10 flex items-center gap-3">
                <span className="material-symbols-outlined">info</span>
                Você precisa estar logado para finalizar o pedido. Seus itens estão salvos.
              </p>
            ) : (
              <p className="text-on-surface-variant">Confirme seu endereço para onde enviaremos sua nova máquina.</p>
            )}
          </div>

          {serverError && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-sm font-semibold">{serverError}</p>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-outline-variant/20 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-outline-variant/10 pb-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Endereço de Entrega
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface mb-1">CEP</label>
                <input 
                  type="text" 
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  {...register('zipCode')}
                  className={`input-filled ${errors.zipCode ? 'ring-2 ring-error' : ''}`} 
                  disabled={!user || isSubmitting}
                />
                {errors.zipCode && <p className="text-error text-xs mt-1">{errors.zipCode.message}</p>}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface mb-1">Rua / Avenida</label>
                <input 
                  type="text" 
                  {...register('street')}
                  className={`input-filled ${errors.street ? 'ring-2 ring-error' : ''}`} 
                  disabled={!user || isSubmitting}
                />
                {errors.street && <p className="text-error text-xs mt-1">{errors.street.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Número</label>
                <input 
                  type="text" 
                  {...register('number')}
                  className={`input-filled ${errors.number ? 'ring-2 ring-error' : ''}`} 
                  disabled={!user || isSubmitting}
                />
                {errors.number && <p className="text-error text-xs mt-1">{errors.number.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Complemento</label>
                <input 
                  type="text" 
                  placeholder="Apt, Bloco, etc."
                  {...register('complement')}
                  className="input-filled" 
                  disabled={!user || isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Bairro</label>
                <input 
                  type="text" 
                  {...register('neighborhood')}
                  className={`input-filled ${errors.neighborhood ? 'ring-2 ring-error' : ''}`} 
                  disabled={!user || isSubmitting}
                />
                {errors.neighborhood && <p className="text-error text-xs mt-1">{errors.neighborhood.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Cidade e UF</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    {...register('city')}
                    className={`input-filled flex-1 ${errors.city ? 'ring-2 ring-error' : ''}`} 
                    disabled={!user || isSubmitting}
                  />
                  <input 
                    type="text" 
                    placeholder="SP"
                    maxLength={2}
                    {...register('state')}
                    className={`input-filled w-20 uppercase text-center ${errors.state ? 'ring-2 ring-error' : ''}`} 
                    disabled={!user || isSubmitting}
                  />
                </div>
                {(errors.city || errors.state) && (
                  <p className="text-error text-xs mt-1">{errors.city?.message || errors.state?.message}</p>
                )}
              </div>
            </div>
            
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-4">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Entregamos e instalamos gratuitamente em São Paulo e Grande SP.
            </p>
          </form>
        </div>

        {/* Coluna Direita: Resumo */}
        <div className="w-full lg:w-[400px] flex-shrink-0 animate-fade-in delay-75">
          <div className="bg-surface-container p-6 md:p-8 rounded-[2rem] sticky top-24 border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold border-b border-outline-variant/10 pb-4 mb-6 text-on-surface">
              Resumo do Pedido
            </h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10 relative">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-tight text-on-surface line-clamp-2">{item.name}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Qtd: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-on-surface">R$ {item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/10 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Subtotal</span>
                <span className="font-bold text-on-surface">R$ {totalPrice()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Descontos</span>
                <span className="font-bold text-primary">- R$ 0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Frete (SP)</span>
                <span className="font-bold text-primary">Grátis</span>
              </div>
              
              <div className="flex justify-between items-end pt-4 mt-2 border-t border-outline-variant/10">
                <span className="font-black text-lg text-on-surface">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-primary leading-none">R$ {totalPrice()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={!user || isSubmitting}
              className="btn-cta w-full mt-8 min-h-[56px] text-lg rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> Criando Pedido...</>
              ) : (
                <>
                  Seguir para Pagamento
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">lock</span>
                </>
              )}
            </button>
            <div className="flex justify-center flex-wrap gap-2 mt-4 opacity-70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pix</span> Pix
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">credit_card</span> 12x Cartão
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">security</span> SSL Seguro
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
