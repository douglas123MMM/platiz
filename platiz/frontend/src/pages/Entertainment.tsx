import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  media_type?: string;
}

const IMG = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

function TmdbApi() {
  const [key, setKey] = useState('');
  useEffect(() => {
    api.get('/settings').then(r => setKey(r.data?.tmdb_api_key || '')).catch(() => {});
  }, []);
  return key;
}

async function fetchTMDB(key: string, path: string, params = '') {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`https://api.themoviedb.org/3${path}${sep}api_key=${key}&language=es${params}`);
  return r.json();
}

export default function Entertainment() {
  const [key, setKey] = useState('');
  const [hero, setHero] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [trailer, setTrailer] = useState<{ id: number; title: string } | null>(null);
  const [trailerKey, setTrailerKey] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'iptv'>('movies');
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    api.get('/settings').then(r => setKey(r.data?.tmdb_api_key || '')).catch(() => {});
  }, []);
    fetchTMDB(key, '/trending/all/week').then(d => {
      setTrending(d.results || []);
      if (d.results?.[0]) setHero(d.results[0]);
    });
    fetchTMDB(key, '/movie/popular').then(d => setPopular(d.results || []));
    fetchTMDB(key, '/movie/top_rated').then(d => setTopRated(d.results || []));
    fetchTMDB(key, '/movie/upcoming').then(d => setUpcoming(d.results || []));
    fetchTMDB(key, '/discover/movie', '&with_genres=28').then(d => setAction(d.results || []));
    fetchTMDB(key, '/discover/movie', '&with_genres=35').then(d => setComedy(d.results || []));
    fetchTMDB(key, '/discover/movie', '&with_genres=27').then(d => setHorror(d.results || []));
  }, [key]);

  const handleSearch = (q: string) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(() => {
      fetchTMDB(key, '/search/multi', `&query=${encodeURIComponent(q)}`).then(d => setSearchResults(d.results || []));
    }, 400);
  };

  const openTrailer = async (movie: Movie) => {
    setTrailer({ id: movie.id, title: movie.title || movie.name || '' });
    const d = await fetchTMDB(key, `/movie/${movie.id}/videos`);
    const yt = (d.results || []).find((v: any) => v.site === 'YouTube');
    setTrailerKey(yt?.key || '');
  };

  const Carousel = ({ title, items }: { title: string; items: Movie[] }) => (
    <div className="mb-8">
      <h2 className="text-white text-lg font-bold mb-3 px-4">{title}</h2>
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {items.filter(m => m.poster_path).map(m => (
          <div key={m.id} className="flex-shrink-0 w-36 md:w-44 cursor-pointer group" style={{ scrollSnapAlign: 'start' }}
            onClick={() => openTrailer(m)}>
            <div className="relative overflow-hidden rounded-lg">
              <img src={IMG + m.poster_path} alt={m.title || m.name} className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
              </div>
            </div>
            <p className="text-white text-xs mt-1 truncate">{m.title || m.name}</p>
            {m.vote_average && <p className="text-[#FFD700] text-xs">★ {m.vote_average.toFixed(1)}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-12 animate-fade-in">
      {/* Tabs */}
      <div className="flex justify-center gap-4 py-4 border-b border-white/5">
        <button onClick={() => setActiveTab('movies')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'movies' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-gray-400'}`}>
          Peliculas y Series
        </button>
        <button onClick={() => setActiveTab('iptv')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'iptv' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-gray-400'}`}>
          TV en Vivo
        </button>
      </div>

      {/* IPTV Tab */}
      {activeTab === 'iptv' && (
        <div className="p-4">
          <iframe src="/movies?iptv=1" className="w-full h-[80vh] rounded-xl" title="IPTV" />
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <>
          {/* Hero */}
          {hero && (
            <div className="relative h-[50vh] md:h-[70vh] mb-8">
              <img src={IMG_ORIG + hero.backdrop_path} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
              <div className="absolute top-4 left-4 text-2xl font-bold gold-text">Global Dorado</div>
              <div className="absolute bottom-12 md:bottom-20 left-4 md:left-12 max-w-xl">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{hero.title || hero.name}</h1>
                <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4">{hero.overview}</p>
                <div className="flex gap-3">
                  <button onClick={() => openTrailer(hero)} className="px-8 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] transition-colors flex items-center gap-2">
                    ▶ Ver Trailer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="px-4 mb-6">
            <input className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
              placeholder="Buscar peliculas..." value={search} onChange={e => handleSearch(e.target.value)} />
          </div>

          {/* Search Results or Categories */}
          {search ? (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 px-4">
              {searchResults.filter(m => m.poster_path).map(m => (
                <div key={m.id} className="cursor-pointer group" onClick={() => openTrailer(m)}>
                  <div className="relative overflow-hidden rounded-lg">
                    <img src={IMG + m.poster_path} alt="" className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <p className="text-white text-xs mt-1 truncate">{m.title || m.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Carousel title="Trending" items={trending} />
              <Carousel title="Populares" items={popular} />
              <Carousel title="Mejor Valorados" items={topRated} />
              <Carousel title="Accion" items={action} />
              <Carousel title="Comedia" items={comedy} />
              <Carousel title="Terror" items={horror} />
              <Carousel title="Proximamente" items={upcoming} />
            </>
          )}
        </>
      )}

      {/* Trailer Modal */}
      {trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setTrailer(null)}>
          <div className="bg-[#111] rounded-2xl overflow-hidden w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold">{trailer.title}</h3>
              <button onClick={() => setTrailer(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            {trailerKey ? (
              <div className="aspect-video">
                <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" />
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No hay trailer disponible</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
