import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ContentItem, Category } from '../../types';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconPencil, IconPhoto, IconExternalLink, IconLightning } from '../../icons/PremiumIcons';

export default function ContentAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', link: '', video_url: '' });
  const [file, setFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catError, setCatError] = useState('');

  useEffect(() => {
    api.get('/content/categories').then((r) => { setCategories(r.data); setCatError(''); if (r.data.length > 0) setSelectedCat(r.data[0].slug); }).catch((e) => { setCatError('Error al cargar categorías'); });
  }, []);

  useEffect(() => {
    if (selectedCat) api.get(`/content/items/${selectedCat}`).then((r) => setItems(r.data.items || r.data)).catch(() => setItems([]));
  }, [selectedCat]);

  const resetForm = () => { setForm({ title: '', description: '', link: '', video_url: '' }); setFile(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !selectedCat) { toast.error('Título requerido'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('link', form.link);
    if (form.video_url) fd.append('video_url', form.video_url);
    if (file) fd.append('image', file);
    try {
      if (editId) {
        await api.put(`/content/items/${editId}`, fd);
        toast.success('Guardado');
      } else {
        fd.append('category_slug', selectedCat);
        await api.post('/content/items', fd);
        toast.success('Guardado');
      }
      resetForm();
      const { data } = await api.get(`/content/items/${selectedCat}`);
      setItems(data.items || data);
    } catch { toast.error('Error al guardar'); } finally { setLoading(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este item del arsenal?')) return;
    try {
      await api.delete(`/content/items/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Item eliminado');
    } catch { toast.error('Error al eliminar'); }
  };

  const editItem = (item: ContentItem) => {
    setForm({ title: item.title, description: item.description || '', link: item.link || '', video_url: item.video_url || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconLightning className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Arsenal Digital</h1>
            <p className="section-subtitle">Añade recursos, licencias y contenido al catálogo</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><IconPlus className="w-4 h-4" /> Nuevo recurso</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass rounded-3xl p-8 border border-[#FFD700]/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'Editar' : 'Nuevo'} Recurso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Categoría</label>
                <select className="select" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Título del recurso</label>
                <input className="input" placeholder="Ej: Office 365 Premium, Netflix 4K, ChatGPT Plus..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="textarea" placeholder="Describe el recurso, versión, incluye..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Enlace de acceso</label>
                <input className="input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <div>
                <label className="label">URL del video (YouTube, Vimeo, Drive, etc.)</label>
                <input className="input" placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..." value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              </div>
              <div>
                <label className="label">O subir video desde el ordenador</label>
                <div className="flex gap-2 items-center">
                  <input type="file" accept="video/*" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setVideoFile(f);
                    setUploadingVideo(true);
                    const fd = new FormData();
                    fd.append('video', f);
                    try {
                      const { data } = await api.post('/content/upload-video', fd, { timeout: 120000 });
                      setForm({ ...form, video_url: data.url });
                      toast.success('Guardado');
                    } catch { toast.error('Error al subir video'); }
                    setUploadingVideo(false);
                  }} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700]/10 file:text-[#FFD700] hover:file:bg-[#FFD700]/20 flex-1" />
                  {uploadingVideo && <span className="text-[#FFD700] text-xs animate-pulse">Subiendo...</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1 bg-red-500/10 border border-red-500/20 rounded p-2">IMPORTANTE: Para que el video funcione en TODOS los navegadores y dispositivos, debe estar en formato <b>MP4 con codec H.264</b>. Si el video fue grabado con TikTok, conviertelo primero a MP4 normal antes de subir.</p>
              </div>
              <div>
                <label className="label">Imagen del recurso</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700]/10 file:text-[#FFD700] hover:file:bg-[#FFD700]/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {catError && <p className="text-red-400 text-sm w-full">{catError}</p>}
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.slug)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCat === cat.slug ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/20' : 'glass text-gray-400 hover:text-[#FFD700] border border-[#FFD700]/5'}`}>
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && !catError && <p className="text-gray-500 text-sm w-full">Cargando categorías...</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card group">
            {item.image_url && (
              <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-40 bg-[#0a0a0f] flex items-center justify-center">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2" />
              </div>
            )}
            <h3 className="font-semibold text-white mb-1">{item.title}</h3>
            {item.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 whitespace-pre-wrap">{item.description}</p>}
            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#FFD700] hover:text-[#FFE44D]"><IconExternalLink className="w-3 h-3" /> {item.link.substring(0, 30)}...</a>}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#FFD700]/10">
              <button onClick={() => editItem(item)} className="btn-ghost text-xs flex items-center gap-1"><IconPencil className="w-3 h-3" /> Editar</button>
              <button onClick={() => deleteItem(item.id)} className="btn-ghost text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"><IconTrash className="w-3 h-3" /> Eliminar</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <IconPhoto className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No hay recursos en esta categoría</p>
            <p className="text-gray-600 text-xs mt-1">Comienza añadiendo licencias, software o servicios</p>
          </div>
        )}
      </div>
    </div>
  );
}
