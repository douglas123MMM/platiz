import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantService, TenantProfessional } from '../../types';
import toast from 'react-hot-toast';

export default function TenantServices() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [services, setServices] = useState<TenantService[]>([]);
  const [professionals, setProfessionals] = useState<TenantProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servicios' | 'profesionales'>('servicios');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    specialty: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadTenant();
  }, [slug]);

  useEffect(() => {
    if (tenant) {
      if (activeTab === 'servicios') loadServices();
      else loadProfessionals();
    }
  }, [tenant, activeTab]);

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

  const loadServices = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/services`);
      setServices(Array.isArray(data) ? data : []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionals = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/professionals`);
      setProfessionals(Array.isArray(data) ? data : []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', duration_minutes: '', specialty: '', email: '', phone: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditService = (s: TenantService) => {
    setForm({
      name: s.name,
      description: s.description || '',
      price: s.price != null ? String(s.price) : '',
      duration_minutes: String(s.duration_minutes || ''),
      specialty: '',
      email: '',
      phone: '',
    });
    setEditingId(s.id);
    setShowModal(true);
  };

  const openEditProfessional = (p: TenantProfessional) => {
    setForm({
      name: p.name,
      description: '',
      price: '',
      duration_minutes: '',
      specialty: p.specialty || '',
      email: p.email || '',
      phone: p.phone || '',
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!tenant) return;
    setSaving(true);
    try {
      if (activeTab === 'servicios') {
        const payload = {
          name: form.name,
          description: form.description,
          price: form.price ? parseFloat(form.price) : undefined,
          duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : 30,
        };
        if (editingId) {
          await api.put(`/suite/tenants/${tenant.id}/services/${editingId}`, payload);
          toast.success('Servicio actualizado');
        } else {
          await api.post(`/suite/tenants/${tenant.id}/services`, payload);
          toast.success('Servicio creado');
        }
        loadServices();
      } else {
        const payload = {
          name: form.name,
          specialty: form.specialty,
          email: form.email,
          phone: form.phone,
        };
        if (editingId) {
          await api.put(`/suite/tenants/${tenant.id}/professionals/${editingId}`, payload);
          toast.success('Profesional actualizado');
        } else {
          await api.post(`/suite/tenants/${tenant.id}/professionals`, payload);
          toast.success('Profesional creado');
        }
        loadProfessionals();
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    if (!tenant) return;
    const endpoint = activeTab === 'servicios'
      ? `/suite/tenants/${tenant.id}/services/${id}`
      : `/suite/tenants/${tenant.id}/professionals/${id}`;
    try {
      await api.put(endpoint, { is_active: !currentActive });
      if (activeTab === 'servicios') {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !currentActive } : s)));
      } else {
        setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p)));
      }
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const deleteItem = async (id: string) => {
    if (!tenant) return;
    if (!confirm('¿Eliminar este elemento?')) return;
    try {
      if (activeTab === 'servicios') {
        await api.delete(`/suite/tenants/${tenant.id}/services/${id}`);
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        await api.delete(`/suite/tenants/${tenant.id}/professionals/${id}`);
        setProfessionals((prev) => prev.filter((p) => p.id !== id));
      }
      toast.success('Eliminado correctamente');
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

  const data = activeTab === 'servicios' ? services : professionals;

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
          <span className="text-[#E5C158]">Servicios</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Servicios y Profesionales</h1>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + {activeTab === 'servicios' ? 'Nuevo Servicio' : 'Nuevo Profesional'}
          </button>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.04] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                tab.label === 'Servicios'
                  ? 'text-[#E5C158] border-[#E5C158]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'servicios'
                ? 'bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/30'
                : 'bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white/70'
            }`}
          >
            Servicios
          </button>
          <button
            onClick={() => setActiveTab('profesionales')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'profesionales'
                ? 'bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/30'
                : 'bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white/70'
            }`}
          >
            Profesionales
          </button>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-lg bg-[#0a0a0f] border border-white/[0.04] rounded-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {editingId
                  ? `Editar ${activeTab === 'servicios' ? 'Servicio' : 'Profesional'}`
                  : `Nuevo ${activeTab === 'servicios' ? 'Servicio' : 'Profesional'}`}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-white/70 text-sm">Nombre *</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                    required
                  />
                </label>

                {activeTab === 'servicios' ? (
                  <>
                    <label className="block">
                      <span className="text-white/70 text-sm">Descripcion</span>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none resize-none"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-white/70 text-sm">Precio</span>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          min="0"
                          step="0.01"
                          className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-white/70 text-sm">Duracion (minutos)</span>
                        <input
                          type="number"
                          value={form.duration_minutes}
                          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                          min="1"
                          className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="text-white/70 text-sm">Especialidad</span>
                      <input
                        type="text"
                        value={form.specialty}
                        onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                        className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-white/70 text-sm">Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-white/70 text-sm">Telefono</span>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition flex-1"
                  >
                    {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
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
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Nombre</th>
                  {activeTab === 'servicios' ? (
                    <>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Descripcion</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Precio</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Duracion</th>
                    </>
                  ) : (
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Especialidad</th>
                  )}
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'servicios' ? 6 : 4} className="p-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'servicios' ? 6 : 4} className="p-12 text-center">
                      <div className="text-4xl mb-4">{activeTab === 'servicios' ? '💼' : '👨‍⚕️'}</div>
                      <h3 className="text-lg text-white mb-2">
                        {activeTab === 'servicios' ? 'No hay servicios todavia' : 'No hay profesionales todavia'}
                      </h3>
                      <p className="text-white/40 text-sm mb-4">
                        {activeTab === 'servicios'
                          ? 'Agrega servicios para que tus clientes puedan agendar'
                          : 'Agrega profesionales para asignar a los servicios'}
                      </p>
                      <button
                        onClick={openCreate}
                        className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition text-sm"
                      >
                        + {activeTab === 'servicios' ? 'Nuevo Servicio' : 'Nuevo Profesional'}
                      </button>
                    </td>
                  </tr>
                ) : activeTab === 'servicios' ? (
                  services.map((s) => (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{s.name}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{s.description || '—'}</td>
                      <td className="p-4 text-white text-sm">
                        {s.price != null ? `$${s.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{s.duration_minutes} min</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(s.id, s.is_active)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${s.is_active ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              s.is_active ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditService(s)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-[#E5C158]/10 text-[#E5C158] hover:bg-[#E5C158]/20 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteItem(s.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  professionals.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{p.name}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{p.specialty || '—'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(p.id, p.is_active)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${p.is_active ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              p.is_active ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProfessional(p)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-[#E5C158]/10 text-[#E5C158] hover:bg-[#E5C158]/20 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteItem(p.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          >
                            Eliminar
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
