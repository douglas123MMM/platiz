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

interface CartItem extends Product { quantity: number; }

const I = {
  wa: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>,
  cart: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  search: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chevron: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  close: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  plus: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrowLeft: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  grid: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  store: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.43-5.36A1 1 0 015.36 3h13.28a1 1 0 01.93.64L21 9"/><path d="M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9"/><circle cx="8" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none"/></svg>,
  clock: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  zap: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  user: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  truck: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  mapPin: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z"/></svg>,
};

const CSS = `
@keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
@media (prefers-reduced-motion: reduce) { .a-fade-up,.a-fade-in,.a-scale-in { animation: none; opacity: 1 } }
.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}
`;

type TabType = 'inicio' | 'catalogo' | 'contacto' | 'checkout';

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<TabType>('inicio');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [showSearch, setShowSearch] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]'); }
    catch { return []; }
  });
  const [checkoutForm, setCheckoutForm] = useState({ nombre: '', telefono: '', direccion: '', notas: '', metodo: 'domicilio' });
  const [submitted, setSubmitted] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => { localStorage.setItem(`cart_${slug}`, JSON.stringify(cart)); }, [cart, slug]);

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/catalogo')) setTab('catalogo');
    else if (p.includes('/contacto')) setTab('contacto');
    else if (p.includes('/checkout')) setTab('checkout');
    else setTab('inicio');
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const [s, pr] = await Promise.all([
          api.get(`/storefront/public/${slug}`),
          api.get(`/storefront/public/${slug}/products`)
        ]);
        setStore(s.data); setProducts(pr.data || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const go = (t: TabType) => {
    setTab(t);
    const p: Record<TabType, string> = { inicio: `/tienda/${slug}`, catalogo: `/tienda/${slug}/catalogo`, contacto: `/tienda/${slug}/contacto`, checkout: `/tienda/${slug}/checkout` };
    window.history.pushState({}, '', p[t]);
  };

  const add = (p: Product) => setCart(prev => { const ex = prev.find(c => c.id === p.id); return ex ? prev.map(c => c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c) : [...prev, { ...p, quantity: 1 }]; });
  const remove = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const qty = (id: string, q: number) => { if (q <= 0) { remove(id); return; } setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: q } : c)); };
  const count = cart.reduce((s, c) => s + c.quantity, 0);
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const send = () => {
    if (!store?.whatsapp || submitted || !checkoutForm.nombre || !checkoutForm.telefono) return;
    setSubmitted(true);
    let m = `*${store.store_name}*\n\n*Cliente:* ${checkoutForm.nombre}\n*Tel\u00e9fono:* ${checkoutForm.telefono}\n`;
    if (checkoutForm.direccion) m += `*Direcci\u00f3n:* ${checkoutForm.direccion}\n`;
    m += `*Env\u00edo:* ${checkoutForm.metodo === 'domicilio' ? 'A domicilio' : 'Retiro en persona'}\n\n*PEDIDO:*\n`;
    cart.forEach(c => m += `\u2022 ${c.quantity}\u00d7 ${c.name} \u2014 $${c.price * c.quantity}\n`);
    m += `\n*TOTAL: $${total}*\n`;
    if (checkoutForm.notas) m += `\n${checkoutForm.notas}`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(m)}`, '_blank');
    setCart([]); setCheckoutForm({ nombre: '', telefono: '', direccion: '', notas: '', metodo: 'domicilio' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const wa = (t?: string) => store?.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(t || 'Hola\u00a1 Quiero info')}` : '#';

  if (loading) return (
    <main className="min-h-screen bg-[#f9f8f5] flex items-center justify-center" role="status" aria-label="Cargando">
      <div className="flex flex-col items-center gap-4 a-fade-in">
        <div className="w-10 h-10 rounded-full border-[2px] border-stone-200 border-t-stone-400 animate-spin" />
        <span className="text-stone-400 text-sm tracking-wide">Cargando\u2026</span>
      </div>
    </main>
  );

  if (notFound || !store) return (
    <main className="min-h-screen bg-[#f9f8f5] flex flex-col items-center justify-center p-6 text-center a-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 shadow-sm border border-stone-200/50">{I.store}</div>
      <h1 className="text-xl font-bold text-stone-800 mb-2">Tienda no encontrada</h1>
      <p className="text-stone-400 text-sm max-w-xs">Este enlace no existe o la tienda est\u00e1 pausada.</p>
    </main>
  );

  const accent = store.accent_color;
  const rgb = hexToRGB(accent);
  const cats = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => (selectedCat === 'Todos' || p.category === selectedCat) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));

  const ring = { '--tw-ring-color': accent + '50', '--tw-ring-offset-width': '2px', '--tw-ring-offset-color': '#f9f8f5' } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f8f5', fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontVariantNumeric: 'lining-nums', WebkitFontSmoothing: 'antialiased' }}>
      <style>{CSS}</style>

      {/* HERO - Header compacto con logo */}
      <div className="w-full relative" style={{ background: `linear-gradient(160deg, ${accent}16 0%, ${accent}04 70%, #f9f8f5 100%)` }}>
        {store.banner_url && !bannerError && (
          <img src={store.banner_url} alt="" className="w-full object-cover opacity-15 pointer-events-none absolute inset-0 h-full"
            loading="eager" fetchPriority="high" onError={() => setBannerError(true)} />
        )}
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-6">
          {store.logo_url ? (
            <img src={store.logo_url} alt={`Logo de ${store.store_name}`} width="80" height="80"
              className="w-20 h-20 rounded-2xl object-cover shadow-lg flex-shrink-0 ring-1 ring-black/5 bg-white"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-lg flex-shrink-0 ring-1 ring-black/5"
              style={{ background: `linear-gradient(135deg, ${accent}, ${adjustHex(accent, -25)})` }} aria-hidden="true">
              {store.store_name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight truncate">{store.store_name}</h1>
            {store.description && <p className="text-stone-500 text-sm mt-0.5 line-clamp-2">{store.description}</p>}
            <a href={wa()} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-200/40 hover:bg-emerald-600 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:outline-none">
              <span className="w-3.5 h-3.5">{I.wa}</span> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-stone-200/30" style={{ backgroundColor: 'rgba(249,248,245,0.92)' }} aria-label="Navegaci\u00f3n principal">
        <div className="max-w-3xl mx-auto flex items-center">
          {([
            { id: 'inicio' as TabType, label: 'Inicio' },
            { id: 'catalogo' as TabType, label: 'Cat\u00e1logo' },
            { id: 'contacto' as TabType, label: 'Contacto' },
          ]).map(t => (
            <button key={t.id} onClick={() => go(t.id)}
              className="flex-1 py-3.5 text-sm font-semibold transition relative focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg focus-visible:outline-none" style={ring}
              aria-current={tab === t.id ? 'page' : undefined}>
              <span style={{ color: tab === t.id ? accent : '#a8a29e' }}>{t.label}</span>
              {tab === t.id && <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />}
            </button>
          ))}
          <button onClick={() => setShowSearch(!showSearch)} className="px-3 py-3 flex items-center justify-center focus-visible:ring-2 rounded-lg focus-visible:outline-none" style={ring} aria-label={showSearch ? 'Cerrar b\u00fasqueda' : 'Buscar'}>
            <span className={showSearch ? 'text-stone-600' : 'text-stone-400'}>{showSearch ? I.close : I.search}</span>
          </button>
          <button onClick={() => go('checkout')} className="px-2 py-3 flex items-center justify-center focus-visible:ring-2 rounded-lg focus-visible:outline-none relative" style={ring} aria-label={`Carrito, ${count} producto${count !== 1 ? 's' : ''}`}>
            <span className="text-stone-400">{I.cart}</span>
            {count > 0 && <span className="absolute top-1.5 right-0 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white" aria-hidden="true">{count}</span>}
          </button>
        </div>
        {showSearch && (
          <div className="max-w-3xl mx-auto px-4 pb-3 a-scale-in">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" aria-hidden="true">{I.search}</span>
              <input autoFocus type="search" placeholder="Buscar\u2026" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Escape' && setShowSearch(false)}
                className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition shadow-sm" style={ring}
                aria-label="Buscar productos" autoComplete="off" spellCheck={false} />
              {search && <button onClick={() => { setSearch(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500" aria-label="Limpiar">{I.close}</button>}
            </div>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-36">

        {/* INICIO */}
        {tab === 'inicio' && (
          <div className="space-y-10">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cat\u00e1logo', sub: `${products.length} producto${products.length !== 1 ? 's' : ''}`, icon: I.grid, act: () => go('catalogo') },
                { label: 'WhatsApp', sub: 'Contacto directo', icon: I.wa, act: () => window.open(wa(), '_blank'), green: true },
                { label: 'Contacto', sub: 'Info y horarios', icon: I.mapPin, act: () => go('contacto') },
              ].map((c, i) => (
                <button key={c.label} onClick={c.act}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl hover:-translate-y-1 transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none a-fade-up bg-white border border-stone-200/40 shadow-sm"
                  style={{ animationDelay: `${i * 0.08}s`, ...ring }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.green ? 'bg-emerald-50 text-emerald-500' : 'bg-stone-50 text-stone-500'}`}>
                    <span className="w-5 h-5">{c.icon}</span>
                  </div>
                  <div className="text-xs font-semibold text-stone-700">{c.label}</div>
                  <div className="text-[11px] text-stone-400 -mt-1.5">{c.sub}</div>
                </button>
              ))}
            </div>

            <section aria-labelledby="feat-heading">
              <div className="flex items-end justify-between mb-6">
                <h2 id="feat-heading" className="text-lg font-extrabold text-stone-800">Destacados</h2>
                <button onClick={() => go('catalogo')}
                  className="text-sm font-semibold inline-flex items-center gap-1 hover:underline focus-visible:ring-2 rounded focus-visible:outline-none transition" style={{ color: accent, ...ring }}>
                  Ver todo <span className="w-4 h-4">{I.chevron}</span>
                </button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-20" role="status">
                  <div className="text-stone-200 mb-3">{I.store}</div>
                  <p className="text-stone-400 text-sm">Sin productos todav\u00eda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list">
                  {products.slice(0, 6).map((p, i) => <PC key={p.id} p={p} accent={accent} rgb={rgb} add={add} cart={cart} n={i} />)}
                </div>
              )}
            </section>
          </div>
        )}

        {/* CATALOGO */}
        {tab === 'catalogo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/40 shadow-sm a-fade-up">
              <h1 className="text-2xl font-extrabold text-stone-800 mb-1">Cat\u00e1logo</h1>
              <p className="text-stone-400 text-sm">Explor\u00e1 y ped\u00ed por WhatsApp</p>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" aria-hidden="true">{I.search}</span>
              <input type="search" placeholder="Buscar\u2026" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition shadow-sm" style={ring}
                autoComplete="off" spellCheck={false} aria-label="Buscar productos" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="Categor\u00edas">
              {cats.map(cat => (
                <button key={cat} role="tab" onClick={() => setSelectedCat(cat)} aria-selected={selectedCat === cat}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  style={{
                    backgroundColor: selectedCat === cat ? accent : '#fff',
                    color: selectedCat === cat ? '#fff' : '#78716c',
                    boxShadow: selectedCat === cat ? `0 4px 16px rgba(${rgb},0.3)` : '0 1px 3px rgba(0,0,0,0.04)',
                    ...ring
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 a-fade-in" role="status">
                <div className="text-stone-200 mb-4">{I.grid}</div>
                <p className="text-stone-400 text-sm font-medium">{search ? 'Sin resultados' : 'Cat\u00e1logo vac\u00edo'}</p>
                {search && <button onClick={() => setSearch('')} className="mt-3 text-sm font-semibold hover:underline" style={{ color: accent }}>Limpiar</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4" role="list">
                {filtered.map((p, i) => <PC key={p.id} p={p} accent={accent} rgb={rgb} add={add} cart={cart} n={i} />)}
              </div>
            )}
          </div>
        )}

        {/* CONTACTO */}
        {tab === 'contacto' && (
          <div className="space-y-8 a-fade-up">
            <div className="bg-white rounded-2xl p-8 border border-stone-200/40 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5 shadow-sm">{I.phone}</div>
              <h1 className="text-xl font-extrabold text-stone-800 mb-1">Contacto</h1>
              <p className="text-stone-400 text-sm max-w-xs mx-auto">Escribinos por WhatsApp, te respondemos r\u00e1pido</p>
            </div>

            <a href={wa()} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200/40 hover:border-emerald-200 hover:shadow-md transition-all shadow-sm group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-emerald-200/60" aria-hidden="true">
                <span className="w-6 h-6">{I.wa}</span>
              </div>
              <div className="flex-1"><div className="text-sm font-semibold text-stone-800">WhatsApp</div><div className="text-xs text-stone-400">{store.whatsapp || 'No configurado'}</div></div>
              <span className="text-stone-300">{I.chevron}</span>
            </a>

            <div className="grid grid-cols-2 gap-4">
              {[
                { t: 'Lunes a Viernes', d: '9 AM \u2013 6 PM', i: I.clock },
                { t: 'Respuesta', d: 'Menos de 1 hora', i: I.zap },
              ].map((c, i) => (
                <div key={c.t} className="bg-white rounded-2xl p-5 border border-stone-200/40 shadow-sm text-center a-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center mx-auto mb-3 text-stone-500"><span className="w-5 h-5">{c.i}</span></div>
                  <div className="text-xs font-semibold text-stone-700">{c.t}</div>
                  <div className="text-[11px] text-stone-400 mt-1">{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKOUT */}
        {tab === 'checkout' && (
          <div className="space-y-5 a-fade-up">
            <button onClick={() => go('catalogo')} className="text-sm text-stone-400 hover:text-stone-600 transition inline-flex items-center gap-1.5 focus-visible:ring-2 rounded-lg focus-visible:outline-none" style={ring}>
              <span className="w-4 h-4">{I.arrowLeft}</span> Volver al cat\u00e1logo
            </button>

            <div className="bg-white rounded-2xl border border-stone-200/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h1 className="text-xl font-extrabold text-stone-800 mb-1">Tu pedido</h1>
                <p className="text-stone-400 text-sm">Revis\u00e1 y complet\u00e1 tus datos</p>
              </div>

              {cart.length === 0 ? (
                <div className="p-12 text-center" role="status">
                  <div className="text-stone-200 mb-4 flex justify-center"><span className="w-10 h-10">{I.cart}</span></div>
                  <p className="text-stone-400 text-sm">Carrito vac\u00edo</p>
                  <button onClick={() => go('catalogo')} className="mt-3 text-sm font-semibold hover:underline" style={{ color: accent }}>Ir al cat\u00e1logo</button>
                </div>
              ) : (
                <div className="p-6">
                  <ul className="divide-y divide-stone-100 mb-6" aria-label="Productos en el carrito">
                    {cart.map(c => (
                      <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 ring-1 ring-stone-200/50">
                          {c.image_url ? <img src={c.image_url} alt="" width="56" height="56" className="w-full h-full object-cover" loading="lazy" /> : <div className="flex items-center justify-center h-full text-stone-300" aria-hidden="true">{I.store}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-stone-800 truncate">{c.name}</div>
                          <div className="text-xs text-stone-400">${c.price} c/u</div>
                        </div>
                        <div className="flex items-center gap-0.5" role="group" aria-label={`Cantidad de ${c.name}`}>
                          <button onClick={() => qty(c.id, c.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none" aria-label="Reducir">
                            <span className="w-3.5 h-3.5">{I.minus}</span>
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-stone-700" aria-label={`${c.quantity} unidades`}>{c.quantity}</span>
                          <button onClick={() => qty(c.id, c.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none" aria-label="Aumentar">
                            <span className="w-3.5 h-3.5">{I.plus}</span>
                          </button>
                        </div>
                        <button onClick={() => remove(c.id)}
                          className="text-stone-300 hover:text-red-400 transition p-1 focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg focus-visible:outline-none" aria-label={`Eliminar ${c.name}`}>
                          <span className="w-4 h-4">{I.trash}</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center py-4 border-t border-stone-100 mb-6">
                    <span className="text-sm font-semibold text-stone-500">Total</span>
                    <span className="text-2xl font-extrabold tracking-tight" style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>${total}</span>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); send(); }} className="space-y-3">
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tus datos</h2>
                    <input id="c-name" name="nombre" type="text" required placeholder="Nombre completo" value={checkoutForm.nombre}
                      onChange={e => setCheckoutForm({...checkoutForm, nombre: e.target.value})} autoComplete="name"
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition" style={ring} />
                    <input id="c-phone" name="telefono" type="tel" required placeholder="Tel\u00e9fono" value={checkoutForm.telefono}
                      onChange={e => setCheckoutForm({...checkoutForm, telefono: e.target.value})} autoComplete="tel"
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition" style={ring} />
                    <input id="c-addr" name="direccion" type="text" placeholder="Direcci\u00f3n" value={checkoutForm.direccion}
                      onChange={e => setCheckoutForm({...checkoutForm, direccion: e.target.value})} autoComplete="street-address"
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition" style={ring} />

                    <fieldset className="flex gap-2">
                      <legend className="sr-only">M\u00e9todo de env\u00edo</legend>
                      {[
                        { v: 'domicilio', l: 'A domicilio', i: I.truck },
                        { v: 'retiro', l: 'Retiro', i: I.mapPin },
                      ].map(m => (
                        <button key={m.v} type="button" onClick={() => setCheckoutForm({...checkoutForm, metodo: m.v})}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                            checkoutForm.metodo === m.v ? 'shadow-sm' : 'text-stone-400 border-stone-200 bg-stone-50'
                          }`}
                          style={checkoutForm.metodo === m.v ? { borderColor: accent, backgroundColor: accent + '06', ...ring } : ring}>
                          <span className="w-4 h-4">{m.i}</span> {m.l}
                        </button>
                      ))}
                    </fieldset>

                    <textarea id="c-notes" name="notas" placeholder="Notas adicionales" rows={2} value={checkoutForm.notas}
                      onChange={e => setCheckoutForm({...checkoutForm, notas: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent transition resize-none" style={ring} />

                    <button type="submit" disabled={!checkoutForm.nombre || !checkoutForm.telefono || cart.length === 0 || submitted}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none">
                      <span className="w-5 h-5">{I.wa}</span>
                      {submitted ? '\u00a1Enviado\u00a1' : 'Enviar pedido por WhatsApp'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FLOATING */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50" role="complementary" aria-label="Acciones r\u00e1pidas">
        {count > 0 && (
          <button onClick={() => go('checkout')}
            className="w-13 h-13 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-stone-200/60 hover:scale-105 transition-all relative focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}
            aria-label={`Carrito, ${count} producto${count !== 1 ? 's' : ''}`}>
            <span className="text-stone-600 w-5 h-5">{I.cart}</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white" aria-hidden="true">{count}</span>
          </button>
        )}
        <a href={wa()} target="_blank" rel="noopener noreferrer"
          className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.28)' }}
          aria-label="Contactar por WhatsApp">
          <span className="w-6 h-6">{I.wa}</span>
        </a>
      </div>

      <footer className="text-center py-12 px-4" role="contentinfo">
        <p className="text-[11px] text-stone-300 font-medium">
          <span translate="no">{store.store_name}</span> \u00b7 Creado con <span className="font-semibold text-stone-400" translate="no">Global Dorado</span>
        </p>
      </footer>
    </div>
  );
}

function PC({ p, accent, rgb, add, cart, n }: { p: Product; accent: string; rgb: string; add: (p: Product) => void; cart: CartItem[]; n: number }) {
  const inCart = cart.find(c => c.id === p.id);
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 a-fade-up focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none"
      style={{ animationDelay: `${n * 0.06}s`, '--tw-ring-color': accent + '50', '--tw-ring-offset-color': '#f9f8f5' } as React.CSSProperties}
      role="listitem">
      <div className="aspect-square bg-stone-50 overflow-hidden relative">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} width="400" height="400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-200" aria-hidden="true">
            <span className="w-10 h-10">{I.store}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-300">{p.category}</span>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-stone-500 shadow-sm border border-white/60">{p.category}</span>
        <button onClick={() => add(p)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
            inCart ? 'bg-emerald-500 text-white shadow-emerald-200/50' : 'bg-white/90 backdrop-blur-sm text-stone-500 hover:bg-emerald-500 hover:text-white'
          }`}
          style={{ '--tw-ring-color': '#10b981' } as React.CSSProperties}
          aria-label={inCart ? `${inCart.quantity} en carrito, tocar para agregar más` : `Agregar ${p.name}`}>
          {inCart ? <span className="text-xs font-bold">{inCart.quantity}</span> : <span className="w-4 h-4">{I.plus}</span>}
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-stone-800 leading-snug line-clamp-2 mb-1.5">{p.name}</h3>
        {p.description && <p className="text-[11px] text-stone-400 line-clamp-1 mb-2.5">{p.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold tracking-tight" style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>${p.price}</span>
          <button onClick={() => add(p)}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={`Agregar ${p.name}`}>
            <span className="w-4 h-4">{inCart ? <span className="text-xs font-bold">{inCart.quantity}</span> : I.plus}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function hexToRGB(h: string): string { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '0,0,0'; }
function adjustHex(h: string, a: number): string { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return r ? `#${[r[1],r[2],r[3]].map(x => Math.max(0,Math.min(255,parseInt(x,16)+a)).toString(16).padStart(2,'0')).join('')}` : h; }
