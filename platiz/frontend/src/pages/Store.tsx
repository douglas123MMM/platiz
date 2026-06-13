import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  credentials?: { username?: string; password?: string; data?: string };
  new_balance?: number;
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const CATEGORIES = [
  'Todos',
  'Streaming',
  'Creatividad',
  'Diseno Grafico',
  'Edicion de Videos',
  'Herramientas',
  'Antivirus',
  'Oficina',
  'Licencia',
  'Monedas de Juegos',
  'Redes Sociales',
];

export default function Store() {
  const { user, updateCredits } = useAuth();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ delivery_email?: string; delivery_password?: string } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [termsOpen, setTermsOpen] = useState(false);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'Todos') params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const { data } = await api.get(`/store/products?${params.toString()}`);
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
          if (deliveryEmail || deliveryPassword) {
            setPurchaseResult({ delivery_email: deliveryEmail, delivery_password: deliveryPassword });
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
    <div className="space-y-8 animate-fade-in">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#00D4FF]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-[#A855F7]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10">
        <h1 className="section-title">Tienda Digital</h1>
        <p className="section-subtitle">Productos premium con entrega automatica</p>
        <p className="text-[#FFD700]/50 text-sm mt-1">
          Saldo disponible: <span className="text-[#FFD700] font-bold">${balance.toFixed(2)}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 max-w-lg mx-auto w-full">
        <div className="relative glass rounded-2xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-transparent border-none outline-none text-white placeholder-gray-500 rounded-2xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Row */}
      <div className="relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-[#FFD700] text-black font-bold shadow-[0_2px_12px_rgba(255,215,0,0.25)]'
                  : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:border-[#FFD700]/30 hover:text-[#FFD700]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-[#111] rounded-t-xl h-44 -mx-6 -mt-6 mb-4" />
                <div className="h-5 bg-[#111] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#111] rounded w-1/2 mb-2" />
                <div className="h-8 bg-[#111] rounded w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
            <p className="text-gray-600 text-sm mt-1">Intenta con otra categoria o busqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#FFD700]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${product.image_url ? 'hidden' : ''} flex flex-col items-center justify-center`}>
                    <svg className="w-12 h-12 text-[#FFD700]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-4xl font-black text-[#FFD700]/15 mt-1">{product.title.trim().charAt(0).toUpperCase()}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-2">
                  {/* Category badge */}
                  <span className="badge-gold self-start text-xs">{product.category}</span>

                  {/* Title */}
                  <h3 className="text-white font-bold text-base leading-tight line-clamp-2 group-hover:text-[#FFD700] transition-colors">
                    {product.title}
                  </h3>

                  {/* Delivery type + Duration */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                      product.delivery_type === 'automatica'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {product.delivery_type === 'automatica' ? 'Automatica' : 'Manual'}
                    </span>
                    {(product.duration_days ?? 0) > 0 && (
                      <span className="text-gray-400">
                        {product.duration_days} dias{product.account_type ? ` \u2022 ${product.account_type === 'temporal' ? 'Temporal' : product.account_type === 'permanente' ? 'Permanente' : product.account_type}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  {product.stock != null && (
                    <p className="text-gray-500 text-xs">
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
                    className="w-full mt-1 py-2.5 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)]"
                  >
                    Comprar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => { if (!purchaseLoading) { setSelectedProduct(null); setPurchaseResult(null); } }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-[#FFD700]/10 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }}
              disabled={purchaseLoading}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Product header */}
            <div className="p-6 pb-0">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/5 flex items-center justify-center overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.querySelector('.modal-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`modal-fallback ${selectedProduct.image_url ? 'hidden' : ''} text-2xl font-black text-[#FFD700]/30`}>
                    {selectedProduct.title.trim().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">{selectedProduct.title}</h2>
                  <span className="badge-gold text-xs mt-1">{selectedProduct.category}</span>
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-gray-400 text-sm mt-3">{selectedProduct.description}</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Tipo de entrega</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedProduct.delivery_type === 'automatica'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedProduct.delivery_type === 'automatica' ? 'Automatica' : 'Manual'}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Duracion</p>
                  <p className="text-white text-sm font-medium">{(selectedProduct.duration_days ?? 0) > 0 ? `${selectedProduct.duration_days} dias` : 'Permanente'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Tipo de cuenta</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.account_type === 'temporal' ? 'Temporal' : selectedProduct.account_type === 'permanente' ? 'Permanente' : (selectedProduct.account_type || 'N/A')}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Renovable</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.renewable ? 'Si' : 'No'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Vendedor</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.vendor_name || 'Global Dorado'}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Stock</p>
                  <p className="text-white text-sm font-medium">{selectedProduct.stock != null ? `${selectedProduct.stock} cuentas` : 'Ilimitado'}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="px-6 pb-2">
              <button
                onClick={() => setTermsOpen(!termsOpen)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#FFD700]/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#FFD700]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">Terminos y condiciones</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${termsOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {termsOpen && (
                <div className="mt-2 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-xl text-gray-400 text-xs leading-relaxed space-y-2">
                  <p>Al realizar esta compra aceptas los siguientes terminos:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Los productos digitales no tienen reembolso una vez entregados.</li>
                    <li>Las credenciales de acceso son personales e intransferibles.</li>
                    <li>Global Dorado no se hace responsable por el mal uso de las licencias.</li>
                    <li>El tiempo de entrega para productos manuales puede variar entre 1 y 24 horas.</li>
                    <li>Para soporte posterior a la compra, contacta a traves del chat de soporte.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Credentials after purchase */}
            {purchaseResult && selectedProduct.delivery_type === 'automatica' && (purchaseResult.delivery_email || purchaseResult.delivery_password) && (
              <div className="px-6 pb-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold text-sm mb-2">Credenciales de acceso</p>
                  {purchaseResult.delivery_email && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm">Email: {purchaseResult.delivery_email}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(purchaseResult.delivery_email!); }}
                        className="text-gray-500 hover:text-emerald-400 transition-colors text-xs px-2 py-1 rounded bg-white/5"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                  {purchaseResult.delivery_password && (
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-white text-sm">Clave: {purchaseResult.delivery_password}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(purchaseResult.delivery_password!); }}
                        className="text-gray-500 hover:text-emerald-400 transition-colors text-xs px-2 py-1 rounded bg-white/5"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {purchaseResult && selectedProduct.delivery_type === 'manual' && (
              <div className="px-6 pb-2">
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 font-semibold text-sm mb-2">Entrega Manual - Instrucciones</p>
                  {selectedProduct.purchase_instructions ? (
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{selectedProduct.purchase_instructions}</p>
                  ) : selectedProduct.terms ? (
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{selectedProduct.terms}</p>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm">Tu pedido sera procesado por nuestro equipo.</p>
                      <p className="text-gray-400 text-xs mt-1">Te contactaremos en las proximas 1-24 horas para entregarte las credenciales.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Price Summary */
            }
            <div className="p-6 pt-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Precio del producto</span>
                  <span className="text-white">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-[#FFD700] font-bold text-lg">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-400">Tu saldo actual</span>
                  <span className={`font-medium ${balance >= selectedProduct.price ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {purchaseResult ? (
                  <button
                    onClick={() => { setSelectedProduct(null); setPurchaseResult(null); }}
                    className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)]"
                  >
                    Cerrar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      disabled={purchaseLoading}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/[0.04] hover:text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePurchase}
                      disabled={purchaseLoading || balance < selectedProduct.price}
                      className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchaseLoading ? 'Procesando...' : 'Confirmar compra'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`animate-slide-in flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
