'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart, items } = useCartStore();

  const status = searchParams.get('status');
  const orderId = searchParams.get('external_reference') || searchParams.get('mock_order');

  useEffect(() => {
    // Limpar o carrinho se houver pedido
    if (items.length > 0) {
      clearCart();
    }
  }, [clearCart, items.length]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      
      <h1 className="text-4xl font-black text-on-surface tracking-tight">Pedido Recebido!</h1>
      <p className="text-lg text-on-surface-variant font-medium">
        Sua lavadora renovada logo estará a caminho. Muito obrigado por escolher a LavaJá!
      </p>

      <div className="bg-surface-container w-full p-6 rounded-3xl border border-outline-variant/20 mt-8 mb-8">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Número do Pedido</p>
            <p className="font-semibold text-on-surface">{orderId || 'Sendo processado...'}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Status do Pagamento</p>
            <p className="font-semibold text-primary capitalize flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {status === 'approved' ? 'Aprovado' : status === 'pending' ? 'Em análise' : 'Confirmado'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/" className="btn-outline px-8">
          Voltar para Home
        </Link>
        <Link href="/account/orders" className="btn-primary px-8">
          Ver Meus Pedidos
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <Suspense fallback={
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Validando pedido...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
