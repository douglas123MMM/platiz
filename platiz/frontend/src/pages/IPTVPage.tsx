import { useState, useRef } from 'react';

export default function IPTVPage() {
  const [m3uUrl, setM3uUrl] = useState('');
  const [channels, setChannels] = useState<{ name: string; url: string; logo?: string; group?: string }[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const videoRef = useRef<HTMLVideoElement>(null);

  const parseM3U = (text: string) => {
    const lines = text.split('\n');
    const chs: { name: string; url: string; logo?: string; group?: string }[] = [];
    let current: any = {};
    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) {
        const nameMatch = line.match(/,(.+)$/);
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        current = {
          name: nameMatch ? nameMatch[1].trim() : 'Sin nombre',
          logo: logoMatch ? logoMatch[1] : undefined,
          group: groupMatch ? groupMatch[1] : 'General',
        };
      } else if (line.startsWith('http') && current.name) {
        chs.push({ ...current, url: line.trim() });
        current = {};
      }
    }
    return chs;
  };

  const loadM3U = async () => {
    if (!m3uUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(m3uUrl.trim());
      if (!r.ok) throw new Error('URL no valida o inaccesible');
      const text = await r.text();
      const chs = parseM3U(text);
      if (chs.length === 0) throw new Error('No se encontraron canales en la lista');
      setChannels(chs);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
    }
    setLoading(false);
  };

  const groups = [...new Set(channels.map(c => c.group || 'General'))];
  const filtered = activeGroup === 'all' ? channels : channels.filter(c => (c.group || 'General') === activeGroup);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">IPTV Player</h1>

      {/* URL Input */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <p className="text-gray-400 text-xs mb-2">Pega tu lista M3U o enlace del servidor</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
            placeholder="https://tu-servidor.com/lista.m3u"
            value={m3uUrl}
            onChange={(e) => setM3uUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadM3U()}
          />
          <button onClick={loadM3U} disabled={loading}
            className="px-6 py-2.5 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D] disabled:opacity-50">
            {loading ? 'Cargando...' : 'Cargar'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Player */}
      {currentChannel && (
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <video ref={videoRef} controls autoPlay className="w-full aspect-video bg-black"
            src={currentChannel} key={currentChannel}
            onError={() => setError('No se puede reproducir este canal')} />
        </div>
      )}

      {/* Channel Grid */}
      {channels.length > 0 && (
        <>
          {/* Groups */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setActiveGroup('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${activeGroup === 'all' ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}>
              Todos
            </button>
            {groups.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${activeGroup === g ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}>
                {g}
              </button>
            ))}
          </div>

          {/* Channels */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((ch, i) => (
              <button key={i} onClick={() => { setCurrentChannel(ch.url); setError(''); }}
                className={`text-left p-3 rounded-xl border transition-all text-xs ${currentChannel === ch.url ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-[#111] border-[#FFD700]/10 hover:border-[#FFD700]/20'}`}>
                {ch.logo ? (
                  <img src={ch.logo} alt="" className="w-full h-10 object-contain mb-2 rounded" onError={e => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-10 flex items-center justify-center text-gray-600 text-2xl mb-2">📺</div>
                )}
                <p className="text-white line-clamp-2 leading-tight">{ch.name}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
