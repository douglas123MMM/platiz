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
  const [affiliate, setAffiliate] = useState<{ display_name: string; avatar: string | null; whatsapp: string; telegram_link: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Cargar catalogo publico (solo streaming e IA)
    api.get('/affiliate/catalog').then(({ data }) => setItems(data)).catch(() => {});

    // Cargar perfil del afiliado (endpoint publico)
    if (code) {
      api.get(`/affiliate/landing/${code}/landing`).then(({ data }: any) => {
        if (data.affiliate) setAffiliate(data.affiliate);
      }).catch(() => {
        // Si no hay afiliado, mostrar generico
        setAffiliate(null);
      });
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
      {/* Header del afiliado */}
      <div className="bg-gradient-to-b from-black to-transparent py-6 text-center px-4">
        {affiliate && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
              {affiliate.avatar ? (
                <img src={affiliate.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{affiliate.display_name || 'Global Dorado'}</p>
              <p className="text-[#FFD700] text-xs">Catalogo de Servicios</p>
            </div>
          </div>
        )}

        {/* Botones de contacto */}
        <div className="flex justify-center gap-2 mt-3">
          {affiliate?.whatsapp && (
            <a
              href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#25D366] text-white text-xs rounded-full font-bold hover:bg-[#1ebc5a]"
            >
              WhatsApp
            </a>
          )}
          {affiliate?.telegram_link && (
            <a
              href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#0088cc] text-white text-xs rounded-full font-bold hover:bg-[#0077b3]"
            >
              Telegram
            </a>
          )}
        </div>
        <h1 className="text-xl font-bold text-[#FFD700]">Catalogo Digital</h1>
      </div>

      {/* Búsqueda */}
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <input
          className="w-full bg-[#111] border border-[#FFD700]/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categorías */}
      <div className="max-w-3xl mx-auto px-4 mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs ${activeCategory === 'all' ? 'bg-[#FFD700] text-black font-bold' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}
        >
          Todo
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs ${activeCategory === cat ? 'bg-[#FFD700] text-black font-bold' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="max-w-3xl mx-auto px-4 pb-12 grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-3 flex flex-col">
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-full aspect-square object-cover rounded-lg mb-2" />
            )}
            <p className="text-white text-xs font-bold line-clamp-2 mb-1">{item.title}</p>
            {item.description && (
              <p className="text-gray-500 text-xs line-clamp-2 mb-2 flex-1">{item.description}</p>
            )}
            <a
              href={affiliate?.whatsapp ? `https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}?text=Hola!%20Quiero%20adquirir%20${encodeURIComponent(item.title)}` : (affiliate?.telegram_link || '#')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto text-center py-1.5 bg-[#FFD700] text-black text-xs rounded-lg font-bold hover:bg-[#FFE44D]"
            >
              Adquirir
            </a>
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
