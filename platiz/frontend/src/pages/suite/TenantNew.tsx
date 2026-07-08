import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Nombre y URL', 'Personalizar', 'Herramientas'];

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
    primary_color: '#0A0A0A',
    secondary_color: '#D4AF37',
    tools: ['booking', 'crm'] as string[],
  });

  const update = (field: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !prev.slug) {
        const slug = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 40);
        return { ...next, slug, subdomain: `${slug}.suite.globalservicex.com` };
      }
      return next;
    });
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
    setForm(prev => ({
      ...prev,
      tools: prev.tools.includes(slug)
        ? prev.tools.filter(t => t !== slug)
        : [...prev.tools, slug]
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Completa nombre y slug');
      return;
    }
    setLoading(true);
    try {
      await api.post('/suite/tenants', form);
      toast.success('Espacio creado');
      navigate('/suite');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Nuevo Espacio</h1>
        <p className="text-white/40 mb-8">Crear un espacio white-label para tu cliente</p>

        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-center transition ${
                i === step
                  ? 'bg-[#E5C158]/15 text-[#E5C158] border border-[#E5C158]/30'
                  : i < step
                    ? 'bg-[#E5C158]/5 text-white/50 border border-white/[0.06] cursor-pointer'
                    : 'bg-white/[0.02] text-white/30 border border-white/[0.04]'
              }`}
            >
              {i < step ? '✓' : i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nombre del negocio</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none text-lg"
                  placeholder="Clinica Dental Sonrisa"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">URL (direccion web)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { update('slug', e.target.value); setSlugAvailable(null); }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                    placeholder="clinica-dental-sonrisa"
                  />
                  <button
                    onClick={checkSlug}
                    disabled={checkingSlug || !form.slug}
                    className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-sm hover:bg-white/[0.08] disabled:opacity-30 whitespace-nowrap"
                  >
                    {checkingSlug ? '...' : 'Verificar'}
                  </button>
                </div>
                {slugAvailable === true && <p className="text-emerald-400 text-xs mt-1">Disponible</p>}
                {slugAvailable === false && <p className="text-red-400 text-xs mt-1">No disponible, elegi otro</p>}
                <p className="text-white/20 text-xs mt-2">
                  {form.subdomain || 'clinica-dental.suite.globalservicex.com'}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 flex-1">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={e => update('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <div>
                    <div className="text-white text-sm">Color de fondo</div>
                    <code className="text-white/30 text-xs">{form.primary_color}</code>
                  </div>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 flex-1">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={e => update('secondary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <div>
                    <div className="text-white text-sm">Color de acentos</div>
                    <code className="text-white/30 text-xs">{form.secondary_color}</code>
                  </div>
                </label>
              </div>
              <div className="p-6 rounded-xl mt-4" style={{ backgroundColor: form.primary_color }}>
                <div className="text-lg font-bold" style={{ color: form.secondary_color }}>{form.name || 'Tu negocio'}</div>
                <div className="text-sm mt-1 opacity-60" style={{ color: form.secondary_color }}>Asi se vera tu pagina</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-white/50 text-sm mb-4">Que herramientas necesita tu cliente?</p>
              {[
                { slug: 'booking', label: 'Sistema de Citas', desc: 'Agenda online para pacientes', icon: '📅', essential: true },
                { slug: 'crm', label: 'Clientes (CRM)', desc: 'Base de datos de contactos', icon: '👥', essential: true },
                { slug: 'invoices', label: 'Facturacion', desc: 'Crea y envia facturas', icon: '💰' },
              ].map(t => (
                <div
                  key={t.slug}
                  onClick={() => !t.essential && toggleTool(t.slug)}
                  className={`p-4 rounded-xl border transition ${
                    form.tools.includes(t.slug)
                      ? 'border-[#E5C158]/40 bg-[#E5C158]/5 cursor-pointer'
                      : 'border-white/[0.04] bg-white/[0.02] ' + (t.essential ? 'opacity-60' : 'cursor-pointer hover:border-white/[0.08]')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center gap-2">
                        {t.label}
                        {t.essential && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5C158]/20 text-[#E5C158]">incluido</span>}
                      </div>
                      <div className="text-white/40 text-sm">{t.desc}</div>
                    </div>
                    {!t.essential && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        form.tools.includes(t.slug) ? 'border-[#E5C158] bg-[#E5C158]' : 'border-white/[0.15]'
                      }`}>
                        {form.tools.includes(t.slug) && <span className="text-black text-xs">✓</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/suite')}
            className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 hover:bg-white/[0.08] transition"
          >
            {step === 0 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && (!form.name || !form.slug)}
              className="px-6 py-3 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-30 transition"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-30 transition"
            >
              {loading ? 'Creando...' : 'Crear espacio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
