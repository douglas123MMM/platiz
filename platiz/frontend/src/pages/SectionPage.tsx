import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { ContentItem } from '../types';
import { IconExternalLink, IconPhoto, IconPlay } from '../icons/PremiumIcons';
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
};

export default function SectionPage() {
  const slug = useLocation().pathname.replace('/', '');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = sectionMeta[slug || ''] || { title: 'Sección', icon: '📄', subtitle: '' };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/content/items/${slug}`)
      .then((r) => setItems(r.data))
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
        {!loading && <p className="text-[#FFD700]/50 text-sm mt-1">{items.length} {items.length === 1 ? 'recurso disponible' : 'recursos disponibles'}</p>}
      </div>

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {items.map((item) => (
            <div key={item.id} className="card-glow group overflow-hidden">
              {item.image_url && (
                <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-48 bg-[#0a0a0f] flex items-center justify-center">
                  {item.video_url ? (
                    <Link to={`/player?type=item&id=${item.id}`} className="w-full h-full block relative cursor-pointer">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <IconPlay className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </Link>
                  ) : (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">{item.title}</h3>
              {item.description && <p className={`text-gray-400 text-sm mb-4 whitespace-pre-wrap ${slug !== 'affiliate' ? 'line-clamp-3' : ''}`}>{item.description}</p>}
              {item.video_url && (
                <Link to={`/player?type=item&id=${item.id}`} className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFE44D] text-sm font-medium transition-colors">
                  <IconPlay className="w-4 h-4" /> Reproducir
                </Link>
              )}
              {item.link && !item.video_url && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFE44D] text-sm font-medium transition-colors">
                  <IconExternalLink className="w-4 h-4" /> Acceder al recurso
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
