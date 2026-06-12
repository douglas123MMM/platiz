import { useState, useEffect } from 'react';

interface Channel { stream_id: number; name: string; stream_icon?: string; category_id: string; }
interface Vod { stream_id: number; name: string; stream_icon?: string; category_id: string; }
interface Category { category_id: string; category_name: string; }

const LIVE = 'get_live_streams';
const VOD = 'get_vod_streams';
const SERIES = 'get_series';

export default function ZonaVIP() {
  const [server, setServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState('live');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [vodList, setVodList] = useState<Vod[]>([]);
  const [seriesList, setSeriesList] = useState<Vod[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [vodCats, setVodCats] = useState<Category[]>([]);
  const [seriesCats, setSeriesCats] = useState<Category[]>([]);
  const [selCat, setSelCat] = useState('all');
  const [current, setCurrent] = useState<{ url: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const api = (action: string) => `/api/xtream/proxy?server=${encodeURIComponent(server)}&username=${username}&password=${password}&action=${action}`;

  const login = async () => {
    setLoading(true);
    try {
      const r = await fetch(api(LIVE));
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      if (Array.isArray(d)) {
        setChannels(d);
        setLogged(true);
      } else {
        alert('Credenciales invalidas');
      }
    } catch { alert('Error de conexion'); }
    setLoading(false);
  };

  const loadCats = async () => {
    const r = await fetch(api('get_live_categories'));
    setCats((await r.json()) || []);
    const r2 = await fetch(api('get_vod_categories'));
    setVodCats((await r2.json()) || []);
    const r3 = await fetch(api('get_series_categories'));
    setSeriesCats((await r3.json()) || []);
    const r4 = await fetch(api(VOD));
    setVodList((await r4.json()) || []);
    const r5 = await fetch(api(SERIES));
    setSeriesList((await r5.json()) || []);
  };

  useEffect(() => { if (logged) loadCats(); }, [logged]);

  const getStreamUrl = (id: number, type = 'live') => {
    const params = `server=${encodeURIComponent(server)}&username=${username}&password=${password}&stream=${id}&type=${type}`;
    return `/api/xtream/stream?${params}`;
  };

  const play = (id: number, name: string, type = 'live') => {
    setCurrent({ url: getStreamUrl(id, type), name });
  };

  const filtered = () => {
    let list = tab === 'live' ? channels : tab === 'vod' ? vodList : seriesList;
    if (selCat !== 'all') list = list.filter((c: any) => c.category_id === selCat);
    if (search) list = list.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  };

  const catList = tab === 'live' ? cats : tab === 'vod' ? vodCats : seriesCats;

  if (!logged) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#FFD700]/20 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#FFD700] text-center mb-2">ZONA VIP</h1>
        <p className="text-gray-400 text-xs text-center mb-6">Ingresa tus credenciales IPTV</p>
        <div className="space-y-3">
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white" placeholder="URL del servidor" value={server} onChange={e => setServer(e.target.value)} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white" type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login} disabled={loading} className="w-full py-3 bg-[#FFD700] text-black rounded-xl font-bold hover:bg-[#FFE44D] disabled:opacity-50">
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
        </div>
      </div>
    </div>
  );

  const list = filtered();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#FFD700]/10 p-3 flex items-center gap-3">
        <h1 className="text-[#FFD700] font-bold text-lg flex-shrink-0">ZONA VIP</h1>
        <div className="flex gap-1 flex-1 justify-center">
          {[
            { key: 'live', label: 'TV en Vivo' },
            { key: 'vod', label: 'Peliculas' },
            { key: 'series', label: 'Series' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelCat('all'); setSearch(''); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${tab === t.key ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-gray-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-64 bg-[#0c0c12] border-r border-white/5 flex flex-col max-h-[50vh] lg:max-h-full">
          <div className="p-2">
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            <button onClick={() => setSelCat('all')} className={`w-full text-left px-3 py-2 rounded-lg text-xs ${selCat === 'all' ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'text-gray-400 hover:bg-white/5'}`}>
              Todos ({list.length})
            </button>
            {catList.map((c: any) => (
              <button key={c.category_id} onClick={() => setSelCat(c.category_id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate ${selCat === c.category_id ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'text-gray-400 hover:bg-white/5'}`}>
                {c.category_name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Player */}
          {current && (
            <div className="bg-black">
              <div className="flex items-center justify-between p-2 bg-[#111]">
                <span className="text-white text-xs truncate">{current.name}</span>
                <button onClick={() => setCurrent(null)} className="text-gray-400">✕</button>
              </div>
              <video controls autoPlay className="w-full aspect-video bg-black" src={current.url} key={current.url} />
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {list.slice(0, 200).map((ch: any) => (
                <button key={ch.stream_id} onClick={() => play(ch.stream_id, ch.name, tab === 'vod' ? 'vod' : tab === 'series' ? 'series' : 'live')}
                  className="bg-[#111] border border-white/5 hover:border-[#FFD700]/20 rounded-lg p-2 text-left transition-colors group">
                  {ch.stream_icon ? (
                    <img src={ch.stream_icon} alt="" className="w-full h-20 object-contain mb-1 rounded bg-black/50 group-hover:scale-105 transition-transform" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-20 mb-1 rounded bg-black/30 flex items-center justify-center text-2xl text-gray-600">{tab === 'vod' ? '🎬' : tab === 'series' ? '📺' : '📡'}</div>
                  )}
                  <p className="text-white text-xs line-clamp-2 leading-tight">{ch.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
