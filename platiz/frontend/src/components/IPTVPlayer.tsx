import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Channel { name: string; url: string; logo?: string; group?: string; }

export default function IPTVPlayer() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [current, setCurrent] = useState('');
  const [group, setGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    api.get('/settings').then(r => {
      const url = r.data?.iptv_m3u_url;
      if (!url) { setLoading(false); return; }
      // Usar proxy para evitar bloqueo HTTP/HTTPS
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
        if (chs.length > 0) setCurrent(chs[0].url);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  const groups = [...new Set(channels.map(c => c.group || 'General'))];
  const filtered = channels.filter(c => {
    const g = group === 'all' || (c.group || 'General') === group;
    const s = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return g && s;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar Toggle Mobile */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden px-4 py-2 bg-[#111] border border-[#FFD700]/10 rounded-lg text-white text-sm">
        {sidebarOpen ? 'Cerrar canales' : 'Ver canales'} ({channels.length})
      </button>

      {/* Player */}
      <div className="flex-1 min-w-0">
        <div className="bg-black rounded-xl overflow-hidden">
          {current ? (
            <video ref={videoRef} controls autoPlay className="w-full aspect-video bg-black" src={current} key={current} />
          ) : (
            <div className="w-full aspect-video bg-black flex items-center justify-center text-gray-500 text-sm">
              {loading ? 'Cargando canales...' : 'Selecciona un canal'}
            </div>
          )}
        </div>
      </div>

      {/* Channel List Sidebar */}
      <div className={`lg:w-80 flex-shrink-0 bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden flex flex-col ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="p-3 border-b border-[#FFD700]/10">
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500"
            placeholder="Buscar canal..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="p-2 flex gap-1 flex-wrap border-b border-[#FFD700]/10">
          <button onClick={() => setGroup('all')}
            className={`text-xs px-2 py-1 rounded-full ${group === 'all' ? 'bg-[#FFD700] text-black font-bold' : 'bg-black/30 text-gray-400'}`}>Todos</button>
          {groups.slice(0, 8).map(g => (
            <button key={g} onClick={() => setGroup(g)}
              className={`text-xs px-2 py-1 rounded-full truncate max-w-[120px] ${group === g ? 'bg-[#FFD700] text-black font-bold' : 'bg-black/30 text-gray-400'}`}>{g}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.slice(0, 200).map((ch, i) => (
            <button key={i} onClick={() => { setCurrent(ch.url); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs text-left transition-colors ${current === ch.url ? 'bg-[#FFD700]/10 border border-[#FFD700]/20' : 'hover:bg-white/5 border border-transparent'}`}>
              {ch.logo ? <img src={ch.logo} alt="" className="w-6 h-6 object-contain rounded flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <span className="w-6 h-6 flex items-center justify-center text-gray-600 flex-shrink-0">📺</span>}
              <span className="text-white truncate">{ch.name}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Sin canales</p>}
        </div>
      </div>
    </div>
  );
}
