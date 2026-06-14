import { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconSearch } from '../../icons/PremiumIcons';

type Tab = 'affiliates' | 'history' | 'landings' | 'proofs';

const PAGE_TYPES = [
  { key: 'landing', label: 'Captacion de Prospecto' },
  { key: 'presentacion', label: 'Presentacion' },
  { key: 'franquicia', label: 'Franquicia' },
  { key: 'vsl', label: 'VSL' },
  { key: 'asesoria', label: 'Asesoria' },
];

export default function AffiliatesAdmin() {
  const [tab, setTab] = useState<Tab>((localStorage.getItem('adminAffiliateTab') as Tab) || 'affiliates');
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [creditValue, setCreditValue] = useState(0);
  const [msg, setMsg] = useState('');

  // Landing config
  const [lcTab, setLcTab] = useState('landing');
  const [lcTitle, setLcTitle] = useState('');
  const [lcSubtitle, setLcSubtitle] = useState('');
  const [lcVideoUrl, setLcVideoUrl] = useState('');
  const [lcText, setLcText] = useState('');
  const [lcBullets, setLcBullets] = useState('');
  const [lcPrice, setLcPrice] = useState('');
  const [lcCta, setLcCta] = useState('');
  const [lcShowForm, setLcShowForm] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [proofs, setProofs] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'affiliates') {
      api.get('/affiliate/admin/affiliates').then(r => setAffiliates(r.data)).catch(() => {});
    } else if (tab === 'history') {
      api.get('/affiliate/admin/history').then(r => setHistory(r.data)).catch(() => {});
    } else if (tab === 'proofs') {
      api.get('/affiliate/admin/proofs').then(r => setProofs(r.data)).catch(() => {});
    }
  }, [tab]);

  const loadLandingConfig = async (type: string) => {
    try {
      const { data } = await api.get('/settings');
      const config = data?.landing_config;
      if (typeof config === 'string') data.landing_config = JSON.parse(config);
      const pc = data?.landing_config?.[type] || {};
      setLcTitle(pc.title || '');
      setLcSubtitle(pc.subtitle || '');
      setLcVideoUrl(pc.video_url || '');
      setLcText(pc.text || '');
      setLcBullets((pc.bullets || []).join('\n'));
      setLcPrice(pc.price || '');
      setLcCta(pc.cta_text || '');
      setLcShowForm(pc.show_form !== false);
    } catch {}
  };

  useEffect(() => {
    if (tab === 'landings') loadLandingConfig(lcTab);
  }, [tab, lcTab]);

  const saveLandingConfig = async () => {
    try {
      await api.put('/affiliate/admin/landing-config', {
        pageType: lcTab,
        config: {
          title: lcTitle,
          subtitle: lcSubtitle,
          video_url: lcVideoUrl,
          text: lcText,
          bullets: lcBullets.split('\n').filter((b: string) => b.trim()),
          price: lcPrice,
          cta_text: lcCta,
          show_form: lcShowForm,
        },
      });
      setMsg('Pagina guardada');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error al guardar'); }
  };

  const updateCredits = async (userId: string) => {
    try {
      await api.put(`/affiliate/admin/credits/${userId}`, { credits: creditValue });
      setAffiliates(prev => prev.map(a => a.id === userId ? { ...a, credits: creditValue } : a));
      setEditingCredits(null);
    } catch {}
  };

  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('adminAffiliateTab', t); };

  const filtered = affiliates.filter((a: any) =>
    a.username?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Gestion de Afiliados</h1>
      {msg && <div className="mb-3 p-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg text-[#FFD700] text-xs text-center">{msg}</div>}

      {/* Top Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'affiliates' as Tab, label: 'Afiliados' },
          { key: 'history' as Tab, label: 'Historial' },
          { key: 'landings' as Tab, label: 'Captacion de Prospecto' },
          { key: 'proofs' as Tab, label: 'Comprobantes' },
        ].map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === t.key ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Afiliados */}
      {tab === 'affiliates' && (
        <>
          <div className="relative mb-4">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input className="w-full bg-[#111] border border-[#FFD700]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600"
              placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                  <th className="text-left py-3 px-3">Usuario</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">Contacto</th>
                  <th className="text-center py-3 px-3">Creditos</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">Codigo</th>
                  <th className="text-right py-3 px-3">Accion</th>
                </tr></thead>
                <tbody>
                  {filtered.map((a: any) => (
                    <tr key={a.id} className="border-b border-[#FFD700]/5 hover:bg-white/5">
                      <td className="py-2 px-3"><p className="text-white text-sm">{a.username}</p>{a.display_name && <p className="text-gray-500 text-xs">{a.display_name}</p>}</td>
                      <td className="py-2 px-3 hidden md:table-cell text-gray-400 text-xs">{a.email}<br />{a.phone}</td>
                      <td className="py-2 px-3 text-center">
                        {editingCredits === a.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input type="number" min="0" className="w-16 bg-black border border-[#FFD700]/20 rounded px-2 py-1 text-white text-xs text-center"
                              value={creditValue} onChange={e => setCreditValue(parseInt(e.target.value) || 0)} />
                            <button onClick={() => updateCredits(a.id)} className="text-[#FFD700] text-xs px-2">OK</button>
                            <button onClick={() => setEditingCredits(null)} className="text-gray-500 text-xs">X</button>
                          </div>
                        ) : <span className="text-[#FFD700] font-bold">{a.credits}</span>}
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell text-gray-400 text-xs font-mono">{a.referral_code}</td>
                      <td className="py-2 px-3 text-right">
                        <button onClick={() => { setEditingCredits(a.id); setCreditValue(a.credits); }}
                          className="text-xs px-3 py-1 bg-[#FFD700] text-black rounded-lg font-bold hover:bg-[#FFE44D]">Creditos</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: Historial */}
      {tab === 'history' && (
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                <th className="text-left py-3 px-3">Afiliado</th>
                <th className="text-left py-3 px-3">Referido</th>
                <th className="text-left py-3 px-3 hidden md:table-cell">Fecha</th>
                <th className="text-left py-3 px-3">Estado</th>
              </tr></thead>
              <tbody>
                {history.map((h: any) => (
                  <tr key={h.id} className="border-b border-[#FFD700]/5">
                    <td className="py-2 px-3 text-white text-sm">{h.affiliate?.username}</td>
                    <td className="py-2 px-3 text-gray-400 text-sm">{h.referred_user?.username}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs hidden md:table-cell">{new Date(h.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${h.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {h.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Landings Config */}
      {tab === 'landings' && (
        <div className="space-y-4">
          {/* Sub-tabs de tipos de pagina */}
          <div className="flex gap-2 flex-wrap">
            {PAGE_TYPES.map(pt => (
              <button key={pt.key} onClick={() => setLcTab(pt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  lcTab === pt.key ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 border border-[#FFD700]/10'}`}>
                {pt.label}
              </button>
            ))}
          </div>

          {/* Formulario de config */}
          <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 space-y-3">
            <h3 className="text-white font-bold text-sm">Editar: {PAGE_TYPES.find(p => p.key === lcTab)?.label}</h3>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Titulo" value={lcTitle} onChange={e => setLcTitle(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Subtitulo" value={lcSubtitle} onChange={e => setLcSubtitle(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="URL del video (YouTube, Vimeo, Drive)" value={lcVideoUrl} onChange={e => setLcVideoUrl(e.target.value)} />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">O subir video desde el ordenador (MP4, WebM, MOV)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept="video/*" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploadingVideo(true);
                  const fd = new FormData();
                  fd.append('video', f);
                  try {
                    const { data } = await api.post('/content/upload-video', fd);
                    setLcVideoUrl(data.url);
                    setMsg('Video subido correctamente');
                  } catch { setMsg('Error al subir video'); }
                  setUploadingVideo(false);
                  setTimeout(() => setMsg(''), 2000);
                }} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700]/10 file:text-[#FFD700] hover:file:bg-[#FFD700]/20 flex-1" />
                {uploadingVideo && <span className="text-[#FFD700] text-xs animate-pulse">Subiendo...</span>}
              </div>
            </div>
            <textarea className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white min-h-[100px]"
              placeholder="Texto principal" value={lcText} onChange={e => setLcText(e.target.value)} />
            <textarea className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white min-h-[80px]"
              placeholder="Beneficios (uno por linea)" value={lcBullets} onChange={e => setLcBullets(e.target.value)} />
            <p className="text-xs text-gray-500">Cada linea se convierte en un bullet point</p>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Precio (ej: $25 USDT)" value={lcPrice} onChange={e => setLcPrice(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Texto del boton (ej: Quiero Registrarme)" value={lcCta} onChange={e => setLcCta(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={lcShowForm} onChange={e => setLcShowForm(e.target.checked)} />
              Mostrar formulario de registro
            </label>
            <button onClick={saveLandingConfig} className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D]">
              Guardar Configuracion
            </button>
          </div>
        </div>
      )}

      {/* TAB: Comprobantes */}
      {tab === 'proofs' && (
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                <th className="text-left py-3 px-3">Usuario</th>
                <th className="text-left py-3 px-3">Servicio</th>
                <th className="text-left py-3 px-3 hidden md:table-cell">Monto</th>
                <th className="text-left py-3 px-3 hidden md:table-cell">Metodo</th>
                <th className="text-left py-3 px-3 hidden md:table-cell">Fecha</th>
                <th className="text-left py-3 px-3">Estado</th>
              </tr></thead>
              <tbody>
                {proofs.map((p: any) => (
                  <tr key={p.id} className="border-b border-[#FFD700]/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-white text-sm">{p.user?.username} <span className="text-gray-500 text-xs">{p.user?.email}</span></td>
                    <td className="py-2 px-3 text-gray-300 text-xs">{p.service}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs hidden md:table-cell">{p.amount || '-'}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs hidden md:table-cell">{p.payment_method || '-'}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">
                      {p.proof_message || '-'}
                      {p.proof_image && ' '}
                      {p.proof_image && <a href={p.proof_image} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] underline text-xs">Ver foto</a>}
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs hidden md:table-cell">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <select value={p.status} onChange={async (e) => {
                        await api.patch(`/affiliate/admin/proofs/${p.id}`, { status: e.target.value });
                        setProofs(prev => prev.map(x => x.id === p.id ? {...x, status: e.target.value} : x));
                      }} className={`text-xs px-2 py-1 rounded-lg border-0 ${p.status === 'approved' ? 'bg-green-500/20 text-green-400' : p.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        <option value="pending">Pendiente</option>
                        <option value="approved">Aprobado</option>
                        <option value="rejected">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {proofs.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No hay comprobantes aun</p>}
        </div>
      )}
    </div>
  );
}
