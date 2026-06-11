import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Membership } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiSearch, HiPhone, HiShieldCheck, HiRefresh } from 'react-icons/hi';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import MiniCalendar from '../../components/MiniCalendar';

const SERVICES = ['Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Star+', 'Apple TV+', 'Paramount+', 'Crunchyroll', 'Spotify', 'YouTube Premium', 'Otro'];
const PROFILES = ['Perfil 1', 'Perfil 2', 'Perfil 3', 'Perfil 4', 'Perfil 5'];

const emptyForm = { service: '', account_email: '', account_password: '', profile: 'Perfil 1', client_name: '', client_phone: '', purchase_date: new Date().toISOString().split('T')[0], expiry_date: '', status: 'active' as 'active' | 'inactive' };

export default function MembershipsAdmin() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = (term?: string) => {
    setLoading(true);
    const params = term ? `?search=${encodeURIComponent(term)}` : '';
    api.get(`/memberships${params}`).then((r) => setMemberships(r.data)).catch(() => toast.error('Error al cargar membresias')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 350); return () => clearTimeout(t); }, [search]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service || !form.account_email || !form.account_password || !form.client_name || !form.client_phone || !form.expiry_date) {
      toast.error('Completa todos los campos obligatorios'); return;
    }
    try {
      if (editing) {
        await api.put(`/memberships/${editing.id}`, form);
        toast.success('Membresia actualizada');
      } else {
        await api.post('/memberships', form);
        toast.success('Membresia registrada');
      }
      resetForm();
      load(search);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminar esta membresia?')) return;
    try {
      await api.delete(`/memberships/${id}`);
      setMemberships((p) => p.filter((m) => m.id !== id));
      toast.success('Eliminada');
    } catch { toast.error('Error al eliminar'); }
  };

  const handleReminder = async (m: Membership) => {
    try {
      const { data } = await api.get(`/memberships/${m.id}/reminder`);
      window.open(data.url, '_blank');
    } catch { toast.error('Error al generar enlace'); }
  };

  const handleEdit = (m: Membership) => {
    setEditing(m);
    setForm({
      service: m.service, account_email: m.account_email, account_password: m.account_password,
      profile: m.profile, client_name: m.client_name, client_phone: m.client_phone,
      purchase_date: m.purchase_date, expiry_date: m.expiry_date, status: m.status
    });
    setShowForm(true);
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '').replace(/^0+/, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length <= 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3-$4');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <HiOutlineDevicePhoneMobile className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Membresias Streaming</h1>
            <p className="text-sm text-gray-500">{memberships.length} registros</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (editing) resetForm(); }} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${showForm ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#FFD700] text-black hover:bg-[#FFE44D] shadow-[0_4px_16px_rgba(255,215,0,0.15)]'}`}>
          {showForm ? 'Cancelar' : <><HiPlus className="w-5 h-5" /> Nueva Membresia</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.05] space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Servicio *</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" required>
                <option value="" disabled>Seleccionar servicio</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Correo de la cuenta *</label>
              <input type="email" value={form.account_email} onChange={(e) => setForm({ ...form, account_email: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="cuenta@email.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
              <input type="text" value={form.account_password} onChange={(e) => setForm({ ...form, account_password: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Clave de acceso" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Perfil</label>
              <select value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors">
                {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre del Cliente *</label>
              <input type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Nombre completo" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Telefono *</label>
              <input type="tel" value={formatPhone(form.client_phone)} onChange={(e) => setForm({ ...form, client_phone: e.target.value.replace(/[^\d+]/g, '') })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="+58 414 1234567" maxLength={15} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Fecha de Compra</label>
              <MiniCalendar value={form.purchase_date} onChange={(d) => setForm({ ...form, purchase_date: d })} min="2020-01-01" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Fecha de Vencimiento *</label>
              <MiniCalendar value={form.expiry_date} onChange={(d) => setForm({ ...form, expiry_date: d })} min={form.purchase_date || undefined} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Estatus</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm({ ...form, status: 'active' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${form.status === 'active' ? 'bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)]' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:bg-white/[0.06]'}`}>Activo</button>
                <button type="button" onClick={() => setForm({ ...form, status: 'inactive' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${form.status === 'inactive' ? 'bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:bg-white/[0.06]'}`}>Inactivo</button>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto px-8 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 min-h-[50px]">
            {editing ? 'Actualizar Membresia' : 'Registrar Membresia'}
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <HiSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <input type="text" placeholder="Buscar por nombre, servicio, email o telefono..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full" />
        <button onClick={() => load(search)} className="p-2 rounded-lg hover:bg-[#FFD700]/5 text-gray-400 hover:text-[#FFD700] transition-colors"><HiRefresh className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" /></div>
      ) : memberships.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <HiShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium">Sin membresias registradas</p>
          <p className="text-sm">Registra tu primera membresia de streaming</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.04]">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Correo</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Perfil</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell"><HiPhone className="w-4 h-4 inline mr-1" />Telefono</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell"><svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/></svg>Vence</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {memberships.map((m) => {
                const isExpired = new Date(m.expiry_date) < new Date();
                return (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{m.service}</p>
                      <p className="text-xs text-gray-500 md:hidden">{m.account_email}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-gray-300 text-sm truncate max-w-[180px]">{m.account_email}</p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-gray-400 text-xs border border-white/[0.06]">{m.profile}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{m.client_name}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-400 text-sm">{m.client_phone}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-sm ${isExpired ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>{new Date(m.expiry_date + 'T12:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => { const newStatus = m.status === 'active' ? 'inactive' : 'active'; api.put(`/memberships/${m.id}`, { status: newStatus }).then(() => setMemberships((p) => p.map((x) => x.id === m.id ? { ...x, status: newStatus } : x))).catch(() => toast.error('Error')); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${m.status === 'active' ? 'bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 shadow-[0_0_10px_rgba(34,197,94,0.15)]' : 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.15)]'}`}>
                        <span className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`} />
                        {m.status === 'active' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleReminder(m)} title="Enviar Recordatorio de Vencimiento" className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 transition-all duration-200" type="button"><HiPhone className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(m)} className="p-2 rounded-lg bg-white/[0.03] text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-all duration-200 opacity-0 group-hover:opacity-100" type="button"><HiPencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-white/[0.03] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100" type="button"><HiTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
