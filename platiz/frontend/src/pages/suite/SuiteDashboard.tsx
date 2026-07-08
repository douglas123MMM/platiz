import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { SuiteDashboardStats, TenantSuite } from '../../types';

export default function SuiteDashboard() {
  const [stats, setStats] = useState<SuiteDashboardStats | null>(null);
  const [tenants, setTenants] = useState<TenantSuite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/suite/dashboard').then(r => setStats(r.data)),
      api.get('/suite/tenants').then(r => setTenants(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Global Dorado Suite</h1>
            <p className="text-white/50 mt-1">Crea espacios white-label para tus clientes</p>
          </div>
          <Link
            to="/suite/tenants/nuevo"
            className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Nuevo Espacio
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tenants Activos', value: stats?.active_tenants ?? 0, icon: '🏢' },
            { label: 'Total Tenants', value: stats?.total_tenants ?? 0, icon: '📊' },
            { label: 'Clientes', value: stats?.total_clients ?? 0, icon: '👥' },
            { label: 'Citas del Mes', value: stats?.bookings_this_month ?? 0, icon: '📅' }
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Tus Espacios de Trabajo</h2>
          {tenants.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg text-white mb-2">No tenes tenants todavia</h3>
              <p className="text-white/40 mb-4">Crea tu primer espacio white-label y empeza a vender herramientas profesionales</p>
              <Link to="/suite/tenants/nuevo" className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition">
                Crear mi primer espacio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map(t => (
                <Link key={t.id} to={`/suite/tenants/${t.slug}`} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 hover:border-[#E5C158]/30 transition group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-black font-bold text-lg">
                      {t.logo_url ? <img src={t.logo_url} alt="" className="w-full h-full rounded-lg object-cover" /> : t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-[#E5C158] transition">{t.name}</h3>
                      <p className="text-white/30 text-xs">{t.subdomain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${t.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {t.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/20 capitalize">
                      {t.plan_type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Planes de Suite</h2>
          <p className="text-white/40 mb-4">Elegi el plan que mejor se adapte a tu negocio. Todos incluyen 14 dias de prueba gratis.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Basic', price: 19, tenants: 1, tools: 3, clients: 50 },
              { name: 'Pro', price: 49, tenants: 3, tools: 5, clients: 500, popular: true },
              { name: 'Enterprise', price: 99, tenants: 10, tools: 'Todas', clients: 'Ilimitado' }
            ].map(p => (
              <div key={p.name} className={`bg-white/[0.02] border rounded-xl p-5 relative ${p.popular ? 'border-[#E5C158]/40' : 'border-white/[0.04]'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-xs font-semibold rounded-full">
                    Mas Popular
                  </div>
                )}
                <h3 className="text-white font-semibold text-lg">{p.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-white">${p.price}</span>
                  <span className="text-white/40 text-sm">/mes</span>
                </div>
                <ul className="space-y-2 mb-4 text-sm text-white/60">
                  <li>&bull; {p.tenants} tenant{typeof p.tenants === 'number' && p.tenants > 1 ? 's' : ''}</li>
                  <li>&bull; {p.tools} herramientas</li>
                  <li>&bull; {p.clients} clientes</li>
                </ul>
                <button className="w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 text-sm hover:bg-white/[0.08] transition">
                  {p.popular ? 'Empezar prueba gratis' : 'Seleccionar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
