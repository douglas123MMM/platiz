import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { MediaContent } from '../types';
import { HiPlay, HiFilm, HiMenu, HiX, HiRefresh, HiExclamation } from 'react-icons/hi';

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '🏠' },
  { key: 'Noticias', label: 'Noticias', icon: '📰' },
  { key: 'Deportes', label: 'Deportes', icon: '⚽' },
  { key: 'Entretenimiento', label: 'Entretenimiento', icon: '🎬' },
  { key: 'Cultura', label: 'Cultura', icon: '🎭' },
  { key: 'Infantil', label: 'Infantil', icon: '🧒' },
  { key: 'Películas', label: 'Películas', icon: '🎥' },
];

function ChannelCard({ item, isActive, onClick }: { item: MediaContent; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-300 border-2 ${isActive ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/20 scale-[1.02]' : 'border-transparent hover:border-white/10 hover:scale-[1.01]'}`}>
      <div className="relative bg-[#111] flex items-center justify-center" style={{ aspectRatio: '16/10' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl opacity-50">{item.type === 'live' ? '📡' : '🎬'}</span>
            <span className="text-white/40 text-xs font-medium text-center px-2 line-clamp-2">{item.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight">{item.title}</p>
          <span className="text-[#FFD700]/70 text-[10px]">{item.genre}</span>
        </div>
        {isActive && (
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-pulse" />
        )}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 backdrop-blur flex items-center justify-center">
              <HiPlay className="w-6 h-6 text-[#FFD700] ml-0.5" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

export default function CinemaTV() {
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeItem, setActiveItem] = useState<MediaContent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/media').then((r) => setMedia(r.data || [])).catch(() => setMedia([])).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all' ? media : activeCategory === 'Películas' ? media.filter((m) => m.type === 'movie') : media.filter((m) => m.genre === activeCategory);

  const getPlayerSrc = (item: MediaContent): string | null => {
    if (!item) return null;
    const url = item.video_url;
    if (url.endsWith('.m3u8')) return url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
      return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
    }
    if (url.includes('drive.google.com')) {
      const m = url.match(/\/d\/([^/]+)/);
      return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
    }
    if (url.includes('vimeo.com')) {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : null;
    }
    return url;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-[#050508]">
      {/* Sidebar */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-16 left-2 z-50 lg:hidden p-2 rounded-lg bg-[#111] text-gray-400 hover:text-[#FFD700]">
        {sidebarOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
      </button>

      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-56 h-full bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="text-[#FFD700] font-bold text-lg">Cinema & TV</h2>
          <p className="text-gray-500 text-xs mt-0.5">{media.length} canales</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const count = cat.key === 'all' ? media.length : cat.key === 'Películas' ? media.filter((m) => m.type === 'movie').length : media.filter((m) => m.genre === cat.key).length;
            return (
              <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setActiveItem(null); setPlayerError(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeCategory === cat.key ? 'bg-[#FFD700]/10 text-[#FFD700] font-semibold border border-[#FFD700]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-base">{cat.icon}</span>
                <span className="flex-1 text-left">{cat.label}</span>
                {count > 0 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Player */}
        <div className="relative bg-black" style={{ aspectRatio: activeItem ? '16/9' : '16/4' }}>
          {activeItem ? (
            playerError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] gap-3">
                <HiExclamation className="w-12 h-12 text-red-400/60" />
                <p className="text-gray-400 text-sm">Canal no disponible</p>
                <button onClick={() => { setPlayerError(false); setActiveItem(null); }} className="btn-secondary text-xs py-2 px-4">Cerrar</button>
              </div>
            ) : (
              <>
                {activeItem.video_url.endsWith('.m3u8') ? (
                  <video ref={videoRef} className="absolute inset-0 w-full h-full" controls autoPlay playsInline onError={() => setPlayerError(true)} poster={activeItem.image_url || undefined}>
                    <source src={activeItem.video_url} type="application/x-mpegURL" />
                  </video>
                ) : (
                  <iframe src={getPlayerSrc(activeItem) || ''} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen onError={() => setPlayerError(true)} />
                )}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <button onClick={() => { setActiveItem(null); setPlayerError(false); }} className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"><HiX className="w-4 h-4" /></button>
                  <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                    <p className="text-white text-xs font-bold">{activeItem.title}</p>
                  </div>
                  {activeItem.type === 'live' && (
                    <span className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-[10px] font-bold">EN VIVO</span>
                    </span>
                  )}
                </div>
              </>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#111] to-[#1a1a2e]">
              <HiFilm className="w-16 h-16 text-[#FFD700]/10 mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold gold-text mb-2">Cinema & TV</h2>
              <p className="text-gray-500 text-sm">Selecciona un canal o película para comenzar</p>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
              <p>Sin contenido en esta categoría</p>
              <button onClick={() => window.location.reload()} className="btn-ghost text-xs flex items-center gap-1"><HiRefresh className="w-3 h-3" /> Recargar</button>
            </div>
          ) : (
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">
                {activeCategory === 'all' ? 'Todos los canales' : activeCategory}
                <span className="ml-2 text-[#FFD700]/50 font-normal text-xs">({filtered.length})</span>
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
                {filtered.map((item) => (
                  <ChannelCard key={item.id} item={item} isActive={activeItem?.id === item.id} onClick={() => { setActiveItem(item); setPlayerError(false); }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
