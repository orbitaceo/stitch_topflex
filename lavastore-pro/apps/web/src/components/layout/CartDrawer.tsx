'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, openCart, closeCart, updateQty, removeItem, clearCart, totalPrice, totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const toggleCart = () => isOpen ? closeCart() : openCart();

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-surface-container-lowest shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
            <h2 className="text-xl font-black text-on-surface">Seu Carrinho</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
              {totalItems()} {totalItems() === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_basket</span>
              <p className="text-on-surface font-bold text-lg">Seu carrinho está vazio.</p>
              <p className="text-on-surface-variant text-sm mt-2">Navegue pelas nossas lavadoras renovadas!</p>
              <button 
                onClick={toggleCart} 
                className="mt-6 btn-outline"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 bg-surface-container p-3 rounded-2xl border border-outline-variant/10">
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden relative flex-shrink-0 border border-outline-variant/20">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined absolute inset-0 m-auto text-3xl text-outline-variant">local_laundry_service</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-on-surface text-sm leading-tight line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Remover"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-black text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      
                      <div className="flex items-center bg-white rounded-lg border border-outline-variant/20 overflow-hidden">
                        <button 
                          onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-on-surface">{item.quantity}</span>
                        <button 
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Subtotal</span>
              <span className="font-bold text-on-surface">R$ {totalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Frete (SP)</span>
              <span className="font-bold text-primary">Grátis</span>
            </div>
            <div className="h-px w-full bg-outline-variant/20 my-2"></div>
            <div className="flex justify-between items-end mb-6">
              <span className="text-on-surface font-bold">Total Estimado</span>
              <div className="text-right">
                <span className="text-2xl font-black text-on-surface leading-none block">R$ {totalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">no PIX ou Cartão</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="btn-cta w-full min-h-[56px] text-lg rounded-2xl flex justify-center items-center"
            >
              {isAuthenticated ? 'Finalizar Compra' : 'Entrar para Comprar'}
              <span className="material-symbols-outlined ml-2 text-[20px]">{isAuthenticated ? 'arrow_forward' : 'login'}</span>
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full mt-2 py-2 text-sm font-semibold text-on-surface-variant hover:text-error transition-colors"
            >
              Esvaziar Carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}
