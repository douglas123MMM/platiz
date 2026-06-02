import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Partner } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiUsers, HiPhotograph, HiSwitchHorizontal } from 'react-icons/hi';

export default function PartnersAdmin() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', link: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPartners = () => {
    setLoading(true);
    api.get('/partners').then((r) => setPartners(r.data)).catch(() => toast.error('Error al cargar socios')).finally(() => setLoading(false));
  };

  useEffect(() => { loadPartners(); }, []);

  const resetForm = () => { setForm({ name: '', role: '', link: '' }); setFile(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    if (form.role) fd.append('role', form.role);
    if (form.link) fd.append('link', form.link);
    if (file) fd.append('photo', file);
    try {
      if (editId) {
        await api.put(`/partners/${editId}`, fd);
        toast.success('Socio actualizado');
      } else {
        await api.post('/partners', fd);
        toast.success('Socio creado');
      }
      resetForm();
      loadPartners();
    } catch { toast.error('Error al guardar'); } finally { setSaving(false); }
  };

  const deletePartner = async (id: string) => {
    if (!confirm('¿Eliminar este socio?')) return;
    try {
      await api.delete(`/partners/${id}`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success('Socio eliminado');
    } catch { toast.error('Error al eliminar'); }
  };

  const toggleActive = async (id: string) => {
    try {
      const { data } = await api.patch(`/partners/${id}/toggle`);
      setPartners((prev) => prev.map((p) => p.id === id ? { ...p, active: data.active } : p));
    } catch { toast.error('Error'); }
  };

  const editPartner = (p: Partner) => {
    setForm({ name: p.name, role: p.role || '', link: p.link || '' });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiUsers className="w-8 h-8 text-[#FFD700]" />
          <div><h1 className="section-title text-2xl">Socios Global Dorado</h1><p className="section-subtitle">Gestiona las fotos y perfiles de socios</p></div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><HiPlus className="w-4 h-4" /> Nuevo socio</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass rounded-3xl p-8 border border-[#FFD700]/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'Editar' : 'Nuevo'} Socio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Nombre</label><input className="input" placeholder="Nombre del socio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label">Rol / Cargo</label><input className="input" placeholder="Ej: Fundador, Líder, Mentor..." value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div><label className="label">Enlace (opcional)</label><input className="input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><label className="label">Foto del socio</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700]/10 file:text-[#FFD700] hover:file:bg-[#FFD700]/20" /></div>
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
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Socio</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Rol</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
              <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Acciones</th>
            </tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan={4} className="p-12 text-center text-gray-500">Cargando...</td></tr>) : partners.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-500"><HiPhotograph className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p>No hay socios registrados</p></td></tr>
              ) : partners.map((p) => (
                <tr key={p.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4"><div className="flex items-center gap-3">
                    {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFD700]/20" /> : <div className="w-10 h-10 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-full flex items-center justify-center text-black font-bold text-sm">{p.name.charAt(0)}</div>}
                    <span className="font-medium text-white">{p.name}</span>
                  </div></td>
                  <td className="p-4 text-gray-400 text-sm">{p.role || '—'}</td>
                  <td className="p-4"><span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>{p.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(p.id)} className="p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"><HiSwitchHorizontal className="w-4 h-4" /></button>
                      <button onClick={() => editPartner(p)} className="p-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => deletePartner(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
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
