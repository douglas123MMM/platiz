import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { IconRefresh, IconGrid } from '../../icons/PremiumIcons';

interface Purchase {
  id: string;
  purchase_id?: string;
  user_id: string;
  product_id: string;
  product_title: string;
  amount: number;
  status: string;
  created_at: string;
  expires_at: string | null;
  status_display: string;
  user?: { username: string; email: string; phone?: string };
  delivery_email?: string;
  delivery_password?: string;
}

export default function PurchasesAdmin() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reminder, setReminder] = useState<{ show: boolean; purchase: Purchase | null; message: string }>({ show: false, purchase: null, message: '' });

  const loadPurchases = (searchTerm?: string) => {
    setLoading(true);
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    api.get(`/store/admin/purchases${params}`)
      .then((r) => setPurchases(r.data))
      .catch(() => toast.error('Error al cargar compras'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPurchases(); }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'Activo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Vencido': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Permanente': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    return styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado');
  };

  const openReminder = (p: Purchase) => {
    const user = p.user;
    const name = user?.username || 'Cliente';
    const msg = `Hola ${name}, tu servicio *${p.product_title}* ${p.status_display === 'Vencido' ? 'ha vencido' : 'esta por vencer'}. Quieres renovarlo?`;
    setReminder({ show: true, purchase: p, message: msg });
  };

  const sendWhatsApp = () => {
    if (!reminder.purchase?.user?.phone) return;
    const encoded = encodeURIComponent(reminder.message);
    window.open(`https://wa.me/${reminder.purchase.user.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    setReminder({ show: false, purchase: null, message: '' });
  };

  const getAvatarLetter = (name: string) => (name || 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconGrid className="w-8 h-8 text-[#E5C158]" />
          <div>
            <h1 className="section-title text-2xl">Compras</h1>
            <p className="section-subtitle">Historial de compras de la tienda</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Usuario, email o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') loadPurchases(search); }}
            className="px-3 py-1.5 bg-black/30 border border-[#E5C158]/10 rounded-xl text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-[#E5C158]/40"
          />
          <button onClick={() => { setSearch(''); loadPurchases(''); }} className="btn-secondary flex items-center gap-2">
            <IconRefresh className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-[#E5C158]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5C158]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">ID</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Cliente</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Email</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Telefono</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Servicio</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Monto</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Credenciales</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Vencimiento</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={10} className="p-12 text-center text-gray-500">Sin compras registradas</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="border-b border-[#E5C158]/5 hover:bg-[#E5C158]/5 transition-colors">
                  <td className="p-4">
                    <span className="text-xs font-mono text-[#E5C158]/70">{p.purchase_id || '-'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E5C158]/20 flex items-center justify-center text-xs font-bold text-[#E5C158] flex-shrink-0">
                        {getAvatarLetter(p.user?.username || '')}
                      </div>
                      <span className="text-white text-sm font-medium">{p.user?.username || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{p.user?.email || 'N/A'}</td>
                  <td className="p-4 text-gray-400 text-sm">{p.user?.phone || '-'}</td>
                  <td className="p-4 text-white text-sm font-medium">{p.product_title}</td>
                  <td className="p-4 text-[#E5C158] text-sm font-bold">${Number(p.amount).toFixed(2)}</td>
                  <td className="p-4">
                    <div className="space-y-1.5">
                      {p.delivery_email && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300 text-xs truncate max-w-[110px]">{p.delivery_email}</span>
                          <button onClick={() => handleCopy(p.delivery_email!)} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-[#E5C158] transition-colors flex-shrink-0" title="Copiar email">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                          </button>
                        </div>
                      )}
                      {p.delivery_password && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300 text-xs truncate max-w-[110px]">{p.delivery_password}</span>
                          <button onClick={() => handleCopy(p.delivery_password!)} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-[#E5C158] transition-colors flex-shrink-0" title="Copiar clave">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                          </button>
                        </div>
                      )}
                      {!p.delivery_email && !p.delivery_password && <span className="text-gray-600 text-xs">Sin credenciales</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle(p.status_display)}`}>
                      {p.status_display}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {p.expires_at ? formatShortDate(p.expires_at) : 'Permanente'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {p.user?.phone && (
                        <a
                          href={`https://wa.me/${p.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${p.user.username}, tu servicio *${p.product_title}* ${p.status_display === 'Vencido' ? 'ha vencido' : 'esta por vencer'}. Quieres renovarlo?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          title="Contactar"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                        </a>
                      )}
                      <button
                        onClick={() => openReminder(p)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-medium"
                        title="Recordatorio"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reminder.show && reminder.purchase && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setReminder({ show: false, purchase: null, message: '' })} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#0a0a0f] border border-[#E5C158]/15 rounded-2xl shadow-2xl shadow-black/60 p-6" role="dialog" aria-modal="true" aria-label="Enviar Recordatorio">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Enviar Recordatorio</h3>
                <button onClick={() => setReminder({ show: false, purchase: null, message: '' })} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-white font-medium">{reminder.purchase.user?.username || 'N/A'}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Servicio</p>
                  <p className="text-white font-medium">{reminder.purchase.product_title}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Telefono</p>
                  <p className="text-white font-medium">{reminder.purchase.user?.phone || 'Sin telefono'}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle(reminder.purchase.status_display)}`}>
                    {reminder.purchase.status_display}
                  </span>
                </div>
              </div>

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="purchase-reminder-message">Mensaje</label>
              <textarea
                id="purchase-reminder-message"
                value={reminder.message}
                onChange={(e) => setReminder({ ...reminder, message: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-[#E5C158]/40 focus:outline-none transition-colors resize-none"
                rows={4}
              />

              <div className="flex gap-3 mt-5">
                <button onClick={() => setReminder({ show: false, purchase: null, message: '' })}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors duration-200">
                  Cancelar
                </button>
                <button onClick={sendWhatsApp}
                  disabled={!reminder.purchase?.user?.phone}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 shadow-[0_4px_16px_rgba(34,197,94,0.2)] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
