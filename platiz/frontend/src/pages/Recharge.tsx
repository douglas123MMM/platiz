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

interface RechargeResponse {
  success: boolean;
  transaction_id: string;
  amount: number;
  prepay_id?: string;
  qrcode_url?: string;
  checkout_url?: string;
  manual?: boolean;
  message: string;
}

const QUICK_AMOUNTS = [5, 10, 20, 50];

export default function Recharge() {
  const { user } = useAuth();
  const [binanceInfo, setBinanceInfo] = useState<BinanceInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentRecharges, setRecentRecharges] = useState<RechargeRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [rechargeResult, setRechargeResult] = useState<RechargeResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const [prepayId, setPrepayId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [pollingMessage, setPollingMessage] = useState('');

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

  useEffect(() => {
    if (!polling || !prepayId) return;
    let attempts = 0;
    const maxAttempts = 60;

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setPolling(false);
        setPollingMessage('Tiempo agotado. El pago no fue detectado.');
        toast.error('Tiempo de espera agotado');
        return;
      }
      try {
        const { data } = await api.get(`/store/recharge/status/${prepayId}`);
        if (data.status === 'completed') {
          setPolling(false);
          setPollingMessage('');
          toast.success(`Saldo acreditado: +$${data.amount}`);
          setTimeout(() => window.location.reload(), 2000);
        } else if (data.status === 'expired') {
          setPolling(false);
          setPollingMessage('Pago expirado. Intenta de nuevo.');
          toast.error('Pago expirado');
        } else {
          setPollingMessage(data.message || 'Esperando pago...');
        }
      } catch {
        // Keep polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [polling, prepayId]);

  const handleRecharge = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      toast.error('Ingresa un monto valido (min $1)');
      return;
    }
    setLoading(true);
    setRechargeResult(null);
    setPolling(false);
    setPollingMessage('');
    setQrCode('');
    setCheckoutUrl('');
    try {
      const { data } = await api.post('/store/recharge', { amount: numAmount });
      setRechargeResult(data);
      if (data.success && data.prepay_id) {
        setPrepayId(data.prepay_id);
        setQrCode(data.qrcode_url);
        setCheckoutUrl(data.checkout_url);
        setPolling(true);
        setPollingMessage('Esperando pago...');
      } else if (data.success && data.manual) {
        setPollingMessage('Recarga registrada. Un admin la aprobara.');
        toast.success(data.message);
        loadHistory();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al crear recarga');
    }
    setLoading(false);
    setAmount('');
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
              Ingresa el monto y genera un codigo QR para pagar con Binance
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
          className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </>
          ) : (
            'Generar Pago Binance'
          )}
        </button>
      </div>

      {(rechargeResult || polling) && (
        <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4 animate-fade-in">
          <h3 className="text-white font-semibold text-lg">
            {rechargeResult?.manual ? 'Pago Manual' : 'Pago con Binance Pay'}
          </h3>

          {rechargeResult?.manual ? (
            <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
              <p className="text-gray-300 text-sm text-center">{rechargeResult.message}</p>
            </div>
          ) : (
            <>
              {(qrCode || rechargeResult?.qrcode_url) && (
                <div className="flex flex-col items-center space-y-3">
                  <p className="text-gray-300 text-sm font-medium">Abre Binance y escanea el QR:</p>
                  <div className={`p-4 bg-white rounded-xl ${polling ? 'animate-pulse' : ''}`}>
                    <img
                      src={qrCode || rechargeResult?.qrcode_url}
                      alt="Binance Pay QR"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {(checkoutUrl || rechargeResult?.checkout_url) && (
                <a
                  href={checkoutUrl || rechargeResult?.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-center bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200"
                >
                  Pagar con Binance
                </a>
              )}

              {polling && (
                <div className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-[#FFD700]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-[#FFD700] text-sm font-medium">{pollingMessage}</span>
                  </div>
                </div>
              )}

              {!polling && pollingMessage && (
                <div className={`p-4 rounded-xl border text-center text-sm ${
                  pollingMessage.includes('expirado') || pollingMessage.includes('agotado')
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {pollingMessage}
                </div>
              )}

              {!polling && !pollingMessage && rechargeResult && (
                <p className="text-gray-500 text-xs text-center">
                  ID: {rechargeResult.transaction_id} | Monto: ${rechargeResult.amount?.toFixed(2)} USDT
                </p>
              )}
            </>
          )}
        </div>
      )}

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
