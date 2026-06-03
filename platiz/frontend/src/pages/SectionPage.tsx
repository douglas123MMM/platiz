import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { ContentItem } from '../types';
import { IconExternalLink, IconPhoto, IconPlay, IconSearch } from '../icons/PremiumIcons';
import { SectionStreaming, IconCourses, SectionBooks, SectionApps, SectionTelegram, SectionServices, SectionAcademy, SectionAffiliate } from '../icons/PremiumIcons';

const sectionMeta: Record<string, { title: string; icon: React.FC<{ className?: string; size?: number }>; subtitle: string }> = {
  movies: { title: 'Entretenimiento', icon: SectionStreaming, subtitle: 'Streaming, música, gaming y bienestar con descuentos exclusivos' },
  courses: { title: 'Capacitación', icon: IconCourses, subtitle: 'Domina los algoritmos y cierra ventas con nuestro método probado' },
  books: { title: 'Libros', icon: SectionBooks, subtitle: 'Biblioteca digital con libros de desarrollo personal, negocios y crecimiento' },
  apps: { title: 'Aplicaciones', icon: SectionApps, subtitle: 'Apps móviles y web para potenciar tu productividad y negocio digital' },
  telegram: { title: 'Comunidad Telegram', icon: SectionTelegram, subtitle: 'Canales VIP con soporte 24/7 y contenido exclusivo para socios' },
  services: { title: 'Arsenal Digital', icon: SectionServices, subtitle: 'Licencias, software profesional e IAs: el catálogo más completo' },
  academy: { title: 'Academia Global', icon: SectionAcademy, subtitle: 'El Método: capacitación maestra para operar tu negocio digital' },
  affiliate: { title: 'Afiliación', icon: SectionAffiliate, subtitle: 'Instrucciones, enlaces y recursos para promover Global Dorado' },
  'plr-pro': { title: 'PLR PRO', icon: SectionBooks, subtitle: 'Guías con derechos de reventa maestra listas para personalizar y vender' },
  programas: { title: 'Programas', icon: SectionServices, subtitle: 'Software profesional y herramientas digitales para tu negocio' },
  editables: { title: 'Editables', icon: SectionBooks, subtitle: 'Plantillas y recursos editables para crear contenido profesional' },
};

export default function SectionPage() {
  const slug = useLocation().pathname.replace('/', '');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const meta = sectionMeta[slug || ''] || { title: 'Sección', icon: '📄', subtitle: '' };

  const filtered = query.trim()
    ? items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()) || (i.description || '').toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/content/items/${slug}`)
      .then((r) => { setItems(r.data.items || r.data); setTotal(r.data.total || 0); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#00D4FF]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-[#A855F7]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="text-center relative z-10">
        <meta.icon className="w-14 h-14 text-[#FFD700] mx-auto mb-4" />
        <h1 className="section-title">{meta.title}</h1>
        <p className="section-subtitle">{meta.subtitle}</p>
        {!loading && <p className="text-[#FFD700]/50 text-sm mt-1">{total || items.length} {((total || items.length) === 1) ? 'recurso disponible' : 'recursos disponibles'}</p>}
      </div>

      {!loading && items.length > 0 && (
        <div className="relative z-10 max-w-md mx-auto w-full">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar guías..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border border-[#FFD700]/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30 transition-all"
            />
            {query && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#FFD700]/60">
                {filtered.length} de {items.length}
              </span>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-[#111] rounded-xl h-48 mb-4" />
              <div className="h-5 bg-[#111] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#111] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 relative z-10">
          <IconPhoto className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Contenido próximo a cargarse...</p>
          <p className="text-gray-600 text-sm mt-2">El administrador está añadiendo nuevos recursos.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 relative z-10">
          <IconSearch className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Sin resultados para "{query}"</p>
          <p className="text-gray-600 text-sm mt-2">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.map((item) => {
            const isTextOnly = !item.link && !item.video_url;
            return (
            <div
              key={item.id}
              className={`${isTextOnly ? 'lg:col-span-3 md:col-span-2' : ''} card-glow group overflow-hidden`}
            >
              {!isTextOnly && (
              <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-48 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden'); }} />
                ) : null}
                <div className={`fallback-icon ${item.image_url ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center`}>
                  <span className="text-6xl font-black text-[#FFD700]/25">{item.title.trim().charAt(0).toUpperCase()}</span>
                </div>
                {item.video_url && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <IconPlay className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                )}
              </div>
              )}
              <h3 className={`${isTextOnly ? 'text-xl' : 'text-lg'} font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors`}>{item.title}</h3>
              {item.description && <p className={`text-gray-400 text-sm mb-4 whitespace-pre-wrap ${!isTextOnly && slug !== 'affiliate' ? 'line-clamp-2' : ''}`}>{item.description}</p>}
              {item.video_url ? (
                <Link to={`/player?type=item&id=${item.id}`} className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFE44D] text-sm font-medium transition-colors">
                  <IconPlay className="w-4 h-4" /> Reproducir
                </Link>
              ) : item.link ? (
                <a
                  href={item.link}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/20 rounded-lg text-[#FFD700] hover:text-[#FFE44D] text-sm font-semibold transition-all cursor-pointer">
                  <IconExternalLink className="w-4 h-4" /> Ver guia en Canva
                </a>
              ) : null}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
