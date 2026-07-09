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

const WhatsAppSVG = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><path d="M9 18l6-6-6-6"/></svg>
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

  const navigate = (t: 'inicio' | 'catalogo' | 'contacto') => {
    setTab(t);
    const paths: Record<string, string> = { inicio: `/tienda/${store!.slug}`, catalogo: `/tienda/${store!.slug}/catalogo`, contacto: `/tienda/${store!.slug}/contacto` };
    window.history.pushState({}, '', paths[t]);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
        <span className="text-stone-400 text-sm font-medium tracking-wide">Cargando tienda</span>
      </div>
    </div>
  );

  if (notFound || !store) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-stone-100 flex items-center justify-center text-5xl mb-6 shadow-sm">🔍</div>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Tienda no encontrada</h1>
      <p className="text-stone-400 max-w-xs">Este enlace no existe o la tienda esta pausada.</p>
    </div>
  );

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const waLink = (text?: string) => store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text || 'Hola! Vi tu tienda y quiero mas info')}`
    : '#';

  const accent = store.accent_color;
  const accentRGB = hexToRGB(accent);
  const bgColor = '#fafaf8';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* ====== HERO BANNER ====== */}
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accent}18 0%, ${accent}05 40%, #fafaf8 100%)` }}>
        {store.banner_url ? (
          <div className="w-full aspect-[2.2/1] max-h-[320px] overflow-hidden">
            <img src={store.banner_url} alt={`${store.store_name} banner`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full pt-8 pb-6 px-6 flex flex-col items-center text-center">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="w-24 h-24 rounded-3xl object-cover shadow-xl mb-5 ring-4 ring-white/80" />
            ) : (
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold shadow-xl mb-5 ring-4 ring-white/80"
                style={{ background: `linear-gradient(135deg, ${accent}, ${adjustColor(accent, -40)})` }}>
                {store.store_name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">{store.store_name}</h1>
            {store.description && <p className="text-stone-500 mt-2 max-w-md text-sm leading-relaxed">{store.description}</p>}
            <div className="flex gap-2 mt-4">
              <a href={waLink(`Hola ${store.store_name}! Quiero info`)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-300">
                <WhatsAppSVG className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ====== NAVIGATION TABS ====== */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-stone-200/50" style={{ backgroundColor: 'rgba(250,250,248,0.88)' }}>
        <div className="max-w-3xl mx-auto flex px-2">
          {[
            { id: 'inicio' as const, label: 'Inicio', icon: '✦' },
            { id: 'catalogo' as const, label: 'Catalogo', icon: '☰' },
            { id: 'contacto' as const, label: 'Contacto', icon: '✉' },
          ].map(t => (
            <button key={t.id} onClick={() => navigate(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-all duration-200 relative"
              style={{ color: tab === t.id ? accent : '#a8a29e' }}>
              <span className="text-xs">{t.icon}</span> {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all" style={{ backgroundColor: accent }} />}
            </button>
          ))}
        </div>
      </nav>

      {/* ====== CONTENT ====== */}
      <main className="max-w-3xl mx-auto px-4 py-1 pb-32">

        {/* ========== INICIO ========== */}
        {tab === 'inicio' && (
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Ver Catalogo', sub: `${products.length} productos`, icon: '🛍️', action: () => navigate('catalogo'), bg: accent + '12', border: accent + '20' },
                { label: 'WhatsApp', sub: 'Contacto directo', icon: '💬', action: () => window.open(waLink('Hola! Quiero info'), '_blank'), bg: '#ecfdf5', border: '#a7f3d0' },
                { label: 'Contacto', sub: 'Donde estamos', icon: '📍', action: () => navigate('contacto'), bg: accent + '08', border: accent + '12' },
              ].map(card => (
                <button key={card.label} onClick={card.action}
                  className="p-5 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300 hover:shadow-md group"
                  style={{ backgroundColor: card.bg, border: `1px solid ${card.border}` }}>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">{card.icon}</div>
                  <div className="text-sm font-semibold text-stone-800">{card.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{card.sub}</div>
                </button>
              ))}
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-stone-200/50">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-stone-800">Productos destacados</h3>
                <button onClick={() => navigate('catalogo')} className="text-sm font-semibold hover:underline transition flex items-center gap-1" style={{ color: accent }}>
                  Ver todos <ChevronRight />
                </button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-12 text-stone-300">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-sm font-medium">Sin productos todavia</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((p, i) => (
                    <ProductCard key={p.id} product={p} accent={accent} waLink={waLink} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== CATALOGO ========== */}
        {tab === 'catalogo' && (
          <div className="space-y-5 pt-4">
            <div className="bg-gradient-to-br from-stone-50 to-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h2 className="text-2xl font-extrabold text-stone-800 mb-1">Catalogo</h2>
              <p className="text-stone-400 text-sm">Descubre nuestros productos y pedi por WhatsApp</p>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"><SearchIcon /></div>
              <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-50 transition-all" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: selectedCat === cat ? accent : '#fff',
                    color: selectedCat === cat ? '#fff' : '#78716c',
                    boxShadow: selectedCat === cat ? `0 4px 14px rgba(${accentRGB},0.35)` : '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-30">📦</div>
                <p className="text-stone-400 font-medium">{search ? 'Nada encontrado' : 'Catalogo vacio'}</p>
                {search && <button onClick={() => setSearch('')} className="mt-3 text-sm font-semibold text-stone-500 hover:text-stone-700">Limpiar busqueda</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} accent={accent} waLink={waLink} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== CONTACTO ========== */}
        {tab === 'contacto' && (
          <div className="space-y-5 pt-4">
            <div className="bg-gradient-to-br from-stone-50 to-white rounded-3xl p-6 border border-stone-200/50 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <WhatsAppSVG className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-800 mb-1">Contacto</h2>
              <p className="text-stone-400 text-sm">Escribinos por WhatsApp y te respondemos rapido</p>
            </div>

            <a href={waLink('Hola! Quiero info de sus productos')} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all duration-200 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-200">
                <WhatsAppSVG className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-800">WhatsApp</div>
                <div className="text-xs text-stone-500">{store.whatsapp || 'Numero no configurado'}</div>
              </div>
              <ChevronRight />
            </a>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-2xl p-5 border border-stone-200/50 shadow-sm text-center">
                <div className="text-2xl mb-2">🕐</div>
                <div className="text-xs font-semibold text-stone-700">Lunes a Viernes</div>
                <div className="text-[11px] text-stone-400 mt-0.5">9:00 AM - 6:00 PM</div>
              </div>
              <div className="bg-white/70 rounded-2xl p-5 border border-stone-200/50 shadow-sm text-center">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-xs font-semibold text-stone-700">Respuesta</div>
                <div className="text-[11px] text-stone-400 mt-0.5">En menos de 1 hora</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====== FLOATING WHATSAPP ====== */}
      <a href={waLink('Hola! Quiero info')} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-50"
        style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.35)' }}>
        <WhatsAppSVG className="w-7 h-7" />
      </a>

      {/* ====== FOOTER ====== */}
      <footer className="text-center py-10 px-4">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-300 font-medium">
          <span>{store.store_name}</span>
          <span className="text-stone-200">·</span>
          <span>Creado con <span className="font-bold text-stone-400">Global Dorado</span></span>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ProductCard({ product, accent, waLink, index }: { product: Product; accent: string; waLink: (t?: string) => string; index: number }) {
  return (
    <a href={waLink(`Me interesa: ${product.name} - $${product.price}`)} target="_blank" rel="noopener noreferrer"
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ animation: `cardIn 0.4s ease-out ${index * 0.06}s both` }}>
      <div className="aspect-square bg-stone-50 overflow-hidden relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center opacity-15">
              <div className="text-5xl mb-1">📦</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{product.category}</div>
            </div>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-stone-500 shadow-sm border border-white/50">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-stone-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-stone-900">{product.name}</h3>
        {product.description && <p className="text-[11px] text-stone-400 line-clamp-1 mb-2.5">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold tracking-tight" style={{ color: accent }}>${product.price}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
            <WhatsAppSVG className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}

function hexToRGB(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '0,0,0';
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
}

function adjustColor(hex: string, amount: number): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return hex;
  return `#${[r[1], r[2], r[3]].map(h =>
    Math.max(0, Math.min(255, parseInt(h, 16) + amount)).toString(16).padStart(2, '0')
  ).join('')}`;
}
