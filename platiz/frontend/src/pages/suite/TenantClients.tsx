import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantClient } from '../../types';
import toast from 'react-hot-toast';

export default function TenantClients() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [clients, setClients] = useState<TenantClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    loadTenant();
  }, [slug]);

  useEffect(() => {
    if (tenant) loadClients();
  }, [tenant, search]);

  const loadTenant = async () => {
    try {
      const { data: tenants } = await api.get('/suite/tenants');
      const found = tenants.find((t: TenantSuite) => t.slug === slug);
      if (found) setTenant(found);
    } catch {
      /* tenant not found handled in UI */
    } finally {
      if (!tenant) setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/suite/tenants/${tenant.id}/clients${params}`);
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', company: '', notes: '', tags: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (c: TenantClient) => {
    setForm({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      notes: c.notes || '',
      tags: (c.tags || []).join(', '),
    });
    setEditingId(c.id);
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
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/suite/tenants/${tenant.id}/clients/${editingId}`, payload);
        toast.success('Cliente actualizado');
      } else {
        await api.post(`/suite/tenants/${tenant.id}/clients`, payload);
        toast.success('Cliente creado');
      }
      resetForm();
      loadClients();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (id: string) => {
    if (!tenant) return;
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/suite/tenants/${tenant.id}/clients/${id}`);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cliente eliminado');
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
          <span className="text-[#E5C158]">Clientes</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Nuevo Cliente
          </button>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.04] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                tab.label === 'Clientes'
                  ? 'text-[#E5C158] border-[#E5C158]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clientes..."
            className="w-full max-w-sm bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
          />
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
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block">
                  <span className="text-white/70 text-sm">Empresa</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
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
                <label className="block">
                  <span className="text-white/70 text-sm">Tags (separados por coma)</span>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="vip, frecuente, nuevo"
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                  />
                </label>
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
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Email</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Telefono</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Empresa</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="text-lg text-white mb-2">No hay clientes todavia</h3>
                      <p className="text-white/40 text-sm mb-4">Agrega tu primer cliente para empezar a gestionar tu CRM</p>
                      <button
                        onClick={openCreate}
                        className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition text-sm"
                      >
                        + Nuevo Cliente
                      </button>
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{c.name}</div>
                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-xs bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-white/50 text-sm">{c.email || '—'}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{c.phone || '—'}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{c.company || '—'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-[#E5C158]/10 text-[#E5C158] hover:bg-[#E5C158]/20 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteClient(c.id)}
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
