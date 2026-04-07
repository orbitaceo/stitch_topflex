import Link from 'next/link';

const FOOTER_LINKS = {
  Empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Como Funciona', href: '/como-funciona' },
    { label: 'Relatório de Sustentabilidade', href: '/sustentabilidade' },
    { label: 'Contato', href: '/contact' },
  ],
  Comprar: [
    { label: 'Catálogo Completo', href: '/products' },
    { label: 'Promoções', href: '/products?sort=discount' },
    { label: 'Lavadoras 110V', href: '/products?voltage=V110' },
    { label: 'Lavadoras 220V', href: '/products?voltage=V220' },
  ],
  Suporte: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Garantia', href: '/garantia' },
    { label: 'Política de Devolução', href: '/devolucao' },
    { label: 'Rastrear Pedido', href: '/account/orders' },
  ],
  Legal: [
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-container pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Grid de links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_laundry_service
              </span>
              <span className="text-xl font-black text-primary tracking-tighter">LavaJá</span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Pristine Utility para um planeta mais limpo. Certificamos cada máquina nos padrões de fábrica.
            </p>
            {/* Pagamentos */}
            <div className="flex gap-3 mt-6 opacity-60">
              <span className="material-symbols-outlined text-on-surface-variant">qr_code_2</span>
              <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
              <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-3">
              <span className="font-bold text-on-surface mb-1">{category}</span>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-surface-container-high flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant">
          <span>© {new Date().getFullYear()} LavaJá Recondicionados. Pristine Utility para um planeta mais limpo.</span>
          <div className="flex gap-2 items-center">
            <span className="material-symbols-outlined text-primary text-base">verified_user</span>
            <span>Site seguro — SSL/HTTPS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
