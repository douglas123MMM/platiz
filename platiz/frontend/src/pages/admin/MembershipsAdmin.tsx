import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Membership } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiSearch, HiPhone, HiShieldCheck, HiRefresh } from 'react-icons/hi';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import MiniCalendar from '../../components/MiniCalendar';

const SERVICES = [
  'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Star+', 'Apple TV+', 'Paramount+', 'Crunchyroll', 'Spotify', 'YouTube Premium',
  'Canva Pro', 'Adobe CC', 'Figma Pro', 'Photoshop', 'Illustrator',
  'ChatGPT Plus', 'Gemini Advanced', 'Claude Pro', 'Midjourney', 'Perplexity Pro',
  'Google Drive', 'OneDrive', 'Dropbox', 'Mega',
  'NordVPN', 'ExpressVPN', 'Surfshark',
  'OnlyFans', 'Patreon',
  'Hosting', 'Dominio', 'VPS',
  'Otro'
];
const PROFILES = ['Perfil 1', 'Perfil 2', 'Perfil 3', 'Perfil 4', 'Perfil 5'];

const emptyForm = { service: '', account_email: '', account_password: '', profile: 'Perfil 1', client_name: '', client_phone: '', purchase_date: new Date().toISOString().split('T')[0], expiry_date: '', status: 'active' as 'active' | 'inactive', cost: '' };

export default function MembershipsAdmin() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [reminder, setReminder] = useState<{ show: boolean; membership: Membership | null; message: string }>({ show: false, membership: null, message: '' });

  const load = (term?: string) => {
    setLoading(true);
    const params = term ? `?search=${encodeURIComponent(term)}` : '';
    api.get(`/memberships${params}`).then((r) => setMemberships(r.data)).catch(() => toast.error('Error al cargar membresias')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 350); return () => clearTimeout(t); }, [search]);

  const totalEarnings = memberships.reduce((sum, m) => sum + (m.cost || 0), 0);

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service || !form.account_password || !form.client_name || !form.client_phone || !form.expiry_date) {
      toast.error('Completa todos los campos obligatorios'); return;
    }
    try {
      if (editing) {
        const { account_password, ...rest } = form;
        const payload = account_password === '[encrypted]' ? rest : form;
        await api.put(`/memberships/${editing.id}`, payload);
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

  const openReminder = (m: Membership) => {
    const defaultMsg = `Hola ${m.client_name}, te saludamos de tu proveedor de streaming. Te notificamos que tu membresia del servicio de ${m.service} ha vencido. Te gustaria renovarla para seguir disfrutando de tus pantallas? Quedamos atentos!`;
    setReminder({ show: true, membership: m, message: defaultMsg });
  };

  const sendWhatsApp = () => {
    if (!reminder.membership) return;
    const encoded = encodeURIComponent(reminder.message);
    window.open(`https://wa.me/${reminder.membership.client_phone}?text=${encoded}`, '_blank');
    setReminder({ show: false, membership: null, message: '' });
  };

  const handleEdit = (m: Membership) => {
    setEditing(m);
    setForm({
      service: m.service, account_email: m.account_email, account_password: m.account_password,
      profile: m.profile, client_name: m.client_name, client_phone: m.client_phone,
      purchase_date: m.purchase_date, expiry_date: m.expiry_date, status: m.status, cost: String(m.cost || '')
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
            <h1 className="text-2xl font-bold text-white">Membresias</h1>
            <p className="text-sm text-gray-500">{memberships.length} registros &middot; Total ganado: <span className="text-green-400 font-bold">${totalEarnings.toFixed(2)}</span></p>
          </div>
        </div>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 ${showForm ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#FFD700] text-black hover:bg-[#FFE44D] shadow-[0_4px_16px_rgba(255,215,0,0.15)]'}`}>
          {showForm ? 'Cancelar' : <><HiPlus className="w-5 h-5" /> Nueva Membresia</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-20 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => resetForm()}>
          <div className="w-full max-w-4xl my-auto" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 bg-[#0a0a0f] border border-[#FFD700]/10 space-y-5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-service">Servicio *</label>
              <input id="memb-service" type="text" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Ej: Netflix, Canva Pro, ChatGPT Plus..." list="service-list" required />
              <datalist id="service-list">{SERVICES.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-account-email">Credenciales de la cuenta</label>
              <input id="memb-account-email" type="text" value={form.account_email} onChange={(e) => setForm({ ...form, account_email: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Usuario, correo o codigo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-account-password">Contraseña *</label>
              <div className="relative">
                <input id="memb-account-password" type={showPassword ? 'text' : 'password'} value={form.account_password} onChange={(e) => setForm({ ...form, account_password: e.target.value })} className="w-full px-4 py-2.5 pr-12 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Clave de acceso" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors text-xs">
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-profile">Perfil</label>
              <select id="memb-profile" value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors">
                {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-client-name">Nombre del Cliente *</label>
              <input id="memb-client-name" type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="Nombre completo" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-client-phone">Telefono *</label>
              <input id="memb-client-phone" type="tel" value={formatPhone(form.client_phone)} onChange={(e) => setForm({ ...form, client_phone: e.target.value.replace(/[^\d+]/g, '') })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="+58 414 1234567" maxLength={15} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-cost">Costo ($)</label>
              <input id="memb-cost" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors" placeholder="0.00" step="0.01" min="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-purchase-date">Fecha de Compra</label>
              <MiniCalendar value={form.purchase_date} onChange={(d) => setForm({ ...form, purchase_date: d })} min="2020-01-01" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="memb-expiry-date">Fecha de Vencimiento *</label>
              <MiniCalendar value={form.expiry_date} onChange={(d) => setForm({ ...form, expiry_date: d })} min={form.purchase_date || undefined} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Estatus</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm({ ...form, status: 'active' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 ${form.status === 'active' ? 'bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)]' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:bg-white/[0.06]'}`}>Activo</button>
                <button type="button" onClick={() => setForm({ ...form, status: 'inactive' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 ${form.status === 'inactive' ? 'bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:bg-white/[0.06]'}`}>Inactivo</button>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto px-8 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 min-h-[50px]">
            {editing ? 'Actualizar Membresia' : 'Registrar Membresia'}
          </button>
        </form>
          </div>
        </div>
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
        <div className="space-y-3">
          {memberships.map((m) => {
            const isExpired = new Date(m.expiry_date + 'T12:00:00') < new Date();
            return (
              <div key={m.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5 hover:border-[#FFD700]/10 transition-colors duration-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{m.service}</p>
                      <span className="px-2 py-0.5 rounded-lg bg-white/[0.03] text-gray-500 text-[10px] border border-white/[0.06]">{m.profile}</span>
                    </div>
                    <p className="text-gray-300 text-sm font-medium">{m.client_name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="truncate max-w-[180px]">{m.account_email}</span>
                      <span className="flex items-center gap-1"><HiPhone className="w-3 h-3" />{m.client_phone}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className={`${isExpired ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>Vence: {new Date(m.expiry_date + 'T12:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[#FFD700] font-bold">${(m.cost || 0).toFixed(2)}</span>
                      <button onClick={() => { const newStatus = m.status === 'active' ? 'inactive' : 'active'; api.put(`/memberships/${m.id}`, { status: newStatus }).then(() => setMemberships((p) => p.map((x) => x.id === m.id ? { ...x, status: newStatus } : x))).catch(() => toast.error('Error')); }} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors duration-200 ${m.status === 'active' ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`} />
                        {m.status === 'active' ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                  <button onClick={() => openReminder(m)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 transition-colors duration-200 flex items-center justify-center gap-1.5 active:scale-[0.97]">
                    <HiPhone className="w-4 h-4" /> Recordatorio
                  </button>
                  <button onClick={() => handleEdit(m)} className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.03] text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 border border-white/[0.04] transition-colors duration-200 active:scale-[0.97]">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.03] text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.04] transition-colors duration-200 active:scale-[0.97]">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reminder.show && reminder.membership && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setReminder({ show: false, membership: null, message: '' })} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#0a0a0f] border border-[#FFD700]/15 rounded-2xl shadow-2xl shadow-black/60 p-6 animate-slide-down" role="dialog" aria-modal="true" aria-label="Enviar Recordatorio">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Enviar Recordatorio</h3>
                <button onClick={() => setReminder({ show: false, membership: null, message: '' })} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-white font-medium">{reminder.membership.client_name}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Servicio</p>
                  <p className="text-white font-medium">{reminder.membership.service}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Telefono</p>
                  <p className="text-white font-medium">{reminder.membership.client_phone}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Vencimiento</p>
                  <p className="text-white font-medium">{new Date(reminder.membership.expiry_date + 'T12:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Costo</p>
                  <p className="text-[#FFD700] font-bold">${(reminder.membership.cost || 0).toFixed(2)}</p>
                </div>
              </div>

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="reminder-message">Mensaje (puedes editarlo)</label>
              <textarea
                id="reminder-message"
                value={reminder.message}
                onChange={(e) => setReminder({ ...reminder, message: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFD700]/40 focus:outline-none transition-colors resize-none"
                rows={4}
              />

              <div className="flex gap-3 mt-5">
                <button onClick={() => setReminder({ show: false, membership: null, message: '' })}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors duration-200">
                  Cancelar
                </button>
                <button onClick={sendWhatsApp}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 shadow-[0_4px_16px_rgba(34,197,94,0.2)] transition-colors duration-200 flex items-center justify-center gap-2">
                  <HiPhone className="w-4 h-4" />
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
