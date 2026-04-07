'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Proteger Rota no Client Side
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[100px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.replace('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-[80px] min-h-screen animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-on-surface">Minha Conta</h1>
        <button 
          onClick={handleLogout}
          className="btn-outline flex items-center gap-2 border-error text-error hover:bg-error hover:text-white"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sair
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-surface-container p-6 rounded-3xl md:col-span-1 shadow-sm border border-outline-variant/20 h-fit">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-1">
            {user.profile?.firstName || 'Cliente'} {user.profile?.lastName || ''}
          </h2>
          <p className="text-on-surface-variant font-medium text-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            {user.email}
          </p>

          <div className="h-px w-full bg-outline-variant/30 my-4" />

          <button className="w-full text-left py-2 text-primary font-bold hover:underline flex items-center gap-2">
            <span className="material-symbols-outlined">settings</span>
            Editar Perfil
          </button>
        </div>

        {/* Orders Card */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl md:col-span-2 shadow-sm border border-outline-variant/20">
          <h3 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Meus Pedidos
          </h3>

          {/* Empty State Simulando nenhum pedido encontrado */}
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface-container rounded-2xl border border-dashed border-outline-variant/50">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 font-light">receipt_long</span>
            <h4 className="text-lg font-bold text-on-surface">Nenhum pedido encontrado</h4>
            <p className="text-on-surface-variant mt-2 text-sm max-w-sm">Você ainda não realizou nenhuma compra. Explore nosso catálogo de lavadoras revisadas e com garantia!</p>
            <button onClick={() => router.push('/products')} className="mt-6 btn-primary">
              Ver Catálogo
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
