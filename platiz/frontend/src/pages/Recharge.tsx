import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [binanceId, setBinanceId] = useState('');
  const [binanceEmail, setBinanceEmail] = useState('');
  const [binanceQr, setBinanceQr] = useState('');
  const [recentRecharges, setRecentRecharges] = useState<RechargeRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    api.get('/store/binance-info')
      .then((r) => {
        setBinanceId(r.data.binance_id || 'N/A');
        setBinanceEmail(r.data.binance_email || 'N/A');
        setBinanceQr(r.data.binance_qr || '');
      })
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    setLoadingHistory(true);
    api.get('/store/my-transactions')
      .then((r) => {
        const recharges = (r.data || []).filter((t: RechargeRecord) =>
          t.description?.includes('USDT') || t.description?.includes('Ref:') || t.description?.includes('Recarga')
        );
        setRecentRecharges(recharges.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo imagenes'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Maximo 2MB'); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProofImage(base64);
      setProofPreview(base64);
      setUploading(false);
    };
    reader.onerror = () => { toast.error('Error al leer imagen'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleRecharge = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      toast.error('Ingresa un monto valido (min $1)');
      return;
    }
    if (!reference || reference.trim().length < 3) {
      toast.error('Ingresa una referencia del pago (min 3 caracteres)');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/store/recharge', { amount: numAmount, reference: reference.trim(), image: proofImage || undefined });
      toast.success(data.message || 'Comprobante enviado');
      loadHistory();
      setAmount('');
      setReference('');
      setProofImage('');
      setProofPreview('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al enviar comprobante');
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
        <p className="section-subtitle">Recarga manual via Binance Pay (USDT)</p>
        <p className="text-[#FFD700]/50 text-sm mt-1">
          Saldo disponible: <span className="text-[#FFD700] font-bold">${balance.toFixed(2)}</span>
        </p>
      </div>

      <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Datos de Pago</h3>
        {binanceQr && (
          <div className="flex justify-center">
            <img src={binanceQr} alt="QR Binance Pay" className="w-48 h-48 rounded-xl border border-[#FFD700]/10" />
          </div>
        )}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 text-sm">Binance Pay ID</span>
            <span className="text-white font-mono text-sm">{binanceId}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 text-sm">Email</span>
            <span className="text-white text-sm">{binanceEmail}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
          <div className="text-gray-300 text-sm space-y-1 text-center">
            <p>1. Transfiere USDT a la cuenta de arriba</p>
            <p>2. Ingresa el monto y referencia abajo</p>
            <p>3. Presiona "Enviar comprobante"</p>
          </div>
        </div>
      </div>

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

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <input
            type="text"
            placeholder="N° de transaccion o referencia"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white placeholder-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Comprobante de pago (captura de pantalla)</label>
          <label className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-dashed border-[#FFD700]/20 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors">
            <span className="text-2xl">📎</span>
            <span className="text-sm text-gray-400">{proofPreview ? 'Cambiar imagen' : 'Subir captura del pago'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {uploading && <div className="mt-2 text-sm text-gray-400">Subiendo...</div>}
          {proofPreview && (
            <div className="mt-3 relative inline-block">
              <img src={proofPreview} alt="Comprobante" className="w-32 h-32 rounded-xl border border-[#FFD700]/10 object-cover" />
              <button onClick={() => { setProofImage(''); setProofPreview(''); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">×</button>
            </div>
          )}
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading || !amount || !reference}
          className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </>
          ) : (
            'Enviar comprobante'
          )}
        </button>
      </div>

      <div className="relative z-10 glass rounded-2xl border border-[#FFD700]/10 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">Mis Recargas</h3>

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
                  {r.description && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate max-w-[200px]">{r.description}</p>
                  )}
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
