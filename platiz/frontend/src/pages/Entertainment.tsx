import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  media_type?: string;
}

interface CatalogMovie {
  id: number;
  category: string;
  name: string;
  image: string;
  link: string;
  previewUrl: string;
}

const IMG = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

async function fetchTMDB(key: string, path: string, params = '') {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`https://api.themoviedb.org/3${path}${sep}api_key=${key}&language=es${params}`);
  return r.json();
}

export default function Entertainment() {
  const [key, setKey] = useState('');
  const [hero, setHero] = useState<TmdbMovie | null>(null);
  const [trending, setTrending] = useState<TmdbMovie[]>([]);
  const [popular, setPopular] = useState<TmdbMovie[]>([]);
  const [topRated, setTopRated] = useState<TmdbMovie[]>([]);
  const [upcoming, setUpcoming] = useState<TmdbMovie[]>([]);
  const [action, setAction] = useState<TmdbMovie[]>([]);
  const [comedy, setComedy] = useState<TmdbMovie[]>([]);
  const [horror, setHorror] = useState<TmdbMovie[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<TmdbMovie[]>([]);
  const [trailer, setTrailer] = useState<{ id: number; title: string } | null>(null);
  const [trailerKey, setTrailerKey] = useState('');
  const searchTimer = useRef<any>(null);

  // Catalog
  const [tab, setTab] = useState<'tmdb' | 'catalog'>('tmdb');
  const [catalogMovies, setCatalogMovies] = useState<CatalogMovie[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);
  const [catalogCat, setCatalogCat] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [player, setPlayer] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    api.get('/settings').then(r => setKey(r.data?.tmdb_api_key || '')).catch(() => {});
  }, []);

  useEffect(() => {
    if (!key) return;
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

  useEffect(() => {
    if (tab !== 'catalog') return;
    setCatalogLoading(true);
    const params = new URLSearchParams();
    if (catalogCat) params.set('cat', catalogCat);
    if (catalogSearch) params.set('q', catalogSearch);
    params.set('page', String(catalogPage));
    params.set('limit', '50');
    api.get(`/movies?${params.toString()}`).then(r => {
      const items: CatalogMovie[] = r.data.items || [];
      setCatalogTotal(r.data.total || 0);
      setCatalogCategories(r.data.categories || []);
      setCatalogMovies(items);
      setCatalogLoading(false);

      // Fetch TMDB posters in background (don't block page load)
      const needPoster = items.filter(m => !m.image || GENERIC_IDS_PREFIX.some(id => m.image.includes(id)));
      if (needPoster.length > 0) {
        const names = needPoster.map(m => m.name).join('|');
        api.get(`/movies/posters?names=${encodeURIComponent(names)}`).then(bulk => {
          if (bulk.data) {
            setCatalogMovies(prev => prev.map(m => bulk.data[m.name] ? { ...m, image: bulk.data[m.name] } : m));
          }
        }).catch(() => {});
      }
    }).catch(() => setCatalogLoading(false));
  }, [tab, catalogCat, catalogSearch, catalogPage]);

  const GENERIC_IDS_PREFIX = [
    '1b2mnLMdoipM2hnstIxlLf0Ne_1U0IwQy',
    '1ETN5F41MADzYUkqiQWlNa6xpBHC48lgY',
    '1BDNyinrLQe7PoTBVR9exO8IWuxQZgx8L',
    '1ETN5F41MADzYUkqiQWlNa6xpBH5kjWdY',
    '1BDNyinrLQe7PoTBVR9exO8IWuxM95u2w',
    '1MZaKyWqs8IY9DHplK8KBNl8-a6zaSiXp',
  ];

  const handleSearch = (q: string) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(() => {
      fetchTMDB(key, '/search/multi', `&query=${encodeURIComponent(q)}`).then(d => setSearchResults(d.results || []));
    }, 400);
  };

  const handleCatalogSearch = (q: string) => {
    setCatalogSearch(q);
    setCatalogPage(1);
  };

  const openTrailer = async (movie: TmdbMovie) => {
    setTrailer({ id: movie.id, title: movie.title || movie.name || '' });
    const d = await fetchTMDB(key, `/movie/${movie.id}/videos`);
    const yt = (d.results || []).find((v: any) => v.site === 'YouTube');
    setTrailerKey(yt?.key || '');
  };

  const openPlayer = (m: CatalogMovie) => {
    const id = m.link.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (id) {
      setPlayer({ title: m.name, url: `https://drive.google.com/file/d/${id[1]}/preview` });
    } else if (m.link) {
      window.open(m.link, '_blank', 'noopener');
    }
  };

  const Carousel = ({ title, items }: { title: string; items: TmdbMovie[] }) => (
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
      <div className="flex justify-center gap-2 mb-6 px-4 pt-4">
        <button onClick={() => setTab('tmdb')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'tmdb' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          Cartelera TMDB
        </button>
        <button onClick={() => setTab('catalog')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'catalog' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          Cat&aacute;logo
        </button>
      </div>

      {tab === 'tmdb' && (
        <>
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

          <div className="px-4 mb-6">
            <input className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
              placeholder="Buscar peliculas..." value={search} onChange={e => handleSearch(e.target.value)} />
          </div>

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

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="px-4">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
              placeholder="Buscar..." value={catalogSearch} onChange={e => handleCatalogSearch(e.target.value)} />
            <select value={catalogCat} onChange={e => { setCatalogCat(e.target.value); setCatalogPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/30">
              <option value="">Todas</option>
              {catalogCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <p className="text-gray-400 text-xs mb-4">{catalogTotal} pel&iacute;culas</p>

          {catalogLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/5 rounded-xl aspect-[2/3] mb-2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {catalogMovies.map(m => (
                <div key={m.id} className="block group cursor-pointer" onClick={() => openPlayer(m)}>
                  <div className="relative overflow-hidden rounded-xl bg-white/5 aspect-[2/3] mb-2">
                    <CatalogImage src={m.image} alt={m.name} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-3xl block">▶</span>
                        <span className="text-xs mt-1 font-bold">Ver</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-xs leading-tight line-clamp-2 group-hover:text-[#FFD700] transition-colors">{m.name}</p>
                  {m.category && <p className="text-gray-500 text-[10px] mt-0.5">{m.category}</p>}
                </div>
              ))}
            </div>
          )}

          {catalogTotal > 50 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setCatalogPage(p => Math.max(1, p - 1))} disabled={catalogPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-xl disabled:opacity-30">Anterior</button>
              <span className="px-4 py-2 text-gray-400 text-sm">{catalogPage} / {Math.ceil(catalogTotal / 50)}</span>
              <button onClick={() => setCatalogPage(p => p + 1)} disabled={catalogPage >= Math.ceil(catalogTotal / 50)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-xl">Siguiente</button>
            </div>
          )}
        </div>
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

      {/* Player Modal */}
      {player && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setPlayer(null)}>
          <div className="flex items-center justify-between p-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-sm font-bold truncate flex-1">{player.title}</h3>
            <button onClick={() => setPlayer(null)} className="text-gray-400 text-2xl px-2">&times;</button>
          </div>
          <div className="flex-1">
            <iframe src={player.url} className="w-full h-full border-0" allowFullScreen allow="autoplay" />
          </div>
        </div>
      )}
    </div>
  );
}

function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState('');
  const [loaded, setLoaded] = useState(false);

  const GENERIC_IDS = [
    '1b2mnLMdoipM2hnstIxlLf0Ne_1U0IwQy',
    '1ETN5F41MADzYUkqiQWlNa6xpBHC48lgY',
    '1BDNyinrLQe7PoTBVR9exO8IWuxQZgx8L',
    '1ETN5F41MADzYUkqiQWlNa6xpBH5kjWdY',
    '1BDNyinrLQe7PoTBVR9exO8IWuxM95u2w',
    '1MZaKyWqs8IY9DHplK8KBNl8-a6zaSiXp',
  ];
  const isGeneric = !src || GENERIC_IDS.some(id => src.includes(id));

  useEffect(() => {
    setLoaded(false);
    if (isGeneric || !src) {
      setImgSrc('');
    } else {
      setImgSrc(src);
    }
  }, [src]);

  if (!imgSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.03] gap-2">
        <div className="w-7 h-7 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
        {isGeneric && <span className="text-[9px] text-gray-600">TMDB</span>}
      </div>
    );
  }

  return (
    <img src={imgSrc} alt={alt} className="w-full h-full object-cover"
      loading="lazy" onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }} />
  );
}
