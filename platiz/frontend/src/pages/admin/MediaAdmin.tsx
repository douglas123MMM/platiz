import { useState, useEffect } from 'react';
import api from '../../services/api';
import { MediaContent } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiFilm, HiSwitchHorizontal, HiPhotograph } from 'react-icons/hi';

const CATEGORIES = ['TV en Vivo', 'Películas'];
const GENRES_BY_CAT: Record<string, string[]> = {
  'TV en Vivo': ['Noticias', 'Deportes', 'Entretenimiento', 'Cultura', 'Infantil', 'Música', 'General'],
  'Películas': ['Acción/Aventura', 'Comedia', 'Documentales', 'Drama', 'Ciencia Ficción', 'Terror', 'General'],
};

export default function MediaAdmin() {
  const [items, setItems] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', video_url: '', image_url: '', category: 'TV en Vivo', genre: 'General', type: 'live' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/media/admin').then((r) => setItems(r.data || [])).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: '', video_url: '', image_url: '', category: 'TV en Vivo', genre: 'General', type: 'live' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.video_url) { toast.error('Título y URL requeridos'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.category === 'TV en Vivo') payload.type = 'live';
      else payload.type = 'movie';
      if (editId) { await api.put(`/media/${editId}`, payload); toast.success('Actualizado'); }
      else { await api.post('/media', payload); toast.success('Creado'); }
      resetForm(); load();
    } catch { toast.error('Error al guardar'); } finally { setSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    try { await api.delete(`/media/${id}`); setItems((p) => p.filter((i) => i.id !== id)); toast.success('Eliminado'); } catch { toast.error('Error'); }
  };

  const toggle = async (id: string) => {
    try { const { data } = await api.patch(`/media/${id}/toggle`); setItems((p) => p.map((i) => i.id === id ? { ...i, active: data.active } : i)); } catch { toast.error('Error'); }
  };

  const edit = (item: MediaContent) => {
    setForm({ title: item.title, video_url: item.video_url, image_url: item.image_url || '', category: item.category, genre: item.genre, type: item.type });
    setEditId(item.id); setShowForm(true);
  };

  const genres = GENRES_BY_CAT[form.category] || ['General'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiFilm className="w-8 h-8 text-[#FFD700]" />
          <div><h1 className="section-title text-2xl">Gestor de Cinema y TV</h1><p className="section-subtitle">Administra canales en vivo y películas</p></div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><HiPlus className="w-4 h-4" /> Nuevo</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-3xl p-6 md:p-8 border border-[#FFD700]/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{editId ? 'Editar' : 'Nuevo'} Contenido</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="label">Título</label><input className="input" placeholder="Nombre del canal o película" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="label">URL del video (.m3u8 / .mp4 / YouTube)</label><input className="input" placeholder="https://...m3u8 o https://youtube.com/..." value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} required /></div>
              <div><label className="label">URL de imagen de portada</label><input className="input" placeholder="https://...imagen.jpg" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div><label className="label">Categoría</label>
                <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, genre: 'General' })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Género</label>
                <select className="select" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#FFD700]/10">
              <th className="text-left p-3 text-xs font-semibold uppercase text-[#FFD700]/60">Título</th>
              <th className="text-left p-3 text-xs font-semibold uppercase text-[#FFD700]/60">Tipo</th>
              <th className="text-left p-3 text-xs font-semibold uppercase text-[#FFD700]/60">Género</th>
              <th className="text-left p-3 text-xs font-semibold uppercase text-[#FFD700]/60">Estado</th>
              <th className="text-right p-3 text-xs font-semibold uppercase text-[#FFD700]/60">Acciones</th>
            </tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan={5} className="p-12 text-center text-gray-500">Cargando...</td></tr>) : items.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500"><HiPhotograph className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p>Sin contenido</p></td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5">
                  <td className="p-3"><p className="text-white text-sm font-medium">{item.title}</p></td>
                  <td className="p-3"><span className={`badge text-xs ${item.type === 'live' ? 'badge-gold' : 'badge-info'}`}>{item.type === 'live' ? 'TV en Vivo' : 'Película'}</span></td>
                  <td className="p-3 text-gray-400 text-xs">{item.genre}</td>
                  <td className="p-3"><span className={`badge text-xs ${item.active ? 'badge-success' : 'badge-danger'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-1">
                    <button onClick={() => toggle(item.id)} className="p-1.5 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20"><HiSwitchHorizontal className="w-3.5 h-3.5" /></button>
                    <button onClick={() => edit(item)} className="p-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20"><HiPencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><HiTrash className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
