import { useState, useEffect, useCallback, useRef } from 'react';
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

const ICONS = {
  whatsapp: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>,
  cart: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  search: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  chevron: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><path d="M9 18l6-6-6-6"/></svg>,
  close: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  trash: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  menu: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  plus: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>,
};

const ANIM_STYLE = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-12px) } to { opacity: 1; transform: translateX(0) } }
  .a-fade-up { animation: fadeUp 0.5s ease-out both }
  .a-fade-in { animation: fadeIn 0.4s ease-out both }
  .a-scale-in { animation: scaleIn 0.3s ease-out both }
}
@media (prefers-reduced-motion: reduce) {
  .a-fade-up, .a-fade-in, .a-scale-in { animation: none; opacity: 1 }
}
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
`;

type TabType = 'inicio' | 'catalogo' | 'contacto' | 'checkout';

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => { localStorage.setItem(`cart_${slug}`, JSON.stringify(cart)); }, [cart, slug]);

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/catalogo')) setTab('catalogo');
    else if (p.includes('/contacto')) setTab('contacto');
    else if (p.includes('/checkout')) setTab('checkout');
    else setTab('inicio');
    mainRef.current?.focus();
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

  const navigate = (t: TabType) => {
    setTab(t);
    const paths: Record<TabType, string> = { inicio: `/tienda/${slug}`, catalogo: `/tienda/${slug}/catalogo`, contacto: `/tienda/${slug}/contacto`, checkout: `/tienda/${slug}/checkout` };
    window.history.pushState({}, '', paths[t]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c));
  };
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const sendOrder = () => {
    if (!store?.whatsapp || submitted) return;
    if (!checkoutForm.nombre || !checkoutForm.telefono) return;
    setSubmitted(true);
    let msg = `*${store.store_name}*\n\n*Cliente:* ${checkoutForm.nombre}\n*Teléfono:* ${checkoutForm.telefono}\n`;
    if (checkoutForm.direccion) msg += `*Dirección:* ${checkoutForm.direccion}\n`;
    msg += `*Envío:* ${checkoutForm.metodo === 'domicilio' ? 'A domicilio' : 'Retiro en persona'}\n\n*PEDIDO:*\n`;
    cart.forEach(c => msg += `\u2022 ${c.quantity}\u00d7 ${c.name} \u2014 $${c.price * c.quantity}\n`);
    msg += `\n*TOTAL: $${cartTotal}*\n`;
    if (checkoutForm.notas) msg += `\n${checkoutForm.notas}`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setCheckoutForm({ nombre: '', telefono: '', direccion: '', notas: '', metodo: 'domicilio' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const waLink = (text?: string) => store?.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text || 'Hola\u00a1 Quiero info')}`
    : '#';

  if (loading) return (
    <main className="min-h-screen bg-[#fafaf7] flex items-center justify-center" role="status" aria-label="Cargando tienda">
      <div className="flex flex-col items-center gap-4 a-fade-in">
        <div className="w-10 h-10 rounded-full border-[3px] border-stone-200 border-t-stone-400 animate-spin" />
        <span className="text-stone-400 text-sm font-medium">Cargando\u2026</span>
      </div>
    </main>
  );

  if (notFound || !store) return (
    <main className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-6 text-center a-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-4xl mb-6 shadow-sm" aria-hidden="true">\uD83D\uDD0D</div>
      <h1 className="text-xl font-bold text-stone-800 mb-2">Tienda no encontrada</h1>
      <p className="text-stone-400 text-sm max-w-xs">Este enlace no existe o la tienda está pausada.</p>
    </main>
  );

  const accent = store.accent_color;
  const accentRGB = hexToRGB(accent);
  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf7', fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontVariantNumeric: 'lining-nums' }}>
      <style>{ANIM_STYLE}</style>

      {/* ---- HERO ---- */}
      <header className="relative overflow-hidden">
        {store.banner_url ? (
          <div className="w-full aspect-[3/1] max-h-72 overflow-hidden">
            <img src={store.banner_url} alt="" width="1200" height="400" className="w-full h-full object-cover a-fade-in" loading="eager" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-extrabold tracking-tight text-shadow">{store.store_name}</h1>
              {store.description && <p className="text-white/80 text-sm mt-1 max-w-md">{store.description}</p>}
            </div>
          </div>
        ) : (
          <div className="pt-10 pb-6 px-6 text-center" style={{ background: `linear-gradient(165deg, ${accent}12 0%, ${accent}04 60%, #fafaf7 100%)` }}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={`Logo de ${store.store_name}`} width="80" height="80" className="w-20 h-20 rounded-2xl object-cover shadow-lg mx-auto mb-4 a-fade-up" />
            ) : (
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-4 a-fade-up"
                style={{ background: `linear-gradient(135deg, ${accent}, ${adjustHex(accent, -30)})` }} aria-hidden="true">
                {store.store_name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight a-fade-up">{store.store_name}</h1>
            {store.description && <p className="text-stone-500 mt-1.5 text-sm max-w-md mx-auto a-fade-up" style={{ animationDelay: '0.1s' }}>{store.description}</p>}
            <a href={waLink()} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 a-fade-up"
              style={{ animationDelay: '0.2s' }}
              aria-label="Contactar por WhatsApp">
              {ICONS.whatsapp} WhatsApp
            </a>
          </div>
        )}
      </header>

      {/* ---- NAV ---- */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-stone-200/40" style={{ backgroundColor: 'rgba(250,250,247,0.9)' }} aria-label="Navegación principal">
        <div className="max-w-3xl mx-auto flex items-center px-2">
          {[
            { id: 'inicio' as TabType, label: 'Inicio' },
            { id: 'catalogo' as TabType, label: 'Catálogo' },
            { id: 'contacto' as TabType, label: 'Contacto' },
          ].map(t => (
            <button key={t.id} onClick={() => navigate(t.id)}
              className={`flex-1 py-3.5 text-sm font-semibold transition relative focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg focus-visible:outline-none`}
              style={{ color: tab === t.id ? accent : '#a8a29e', '--tw-ring-color': accent } as React.CSSProperties}
              aria-current={tab === t.id ? 'page' : undefined}>
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition" style={{ backgroundColor: accent }} aria-hidden="true" />}
            </button>
          ))}
          <button onClick={() => setShowSearch(!showSearch)} className="px-3 py-3 text-stone-400 hover:text-stone-600 transition focus-visible:ring-2 rounded-lg focus-visible:outline-none" style={{ '--tw-ring-color': accent } as React.CSSProperties} aria-label={showSearch ? 'Cerrar búsqueda' : 'Buscar productos'}>
            {showSearch ? ICONS.close : ICONS.search}
          </button>
          <button onClick={() => navigate('checkout')} className="px-2 py-3 text-stone-500 hover:text-stone-700 transition relative focus-visible:ring-2 rounded-lg focus-visible:outline-none" style={{ '--tw-ring-color': accent } as React.CSSProperties} aria-label={`Carrito, ${cartCount} productos`}>
            {ICONS.cart}
            {cartCount > 0 && <span className="absolute top-2 right-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md" aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
        {showSearch && (
          <div className="max-w-3xl mx-auto px-4 pb-3 a-scale-in">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" aria-hidden="true">{ICONS.search}</span>
              <input autoFocus type="search" placeholder="Buscar producto\u2026" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setShowSearch(false)}
                className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties}
                aria-label="Buscar productos"
                autoComplete="off" spellCheck={false} />
              {search && <button onClick={() => { setSearch(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500" aria-label="Limpiar búsqueda">{ICONS.close}</button>}
            </div>
          </div>
        )}
      </nav>

      {/* ---- MAIN CONTENT ---- */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32" ref={mainRef} tabIndex={-1} aria-label={`Sección ${tab}`}>

        {/* ===== INICIO ===== */}
        {tab === 'inicio' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Ver Catálogo', sub: `${products.length} producto${products.length !== 1 ? 's' : ''}`, icon: '\uD83D\uDECD\uFE0F', act: () => navigate('catalogo') },
                { label: 'WhatsApp', sub: 'Contacto directo', icon: '\uD83D\uDCAC', act: () => window.open(waLink(), '_blank') },
                { label: 'Contacto', sub: 'Info y ubicación', icon: '\uD83D\uDCCD', act: () => navigate('contacto') },
              ].map((card, i) => (
                <button key={card.label} onClick={card.act}
                  className="p-5 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none a-fade-up"
                  style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', animationDelay: `${i * 0.08}s`, '--tw-ring-color': accent } as React.CSSProperties}>
                  <div className="text-2xl mb-2" aria-hidden="true">{card.icon}</div>
                  <div className="text-sm font-semibold text-stone-800">{card.label}</div>
                  <div className="text-xs text-stone-400 mt-1">{card.sub}</div>
                </button>
              ))}
            </div>

            <section aria-labelledby="featured-heading">
              <div className="flex items-end justify-between mb-5">
                <h2 id="featured-heading" className="text-lg font-bold text-stone-800">Destacados</h2>
                <button onClick={() => navigate('catalogo')} className="text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 rounded focus-visible:outline-none transition flex items-center gap-1"
                  style={{ color: accent, '--tw-ring-color': accent } as React.CSSProperties}>
                  Ver todo {ICONS.chevron}
                </button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-16 text-stone-300 a-fade-in" role="status">
                  <div className="text-5xl mb-3" aria-hidden="true">\uD83D\uDCE6</div>
                  <p className="text-sm font-medium">Sin productos todavía</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((p, i) => <ProductCard key={p.id} product={p} accent={accent} accentRGB={accentRGB} addToCart={addToCart} cart={cart} delay={i} />)}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ===== CATALOGO ===== */}
        {tab === 'catalogo' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm a-fade-up" aria-labelledby="catalog-heading">
              <h1 id="catalog-heading" className="text-2xl font-extrabold text-stone-800 mb-1">Catálogo</h1>
              <p className="text-stone-400 text-sm">Explorá nuestros productos y pedí por WhatsApp</p>
            </section>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" aria-hidden="true">{ICONS.search}</span>
              <input type="search" placeholder="Buscar producto\u2026" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties}
                aria-label="Buscar productos"
                autoComplete="off" spellCheck={false} />
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="Filtrar por categoría">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                  style={{
                    backgroundColor: selectedCat === cat ? accent : '#fff', color: selectedCat === cat ? '#fff' : '#78716c',
                    boxShadow: selectedCat === cat ? `0 4px 14px rgba(${accentRGB},0.3)` : '0 1px 3px rgba(0,0,0,0.04)',
                    '--tw-ring-color': accent
                  } as React.CSSProperties}
                  aria-pressed={selectedCat === cat}>
                  {cat}
                </button>
              ))}
            </nav>

            {filtered.length === 0 ? (
              <div className="text-center py-20 a-fade-in" role="status">
                <div className="text-6xl mb-4 opacity-25" aria-hidden="true">\uD83D\uDCE6</div>
                <p className="text-stone-400 font-medium">{search ? 'Sin resultados' : 'Catálogo vacío'}</p>
                {search && <button onClick={() => setSearch('')} className="mt-3 text-sm font-semibold hover:underline" style={{ color: accent }}>Limpiar búsqueda</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4" role="list" aria-label="Lista de productos">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} accent={accent} accentRGB={accentRGB} addToCart={addToCart} cart={cart} delay={i} />)}
              </div>
            )}
          </div>
        )}

        {/* ===== CONTACTO ===== */}
        {tab === 'contacto' && (
          <div className="space-y-6 a-fade-up">
            <section className="bg-white rounded-2xl p-8 border border-stone-200/50 shadow-sm text-center" aria-labelledby="contact-heading">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5 shadow-sm" aria-hidden="true">{ICONS.whatsapp}</div>
              <h1 id="contact-heading" className="text-xl font-extrabold text-stone-800 mb-1">Contacto</h1>
              <p className="text-stone-400 text-sm max-w-xs mx-auto">Escribinos por WhatsApp y te respondemos rápido</p>
            </section>

            <a href={waLink()} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-200" aria-hidden="true">{ICONS.whatsapp}</div>
              <div className="flex-1"><div className="text-sm font-semibold text-stone-800">WhatsApp</div><div className="text-xs text-stone-500">{store.whatsapp || 'Número no configurado'}</div></div>
              <span aria-hidden="true">{ICONS.chevron}</span>
            </a>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Lunes a Viernes', desc: '9:00 AM \u2013 6:00 PM', icon: '\uD83D\uDD50' },
                { title: 'Respuesta', desc: 'En menos de 1 hora', icon: '\uD83D\uDE80' },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm text-center a-fade-up">
                  <div className="text-2xl mb-2" aria-hidden="true">{c.icon}</div>
                  <div className="text-xs font-semibold text-stone-700">{c.title}</div>
                  <div className="text-[11px] text-stone-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CHECKOUT ===== */}
        {tab === 'checkout' && (
          <div className="space-y-5 a-fade-up">
            <button onClick={() => navigate('catalogo')}
              className="text-sm font-medium text-stone-400 hover:text-stone-600 transition flex items-center gap-1 focus-visible:ring-2 rounded-lg focus-visible:outline-none"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}>
              ← Volver al catálogo
            </button>

            <section className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm" aria-labelledby="checkout-heading">
              <h1 id="checkout-heading" className="text-xl font-extrabold text-stone-800 mb-1">Tu pedido</h1>
              <p className="text-stone-400 text-sm mb-5">Revisá tus productos y completá tus datos</p>

              {cart.length === 0 ? (
                <div className="text-center py-12" role="status">
                  <div className="text-5xl mb-3 opacity-25" aria-hidden="true">\uD83D\uDED2</div>
                  <p className="text-stone-400 font-medium">No hay productos en el carrito</p>
                  <button onClick={() => navigate('catalogo')} className="mt-3 text-sm font-semibold hover:underline" style={{ color: accent }}>Ir al catálogo</button>
                </div>
              ) : (
                <>
                  <ul className="space-y-3 mb-6" aria-label="Productos en el carrito">
                    {cart.map(c => (
                      <li key={c.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                          {c.image_url ? <img src={c.image_url} alt="" width="48" height="48" className="w-full h-full object-cover" loading="lazy" /> : <div className="flex items-center justify-center h-full text-lg" aria-hidden="true">\uD83D\uDCE6</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-stone-800 truncate">{c.name}</div>
                          <div className="text-xs text-stone-400">${c.price} c/u</div>
                        </div>
                        <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${c.name}`}>
                          <button onClick={() => updateQty(c.id, c.quantity - 1)} className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-300 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none transition" aria-label="Reducir cantidad">{'\u2212'}</button>
                          <span className="w-7 text-center text-sm font-bold text-stone-700" aria-label={`${c.quantity} unidades`}>{c.quantity}</span>
                          <button onClick={() => updateQty(c.id, c.quantity + 1)} className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-300 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none transition" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button onClick={() => removeFromCart(c.id)} className="text-stone-300 hover:text-red-400 transition p-1 focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg focus-visible:outline-none" aria-label={`Eliminar ${c.name} del carrito`}>{ICONS.trash}</button>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-stone-100 pt-4 mb-6 flex justify-between text-lg font-extrabold text-stone-800">
                    <span>Total</span>
                    <span style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>${cartTotal}</span>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); sendOrder(); }} className="space-y-3">
                    <h2 className="text-sm font-bold text-stone-700">Tus datos</h2>
                    <div>
                      <label htmlFor="checkout-name" className="sr-only">Nombre completo</label>
                      <input id="checkout-name" name="nombre" type="text" required placeholder="Nombre completo\u2026" value={checkoutForm.nombre}
                        onChange={e => setCheckoutForm({...checkoutForm, nombre: e.target.value})} autoComplete="name"
                        className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition" style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties} />
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className="sr-only">Teléfono</label>
                      <input id="checkout-phone" name="telefono" type="tel" required placeholder="Teléfono\u2026" value={checkoutForm.telefono}
                        onChange={e => setCheckoutForm({...checkoutForm, telefono: e.target.value})} autoComplete="tel"
                        className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition" style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties} />
                    </div>
                    <div>
                      <label htmlFor="checkout-address" className="sr-only">Dirección</label>
                      <input id="checkout-address" name="direccion" type="text" placeholder="Dirección\u2026" value={checkoutForm.direccion}
                        onChange={e => setCheckoutForm({...checkoutForm, direccion: e.target.value})} autoComplete="street-address"
                        className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition" style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties} />
                    </div>

                    <fieldset className="flex gap-3">
                      <legend className="sr-only">Método de envío</legend>
                      {[
                        { value: 'domicilio', label: 'A domicilio', icon: '\uD83D\uDE9A' },
                        { value: 'retiro', label: 'Retiro en persona', icon: '\uD83C\uDFEA' },
                      ].map(m => (
                        <button key={m.value} type="button" onClick={() => setCheckoutForm({...checkoutForm, metodo: m.value})}
                          className={`flex-1 p-3 rounded-xl border text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none ${
                            checkoutForm.metodo === m.value ? 'shadow-sm' : 'text-stone-400 border-stone-200 bg-stone-50'
                          }`}
                          style={checkoutForm.metodo === m.value ? { borderColor: accent, backgroundColor: accent + '08', '--tw-ring-color': accent } as React.CSSProperties : {}}>
                          <div className="text-lg mb-0.5" aria-hidden="true">{m.icon}</div> {m.label}
                        </button>
                      ))}
                    </fieldset>

                    <div>
                      <label htmlFor="checkout-notes" className="sr-only">Notas adicionales</label>
                      <textarea id="checkout-notes" name="notas" placeholder="Notas adicionales\u2026" rows={2} value={checkoutForm.notas}
                        onChange={e => setCheckoutForm({...checkoutForm, notas: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition resize-none"
                        style={{ '--tw-ring-color': accent + '40' } as React.CSSProperties} />
                    </div>

                    <button type="submit" disabled={!checkoutForm.nombre || !checkoutForm.telefono || cart.length === 0 || submitted}
                      className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                      aria-label={submitted ? 'Pedido enviado' : 'Enviar pedido por WhatsApp'}>
                      {ICONS.whatsapp} {submitted ? '\u00a1Enviado\u00a1' : 'Enviar pedido por WhatsApp'}
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ---- FLOATING BUTTONS ---- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50" role="complementary" aria-label="Acciones rápidas">
        {cartCount > 0 && (
          <button onClick={() => navigate('checkout')}
            className="w-14 h-14 rounded-2xl bg-white text-stone-700 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border border-stone-200 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:outline-none relative"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
            aria-label={`Ver carrito, ${cartCount} productos`}>
            {ICONS.cart}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" aria-hidden="true">{cartCount}</span>
          </button>
        )}
        <a href={waLink()} target="_blank" rel="noopener noreferrer"
          className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}
          aria-label="Contactar por WhatsApp">
          {ICONS.whatsapp}
        </a>
      </div>

      {/* ---- FOOTER ---- */}
      <footer className="text-center py-10 px-4" role="contentinfo">
        <p className="text-[11px] text-stone-300 font-medium">
          <span translate="no">{store.store_name}</span> · Creado con <span className="font-bold text-stone-400" translate="no">Global&nbsp;Dorado</span>
        </p>
      </footer>
    </div>
  );
}

/* ---- Product Card Component ---- */
function ProductCard({ product, accent, accentRGB, addToCart, cart, delay }: {
  product: Product; accent: string; accentRGB: string;
  addToCart: (p: Product) => void; cart: CartItem[]; delay: number;
}) {
  const inCart = cart.find(c => c.id === product.id);
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 a-fade-up focus-within:ring-2 focus-within:ring-offset-2"
      style={{ animationDelay: `${delay * 0.06}s`, '--tw-ring-color': accent } as React.CSSProperties}
      role="listitem">
      <div className="aspect-square bg-stone-50 overflow-hidden relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} width="400" height="400"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-hidden="true"><span className="text-5xl opacity-15">📦</span></div>
        )}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-stone-500 shadow-sm border border-white/50">
          {product.category}
        </span>
        <button
          onClick={() => addToCart(product)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
            inCart ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white/90 backdrop-blur-sm text-emerald-500 hover:bg-emerald-500 hover:text-white'
          }`}
          style={{ '--tw-ring-color': '#10b981' } as React.CSSProperties}
          aria-label={inCart ? `${inCart.quantity} en carrito` : `Agregar ${product.name} al carrito`}>
          {inCart ? <span className="text-xs font-bold">{inCart.quantity}</span> : ICONS.plus}
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-stone-800 leading-snug line-clamp-2 mb-1.5">{product.name}</h3>
        {product.description && <p className="text-[11px] text-stone-400 line-clamp-1 mb-2.5">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold tracking-tight" style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>${product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={`Agregar ${product.name} al carrito`}>
            <span className="text-lg font-bold" aria-hidden="true">{inCart ? inCart.quantity : '+'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function hexToRGB(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '0,0,0';
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
}
function adjustHex(hex: string, amount: number): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return hex;
  return `#${[r[1],r[2],r[3]].map(h => Math.max(0, Math.min(255, parseInt(h,16)+amount)).toString(16).padStart(2,'0')).join('')}`;
}
