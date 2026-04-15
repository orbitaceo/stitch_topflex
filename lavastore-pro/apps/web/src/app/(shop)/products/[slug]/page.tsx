'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  condition: string;
  conditionNote: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  brand: string;
  model: string;
  capacity: string;
  voltage: string;
  warrantyMonths: number;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const addItemToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.get(params.slug);
        if (isMounted) setProduct(data);
      } catch (_err) {
        const err = _err as any;
        if (err.response?.status === 404) {
          if (isMounted) notFound();
        }
        if (isMounted) setError('Erro ao carregar os detalhes do produto');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [params.slug]);

  if (loading) {
    return (
      <div className="pt-24 px-6 min-h-screen bg-background animate-pulse pb-32">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="w-full aspect-square bg-surface-container rounded-[2rem]"></div>
          <div className="h-10 bg-surface-container rounded-lg w-3/4"></div>
          <div className="h-32 bg-surface-container rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-32 px-6 min-h-[70vh] flex flex-col items-center text-center bg-background">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h1 className="text-2xl font-black text-on-surface mb-2">Ops, algo deu errado</h1>
        <p className="text-on-surface-variant mb-6">{error || 'Produto não encontrado'}</p>
        <Link href="/products" className="btn-primary">Voltar ao Catálogo</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const discount = Math.round((1 - product.salePrice / product.originalPrice) * 100);

  const images = [
    `https://placehold.co/800x800/eeeeee/666666?text=${product.brand}+Frontal`,
    `https://placehold.co/800x800/eeeeee/666666?text=Painel+Eletronico`,
    `https://placehold.co/800x800/eeeeee/666666?text=Cesto+Interno`
  ];

  return (
    <main className="pt-16 pb-32 bg-background">
      
      {/* ── Imagens ──────────────────────────────────────────────── */}
      <section className="relative w-full aspect-square md:aspect-video lg:h-[70vh] bg-surface-container overflow-hidden group">
        <div className="absolute inset-0 transition-transform duration-500 ease-in-out w-full h-full">
          <Image 
            src={images[activeImage] ?? images[0]!} 
            alt={product.name}
            fill
            className="object-contain object-center"
            priority
          />
        </div>
        
        {/* Nav Laterais */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur block flex items-center justify-center text-on-surface hover:bg-white shadow-sm"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={() => setActiveImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur block flex items-center justify-center text-on-surface hover:bg-white shadow-sm"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i === activeImage ? 'bg-primary' : 'bg-surface-container-highest hover:bg-outline-variant'}`}
              onClick={() => setActiveImage(i)}
            />
          ))}
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg uppercase tracking-wider">
          {product.condition === 'EXCELLENT' ? 'Renovada Premium' : 'Renovada'}
        </div>
      </section>

      <div className="max-w-xl mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        {/* ── Identidade e Preço ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 px-6 py-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-primary font-bold uppercase tracking-wider text-sm">{product.brand}</p>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-on-surface">{product.name}</h1>
              <div className="flex items-center gap-2 text-primary font-semibold mt-2 bg-primary/10 w-fit px-3 py-1 rounded-md">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-xs uppercase tracking-wider">Pristine Certified Utility</span>
              </div>
            </div>
            
            <p className="text-on-surface-variant leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          <div className="flex-shrink-0 w-full lg:w-[380px]">
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              
              {product.originalPrice > product.salePrice && (
                <div className="bg-error-container text-on-error-container px-3 py-1 rounded-lg text-xs font-bold w-fit mb-4 relative z-10 border border-error/10 shadow-sm">
                  VOCÊ ECONOMIZA R$ {product.originalPrice - product.salePrice} ({discount}%)
                </div>
              )}
              
              <div className="flex flex-col gap-1 relative z-10">
                {product.originalPrice > product.salePrice && (
                  <span className="text-on-surface-variant text-sm line-through decoration-error/50 decoration-2">
                    R$ {product.originalPrice}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black tracking-tighter ${isOutOfStock ? 'text-on-surface-variant' : 'text-primary'}`}>
                    R$ {product.salePrice}
                  </span>
                  <span className="text-on-surface-variant font-bold text-sm tracking-widest hidden sm:inline">a vista</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2 text-sm bg-surface-container px-3 py-2 rounded-lg inline-flex items-center gap-2 w-fit">
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  12x de <span className="font-bold text-on-surface">R$ {Math.ceil(product.salePrice / 12)}</span>
                </p>
              </div>

              <div className="mt-8 space-y-3 relative z-10">
                <button
                  onClick={() => {
                    addItemToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.salePrice,
                      quantity: 1,
                      imageUrl: images[0] ?? `https://placehold.co/800x800/eeeeee/666666?text=${product.brand}`,
                      slug: product.slug,
                      voltage: product.voltage as "V110" | "V220" | "BIVOLT",
                      warrantyMonths: product.warrantyMonths,
                    });
                  }}
                  disabled={isOutOfStock}
                  className="btn-cta w-full min-h-[56px] text-lg disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                    {isOutOfStock ? 'remove_shopping_cart' : 'shopping_cart'}
                  </span>
                  {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-semibold mt-4">
                  <span className="material-symbols-outlined text-base text-primary">local_shipping</span>
                  Entrega + Instalação Gratis na Grande SP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Specs ───────────────────────────────────────────── */}
        <section className="px-6 mb-12">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-surface p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>weight</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Capacidade</span>
              <span className="font-black text-on-surface">{product.capacity}</span>
            </div>
            <div className="bg-surface p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Voltagem</span>
              <span className="font-black text-on-surface">{product.voltage.replace('V', '')} V</span>
            </div>
            <div className="bg-surface p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Garantia</span>
              <span className="font-black text-on-surface">{product.warrantyMonths} Meses</span>
            </div>
            <div className="bg-surface p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors hidden sm:flex">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Estado</span>
              <span className="font-black text-on-surface whitespace-nowrap">Renovado A</span>
            </div>
            <div className="bg-surface p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors hidden md:flex">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Modelo</span>
              <span className="font-black text-on-surface text-sm break-all leading-tight">{product.model}</span>
            </div>
          </div>
        </section>

        {/* ── Transparência / O que foi renovado ──────────────────── */}
        <section className="bg-primary/5 rounded-[3rem] px-6 py-12 mx-4 sm:mx-6 mb-12 border border-primary/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-10 relative z-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center -mt-20 border border-primary/10">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-on-surface mt-2">O que foi renovado?</h3>
              <p className="text-on-surface-variant text-base font-medium">Transparência total sobre as condições desta máquina.</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-outline-variant/20">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-tertiary text-2xl mt-1">notes</span>
                <div>
                  <h4 className="font-bold text-on-surface mb-2">Nota Técnica do Especialista</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{product.conditionNote}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-outline-variant/10 hover:border-primary/20 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">timer</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Eletrônica</p>
                    <p className="text-xs text-on-surface-variant">Placas testadas</p>
                  </div>
                </div>
                <span className="text-primary text-xs font-black bg-primary/10 px-2 py-1 rounded-md">100% OK</span>
              </div>
              <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-outline-variant/10 hover:border-primary/20 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">water_drop</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Hidráulica</p>
                    <p className="text-xs text-on-surface-variant">Bomba e mangueiras</p>
                  </div>
                </div>
                <span className="text-primary text-xs font-black bg-primary/10 px-2 py-1 rounded-md">VERIFICADO</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
