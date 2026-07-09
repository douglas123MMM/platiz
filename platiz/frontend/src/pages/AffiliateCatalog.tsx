import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Item {
  id: string;
  category_slug: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  video_url: string;
  sort_order: number;
  price?: number;
  price_label?: string;
  delivery_type?: string;
  account_type?: string;
  duration_days?: number;
}

interface Affiliate {
  display_name: string;
  avatar: string | null;
  whatsapp: string;
  telegram_link: string;
  payment_methods: any;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  catalog_theme?: string;
}

const categoryNames: Record<string, string> = {
  movies: 'Streaming', streaming: 'Streaming', services: 'Servicios',
  ia: 'IA', 'monedas-de-juegos': 'Juegos', antivirus: 'Antivirus',
  oficina: 'Oficina', creatividad: 'Creatividad', 'diseno-grafico': 'Diseno',
  herramientas: 'Herramientas', 'edicion-de-videos': 'Edicion', licencia: 'Licencias',
};

function SocialIcon({ platform, val }: { platform: string; val: string }) {
  const getUrl = () => {
    if (val.startsWith('http')) return val;
    const u = val.replace('@', '');
    const bases: Record<string, string> = { instagram: 'instagram.com', tiktok: 'tiktok.com/@', facebook: 'facebook.com', youtube: 'youtube.com/' };
    return 'https://' + (bases[platform] || '') + u;
  };
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-[#833AB4] to-[#E1306C]',
    tiktok: 'bg-black border border-white/20',
    facebook: 'bg-[#1877F2]',
    youtube: 'bg-[#FF0000]',
  };
  return (
    <a href={getUrl()} target="_blank" rel="noopener noreferrer"
      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${colors[platform] || 'bg-white/10'}`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d={platform === 'instagram' ? "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" : "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"} /></svg>
    </a>
  );
}

export default function AffiliateCatalog() {
  const { code } = useParams<{ code: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = code ? `?ref=${code}` : '';
    api.get(`/affiliate/catalog${params}`).then(({ data }) => setItems(data)).catch(() => {});
    if (code) {
      api.get(`/affiliate/landing/${code}/landing`).then(({ data }: any) => {
        if (data.affiliate) setAffiliate(data.affiliate);
      }).catch(() => { setAffiliate(null); });
    }
  }, [code]);

  const categories = [...new Set(items.map(i => i.category_slug))];
  const filtered = items.filter(item => {
    const catMatch = activeCategory === 'all' || item.category_slug === activeCategory;
    const searchMatch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] animate-fade-in">
      {/* Header */}
      <div className="relative text-center pt-8 pb-6 px-4 bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f] border-b border-[#E5C158]/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.04),transparent_60%)]" />
        <div className="relative z-10">
          {affiliate && (
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5C158]/20 to-[#C4A44A]/10 flex items-center justify-center ring-2 ring-[#E5C158]/20 ring-offset-2 ring-offset-[#0a0a0f] overflow-hidden">
                {affiliate.avatar ? (
                  <img src={affiliate.avatar} alt="" className="w-14 h-14 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.parentElement!.querySelector('.af') as HTMLElement).style.display = 'flex'; }} />
                ) : null}
                <span className={`af text-xl ${affiliate.avatar ? 'hidden' : ''}`} style={{ display: affiliate.avatar ? 'none' : 'flex' }}>👤</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{affiliate.display_name || 'Global Dorado'}</p>
                <p className="text-[#E5C158]/80 text-xs">Catalogo de Servicios</p>
              </div>
            </div>
          )}

          {/* Contact buttons */}
          <div className="flex justify-center gap-2 mb-3">
            {affiliate?.whatsapp && (
              <a href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs rounded-xl font-bold hover:bg-[#1ebc5a] transition-colors shadow-lg shadow-[#25D366]/20">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            {affiliate?.telegram_link && (
              <a href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0088cc] text-white text-xs rounded-xl font-bold hover:bg-[#0077b3] transition-colors shadow-lg shadow-[#0088cc]/20">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>
                Telegram
              </a>
            )}
          </div>

          {/* Socials */}
          {(affiliate?.instagram || affiliate?.tiktok || affiliate?.facebook || affiliate?.youtube) && (
            <div className="flex justify-center gap-2 mb-3">
              {affiliate.instagram && <SocialIcon platform="instagram" val={affiliate.instagram} />}
              {affiliate.tiktok && <SocialIcon platform="tiktok" val={affiliate.tiktok} />}
              {affiliate.facebook && <SocialIcon platform="facebook" val={affiliate.facebook} />}
              {affiliate.youtube && <SocialIcon platform="youtube" val={affiliate.youtube} />}
            </div>
          )}

          {/* Payment methods */}
          {affiliate?.payment_methods && (affiliate.payment_methods.binance_id || affiliate.payment_methods.pago_movil_phone || affiliate.payment_methods.zelle || affiliate.payment_methods.otro) && (
            <button onClick={() => setShowPayment(true)}
              className="px-4 py-2 bg-[#E5C158] text-black text-xs rounded-xl font-bold hover:bg-[#F0D78C] transition-colors shadow-lg shadow-[#E5C158]/20">
              Ver Metodos de Pago
            </button>
          )}

          <h1 className="text-xl font-bold text-[#E5C158] mt-3">Catalogo Digital</h1>
          <p className="text-gray-300 text-xs">{filtered.length} de {items.length} productos</p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && affiliate?.payment_methods && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPayment(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border-[#E5C158]/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Metodos de Pago</h3>
              <button onClick={() => setShowPayment(false)} className="text-gray-300 text-lg">&times;</button>
            </div>
            <div className="space-y-3 mb-4">
              {affiliate.payment_methods.binance_id && <PaymentMethod label="Binance" value={`ID: ${affiliate.payment_methods.binance_id}${affiliate.payment_methods.binance_email ? ' - ' + affiliate.payment_methods.binance_email : ''}`} onCopy={() => { navigator.clipboard.writeText(`ID: ${affiliate.payment_methods.binance_id}${affiliate.payment_methods.binance_email ? ' - ' + affiliate.payment_methods.binance_email : ''}`); setCopied('binance'); setTimeout(() => setCopied(''), 2000); }} copied={copied === 'binance'} />}
              {affiliate.payment_methods.pago_movil_phone && <PaymentMethod label="Pago Movil" value={`${affiliate.payment_methods.pago_movil_bank || ''} / ${affiliate.payment_methods.pago_movil_phone} / ${affiliate.payment_methods.pago_movil_id || ''}`} onCopy={() => { navigator.clipboard.writeText(`${affiliate.payment_methods.pago_movil_bank || ''} ${affiliate.payment_methods.pago_movil_phone} ${affiliate.payment_methods.pago_movil_id || ''}`); setCopied('pm'); setTimeout(() => setCopied(''), 2000); }} copied={copied === 'pm'} />}
              {affiliate.payment_methods.zelle && <PaymentMethod label="Zelle" value={affiliate.payment_methods.zelle} onCopy={() => { navigator.clipboard.writeText(affiliate.payment_methods.zelle); setCopied('zelle'); setTimeout(() => setCopied(''), 2000); }} copied={copied === 'zelle'} />}
              {affiliate.payment_methods.otro && <PaymentMethod label="Otro" value={affiliate.payment_methods.otro} onCopy={() => { navigator.clipboard.writeText(affiliate.payment_methods.otro); setCopied('otro'); setTimeout(() => setCopied(''), 2000); }} copied={copied === 'otro'} />}
            </div>
            <button onClick={() => setShowPayment(false)} className="w-full py-2.5 bg-[#E5C158] text-black rounded-xl font-bold text-sm">Cerrar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-5xl mx-auto px-4 mt-5 mb-3">
        <div className="flex items-center gap-3 px-4 py-2.5 glass rounded-xl border-[#E5C158]/10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300 flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 w-full"
            placeholder="Buscar servicio..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-[#E5C158] text-black shadow-[0_2px_12px_rgba(255,215,0,0.25)]' : 'glass text-gray-300 hover:text-white hover:border-[#E5C158]/20'}`}>Todos</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${activeCategory === cat ? 'bg-[#E5C158] text-black shadow-[0_2px_12px_rgba(255,215,0,0.25)]' : 'glass text-gray-300 hover:text-white hover:border-[#E5C158]/20'}`}>
            {categoryNames[cat] || cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="group glass rounded-2xl overflow-hidden hover:border-[#E5C158]/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.2)] flex flex-col">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_70%)]" />
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.parentElement!.querySelector('.fb') as HTMLElement).classList.remove('hidden'); }} />
              ) : null}
              <span className={`fb absolute inset-0 flex items-center justify-center text-4xl font-black text-[#E5C158]/15 ${item.image_url ? 'hidden' : ''}`}>
                {item.title.charAt(0)}
              </span>
            </div>
            <div className="p-3 flex flex-col flex-1">
              {item.price_label && (
                <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-medium mb-1.5 ${
                  item.price_label.toLowerCase().includes('perfil') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : item.price_label.toLowerCase().includes('cuenta') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/20'
                }`}>{item.price_label}</span>
              )}
              <h3 className="text-xs font-semibold text-white group-hover:text-[#E5C158] transition-colors line-clamp-2 leading-snug mb-2">{item.title}</h3>
              {item.description && <p className="text-[10px] text-gray-300 line-clamp-2 mb-2 flex-1">{item.description}</p>}
              {!item.description && <div className="flex-1" />}
              {item.price && item.price > 0 && (
                <p className="text-[#E5C158] text-sm font-bold mb-2">${item.price.toFixed(2)} USDT</p>
              )}
              <div className="flex gap-1.5 mt-auto">
                <a href={affiliate?.whatsapp ? `https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}?text=Hola!%20Quiero%20info%20de%20${encodeURIComponent(item.title)}` : (affiliate?.telegram_link || '#')}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-[#25D366] text-white text-[11px] rounded-xl font-bold hover:bg-[#1ebc5a] transition-colors shadow-md shadow-[#25D366]/20">
                  Comprar
                </a>
                <Link to={`/producto/${item.id}?ref=${code || ''}`}
                  className="flex-1 text-center py-2 border border-[#E5C158]/20 text-[#E5C158] text-[11px] rounded-xl font-bold hover:bg-[#E5C158]/10 transition-all">
                  Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-300 text-sm">No se encontraron servicios</p>
            <p className="text-gray-300 text-xs mt-1">Intenta con otra busqueda o categoria</p>
          </div>
        )}
      </div>

      <p className="text-center text-[#E5C158]/20 text-[10px] pb-8 uppercase tracking-widest">Global Dorado — Catalogo Digital</p>
    </div>
  );
}

function PaymentMethod({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <p className="text-gray-300 text-xs mb-1">{label}</p>
      <p className="text-white text-sm">{value}</p>
      <button onClick={onCopy} className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#E5C158]/10 text-[#E5C158] hover:bg-[#E5C158]/20 transition-colors">
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
