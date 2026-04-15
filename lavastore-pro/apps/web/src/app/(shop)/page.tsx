import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lavadoras Recondicionadas | Como Novas, Pelo Preço Certo',
  description:
    'Lavadoras e secadoras recondicionadas com garantia de 3 a 6 meses. Revisão técnica completa, higienização profissional e entrega com instalação. A partir de R$ 399.',
};

// ── Dados mockados (substituir por chamada à API nas próximas sprints) ─────

const FEATURED_PRODUCTS = [
  {
    id: '1',
    slug: 'brastemp-clean-12kg-inox',
    name: 'Brastemp Clean 12kg',
    model: 'BWH12AB | Revisão Premium',
    originalPrice: 1899,
    salePrice: 649,
    warrantyMonths: 3,
    conditionLabel: 'Excelente',
    conditionBadge: 'bg-primary text-on-primary',
    badgeText: 'Certificada Gold',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80',
    imageAlt: 'Brastemp Clean 12kg recondicionada',
  },
  {
    id: '2',
    slug: 'samsung-ecobubble-11kg',
    name: 'Samsung EcoBubble 11kg',
    model: 'Digital Inverter | Ultra Silenciosa',
    originalPrice: 3200,
    salePrice: 1299,
    warrantyMonths: 6,
    conditionLabel: 'Excelente',
    conditionBadge: 'bg-secondary text-on-secondary',
    badgeText: 'Melhor Custo',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
    imageAlt: 'Samsung EcoBubble 11kg recondicionada',
  },
  {
    id: '3',
    slug: 'lg-direct-drive-8-5kg',
    name: 'LG Direct Drive 8.5kg',
    model: 'Compact Power | Ideal para aptos',
    originalPrice: 2450,
    salePrice: 899,
    warrantyMonths: 3,
    conditionLabel: 'Bom',
    conditionBadge: 'bg-primary text-on-primary',
    badgeText: 'Renovada Elite',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&q=80',
    imageAlt: 'LG Direct Drive 8.5kg recondicionada',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: 'search_check',
    title: 'Triagem',
    description: 'Selecionamos apenas as melhores marcas com estrutura preservada.',
    color: 'bg-primary-fixed text-primary',
    stepColor: 'text-primary',
  },
  {
    step: '02',
    icon: 'build',
    title: 'Renovação',
    description: 'Troca de peças críticas e balanceamento completo do sistema.',
    color: 'bg-secondary-container text-on-secondary-container',
    stepColor: 'text-secondary',
  },
  {
    step: '03',
    icon: 'sanitizer',
    title: 'Higienização',
    description: 'Limpeza química profunda com produtos biodegradáveis.',
    color: 'bg-tertiary-fixed text-tertiary-container',
    stepColor: 'text-tertiary',
  },
  {
    step: '04',
    icon: 'local_shipping',
    title: 'Entrega',
    description: 'Entrega rápida na sua casa com instalação inclusa.',
    color: 'bg-surface-container-highest text-on-surface',
    stepColor: 'text-on-surface-variant',
  },
];

const STATS = [
  { value: '5k+', label: 'Clientes Felizes' },
  { value: '10t+', label: 'Lixo Evitado' },
  { value: '100%', label: 'Revisadas' },
  { value: '90d', label: 'Garantia Mínima' },
];

const TRUST_ITEMS = [
  {
    icon: 'verified_user',
    color: 'bg-secondary-container text-secondary',
    title: 'Garantia de 3 a 6 Meses',
    desc: 'Cobertura total em peças e mão de obra.',
  },
  {
    icon: 'eco',
    color: 'bg-primary-fixed text-primary',
    title: 'Eco-Friendly',
    desc: 'Reduzindo lixo eletrônico, um equipamento de cada vez.',
  },
  {
    icon: 'local_shipping',
    color: 'bg-tertiary-fixed text-tertiary',
    title: 'Entrega Inclusa',
    desc: 'Instalação gratuita para a Grande SP.',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function savings(original: number, sale: number) {
  return original - sale;
}

// ── Componentes ──────────────────────────────────────────────────────────

function ProductCard({ product }: { product: (typeof FEATURED_PRODUCTS)[number] }) {
  return (
    <div className="product-card group">
      {/* Imagem */}
      <div className="relative h-64 overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Badge de condição */}
        <div className={`absolute top-4 left-4 ${product.conditionBadge} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest`}>
          {product.badgeText}
        </div>
        {/* Favorito */}
        <button
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full hover:scale-110 transition-transform"
          aria-label="Adicionar aos favoritos"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">favorite</span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-on-surface leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1 text-tertiary">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-sm font-bold">{product.rating}</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm mb-6">{product.model}</p>

        {/* Preço */}
        <div className="bg-surface-container-low p-4 rounded-2xl mb-6 space-y-2">
          <div className="flex justify-between items-center opacity-60">
            <span className="text-xs font-semibold uppercase tracking-wider">Novo na loja</span>
            <span className="text-sm line-through decoration-error decoration-2 font-bold">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              LavaJá Reuso
            </span>
            <span className="text-3xl font-black text-error tracking-tighter">
              {formatPrice(product.salePrice)}
            </span>
          </div>
          <div className="text-xs text-on-surface-variant text-right">
            Você economiza{' '}
            <span className="font-bold text-primary">
              {formatPrice(savings(product.originalPrice, product.salePrice))}
            </span>
          </div>
        </div>

        {/* Garantia */}
        <div className="flex items-center gap-2 mb-6 text-secondary text-sm">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="font-semibold">{product.warrantyMonths} meses de garantia</span>
        </div>

        {/* Botões */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Link
            href={`/products/${product.slug}`}
            className="btn-cta text-sm py-3 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            Quero Essa!
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'}?text=Olá! Tenho interesse na ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-3 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Página Principal ────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-16 md:py-28 bg-gradient-to-br from-primary to-primary-container text-on-primary overflow-hidden">
        {/* Blob decorativo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-container/30 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-1.5 mb-6 bg-primary-fixed text-on-primary-fixed rounded-full text-sm font-bold tracking-tight">
              SEU BOLSO AGRADECE, O PLANETA TAMBÉM
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-6 text-white">
              Lavadoras<br />
              <span className="text-primary-fixed">Como Novas</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-4 max-w-md leading-relaxed">
              Revisadas por especialistas, higienizadas e com garantia total.
            </p>
            <p className="text-2xl font-black text-white mb-10">
              A partir de{' '}
              <span className="text-primary-fixed underline decoration-4 decoration-white/40">
                R$ 399
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-cta text-lg min-h-[56px] px-10">
                Ver Ofertas Agora
              </Link>
              <Link
                href="/como-funciona"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-10 py-3 rounded-xl min-h-[56px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined">verified</span>
                Garantia LavaJá
              </Link>
            </div>
          </div>

          {/* Imagem lado direito (desktop) */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 to-transparent rounded-full blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80"
              alt="Lavadora recondicionada em ambiente clean e moderno"
              className="relative z-10 w-full h-[480px] object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUTOS EM DESTAQUE ────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-on-surface mb-2">
              Destaques da Semana
            </h2>
            <p className="text-on-surface-variant font-medium">
              As melhores marcas com descontos de até 70%
            </p>
          </div>
          <Link href="/products" className="btn-ghost hidden sm:flex gap-2">
            Ver todos
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link href="/products" className="btn-cta inline-flex px-12">
            Ver Catálogo Completo
          </Link>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────── */}
      <section className="bg-surface-container py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-4">
              Como a Mágica Acontece
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Transformamos máquinas usadas em aparelhos de alta performance com rigor técnico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6`}>
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <span className={`${step.stepColor} font-bold text-sm uppercase tracking-widest mb-2`}>
                  Passo {step.step}
                </span>
                <h3 className="font-bold text-lg text-on-surface mb-3">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/como-funciona" className="btn-ghost inline-flex gap-2 text-base">
              Saiba mais sobre o processo
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST DARK SECTION ───────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 text-white overflow-hidden relative">
          {/* Efeito de luz */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          {/* Texto */}
          <div className="flex-1 space-y-8 z-10">
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Economize Dinheiro.<br />Apoie a Sustentabilidade.
            </h2>
            <div className="space-y-4">
              {[
                'Economia real de até R$ 1.500 por máquina',
                'Redução de lixo eletrônico no planeta',
                'Atendimento humanizado via WhatsApp',
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
                  <span className="text-lg opacity-90">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-green-50 transition-colors shadow-2xl active:scale-95">
              Ver Catálogo Completo
            </Link>
          </div>

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 z-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-zinc-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                <div className="text-3xl font-black text-primary-fixed-dim mb-1">{stat.value}</div>
                <div className="text-xs opacity-60 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
      <section className="bg-primary py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
            Quer receber novas ofertas?
          </h2>
          <p className="text-on-primary-container text-lg mb-10 leading-relaxed">
            Receba alertas de novas chegadas, dicas de economia e promoções exclusivas todo mês.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-grow bg-white rounded-xl px-6 py-4 border-none text-on-surface focus:ring-4 focus:ring-primary-fixed outline-none"
              aria-label="Email para newsletter"
            />
            <button type="submit" className="btn-cta px-8 py-4 min-h-[52px]">
              Quero Receber
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
