import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';
import { IconChevronLeft } from '../icons/PremiumIcons';

interface Purchase {
  id: string;
  purchase_id?: string;
  product_title: string;
  amount: number;
  status: string;
  status_display: string;
  expires_at?: string;
  created_at: string;
  delivery_email?: string;
  delivery_password?: string;
  days_left?: number | null;
  expiring_soon?: boolean;
}

export default function Purchases() {
  const { refreshProfile } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [catalogPurchases, setCatalogPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const loadPurchases = () => {
    setLoading(true);
    Promise.all([
      api.get('/store/purchases').then(r => r.data || []).catch(() => []),
      api.get('/affiliate/my-catalog-purchases').then(r => r.data || []).catch(() => []),
    ]).then(([store, catalog]) => {
      setPurchases(store);
      setCatalogPurchases(catalog);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadPurchases(); }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatAmount = (n: number) => `$${Number(n).toFixed(2)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleRenew = async (purchaseId: string) => {
    setRenewingId(purchaseId);
    try {
      const { data } = await api.post('/store/renew', { purchase_id: purchaseId });
      if (data.success) {
        toast.success(`Renovado! Nuevo saldo: $${Number(data.new_balance).toFixed(2)}`);
        await refreshProfile();
        loadPurchases();
      } else {
        toast.error(data.error || 'Error al renovar');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Error al renovar');
    }
    setRenewingId(null);
  };

  const statusStyle = (display: string) => {
    if (display === 'Activo') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (display === 'Vencido') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        <h1 className="section-title text-2xl">Mis Compras</h1>
        <Link to="/store" className="inline-flex items-center gap-1 text-sm text-[#FFD700]/70 hover:text-[#FFD700] transition-colors mt-2">
          <IconChevronLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
      </div>

      {purchases.length === 0 && catalogPurchases.length === 0 ? (
        <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-12 text-center">
          <p className="text-gray-400 text-sm">No has realizado compras aun</p>
          <Link to="/store" className="inline-flex items-center gap-1 mt-3 text-sm text-[#FFD700] hover:underline">Ir a la tienda</Link>
        </div>
      ) : (
        <>
          <ScrollReveal>
          <div className="relative z-10 space-y-3">
            {purchases.map((p) => (
            <div key={p.id} className="glass rounded-2xl border border-[#FFD700]/10 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg">{p.product_title}</h3>
                  {p.purchase_id && <p className="text-[#FFD700] text-xs font-mono mt-0.5">ID: {p.purchase_id}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                    <span>{formatDate(p.created_at)}</span>
                    <span className="text-[#FFD700] font-bold font-mono">{formatAmount(p.amount)}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle(p.status_display)}`}>
                      {p.status_display}
                    </span>
                  </div>
                </div>
              </div>

              {p.expires_at && (
                <div className="text-sm text-gray-400">
                  Vencimiento: <span className="text-white">{formatDate(p.expires_at)}</span>
                  {p.days_left != null && (
                    <span className={p.days_left <= 5 && p.days_left > 0 ? 'text-amber-400 ml-1' : 'text-gray-400 ml-1'}>
                      ({p.days_left > 0 ? `${p.days_left} dias restantes` : 'Vencido'})
                    </span>
                  )}
                </div>
              )}

              {(p.delivery_email || p.delivery_password) && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Credenciales</p>
                  {p.delivery_email && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-300 truncate">Email: {p.delivery_email}</span>
                      <button
                        onClick={() => handleCopy(p.delivery_email!)}
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-[#FFD700] transition-colors flex-shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                  {p.delivery_password && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-300 truncate">Clave: {p.delivery_password}</span>
                      <button
                        onClick={() => handleCopy(p.delivery_password!)}
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-[#FFD700] transition-colors flex-shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(p.status_display === 'Vencido' || (p.days_left != null && p.days_left <= 5 && p.days_left > 0)) && (
                <div className="pt-2 border-t border-white/[0.03]">
                  <button
                    onClick={() => handleRenew(p.id)}
                    disabled={renewingId === p.id}
                    className="w-full py-2.5 rounded-xl bg-[#FFD700] text-black font-bold text-sm hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 disabled:opacity-50 shadow-[0_2px_8px_rgba(255,215,0,0.15)]"
                  >
                    {renewingId === p.id ? 'Renovando...' : 'Renovar'}
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
          </ScrollReveal>

          {catalogPurchases.length > 0 && (
            <div className="relative z-10 mt-6">
              <h2 className="text-white font-bold text-lg mb-3">Compras del Catalogo</h2>
              <div className="space-y-3">
                {catalogPurchases.map((p: any) => (
                  <div key={p.id} className="glass rounded-2xl border border-[#FFD700]/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{p.description?.replace('Catalogo: ', '')}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{formatDate(p.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FFD700] font-bold">${parseFloat(p.amount).toFixed(2)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {p.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
