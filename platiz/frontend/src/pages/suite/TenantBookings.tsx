import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantBooking, TenantService, TenantProfessional } from '../../types';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function TenantBookings() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [services, setServices] = useState<TenantService[]>([]);
  const [professionals, setProfessionals] = useState<TenantProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    service_id: '',
    professional_id: '',
    date: '',
    time: '',
    duration_minutes: '30',
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
  });

  useEffect(() => {
    loadTenant();
  }, [slug]);

  const loadTenant = async () => {
    try {
      const { data: tenants } = await api.get('/suite/tenants');
      const found = tenants.find((t: TenantSuite) => t.slug === slug);
      if (found) {
        setTenant(found);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      loadBookings();
      loadServices();
      loadProfessionals();
    }
  }, [tenant, filterDate, filterStatus]);

  const loadBookings = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterStatus && filterStatus !== 'todas') params.append('status', filterStatus);
      const qs = params.toString();
      const { data } = await api.get(`/suite/tenants/${tenant.id}/bookings${qs ? `?${qs}` : ''}`);
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    if (!tenant) return;
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/services`);
      setServices(Array.isArray(data) ? data : []);
    } catch {
      setServices([]);
    }
  };

  const loadProfessionals = async () => {
    if (!tenant) return;
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/professionals`);
      setProfessionals(Array.isArray(data) ? data : []);
    } catch {
      setProfessionals([]);
    }
  };

  const resetForm = () => {
    setForm({
      service_id: '',
      professional_id: '',
      date: '',
      time: '',
      duration_minutes: '30',
      client_name: '',
      client_email: '',
      client_phone: '',
      notes: '',
    });
    setShowModal(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.date || !form.time) {
      toast.error('Completa los campos requeridos (nombre, fecha, hora)');
      return;
    }
    if (!tenant) return;
    setSaving(true);
    const selectedService = services.find((s) => s.id === form.service_id);
    const selectedProf = professionals.find((p) => p.id === form.professional_id);
    const payload = {
      service_id: form.service_id || undefined,
      professional_id: form.professional_id || undefined,
      service: selectedService?.name || 'Servicio',
      service_price: selectedService?.price,
      professional: selectedProf?.name,
      date: form.date,
      time: form.time,
      duration_minutes: parseInt(form.duration_minutes) || 30,
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone,
      notes: form.notes,
    };
    try {
      await api.post(`/suite/tenants/${tenant.id}/bookings`, payload);
      toast.success('Cita creada');
      resetForm();
      loadBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear cita');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (booking: TenantBooking, newStatus: string) => {
    if (!tenant) return;
    try {
      await api.put(`/suite/tenants/${tenant.id}/bookings/${booking.id}`, { status: newStatus });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus as TenantBooking['status'] } : b)));
      toast.success(`Cita ${STATUS_LABEL[newStatus]?.toLowerCase()}`);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!tenant) return;
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await api.delete(`/suite/tenants/${tenant.id}/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success('Cita eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const tabs = [
    { label: 'Configuracion', href: `/suite/tenants/${slug}` },
    { label: 'Clientes', href: `/suite/tenants/${slug}/clientes` },
    { label: 'Citas', href: `/suite/tenants/${slug}/citas` },
    { label: 'Servicios', href: `/suite/tenants/${slug}/servicios` },
    { label: 'Facturacion', href: `/suite/tenants/${slug}/facturacion` },
  ];

  const filteredBookings = bookings;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-white/30 text-sm mb-4">
          <Link to="/suite" className="hover:text-[#E5C158] transition">Suite</Link>
          <span className="mx-2">›</span>
          <Link to={`/suite/tenants/${slug}`} className="hover:text-[#E5C158] transition">
            {tenant?.name || slug}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#E5C158]">Citas</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Citas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Nueva Cita
          </button>
        </div>

        <div className="flex items-center gap-1 mb-4 border-b border-white/[0.04] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                tab.label === 'Citas'
                  ? 'text-[#E5C158] border-[#E5C158]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
          >
            <option value="todas" className="bg-[#0a0a0f]">Todas</option>
            <option value="pending" className="bg-[#0a0a0f]">Pendiente</option>
            <option value="confirmed" className="bg-[#0a0a0f]">Confirmada</option>
            <option value="completed" className="bg-[#0a0a0f]">Completada</option>
            <option value="cancelled" className="bg-[#0a0a0f]">Cancelada</option>
          </select>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-lg bg-[#0a0a0f] border border-white/[0.04] rounded-xl p-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Nueva Cita</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-white/70 text-sm">Servicio</span>
                    <select
                      value={form.service_id}
                      onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    >
                      <option value="" className="bg-[#0a0a0f]">Seleccionar servicio</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0a0a0f]">
                          {s.name} {s.price != null ? `($${s.price})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Profesional</span>
                    <select
                      value={form.professional_id}
                      onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    >
                      <option value="" className="bg-[#0a0a0f]">Seleccionar profesional</option>
                      {professionals.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0a0a0f]">
                          {p.name} {p.specialty ? `(${p.specialty})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-white/70 text-sm">Fecha *</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Hora *</span>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Duracion (min)</span>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                      min="5"
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-white/70 text-sm">Nombre del cliente *</span>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Email</span>
                    <input
                      type="email"
                      value={form.client_email}
                      onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-white/70 text-sm">Telefono</span>
                  <input
                    type="text"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-white/70 text-sm">Notas</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none resize-none"
                  />
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition flex-1"
                  >
                    {saving ? 'Guardando...' : 'Crear Cita'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 hover:bg-white/[0.08] transition flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Cliente</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Servicio</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Profesional</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Fecha</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Hora</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="text-4xl mb-4">📅</div>
                      <h3 className="text-lg text-white mb-2">No hay citas todavia</h3>
                      <p className="text-white/40 text-sm mb-4">Agenda la primera cita para este tenant</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition text-sm"
                      >
                        + Nueva Cita
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{b.client_name || '—'}</div>
                        {b.client_email && <div className="text-white/30 text-xs">{b.client_email}</div>}
                      </td>
                      <td className="p-4 text-white/70 text-sm hidden md:table-cell">
                        {b.service}
                        {b.service_price != null && <div className="text-white/30 text-xs">${b.service_price}</div>}
                      </td>
                      <td className="p-4 text-white/70 text-sm hidden md:table-cell">{b.professional || '—'}</td>
                      <td className="p-4 text-white/70 text-sm">{b.date}</td>
                      <td className="p-4 text-white/70 text-sm">{b.time}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[b.status] || STATUS_BADGE.pending}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(b, 'confirmed')}
                              className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                            >
                              Confirmar
                            </button>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button
                              onClick={() => updateStatus(b, 'completed')}
                              className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                            >
                              Completar
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(b, 'cancelled')}
                              className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition ml-1"
                          >
                            x
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
