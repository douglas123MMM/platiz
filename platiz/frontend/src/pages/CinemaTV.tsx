import { useState, useEffect } from 'react';
import api from '../services/api';
import { MediaContent } from '../types';
import { HiPlay, HiFilm, HiDesktopComputer, HiPhotograph } from 'react-icons/hi';

const TABS = [
  { key: 'live', label: 'TV en Vivo', icon: HiDesktopComputer },
  { key: 'movie', label: 'Películas', icon: HiFilm },
];

const LIVE_GENRES = ['Noticias', 'Deportes', 'Entretenimiento', 'Cultura', 'Infantil'];
const MOVIE_GENRES = ['Acción/Aventura', 'Comedia', 'Documentales', 'Drama', 'Ciencia Ficción'];

function Player({ item, onClose }: { item: MediaContent; onClose: () => void }) {
  const getEmbedUrl = (url: string, type: string) => {
    if (url.endsWith('.m3u8')) return url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
      return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url;
    }
    if (url.includes('drive.google.com')) {
      const m = url.match(/\/d\/([^/]+)/);
      return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
    }
    if (url.includes('vimeo.com')) {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : url;
    }
    return url;
  };

  const src = getEmbedUrl(item.video_url, item.type);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 md:p-8" onClick={onClose}>
      <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold truncate">{item.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
          {item.type === 'live' || src.endsWith('.m3u8') ? (
            <video className="absolute inset-0 w-full h-full" controls autoPlay playsInline>
              <source src={src} type="application/x-mpegURL" />
            </video>
          ) : (
            <iframe src={src} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
          )}
        </div>
      </div>
    </div>
  );
}

function GenreRow({ title, items, onPlay }: { title: string; items: MediaContent[]; onPlay: (item: MediaContent) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item) => (
          <button key={item.id} onClick={() => onPlay(item)} className="group flex-shrink-0 w-32 md:w-40 text-left">
            <div className="relative rounded-xl overflow-hidden bg-[#111] mb-2" style={{ aspectRatio: '2/3' }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#111]">
                  <HiPlay className="w-8 h-8 text-[#FFD700]/30 group-hover:text-[#FFD700] transition-colors" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <HiPlay className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <p className="text-xs text-gray-300 line-clamp-2 font-medium group-hover:text-[#FFD700] transition-colors">{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CinemaTV() {
  const [tab, setTab] = useState('live');
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [player, setPlayer] = useState<MediaContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/media').then((r) => setMedia(r.data || [])).catch(() => setMedia([])).finally(() => setLoading(false));
  }, []);

  const filtered = media.filter((m) => m.type === tab);
  const genres = tab === 'live' ? LIVE_GENRES : MOVIE_GENRES;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="section-title text-2xl md:text-3xl">Cinema & TV</h1>
        <p className="section-subtitle">Canales en vivo y películas organizadas por género</p>
      </div>

      <div className="flex justify-center gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${tab === t.key ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30' : 'glass text-gray-400 hover:text-[#FFD700]'}`}>
            <t.icon className="w-5 h-5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiPhotograph className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hay contenido en esta sección aún</p>
        </div>
      ) : (
        genres.map((genre) => {
          const items = filtered.filter((m) => m.genre === genre);
          return <GenreRow key={genre} title={genre} items={items} onPlay={setPlayer} />;
        })
      )}

      {player && <Player item={player} onClose={() => setPlayer(null)} />}
    </div>
  );
}
