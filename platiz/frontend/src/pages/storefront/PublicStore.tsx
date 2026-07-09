import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';

interface Store {
  store_name: string; description: string; slug: string;
  logo_url: string; banner_url: string; whatsapp: string;
  primary_color: string; accent_color: string; text_color: string; card_color: string;
}

interface Product {
  id: string; name: string; description: string;
  price: number; image_url: string; category: string;
}

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
  </svg>
);

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<'inicio' | 'catalogo' | 'contacto'>('inicio');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');

  useEffect(() => {
    if (location.pathname.includes('/catalogo')) setTab('catalogo');
    else if (location.pathname.includes('/contacto')) setTab('contacto');
    else setTab('inicio');
  }, [location.pathname]);

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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-green-500 animate-spin" /></div>;
  if (notFound || !store) return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6"><div className="text-5xl mb-4">🔍</div><h1 className="text-xl font-bold text-gray-800">Tienda no encontrada</h1></div>;

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const waLink = store.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola! Vi tu tienda y quiero info')}` : '#';
  const waProduct = (p: Product) => store.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola! Me interesa: ' + p.name + ' - $' + p.price)}` : '#';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* BANNER / HERO */}
      <div className="relative w-full" style={{ backgroundColor: store.accent_color + '15' }}>
        {store.banner_url ? (
          <div className="w-full aspect-[2/1] max-h-64 overflow-hidden">
            <img src={store.banner_url} alt={store.store_name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 flex flex-col items-center justify-center text-center px-6" style={{ 
            background: `linear-gradient(135deg, ${store.accent_color}20, ${store.accent_color}08)` 
          }}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="w-20 h-20 rounded-2xl object-cover shadow-lg mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4" style={{ backgroundColor: store.accent_color }}>
                {store.store_name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{store.store_name}</h1>
            {store.description && <p className="text-gray-500 mt-1 text-sm">{store.description}</p>}
          </div>
        )}
      </div>

      {/* NAV TABS */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex">
          {[
            { id: 'inicio', label: 'Inicio', path: `/tienda/${store.slug}` },
            { id: 'catalogo', label: 'Catalogo', path: `/tienda/${store.slug}/catalogo` },
            { id: 'contacto', label: 'Contacto', path: `/tienda/${store.slug}/contacto` },
          ].map(t => (
            <a
              key={t.id}
              href={t.path}
              onClick={e => { e.preventDefault(); setTab(t.id as any); window.history.pushState({}, '', t.path); }}
              className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 transition ${
                tab === t.id ? 'border-current text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={tab === t.id ? { color: store.accent_color, borderColor: store.accent_color } : {}}
            >
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        
        {/* === INICIO === */}
        {tab === 'inicio' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Bienvenido a {store.store_name}</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {store.description || 'Descubre nuestros productos y contactanos por WhatsApp para hacer tu pedido.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a href={`/tienda/${store.slug}/catalogo`} onClick={e => { e.preventDefault(); setTab('catalogo'); window.history.pushState({}, '', `/tienda/${store.slug}/catalogo`); }}
                className="p-5 rounded-2xl text-center hover:-translate-y-0.5 transition-all cursor-pointer"
                style={{ backgroundColor: store.accent_color + '10', border: '1px solid ' + store.accent_color + '20' }}>
                <div className="text-3xl mb-2">🛍️</div>
                <div className="text-sm font-semibold text-gray-800">Ver Catalogo</div>
                <div className="text-xs text-gray-400 mt-0.5">{products.length} productos</div>
              </a>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="p-5 rounded-2xl text-center hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: '#25D36610', border: '1px solid #25D36620' }}>
                <div className="text-3xl mb-2">💬</div>
                <div className="text-sm font-semibold text-gray-800">WhatsApp</div>
                <div className="text-xs text-gray-400 mt-0.5">Contacto directo</div>
              </a>
              <a href={`/tienda/${store.slug}/contacto`} onClick={e => { e.preventDefault(); setTab('contacto'); window.history.pushState({}, '', `/tienda/${store.slug}/contacto`); }}
                className="p-5 rounded-2xl text-center hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: store.card_color + '30', border: '1px solid ' + store.accent_color + '15' }}>
                <div className="text-3xl mb-2">📍</div>
                <div className="text-sm font-semibold text-gray-800">Contacto</div>
                <div className="text-xs text-gray-400 mt-0.5">Donde estamos</div>
              </a>
            </div>

            {products.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-800">Productos destacados</h3>
                  <a href={`/tienda/${store.slug}/catalogo`} onClick={e => { e.preventDefault(); setTab('catalogo'); window.history.pushState({}, '', `/tienda/${store.slug}/catalogo`); }}
                    className="text-sm font-semibold" style={{ color: store.accent_color }}>Ver todos →</a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.slice(0, 6).map(p => (
                    <a key={p.id} href={waProduct(p)} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📦</div>}
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: store.accent_color }}>${p.price}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === CATALOGO === */}
        {tab === 'catalogo' && (
          <div>
            <div className="mb-4">
              <div className="relative">
                <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-200 focus:bg-white transition" />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex-shrink-0"
                  style={{
                    backgroundColor: selectedCat === cat ? store.accent_color : '#f3f4f6',
                    color: selectedCat === cat ? '#fff' : '#6b7280'
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-400 text-sm">{search ? 'Sin resultados' : 'Sin productos'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(p => (
                  <a key={p.id} href={waProduct(p)} target="_blank" rel="noopener noreferrer"
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><div className="text-4xl opacity-20">📦</div></div>}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-500">{p.category}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{p.name}</h3>
                      {p.description && <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>}
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-base font-bold" style={{ color: store.accent_color }}>${p.price}</span>
                        <span className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all"><WAIcon /></span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === CONTACTO === */}
        {tab === 'contacto' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Contactanos</h2>
              <p className="text-gray-400 text-sm">Pedinos info por WhatsApp</p>
            </div>

            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">WhatsApp</div>
                <div className="text-xs text-gray-500">{store.whatsapp || 'Sin numero'}</div>
              </div>
              <svg className="ml-auto w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </a>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <div className="text-3xl mb-2">🕐</div>
              <div className="text-sm font-semibold text-gray-800">Horario de atencion</div>
              <div className="text-xs text-gray-400 mt-1">Lunes a Viernes 9:00 - 18:00</div>
            </div>
          </div>
        )}

      </main>

      {/* FLOATING WA */}
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-50"
        style={{ boxShadow: '0 4px 24px rgba(37,211,102,0.35)' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
      </a>

      {/* FOOTER */}
      <footer className="text-center py-8">
        <p className="text-[11px] text-gray-300">{store.store_name} · Creado con Global Dorado</p>
      </footer>

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.line-clamp-1{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1}.line-clamp-2{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}`}</style>
    </div>
  );
}
