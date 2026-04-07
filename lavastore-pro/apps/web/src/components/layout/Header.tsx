'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Produtos' },
  { href: '/como-funciona', label: 'Como Funciona' },
  { href: '/contact', label: 'Contato' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { totalItems, openCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = totalItems();
  const isLoggedIn = !!user;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_laundry_service
          </span>
          <span className="text-2xl font-black text-primary tracking-tighter">LavaJá</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {/* Busca */}
          <button
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Buscar produtos"
          >
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>

          {/* Carrinho */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Carrinho de compras"
          >
            <span className="material-symbols-outlined text-on-surface-variant">shopping_cart</span>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-tertiary text-on-tertiary text-[10px] font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Usuário */}
          {isLoggedIn ? (
            <Link href="/account" className="p-2 rounded-full hover:bg-surface-container transition-colors" aria-label="Minha conta">
              <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
            >
              Entrar
            </Link>
          )}

          {/* Menu mobile */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-on-surface">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Divisor ─────────────────────────────────────────────────── */}
      <div className="h-px bg-surface-container-high opacity-60" />

      {/* ── Menu mobile ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-container px-6 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 py-3 text-on-surface font-semibold hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-surface-container">
            <Link
              href="/login"
              className="btn-primary w-full text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Entrar / Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
