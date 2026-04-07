'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';

// Tipagem baseada no backend (vamos ajustar conforme os dados reais)
interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  condition: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  brand: string;
  voltage: string;
  isFeatured: boolean;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedVoltage, setSelectedVoltage] = useState('Todas');
  const [sortOption, setSortOption] = useState('recent');

  const addItemToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Construir os params dinamicamente
        const params: any = {};
        if (selectedBrand !== 'Todas') params.brand = selectedBrand;
        if (selectedVoltage !== 'Todas') params.voltage = selectedVoltage;
        params.sort = sortOption;

        const data = await productsApi.list(params);
        if (isMounted) setProducts(data.items || data || []);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Erro ao carregar produtos');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, [selectedBrand, selectedVoltage, sortOption]);

  const brands = ['Todas', 'Brastemp', 'Samsung', 'LG', 'Electrolux', 'Consul', 'Midea'];
  const voltages = ['Todas', 'V110', 'V220', 'BIVOLT'];

  return (
    <div className="bg-background min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* ——— Sidebar de Filtros ——— */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl font-black tracking-tight mb-4 text-on-surface">Catálogo</h2>
            <p className="text-sm text-on-surface-variant font-medium">Filtre para encontrar a lavadora perfeita.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-on-surface-variant">Marca</h3>
            <div className="flex flex-col gap-2">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="brand" 
                    value={brand}
                    checked={selectedBrand === brand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-offset-background bg-transparent"
                  />
                  <span className={`text-sm font-medium transition-colors ${selectedBrand === brand ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-on-surface-variant">Voltagem</h3>
            <div className="flex flex-col gap-2">
              {voltages.map((volt) => (
                <label key={volt} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="voltage" 
                    value={volt}
                    checked={selectedVoltage === volt}
                    onChange={(e) => setSelectedVoltage(e.target.value)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-offset-background bg-transparent"
                  />
                  <span className={`text-sm font-medium transition-colors ${selectedVoltage === volt ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                    {volt === 'Todas' ? 'Todas' : volt.replace('V110', '110V').replace('V220', '220V')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ——— Lista de Produtos ——— */}
        <div className="flex-1">
          {/* Header listagem */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-fade-in delay-75">
            <h1 className="text-2xl font-bold text-on-surface">
              {loading ? 'Carregando...' : `${products.length} produtos encontrados`}
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Ordenar por</span>
              <select 
                title="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="input-filled !py-2 !py-2.5 text-sm w-48 border-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-2xl animate-fade-in">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl animate-fade-in">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">search_off</span>
              <h2 className="text-lg font-bold text-on-surface mb-2">Nenhum produto encontrado</h2>
              <p className="text-on-surface-variant">Tente alterar os filtros ou a categoria selecionada.</p>
              <button 
                onClick={() => { setSelectedBrand('Todas'); setSelectedVoltage('Todas'); }}
                className="btn-outline mt-6"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              // Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container rounded-[2rem] h-[400px]"></div>
              ))
            ) : (
              products.map((product, i) => {
                const isOutOfStock = product.stock === 0;
                return (
                  <div key={product.id} className="group flex flex-col bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="relative aspect-square bg-surface-container p-6 flex-shrink-0">
                      {isOutOfStock && (
                        <div className="absolute top-4 left-4 z-10 bg-error text-on-error text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Esgotado
                        </div>
                      )}
                      {!isOutOfStock && product.originalPrice > product.salePrice && (
                        <div className="absolute top-4 left-4 z-10 bg-error-container text-on-error-container text-xs font-black px-3 py-1 rounded-full shadow-sm border border-error/10">
                          - {Math.round((1 - product.salePrice / product.originalPrice) * 100)}%
                        </div>
                      )}
                      
                      {/* Badge condição */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-md px-2 py-1 rounded-full border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span className="text-[10px] font-bold text-on-surface tracking-wider uppercase">Certificada</span>
                      </div>

                      <div className="relative w-full h-full transform transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={`https://placehold.co/400x400/eeeeee/666666?text=${product.brand}`}
                          alt={product.name}
                          fill
                          className={`object-contain object-center drop-shadow-sm transition-opacity duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 relative">
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{product.brand}</p>
                      
                      <Link href={`/products/${product.slug}`} className="flex-1">
                        <h3 className="text-lg font-black leading-tight text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-4 flex flex-col justify-end">
                        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-container w-fit px-2 py-1 rounded-md mb-3">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bolt</span>{product.voltage.replace('V', '')}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_laundry_service</span>{product.name.includes('kg') ? product.name.match(/\d+kg/)?.[0] : 'Refurbished'}</span>
                        </div>
                        
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            {product.originalPrice > product.salePrice && (
                              <p className="text-sm text-on-surface-variant line-through font-medium leading-none mb-1">
                                R$ {product.originalPrice}
                              </p>
                            )}
                            <p className={`text-2xl font-black leading-none ${isOutOfStock ? 'text-on-surface-variant' : 'text-primary'}`}>
                              R$ {product.salePrice}
                            </p>
                            <p className="text-xs text-on-surface-variant font-medium mt-1">
                              em até 12x s/ juros
                            </p>
                          </div>
                      
                          <button
                            onClick={() => {
                              addItemToCart({
                                productId: product.id,
                                name: product.name,
                                price: product.salePrice,
                                quantity: 1,
                                imageUrl: `https://placehold.co/400x400/eeeeee/666666?text=${product.brand}`,
                              });
                            }}
                            disabled={isOutOfStock}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-sm
                              ${isOutOfStock 
                                ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant/20' 
                                : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary hover:shadow-md border border-primary/10 group-hover:-translate-y-1'
                              }`}
                            aria-label="Adicionar ao carrinho"
                          >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {isOutOfStock ? 'remove_shopping_cart' : 'shopping_cart'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
