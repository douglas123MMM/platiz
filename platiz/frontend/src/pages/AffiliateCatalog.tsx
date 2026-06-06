import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
}

export default function AffiliateCatalog() {
  const { code } = useParams<{ code: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [affiliate, setAffiliate] = useState<{ display_name: string; avatar: string | null; whatsapp: string; telegram_link: string; payment_methods: any; instagram?: string; tiktok?: string; facebook?: string; youtube?: string; catalog_theme?: string } | null>(null);
  const [theme, setTheme] = useState('dark');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState('');
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofForm, setProofForm] = useState({ service: '', amount: '', payment_method: '', proof_message: '' });
  const [proofSent, setProofSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const socialLink = (platform: string, val: string) => {
    if (!val) return '#';
    if (val.startsWith('http')) return val;
    const u = val.replace('@','');
    const bases: Record<string, string> = { instagram: 'instagram.com', tiktok: 'tiktok.com/@', facebook: 'facebook.com', youtube: 'youtube.com/' };
    return 'https://' + (bases[platform] || '') + u;
  };

  useEffect(() => {
    // Cargar catalogo publico (solo streaming e IA)
    api.get('/affiliate/catalog').then(({ data }) => setItems(data)).catch(() => {});

    // Cargar perfil del afiliado (endpoint publico)
    if (code) {
      api.get(`/affiliate/landing/${code}/landing`).then(({ data }: any) => {
        if (data.affiliate) { setAffiliate(data.affiliate); setTheme(data.affiliate.catalog_theme || 'dark'); }
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
    <div className={`min-h-screen animate-fade-in ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0f]'}`}>
      {/* Header del afiliado */}
      <div className={`py-5 text-center px-4 border-b ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#111] border-[#FFD700]/10'}`}>
        {affiliate && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-[#FFD700]/20'}`}>
              {affiliate.avatar ? (
                <img src={affiliate.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="text-left">
              <p className={`font-bold text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{affiliate.display_name || 'Global Dorado'}</p>
              <p className="text-[#FFD700] text-xs font-medium">Catalogo de Servicios</p>
            </div>
          </div>
        )}

        {/* Botones de contacto */}
        <div className="flex justify-center gap-3 mt-2">
          {affiliate?.whatsapp && (
            <a href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs rounded-full font-bold hover:bg-green-600 transition-colors shadow-md">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          )}
          {affiliate?.telegram_link && (
            <a href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link.replace('@', '')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-xs rounded-full font-bold hover:bg-blue-600 transition-colors shadow-md">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>
              Telegram
            </a>
          )}
        </div>

        {/* Redes sociales */}
        {(affiliate?.instagram || affiliate?.tiktok || affiliate?.facebook || affiliate?.youtube) && (
          <div className="flex justify-center gap-2 mt-2">
            {affiliate.instagram && (
              <a href={socialLink('instagram', affiliate.instagram)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] to-[#E1306C] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
            {affiliate.tiktok && (
              <a href={socialLink('tiktok', affiliate.tiktok)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            )}
            {affiliate.facebook && (
              <a href={socialLink('facebook', affiliate.facebook)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {affiliate.youtube && (
              <a href={socialLink('youtube', affiliate.youtube)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Boton Ver Metodos de Pago */}
        {affiliate?.payment_methods && (affiliate.payment_methods.binance_id || affiliate.payment_methods.pago_movil_phone || affiliate.payment_methods.zelle || affiliate.payment_methods.otro) && (
          <button onClick={() => setShowPayment(true)}
            className="mt-3 px-4 py-2 bg-[#FFD700] text-black text-xs rounded-full font-bold hover:bg-[#FFE44D] transition-colors">
            💳 Ver Metodos de Pago
          </button>
        )}

        <button onClick={() => { setShowProofForm(true); setProofSent(false); setProofForm({ service: '', amount: '', payment_method: '', proof_message: '' }); }}
          className="mt-3 px-4 py-2 bg-green-600 text-white text-xs rounded-full font-bold hover:bg-green-700 transition-colors">
          ✅ Ya pagué - Enviar comprobante
        </button>

        <h1 className="text-xl font-bold text-[#FFD700] mt-2">Catalogo Digital</h1>
      </div>

      {/* Modal Metodos de Pago */}
      {showPayment && affiliate?.payment_methods && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPayment(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-sm border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#111] border-[#FFD700]/20'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Metodos de Pago</h3>
              <button onClick={() => setShowPayment(false)} className={`text-lg ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>&times;</button>
            </div>
            <div className="space-y-3 mb-4">
              {affiliate.payment_methods.binance_id && (
                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
                  <p className="text-gray-400 text-xs mb-1">Binance</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>ID: {affiliate.payment_methods.binance_id}</p>
                  {affiliate.payment_methods.binance_email && <p className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{affiliate.payment_methods.binance_email}</p>}
                  <button onClick={() => { navigator.clipboard.writeText(`ID: ${affiliate.payment_methods.binance_id}${affiliate.payment_methods.binance_email ? ' - ' + affiliate.payment_methods.binance_email : ''}`); setCopied('binance'); setTimeout(() => setCopied(''), 2000); }}
                    className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20">
                    {copied === 'binance' ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
              )}
              {affiliate.payment_methods.pago_movil_phone && (
                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
                  <p className="text-gray-400 text-xs mb-1">Pago Movil</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{affiliate.payment_methods.pago_movil_bank} / {affiliate.payment_methods.pago_movil_phone} / {affiliate.payment_methods.pago_movil_id}</p>
                  <button onClick={() => { navigator.clipboard.writeText(`${affiliate.payment_methods.pago_movil_bank} ${affiliate.payment_methods.pago_movil_phone} ${affiliate.payment_methods.pago_movil_id}`); setCopied('pm'); setTimeout(() => setCopied(''), 2000); }}
                    className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20">
                    {copied === 'pm' ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
              )}
              {affiliate.payment_methods.zelle && (
                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
                  <p className="text-gray-400 text-xs mb-1">Zelle</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{affiliate.payment_methods.zelle}</p>
                  <button onClick={() => { navigator.clipboard.writeText(affiliate.payment_methods.zelle); setCopied('zelle'); setTimeout(() => setCopied(''), 2000); }}
                    className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20">
                    {copied === 'zelle' ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
              )}
              {affiliate.payment_methods.otro && (
                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
                  <p className="text-gray-400 text-xs mb-1">Otro</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{affiliate.payment_methods.otro}</p>
                  <button onClick={() => { navigator.clipboard.writeText(affiliate.payment_methods.otro); setCopied('otro'); setTimeout(() => setCopied(''), 2000); }}
                    className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20">
                    {copied === 'otro' ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setShowPayment(false)}
              className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm">Cerrar</button>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <input
          className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30 ${theme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#111] border-[#FFD700]/10 text-white'}`}
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categorías */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === 'all' ? 'bg-[#FFD700] text-black font-bold' : theme === 'light' ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10 hover:bg-[#1a1a1a]'}`}
        >
          Todo
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-[#FFD700] text-black font-bold' : theme === 'light' ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10 hover:bg-[#1a1a1a]'}`}
          >
            {cat === 'movies' ? 'Streaming' : cat === 'services' ? 'Servicios' : cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div key={item.id} className={`rounded-2xl border overflow-hidden hover:border-[#FFD700]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#111] border-[#FFD700]/10'}`}>
            <div className={`p-4 flex items-center justify-center h-24 ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="max-h-16 max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className={`text-3xl ${theme === 'light' ? 'text-gray-300' : 'text-gray-700'}`}>{item.title.charAt(0)}</span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <p className={`text-xs font-semibold line-clamp-2 mb-2 leading-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</p>
              {item.description && (
                <p className="text-gray-500 text-xs line-clamp-1 mb-3 flex-1">{item.description}</p>
              )}
              <a
                href={affiliate?.whatsapp ? `https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}?text=Hola!%20Quiero%20adquirir%20${encodeURIComponent(item.title)}` : (affiliate?.telegram_link || '#')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-green-600 text-white text-xs rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                Adquirir
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 text-sm">
            No se encontraron servicios
          </div>
        )}
      </div>
    </div>
  );
}
