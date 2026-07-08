import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantTool } from '../../types';
import toast from 'react-hot-toast';

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  booking: { label: 'Sistema de Citas', icon: '📅' },
  crm: { label: 'CRM', icon: '👥' },
  invoices: { label: 'Facturacion', icon: '📄' },
  projects: { label: 'Proyectos', icon: '📋' },
  chat_ia: { label: 'Chat con IA', icon: '🤖' },
};

export default function TenantConfig() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [tools, setTools] = useState<TenantTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    primary_color: '#0A0A0A',
    secondary_color: '#D4AF37',
    accent_color: '#FFFFFF',
    is_active: true,
  });

  useEffect(() => {
    loadTenant();
  }, [slug]);

  const loadTenant = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data: tenants } = await api.get('/suite/tenants');
      const found = tenants.find((t: TenantSuite) => t.slug === slug);
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTenant(found);
      setForm({
        name: found.name,
        logo_url: found.logo_url || '',
        primary_color: found.primary_color || '#0A0A0A',
        secondary_color: found.secondary_color || '#D4AF37',
        accent_color: found.accent_color || '#FFFFFF',
        is_active: found.is_active,
      });
      loadTools(found.id);
    } catch {
      setLoading(false);
    }
  };

  const loadTools = async (tenantId: string) => {
    try {
      const { data } = await api.get(`/suite/tenants/${tenantId}/tools`);
      setTools(Array.isArray(data) ? data : []);
    } catch {
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      await api.put(`/suite/tenants/${tenant.id}`, form);
      toast.success('Configuracion guardada');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar configuracion');
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = async (tool: TenantTool) => {
    if (!tenant) return;
    const prevActive = tool.is_active;
    setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, is_active: !prevActive } : t)));
    try {
      await api.patch(`/suite/tenants/${tenant.id}/tools`, {
        tool_id: tool.id,
        tool_slug: tool.tool_slug,
        is_active: !prevActive,
      });
    } catch {
      setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, is_active: prevActive } : t)));
      toast.error('Error al actualizar herramienta');
    }
  };

  const handleDelete = async () => {
    if (!tenant) return;
    if (!confirm(`¿Eliminar "${tenant.name}" para siempre? Esta accion no se puede deshacer.`)) return;
    try {
      await api.delete(`/suite/tenants/${tenant.id}`);
      toast.success('Tenant eliminado');
      navigate('/suite');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !tenant) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-12 text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg text-white mb-2">Tenant no encontrado</h2>
          <p className="text-white/40 mb-4">No se encontro un espacio con el slug "{slug}"</p>
          <Link
            to="/suite"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            Volver a Suite
          </Link>
        </div>
      </div>
    );
  }

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
          <span className="text-white/60">{tenant.name}</span>
          <span className="mx-2">›</span>
          <span className="text-[#E5C158]">Configuracion</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-black font-bold text-lg">
              {tenant.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
            <p className="text-white/40 text-sm">{tenant.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-8 border-b border-white/[0.04] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                tab.label === 'Configuracion'
                  ? 'text-[#E5C158] border-[#E5C158]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informacion General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-white/70 text-sm">Nombre del negocio</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">URL del Logo</span>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => updateField('logo_url', e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                  placeholder="https://..."
                />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Color Principal (fondo)</span>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => updateField('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <code className="text-white/40 text-xs">{form.primary_color}</code>
                </div>
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Color Secundario (acento)</span>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => updateField('secondary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <code className="text-white/40 text-xs">{form.secondary_color}</code>
                </div>
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Color de Texto</span>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <code className="text-white/40 text-xs">{form.accent_color}</code>
                </div>
              </label>
              <label className="flex items-center gap-4 mt-2">
                <span className="text-white/70 text-sm">Activo</span>
                <button
                  type="button"
                  onClick={() => updateField('is_active', !form.is_active)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_active ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: form.primary_color || '#0A0A0A' }}>
              <div className="text-sm font-semibold" style={{ color: form.secondary_color || '#D4AF37' }}>
                Vista previa de texto
              </div>
              <div className="text-xs mt-1" style={{ color: form.accent_color || '#FFFFFF' }}>
                Preview de colores del tenant
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Herramientas Activas</h2>
            <div className="space-y-3">
              {tools.length === 0 ? (
                <p className="text-white/40 text-sm">No hay herramientas disponibles para este tenant.</p>
              ) : (
                tools.map((tool) => {
                  const info = TOOL_LABELS[tool.tool_slug] || { label: tool.tool_slug, icon: '🔧' };
                  return (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <div className="text-white font-medium">{info.label}</div>
                          <div className="text-white/30 text-xs capitalize">{tool.tool_slug}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTool(tool)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          tool.is_active ? 'bg-emerald-500' : 'bg-white/[0.1]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            tool.is_active ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-red-500/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Zona de Peligro</h2>
            <p className="text-white/40 text-sm mb-4">
              Una vez que elimines este tenant, no hay vuelta atras. Se perdera toda la informacion de clientes, citas,
              servicios y facturas asociados.
            </p>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm"
            >
              Eliminar este tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
