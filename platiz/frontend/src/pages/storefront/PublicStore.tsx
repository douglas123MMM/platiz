import { useState, useEffect, useCallback } from 'react';
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

const WAIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
  </svg>
);

const CartIcon = ({ count }: { count: number }) => (
  <div className="relative">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    {count > 0 && (
      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
        {count}
      </span>
    )}
  </div>
);

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
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]'); }
    catch { return []; }
  });
  const [checkoutForm, setCheckoutForm] = useState({ nombre: '', telefono: '', direccion: '', notas: '', metodo: 'domicilio' });

  useEffect(() => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

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
    const paths: Record<TabType, string> = {
      inicio: `/tienda/${slug}`,
      catalogo: `/tienda/${slug}/catalogo`,
      contacto: `/tienda/${slug}/contacto`,
      checkout: `/tienda/${slug}/checkout`
    };
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

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const sendOrder = () => {
    if (!store?.whatsapp) return;
    if (!checkoutForm.nombre || !checkoutForm.telefono) return;
    let msg = `*NUEVO PEDIDO - ${store.store_name}*\n\n`;
    msg += `*Cliente:* ${checkoutForm.nombre}\n*Telefono:* ${checkoutForm.telefono}\n`;
    if (checkoutForm.direccion) msg += `*Direccion:* ${checkoutForm.direccion}\n`;
    msg += `*Envio:* ${checkoutForm.metodo === 'domicilio' ? 'A domicilio' : 'Retiro en persona'}\n\n`;
    msg += `*PRODUCTOS:*\n`;
    cart.forEach(c => { msg += `• ${c.quantity}x ${c.name} - $${c.price * c.quantity}\n`; });
    msg += `\n*TOTAL: $${cartTotal}*\n`;
    if (checkoutForm.notas) msg += `\n*Notas:* ${checkoutForm.notas}`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
        <span className="text-stone-400 text-sm font-medium">Cargando...</span>
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

  const accent = store.accent_color;
  const accentRGB = hexToRGB(accent);
  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#fafaf8]" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* HERO */}
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accent}18, ${accent}05 50%, #fafaf8)` }}>
        {store.banner_url ? (
          <div className="w-full aspect-[2.2/1] max-h-[280px] overflow-hidden"><img src={store.banner_url} alt="" className="w-full h-full object-cover" /></div>
        ) : (
          <div className="pt-8 pb-4 px-6 text-center">
            {store.logo_url ? <img src={store.logo_url} alt={store.store_name} className="w-20 h-20 rounded-2xl object-cover shadow-xl mb-4 mx-auto ring-4 ring-white/80" />
              : <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-xl mb-4 ring-4 ring-white/80"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${adjustColor(accent, -30)})` }}>{store.store_name[0]}</div>}
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">{store.store_name}</h1>
            {store.description && <p className="text-stone-500 mt-1 text-sm">{store.description}</p>}
          </div>
        )}
      </header>

      {/* NAV */}
      {tab !== 'checkout' && (
        <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-stone-200/40" style={{ backgroundColor: 'rgba(250,250,248,0.88)' }}>
          <div className="max-w-3xl mx-auto flex items-center px-2">
            {[
              { id: 'inicio' as TabType, label: 'Inicio' },
              { id: 'catalogo' as TabType, label: 'Catalogo' },
              { id: 'contacto' as TabType, label: 'Contacto' },
            ].map(t => (
              <button key={t.id} onClick={() => navigate(t.id)}
                className="flex-1 py-3 text-sm font-medium transition relative" style={{ color: tab === t.id ? accent : '#a8a29e' }}>
                {t.label}
                {tab === t.id && <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition" style={{ backgroundColor: accent }} />}
              </button>
            ))}
            {cart.length > 0 && (
              <button onClick={() => navigate('checkout')} className="px-3 py-3 text-stone-500 hover:text-stone-700 transition"
                style={{ color: accent }}>
                <CartIcon count={cart.reduce((s, c) => s + c.quantity, 0)} />
              </button>
            )}
          </div>
        </nav>
      )}

      <main className="max-w-3xl mx-auto px-4 py-1 pb-32">

        {/* CHECKOUT */}
        {tab === 'checkout' && (
          <div className="space-y-5 pt-4">
            <button onClick={() => navigate('catalogo')} className="text-sm font-medium text-stone-400 hover:text-stone-600 transition flex items-center gap-1">
              ← Volver al catalogo
            </button>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm">
              <h2 className="text-xl font-extrabold text-stone-800 mb-1">Tu Pedido</h2>
              <p className="text-stone-400 text-sm mb-4">Revisa tus productos y completa tus datos</p>

              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3 opacity-30">🛒</div>
                  <p className="text-stone-400 font-medium">No hay productos en el carrito</p>
                  <button onClick={() => navigate('catalogo')} className="mt-3 text-sm font-semibold" style={{ color: accent }}>Ir al catalogo</button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                          {c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-lg">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-stone-800 truncate">{c.name}</div>
                          <div className="text-xs text-stone-400">${c.price} c/u</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(c.id, c.quantity - 1)} className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-300">−</button>
                          <span className="w-7 text-center text-sm font-bold text-stone-700">{c.quantity}</span>
                          <button onClick={() => updateQty(c.id, c.quantity + 1)} className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-300">+</button>
                        </div>
                        <button onClick={() => removeFromCart(c.id)} className="text-stone-300 hover:text-red-400 transition p-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-4 mb-6">
                    <div className="flex justify-between text-lg font-extrabold text-stone-800">
                      <span>Total</span>
                      <span style={{ color: accent }}>${cartTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-700">Datos de contacto</h3>
                    <input placeholder="Nombre completo *" value={checkoutForm.nombre} onChange={e => setCheckoutForm({...checkoutForm, nombre: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 transition" />
                    <input placeholder="Telefono *" value={checkoutForm.telefono} onChange={e => setCheckoutForm({...checkoutForm, telefono: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 transition" />
                    <input placeholder="Direccion" value={checkoutForm.direccion} onChange={e => setCheckoutForm({...checkoutForm, direccion: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 transition" />
                    
                    <div className="flex gap-3">
                      {[
                        { value: 'domicilio', label: 'Envio a domicilio', icon: '🚚' },
                        { value: 'retiro', label: 'Retiro en persona', icon: '🏪' },
                      ].map(m => (
                        <button key={m.value} onClick={() => setCheckoutForm({...checkoutForm, metodo: m.value})}
                          className={`flex-1 p-3 rounded-xl border text-sm font-medium transition ${
                            checkoutForm.metodo === m.value ? 'text-stone-800 shadow-sm' : 'text-stone-400 border-stone-200 bg-stone-50'
                          }`}
                          style={checkoutForm.metodo === m.value ? { borderColor: accent, backgroundColor: accent + '10' } : {}}>
                          <div className="text-lg mb-0.5">{m.icon}</div> {m.label}
                        </button>
                      ))}
                    </div>

                    <textarea placeholder="Notas adicionales (opcional)" value={checkoutForm.notas} onChange={e => setCheckoutForm({...checkoutForm, notas: e.target.value})} rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 transition resize-none" />

                    <button onClick={sendOrder} disabled={!checkoutForm.nombre || !checkoutForm.telefono || cart.length === 0}
                      className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                      <WAIcon className="w-5 h-5" /> Enviar pedido por WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* INICIO */}
        {tab === 'inicio' && (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Catalogo', sub: `${products.length} productos`, icon: '🛍️', action: () => navigate('catalogo'), bg: accent+'10', border: accent+'20' },
                { label: 'WhatsApp', sub: 'Contacto directo', icon: '💬', action: () => window.open(`https://wa.me/${store.whatsapp}`, '_blank'), bg: '#ecfdf5', border: '#a7f3d0' },
                { label: 'Contacto', sub: 'Info', icon: '📍', action: () => navigate('contacto'), bg: accent+'06', border: accent+'12' },
              ].map(card => (
                <button key={card.label} onClick={card.action}
                  className="p-5 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: card.bg, border: `1px solid ${card.border}` }}>
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="text-sm font-semibold text-stone-800">{card.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{card.sub}</div>
                </button>
              ))}
            </div>

            <div className="bg-white/70 rounded-3xl p-6 border border-stone-200/40 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-stone-800">Productos destacados</h3>
                <button onClick={() => navigate('catalogo')} className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{ color: accent }}>
                  Ver todo →
                </button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-12 text-stone-300 text-sm">Sin productos</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((p, i) => (
                    <ProductCard key={p.id} product={p} accent={accent} accentRGB={accentRGB} addToCart={addToCart} cart={cart} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATALOGO */}
        {tab === 'catalogo' && (
          <div className="space-y-5 pt-4">
            <div className="bg-white/70 rounded-3xl p-6 border border-stone-200/40 shadow-sm">
              <h2 className="text-2xl font-extrabold text-stone-800 mb-1">Catalogo</h2>
              <p className="text-stone-400 text-sm">Productos disponibles, pedi por WhatsApp</p>
            </div>

            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-50 transition-all" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={{ backgroundColor: selectedCat === cat ? accent : '#fff', color: selectedCat === cat ? '#fff' : '#78716c',
                    boxShadow: selectedCat === cat ? `0 4px 14px rgba(${accentRGB},0.35)` : '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20"><div className="text-6xl mb-4 opacity-30">📦</div><p className="text-stone-400">{search ? 'Nada encontrado' : 'Sin productos'}</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} accent={accent} accentRGB={accentRGB} addToCart={addToCart} cart={cart} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACTO */}
        {tab === 'contacto' && (
          <div className="space-y-5 pt-4">
            <div className="bg-white/70 rounded-3xl p-8 border border-stone-200/40 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 shadow-sm"><WAIcon className="w-8 h-8 text-emerald-500" /></div>
              <h2 className="text-xl font-extrabold text-stone-800 mb-1">Contacto</h2>
              <p className="text-stone-400 text-sm">Escribinos y te respondemos rapido</p>
            </div>
            <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200"><WAIcon className="w-6 h-6" /></div>
              <div className="flex-1"><div className="text-sm font-semibold text-stone-800">WhatsApp</div><div className="text-xs text-stone-500">{store.whatsapp || 'Sin numero'}</div></div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-stone-300"><path d="M9 18l6-6-6-6"/></svg>
            </a>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-2xl p-5 border border-stone-200/40 shadow-sm text-center">
                <div className="text-2xl mb-2">🕐</div><div className="text-xs font-semibold text-stone-700">Lunes a Viernes</div><div className="text-[11px] text-stone-400 mt-0.5">9:00 AM - 6:00 PM</div>
              </div>
              <div className="bg-white/70 rounded-2xl p-5 border border-stone-200/40 shadow-sm text-center">
                <div className="text-2xl mb-2">🚀</div><div className="text-xs font-semibold text-stone-700">Respuesta rapida</div><div className="text-[11px] text-stone-400 mt-0.5">En menos de 1 hora</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FLOATING CART + WA */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {cart.length > 0 && (
          <button onClick={() => navigate('checkout')}
            className="w-14 h-14 rounded-2xl bg-white text-stone-700 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border border-stone-200"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <CartIcon count={cart.reduce((s, c) => s + c.quantity, 0)} />
          </button>
        )}
        <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
          style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.35)' }}>
          <WAIcon className="w-7 h-7" />
        </a>
      </div>

      <footer className="text-center py-10 px-4">
        <p className="text-[11px] text-stone-300 font-medium">{store.store_name} · Creado con <span className="font-bold text-stone-400">Global Dorado</span></p>
      </footer>

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}@keyframes cardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function ProductCard({ product, accent, accentRGB, addToCart, cart, index }: {
  product: Product; accent: string; accentRGB: string;
  addToCart: (p: Product) => void; cart: CartItem[]; index: number;
}) {
  const inCart = cart.find(c => c.id === product.id);
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      style={{ animation: `cardIn 0.4s ease-out ${index * 0.06}s both` }}>
      <div className="aspect-square bg-stone-50 overflow-hidden relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><div className="text-5xl opacity-15">📦</div></div>
        )}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-stone-500 shadow-sm">{product.category}</span>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-stone-800 leading-snug line-clamp-2 mb-1.5">{product.name}</h3>
        {product.description && <p className="text-[11px] text-stone-400 line-clamp-1 mb-2.5">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold tracking-tight" style={{ color: accent }}>${product.price}</span>
          <button onClick={() => addToCart(product)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              inCart ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white group-hover:shadow-emerald-200'
            }`}>
            {inCart ? <span className="text-xs font-bold">{inCart.quantity}</span> : <span className="text-lg font-bold leading-none">+</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToRGB(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '0,0,0';
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
}
function adjustColor(hex: string, a: number): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return hex;
  return `#${[r[1],r[2],r[3]].map(h => Math.max(0, Math.min(255, parseInt(h,16)+a)).toString(16).padStart(2,'0')).join('')}`;
}
