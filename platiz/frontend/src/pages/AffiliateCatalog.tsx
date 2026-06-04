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

interface AffiliateProfile {
  display_name: string;
  avatar: string | null;
  whatsapp: string;
  telegram_link: string;
}

export default function AffiliateCatalog() {
  const { code } = useParams<{ code: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Cargar catalogo
    api.get('/affiliate/catalog').then(({ data }) => setItems(data)).catch(() => {});

    // Cargar perfil del afiliado
    if (code) {
      api.get(`/affiliate/landing/${code}`).then(({ data }) => {
        if (data.affiliate) {
          setProfile({
            display_name: data.affiliate.display_name,
            avatar: data.affiliate.avatar,
            whatsapp: '',
            telegram_link: '',
          });
        }
        // Buscar info completa del afiliado
        return api.get('/affiliate/dashboard');
      }).then(({ data }: any) => {
        if (data?.profile) {
          setProfile({
            display_name: data.profile.display_name || data.profile.username,
            avatar: data.profile.avatar,
            whatsapp: data.profile.whatsapp,
            telegram_link: data.profile.telegram_link,
          });
        }
      }).catch(() => {});
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
        {profile && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{profile.display_name || 'Global Dorado'}</p>
              <p className="text-[#FFD700] text-xs">Catalogo de Servicios</p>
            </div>
          </div>
        )}
        <h1 className="text-xl font-bold text-[#FFD700]">Catalogo Digital</h1>

        {/* Botones de contacto */}
        <div className="flex justify-center gap-2 mt-3">
          {profile?.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#25D366] text-white text-xs rounded-full font-bold hover:bg-[#1ebc5a]"
            >
              WhatsApp
            </a>
          )}
          {profile?.telegram_link && (
            <a
              href={profile.telegram_link.startsWith('http') ? profile.telegram_link : `https://t.me/${profile.telegram_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#0088cc] text-white text-xs rounded-full font-bold hover:bg-[#0077b3]"
            >
              Telegram
            </a>
          )}
        </div>
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
            {(item.link || item.video_url) && (
              <a
                href={item.link || item.video_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-center py-1.5 bg-[#FFD700]/10 text-[#FFD700] text-xs rounded-lg hover:bg-[#FFD700]/20"
              >
                Ver
              </a>
            )}
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
