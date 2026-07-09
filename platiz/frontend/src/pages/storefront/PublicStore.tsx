import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

interface Store {
  store_name: string; description: string; slug: string;
  logo_url: string; whatsapp: string;
  primary_color: string; accent_color: string; text_color: string; card_color: string;
}

interface Product {
  id: string; name: string; description: string;
  price: number; image_url: string; category: string;
}

const WHATSAPP_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storeRes, prodRes] = await Promise.all([
          api.get(`/storefront/public/${slug}`),
          api.get(`/storefront/public/${slug}/products`)
        ]);
        setStore(storeRes.data);
        setProducts(prodRes.data || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#25D366]/20 border-t-[#25D366] animate-spin" />
          <span className="text-gray-400 text-sm">Cargando tienda...</span>
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl mb-5">🔍</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Tienda no encontrada</h1>
        <p className="text-gray-400 text-sm max-w-xs">Este enlace no existe o la tienda est�?¡ pausada.</p>
      </div>
    );
  }

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.description || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola! Vi tu tienda ' + store.store_name + ' y me interesaron tus productos')}`
    : '#';

  const productWhatsappUrl = (product: Product) =>
    store.whatsapp
      ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola! Me interesa: ' + product.name + ' - $' + product.price)}`
      : '#';

  const styles = {
    bg: store.primary_color,
    accent: store.accent_color,
    text: store.text_color,
    card: store.card_color,
    accentRGB: hexToRGB(store.accent_color),
  };

  return (
    <div style={{ backgroundColor: '#f5f5f0', minHeight: '100vh', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ 
        backgroundColor: 'rgba(245,245,240,0.85)',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: store.accent_color }}>
                {store.store_name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">{store.store_name}</h1>
              {store.description && (
                <p className="text-xs text-gray-400 truncate">{store.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition"
              aria-label="Buscar"
            >
              {SEARCH_ICON}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 h-9 rounded-full text-white text-xs font-semibold transition hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              {WHATSAPP_ICON}
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {showSearch && (
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                {SEARCH_ICON}
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition"
              />
              {search && (
                <button onClick={() => { setSearch(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CATEGORIES */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: selectedCat === cat ? store.accent_color : '#fff',
                color: selectedCat === cat ? '#fff' : '#666',
                boxShadow: selectedCat === cat ? `0 2px 8px rgba(${styles.accentRGB},0.3)` : '0 1px 2px rgba(0,0,0,0.04)',
                border: selectedCat === cat ? 'none' : '1px solid rgba(0,0,0,0.06)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <main className="max-w-3xl mx-auto px-4 py-4 pb-28">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">📦</div>
            <p className="text-gray-400 text-sm font-medium">
              {search ? 'No se encontraron productos' : 'Esta tienda no tiene productos todavia'}
            </p>
            {search && <button onClick={() => setSearch('')} className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700">Limpiar busqueda</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {filtered.map((product, i) => (
              <a
                key={product.id}
                href={productWhatsappUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
                  animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`
                }}
              >
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1 opacity-30">📦</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-300">{product.category}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-500 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: store.accent_color }}>
                      ${product.price}
                    </span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                      {WHATSAPP_ICON}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-50"
        style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
      </a>

      {/* FOOTER */}
      <footer className="max-w-3xl mx-auto px-4 pb-8 text-center">
        <div className="h-px bg-gray-200 mb-4" />
        <p className="text-[11px] text-gray-300">
          {store.store_name} · Creado con <span className="font-semibold text-gray-400">Global Dorado</span>
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>
    </div>
  );
}

function hexToRGB(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0,0,0';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
