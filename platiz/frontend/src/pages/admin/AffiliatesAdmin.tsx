import { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconSearch } from '../../icons/PremiumIcons';

interface Affiliate {
  id: string;
  username: string;
  email: string;
  phone: string;
  credits: number;
  referral_code: string;
  display_name: string;
  created_at: string;
}

interface ReferralHistory {
  id: string;
  status: string;
  created_at: string;
  activated_at: string;
  affiliate: { username: string; email: string };
  referred_user: { username: string; email: string };
}

export default function AffiliatesAdmin() {
  const [tab, setTab] = useState<'affiliates' | 'history' | 'video'>(localStorage.getItem('adminAffiliateTab') as any || 'affiliates');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState('');
  const [search, setSearch] = useState('');
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [creditValue, setCreditValue] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (tab === 'affiliates') {
      api.get('/affiliate/admin/affiliates').then(({ data }) => setAffiliates(data)).catch(() => {});
    } else if (tab === 'history') {
      api.get('/affiliate/admin/history').then(({ data }) => setHistory(data)).catch(() => {});
    } else if (tab === 'video') {
      api.get('/settings').then(({ data }: any) => {
        if (data?.landing_video_url) setVideoUrl(data.landing_video_url);
        if (data?.landing_video_type) setVideoType(data.landing_video_type);
      }).catch(() => {});
    }
  }, [tab]);

  const updateCredits = async (userId: string) => {
    try {
      await api.put(`/affiliate/admin/credits/${userId}`, { credits: creditValue });
      setAffiliates(prev => prev.map(a => a.id === userId ? { ...a, credits: creditValue } : a));
      setEditingCredits(null);
      setMsg('Creditos actualizados');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error'); }
  };

  const saveVideo = async () => {
    try {
      await api.put('/affiliate/admin/landing-video', { landing_video_url: videoUrl, landing_video_type: videoType });
      setMsg('Video guardado');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error'); }
  };

  const filtered = affiliates.filter(a =>
    a.username?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const switchTab = (t: typeof tab) => {
    setTab(t);
    localStorage.setItem('adminAffiliateTab', t);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Gestion de Afiliados</h1>

      {msg && (
        <div className="mb-3 p-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg text-[#FFD700] text-xs text-center">{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['affiliates', 'history', 'video'] as const).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === t ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'
            }`}
          >
            {t === 'affiliates' ? 'Afiliados' : t === 'history' ? 'Historial' : 'Video Landing'}
          </button>
        ))}
      </div>

      {/* Tab: Afiliados */}
      {tab === 'affiliates' && (
        <>
          <div className="relative mb-4">
            <input
              className="w-full bg-[#111] border border-[#FFD700]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600"
              placeholder="Buscar afiliado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          </div>
          <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                    <th className="text-left py-3 px-3">Usuario</th>
                    <th className="text-left py-3 px-3 hidden md:table-cell">Contacto</th>
                    <th className="text-center py-3 px-3">Creditos</th>
                    <th className="text-left py-3 px-3 hidden md:table-cell">Codigo</th>
                    <th className="text-right py-3 px-3">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className="border-b border-[#FFD700]/5 hover:bg-white/5">
                      <td className="py-2 px-3">
                        <p className="text-white text-sm">{a.username}</p>
                        {a.display_name && <p className="text-gray-500 text-xs">{a.display_name}</p>}
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell text-gray-400 text-xs">
                        {a.email}<br />{a.phone}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {editingCredits === a.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              className="w-16 bg-black border border-[#FFD700]/20 rounded px-2 py-1 text-white text-xs text-center"
                              value={creditValue}
                              onChange={(e) => setCreditValue(parseInt(e.target.value) || 0)}
                            />
                            <button onClick={() => updateCredits(a.id)} className="text-[#FFD700] text-xs px-2">OK</button>
                            <button onClick={() => setEditingCredits(null)} className="text-gray-500 text-xs">X</button>
                          </div>
                        ) : (
                          <span className="text-[#FFD700] font-bold">{a.credits}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell text-gray-400 text-xs font-mono">{a.referral_code}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => { setEditingCredits(a.id); setCreditValue(a.credits); }}
                          className="text-xs px-3 py-1 bg-[#FFD700] text-black rounded-lg font-bold hover:bg-[#FFE44D]"
                        >
                          Creditos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No hay afiliados</p>
            )}
          </div>
        </>
      )}

      {/* Tab: Historial */}
      {tab === 'history' && (
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                  <th className="text-left py-3 px-3">Afiliado</th>
                  <th className="text-left py-3 px-3">Referido</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">Fecha</th>
                  <th className="text-left py-3 px-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-b border-[#FFD700]/5">
                    <td className="py-2 px-3 text-white text-sm">{h.affiliate?.username}</td>
                    <td className="py-2 px-3 text-gray-400 text-sm">{h.referred_user?.username}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs hidden md:table-cell">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        h.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {h.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No hay historial aun</p>
          )}
        </div>
      )}

      {/* Tab: Video Global */}
      {tab === 'video' && (
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 space-y-4">
          <h2 className="text-white font-bold text-sm mb-2">Video de Landing para Afiliados</h2>
          <p className="text-gray-500 text-xs">Este video aparecera en todas las paginas de ventas de los afiliados.</p>
          <input
            className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600"
            placeholder="URL del video (YouTube, Vimeo, Google Drive, M3U8, mp4)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <select
            className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white"
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
          >
            <option value="">Auto-detectar</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="gdrive">Google Drive</option>
            <option value="m3u8">M3U8</option>
            <option value="mp4">MP4 Directo</option>
          </select>
          <button onClick={saveVideo} className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D]">
            Guardar Video
          </button>
        </div>
      )}
    </div>
  );
}
