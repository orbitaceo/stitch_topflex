import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { CartDrawer } from '@/components/layout/CartDrawer';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <CartDrawer />

      {/* ── Botão WhatsApp flutuante ─────────────────────────────────── */}
      <a
        href={`https://wa.me/${WHATSAPP}?text=Olá! Gostaria de saber mais sobre as lavadoras recondicionadas.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-90 transition-transform"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg className="w-9 h-9 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>

      {/* ── Bottom Navigation Mobile ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white/90 backdrop-blur-lg flex justify-around items-center px-4 pb-safe border-t border-surface-container z-50 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] rounded-t-3xl">
        {[
          { href: '/', icon: 'home', label: 'Home' },
          { href: '/products', icon: 'settings_input_component', label: 'Produtos' },
          { href: '/como-funciona', icon: 'info', label: 'Processo' },
          { href: '/cart', icon: 'shopping_cart', label: 'Carrinho' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center py-2 px-1 text-on-surface-variant hover:text-primary active:scale-90 transition-all duration-150"
            aria-label={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
