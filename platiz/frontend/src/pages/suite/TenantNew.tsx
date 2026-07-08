import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Nombre', 'Subdominio', 'Logo', 'Colores', 'Herramientas', 'Revisar'];

const TOOLS_OPTIONS = [
  { slug: 'booking', label: 'Sistema de Citas', desc: 'Agenda online para tus clientes', icon: '📅' },
  { slug: 'crm', label: 'CRM', desc: 'Gestion de clientes y contactos', icon: '👥' },
  { slug: 'invoices', label: 'Facturacion', desc: 'Crea y envia facturas', icon: '📄' },
  { slug: 'chat_ia', label: 'Chat con IA', desc: 'Asistente inteligente para tu negocio', icon: '🤖' },
];

export default function TenantNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    subdomain: '',
    logo_url: '',
    primary_color: '#0A0A0A',
    secondary_color: '#D4AF37',
    accent_color: '#FFFFFF',
    tools: ['booking'] as string[],
  });

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && !form.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 40);
      setForm(prev => ({ ...prev, slug, subdomain: `${slug}.suite.globalservicex.com` }));
    }
  };

  const checkSlug = async () => {
    if (!form.slug) return;
    setCheckingSlug(true);
    try {
      const { data } = await api.get(`/suite/check-slug?slug=${encodeURIComponent(form.slug)}`);
      setSlugAvailable(data.available);
    } catch { setSlugAvailable(null); }
    finally { setCheckingSlug(false); }
  };

  const toggleTool = (slug: string) => {
    setForm(prev => {
      const tools = prev.tools.includes(slug)
        ? prev.tools.filter(t => t !== slug)
        : [...prev.tools, slug];
      return { ...prev, tools };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/suite/tenants', form);
      toast.success('Tenant creado exitosamente');
      navigate('/suite');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Crear Nuevo Espacio de Trabajo</h1>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= step ? 'bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black' : 'bg-white/[0.04] text-white/30'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'text-white' : 'text-white/30'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-[#E5C158]' : 'bg-white/[0.08]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-white/70 text-sm">Nombre del negocio *</span>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                  placeholder="Ej: Clinica Dental Sonrisa" />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-white/70 text-sm">Slug (identificador unico) *</span>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={form.slug} onChange={e => { update('slug', e.target.value); setSlugAvailable(null); }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                    placeholder="clinica-dental-sonrisa" />
                  <button onClick={checkSlug} disabled={checkingSlug || !form.slug}
                    className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 text-sm hover:bg-white/[0.08] disabled:opacity-40">
                    {checkingSlug ? '...' : 'Verificar'}
                  </button>
                </div>
                {slugAvailable === true && <p className="text-emerald-400 text-xs mt-1">Slug disponible</p>}
                {slugAvailable === false && <p className="text-red-400 text-xs mt-1">Slug no disponible</p>}
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Subdominio</span>
                <input type="text" value={form.subdomain} onChange={e => update('subdomain', e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none" />
              </label>
            </div>
          )}

          {step === 2 && (
            <label className="block">
              <span className="text-white/70 text-sm">URL del Logo</span>
              <input type="text" value={form.logo_url} onChange={e => update('logo_url', e.target.value)}
                className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                placeholder="https://ejemplo.com/logo.png" />
              {form.logo_url && (
                <div className="mt-3 p-4 bg-white/[0.02] rounded-lg inline-block">
                  <img src={form.logo_url} alt="Preview" className="max-h-16" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </label>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {[
                { label: 'Color Principal (fondo)', field: 'primary_color' },
                { label: 'Color Secundario (acento)', field: 'secondary_color' },
                { label: 'Color de Texto', field: 'accent_color' }
              ].map(c => (
                <label key={c.field} className="flex items-center gap-3">
                  <input type="color" value={(form as any)[c.field]} onChange={e => update(c.field, e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                  <span className="text-white/70 text-sm">{c.label}</span>
                  <code className="text-white/40 text-xs ml-auto">{(form as any)[c.field]}</code>
                </label>
              ))}
              <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: form.primary_color }}>
                <div className="text-sm font-semibold" style={{ color: form.secondary_color }}>Texto de ejemplo</div>
                <div className="text-xs mt-1" style={{ color: form.accent_color }}>Preview de colores</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-white/50 text-sm mb-2">Selecciona las herramientas para este tenant</p>
              {TOOLS_OPTIONS.map(t => (
                <div key={t.slug} onClick={() => toggleTool(t.slug)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    form.tools.includes(t.slug) ? 'border-[#E5C158]/40 bg-[#E5C158]/5' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <div className="text-white font-medium">{t.label}</div>
                      <div className="text-white/40 text-sm">{t.desc}</div>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded border-2 flex items-center justify-center ${
                      form.tools.includes(t.slug) ? 'border-[#E5C158] bg-[#E5C158]' : 'border-white/[0.15]'
                    }`}>
                      {form.tools.includes(t.slug) && <span className="text-black text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Resumen de tu espacio</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/50">Nombre</span>
                  <span className="text-white">{form.name || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/50">Slug</span>
                  <span className="text-white">{form.slug || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/50">Subdominio</span>
                  <span className="text-white">{form.subdomain || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/50">Herramientas</span>
                  <span className="text-white">{form.tools.map(t => TOOLS_OPTIONS.find(o => o.slug === t)?.label).join(', ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/50">Colores</span>
                  <div className="flex gap-2">
                    {[form.primary_color, form.secondary_color, form.accent_color].map(c => (
                      <div key={c} className="w-5 h-5 rounded border border-white/[0.1]" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 hover:bg-white/[0.08] disabled:opacity-30 transition">
            Anterior
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.name}
              className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition">
              Siguiente
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition">
              {loading ? 'Creando...' : 'Crear Espacio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
