import { useState, useEffect } from 'react';
import api from '../services/api';

const IconCopy = () => <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'currentColor'}}><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'currentColor'}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;

interface Referral {
  id: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  referred_user: {
    id: string;
    username: string;
    email: string;
    phone: string;
    created_at: string;
  } | null;
}

interface Stats { total: number; pendientes: number; activos: number; }
interface Links { landing: string; catalog: string; }

export default function AffiliateDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, activos: 0 });
  const [links, setLinks] = useState<Links>({ landing: '', catalog: '' });
  const [credits, setCredits] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({
    binance_id: '',
    binance_email: '',
    pago_movil_bank: '',
    pago_movil_phone: '',
    pago_movil_id: '',
    zelle: '',
    otro: '',
  });
  const [copied, setCopied] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/affiliate/dashboard');
      setReferrals(data.referrals);
      setStats(data.stats);
      setLinks(data.links);
      setCredits(data.profile?.credits || 0);
      setDisplayName(data.profile?.display_name || '');
      setWhatsapp(data.profile?.whatsapp || '');
      setTelegram(data.profile?.telegram_link || '');
      if (data.profile?.payment_methods) {
        const pm = typeof data.profile.payment_methods === 'string' ? JSON.parse(data.profile.payment_methods) : data.profile.payment_methods;
        setPaymentMethods({
          binance_id: pm.binance_id || '',
          binance_email: pm.binance_email || '',
          pago_movil_bank: pm.pago_movil_bank || '',
          pago_movil_phone: pm.pago_movil_phone || '',
          pago_movil_id: pm.pago_movil_id || '',
          zelle: pm.zelle || '',
          otro: pm.otro || '',
        });
      }
    } catch {}
  };

  const copyLink = (path: string) => {
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const approveReferral = async (referralId: string) => {
    if (credits <= 0) return;
    setApproving(referralId);
    try {
      const { data } = await api.post(`/affiliate/referrals/${referralId}/approve`);
      setCredits(data.credits_remaining);
      setMsg('Afiliado activado exitosamente');
      setTimeout(() => setMsg(''), 3000);
      fetchDashboard();
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Error al aprobar');
    } finally {
      setApproving(null);
    }
  };

  const saveProfile = async () => {
    try {
      await api.put('/affiliate/profile', { display_name: displayName, whatsapp, telegram_link: telegram, payment_methods: paymentMethods });
      setMsg('Perfil guardado');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('Error al guardar');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-6">Mi Dashboard de Afiliado</h1>

      {msg && (
        <div className="mb-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl text-[#FFD700] text-sm text-center">
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center">
          <span className="text-2xl">💎</span>
          <p className="text-2xl font-bold text-white">{credits}</p>
          <p className="text-xs text-gray-500">Créditos</p>
        </div>
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center">
          <span className="text-2xl">👤</span>
          <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center">
          <span className="text-2xl">📊</span>
          <p className="text-2xl font-bold text-white">{stats.activos}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
      </div>

      {credits <= 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          Sin creditos. Contacta al administrador para comprar mas licencias.
        </div>
      )}

      {/* Links Section */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <h2 className="text-white font-bold mb-3 text-sm">Mis Enlaces</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Link de Ventas (Landing)</p>
              <p className="text-sm text-[#FFD700] truncate">{window.location.origin}{links.landing}</p>
            </div>
            <button
              onClick={() => copyLink(links.landing)}
              className="ml-3 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] flex-shrink-0"
            >
              {copied === links.landing ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Link de Catalogo</p>
              <p className="text-sm text-[#FFD700] truncate">{window.location.origin}{links.catalog}</p>
            </div>
            <button
              onClick={() => copyLink(links.catalog)}
              className="ml-3 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] flex-shrink-0"
            >
              {copied === links.catalog ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <h2 className="text-white font-bold mb-3 text-sm">Mi Perfil (visible en Catalogo)</h2>
        <div className="space-y-3">
          <input
            className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Nombre de usuario / Marca"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="WhatsApp (ej: 584149132366)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <input
            className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Link de Telegram (ej: https://t.me/tuusuario)"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />

          <h3 className="text-[#FFD700] text-xs font-bold pt-2">Metodos de Pago</h3>

          <p className="text-gray-500 text-xs">Binance</p>
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="ID Binance (ej: 355976674)"
            value={paymentMethods.binance_id}
            onChange={(e) => setPaymentMethods({...paymentMethods, binance_id: e.target.value})} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Correo Binance"
            value={paymentMethods.binance_email}
            onChange={(e) => setPaymentMethods({...paymentMethods, binance_email: e.target.value})} />

          <p className="text-gray-500 text-xs">Pago Movil</p>
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Banco (ej: 0102 - Venezuela)"
            value={paymentMethods.pago_movil_bank}
            onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_bank: e.target.value})} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Telefono (ej: 04243057148)"
            value={paymentMethods.pago_movil_phone}
            onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_phone: e.target.value})} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="CI / ID (ej: 28012172)"
            value={paymentMethods.pago_movil_id}
            onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_id: e.target.value})} />

          <p className="text-gray-500 text-xs">Zelle / Otro</p>
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Zelle (correo o telefono)"
            value={paymentMethods.zelle}
            onChange={(e) => setPaymentMethods({...paymentMethods, zelle: e.target.value})} />
          <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            placeholder="Otro metodo"
            value={paymentMethods.otro}
            onChange={(e) => setPaymentMethods({...paymentMethods, otro: e.target.value})} />
          <button onClick={saveProfile} className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D]">
            Guardar Perfil
          </button>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4">
        <h2 className="text-white font-bold mb-3 text-sm">Mis Referidos ({stats.total})</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aun no tienes referidos. Comparte tu link de ventas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#FFD700]/10">
                  <th className="text-left py-2">Usuario</th>
                  <th className="text-left py-2 hidden md:table-cell">Contacto</th>
                  <th className="text-left py-2 hidden md:table-cell">Fecha</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-right py-2">Accion</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-[#FFD700]/5">
                    <td className="py-2 text-white">{ref.referred_user?.username || 'N/A'}</td>
                    <td className="py-2 text-gray-400 text-xs hidden md:table-cell">
                      {ref.referred_user?.email}<br />
                      {ref.referred_user?.phone}
                    </td>
                    <td className="py-2 text-gray-400 text-xs hidden md:table-cell">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ref.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {ref.status === 'pending' && (
                        <button
                          onClick={() => approveReferral(ref.id)}
                          disabled={credits <= 0 || approving === ref.id}
                          className={`text-xs px-3 py-1 rounded-lg font-bold ${
                            credits <= 0
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-[#FFD700] text-black hover:bg-[#FFE44D]'
                          }`}
                        >
                          {approving === ref.id ? '...' : 'Aprobar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
