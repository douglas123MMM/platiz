import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { IconSearch, IconExternalLink, IconPhoto, IconArrowRight, IconPlay } from '../icons/PremiumIcons';

interface SearchResult {
  id: string;
  category_slug: string;
  category_name: string;
  category_icon: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  video_url?: string;
  video_type?: string;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    api.get(`/content/search?q=${encodeURIComponent(query)}`)
      .then((r) => setResults(r.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category_slug]) acc[item.category_slug] = { name: item.category_name, icon: item.category_icon, items: [] };
    acc[item.category_slug].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; icon: string; items: SearchResult[] }>);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <IconSearch className="w-10 h-10 text-[#FFD700] mx-auto mb-4" />
        <h1 className="section-title">Resultados de búsqueda</h1>
        {query && <p className="section-subtitle">Mostrando resultados para "<strong className="text-[#FFD700]">{query}</strong>"</p>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-[#111] rounded-xl h-40 mb-4" />
              <div className="h-5 bg-[#111] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#111] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-20">
          <IconSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Escribe algo para buscar</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <IconPhoto className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron resultados</p>
          <p className="text-gray-600 text-sm mt-2">Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([slug, group]) => (
            <div key={slug}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                <Link to={`/${slug}`} className="ml-auto flex items-center gap-1 text-sm text-[#FFD700] hover:text-[#FFE44D] transition-colors">
                  Ver todo <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item) => (
                  <div key={item.id} className="card-glow group overflow-hidden">
                    {item.image_url && (
                      <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-40 bg-[#0a0a0f] flex items-center justify-center">
                        {item.video_url ? (
                          <Link to={`/player?type=item&id=${item.id}`} className="w-full h-full block relative cursor-pointer">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <IconPlay className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </Link>
                        ) : (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">{item.title}</h3>
                    {item.description && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
