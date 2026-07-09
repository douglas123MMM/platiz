import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { ContentItem } from '../types';
import { IconExternalLink, IconPhoto, IconPlay, IconSearch, IconClose, IconStar } from '../icons/PremiumIcons';
import { SectionStreaming, IconCourses, SectionBooks, SectionApps, SectionTelegram, SectionServices, SectionAcademy, SectionAffiliate } from '../icons/PremiumIcons';
import IPTVPlayer from '../components/IPTVPlayer';

interface SectionMeta {
  title: string;
  icon: React.FC<{ className?: string; size?: number }>;
  subtitle: string;
  searchPlaceholder: string;
  ctaLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  resourceLabel: string;
  accentClass: string;
  filterLabel: string;
}

const sectionMeta: Record<string, SectionMeta> = {
  movies: {
    title: 'Entretenimiento', icon: SectionStreaming,
    subtitle: 'Streaming, música, gaming y bienestar con descuentos exclusivos',
    searchPlaceholder: 'Buscar entretenimiento...', ctaLabel: 'Reproducir',
    emptyTitle: 'Contenido próximo a cargarse...', emptySubtitle: 'El administrador está añadiendo nuevos recursos.',
    resourceLabel: 'recurso disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  courses: {
    title: 'Capacitación', icon: IconCourses,
    subtitle: 'Domina los algoritmos y cierra ventas con nuestro método probado',
    searchPlaceholder: 'Buscar cursos...', ctaLabel: 'Ver curso',
    emptyTitle: 'Cursos próximos a publicarse...', emptySubtitle: 'Pronto agregaremos nuevo contenido de capacitación.',
    resourceLabel: 'curso disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  books: {
    title: 'Libros', icon: SectionBooks,
    subtitle: 'Biblioteca digital con libros de desarrollo personal, negocios y crecimiento',
    searchPlaceholder: 'Buscar libros...', ctaLabel: 'Leer',
    emptyTitle: 'Libros próximos a publicarse...', emptySubtitle: 'Pronto agregaremos nuevos títulos a la biblioteca.',
    resourceLabel: 'libro disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  apps: {
    title: 'Aplicaciones', icon: SectionApps,
    subtitle: 'Apps móviles y web para potenciar tu productividad y negocio digital',
    searchPlaceholder: 'Buscar aplicaciones...', ctaLabel: 'Abrir app',
    emptyTitle: 'Aplicaciones próximas a cargarse...', emptySubtitle: 'Pronto agregaremos nuevas herramientas a tu arsenal.',
    resourceLabel: 'aplicación disponible', accentClass: 'accent-cyan',
    filterLabel: 'Plataforma',
  },
  telegram: {
    title: 'Comunidad Telegram', icon: SectionTelegram,
    subtitle: 'Canales VIP con soporte directo y contenido exclusivo para socios',
    searchPlaceholder: 'Buscar canales...', ctaLabel: 'Unirse',
    emptyTitle: 'Canales próximos a cargarse...', emptySubtitle: 'Pronto agregaremos nuevos canales VIP.',
    resourceLabel: 'canal disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  services: {
    title: 'Arsenal Digital', icon: SectionServices,
    subtitle: 'Licencias, software profesional e IAs: el catálogo más completo',
    searchPlaceholder: 'Buscar herramientas...', ctaLabel: 'Acceder',
    emptyTitle: 'Herramientas próximas a cargarse...', emptySubtitle: 'Pronto agregaremos nuevo software y licencias.',
    resourceLabel: 'herramienta disponible', accentClass: 'accent-gold',
    filterLabel: 'Tipo',
  },
  academy: {
    title: 'Academia Global', icon: SectionAcademy,
    subtitle: 'El Método: capacitación maestra para operar tu negocio digital',
    searchPlaceholder: 'Buscar formaciones...', ctaLabel: 'Ver formación',
    emptyTitle: 'Formaciones próximas a cargarse...', emptySubtitle: 'Pronto agregaremos nuevo contenido académico.',
    resourceLabel: 'formación disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  affiliate: {
    title: 'Afiliación', icon: SectionAffiliate,
    subtitle: 'Instrucciones, enlaces y recursos para promover Global Dorado',
    searchPlaceholder: 'Buscar recursos...', ctaLabel: 'Ver',
    emptyTitle: 'Recursos próximos a cargarse...', emptySubtitle: 'Pronto agregaremos nuevos materiales de afiliación.',
    resourceLabel: 'recurso disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  'plr-pro': {
    title: 'PLR PRO', icon: SectionBooks,
    subtitle: 'Guías con derechos de reventa maestra listas para personalizar y vender',
    searchPlaceholder: 'Buscar guías PLR...', ctaLabel: 'Ver',
    emptyTitle: 'Guías próximas a cargarse...', emptySubtitle: 'Pronto agregaremos nuevos productos PLR.',
    resourceLabel: 'guía disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  programas: {
    title: 'Programas', icon: SectionServices,
    subtitle: 'Software profesional y herramientas digitales para tu negocio',
    searchPlaceholder: 'Buscar programas...', ctaLabel: 'Descargar',
    emptyTitle: 'Programas próximos a cargarse...', emptySubtitle: 'Pronto agregaremos nuevo software profesional.',
    resourceLabel: 'programa disponible', accentClass: 'accent-gold',
    filterLabel: 'Tipo',
  },
  editables: {
    title: 'Editables', icon: SectionBooks,
    subtitle: 'Plantillas y recursos editables para crear contenido profesional',
    searchPlaceholder: 'Buscar plantillas...', ctaLabel: 'Descargar',
    emptyTitle: 'Plantillas próximas a cargarse...', emptySubtitle: 'Pronto agregaremos nuevas plantillas editables.',
    resourceLabel: 'plantilla disponible', accentClass: 'accent-gold',
    filterLabel: 'Filtrar',
  },
  ia: {
    title: 'Inteligencia Artificial', icon: SectionServices,
    subtitle: 'ChatGPT, Gemini, Claude, Perplexity y las mejores IAs del mercado',
    searchPlaceholder: 'Buscar IAs...', ctaLabel: 'Usar IA',
    emptyTitle: 'IAs próximas a cargarse...', emptySubtitle: 'Pronto integraremos nuevas inteligencias artificiales.',
    resourceLabel: 'IA disponible', accentClass: 'accent-cyan',
    filterLabel: 'Tipo',
  },
};

const defaultMeta: SectionMeta = {
  title: 'Sección', icon: ({ className, size }: { className?: string; size?: number }) => (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className || ''}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ), subtitle: '',
  searchPlaceholder: 'Buscar...', ctaLabel: 'Ver',
  emptyTitle: 'Contenido próximo a cargarse...', emptySubtitle: 'El administrador está añadiendo nuevos recursos.',
  resourceLabel: 'recurso disponible', accentClass: 'accent-gold',
  filterLabel: 'Filtrar',
};

const platformBadges: Record<string, { label: string; color: string }> = {
  ios: { label: 'iOS', color: 'bg-white/10 text-white border-white/15' },
  android: { label: 'Android', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  web: { label: 'Web', color: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' },
  windows: { label: 'Windows', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  mac: { label: 'Mac', color: 'bg-gray-400/10 text-gray-300 border-gray-400/20' },
};

const platformLabels: Record<string, string> = {
  ios: 'iOS', android: 'Android', web: 'Web App',
  windows: 'Windows', mac: 'Mac',
};

function getAccentColors(slug: string) {
  if (slug === 'apps' || slug === 'ia') {
    return {
      glow: 'bg-[#00D4FF]/5',
      glow2: 'bg-[#A855F7]/5',
      badge: 'badge-info',
      filterActive: 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/20',
      filterInactive: 'text-gray-300 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 border border-transparent',
    };
  }
  return {
    glow: 'bg-[#00D4FF]/5',
    glow2: 'bg-[#A855F7]/5',
    badge: 'badge-gold',
    filterActive: 'bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/20',
    filterInactive: 'text-gray-300 hover:text-[#E5C158] hover:bg-[#E5C158]/5 border border-transparent',
  };
}

export default function SectionPage() {
  const slug = useLocation().pathname.replace('/', '');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const meta = sectionMeta[slug || ''] || defaultMeta;
  const accent = getAccentColors(slug);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    return items.reduce<string[]>((acc, item) => {
      const t = item.tag || item.platform;
      if (t && !seen.has(t)) { seen.add(t); acc.push(t); }
      return acc;
    }, []);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!activeTag) return items;
    return items.filter(i => (i.tag || i.platform) === activeTag);
  }, [items, activeTag]);

  const count = total || items.length;
  const showTags = tags.length >= 2 && !query;

  const searchItems = async (q: string) => {
    if (!q.trim()) { loadPage(1, true); return; }
    setLoading(true); setActiveTag(null);
    try {
      const { data } = await api.get(`/content/search?q=${encodeURIComponent(q)}`);
      const filtered = (data || []).filter((i: any) => i.category_slug === slug);
      setItems(filtered); setTotal(filtered.length); setHasMore(false);
    } catch { setItems([]); }
    setLoading(false);
  };

  const loadPage = async (p: number, reset: boolean = false) => {
    if (reset) { setLoading(true); setPage(1); } else { setLoadingMore(true); }
    try {
      const { data } = await api.get(`/content/items/${slug}?page=${p}&limit=50`);
      const newItems = data.items || data || [];
      if (reset) { setItems(newItems); } else { setItems(prev => [...prev, ...newItems]); }
      setTotal(data.total || 0); setHasMore(data.hasMore || false); setPage(p);
    } catch { setItems([]); }
    setLoading(false); setLoadingMore(false);
  };

  useEffect(() => { if (!slug) return; setActiveTag(null); loadPage(1, true); }, [slug]);
  useEffect(() => { const timer = setTimeout(() => searchItems(query), 300); return () => clearTimeout(timer); }, [query]);

  const loadMore = () => loadPage(page + 1);
  const resourceText = count === 1 ? meta.resourceLabel : `${meta.resourceLabel.replace(' disponible', '')}s disponibles`;

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div aria-hidden="true" className={`absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] ${accent.glow} rounded-full blur-[80px] pointer-events-none`} />
      <div aria-hidden="true" className={`absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] ${accent.glow2} rounded-full blur-[80px] pointer-events-none`} />

      <div className="text-center relative z-10">
        <meta.icon className="w-14 h-14 text-[#E5C158] mx-auto mb-4" />
        <h1 className="section-title">{meta.title}</h1>
        <p className="section-subtitle">{meta.subtitle}</p>
        {!loading && <p className="text-[#E5C158]/70 text-sm mt-1">{count} {resourceText}</p>}
      </div>

      {slug === 'movies' && <IPTVPlayer />}

      {!loading && items.length > 0 && (
        <div className="relative z-10 max-w-md mx-auto w-full">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder={meta.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-[#0a0a0f] border border-[#E5C158]/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#E5C158]/30 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20">
                <IconClose className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {showTags && (
        <div className="relative z-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!activeTag ? accent.filterActive : accent.filterInactive}`}
          >
            Todos
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${activeTag === tag ? accent.filterActive : accent.filterInactive}`}
            >
              {platformLabels[tag] || tag}
            </button>
          ))}
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
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 relative z-10">
          <IconPhoto className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">{query ? `Sin resultados para "${query}"` : activeTag ? `Sin aplicaciones para "${platformLabels[activeTag] || activeTag}"` : meta.emptyTitle}</p>
          <p className="text-gray-300 text-sm mt-2">{query ? 'Intenta con otro término de búsqueda.' : activeTag ? 'Prueba con otro filtro.' : meta.emptySubtitle}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredItems.map((item) => (
              <div key={item.id} className="card-glow group overflow-hidden relative">
                {item.featured === 1 && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-[#E5C158]/15 border border-[#E5C158]/30 rounded-full text-[#E5C158] text-xs font-semibold">
                    <IconStar className="w-3 h-3" /> Destacado
                  </div>
                )}
                <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-48 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden'); }} />
                  ) : null}
                  <div className={`fallback-icon ${item.image_url ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center gap-1`}>
                    <span className="text-4xl font-black text-[#E5C158]/15">{item.title.trim().charAt(0).toUpperCase()}</span>
                    <span className="text-[10px] text-[#E5C158]/20 uppercase tracking-wider">{meta.title}</span>
                  </div>
                  {item.video_url && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <IconPlay className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E5C158] transition-colors">{item.title}</h3>
                  {item.platform && platformBadges[item.platform] && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${platformBadges[item.platform].color}`}>
                      {platformBadges[item.platform].label}
                    </span>
                  )}
                </div>
                {item.description && <p className={`text-gray-300 text-sm mb-4 whitespace-pre-wrap ${slug !== 'affiliate' ? 'line-clamp-2' : ''}`}>{item.description}</p>}
                {item.video_url ? (
                  <Link to={`/player?type=item&id=${item.id}`} className="inline-flex items-center gap-2 text-[#E5C158] hover:text-[#F0D78C] text-sm font-medium transition-colors">
                    <IconPlay className="w-4 h-4" /> Reproducir
                  </Link>
                ) : item.link ? (
                  <a
                    href={item.link}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5C158]/10 hover:bg-[#E5C158]/20 border border-[#E5C158]/20 rounded-lg text-[#E5C158] hover:text-[#F0D78C] text-sm font-semibold transition-all cursor-pointer">
                    <IconExternalLink className="w-4 h-4" /> {meta.ctaLabel}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          {hasMore && !activeTag && (
            <div className="text-center mt-8">
              <button onClick={loadMore} disabled={loadingMore}
                className="px-8 py-3 bg-[#E5C158]/10 border border-[#E5C158]/20 text-[#E5C158] rounded-xl font-bold hover:bg-[#E5C158]/20 transition-colors disabled:opacity-50 min-h-[48px]">
                {loadingMore ? 'Cargando...' : `Cargar más (${total - items.length} restantes)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
