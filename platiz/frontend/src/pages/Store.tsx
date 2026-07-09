import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { IconSearch, IconPackage, IconClose, IconChevronDown, IconStar } from '../icons/PremiumIcons';

interface StoreProduct {
  id: string;
  title: string;
  description?: string;
  terms?: string;
  purchase_instructions?: string;
  image_url?: string;
  category: string;
  price: number;
  delivery_type: 'automatica' | 'manual';
  duration_days?: number;
  account_type?: string;
  stock?: number;
  renewable?: boolean;
  vendor_name?: string;
}

interface PurchaseResponse {
  success: boolean;
  message?: string;
  purchase_id?: string;
  new_balance?: number;
  delivery_email?: string;
  delivery_password?: string;
}

const CATEGORIES = ['Streaming', 'IA', 'Creatividad', 'Diseno Grafico', 'Edicion de Videos', 'Herramientas', 'Antivirus', 'Oficina', 'Licencia', 'Monedas de Juegos', 'Redes Sociales'];

function ProductImage({ product, size = 'card' }: { product: StoreProduct; size?: 'card' | 'modal' | 'thumb' }) {
  const imgClass = size === 'card' ? 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
    : size === 'modal' ? 'w-full h-full object-contain p-2'
    : 'w-full h-full object-cover';
  const containerClass = size === 'thumb' ? 'w-14 h-14' : size === 'modal' ? 'w-16 h-16' : 'aspect-[4/3]';

  return (
    <div className={`${containerClass} bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden relative`}>
      {product.image_url ? (
        <img src={product.image_url} alt={product.title} loading="lazy" className={imgClass}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.querySelector('.card-fallback')?.classList.remove('hidden');
          }} />
      ) : null}
      <div className={`card-fallback absolute inset-0 flex flex-col items-center justify-center gap-1 ${product.image_url ? 'hidden' : ''}`}>
        <span className="text-4xl font-black text-[#E5C158]/15">{product.title.trim().charAt(0).toUpperCase()}</span>
        <span className="text-[10px] text-[#E5C158]/20 uppercase tracking-wider">{product.category}</span>
      </div>
    </div>
  );
}

function addToast(type: 'success' | 'error', message: string) {
  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-[9999] px-5 py-3 rounded-2xl text-sm font-medium shadow-lg animate-slide-in backdrop-blur-xl ${
    type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
  }`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.classList.add('opacity-0', 'transition-opacity', 'duration-300'); setTimeout(() => el.remove(), 300); }, 3000);
}

export default function Store() {
  const { user, updateCredits } = useAuth();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (selectedProduct) { document.body.classList.add('modal-open'); }
    else { document.body.classList.remove('modal-open'); }
    return () => document.body.classList.remove('modal-open');
  }, [selectedProduct]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'Todos') params.set('category', activeCategory);
      if (search.trim()) params.set('search', search.trim());
      const qs = params.toString();
      const { data } = await api.get(`/store/products${qs ? '?' + qs : ''}`);
      const sorted = (data || []).sort((a: any, b: any) => {
        const score = (img: string) => {
          if (!img || img.length < 5) return 0;
          if (img.includes('kfstreaming') || img.includes('net-revolution.com')) return 4;
          if (img.includes('venegift') || img.includes('cuentasfull')) return 3;
          if (img.includes('icons8') || img.includes('wikipedia') || img.includes('wikimedia')) return 1;
          return 2;
        };
        const isStreamA = a.category === 'Streaming' ? 0 : 1;
        const isStreamB = b.category === 'Streaming' ? 0 : 1;
        if (isStreamA !== isStreamB) return isStreamA - isStreamB;
        const scoreA = score(a.image_url || '');
        const scoreB = score(b.image_url || '');
        if (scoreA !== scoreB) return scoreB - scoreA;
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
      setProducts(sorted);
    } catch (e) { console.error('Store fetch error:', e); }
    setLoading(false);
  }, [activeCategory, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    if ((user?.credits ?? 0) < selectedProduct.price) {
      addToast('error', 'Saldo insuficiente');
      return;
    }
    setPurchaseLoading(true);
    try {
      const { data } = await api.post<PurchaseResponse>('/store/purchase', { product_id: selectedProduct.id });
      if (data.success) {
        if ((data as any).new_balance !== undefined) updateCredits((data as any).new_balance);
        addToast('success', data.message || 'Compra realizada con exito');
        const deliveryEmail = (data as any).delivery_email || '';
        const deliveryPassword = (data as any).delivery_password || '';
        if (deliveryEmail || deliveryPassword || selectedProduct.delivery_type?.toLowerCase() === 'manual') {
          setPurchaseResult({ delivery_email: deliveryEmail, delivery_password: deliveryPassword, ...data });
        } else { setSelectedProduct(null); }
        fetchProducts();
      } else { addToast('error', data.message || 'Error al procesar la compra'); }
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Error al procesar la compra');
    }
    setPurchaseLoading(false);
  };

  const balance = user?.credits ?? 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="relative text-center py-10 md:py-12 rounded-3xl overflow-hidden bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f] border border-[#E5C158]/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,193,88,0.05),transparent_60%)]" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold gold-text mb-2">Tienda Digital</h1>
          <p className="text-gray-300 text-sm">{products.length} productos en {CATEGORIES.length} categorias</p>
          <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 bg-[#E5C158]/5 rounded-full border border-[#E5C158]/10">
            <span className="text-gray-300 text-sm">Saldo</span>
            <span className="text-white font-bold text-xl">${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border border-[#E5C158]/10">
          <IconSearch className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <input type="text" placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 w-full" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setActiveCategory('Todos')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === 'Todos'
                ? 'bg-[#E5C158] text-black shadow-[0_2px_12px_rgba(229,193,88,0.25)]'
                : 'glass text-gray-300 hover:text-white hover:border-[#E5C158]/20'
            }`}>Todos</button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-[#E5C158] text-black shadow-[0_2px_12px_rgba(229,193,88,0.25)]'
                  : 'glass text-gray-300 hover:text-white hover:border-[#E5C158]/20'
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass rounded-2xl animate-pulse">
              <div className="aspect-[4/3] bg-white/[0.02]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/[0.04] rounded w-1/3" />
                <div className="h-4 bg-white/[0.04] rounded w-2/3" />
                <div className="h-8 bg-white/[0.04] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E5C158]/5 flex items-center justify-center">
            <IconPackage className="w-10 h-10 text-[#E5C158]/15" />
          </div>
          <p className="text-gray-300 text-lg">No hay productos disponibles</p>
          <p className="text-gray-300 text-sm mt-1">Intenta con otra categoria o busqueda</p>
        </div>
      ) : (
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {products.map((product) => (
              <div key={product.id} className="group glass rounded-2xl overflow-hidden hover:border-[#E5C158]/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
                <ProductImage product={product} size="card" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-gold text-[10px]">{product.category}</span>
                    {product.stock != null && product.stock <= 3 && (
                      <span className="text-[10px] text-red-400/80 font-medium">Quedan {product.stock}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#E5C158] transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      product.delivery_type?.toLowerCase() === 'automatica'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>{product.delivery_type?.toLowerCase() === 'automatica' ? 'Automatica' : 'Manual'}</span>
                    {(product.duration_days ?? 0) > 0 && (
                      <span className="text-gray-300 text-[10px]">{product.duration_days} dias</span>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <p className="text-[#E5C158] text-xl font-bold">${product.price.toFixed(2)}</p>
                    {product.stock != null && product.stock > 3 && (
                      <p className="text-gray-300 text-[10px]">{product.stock} disp.</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedProduct(product)}
                    className="w-full mt-3 py-2.5 bg-[#E5C158] text-black font-bold rounded-xl hover:bg-[#F0D78C] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(229,193,88,0.15)] hover:shadow-[0_6px_24px_rgba(229,193,88,0.25)]">
                    Comprar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Purchase Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto store-modal-scroll md:flex md:items-center md:justify-center md:p-4" role="dialog" aria-modal="true"
          onClick={() => { if (!purchaseLoading) { setSelectedProduct(null); setPurchaseResult(null); } }}>
          <div className="fixed inset-0 bg-black/80 md:bg-black/70 md:backdrop-blur-sm" />
          <div className="relative z-10 w-full md:max-w-lg md:my-8 bg-[#0a0a0f] md:rounded-3xl md:border md:border-[#E5C158]/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }} disabled={purchaseLoading}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50">
              <IconClose className="w-4 h-4" />
            </button>
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl overflow-hidden border border-white/5">
                  <ProductImage product={selectedProduct} size="modal" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-white">{selectedProduct.title}</h2>
                  <span className="badge-gold text-xs mt-1 inline-block">{selectedProduct.category}</span>
                </div>
              </div>
              {selectedProduct.description && <p className="text-gray-300 text-sm mt-4">{selectedProduct.description}</p>}
            </div>
            <div className="px-5 md:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <InfoBadge label="Entrega" value={selectedProduct.delivery_type?.toLowerCase() === 'automatica' ? 'Automatica' : 'Manual'} />
                <InfoBadge label="Duracion" value={(selectedProduct.duration_days ?? 0) > 0 ? `${selectedProduct.duration_days} dias` : 'Permanente'} />
                <InfoBadge label="Cuenta" value={selectedProduct.account_type || 'N/A'} />
                <InfoBadge label="Renovable" value={selectedProduct.renewable ? 'Si' : 'No'} />
                <InfoBadge label="Vendedor" value={selectedProduct.vendor_name || 'GD'} />
                <InfoBadge label="Stock" value={selectedProduct.stock != null ? `${selectedProduct.stock} cuentas` : 'Ilimitado'} />
              </div>
            </div>
            {selectedProduct.terms && (
              <div className="px-5 md:px-6 pt-3">
                <button onClick={() => setTermsOpen(!termsOpen)} className="flex items-center justify-between w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                  <span className="text-gray-300 text-sm">Terminos y Condiciones</span>
                  <IconChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${termsOpen ? 'rotate-180' : ''}`} />
                </button>
                {termsOpen && (
                  <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto">
                    <p className="text-gray-300 text-xs whitespace-pre-wrap">{selectedProduct.terms}</p>
                  </div>
                )}
              </div>
            )}
            {purchaseResult && selectedProduct.delivery_type?.toLowerCase() === 'automatica' && (purchaseResult.delivery_email || purchaseResult.delivery_password) && (
              <div className="px-5 md:px-6 pt-2">
                <div className="p-3 md:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold text-sm mb-2">Credenciales de acceso</p>
                  {purchaseResult.delivery_email && <CopyRow label="Email" value={purchaseResult.delivery_email} />}
                  {purchaseResult.delivery_password && <CopyRow label="Clave" value={purchaseResult.delivery_password} />}
                </div>
              </div>
            )}
            {purchaseResult && selectedProduct.delivery_type?.toLowerCase() === 'manual' && (
              <div className="px-5 md:px-6 pt-2">
                <div className="p-3 md:p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 font-semibold text-sm mb-2">Entrega Manual</p>
                  {purchaseResult.purchase_id && <p className="text-[#E5C158] text-xs font-bold mb-2">ID: {purchaseResult.purchase_id}</p>}
                  <p className="text-gray-300 text-xs md:text-sm whitespace-pre-wrap">
                    {selectedProduct.purchase_instructions || selectedProduct.terms || 'Tu pedido sera procesado por nuestro equipo. Envia tu factura a soporte.'}
                  </p>
                </div>
              </div>
            )}
            <div className="p-5 md:p-6 pt-3 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-300">Precio</span><span className="text-white">${selectedProduct.price.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-300">Total</span><span className="text-[#E5C158] font-bold text-lg">${selectedProduct.price.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-300">Tu saldo</span>
                  <span className={`font-medium ${balance >= selectedProduct.price ? 'text-emerald-400' : 'text-red-400'}`}>${balance.toFixed(2)}</span>
                </div>
                {balance < selectedProduct.price && <p className="text-red-400 text-xs mt-1 text-center bg-red-500/10 rounded-lg py-1.5">Saldo insuficiente. Recarga para poder comprar.</p>}
              </div>
            </div>
            <div className="p-5 md:p-6 pt-0 flex flex-col sm:flex-row gap-2">
              {purchaseResult ? (
                <button onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }}
                  className="flex-1 py-3 bg-[#E5C158] text-black font-bold rounded-xl hover:bg-[#F0D78C] active:scale-[0.98] transition-all duration-200">Cerrar</button>
              ) : (
                <>
                  <button onClick={() => setSelectedProduct(null)} disabled={purchaseLoading}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-50">Cancelar</button>
                  <button onClick={handlePurchase} disabled={purchaseLoading || balance < selectedProduct.price}
                    className="flex-1 py-3 bg-[#E5C158] text-black font-bold rounded-xl hover:bg-[#F0D78C] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(229,193,88,0.15)] hover:shadow-[0_6px_24px_rgba(229,193,88,0.25)] disabled:opacity-50 disabled:cursor-not-allowed">
                    {purchaseLoading ? 'Procesando...' : 'Confirmar compra'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
      <p className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wider">{label}</p>
      <p className="text-white text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-white text-xs md:text-sm break-all">{label}: {value}</p>
      <button onClick={() => { navigator.clipboard.writeText(value); }}
        className="flex-shrink-0 text-gray-300 hover:text-emerald-400 transition-colors text-xs px-2 py-1 rounded bg-white/5">Copiar</button>
    </div>
  );
}
