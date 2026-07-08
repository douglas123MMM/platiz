import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantTool, TenantBooking, TenantClient, TenantService, TenantProfessional } from '../../types';
import toast from 'react-hot-toast';

const TOOL_INFO: Record<string, { label: string; icon: string; desc: string; path: string }> = {
  booking: { label: 'Citas', icon: '📅', desc: 'Agenda online para tus clientes', path: 'citas' },
  crm: { label: 'Clientes', icon: '👥', desc: 'Gestiona tus contactos', path: 'clientes' },
  invoices: { label: 'Facturacion', icon: '💰', desc: 'Facturas profesionales', path: 'facturacion' },
  projects: { label: 'Proyectos', icon: '📋', desc: 'Gestion de proyectos', path: '' },
  chat_ia: { label: 'Chat IA', icon: '🤖', desc: 'Asistente inteligente', path: '' },
};

export default function TenantConfig() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [tools, setTools] = useState<TenantTool[]>([]);
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [clients, setClients] = useState<TenantClient[]>([]);
  const [services, setServices] = useState<TenantService[]>([]);
  const [professionals, setProfessionals] = useState<TenantProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    (async () => {
      try {
        const { data: list } = await api.get('/suite/tenants');
        const t = list.find((t: TenantSuite) => t.slug === slug);
        if (!t) { setNotFound(true); setLoading(false); return; }
        setTenant(t);

        const [toolsRes, bookingsRes, clientsRes, servicesRes, prosRes] = await Promise.all([
          api.get(`/suite/tenants/${t.id}/tools`),
          api.get(`/suite/tenants/${t.id}/bookings`),
          api.get(`/suite/tenants/${t.id}/clients`),
          api.get(`/suite/tenants/${t.id}/services`),
          api.get(`/suite/tenants/${t.id}/professionals`),
        ]);

        setTools(toolsRes.data || []);
        setBookings(bookingsRes.data || []);
        setClients(clientsRes.data || []);
        setServices(servicesRes.data || []);
        setProfessionals(prosRes.data || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const toggleTool = async (toolSlug: string, current: boolean) => {
    if (!tenant) return;
    try {
      await api.patch(`/suite/tenants/${tenant.id}/tools`, { tool_slug: toolSlug, is_active: !current });
      setTools(prev => prev.map(t => t.tool_slug === toolSlug ? { ...t, is_active: !current } : t));
      toast.success(current ? 'Desactivado' : 'Activado');
    } catch { toast.error('Error'); }
  };

  const toggleActive = async () => {
    if (!tenant) return;
    try {
      await api.put(`/suite/tenants/${tenant.id}`, { is_active: !tenant.is_active });
      setTenant({ ...tenant, is_active: !tenant.is_active });
      toast.success(tenant.is_active ? 'Desactivado' : 'Activado');
    } catch { toast.error('Error'); }
  };

  const deleteTenant = async () => {
    if (!tenant || !confirm('Estas seguro? Se eliminara todo.')) return;
    try {
      await api.delete(`/suite/tenants/${tenant.id}`);
      toast.success('Eliminado');
      navigate('/suite');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" /></div>;
  if (notFound || !tenant) return <div className="min-h-screen bg-[#0a0a0f] p-6 text-center"><p className="text-white/40 text-lg">Espacio no encontrado</p><Link to="/suite" className="text-[#E5C158] mt-4 inline-block">Volver</Link></div>;

  const activeTools = tools.filter(t => t.is_active);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/suite" className="text-white/30 hover:text-white/60">← Suite</Link>
          <span className="text-white/20">/</span>
          <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs ${tenant.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {tenant.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {['resumen','citas','clientes','servicios','facturacion'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition capitalize ${
                activeTab === tab ? 'bg-[#E5C158]/15 text-[#E5C158] border border-[#E5C158]/30' : 'text-white/40 hover:text-white/60'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { v: activeTools.length, l: 'Herramientas activas', i: '🔧' },
                { v: clients.length, l: 'Clientes', i: '👥' },
                { v: bookings.length, l: 'Citas totales', i: '📅' },
                { v: pendingBookings, l: 'Pendientes', i: '⏳' },
              ].map(s => (
                <div key={s.l} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.i}</div>
                  <div className="text-2xl font-bold text-white">{s.v}</div>
                  <div className="text-white/40 text-xs">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Tu pagina publica</h2>
              <div className="flex items-center gap-3 mb-4">
                <code className="flex-1 bg-white/[0.04] rounded-lg px-4 py-3 text-[#E5C158] text-sm break-all">
                  globalservicex.com/suite/{tenant.slug}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(`https://globalservicex.com/suite/${tenant.slug}`); toast.success('Copiado'); }}
                  className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-sm hover:bg-white/[0.08]"
                >
                  Copiar
                </button>
              </div>
              <p className="text-white/40 text-sm">
                Comparti este link con los clientes de {tenant.name}. Ahi pueden ver los servicios y agendar citas.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Herramientas</h2>
              <div className="space-y-3">
                {tools.map(t => {
                  const info = TOOL_INFO[t.tool_slug] || { label: t.tool_slug, icon: '🔧', desc: '', path: '' };
                  return (
                    <div key={t.tool_slug} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.01]">
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{info.label}</div>
                        <div className="text-white/30 text-sm">{info.desc}</div>
                      </div>
                      <button
                        onClick={() => toggleTool(t.tool_slug, t.is_active)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${t.is_active ? 'bg-[#E5C158]' : 'bg-white/[0.08]'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${t.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.04]">
              <button onClick={toggleActive} className="text-white/40 text-sm hover:text-white/60 mr-6">
                {tenant.is_active ? 'Desactivar espacio' : 'Activar espacio'}
              </button>
              <button onClick={deleteTenant} className="text-red-400/60 text-sm hover:text-red-400">
                Eliminar espacio
              </button>
            </div>
          </div>
        )}

        {activeTab === 'citas' && (
          <BookingsTab tenantId={tenant.id} bookings={bookings} services={services} professionals={professionals}
            onRefresh={() => { api.get(`/suite/tenants/${tenant.id}/bookings`).then(r => setBookings(r.data || [])); }} />
        )}

        {activeTab === 'clientes' && (
          <ClientsTab tenantId={tenant.id} clients={clients}
            onRefresh={() => { api.get(`/suite/tenants/${tenant.id}/clients`).then(r => setClients(r.data || [])); }} />
        )}

        {activeTab === 'servicios' && (
          <ServicesTab tenantId={tenant.id} services={services} professionals={professionals}
            onRefresh={() => {
              api.get(`/suite/tenants/${tenant.id}/services`).then(r => setServices(r.data || []));
              api.get(`/suite/tenants/${tenant.id}/professionals`).then(r => setProfessionals(r.data || []));
            }} />
        )}

        {activeTab === 'facturacion' && (
          <InvoicesTab tenantId={tenant.id} clients={clients}
            onRefresh={() => {}} />
        )}
      </div>
    </div>
  );
}

// ======== SUBCOMPONENTES SIMPLES ========

function BookingsTab({ tenantId, bookings, services, professionals, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ service_id: '', professional_id: '', client_name: '', client_phone: '', date: '', time: '', notes: '' });

  const handleCreate = async () => {
    const svc = services.find((s: any) => s.id === form.service_id);
    const pro = professionals.find((p: any) => p.id === form.professional_id);
    if (!svc || !form.date || !form.time) { toast.error('Completa servicio, fecha y hora'); return; }
    try {
      await api.post(`/suite/tenants/${tenantId}/bookings`, {
        service: svc.name, service_price: svc.price, service_id: form.service_id,
        professional: pro?.name, professional_id: form.professional_id || null,
        client_name: form.client_name, client_phone: form.client_phone,
        date: form.date, time: form.time, notes: form.notes, duration_minutes: svc.duration_minutes
      });
      toast.success('Cita agendada'); setShowForm(false); onRefresh();
    } catch { toast.error('Error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await api.put(`/suite/tenants/${tenantId}/bookings/${id}`, { status }); toast.success('Actualizado'); onRefresh(); }
    catch { toast.error('Error'); }
  };

  const statusColor = (s: string) => s === 'confirmed' ? 'bg-blue-500/10 text-blue-400' : s === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : s === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Citas ({bookings.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">
          + Nueva Cita
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.service_id} onChange={e => setForm({...form, service_id: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm">
              <option value="">Servicio</option>
              {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
            </select>
            <select value={form.professional_id} onChange={e => setForm({...form, professional_id: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm">
              <option value="">Profesional (opcional)</option>
              {professionals.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="text" placeholder="Nombre del cliente" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="text" placeholder="Telefono" value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="text" placeholder="Notas (opcional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="md:col-span-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-white/30 text-center py-12">No hay citas todavia. Crea la primera.</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{b.service}</div>
                  <div className="text-white/40 text-sm">{b.client_name || 'Sin nombre'} • {b.date} • {b.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(b.status)} capitalize`}>{b.status}</span>
                  <select value="" onChange={e => e.target.value && updateStatus(b.id, e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-white/60 text-xs">
                    <option value="">Cambiar</option>
                    {b.status !== 'confirmed' && <option value="confirmed">Confirmar</option>}
                    {b.status !== 'completed' && <option value="completed">Completar</option>}
                    {b.status !== 'cancelled' && <option value="cancelled">Cancelar</option>}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsTab({ tenantId, clients, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });

  const handleCreate = async () => {
    if (!form.name) { toast.error('Nombre requerido'); return; }
    try { await api.post(`/suite/tenants/${tenantId}/clients`, form); toast.success('Cliente agregado'); setShowForm(false); setForm({ name: '', email: '', phone: '', company: '' }); onRefresh(); }
    catch { toast.error('Error'); }
  };

  const filtered = search ? clients.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase())) : clients;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Clientes ({clients.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">+ Nuevo</button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="text" placeholder="Telefono" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="text" placeholder="Empresa" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm mb-4 focus:border-[#E5C158]/50 focus:outline-none" />

      {filtered.length === 0 ? (
        <p className="text-white/30 text-center py-12">{search ? 'Sin resultados' : 'No hay clientes todavia'}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{c.name}</div>
                <div className="text-white/40 text-sm">{c.email || c.phone || 'Sin contacto'}{c.company ? ` • ${c.company}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesTab({ tenantId, services, professionals, onRefresh }: any) {
  const [showService, setShowService] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [svcForm, setSvcForm] = useState({ name: '', description: '', price: '', duration_minutes: '60' });
  const [proForm, setProForm] = useState({ name: '', specialty: '', email: '', phone: '' });

  const createService = async () => {
    if (!svcForm.name) { toast.error('Nombre requerido'); return; }
    try {
      await api.post(`/suite/tenants/${tenantId}/services`, { ...svcForm, price: parseFloat(svcForm.price) || 0, duration_minutes: parseInt(svcForm.duration_minutes) || 60 });
      toast.success('Servicio creado'); setShowService(false); setSvcForm({ name: '', description: '', price: '', duration_minutes: '60' }); onRefresh();
    } catch { toast.error('Error'); }
  };

  const createPro = async () => {
    if (!proForm.name) { toast.error('Nombre requerido'); return; }
    try {
      await api.post(`/suite/tenants/${tenantId}/professionals`, proForm);
      toast.success('Profesional agregado'); setShowPro(false); setProForm({ name: '', specialty: '', email: '', phone: '' }); onRefresh();
    } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Servicios ({services.length})</h2>
          <button onClick={() => setShowService(!showService)} className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">+ Agregar</button>
        </div>
        {showService && (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre *" value={svcForm.name} onChange={e => setSvcForm({...svcForm, name: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="number" placeholder="Precio $" value={svcForm.price} onChange={e => setSvcForm({...svcForm, price: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="number" placeholder="Duracion (minutos)" value={svcForm.duration_minutes} onChange={e => setSvcForm({...svcForm, duration_minutes: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="text" placeholder="Descripcion" value={svcForm.description} onChange={e => setSvcForm({...svcForm, description: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createService} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">Guardar</button>
              <button onClick={() => setShowService(false)} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        )}
        {services.length === 0 ? <p className="text-white/30 text-sm">Sin servicios</p> : (
          <div className="space-y-2">
            {services.map((s: any) => (
              <div key={s.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{s.name}</div>
                  <div className="text-white/40 text-sm">{s.duration_minutes} min • {s.description || 'Sin descripcion'}</div>
                </div>
                <div className="text-[#E5C158] font-bold">${s.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Profesionales ({professionals.length})</h2>
          <button onClick={() => setShowPro(!showPro)} className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">+ Agregar</button>
        </div>
        {showPro && (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre *" value={proForm.name} onChange={e => setProForm({...proForm, name: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="text" placeholder="Especialidad" value={proForm.specialty} onChange={e => setProForm({...proForm, specialty: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="email" placeholder="Email" value={proForm.email} onChange={e => setProForm({...proForm, email: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
              <input type="text" placeholder="Telefono" value={proForm.phone} onChange={e => setProForm({...proForm, phone: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createPro} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">Guardar</button>
              <button onClick={() => setShowPro(false)} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        )}
        {professionals.length === 0 ? <p className="text-white/30 text-sm">Sin profesionales</p> : (
          <div className="space-y-2">
            {professionals.map((p: any) => (
              <div key={p.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{p.name}</div>
                  <div className="text-white/40 text-sm">{p.specialty || 'Sin especialidad'}</div>
                </div>
                <span className="text-white/20 text-sm">{p.email || p.phone}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InvoicesTab({ tenantId, clients }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: '', concept: '', amount: '' });

  useEffect(() => {
    api.get(`/suite/tenants/${tenantId}/invoices`).then(r => setInvoices(r.data || []));
  }, [tenantId]);

  const createInvoice = async () => {
    if (!form.concept || !form.amount) { toast.error('Completa concepto y monto'); return; }
    const amount = parseFloat(form.amount);
    try {
      await api.post(`/suite/tenants/${tenantId}/invoices`, {
        client_id: form.client_id || null,
        subtotal: amount,
        total: amount,
        tax: 0,
      });
      toast.success('Factura creada'); setShowForm(false); setForm({ client_id: '', concept: '', amount: '' });
      api.get(`/suite/tenants/${tenantId}/invoices`).then(r => setInvoices(r.data || []));
    } catch { toast.error('Error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await api.put(`/suite/tenants/${tenantId}/invoices/${id}`, { status }); toast.success('Actualizado'); api.get(`/suite/tenants/${tenantId}/invoices`).then(r => setInvoices(r.data || [])); }
    catch { toast.error('Error'); }
  };

  const stColor = (s: string) => s === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : s === 'sent' ? 'bg-blue-500/10 text-blue-400' : s === 'overdue' ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.04] text-white/40';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Facturas ({invoices.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">+ Nueva</button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm">
              <option value="">Cliente (opcional)</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Concepto *" value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
            <input type="number" placeholder="Monto $" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={createInvoice} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {invoices.length === 0 ? <p className="text-white/30 text-center py-12">No hay facturas todavia</p> : (
        <div className="space-y-2">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{inv.invoice_number}</div>
                <div className="text-white/40 text-sm">{inv.issue_date} • Vence: {inv.due_date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#E5C158] font-bold">${inv.total}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${stColor(inv.status)}`}>{inv.status}</span>
                <select value="" onChange={e => e.target.value && updateStatus(inv.id, e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-white/60 text-xs">
                  <option value="">Cambiar</option>
                  {inv.status === 'draft' && <option value="sent">Enviada</option>}
                  {['draft','sent'].includes(inv.status) && <option value="paid">Pagada</option>}
                  {inv.status !== 'cancelled' && <option value="cancelled">Cancelar</option>}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
