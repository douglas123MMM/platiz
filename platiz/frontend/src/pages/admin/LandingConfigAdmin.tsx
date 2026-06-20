import { useState, useEffect } from 'react';
import api from '../../services/api';
import { uploadVideoToStorage, deleteVideoFromStorage } from '../../services/supabase';
import toast from 'react-hot-toast';
import { HiSave, HiVideoCamera, HiTrash, HiPlus, HiGlobe, HiRefresh } from 'react-icons/hi';

interface PageConfig {
  title: string;
  subtitle: string;
  video_url: string;
  video_type: string;
  text: string;
  bullets: string[];
  price: string;
  cta_text: string;
  show_form: boolean;
}

const PAGE_LABELS: Record<string, string> = {
  landing: 'Landing Principal',
  vsl: 'VSL (Video Sales Letter)',
  asesoria: 'Asesoria',
  franquicia: 'Franquicia',
  presentacion: 'Presentacion',
};

export default function LandingConfigAdmin() {
  const [configs, setConfigs] = useState<Record<string, PageConfig>>({});
  const [activePage, setActivePage] = useState('landing');
  const [form, setForm] = useState<PageConfig>({ title: '', subtitle: '', video_url: '', video_type: '', text: '', bullets: [], price: '', cta_text: '', show_form: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);

  useEffect(() => {
    api.get('/affiliate/admin/landing-config').then((r) => {
      setConfigs(r.data || {});
      const cfg = (r.data || {})['landing'] || { title: '', subtitle: '', video_url: '', video_type: '', text: '', bullets: [], price: '', cta_text: '', show_form: true };
      setForm(cfg);
      setVideoChanged(false);
    }).catch(() => toast.error('Error al cargar config')).finally(() => setLoading(false));
  }, []);

  const switchPage = async (key: string) => {
    setActivePage(key);
    setLoading(true);
    try {
      const { data } = await api.get('/affiliate/admin/landing-config');
      const allConfigs = data || {};
      setConfigs(allConfigs);
      const cfg = allConfigs[key] || { title: '', subtitle: '', video_url: '', video_type: '', text: '', bullets: [], price: '', cta_text: '', show_form: true };
      setForm(cfg);
      setVideoChanged(false);
    } catch { toast.error('Error al cargar config'); }
    finally { setLoading(false); }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Solo se permiten archivos de video');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error('El video debe ser menor a 200MB');
      return;
    }

    setVideoUploading(true);
    try {
      const oldUrl = form.video_url;
      const url = await uploadVideoToStorage(file);
      setForm({ ...form, video_url: url, video_type: 'direct' });
      setVideoChanged(true);
      if (oldUrl && oldUrl.includes('supabase.co')) {
        deleteVideoFromStorage(oldUrl).catch(() => {});
      }
      toast.success('Video subido correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir video');
    } finally { setVideoUploading(false); }
  };

  const addBullet = () => { setForm({ ...form, bullets: [...form.bullets, ''] }); };
  const removeBullet = (i: number) => { setForm({ ...form, bullets: form.bullets.filter((_, idx) => idx !== i) }); };
  const updateBullet = (i: number, val: string) => {
    const b = [...form.bullets];
    b[i] = val;
    setForm({ ...form, bullets: b });
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('El titulo es obligatorio'); return; }
    setSaving(true);
    try {
      const { data } = await api.get('/affiliate/admin/landing-config');
      const serverConfigs = data || {};
      const serverPage = serverConfigs[activePage] || {};
      const merged = {
        ...serverPage,
        title: form.title,
        subtitle: form.subtitle,
        text: form.text,
        bullets: form.bullets,
        price: form.price,
        cta_text: form.cta_text,
        show_form: form.show_form,
      };
      if (videoChanged) {
        merged.video_url = form.video_url;
        merged.video_type = form.video_type || 'direct';
      }
      await api.put('/affiliate/admin/landing-config', { pageType: activePage, config: merged });
      setConfigs({ ...serverConfigs, [activePage]: merged });
      setForm(merged);
      setVideoChanged(false);
      toast.success(`Pagina "${PAGE_LABELS[activePage] || activePage}" actualizada`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  );

  const availablePages = Object.keys(PAGE_LABELS).filter(k => k === activePage || configs[k]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <HiGlobe className="w-8 h-8 text-[#FFD700]" />
        <div>
          <h1 className="section-title text-2xl">Landing de Afiliados</h1>
          <p className="section-subtitle">Configura el video y contenido que ven los clientes al entrar por un enlace de afiliado</p>
        </div>
        <button onClick={() => switchPage(activePage)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] text-gray-400 hover:text-white border border-[#FFD700]/10 text-sm transition-colors">
          <HiRefresh className="w-4 h-4" /> Recargar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(PAGE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchPage(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activePage === key ? 'bg-[#FFD700] text-black' : 'bg-[#111] text-gray-400 hover:text-white border border-[#FFD700]/10'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#FFD700]/10">
          <HiVideoCamera className="w-6 h-6 text-[#FFD700]" />
          <span className="text-white font-medium">Editando: {PAGE_LABELS[activePage] || activePage}</span>
          <span className="text-xs text-gray-500">/landing/&#123;codigo&#125;/{activePage}</span>
        </div>

        <div>
          <label className="label">Titulo</label>
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titulo de la pagina" />
        </div>

        <div>
          <label className="label">Subtitulo</label>
          <textarea className="textarea" rows={3} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitulo descriptivo" />
        </div>

        <div className="bg-[#0a0a0f] rounded-xl p-4 border border-[#FFD700]/10 space-y-3">
          <label className="label flex items-center gap-2"><HiVideoCamera className="w-4 h-4 text-[#FFD700]" /> Video de la Landing</label>

          <div className="flex gap-3">
            <input className="input flex-1" value={form.video_url} onChange={e => { setForm({ ...form, video_url: e.target.value }); setVideoChanged(true); }} placeholder="URL del video (YouTube, Drive, MP4...) o sube uno nuevo" />
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-medium ${videoUploading ? 'bg-gray-600 text-gray-300' : 'bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 border border-[#FFD700]/20'}`}>
              {videoUploading ? 'Subiendo...' : 'Subir video'}
              <input type="file" accept="video/mp4,video/webm,video/mov,video/mkv" onChange={handleVideoUpload} className="hidden" disabled={videoUploading} />
            </label>
          </div>

          {videoUploading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
              Subiendo video a Supabase...
            </div>
          )}

          {form.video_url && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
              {form.video_url.includes('youtube.com') || form.video_url.includes('youtu.be') ? (
                <iframe src={form.video_url.includes('youtube.com/watch?v=') ? `https://www.youtube.com/embed/${form.video_url.split('v=')[1]?.split('&')[0]}` : `https://www.youtube.com/embed/${form.video_url.split('youtu.be/')[1]?.split('?')[0]}`} className="w-full max-w-md aspect-video rounded-lg bg-black" allowFullScreen title="Preview" />
              ) : (
                <video src={form.video_url} controls className="w-full max-w-md aspect-video rounded-lg bg-black" />
              )}
              <button onClick={() => { setForm({ ...form, video_url: '', video_type: '' }); setVideoChanged(true); }} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <HiTrash className="w-3 h-3" /> Quitar video
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="label">Texto descriptivo</label>
          <textarea className="textarea" rows={6} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Texto que aparece debajo del video..." />
        </div>

        <div>
          <label className="label flex items-center justify-between">
            <span>Beneficios / Bullets</span>
            <button onClick={addBullet} className="text-xs text-[#FFD700] hover:text-[#FFE44D] flex items-center gap-1"><HiPlus className="w-3 h-3" /> Agregar</button>
          </label>
          <div className="space-y-2 mt-2">
            {form.bullets.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" value={b} onChange={e => updateBullet(i, e.target.value)} placeholder={`Beneficio ${i + 1}`} />
                <button onClick={() => removeBullet(i)} className="p-2 text-red-400 hover:text-red-300"><HiTrash className="w-4 h-4" /></button>
              </div>
            ))}
            {form.bullets.length === 0 && <p className="text-xs text-gray-600">Sin bullets. Haz clic en "Agregar".</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Precio mostrado</label>
            <input className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Ej: $30 USD" />
          </div>
          <div>
            <label className="label">Texto del boton CTA</label>
            <input className="input" value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} placeholder="Quiero Registrarme" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="showForm" checked={form.show_form} onChange={e => setForm({ ...form, show_form: e.target.checked })} className="w-4 h-4 rounded border-[#FFD700]/30 bg-[#0a0a0f] text-[#FFD700] focus:ring-[#FFD700]/20" />
          <label htmlFor="showForm" className="text-sm text-gray-300">Mostrar formulario de registro</label>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <HiSave className="w-4 h-4" /> {saving ? 'Guardando...' : `Guardar "${PAGE_LABELS[activePage] || activePage}"`}
        </button>
      </div>
    </div>
  );
}
