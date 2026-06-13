import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Purchase {
  id: string;
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
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const loadPurchases = () => {
    setLoading(true);
    api.get('/store/purchases')
      .then((r) => setPurchases(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="section-title text-2xl">Mis Compras</h1>
        <Link to="/store" className="inline-flex items-center gap-1 text-sm text-[#FFD700]/70 hover:text-[#FFD700] transition-colors mt-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver a la tienda
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-12 text-center">
          <p className="text-gray-500 text-sm">No has realizado compras aun</p>
          <Link to="/store" className="inline-flex items-center gap-1 mt-3 text-sm text-[#FFD700] hover:underline">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="relative z-10 space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="glass rounded-2xl border border-[#FFD700]/10 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg">{p.product_title}</h3>
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
                    <span className={p.days_left <= 5 && p.days_left > 0 ? 'text-amber-400 ml-1' : 'text-gray-500 ml-1'}>
                      ({p.days_left > 0 ? `${p.days_left} dias restantes` : 'Vencido'})
                    </span>
                  )}
                </div>
              )}

              {(p.delivery_email || p.delivery_password) && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Credenciales</p>
                  {p.delivery_email && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-300 truncate">Email: {p.delivery_email}</span>
                      <button
                        onClick={() => handleCopy(p.delivery_email!)}
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500 hover:text-[#FFD700] transition-colors flex-shrink-0"
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
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500 hover:text-[#FFD700] transition-colors flex-shrink-0"
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
                    className="w-full py-2.5 rounded-xl bg-[#FFD700] text-black font-bold text-sm hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-[0_2px_8px_rgba(255,215,0,0.15)]"
                  >
                    {renewingId === p.id ? 'Renovando...' : 'Renovar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
