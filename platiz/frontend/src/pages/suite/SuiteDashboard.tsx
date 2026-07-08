import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite } from '../../types';

export default function SuiteDashboard() {
  const [tenants, setTenants] = useState<TenantSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/suite/tenants').then(r => setTenants(r.data)).finally(() => setLoading(false));
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
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="text-3xl font-bold text-white mb-2">Global Dorado Suite</h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Crea herramientas profesionales para venderle a otros negocios. 
            Ellos te pagan a vos, vos le pagas a Global Dorado.
          </p>
        </div>

        {tenants.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-10 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-3">Empeza en 3 pasos</h2>
            <div className="text-left max-w-md mx-auto space-y-4 mb-8 text-white/60">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#E5C158]/20 text-[#E5C158] flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <span>Crea un espacio con el nombre del negocio</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#E5C158]/20 text-[#E5C158] flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <span>Agrega servicios, profesionales y clientes</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#E5C158]/20 text-[#E5C158] flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <span>Comparti el link y empeza a recibir citas</span>
              </div>
            </div>
            <Link
              to="/suite/tenants/nuevo"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-bold rounded-xl text-lg hover:opacity-90 transition"
            >
              Crear mi primer espacio
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Tus Espacios</h2>
              <Link
                to="/suite/tenants/nuevo"
                className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition text-sm"
              >
                + Nuevo
              </Link>
            </div>

            <div className="space-y-3">
              {tenants.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/suite/tenants/${t.slug}`)}
                  className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 hover:border-[#E5C158]/30 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-black font-bold text-xl">
                      {t.logo_url ? <img src={t.logo_url} alt="" className="w-full h-full rounded-xl object-cover" /> : t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{t.name}</h3>
                      <p className="text-white/30 text-sm">{t.subdomain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${t.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {t.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-white/20 text-lg">→</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
