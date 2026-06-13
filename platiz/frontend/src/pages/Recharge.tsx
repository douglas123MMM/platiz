import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface BinanceInfo {
  binance_id: string;
  binance_email: string;
  binance_qr: string;
}

interface RechargeRecord {
  id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const QUICK_AMOUNTS = [5, 10, 20, 50];

export default function Recharge() {
  const { user } = useAuth();
  const [binanceInfo, setBinanceInfo] = useState<BinanceInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentRecharges, setRecentRecharges] = useState<RechargeRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    api.get('/store/binance-info')
      .then((r) => setBinanceInfo(r.data))
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    setLoadingHistory(true);
    api.get('/store/my-transactions')
      .then((r) => {
        const recharges = (r.data || []).filter((t: RechargeRecord) =>
          t.description?.includes('USDT') || t.description?.includes('Recarga')
        );
        setRecentRecharges(recharges.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleRecharge = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Ingresa un monto valido');
      return;
    }
    setLoading(true);
    try {
      await api.post('/store/recharge', { amount: numAmount });
      toast.success('Recarga enviada para revision. Se acreditara cuando el admin confirme.');
      setAmount('');
      loadHistory();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al registrar recarga');
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Aprobado',
      rejected: 'Rechazado',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const balance = user?.credits ?? 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="text-center relative z-10">
        <h1 className="section-title">Recargar Saldo</h1>
        <p className="section-subtitle">Recarga via Binance Pay (USDT)</p>
        <p className="text-[#FFD700]/50 text-sm mt-1">
          Saldo disponible: <span className="text-[#FFD700] font-bold">${balance.toFixed(2)}</span>
        </p>
      </div>

      {binanceInfo && (
        <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">Informacion de Pago</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-gray-400 text-sm">Binance ID</span>
              <span className="text-white font-mono text-sm">{binanceInfo.binance_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-white text-sm">{binanceInfo.binance_email || 'N/A'}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
            <p className="text-gray-300 text-sm text-center">
              Transfiere el monto en USDT a la cuenta Binance y luego presiona "He Pagado"
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Monto de Recarga</h3>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[#FFD700] font-bold text-lg">$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Ej: 10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-600"
          />
        </div>

        <div className="flex gap-2">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v.toString())}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                amount === v.toString()
                  ? 'bg-[#FFD700] text-black font-bold shadow-[0_2px_12px_rgba(255,215,0,0.25)]'
                  : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:border-[#FFD700]/30 hover:text-[#FFD700]'
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading || !amount}
          className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'He Pagado'}
        </button>
      </div>

      <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Recargas Recientes</h3>

        {loadingHistory ? (
          <p className="text-gray-500 text-sm text-center py-4">Cargando...</p>
        ) : recentRecharges.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Sin recargas registradas</p>
        ) : (
          <div className="space-y-2">
            {recentRecharges.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">${r.amount.toFixed(2)} USDT</p>
                  <p className="text-gray-500 text-xs">{formatDate(r.created_at)}</p>
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
