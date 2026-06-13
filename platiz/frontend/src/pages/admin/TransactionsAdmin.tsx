import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { IconRefresh, IconMovies } from '../../icons/PremiumIcons';

interface Transaction {
  id: string;
  user_id: string;
  type: 'purchase' | 'recharge' | 'refund';
  amount: number;
  description: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
    phone?: string;
  };
}

export default function TransactionsAdmin() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = () => {
    setLoading(true);
    api.get('/store/transactions')
      .then((r) => setTransactions(r.data))
      .catch(() => toast.error('Error al cargar transacciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTransactions(); }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const typeStyles: Record<string, string> = {
    purchase: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    recharge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    refund: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const typeLabels: Record<string, string> = {
    purchase: 'Compra',
    recharge: 'Recarga',
    refund: 'Reembolso',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconMovies className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Transacciones</h1>
            <p className="section-subtitle">Historial de transacciones de la tienda</p>
          </div>
        </div>
        <button onClick={loadTransactions} className="btn-secondary flex items-center gap-2">
          <IconRefresh className="w-4 h-4" /> Actualizar
        </button>
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Usuario</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Tipo</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Monto</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Descripción</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Sin transacciones registradas</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">{t.user?.username || 'N/A'}</p>
                    <p className="text-gray-500 text-xs">{t.user?.email || ''}</p>
                    {t.user?.phone && <p className="text-gray-600 text-xs">{t.user.phone}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${typeStyles[t.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {typeLabels[t.type] || t.type}
                    </span>
                  </td>
                  <td className={`p-4 text-sm font-bold ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.amount >= 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{t.description}</td>
                  <td className="p-4 text-gray-400 text-sm">{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
