import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Purchase {
  id: string;
  product_title: string;
  amount: number;
  status: string;
  status_display: string;
  expires_at?: string;
  created_at: string;
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/purchases')
      .then((r) => setPurchases(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatAmount = (n: number) => `$${n.toFixed(2)}`;

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
        </div>
      ) : (
        <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha</th>
                <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Producto</th>
                <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Monto</th>
                <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-[#FFD700]/5 hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 text-sm text-gray-400">{formatDate(p.created_at)}</td>
                  <td className="p-4 text-sm text-white font-medium">{p.product_title}</td>
                  <td className="p-4 text-sm text-[#FFD700] font-mono">{formatAmount(p.amount)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      p.status_display === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status_display === 'Vencido' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {p.status_display}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
