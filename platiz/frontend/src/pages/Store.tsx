import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { IconSearch, IconPackage, IconClose, IconChevronDown } from '../icons/PremiumIcons';

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

function addToast(type: 'success' | 'error', message: string) {
  // Use inline toast or leave as placeholder — toast from react-hot-toast is imported in parent
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
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
          if (img.includes('kfstreaming') || img.includes('net-revolution.com')) return 5;
          if (img.includes('venegift') || img.includes('cuentasfull')) return 4;
          if (img.includes('cdnlogo') || img.includes('logodownload') || img.includes('brandlogos') || img.includes('clearbit')) return 3;
          if (img.includes('icons8') || img.includes('wikipedia') || img.includes('wikimedia')) return 1;
          return 2;
        };
        return score(b.image_url || '') - score(a.image_url || '');
      });
      setProducts(sorted);
    } catch (e) {
      console.error('Store fetch error:', e);
    }
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
      const { data } = await api.post<PurchaseResponse>('/store/purchase', {
        product_id: selectedProduct.id,
      });
        if (data.success) {
          if ((data as any).new_balance !== undefined) {
            updateCredits((data as any).new_balance);
          }
          addToast('success', data.message || 'Compra realizada con exito');
          const deliveryEmail = (data as any).delivery_email || '';
          const deliveryPassword = (data as any).delivery_password || '';
          if (deliveryEmail || deliveryPassword || selectedProduct.delivery_type?.toLowerCase() === 'manual') {
            setPurchaseResult({ delivery_email: deliveryEmail, delivery_password: deliveryPassword, ...data });
          } else {
            setSelectedProduct(null);
          }
          fetchProducts();
      } else {
        addToast('error', data.message || 'Error al procesar la compra');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al procesar la compra';
      addToast('error', msg);
    }
    setPurchaseLoading(false);
  };

  const balance = user?.credits ?? 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center relative">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Tienda</h1>
        <p className="section-subtitle">{products.length} productos disponibles</p>
        <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-[#FFD700]/10 rounded-full border border-[#FFD700]/20">
          <span className="text-[#FFD700] text-sm">Saldo:</span>
          <span className="text-white font-bold text-lg">${balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border border-[#FFD700]/10">
          <IconSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input type="text" placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 w-full" />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        <button
          onClick={() => setActiveCategory('Todos')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            activeCategory === 'Todos'
              ? 'bg-[#FFD700] text-black font-bold shadow-[0_2px_12px_rgba(255,215,0,0.25)]'
              : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:border-[#FFD700]/30 hover:text-[#FFD700]'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeCategory === cat
                ? 'bg-[#FFD700] text-black font-bold shadow-[0_2px_12px_rgba(255,215,0,0.25)]'
                : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:border-[#FFD700]/30 hover:text-[#FFD700]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FFD700]/5 rounded-full flex items-center justify-center">
            <IconPackage className="w-10 h-10 text-[#FFD700]/20" />
          </div>
          <p className="text-gray-400">No hay productos disponibles</p>
        </div>
      ) : (
        <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#FFD700]/20 hover:-translate-y-1 transition-colors duration-300 overflow-hidden cursor-pointer"
            >
              {/* Image - Flyer style */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.querySelector('.card-fallback')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`card-fallback absolute inset-0 flex items-center justify-center ${product.image_url ? 'hidden' : ''} text-6xl font-black text-[#FFD700]/20`}>
                  {product.title.trim().charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="p-4">
                {/* Category */}
                <span className="badge-gold text-xs mb-2">{product.category}</span>

                {/* Title */}
                <h3 className="text-white font-semibold text-sm md:text-base mt-2 line-clamp-2">
                  {product.title}
                </h3>

                {/* Delivery type + Duration */}
                <div className="flex flex-wrap items-center gap-2 text-xs mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                    product.delivery_type?.toLowerCase() === 'automatica'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {product.delivery_type?.toLowerCase() === 'automatica' ? 'Automatica' : 'Manual'}
                  </span>
                    {(product.duration_days ?? 0) > 0 && (
                      <span className="text-gray-400">
                        {product.duration_days} dias{product.account_type ? ` \u2022 ${product.account_type === 'temporal' ? 'Temporal' : product.account_type === 'permanente' ? 'Permanente' : product.account_type}` : ''}
                      </span>
                    )}
                </div>

                {/* Stock */}
                {product.stock != null && (
                  <p className="text-gray-400 text-xs mt-2">
                    Stock: {product.stock} disponibles
                  </p>
                )}

                {/* Price */}
                <p className="text-[#FFD700] text-xl font-bold mt-1">
                  ${product.price.toFixed(2)}
                </p>

                {/* Buy button */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full mt-1 py-2.5 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)]"
                >
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
        <div className="fixed inset-0 z-50 overflow-y-auto store-modal-scroll md:flex md:items-center md:justify-center md:p-4" role="dialog" aria-modal="true" aria-label="Comprar producto"
          onClick={() => { if (!purchaseLoading) { setSelectedProduct(null); setPurchaseResult(null); } }}
        >
          <div className="fixed inset-0 bg-black/80 md:bg-black/70 md:backdrop-blur-sm" />
          <div className="relative z-10 w-full md:max-w-lg md:my-8 bg-[#0a0a0f] md:rounded-3xl md:border md:border-[#FFD700]/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }}
              disabled={purchaseLoading}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <IconClose className="w-4 h-4" />
            </button>

            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/5 flex items-center justify-center overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt={selectedProduct.title} loading="lazy" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-2xl font-black text-[#FFD700]/30">{selectedProduct.title.trim().charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-white">{selectedProduct.title}</h2>
                  <span className="badge-gold text-xs mt-1 inline-block">{selectedProduct.category}</span>
                </div>
              </div>
              {selectedProduct.description && (
                <p className="text-gray-400 text-sm mt-3">{selectedProduct.description}</p>
              )}
            </div>

            <div className="px-5 md:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Entrega</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedProduct.delivery_type?.toLowerCase() === 'automatica'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedProduct.delivery_type?.toLowerCase() === 'automatica' ? 'Automatica' : 'Manual'}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Duracion</p>
                  <p className="text-white text-sm font-medium">{(selectedProduct.duration_days ?? 0) > 0 ? `${selectedProduct.duration_days} dias` : 'Permanente'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Cuenta</p>
                  <p className="text-white text-sm font-medium truncate">{selectedProduct.account_type === 'temporal' ? 'Temporal' : selectedProduct.account_type === 'permanente' ? 'Permanente' : (selectedProduct.account_type || 'N/A')}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Renovable</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.renewable ? 'Si' : 'No'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Vendedor</p>
                  <p className="text-white text-sm font-medium truncate">{selectedProduct.vendor_name || 'GD'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 md:p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Stock</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.stock != null ? `${selectedProduct.stock} cuentas` : 'Ilimitado'}</p>
                </div>
              </div>
            </div>

            {selectedProduct.terms && (
              <div className="px-5 md:px-6 pt-3">
                <button onClick={() => setTermsOpen(!termsOpen)} className="flex items-center justify-between w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                  <span className="text-gray-400 text-sm">Terminos y Condiciones</span>
                  <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${termsOpen ? 'rotate-180' : ''}`} />
                </button>
                {termsOpen && (
                  <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto">
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">{selectedProduct.terms}</p>
        </div>
      )}
              </div>
            )}

            {purchaseResult && selectedProduct.delivery_type?.toLowerCase() === 'automatica' && (purchaseResult.delivery_email || purchaseResult.delivery_password) && (
              <div className="px-5 md:px-6 pt-2">
                <div className="p-3 md:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold text-sm mb-2">Credenciales de acceso</p>
                  {purchaseResult.delivery_email && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-xs md:text-sm break-all">Email: {purchaseResult.delivery_email}</p>
                      <button onClick={() => { navigator.clipboard.writeText(purchaseResult.delivery_email!); }} className="flex-shrink-0 text-gray-400 hover:text-emerald-400 transition-colors text-xs px-2 py-1 rounded bg-white/5">Copiar</button>
                    </div>
                  )}
                  {purchaseResult.delivery_password && (
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-white text-xs md:text-sm break-all">Clave: {purchaseResult.delivery_password}</p>
                      <button onClick={() => { navigator.clipboard.writeText(purchaseResult.delivery_password!); }} className="flex-shrink-0 text-gray-400 hover:text-emerald-400 transition-colors text-xs px-2 py-1 rounded bg-white/5">Copiar</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {purchaseResult && selectedProduct.delivery_type?.toLowerCase() === 'manual' && (
              <div className="px-5 md:px-6 pt-2">
                <div className="p-3 md:p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 font-semibold text-sm mb-2">Entrega Manual</p>
                  {purchaseResult.purchase_id && (
                    <p className="text-[#FFD700] text-xs font-bold mb-2">ID: {purchaseResult.purchase_id}</p>
                  )}
                  {selectedProduct.purchase_instructions ? (
                    <p className="text-gray-300 text-xs md:text-sm whitespace-pre-wrap">{selectedProduct.purchase_instructions}</p>
                  ) : selectedProduct.terms ? (
                    <p className="text-gray-300 text-xs md:text-sm whitespace-pre-wrap">{selectedProduct.terms}</p>
                  ) : (
                    <>
                      <p className="text-gray-300 text-xs md:text-sm">Tu pedido sera procesado por nuestro equipo.</p>
                      <p className="text-gray-400 text-xs mt-1">Envia tu factura a soporte para mayor rapidez en la entrega. Guarda tu ID de compra como referencia.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 md:p-6 pt-3 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Precio</span>
                  <span className="text-white">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-[#FFD700] font-bold text-lg">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-400">Tu saldo</span>
                  <span className={`font-medium ${balance >= selectedProduct.price ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
                {balance < selectedProduct.price && (
                  <p className="text-red-400 text-xs mt-1 text-center bg-red-500/10 rounded-lg py-1.5">
                    Saldo insuficiente. Recarga para poder comprar.
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 md:p-6 pt-0 flex flex-col sm:flex-row gap-2">
              {purchaseResult ? (
                <button
                  onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }}
                  className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)]"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    disabled={purchaseLoading}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors duration-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading || balance < selectedProduct.price}
                    className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
