import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { ContentItem } from '../types';
import { HiExternalLink, HiPhotograph } from 'react-icons/hi';

const sectionMeta: Record<string, { title: string; icon: string; subtitle: string }> = {
  movies: { title: '🎬 Entretenimiento', icon: '🎬', subtitle: 'Streaming, música, gaming y bienestar con descuentos exclusivos' },
  courses: { title: '📚 Capacitación', icon: '📚', subtitle: 'Domina los algoritmos y cierra ventas con nuestro método probado' },
  books: { title: '📖 Libros', icon: '📖', subtitle: 'Biblioteca digital con libros de desarrollo personal, negocios y crecimiento' },
  apps: { title: '📱 Aplicaciones', icon: '📱', subtitle: 'Apps móviles y web para potenciar tu productividad y negocio digital' },
  telegram: { title: '💬 Comunidad Telegram', icon: '✈️', subtitle: 'Canales VIP con soporte 24/7 y contenido exclusivo para socios' },
  services: { title: '🛠️ Arsenal Digital', icon: '🛠️', subtitle: 'Licencias, software profesional e IAs: el catálogo más completo' },
  academy: { title: '🎓 Academia Global', icon: '🎓', subtitle: 'El Método: capacitación maestra para operar tu negocio digital' },
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
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <span className="text-5xl mb-4 block">{meta.icon}</span>
        <h1 className="section-title">{meta.title}</h1>
        <p className="section-subtitle">{meta.subtitle}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-[#111] rounded-xl h-48 mb-4" />
              <div className="h-5 bg-[#111] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#111] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <HiPhotograph className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Contenido próximo a cargarse...</p>
          <p className="text-gray-600 text-sm mt-2">El administrador está añadiendo nuevos recursos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card-glow group overflow-hidden">
              {item.image_url && (
                <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-48 bg-[#0a0a0f] flex items-center justify-center">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">{item.title}</h3>
              {item.description && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFE44D] text-sm font-medium transition-colors">
                  <HiExternalLink className="w-4 h-4" /> Acceder al recurso
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
