import { useState, useEffect, useRef } from 'react';

interface Channel { name: string; url: string; logo?: string; group?: string; }

export default function IPTVPlayer() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [current, setCurrent] = useState<Channel | null>(null);
  const [group, setGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/affiliate/iptv-proxy').then(res => res.text()).then(txt => {
      const lines = txt.split('\n');
      const chs: Channel[] = [];
      let cur: any = {};
      for (const line of lines) {
        if (line.startsWith('#EXTINF:')) {
          const nm = line.match(/,(.+)$/);
          const grp = line.match(/group-title="([^"]+)"/);
          const logo = line.match(/tvg-logo="([^"]+)"/);
          cur = { name: nm?.[1]?.trim() || 'Sin nombre', group: grp?.[1] || 'General', logo: logo?.[1] };
        } else if (line.startsWith('http') && cur.name) {
          chs.push({ ...cur, url: line.trim() });
          cur = {};
        }
      }
      setChannels(chs);
      if (chs.length > 0) setCurrent(chs[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const groups = [...new Set(channels.map(c => c.group || 'General'))].sort();
  const filtered = channels.filter(c => {
    const g = group === 'all' || (c.group || 'General') === group;
    const s = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return g && s;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-12rem)] border border-white/5 rounded-xl overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="lg:w-72 flex-shrink-0 bg-[#0c0c12] border-r border-white/5 flex flex-col">
        <div className="p-3 border-b border-white/5">
          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            placeholder="Buscar canal..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="p-2 flex gap-1 flex-wrap border-b border-white/5 max-h-24 overflow-y-auto">
          <button onClick={() => setGroup('all')}
            className={`text-xs px-2 py-1 rounded ${group === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Todos</button>
          {groups.map(g => (
            <button key={g} onClick={() => setGroup(g)}
              className={`text-xs px-2 py-1 rounded truncate max-w-[140px] ${group === g ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{g}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.slice(0, 300).map((ch, i) => (
            <button key={i} onClick={() => setCurrent(ch)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors border-b border-white/[0.02] ${current?.url === ch.url ? 'bg-white/10 border-l-2 border-l-green-500' : 'hover:bg-white/5'}`}>
              {ch.logo ? <img src={ch.logo} alt="" className="w-6 h-6 object-contain rounded flex-shrink-0 bg-black" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <span className="w-6 h-6 flex items-center justify-center text-gray-600 text-xs flex-shrink-0">TV</span>}
              <span className="text-gray-200 truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video player */}
        <div className="bg-black flex items-center justify-center flex-1">
          {current ? (
            <video ref={videoRef} controls autoPlay className="w-full h-full object-contain" src={current.url} key={current.url} poster={current.logo} />
          ) : (
            <div className="text-gray-500 text-sm">
              {loading ? 'Cargando canales...' : 'Selecciona un canal'}
            </div>
          )}
        </div>

        {/* Current channel info */}
        {current && (
          <div className="p-3 bg-[#0c0c12] border-t border-white/5 flex items-center gap-3">
            {current.logo ? <img src={current.logo} alt="" className="w-8 h-8 object-contain rounded bg-black" /> : <span className="text-gray-600">TV</span>}
            <div className="flex-1">
              <p className="text-white text-sm font-medium truncate">{current.name}</p>
              <p className="text-gray-500 text-xs">{current.group || 'General'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
