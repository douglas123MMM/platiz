import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IconCheck, IconCopy, IconClose, IconRefresh } from '../icons/PremiumIcons';

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
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api.get('/store/binance-info')
      .then((r) => {
        setBinanceId(r.data.binance_id || '');
        setBinanceEmail(r.data.binance_email || '');
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success('Copiado');
      setTimeout(() => setCopied(''), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

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
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="text-center relative">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Recargar Saldo</h1>
        <p className="text-gray-400 text-sm mt-1">Via Binance Pay (USDT)</p>
        <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-[#FFD700]/10 rounded-full border border-[#FFD700]/20">
          <span className="text-[#FFD700] text-sm">Saldo:</span>
          <span className="text-white font-bold text-lg">${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 p-5 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {binanceQr && (
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <img src={binanceQr} alt="QR Binance" className="w-36 h-36 md:w-44 md:h-44 object-contain" />
              </div>
              <span className="text-xs text-gray-400">Escanear con Binance</span>
            </div>
          )}

          <div className="flex-1 space-y-3 min-w-0">
            <h3 className="text-white font-semibold text-lg">Datos de Pago</h3>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Binance Pay ID</p>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm md:text-base truncate flex-1">{binanceId || '355976674'}</span>
                <button
                  onClick={() => copyToClipboard(binanceId || '355976674', 'id')}
                  className="flex-shrink-0 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                  title="Copiar ID"
                >
                  {copied === 'id' ? (
                    <IconCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <IconCopy className="w-4 h-4 text-[#FFD700]" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Email</p>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm md:text-base truncate flex-1">{binanceEmail || 'jcespinoza2011@gmail.com'}</span>
                <button
                  onClick={() => copyToClipboard(binanceEmail || 'jcespinoza2011@gmail.com', 'email')}
                  className="flex-shrink-0 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                  title="Copiar Email"
                >
                  {copied === 'email' ? (
                    <IconCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <IconCopy className="w-4 h-4 text-[#FFD700]" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 md:p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
              <div className="text-gray-300 text-xs md:text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] text-xs font-bold flex-shrink-0">1</span>
                  Transfiere USDT a la cuenta de arriba
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] text-xs font-bold flex-shrink-0">2</span>
                  Ingresa el monto y referencia abajo
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] text-xs font-bold flex-shrink-0">3</span>
                  Sube la captura y presiona "Enviar comprobante"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 p-5 md:p-8 space-y-5" aria-label="Formulario de recarga">
        <h3 className="text-white font-semibold text-lg">Completar Recarga</h3>

        <div>
          <label htmlFor="amount" className="text-gray-400 text-sm block mb-2">Monto (USDT)</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[#FFD700] font-bold text-lg">$</span>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v.toString())}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                amount === v.toString()
                  ? 'bg-[#FFD700] text-black shadow-[0_2px_12px_rgba(255,215,0,0.25)]'
                  : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:border-[#FFD700]/30 hover:text-[#FFD700]'
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="ref" className="text-gray-400 text-sm block mb-2">Referencia del pago</label>
          <input
            id="ref"
            type="text"
            placeholder="N° de transaccion o referencia"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white placeholder-gray-600 outline-none focus:border-[#FFD700]/30 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="proof" className="text-gray-400 text-sm block mb-2">Comprobante de pago (captura)</label>
          {!proofPreview ? (
            <label className="flex items-center justify-center gap-3 p-6 bg-white/[0.02] border-2 border-dashed border-[#FFD700]/10 rounded-2xl cursor-pointer hover:border-[#FFD700]/30 hover:bg-white/[0.04] transition-colors group">
              <svg className="w-8 h-8 text-[#FFD700]/30 group-hover:text-[#FFD700]/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400 group-hover:text-gray-400 transition-colors">Toca para subir captura</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="proof" />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#FFD700]/10 bg-black/20">
                <img src={proofPreview} alt="Comprobante" className="w-full max-h-64 object-contain" />
                <button
                  onClick={() => { setProofImage(''); setProofPreview(''); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-[#FFD700] transition-colors">
                <IconRefresh className="w-4 h-4" />
                Cambiar imagen
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          )}
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
              Procesando...
            </div>
          )}
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading || !amount || !reference}
          className="w-full py-3.5 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFE44D] active:scale-[0.98] transition-colors duration-200 shadow-[0_4px_16px_rgba(255,215,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
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

      <div className="glass rounded-2xl border border-[#FFD700]/10 p-5 md:p-8">
        <h3 className="text-white font-semibold text-lg mb-4">Mis Recargas</h3>
        {loadingHistory ? (
          <p className="text-gray-400 text-sm text-center py-4">Cargando...</p>
        ) : recentRecharges.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-[#FFD700]/5 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#FFD700]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-gray-400 text-sm">Sin recargas registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecharges.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">${Number(r.amount).toFixed(2)}</p>
                    <span className="text-gray-600 text-xs">USDT</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{formatDate(r.created_at)}</p>
                  {r.description && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate max-w-[250px]">{r.description.replace(/Ref: |\| Binance ID: .*$/, '').trim()}</p>
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
