import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Lado esquerdo: formulário ────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_laundry_service
          </span>
          <span className="text-3xl font-black text-primary tracking-tighter">LavaJá</span>
        </Link>

        <div className="w-full max-w-md">{children}</div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Ao continuar você concorda com os{' '}
          <Link href="/termos" className="text-primary font-semibold hover:underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="text-primary font-semibold hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>

      {/* ── Lado direito: visual brand (somente desktop) ─────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-primary via-primary-container to-[#1b5e20] px-16 relative overflow-hidden">
        {/* Blob decorativo */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-8 flex items-center justify-center backdrop-blur-lg">
            <span
              className="material-symbols-outlined text-white text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_laundry_service
            </span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">
            Pristine Utility<br />para o seu lar.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Lavadoras recondicionadas com garantia real, revisão completa e entrega com instalação inclusa.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'verified_user', label: 'Garantia de 3 a 6 meses' },
              { icon: 'eco',          label: 'Sustentabilidade' },
              { icon: 'savings',      label: 'Até 70% de desconto' },
              { icon: 'support_agent', label: 'Suporte por WhatsApp' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                <span
                  className="material-symbols-outlined text-primary-fixed text-2xl mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
