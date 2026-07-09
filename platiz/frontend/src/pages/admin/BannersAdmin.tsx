import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Banner } from '../../types';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconPencil, IconPhoto, IconEye, IconEyeOff } from '../../icons/PremiumIcons';

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', link: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/banners/all').then((r) => setBanners(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: '', description: '', link: '' }); setFile(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('Título requerido'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('link', form.link);
    if (file) fd.append('image', file);
    try {
      if (editId) { await api.put(`/banners/${editId}`, fd); toast.success('Banner actualizado'); }
      else { await api.post('/banners', fd); toast.success('Banner creado'); }
      resetForm(); load();
    } catch { toast.error('Error al guardar'); } finally { setLoading(false); }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}`, { active: banner.active ? 0 : 1 });
      load(); toast.success(banner.active ? 'Desactivado' : 'Activado');
    } catch { toast.error('Error'); }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('¿Eliminar banner?')) return;
    try { await api.delete(`/banners/${id}`); load(); toast.success('Banner eliminado'); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Banners Promocionales</h1>
          <p className="section-subtitle">Sube imágenes promocionales para la portada de Global Dorado</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><IconPlus className="w-4 h-4" /> Nuevo banner</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass rounded-3xl p-8 border border-[#E5C158]/10" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editId ? 'Editar Banner' : 'Nuevo Banner'}>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'Editar' : 'Nuevo'} Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="banner-title">Título</label>
                <input id="banner-title" className="input" placeholder="Ej: Transforma el Internet en Dinero" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="banner-description">Descripción de la promoción</label>
                <textarea id="banner-description" className="textarea" placeholder="Describe lo que se ofrece a los socios..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="banner-link">Enlace (opcional)</label>
                <input id="banner-link" className="input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="banner-image">Imagen promocional</label>
                <input id="banner-image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E5C158]/10 file:text-[#E5C158] hover:file:bg-[#E5C158]/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className={`card overflow-hidden ${!banner.active ? 'opacity-50' : ''}`}>
            {banner.image_url ? (
              <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-48 bg-[#0a0a0f] flex items-center justify-center">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-contain p-2" />
              </div>
            ) : (
              <div className="relative -mx-6 -mt-6 mb-4 h-48 bg-gradient-to-br from-[#111] to-[#0a0a0f] flex items-center justify-center">
                <IconPhoto className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{banner.title}</h3>
                {banner.link && <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E5C158] hover:text-[#F0D78C]">{banner.link.substring(0, 40)}</a>}
                <span className={`badge mt-2 ${banner.active ? 'badge-success' : 'badge-danger'}`}>{banner.active ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(banner)} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-white transition-colors">{banner.active ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}</button>
                <button onClick={() => { setForm({ title: banner.title, description: banner.description || '', link: banner.link || '' }); setEditId(banner.id); setShowForm(true); }} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-[#E5C158] transition-colors"><IconPencil className="w-4 h-4" /></button>
                <button onClick={() => deleteBanner(banner.id)} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-red-400 transition-colors"><IconTrash className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-12">
            <IconPhoto className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No hay banners todavía</p>
          </div>
        )}
      </div>
    </div>
  );
}
