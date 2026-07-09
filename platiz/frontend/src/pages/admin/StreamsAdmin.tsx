import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Stream } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiPlay, HiPhotograph, HiVideoCamera, HiSwitchHorizontal } from 'react-icons/hi';
import { detectType } from '../../components/MediaPlayer';

export default function StreamsAdmin() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', thumbnail_url: '', video_url: '', show_on_landing: false });
  const [saving, setSaving] = useState(false);

  const loadStreams = () => {
    setLoading(true);
    api.get('/streams').then((r) => setStreams(r.data)).catch(() => toast.error('Error al cargar transmisiones')).finally(() => setLoading(false));
  };

  useEffect(() => { loadStreams(); }, []);

  const resetForm = () => { setForm({ title: '', description: '', thumbnail_url: '', video_url: '', show_on_landing: false }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.video_url) { toast.error('Título y URL de video son obligatorios'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/streams/${editId}`, form);
        toast.success('Transmisión actualizada');
      } else {
        await api.post('/streams', form);
        toast.success('Transmisión creada');
      }
      resetForm();
      loadStreams();
    } catch { toast.error('Error al guardar'); } finally { setSaving(false); }
  };

  const deleteStream = async (id: string) => {
    if (!confirm('¿Eliminar esta transmisión?')) return;
    try {
      await api.delete(`/streams/${id}`);
      setStreams((prev) => prev.filter((s) => s.id !== id));
      toast.success('Transmisión eliminada');
    } catch { toast.error('Error al eliminar'); }
  };

  const toggleActive = async (id: string) => {
    try {
      const { data } = await api.patch(`/streams/${id}/toggle`);
      setStreams((prev) => prev.map((s) => s.id === id ? { ...s, active: data.active } : s));
      toast.success(`Transmisión ${data.active ? 'activada' : 'desactivada'}`);
    } catch { toast.error('Error al actualizar'); }
  };

  const editStream = (s: Stream) => {
    setForm({ title: s.title, description: s.description || '', thumbnail_url: s.thumbnail_url || '', video_url: s.video_url, show_on_landing: !!s.show_on_landing });
    setEditId(s.id);
    setShowForm(true);
  };

  const detectedType = form.video_url ? detectType(form.video_url) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiVideoCamera className="w-8 h-8 text-[#E5C158]" />
          <div>
            <h1 className="section-title text-2xl">Gestión de Transmisiones</h1>
            <p className="section-subtitle">Administra transmisiones en vivo y videos desde múltiples plataformas</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><HiPlus className="w-4 h-4" /> Nueva transmisión</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass rounded-3xl p-8 border border-[#E5C158]/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'Editar' : 'Nueva'} Transmisión</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input className="input" placeholder="Título de la transmisión" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="textarea" placeholder="Descripción opcional..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Imagen miniatura (URL)</label>
                <input className="input" placeholder="https://imagen.com/miniatura.jpg" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
              </div>
              <div>
                <label className="label">URL del video o transmisión</label>
                <input className="input" placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..." value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} required />
                {detectedType && (
                  <p className="text-xs mt-1 text-[#E5C158]/70">
                    Tipo detectado: <span className="font-medium uppercase">{detectedType}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="showLanding" checked={form.show_on_landing} onChange={(e) => setForm({ ...form, show_on_landing: e.target.checked })} className="w-4 h-4 rounded border-[#E5C158]/30 bg-[#0a0a0f] text-[#E5C158] focus:ring-[#E5C158]/20" />
                <label htmlFor="showLanding" className="text-sm text-gray-300">Mostrar en la Landing Page</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl border border-[#E5C158]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5C158]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Transmisión</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Plataforma</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Tipo</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Landing</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Fecha</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : streams.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500">
                  <HiPhotograph className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p>No hay transmisiones registradas</p>
                  <p className="text-xs text-gray-600 mt-1">Agrega enlaces de YouTube, Vimeo, Twitch, Google Drive, M3U8 y más</p>
                </td></tr>
              ) : streams.map((s) => (
                <tr key={s.id} className="border-b border-[#E5C158]/5 hover:bg-[#E5C158]/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.thumbnail_url ? (
                        <img src={s.thumbnail_url} alt={s.title} className="w-12 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-8 bg-[#111] rounded flex items-center justify-center">
                          <HiPlay className="w-4 h-4 text-[#E5C158]/40" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white text-sm">{s.title}</p>
                        {s.description && <p className="text-gray-500 text-xs line-clamp-1">{s.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="badge badge-gold text-xs">{s.platform || '—'}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs uppercase">{s.video_type || '—'}</td>
                  <td className="p-4">
                    {s.show_on_landing ? <span className="badge badge-gold text-xs">Landing</span> : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(s.id)} className="p-2 rounded-lg bg-[#E5C158]/10 text-[#E5C158] hover:bg-[#E5C158]/20 transition-colors" title="Activar/Desactivar"><HiSwitchHorizontal className="w-4 h-4" /></button>
                      <button onClick={() => editStream(s)} className="p-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors" title="Editar"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteStream(s.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Eliminar"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
